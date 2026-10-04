'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertColor } from '@mui/material/Alert';

export type NotifyOptions = {
  severity?: AlertColor;
  message: string;
  duration?: number; // ms
};

type NotifyFn = (message: string, opts?: Omit<NotifyOptions, 'message'>) => void;

type NotificationContextType = {
  notify: NotifyFn;
  success: NotifyFn;
  error: NotifyFn;
  info: NotifyFn;
  warning: NotifyFn;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function useNotificationQueue() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<NotifyOptions | null>(null);
  const queueRef = useRef<NotifyOptions[]>([]);
  const timerRef = useRef<any>(null);
  const lastShownAtRef = useRef<number>(0);

  const processQueue = useCallback(() => {
    if (open || current) return;
    const next = queueRef.current.shift();
    if (next) {
      setCurrent(next);
      setOpen(true);
      lastShownAtRef.current = Date.now();
      const duration = next.duration ?? 4000;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setOpen(false), duration);
    }
  }, [open, current]);

  const enqueue = useCallback(
    (opts: NotifyOptions) => {
      // De-duplicate identical messages within 2 seconds
      const now = Date.now();
      if (current?.message === opts.message && current?.severity === (opts.severity ?? 'info') && now - lastShownAtRef.current < 2000) {
        return;
      }
      queueRef.current.push({ severity: opts.severity ?? 'info', message: opts.message, duration: opts.duration });
      processQueue();
    },
    [current, processQueue]
  );

  const handleClose = useCallback((_e?: any, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open && current) {
      // allow exit animation to finish, then clear and show next
      const t = setTimeout(() => {
        setCurrent(null);
        processQueue();
      }, 150);
      return () => clearTimeout(t);
    }
  }, [open, current, processQueue]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { open, current, enqueue, handleClose } as const;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { open, current, enqueue, handleClose } = useNotificationQueue();

  // Hook up window event bus so non-React code can trigger notifications
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<NotifyOptions>).detail;
      if (!detail) return;
      enqueue(detail);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('app-notify', handler as EventListener);
      return () => window.removeEventListener('app-notify', handler as EventListener);
    }
  }, [enqueue]);

  const ctx: NotificationContextType = useMemo(() => {
    const base: NotifyFn = (message, opts) => enqueue({ message, severity: opts?.severity, duration: opts?.duration });
    return {
      notify: base,
      success: (m, o) => base(m, { ...o, severity: 'success' }),
      error: (m, o) => base(m, { ...o, severity: 'error' }),
      info: (m, o) => base(m, { ...o, severity: 'info' }),
      warning: (m, o) => base(m, { ...o, severity: 'warning' })
    };
  }, [enqueue]);

  return (
    <NotificationContext.Provider value={ctx}>
      {children}
      <Snackbar
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: 560
        }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleClose}
          severity={current?.severity ?? 'info'}
          sx={{ width: '100%', maxWidth: 560, textAlign: 'center' }}
        >
          {current?.message}
        </MuiAlert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export function useNotify() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotify must be used within NotificationProvider');
  return ctx;
}
