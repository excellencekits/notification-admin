'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getCookie } from 'cookies-next';

// project imports
import Loader from 'components/Loader';
import { useAuth } from 'contexts/AuthContext';

import { config } from '../../../lib/config';

// types
import { GuardProps } from 'types/auth';

// ==============================|| AUTH GUARD ||============================== //

export default function AuthGuard({ children }: GuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const pathname = usePathname();

  // 1. Detect Back-Forward Cache (bfcache) restoration or token removal
  useEffect(() => {
    if (config.NEXT_PUBLIC_AUTH_DISABLED) return;
    const enforceAuth = () => {
      const token = (getCookie('accessToken') as string) || (getCookie('access_token') as string);
      if (!token) {
        console.warn('AuthGuard: No token cookie found on pageshow, redirecting to /login');
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
        }
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      // If the page was restored from browser back-forward cache (bfcache)
      if (event.persisted) {
        enforceAuth();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // 2. Route protection check
  useEffect(() => {
    if (config.NEXT_PUBLIC_AUTH_DISABLED) return;
    if (!isLoading) {
      const token = (getCookie('accessToken') as string) || (getCookie('access_token') as string);
      if (!isAuthenticated || !token) {
        console.log('AuthGuard: User not authenticated, redirecting to login');
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectUrl', pathname);
          window.location.replace('/login');
        }
      }
    }
  }, [isAuthenticated, isLoading, pathname]);

  if (config.NEXT_PUBLIC_AUTH_DISABLED) {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return <Loader />;
  }

  // Show nothing if not authenticated
  const currentToken = typeof window !== 'undefined' ? getCookie('accessToken') || getCookie('access_token') : null;
  if (!isAuthenticated || (!currentToken && !user)) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
}
