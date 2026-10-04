'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut as nextAuthSignOut, useSession } from 'next-auth/react';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { config } from '../../lib/config';

// types
import { UserProfile } from 'types/auth';

// config
import { APP_DEFAULT_PATH } from 'config';

// api
import { getUserProfile } from 'api/auth';

// ==============================|| AUTH CONTEXT TYPES ||============================== //

interface DecodedToken {
  sub: string;
  id?: string;
  email?: string;
  username?: string;
  user_name?: string;
  name?: string;
  role?: string;
  roles?: string | string[]; // Can be string or array
  authorities?: string[];
  exp: number;
  aud?: string;
  iss?: string;
  nbf?: number;
  iat?: number;
  [key: string]: any; // Allow additional fields
}

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, redirectTo?: string) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<UserProfile>) => void;
  hasRole: (role: string) => boolean;
  roles: string[];
}

// ==============================|| AUTH CONTEXT ||============================== //

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ==============================|| AUTH PROVIDER ||============================== //

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);

  // Check if user is authenticated via token
  const isAuthenticated = useMemo(() => !!user || !!session, [user, session]);

  // Initialize auth state from NextAuth session or cookies
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Priority 1: Check NextAuth session (for OAuth2 login via NextAuth)
        console.log('Initializing auth from NextAuth session:', session);
        if (session?.user) {
          if ((session as any).accessToken && !getCookie('accessToken')) {
            setCookie('accessToken', (session as any).accessToken, {
              maxAge: 60 * 60 * 24 * 7,
              path: '/',
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            });
          }
          if ((session as any).refreshToken && !getCookie('refreshToken')) {
            setCookie('refreshToken', (session as any).refreshToken, {
              maxAge: 60 * 60 * 24 * 30,
              path: '/',
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            });
          }
          setUser({
            id: session.user.id || '1',
            email: session.user.email || undefined,
            name: session.user.name || undefined,
            image: session.user.image || undefined,
            role: session.user.role || []
          });
          if (session.user.role) {
            setRoles(Array.isArray(session.user.role) ? session.user.role : [session.user.role]);
          }
        } else {
          // Priority 2: Check cookies (for direct OAuth2 login bypass NextAuth)
          // Normalize legacy cookie names if present
          const legacyToken = getCookie('access_token') as string | undefined;
          if (legacyToken && !getCookie('accessToken')) {
            setCookie('accessToken', legacyToken, {
              maxAge: 60 * 60 * 24 * 7,
              path: '/',
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            });
            deleteCookie('access_token');
            console.log('Migrated legacy access_token -> accessToken');
          }
          const legacyRefresh = getCookie('refresh_token') as string | undefined;
          if (legacyRefresh && !getCookie('refreshToken')) {
            setCookie('refreshToken', legacyRefresh, {
              maxAge: 60 * 60 * 24 * 30,
              path: '/',
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            });
            deleteCookie('refresh_token');
            console.log('Migrated legacy refresh_token -> refreshToken');
          }

          const accessToken = getCookie('accessToken') as string | undefined;
          console.log('Initializing auth from cookies:', accessToken);
          if (accessToken) {
            const decoded = jwtDecode<DecodedToken>(accessToken);

            // Check if token is expired
            const currentTime = Date.now() / 1000;
            if (decoded.exp > currentTime) {
              // Extract user ID - prefer 'id' field over 'sub'
              const userId = decoded.id || decoded.sub;

              // Extract email from various possible fields
              const email = decoded.email || decoded.username || decoded.user_name;

              // Extract role - handle both string and array formats
              const accessRoles: string[] = decoded.roles
                ? Array.isArray(decoded.roles)
                  ? decoded.roles.map((role) => role.toUpperCase())
                  : [decoded.roles.toUpperCase()]
                : [];
              setRoles(accessRoles);

              // Set initial user state with available data
              setUser({
                id: String(userId),
                email: email,
                name: decoded.name || decoded.user_name || decoded.username || email,
                role: accessRoles
              });

              // Then fetch full user profile from backend if available
              getUserProfile()
                .then((profile) => {
                  if (profile) {
                    console.log('Fetched user profile during init:', profile);
                    setUser({
                      id: String(profile.id),
                      email: profile.email,
                      name: profile.userName,
                      role: accessRoles
                    });
                  }
                })
                .catch((error) => {
                  console.error('Failed to fetch user profile during init:', error);
                });
            } else {
              // Token expired, clear cookies
              deleteCookie('accessToken');
              deleteCookie('refreshToken');
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        console.log('Auth state initialized:', { roles, isAuthenticated, isLoading });
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [session]);
  const hasRole = (role: string) => {
    return roles?.some((useRole) => useRole?.toUpperCase() === role.toUpperCase());
  };
  // Login function
  const login = useCallback(
    async (accessToken: string, refreshToken: string, redirectTo?: string) => {
      try {
        console.log('Starting login process...');

        // Decode token first to validate it
        const decoded = jwtDecode<DecodedToken>(accessToken);
        console.log('Full decoded token:', decoded);

        // Extract user ID - prefer 'id' field over 'sub'
        const userId = decoded.id || decoded.sub;

        // Extract email from various possible fields (or use sub as fallback)
        const email = decoded.email || decoded.username || decoded.user_name;

        // Extract role - handle both string and array formats
        const accessRoles: string[] = decoded.roles
          ? Array.isArray(decoded.roles)
            ? decoded.roles?.map((role) => role.toUpperCase())
            : [decoded.roles.toUpperCase()]
          : [];
        console.log('Extracted roles:', accessRoles);
        setRoles(accessRoles);

        // Fetch full user profile from backend
        try {
          const profile = await getUserProfile();
          if (profile) {
            console.log('Fetched user profile:', profile);
            setUser({
              id: String(profile.id),
              email: profile.email,
              name: profile.userName,
              role: accessRoles
            });
          } else {
            setUser({
              id: String(userId),
              email: email,
              name: decoded.name || decoded.user_name || decoded.username || email,
              role: accessRoles
            });
          }
        } catch (error) {
          console.error('Failed to fetch user profile, using token data:', error);
          setUser({
            id: String(userId),
            email: email,
            name: decoded.name,
            role: accessRoles
          });
        }

        console.log('Extracted user info:', {
          id: userId,
          email: email || 'No email in token',
          name: decoded.name || 'No name in token',
          role: accessRoles
        });

        // Store tokens in cookies
        setCookie('accessToken', accessToken, {
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        setCookie('refreshToken', refreshToken, {
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        setCookie('accessRoles', accessRoles);

        console.log('Tokens stored in cookies');

        // Set user state
        const userState = {
          id: userId,
          email: email,
          name: decoded.name,
          role: accessRoles
        };

        setUser(userState);

        // Resolve redirect target (prefer explicit param, then localStorage, then default)
        let target: string | undefined = redirectTo;
        try {
          if (!target && typeof window !== 'undefined') {
            const saved = window.localStorage.getItem('redirectUrl') || undefined;
            if (saved) target = saved;
          }
        } catch {
          // ignore localStorage errors
        }

        // sanitize: allow only same-origin paths
        if (target && !/^\//.test(target)) {
          console.warn('Ignoring unsafe redirect target:', target);
          target = undefined;
        }
        if (!target) target = APP_DEFAULT_PATH;

        console.log('User state set:', userState);
        console.log('Redirecting to:', target);

        // Use a small timeout to ensure state updates complete
        setTimeout(() => {
          try {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem('redirectUrl');
            }
          } catch {}
          router.push(target!);
        }, 100);
      } catch (error) {
        console.error('Login failed:', error);
        // Clear any partial state
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        deleteCookie('accessRoles');
        setUser(null);
        throw error;
      }
    },
    [router]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      const accessToken = (getCookie('accessToken') as string) || (getCookie('access_token') as string);
      const refreshToken = (getCookie('refreshToken') as string) || (getCookie('refresh_token') as string);

      // 1. Revoke tokens on the OAuth2 authorization server if available
      if (accessToken || refreshToken) {
        const revokePromises: Promise<any>[] = [];
        const authHeader = `Basic ${btoa(`${config.NEXT_PUBLIC_OAUTH2_CLIENT_ID}:${config.NEXT_PUBLIC_OAUTH2_CLIENT_SECRET}`)}`;

        if (accessToken) {
          revokePromises.push(
            axios
              .post(
                `${config.NEXT_PUBLIC_OAUTH2_SERVER}/oauth2/revoke`,
                new URLSearchParams({
                  token: accessToken,
                  token_type_hint: 'access_token',
                  client_id: config.NEXT_PUBLIC_OAUTH2_CLIENT_ID || '',
                  client_secret: config.NEXT_PUBLIC_OAUTH2_CLIENT_SECRET || ''
                }),
                {
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: authHeader
                  }
                }
              )
              .catch((err: any) => console.warn('[Auth] Access token revocation failed:', err?.message))
          );
        }

        if (refreshToken) {
          revokePromises.push(
            axios
              .post(
                `${config.NEXT_PUBLIC_OAUTH2_SERVER}/oauth2/revoke`,
                new URLSearchParams({
                  token: refreshToken,
                  token_type_hint: 'refresh_token',
                  client_id: config.NEXT_PUBLIC_OAUTH2_CLIENT_ID || '',
                  client_secret: config.NEXT_PUBLIC_OAUTH2_CLIENT_SECRET || ''
                }),
                {
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: authHeader
                  }
                }
              )
              .catch((err: any) => console.warn('[Auth] Refresh token revocation failed:', err?.message))
          );
        }

        await Promise.allSettled(revokePromises);
      }

      // 2. Clear all authentication cookies across root path
      const cookieOptions = { path: '/' };
      deleteCookie('accessToken', cookieOptions);
      deleteCookie('access_token', cookieOptions);
      deleteCookie('refreshToken', cookieOptions);
      deleteCookie('refresh_token', cookieOptions);
      deleteCookie('accessRoles', cookieOptions);
      deleteCookie('roles', cookieOptions);

      // Clean up NextAuth cookies
      deleteCookie('next-auth.session-token', cookieOptions);
      deleteCookie('__Secure-next-auth.session-token', cookieOptions);
      deleteCookie('next-auth.csrf-token', cookieOptions);
      deleteCookie('__Host-next-auth.csrf-token', cookieOptions);
      deleteCookie('next-auth.callback-url', cookieOptions);
      deleteCookie('__Secure-next-auth.callback-url', cookieOptions);

      // 3. Clear local & session storage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('user');
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('accessToken');
        window.localStorage.removeItem('refreshToken');
        window.localStorage.removeItem('redirectUrl');
        window.sessionStorage.clear();
      }

      // 4. Clear React state
      setUser(null);
      setRoles([]);

      // 5. Sign out from NextAuth
      try {
        await nextAuthSignOut({ redirect: false });
      } catch (signOutErr) {
        console.warn('[Auth] NextAuth signOut error:', signOutErr);
      }

      // 6. Hard redirect to /login to flush in-memory state and replace history
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      }
    }
  }, [router]);

  // Update user profile
  const updateUser = useCallback((userData: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  }, []);

  const memoizedValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      hasRole,
      updateUser,
      roles
    }),
    [user, isAuthenticated, isLoading, login, logout, hasRole, updateUser, roles]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

// ==============================|| AUTH HOOK ||============================== //

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
