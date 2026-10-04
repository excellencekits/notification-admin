export interface NotificationType {
  id?: number;
  type: string;
  subject: string;
  description?: string;
  applicationId: string;
}

export interface NotificationTemplate {
  id?: number;
  notification: NotificationType;
  channel: 'EMAIL' | 'FCM' | 'SMS' | 'HSM' | string;
  content: string;
  contentType?: string;
  data?: string;
  active: boolean;
  toEmail?: string;
  ccEmail?: string;
  bccEmail?: string;
  fromEmail?: string;
}

export interface ServiceProvider {
  id: string;
  channel: 'EMAIL' | 'FCM' | 'SMS' | string;
  url: string;
  port?: number;
  path?: string;
  headers?: string;
  payload?: string;
  username?: string;
  password?: string;
  okResponseCode?: number;
  applicationId: string;
  active: boolean;
  httpMethod?: string;
}

export interface MessageEntity {
  id: number;
  userId?: string;
  app?: string;
  messageType?: string;
  subject?: string;
  messageContent?: string;
  seen: boolean;
  time: string;
}

export interface DashboardStats {
  totalNotifications: number;
  totalTemplates: number;
  totalProviders: number;
  totalMessages: number;
  channelBreakdown: Record<string, number>;
  recentMessages: MessageEntity[];
}

export interface PublishRequest {
  notificationType: string;
  applicationId: string;
  userId?: string;
  toEmail?: string[];
  ccEmail?: string[];
  bccEmail?: string[];
  fromEmail?: string;
  mobileNumber?: string;
  fcmToken?: string;
  placeholders?: Record<string, any>;
}
