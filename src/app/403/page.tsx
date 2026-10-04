import React from 'react';
import MainCard from 'components/MainCard';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <MainCard>
      <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
        <Typography variant="h4">403 — Forbidden</Typography>
        <Typography color="text.secondary">You do not have permission to access this page.</Typography>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Button variant="contained">Go to Dashboard</Button>
        </Link>
      </Stack>
    </MainCard>
  );
}
