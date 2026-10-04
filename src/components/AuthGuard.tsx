'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { useAuth } from 'contexts/AuthContext';

// types
import { GuardProps } from 'types/auth';

// ==============================|| AUTH GUARD ||============================== //

export default function AuthGuard({ children }: GuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const enforceAuth = () => {
      const token = (getCookie('accessToken') as string) || (getCookie('access_token') as string);
      if (!token) {
        if (typeof window !== 'undefined') {
          window.location.replace('/login');
        }
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        enforceAuth();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const token = (getCookie('accessToken') as string) || (getCookie('access_token') as string);
      if (!isAuthenticated || !token) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectUrl', pathname);
          window.location.replace('/login');
        }
      }
    }
  }, [isAuthenticated, isLoading, pathname]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        Loading...
      </div>
    );
  }

  const currentToken = typeof window !== 'undefined' ? getCookie('accessToken') || getCookie('access_token') : null;
  if (!isAuthenticated || (!currentToken && !user)) {
    return null;
  }

  return <>{children}</>;
}
