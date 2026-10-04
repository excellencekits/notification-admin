// Type-safe runtime config
export interface RuntimeConfig {
  NEXT_PUBLIC_NOTIFICATION_API_SERVER: string;
  NEXT_PUBLIC_API_SERVER: string;
  NEXT_PUBLIC_APPLICATION_HOST: string;
  NEXT_PUBLIC_OAUTH2_CLIENT_ID: string;
  NEXT_PUBLIC_OAUTH2_CLIENT_SECRET: string;
  NEXT_PUBLIC_OAUTH2_SERVER: string;
  NEXT_PUBLIC_AUTH_DISABLED: boolean;
}

declare global {
  interface Window {
    __ENV__?: Partial<RuntimeConfig>;
  }
}

export const config: RuntimeConfig = {
  get NEXT_PUBLIC_NOTIFICATION_API_SERVER() {
    if (typeof window !== 'undefined' && window.__ENV__?.NEXT_PUBLIC_NOTIFICATION_API_SERVER) {
      return window.__ENV__.NEXT_PUBLIC_NOTIFICATION_API_SERVER;
    }
    return process.env.NEXT_PUBLIC_NOTIFICATION_API_SERVER || 'https://notification-stg.excellencekits.com/notification-service';
  },
  get NEXT_PUBLIC_API_SERVER() {
    if (typeof window !== 'undefined' && window.__ENV__?.NEXT_PUBLIC_API_SERVER) {
      return window.__ENV__.NEXT_PUBLIC_API_SERVER;
    }
    return process.env.NEXT_PUBLIC_API_SERVER || 'https://notification-stg.excellencekits.com/notification-service';
  },
  get NEXT_PUBLIC_APPLICATION_HOST() {
    if (typeof window !== 'undefined' && window.__ENV__?.NEXT_PUBLIC_APPLICATION_HOST) {
      return window.__ENV__.NEXT_PUBLIC_APPLICATION_HOST;
    }
    return process.env.NEXT_PUBLIC_APPLICATION_HOST || 'https://notification-admin.excellencekits.com';
  },
  get NEXT_PUBLIC_OAUTH2_CLIENT_ID() {
    if (typeof window !== 'undefined' && window.__ENV__?.NEXT_PUBLIC_OAUTH2_CLIENT_ID) {
      return window.__ENV__.NEXT_PUBLIC_OAUTH2_CLIENT_ID;
    }
    return process.env.NEXT_PUBLIC_OAUTH2_CLIENT_ID || 'notification-admin-client';
  },
  get NEXT_PUBLIC_OAUTH2_CLIENT_SECRET() {
    if (typeof window !== 'undefined' && window.__ENV__?.NEXT_PUBLIC_OAUTH2_CLIENT_SECRET) {
      return window.__ENV__.NEXT_PUBLIC_OAUTH2_CLIENT_SECRET;
    }
    return process.env.NEXT_PUBLIC_OAUTH2_CLIENT_SECRET || 'secret';
  },
  get NEXT_PUBLIC_OAUTH2_SERVER() {
    if (typeof window !== 'undefined' && window.__ENV__?.NEXT_PUBLIC_OAUTH2_SERVER) {
      return window.__ENV__.NEXT_PUBLIC_OAUTH2_SERVER;
    }
    return process.env.NEXT_PUBLIC_OAUTH2_SERVER || 'https://identity-stg.excellencekits.com';
  },
  get NEXT_PUBLIC_AUTH_DISABLED() {
    if (typeof window !== 'undefined' && window.__ENV__?.NEXT_PUBLIC_AUTH_DISABLED !== undefined) {
      return String(window.__ENV__.NEXT_PUBLIC_AUTH_DISABLED) === 'true';
    }
    return process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true';
  }
};

export default config;
