import { notificationClient } from './client';
import {
  NotificationType,
  NotificationTemplate,
  ServiceProvider,
  MessageEntity,
  DashboardStats,
  PublishRequest
} from '../../types/notification';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const res = await notificationClient.get('/admin/stats');
  return res.data;
};

// Notification Types
export const getNotifications = async (): Promise<NotificationType[]> => {
  const res = await notificationClient.get('/admin/notifications');
  return res.data;
};

export const getNotificationById = async (id: number): Promise<NotificationType> => {
  const res = await notificationClient.get(`/admin/notifications/${id}`);
  return res.data;
};

export const createNotification = async (data: Partial<NotificationType>): Promise<NotificationType> => {
  const res = await notificationClient.post('/admin/notifications', data);
  return res.data;
};

export const updateNotification = async (id: number, data: Partial<NotificationType>): Promise<NotificationType> => {
  const res = await notificationClient.put(`/admin/notifications/${id}`, data);
  return res.data;
};

export const deleteNotification = async (id: number): Promise<void> => {
  await notificationClient.delete(`/admin/notifications/${id}`);
};

// Templates
export const getTemplates = async (): Promise<NotificationTemplate[]> => {
  const res = await notificationClient.get('/admin/templates');
  return res.data;
};

export const getTemplatesByNotification = async (notificationId: number): Promise<NotificationTemplate[]> => {
  const res = await notificationClient.get(`/admin/templates/by-notification/${notificationId}`);
  return res.data;
};

export const createTemplate = async (data: Partial<NotificationTemplate>): Promise<NotificationTemplate> => {
  const res = await notificationClient.post('/admin/templates', data);
  return res.data;
};

export const updateTemplate = async (id: number, data: Partial<NotificationTemplate>): Promise<NotificationTemplate> => {
  const res = await notificationClient.put(`/admin/templates/${id}`, data);
  return res.data;
};

export const deleteTemplate = async (id: number): Promise<void> => {
  await notificationClient.delete(`/admin/templates/${id}`);
};

// Service Providers
export const getProviders = async (): Promise<ServiceProvider[]> => {
  const res = await notificationClient.get('/admin/providers');
  return res.data;
};

export const createProvider = async (data: Partial<ServiceProvider>): Promise<ServiceProvider> => {
  const res = await notificationClient.post('/admin/providers', data);
  return res.data;
};

export const updateProvider = async (id: string, data: Partial<ServiceProvider>): Promise<ServiceProvider> => {
  const res = await notificationClient.put(`/admin/providers/${id}`, data);
  return res.data;
};

export const deleteProvider = async (id: string): Promise<void> => {
  await notificationClient.delete(`/admin/providers/${id}`);
};

// Message Logs
export interface MessagePageResponse {
  content: MessageEntity[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const getMessages = async (page = 0, size = 15, app?: string): Promise<MessagePageResponse> => {
  const params: Record<string, any> = { page, size };
  if (app) params.app = app;
  const res = await notificationClient.get('/admin/messages', { params });
  return res.data;
};

// Publish / Test Dispatch
export const publishNotification = async (data: PublishRequest): Promise<void> => {
  await notificationClient.post('/publish', data);
};
