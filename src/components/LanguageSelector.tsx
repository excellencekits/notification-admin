'use client';

import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

// project imports
import { useLanguage } from 'contexts/LanguageContext';
import useConfig from 'hooks/useConfig';
import { ThemeDirection } from 'config';
import type { I18n } from 'types/config';

// assets
import TranslationOutlined from '@ant-design/icons/TranslationOutlined';

// ==============================|| LANGUAGE SELECTOR ||============================== //

export default function LanguageSelector() {
  const { selectedLanguage, setSelectedLanguage, supportedLanguages } = useLanguage();
  const { setField } = useConfig();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);

    // Switch to RTL for Arabic, LTR for others
    // Keep UI language always in English to avoid missing translation warnings
    if (langCode === 'ar') {
      setField('themeDirection', ThemeDirection.RTL);
      // Add Arabic class to body for larger font sizes
      document.body.classList.add('lang-ar');
      document.body.classList.remove('lang-en');
    } else {
      setField('themeDirection', ThemeDirection.LTR);
      // Remove Arabic class from body
      document.body.classList.remove('lang-ar');
      document.body.classList.add('lang-en');
    }

    // Keep template UI in English regardless of content language
    setField('i18n', 'en' as I18n);

    handleClose();
  };

  // Add English as default option
  const allLanguages = [{ code: 'en', label: 'English', flag: '🇺🇸' }, ...supportedLanguages];

  const currentLanguage = allLanguages.find((lang) => lang.code === selectedLanguage) || allLanguages[0];

  return (
    <Box>
      <Tooltip title="Select Language">
        <IconButton
          onClick={handleClick}
          size="large"
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          color="secondary"
        >
          <Stack direction="row" spacing={0.5} alignItems="center">
            <span style={{ fontSize: '20px' }}>{currentLanguage.flag}</span>
            <TranslationOutlined style={{ fontSize: '20px' }} />
          </Stack>
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {allLanguages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            selected={selectedLanguage === lang.code}
            sx={{ minWidth: 150 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <span style={{ fontSize: '18px' }}>{lang.flag}</span>
              <Typography variant="body2">{lang.label}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
