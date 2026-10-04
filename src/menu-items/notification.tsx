// assets
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import BellOutlined from '@ant-design/icons/BellOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import CloudServerOutlined from '@ant-design/icons/CloudServerOutlined';
import HistoryOutlined from '@ant-design/icons/HistoryOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';

// types
import { NavItemType } from 'types/menu';

const icons = {
  DashboardOutlined,
  BellOutlined,
  FileTextOutlined,
  CloudServerOutlined,
  HistoryOutlined,
  SendOutlined
};

const notificationMenu: NavItemType = {
  id: 'group-notification-hub',
  title: 'Notification Hub',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Overview',
      type: 'item',
      url: '/dashboard',
      icon: icons.DashboardOutlined
    },
    {
      id: 'notifications',
      title: 'Notification Types',
      type: 'item',
      url: '/notifications',
      icon: icons.BellOutlined
    },
    {
      id: 'templates',
      title: 'Message Templates',
      type: 'item',
      url: '/templates',
      icon: icons.FileTextOutlined
    },
    {
      id: 'providers',
      title: 'Service Providers',
      type: 'item',
      url: '/providers',
      icon: icons.CloudServerOutlined
    },
    {
      id: 'logs',
      title: 'Delivery Logs',
      type: 'item',
      url: '/logs',
      icon: icons.HistoryOutlined
    },
    {
      id: 'test-send',
      title: 'Test & Dispatch',
      type: 'item',
      url: '/test-send',
      icon: icons.SendOutlined
    }
  ]
};

export default notificationMenu;
