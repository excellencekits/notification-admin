import axios, { AxiosRequestConfig, AxiosError } from 'axios';

// next
import { getSession } from 'next-auth/react';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import tokenManager from './tokenManager';
import { config as appConfig } from '../../lib/config';

const axiosServices = axios.create({ baseURL: appConfig.NEXT_PUBLIC_API_SERVER || 'https://issuetrackerapi.excellencekits.com' });

// Attach generic auth error interceptor

// ==============================|| AXIOS - TOKEN REFRESH ||============================== //

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const refreshToken = async (): Promise<string | null> => {
  const res = await tokenManager.refreshTokens();
  return res?.accessToken ?? null;
};

// ==============================|| AXIOS - REQUEST INTERCEPTOR ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    if (appConfig.NEXT_PUBLIC_API_SERVER) {
      config.baseURL = appConfig.NEXT_PUBLIC_API_SERVER;
    }

    // Skip auth for explicitly public requests
    if ((config.headers as any)?.noAuth !== undefined) {
      return config;
    }

    // Preemptive refresh if access token is expired or about to expire
    try {
      if (tokenManager.isAccessExpired(20)) {
        await tokenManager.refreshTokens();
      }
    } catch {}

    // Prefer token from cookies (set during OAuth2 login) to ensure consistency
    const cookieToken = getCookie('accessToken') as string | undefined;

    if (!cookieToken) {
      // Migrate legacy cookie name if present
      const legacy = getCookie('access_token') as string | undefined;
      if (legacy) {
        setCookie('accessToken', legacy, {
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        deleteCookie('access_token');
      }
    }

    const tokenToUse = (getCookie('accessToken') as string | undefined) || undefined;

    if (tokenToUse) {
      config.headers['Authorization'] = `Bearer ${tokenToUse}`;
      const fp = `${tokenToUse.slice(0, 10)}...${tokenToUse.slice(-6)}`;
      console.log('[Axios utils] Using Authorization from cookie accessToken:', fp);
    } else {
      // Fallback: try NextAuth session token (for OAuth2 via NextAuth)
      const session = await getSession();
      if (session?.accessToken) {
        config.headers['Authorization'] = `Bearer ${session.accessToken}`;
        const s = session.accessToken as string;
        const fp = `${s.slice(0, 10)}...${s.slice(-6)}`;
        console.log('[Axios utils] Using Authorization from NextAuth session:', fp);
      } else {
        console.warn('[Axios utils] No access token found in cookies or session');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==============================|| AXIOS - RESPONSE INTERCEPTOR ||============================== //

axiosServices.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosServices(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();

        if (newToken) {
          // Process queued requests with new token
          processQueue(null, newToken);

          // Retry original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosServices(originalRequest);
        } else {
          // Refresh failed, redirect to login
          processQueue(new Error('Token refresh failed'), null);
          if (!window.location.href.includes('/login')) {
            window.location.pathname = '/login';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (!window.location.href.includes('/login')) {
          window.location.pathname = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors or if retry failed
    if (error.response?.status === 401 && !window.location.href.includes('/login')) {
      window.location.pathname = '/login';
    }

    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
};

export const fetcherPost = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosServices.post(url, { ...config });

  return res.data;
};
