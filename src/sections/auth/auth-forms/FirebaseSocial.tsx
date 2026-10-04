'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

// material-ui
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

// assets
const Google = '/assets/images/icons/google.svg';
const Apple = '/assets/images/icons/apple.svg';

interface FirebaseSocialProps {
  callbackUrl?: string;
}

export default function FirebaseSocial({ callbackUrl = '/dashboard' }: FirebaseSocialProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [isApplePlatform, setIsApplePlatform] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent || '';
    const platform = (window.navigator as any).userAgentData?.platform || window.navigator.platform || '';
    const isMac = /Mac/i.test(platform) || /Macintosh|MacIntel/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua) || (platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsApplePlatform(isMac || isIOS);
  }, []);

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      setLoadingProvider(provider);
      await signIn(provider, { callbackUrl });
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setLoadingProvider(null);
    }
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: isApplePlatform ? 'row' : 'column' }}
      spacing={2}
      sx={{
        width: '100%',
        '& .MuiButton-startIcon': { mr: 1 }
      }}
    >
      <Button
        variant="outlined"
        color="secondary"
        fullWidth
        size="large"
        startIcon={
          loadingProvider === 'google' ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <Image src={Google} alt="Google" width={18} height={18} style={{ width: 18, height: 18 }} />
          )
        }
        onClick={() => handleSocialLogin('google')}
        disabled={loadingProvider !== null}
        sx={{
          py: 1.2,
          borderColor: 'divider',
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': {
            borderColor: 'grey.500',
            bgcolor: 'action.hover'
          }
        }}
      >
        Continue with Google
      </Button>

      {/* Apple Login - conditionally shown only on macOS, iOS, and iPadOS */}
      {isApplePlatform && (
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          size="large"
          startIcon={
            loadingProvider === 'apple' ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Image src={Apple} alt="Apple" width={18} height={18} style={{ width: 18, height: 18 }} />
            )
          }
          onClick={() => handleSocialLogin('apple')}
          disabled={loadingProvider !== null}
          sx={{
            py: 1.2,
            borderColor: 'divider',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              borderColor: 'grey.500',
              bgcolor: 'action.hover'
            }
          }}
        >
          Continue with Apple
        </Button>
      )}
    </Stack>
  );
}
