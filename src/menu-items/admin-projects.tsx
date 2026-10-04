// assets
import { FolderOutlined, SettingsOutlined, PeopleOutlined } from '@mui/icons-material';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  FolderOutlined,
  SettingsOutlined,
  PeopleOutlined
};

// ==============================|| MENU ITEMS - ADMIN PROJECTS ||============================== //

const adminProjectsMenu: NavItemType = {
  id: 'group-admin-projects',
  title: 'Administration',
  type: 'group',
  role: 'SUPERADMIN', // Only visible to SUPERADMIN
  children: [
    {
      id: 'all-projects',
      title: 'All Projects',
      type: 'item',
      url: '/admin/projects',
      icon: icons.FolderOutlined,
      role: 'SUPERADMIN',
      breadcrumbs: true
    },
    {
      id: 'project-settings',
      title: 'Project Settings',
      type: 'collapse',
      icon: icons.SettingsOutlined,
      role: 'SUPERADMIN',
      children: [
        {
          id: 'create-project',
          title: 'Create Project',
          type: 'item',
          url: '/admin/projects/create',
          breadcrumbs: true
        }
      ]
    }
  ]
};

export default adminProjectsMenu;
