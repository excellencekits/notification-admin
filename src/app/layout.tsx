import type { Metadata } from 'next';

import './globals.css';

// project imports
import ProviderWrapper from './ProviderWrapper';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Issue Tracker',
  description: 'Issue Tracker - ExcellenceKits'
};

export default function RootLayout({ children }: { children: React.ReactElement }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="/config.js" strategy="beforeInteractive" />
      </head>
      <body>
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}
