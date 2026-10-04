'use client';

import React, { FocusEvent, SyntheticEvent, useState } from 'react';

// next
import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import FirebaseSocial from './FirebaseSocial';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';

import { APP_DEFAULT_PATH } from 'config';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import axios from 'axios';

// context
import { useAuth } from 'contexts/AuthContext';
import { config } from '../../../../lib/config';

// ============================|| AWS CONNITO - LOGIN ||============================ //

export default function AuthLogin({ providers, csrfToken }: any) {
  const [checked, setChecked] = useState(false);
  const { login } = useAuth();
  const [capsWarning, setCapsWarning] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const onKeyDown = (keyEvent: any) => {
    if (keyEvent.getModifierState('CapsLock')) {
      setCapsWarning(true);
    } else {
      setCapsWarning(false);
    }
  };
  const searchParams = useSearchParams();
  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          password: Yup.string()
            .required('Password is required')
            .test('no-leading-trailing-whitespace', 'Password cannot start or end with spaces', (value) => value === value.trim())
            .min(3, 'Password must not be less than 3 characters')
        })}
        onSubmit={(values, { setErrors, setSubmitting }) => {
          const trimmedEmail = values.email.trim();
          const password = values.password;

          axios
            .post(
              `${config.NEXT_PUBLIC_OAUTH2_SERVER}/oauth2/token?grant_type=password`,
              new URLSearchParams({
                client_id: config.NEXT_PUBLIC_OAUTH2_CLIENT_ID,
                client_secret: config.NEXT_PUBLIC_OAUTH2_CLIENT_SECRET,
                username: trimmedEmail,
                password
              }),
              {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
              }
            )
            .then(
              (response: any) => {
                if (response?.error) {
                  setErrors({ submit: response.error });
                  setSubmitting(false);
                } else {
                  try {
                    // Use auth context login to store tokens and user data
                    const { access_token, refresh_token } = response.data;

                    if (!access_token || !refresh_token) {
                      throw new Error('Invalid credentials');
                    }

                    // Determine redirect target from query or saved localStorage
                    let redirectTo: string | undefined = searchParams?.get('redirectUrl') || undefined;
                    try {
                      if (!redirectTo && typeof window !== 'undefined') {
                        const saved = window.localStorage.getItem('redirectUrl') || undefined;
                        if (saved && saved.startsWith('/')) redirectTo = saved;
                      }
                    } catch {}

                    login(access_token, refresh_token, redirectTo);
                  } catch (err: any) {
                    console.error('Login error:', err);
                    setErrors({ submit: err.message || 'Login failed' });
                    setSubmitting(false);
                  }
                }
              },
              (error) => {
                console.error('OAuth2 error:', error);
                const errorMessage = error?.response?.data?.error_description || error?.response?.data?.error || 'Login failed';
                setErrors({ submit: errorMessage });
                setSubmitting(false);
              }
            );
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="email-login">Email Address</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="password-login">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    color={capsWarning ? 'warning' : 'primary'}
                    error={Boolean(touched.password && errors.password)}
                    id="-password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={(event: FocusEvent<any, Element>) => {
                      setCapsWarning(false);
                      handleBlur(event);
                    }}
                    onKeyDown={onKeyDown}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter password"
                  />
                  {capsWarning && (
                    <Typography variant="caption" sx={{ color: 'warning.main' }} id="warning-helper-text-password-login">
                      Caps lock on!
                    </Typography>
                  )}
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-login">
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>

              <Grid sx={{ mt: -1 }} size={12}>
                <Stack direction="row" sx={{ gap: 2, alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                        name="checked"
                        color="primary"
                        size="small"
                      />
                    }
                    label={<Typography variant="h6">Keep me sign in</Typography>}
                  />

                  <Link
                    variant="h6"
                    component={NextLink}
                    href={`${config.NEXT_PUBLIC_OAUTH2_SERVER}/forgot-password?redirect=${window.location.origin}`}
                    color="text.primary"
                  >
                    Forgot Password?
                  </Link>
                </Stack>
              </Grid>
              {errors.submit && (
                <Grid size={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid size={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Login
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
      <Box sx={{ mt: 3 }}>
        <Divider sx={{ mb: 2.5 }}>
          <Typography variant="caption" color="textSecondary">
            Sign in with
          </Typography>
        </Divider>
        <FirebaseSocial callbackUrl={APP_DEFAULT_PATH} />
      </Box>
    </>
  );
}
