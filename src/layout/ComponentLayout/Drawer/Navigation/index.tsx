import { useDeferredValue, useMemo } from 'react';

// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavGroup from './NavGroup';

// types
import { NavItemType } from 'types/menu';

// ==============================|| DRAWER - NAVIGATION ||============================== //

export default function Navigation({ searchValue }: { searchValue?: string }) {
  const deferredSearch = useDeferredValue(searchValue?.trim().toLowerCase() ?? '');

  const filteredMenuItems = useMemo<NavItemType[]>(() => {
    // Components menu removed from side menu; return empty list
    return [];
  }, [deferredSearch]);

  const navGroups = filteredMenuItems.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: 1 }}>{navGroups}</Box>;
}
