'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'contexts/AuthContext';

// types
import { GuardProps } from 'types/auth';

// config
import { APP_DEFAULT_PATH } from 'config';

// ==============================|| GUEST GUARD ||============================== //

/**
 * Guest guard for routes that should only be accessible to non-authenticated users
 * Redirects to dashboard if user is already authenticated (e.g., login page)
 */
export default function GuestGuard({ children }: GuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Check if there's a stored redirect URL
      const redirectUrl = sessionStorage.getItem('redirectUrl');

      if (redirectUrl) {
        sessionStorage.removeItem('redirectUrl');
        router.push(redirectUrl);
      } else {
        router.push(APP_DEFAULT_PATH);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
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

  // Show nothing if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  // Render children if not authenticated
  return <>{children}</>;
}
