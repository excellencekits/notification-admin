'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Loader from 'components/Loader';
import { useAuth } from 'contexts/AuthContext';

interface GuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: GuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // not authenticated -> redirect to log in
        sessionStorage.setItem('redirectUrl', pathname);
        router.push('/login');
      } else if (!user || !user.role || !user.role.some((role) => ['admin', 'vendor'].includes(role.toLowerCase()))) {
        console.log('AdminGuard: User is not an admin or vendor, redirecting to 403', user);
        router.push('/403');
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  if (isLoading) return <Loader />;
  if (!isAuthenticated) return null;
  if (!user || !user.role || !user.role.some((role) => ['admin', 'vendor'].includes(role.toLowerCase()))) return null;

  return <>{children}</>;
}
