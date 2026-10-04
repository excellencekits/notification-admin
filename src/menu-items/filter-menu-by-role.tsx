import { NavItemType } from 'types/menu';

export const filterMenuByRole = (menu: NavItemType[], userRoles: string[]): NavItemType[] => {
  return menu
    .filter((item) => {
      // If no role is specified, show the item
      if (!item.role) return true;

      // Check if user has the required role (case-insensitive comparison)
      return userRoles.some((role) => role.toLowerCase().trim() === item?.role?.toLowerCase().trim());
    })
    .map((item) => {
      // ✅ Children are allowed without checking their role
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: item.children.map((child) => ({ ...child })) // keep children
        };
      }

      return item;
    });
};
