import { useEffect, ReactNode } from 'react';

// material-ui
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

// third-party
import rtlPlugin from 'stylis-plugin-rtl';

// project imports
import { ThemeDirection } from 'config';
import useConfig from 'hooks/useConfig';
import { getCookie } from 'cookies-next';

// ==============================|| RTL LAYOUT ||============================== //

interface Props {
  children: ReactNode;
}

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin]
});

const ltrCache = createCache({
  key: 'mui'
});

export default function RTLLayout({ children }: Props) {
  const { state } = useConfig();

  useEffect(() => {
    document.dir = state.themeDirection;

    // Apply language-specific CSS class based on selected language
    const selectedLanguage = getCookie('selected_language') || 'en';
    if (selectedLanguage === 'ar') {
      document.body.classList.add('lang-ar');
      document.body.classList.remove('lang-en');
    } else {
      document.body.classList.remove('lang-ar');
      document.body.classList.add('lang-en');
    }

    // Inject CSS for Arabic font size increase
    if (!document.getElementById('arabic-font-styles')) {
      const style = document.createElement('style');
      style.id = 'arabic-font-styles';
      style.innerHTML = `
        body.lang-ar .MuiTypography-h1 { font-size: 3.3rem !important; }
        body.lang-ar .MuiTypography-h2 { font-size: 2.75rem !important; }
        body.lang-ar .MuiTypography-h3 { font-size: 2.2rem !important; }
        body.lang-ar .MuiTypography-h4 { font-size: 1.87rem !important; }
        body.lang-ar .MuiTypography-h5 { font-size: 1.43rem !important; }
        body.lang-ar .MuiTypography-h6 { font-size: 1.21rem !important; }
        body.lang-ar .MuiTypography-body1 { font-size: 1.1rem !important; }
        body.lang-ar .MuiTypography-body2 { font-size: 0.96rem !important; }
        body.lang-ar .MuiTypography-subtitle1 { font-size: 1.1rem !important; }
        body.lang-ar .MuiTypography-subtitle2 { font-size: 0.96rem !important; }
        body.lang-ar .MuiTypography-caption { font-size: 0.83rem !important; }
        body.lang-ar .MuiButton-root { font-size: 0.96rem !important; }
        body.lang-ar .MuiInputBase-input { font-size: 1.1rem !important; }
        body.lang-ar .MuiInputLabel-root { font-size: 1.1rem !important; }
        body.lang-ar .MuiTableCell-root { font-size: 0.96rem !important; }
        body.lang-ar .MuiMenuItem-root { font-size: 1.05rem !important; }
        body.lang-ar .MuiListItemText-primary { font-size: 1.1rem !important; }
        body.lang-ar .MuiListItemText-secondary { font-size: 0.96rem !important; }
        body.lang-ar .MuiChip-label { font-size: 0.91rem !important; }
        body.lang-ar .MuiTab-root { font-size: 0.96rem !important; }
        body.lang-ar .MuiAlert-message { font-size: 1.05rem !important; }
        body.lang-ar .MuiCardHeader-title { font-size: 1.32rem !important; }
        body.lang-ar .MuiCardHeader-subheader { font-size: 0.96rem !important; }
      `;
      document.head.appendChild(style);
    }
  }, [state.themeDirection]);

  return <CacheProvider value={state.themeDirection === ThemeDirection.RTL ? rtlCache : ltrCache}>{children}</CacheProvider>;
}
