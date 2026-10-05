import axios from 'axios';
import { getCookie } from 'cookies-next';
import { getSession } from 'next-auth/react';
import { config as appConfig } from '../../../lib/config';

export const notificationClient = axios.create({
  baseURL: appConfig.NEXT_PUBLIC_NOTIFICATION_API_SERVER,
  headers: {
    'Content-Type': 'application/json'
  }
});

notificationClient.interceptors.request.use(async (config) => {
  if (appConfig.NEXT_PUBLIC_NOTIFICATION_API_SERVER) {
    config.baseURL = appConfig.NEXT_PUBLIC_NOTIFICATION_API_SERVER;
  }
  let token = (getCookie('accessToken') as string) || (getCookie('access_token') as string);
  if (!token && typeof window !== 'undefined') {
    try {
      const session: any = await getSession();
      if (session?.accessToken) {
        token = session.accessToken;
      }
    } catch {
      // ignore
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

