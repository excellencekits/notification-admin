'use client';

import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

type Props = {
  title?: string;
  body?: string;
  open: boolean;
  action?: () => void;
  handleClose?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

export default function ConfirmationDialog({
  title = 'Confirm',
  body = '',
  open,
  action,
  handleClose,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel'
}: Props) {
  const onCancel = () => {
    handleClose?.();
  };

  const onConfirm = async () => {
    try {
      await Promise.resolve(action && action());
    } catch {
      // swallow error
    }
    handleClose?.();
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {body}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{cancelLabel}</Button>
        <Button variant="contained" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
