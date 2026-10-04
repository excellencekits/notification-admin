import { ReactElement } from 'react';

// assets
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import FolderOutlined from '@ant-design/icons/FolderOutlined';
import CheckSquareOutlined from '@ant-design/icons/CheckSquareOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

export interface SearchChild {
  id: string;
  title: string;
  icon: ReactElement;
  path: string;
  isExternal?: boolean;
}

export interface SearchGroup {
  id: string;
  title: string;
  childs: SearchChild[];
}

export type SearchDataType = SearchGroup[];

export const searchData: SearchDataType = [
  {
    id: 'workspace',
    title: 'Workspace',
    childs: [
      { id: 'nav-dashboard', title: 'Dashboard', icon: <DashboardOutlined />, path: '/dashboard' },
      { id: 'nav-projects', title: 'My Projects', icon: <FolderOutlined />, path: '/projects' },
      { id: 'nav-issues', title: 'My Issues', icon: <CheckSquareOutlined />, path: '/issues' }
    ]
  },
  {
    id: 'administration',
    title: 'Administration',
    childs: [
      { id: 'admin-all-projects', title: 'All Projects', icon: <SettingOutlined />, path: '/admin/projects' },
      { id: 'admin-create-project', title: 'Create Project', icon: <PlusOutlined />, path: '/admin/projects/create' }
    ]
  }
];
