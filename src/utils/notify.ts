export type EmitNotificationParams = {
  severity?: 'success' | 'info' | 'warning' | 'error';
  message: string;
  duration?: number;
};

/**
 * Fire-and-forget notification from anywhere (including non-React modules like axios interceptors).
 * This dispatches a CustomEvent consumed by NotificationProvider.
 */
export function emitNotification(params: EmitNotificationParams) {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent<EmitNotificationParams>('app-notify', { detail: params });
  window.dispatchEvent(event);
}
