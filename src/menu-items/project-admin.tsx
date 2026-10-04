// assets
import { SettingsOutlined, PeopleOutlined, CategoryOutlined, AccountTreeOutlined } from '@mui/icons-material';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  SettingsOutlined,
  PeopleOutlined,
  CategoryOutlined,
  AccountTreeOutlined
};

// ==============================|| MENU ITEMS - PROJECT ADMIN ||============================== //

// This menu is for users with ADMIN role within a specific project
const projectAdminMenu: NavItemType = {
  id: 'group-project-admin',
  title: 'Project Management',
  type: 'group',
  role: 'ADMIN', // Visible to project admins
  children: [
    {
      id: 'project-members',
      title: 'Team Members',
      type: 'item',
      url: '/project/members',
      icon: icons.PeopleOutlined,
      role: 'ADMIN',
      breadcrumbs: true
    },
    {
      id: 'project-workflow',
      title: 'Workflow Statuses',
      type: 'item',
      url: '/project/workflow',
      icon: icons.AccountTreeOutlined,
      role: 'ADMIN',
      breadcrumbs: true
    },
    {
      id: 'project-classifications',
      title: 'Classifications',
      type: 'item',
      url: '/project/classifications',
      icon: icons.CategoryOutlined,
      role: 'ADMIN',
      breadcrumbs: true
    }
  ]
};

export default projectAdminMenu;
