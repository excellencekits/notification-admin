import axios from 'axios';
import { getCookie } from 'cookies-next';
import { config as appConfig } from '../../../lib/config';

export const notificationClient = axios.create({
  baseURL: appConfig.NEXT_PUBLIC_NOTIFICATION_API_SERVER,
  headers: {
    'Content-Type': 'application/json'
  }
});

notificationClient.interceptors.request.use((config) => {
  if (appConfig.NEXT_PUBLIC_NOTIFICATION_API_SERVER) {
    config.baseURL = appConfig.NEXT_PUBLIC_NOTIFICATION_API_SERVER;
  }
  const token = (getCookie('accessToken') as string) || (getCookie('access_token') as string);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
