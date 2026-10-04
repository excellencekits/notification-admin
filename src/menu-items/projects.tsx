// assets
import { FolderOutlined, DashboardOutlined, BugReportOutlined } from '@mui/icons-material';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  FolderOutlined,
  DashboardOutlined,
  BugReportOutlined
};

// ==============================|| MENU ITEMS - PROJECTS ||============================== //

const projectsMenu: NavItemType = {
  id: 'group-projects',
  title: 'Main',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.DashboardOutlined,
      breadcrumbs: true
    },
    {
      id: 'my-projects',
      title: 'My Projects',
      type: 'item',
      url: '/projects',
      icon: icons.FolderOutlined,
      breadcrumbs: true
    },
    {
      id: 'my-issues',
      title: 'My Issues',
      type: 'item',
      url: '/issues',
      icon: icons.BugReportOutlined,
      breadcrumbs: true
    }
  ]
};

export default projectsMenu;
