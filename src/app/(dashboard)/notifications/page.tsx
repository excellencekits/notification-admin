'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { useTheme, alpha } from '@mui/material/styles';

// assets
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
import ShoppingOutlined from '@ant-design/icons/ShoppingOutlined';
import SafetyCertificateOutlined from '@ant-design/icons/SafetyCertificateOutlined';
import CarOutlined from '@ant-design/icons/CarOutlined';
import BugOutlined from '@ant-design/icons/BugOutlined';
import GlobalOutlined from '@ant-design/icons/GlobalOutlined';

// project imports
import MainCard from 'components/MainCard';
import {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification
} from '../../../api/notification';
import { NotificationType } from '../../../types/notification';

const DEFAULT_APPS = ['E-COMMERCE', 'OAUTH-SERVER', 'FAST', 'ISSUE-TRACKER', 'GENERAL'];

export default function NotificationsPage() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState('ALL');
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<NotificationType | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    description: '',
    applicationId: 'E-COMMERCE'
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setError('Failed to fetch notification types from backend service.');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute available applications dynamically
  const availableApps = useMemo(() => {
    const fromNotifs = (Array.isArray(notifications) ? notifications : [])
      .map((n) => n.applicationId)
      .filter((a): a is string => Boolean(a));
    return Array.from(new Set([...DEFAULT_APPS, ...fromNotifs]));
  }, [notifications]);

  // Compute event counts per application
  const appCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 };
    const safeList = Array.isArray(notifications) ? notifications : [];
    counts.ALL = safeList.length;

    safeList.forEach((n) => {
      const app = n.applicationId || 'GENERAL';
      counts[app] = (counts[app] || 0) + 1;
    });

    return counts;
  }, [notifications]);

  const getAppIcon = (app: string) => {
    switch (app) {
      case 'E-COMMERCE':
        return <ShoppingOutlined style={{ fontSize: 16 }} />;
      case 'OAUTH-SERVER':
        return <SafetyCertificateOutlined style={{ fontSize: 16 }} />;
      case 'FAST':
        return <CarOutlined style={{ fontSize: 16 }} />;
      case 'ISSUE-TRACKER':
        return <BugOutlined style={{ fontSize: 16 }} />;
      case 'GENERAL':
        return <GlobalOutlined style={{ fontSize: 16 }} />;
      default:
        return <AppstoreOutlined style={{ fontSize: 16 }} />;
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      type: '',
      subject: '',
      description: '',
      applicationId: selectedApp !== 'ALL' ? selectedApp : 'E-COMMERCE'
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (item: NotificationType) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      subject: item.subject,
      description: item.description || '',
      applicationId: item.applicationId || 'E-COMMERCE'
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this notification type and all its associated templates?')) {
      try {
        await deleteNotification(id);
        setNotifications((prev) => (Array.isArray(prev) ? prev.filter((n) => n?.id !== id) : []));
      } catch (err: any) {
        alert('Failed to delete notification type: ' + err.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type.trim() || !formData.subject.trim()) {
      alert('Type and Subject are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem && editingItem.id) {
        const updated = await updateNotification(editingItem.id, formData);
        setNotifications((prev) => (Array.isArray(prev) ? prev.map((n) => (n?.id === editingItem.id ? updated : n)) : [updated]));
      } else {
        const created = await createNotification(formData);
        setNotifications((prev) => (Array.isArray(prev) ? [...prev, created] : [created]));
      }
      setOpenDialog(false);
    } catch (err: any) {
      alert('Error saving notification: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const filteredNotifications = safeNotifications.filter((item) => {
    if (!item) return false;
    const typeStr = (item.type || '').toLowerCase();
    const subjectStr = (item.subject || '').toLowerCase();
    const descStr = (item.description || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();

    const matchesSearch =
      typeStr.includes(search) ||
      subjectStr.includes(search) ||
      descStr.includes(search);
    const matchesApp = selectedApp === 'ALL' || item.applicationId === selectedApp;
    return matchesSearch && matchesApp;
  });

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Page Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Notification Types & Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage event identifiers and trigger schemas across services and tenant applications
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlusOutlined />}
          onClick={handleOpenCreate}
          sx={{ textTransform: 'none', fontWeight: 600, height: 40 }}
        >
          Add Notification Type
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 2-Column Master-Detail Layout */}
      <Grid container spacing={3}>
        {/* Left Side Pane: Fixed Application List */}
        <Grid size={{ xs: 12, md: 3.5, lg: 3 }}>
          <MainCard
            title={
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Applications
                </Typography>
                <Chip
                  label={`${safeNotifications.length} Total`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 22 }}
                />
              </Stack>
            }
            content={false}
            sx={{
              position: { md: 'sticky' },
              top: { md: 84 },
              height: 'fit-content'
            }}
          >
            <List component="nav" disablePadding sx={{ py: 1 }}>
              {/* All Applications Item */}
              <ListItemButton
                selected={selectedApp === 'ALL'}
                onClick={() => setSelectedApp('ALL')}
                sx={{
                  py: 1.25,
                  px: 2,
                  mx: 1,
                  my: 0.25,
                  borderRadius: 1.5,
                  borderLeft: selectedApp === 'ALL' ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                  bgcolor: selectedApp === 'ALL' ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08)
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: selectedApp === 'ALL' ? 'primary.main' : 'text.secondary' }}>
                  <AppstoreOutlined style={{ fontSize: 16 }} />
                </ListItemIcon>
                <ListItemText
                  primary="All Applications"
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: selectedApp === 'ALL' ? 700 : 500,
                    color: selectedApp === 'ALL' ? 'primary.main' : 'text.primary'
                  }}
                />
                <Chip
                  label={appCounts.ALL || 0}
                  size="small"
                  color={selectedApp === 'ALL' ? 'primary' : 'default'}
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              </ListItemButton>

              <Divider sx={{ my: 1 }} />

              {/* Individual Applications */}
              {availableApps.map((app) => {
                const count = appCounts[app] || 0;
                const isSelected = selectedApp === app;

                return (
                  <ListItemButton
                    key={app}
                    selected={isSelected}
                    onClick={() => setSelectedApp(app)}
                    sx={{
                      py: 1.25,
                      px: 2,
                      mx: 1,
                      my: 0.25,
                      borderRadius: 1.5,
                      borderLeft: isSelected ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: isSelected ? 'primary.main' : 'text.secondary' }}>
                      {getAppIcon(app)}
                    </ListItemIcon>
                    <ListItemText
                      primary={app}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'primary.main' : 'text.primary'
                      }}
                    />
                    <Chip
                      label={count}
                      size="small"
                      color={isSelected ? 'primary' : count > 0 ? 'default' : 'secondary'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      sx={{ height: 20, fontSize: '0.75rem' }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </MainCard>
        </Grid>

        {/* Middle / Right Content Area */}
        <Grid size={{ xs: 12, md: 8.5, lg: 9 }}>
          <MainCard content={false}>
            {/* Top Toolbar in Content Pane */}
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.default'
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {selectedApp === 'ALL' ? 'All Registered Event Types' : `${selectedApp} Events`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Showing {filteredNotifications.length} of {safeNotifications.length} total registered notification events
                    </Typography>
                  </Box>
                </Stack>

                <TextField
                  size="small"
                  placeholder="Filter events or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ width: { xs: '100%', sm: 280 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchOutlined />
                      </InputAdornment>
                    )
                  }}
                />
              </Stack>
            </Box>

            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Event Key / Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Default Subject Line</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Application</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} />
                      </TableCell>
                    </TableRow>
                  ) : filteredNotifications.length > 0 ? (
                    filteredNotifications.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>#{item.id}</TableCell>
                        <TableCell>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              color: 'primary.main',
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              display: 'inline-block'
                            }}
                          >
                            {item.type}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{item.subject}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.applicationId || 'GLOBAL'}
                            size="small"
                            color={
                              item.applicationId === 'E-COMMERCE'
                                ? 'primary'
                                : item.applicationId === 'OAUTH-SERVER'
                                ? 'secondary'
                                : item.applicationId === 'FAST'
                                ? 'success'
                                : 'default'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem', maxWidth: 260 }}>
                          {item.description || '—'}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="View Associated Templates">
                              <IconButton
                                size="small"
                                component={Link}
                                href={`/templates?notificationId=${item.id}&applicationId=${item.applicationId || 'ALL'}`}
                                color="info"
                              >
                                <FileTextOutlined />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Event Type">
                              <IconButton size="small" onClick={() => handleOpenEdit(item)} color="primary">
                                <EditOutlined />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Event Type">
                              <IconButton
                                size="small"
                                onClick={() => item.id && handleDelete(item.id)}
                                color="error"
                              >
                                <DeleteOutlined />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        <Stack spacing={1.5} alignItems="center">
                          <Typography variant="body1">
                            No notification types found for {selectedApp === 'ALL' ? 'current search' : selectedApp}.
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PlusOutlined />}
                            onClick={handleOpenCreate}
                            sx={{ textTransform: 'none' }}
                          >
                            Create {selectedApp !== 'ALL' ? selectedApp : ''} Event Type
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </MainCard>
        </Grid>
      </Grid>

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingItem ? 'Edit Notification Type' : 'Create Notification Type'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                select
                label="Target Application"
                required
                fullWidth
                value={formData.applicationId}
                onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
              >
                {availableApps.map((app) => (
                  <MenuItem key={app} value={app}>
                    {app}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Event Key / Identifier"
                required
                fullWidth
                placeholder="e.g. ORDER_CONFIRMED, OTP_EMAIL"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                helperText="Unique uppercase identifier triggered by microservices"
              />

              <TextField
                label="Default Subject Line"
                required
                fullWidth
                placeholder="e.g. Your Order has Been Placed"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />

              <TextField
                label="Description"
                multiline
                rows={2}
                fullWidth
                placeholder="Optional notes regarding when this notification is triggered"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
