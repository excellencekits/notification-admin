'use client';

import { useState, useMemo } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';

// project imports
import { getSupportedLanguages } from 'utils/languageConfig';

// assets
import DownOutlined from '@ant-design/icons/DownOutlined';

// ==============================|| TRANSLATION INPUT COMPONENT ||============================== //

export type TranslationsMap = Record<string, string | undefined>;

interface TranslationInputProps {
  value: TranslationsMap;
  onChange: (translations: TranslationsMap) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function TranslationInput({
  value = {},
  onChange,
  label = 'Translations',
  placeholder,
  disabled = false
}: TranslationInputProps) {
  const [expanded, setExpanded] = useState(false);

  // Get supported languages from configuration
  const supportedLanguages = useMemo(() => getSupportedLanguages(), []);

  const handleTranslationChange = (langCode: string, text: string) => {
    onChange({
      ...value,
      [langCode]: text
    });
  };

  const getFilledCount = () => {
    return Object.values(value).filter((v) => v && v.trim()).length;
  };

  return (
    <Box>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} disabled={disabled}>
        <AccordionSummary expandIcon={<DownOutlined />}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1">{label}</Typography>
            {getFilledCount() > 0 && (
              <Chip label={`${getFilledCount()}/${supportedLanguages.length}`} size="small" color="primary" variant="light" />
            )}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {supportedLanguages.map((lang) => (
              <TextField
                key={lang.code}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </Stack>
                }
                value={value[lang.code] || ''}
                onChange={(e) => handleTranslationChange(lang.code, e.target.value)}
                placeholder={placeholder}
                fullWidth
                disabled={disabled}
                size="small"
              />
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
