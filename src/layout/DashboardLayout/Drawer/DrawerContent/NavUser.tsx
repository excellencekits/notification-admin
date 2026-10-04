import { useState, MouseEvent } from 'react';

// next
import Link from 'next/link';

// material-ui
import { styled } from '@mui/material/styles';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

// project imports
import Avatar from 'components/@extended/Avatar';
import useUser from 'hooks/useUser';
import { useGetMenuMaster } from 'api/menu';
import { useAuth } from 'contexts/AuthContext';

// assets
import RightOutlined from '@ant-design/icons/RightOutlined';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
  drawerOpen: boolean;
}

const ExpandMore = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'theme' && prop !== 'expand' && prop !== 'drawerOpen'
})<ExpandMoreProps>(({ theme }) => ({
  transform: 'rotate(-90deg)',
  marginLeft: 'auto',
  color: theme.vars.palette.secondary.dark,
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: { transform: 'rotate(0deg)' }
    },
    {
      props: ({ drawerOpen }) => !drawerOpen,
      style: { opacity: 0, width: 50, height: 50 }
    }
  ]
}));

// ==============================|| LIST - USER ||============================== //

export default function NavUser() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const user = useUser();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ p: 1.25, px: !drawerOpen ? 1.25 : 3, borderTop: '2px solid', borderTopColor: 'divider' }}>
      <List disablePadding>
        <ListItem
          disablePadding
          secondaryAction={
            <ExpandMore
              expand={open}
              drawerOpen={drawerOpen}
              id="basic-button"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              aria-label="show more"
            >
              <RightOutlined style={{ fontSize: '0.625rem' }} />
            </ExpandMore>
          }
          sx={{ '& .MuiListItemSecondaryAction-root': { right: !drawerOpen ? -20 : -16 } }}
        >
          <ListItemAvatar>
            {user && <Avatar alt="Avatar" src={user.avatar} sx={{ ...(drawerOpen && { width: 46, height: 46 }) }} />}
          </ListItemAvatar>
          {user && <ListItemText primary={user?.name} secondary="UI/UX Designer" />}
        </ListItem>
      </List>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{ list: { 'aria-labelledby': 'basic-button' } }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
        <MenuItem component={Link} href="/apps/profiles/user/personal" onClick={handleClose}>
          Profile
        </MenuItem>
        <MenuItem component={Link} href="/apps/profiles/account/my-account" onClick={handleClose}>
          My account
        </MenuItem>
      </Menu>
    </Box>
  );
}
