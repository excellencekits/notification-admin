'use client';

import { ReactElement } from 'react';

// next
import { SessionProvider } from 'next-auth/react';

// material-ui
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

// project imports
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
import ScrollTop from 'components/ScrollTop';
import RTLLayout from 'components/RTLLayout';
import Snackbar from 'components/@extended/Snackbar';
import Nonstick from 'components/third-party/Notistack';

import { DEFAULT_THEME_MODE } from 'config';
import { ConfigProvider } from 'contexts/ConfigContext';
import { AuthProvider } from 'contexts/AuthContext';
import { NotificationProvider } from 'contexts/NotificationContext';
import { LanguageProvider } from 'contexts/LanguageContext';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function ProviderWrapper({ children }: { children: ReactElement }) {
  return (
    <>
      <InitColorSchemeScript modeStorageKey="theme-mode" attribute="data-color-scheme" defaultMode={DEFAULT_THEME_MODE} />
      <ConfigProvider>
        <ThemeCustomization>
          <RTLLayout>
            <Locales>
              <ScrollTop>
                <SessionProvider refetchInterval={0}>
                  <AuthProvider>
                      <LanguageProvider>
                        <Nonstick>
                          <Snackbar />
                          <NotificationProvider>{children}</NotificationProvider>
                        </Nonstick>
                      </LanguageProvider>
                  </AuthProvider>
                </SessionProvider>
              </ScrollTop>
            </Locales>
          </RTLLayout>
        </ThemeCustomization>
      </ConfigProvider>
    </>
  );
}
