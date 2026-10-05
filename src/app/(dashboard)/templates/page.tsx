'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
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
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme, alpha } from '@mui/material/styles';

// assets
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import MobileOutlined from '@ant-design/icons/MobileOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
import ShoppingOutlined from '@ant-design/icons/ShoppingOutlined';
import SafetyCertificateOutlined from '@ant-design/icons/SafetyCertificateOutlined';
import CarOutlined from '@ant-design/icons/CarOutlined';
import BugOutlined from '@ant-design/icons/BugOutlined';
import GlobalOutlined from '@ant-design/icons/GlobalOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

// project imports
import MainCard from 'components/MainCard';
import HtmlTemplateEditor from '../../../components/editor/HtmlTemplateEditor';
import {
  getTemplates,
  getNotifications,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  publishNotification
} from '../../../api/notification';
import { NotificationTemplate, NotificationType } from '../../../types/notification';

const DEFAULT_APPS = ['E-COMMERCE', 'OAUTH-SERVER', 'FAST', 'ISSUE-TRACKER', 'GENERAL'];

function TemplatesContent() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const initialNotifId = searchParams.get('notificationId');
  const initialAppId = searchParams.get('applicationId');

  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedApp, setSelectedApp] = useState(initialAppId || 'ALL');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [selectedNotifFilter, setSelectedNotifFilter] = useState<string>(initialNotifId || 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Preview & Test Dialog State
  const [previewItem, setPreviewItem] = useState<NotificationTemplate | null>(null);
  const [previewTab, setPreviewTab] = useState<'preview' | 'test'>('preview');
  const [testChannel, setTestChannel] = useState<'EMAIL' | 'FCM' | 'SMS'>('EMAIL');
  const [testRecipient, setTestRecipient] = useState('support@bsmamart.com');
  const [testUserId, setTestUserId] = useState('1001');
  const [testPlaceholders, setTestPlaceholders] = useState(
    JSON.stringify(
      {
        customerName: 'Mustafa',
        orderId: 'ORD-98214',
        totalAmount: '$150.00',
        otp: '482910'
      },
      null,
      2
    )
  );
  const [testingDispatch, setTestingDispatch] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Edit / Create Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<NotificationTemplate | null>(null);
  const [formData, setFormData] = useState({
    notificationId: 0,
    channel: 'EMAIL',
    content: '',
    fromEmail: 'support@bsmamart.com',
    toEmail: '',
    active: true
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tList, nList] = await Promise.all([getTemplates(), getNotifications()]);
      setTemplates(Array.isArray(tList) ? tList : []);
      setNotifications(Array.isArray(nList) ? nList : []);
      if (initialNotifId) {
        setSelectedNotifFilter(initialNotifId);
      }
    } catch (err: any) {
      console.error('Failed to load templates:', err);
      setError('Failed to fetch templates from backend service.');
      setTemplates([]);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute available applications from both notifications and templates
  const availableApps = useMemo(() => {
    const appsFromNotifs = (Array.isArray(notifications) ? notifications : [])
      .map((n) => n.applicationId)
      .filter((a): a is string => Boolean(a));
    const appsFromTemplates = (Array.isArray(templates) ? templates : [])
      .map((t) => t.notification?.applicationId)
      .filter((a): a is string => Boolean(a));
    return Array.from(new Set([...DEFAULT_APPS, ...appsFromNotifs, ...appsFromTemplates]));
  }, [notifications, templates]);

  // Compute template counts per application
  const appTemplateCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0 };
    const safeList = Array.isArray(templates) ? templates : [];
    counts.ALL = safeList.length;

    safeList.forEach((t) => {
      const app = t.notification?.applicationId || 'GENERAL';
      counts[app] = (counts[app] || 0) + 1;
    });

    return counts;
  }, [templates]);

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

  // Filter notifications by selected application for dropdowns
  const appNotifications = useMemo(() => {
    const safeNotifs = Array.isArray(notifications) ? notifications : [];
    if (selectedApp === 'ALL') return safeNotifs;
    return safeNotifs.filter((n) => n.applicationId === selectedApp);
  }, [notifications, selectedApp]);

  // Filter templates based on application, channel, notification, and search term
  const filteredTemplates = useMemo(() => {
    const list = Array.isArray(templates) ? templates : [];
    return list.filter((t) => {
      if (!t) return false;
      const matchApp =
        selectedApp === 'ALL' ||
        t.notification?.applicationId === selectedApp;
      const matchChannel =
        selectedChannel === 'ALL' || t.channel === selectedChannel;
      const matchNotif =
        selectedNotifFilter === 'ALL' ||
        String(t.notification?.id) === selectedNotifFilter;
      const matchSearch =
        !searchTerm.trim() ||
        (t.notification?.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.notification?.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.content || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchApp && matchChannel && matchNotif && matchSearch;
    });
  }, [templates, selectedApp, selectedChannel, selectedNotifFilter, searchTerm]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    const targetNotifs = appNotifications.length > 0 ? appNotifications : notifications;
    setFormData({
      notificationId: targetNotifs.length > 0 ? targetNotifs[0].id || 0 : 0,
      channel: 'EMAIL',
      content: '<p>Hello <strong>{customerName}</strong>,</p><p>Your order <code>{orderId}</code> has been confirmed.</p>',
      fromEmail: 'support@bsmamart.com',
      toEmail: '',
      active: true
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (item: NotificationTemplate) => {
    setEditingItem(item);
    setFormData({
      notificationId: item.notification?.id || 0,
      channel: item.channel || 'EMAIL',
      content: item.content || '',
      fromEmail: item.fromEmail || 'support@bsmamart.com',
      toEmail: item.toEmail || '',
      active: item.active !== false
    });
    setOpenDialog(true);
  };

  const handleOpenPreview = (item: NotificationTemplate) => {
    setPreviewItem(item);
    setPreviewTab('preview');
    setTestChannel((item.channel as 'EMAIL' | 'FCM' | 'SMS') || 'EMAIL');
    setTestSuccess(null);
    setTestError(null);
    if (item.channel === 'EMAIL') {
      setTestRecipient('support@bsmamart.com');
    } else if (item.channel === 'FCM') {
      setTestRecipient('dK3-sample-firebase-device-token...');
    } else {
      setTestRecipient('+971501234567');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(id);
        setTemplates((prev) => (Array.isArray(prev) ? prev.filter((t) => t?.id !== id) : []));
      } catch (err: any) {
        alert('Failed to delete template: ' + err.message);
      }
    }
  };

  const handleToggleActive = async (item: NotificationTemplate) => {
    if (!item.id) return;
    try {
      const updated = await updateTemplate(item.id, {
        ...item,
        active: !item.active
      });
      setTemplates((prev) => (Array.isArray(prev) ? prev.map((t) => (t?.id === item.id ? updated : t)) : []));
    } catch (err: any) {
      alert('Failed to update active state: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.notificationId) {
      alert('Please select a valid notification type.');
      return;
    }

    try {
      setSubmitting(true);
      const safeNotifs = Array.isArray(notifications) ? notifications : [];
      const selectedNotif = safeNotifs.find((n) => n?.id === Number(formData.notificationId));
      const payload: Partial<NotificationTemplate> = {
        channel: formData.channel,
        content: formData.content,
        fromEmail: formData.fromEmail,
        toEmail: formData.toEmail || undefined,
        active: formData.active,
        notification: selectedNotif as NotificationType
      };

      if (editingItem && editingItem.id) {
        const updated = await updateTemplate(editingItem.id, payload);
        setTemplates((prev) => (Array.isArray(prev) ? prev.map((t) => (t?.id === editingItem.id ? updated : t)) : [updated]));
      } else {
        const created = await createTemplate(payload);
        setTemplates((prev) => (Array.isArray(prev) ? [...prev, created] : [created]));
      }
      setOpenDialog(false);
    } catch (err: any) {
      alert('Error saving template: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Live Test Dispatch in Preview Dialog
  const handleExecuteTest = async () => {
    if (!previewItem || !previewItem.notification) return;
    setTestSuccess(null);
    setTestError(null);

    let parsedPlaceholders: Record<string, any> = {};
    try {
      if (testPlaceholders.trim()) {
        parsedPlaceholders = JSON.parse(testPlaceholders);
      }
    } catch {
      setTestError('Invalid JSON in placeholders input. Please check syntax.');
      return;
    }

    try {
      setTestingDispatch(true);
      await publishNotification({
        notificationType: previewItem.notification.type,
        applicationId: previewItem.notification.applicationId || 'E-COMMERCE',
        userId: testUserId || undefined,
        toEmail: testChannel === 'EMAIL' && testRecipient ? [testRecipient] : undefined,
        fcmToken: testChannel === 'FCM' ? testRecipient : undefined,
        mobileNumber: testChannel === 'SMS' ? testRecipient : undefined,
        placeholders: parsedPlaceholders
      });
      setTestSuccess(
        `Live test dispatch sent successfully via ${testChannel} to "${testRecipient}"!`
      );
    } catch (err: any) {
      setTestError(err.response?.data?.message || err.message || 'Failed to dispatch live test');
    } finally {
      setTestingDispatch(false);
    }
  };

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
            Message Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure rich multi-channel copy, visual HTML emails, and live push payloads
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlusOutlined />}
          onClick={handleOpenCreate}
          sx={{ textTransform: 'none', fontWeight: 600, height: 40 }}
        >
          Create Template
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
                  label={`${templates.length} Templates`}
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
                  label={appTemplateCounts.ALL || 0}
                  size="small"
                  color={selectedApp === 'ALL' ? 'primary' : 'default'}
                  sx={{ height: 20, fontSize: '0.75rem' }}
                />
              </ListItemButton>

              <Divider sx={{ my: 1 }} />

              {/* Individual Applications */}
              {availableApps.map((app) => {
                const count = appTemplateCounts[app] || 0;
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
            {/* Channel Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs
                value={selectedChannel}
                onChange={(_, val) => setSelectedChannel(val)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="All Channels" value="ALL" />
                <Tab icon={<MailOutlined />} iconPosition="start" label="Email" value="EMAIL" />
                <Tab icon={<MobileOutlined />} iconPosition="start" label="FCM Mobile Push" value="FCM" />
                <Tab icon={<SendOutlined />} iconPosition="start" label="SMS" value="SMS" />
              </Tabs>
            </Box>

            {/* Filter Toolbar */}
            <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%' }}>
                  <TextField
                    select
                    size="small"
                    label="Notification Type Filter"
                    value={selectedNotifFilter}
                    onChange={(e) => setSelectedNotifFilter(e.target.value)}
                    sx={{ width: { xs: '100%', sm: 300 } }}
                  >
                    <MenuItem value="ALL">
                      All Notification Types ({appNotifications.length})
                    </MenuItem>
                    {appNotifications.map((n) => (
                      <MenuItem key={n.id} value={String(n.id)}>
                        {n.type} ({n.subject})
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    size="small"
                    placeholder="Search templates content or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: { xs: '100%', sm: 260 } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlined />
                        </InputAdornment>
                      )
                    }}
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Templates Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notification Event</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Channel</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Sender / From</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
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
                  ) : filteredTemplates.length > 0 ? (
                    filteredTemplates.map((t) => (
                      <TableRow key={t.id} hover>
                        <TableCell>#{t.id}</TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {t.notification?.type || 'UNLINKED'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {t.notification?.subject || '—'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {t.channel === 'EMAIL' && (
                            <Chip icon={<MailOutlined />} label="Email" size="small" color="primary" variant="outlined" />
                          )}
                          {t.channel === 'FCM' && (
                            <Chip icon={<MobileOutlined />} label="Push" size="small" color="success" variant="outlined" />
                          )}
                          {t.channel === 'SMS' && (
                            <Chip icon={<SendOutlined />} label="SMS" size="small" color="warning" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                          {t.fromEmail || 'Default'}
                        </TableCell>
                        <TableCell>
                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                checked={t.active !== false}
                                onChange={() => handleToggleActive(t)}
                                color="success"
                              />
                            }
                            label={
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {t.active !== false ? 'Active' : 'Disabled'}
                              </Typography>
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Preview & Live Test">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenPreview(t)}
                                color="info"
                              >
                                <EyeOutlined />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Template">
                              <IconButton size="small" onClick={() => handleOpenEdit(t)} color="primary">
                                <EditOutlined />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Template">
                              <IconButton
                                size="small"
                                onClick={() => t.id && handleDelete(t.id)}
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
                            No templates found matching current criteria.
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PlusOutlined />}
                            onClick={handleOpenCreate}
                            sx={{ textTransform: 'none' }}
                          >
                            Create First Template
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

      {/* Preview & Live Test Dialog */}
      <Dialog
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {previewItem?.notification?.type} ({previewItem?.channel})
            </Typography>
            <Chip
              label={previewItem?.notification?.applicationId || 'GLOBAL'}
              size="small"
              color="primary"
            />
          </Stack>
        </DialogTitle>

        {/* Tab switcher: Preview vs Test Dispatch */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs
            value={previewTab}
            onChange={(_, val) => setPreviewTab(val)}
          >
            <Tab icon={<EyeOutlined />} iconPosition="start" label="Template Preview" value="preview" />
            <Tab icon={<SendOutlined />} iconPosition="start" label="Live Test Dispatch" value="test" />
          </Tabs>
        </Box>

        <DialogContent dividers sx={{ p: 3 }}>
          {previewTab === 'preview' && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Subject Line: <strong>{previewItem?.notification?.subject}</strong> | Sender:{' '}
                  <code>{previewItem?.fromEmail || 'Default Relay'}</code>
                </Typography>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  minHeight: 280,
                  bgcolor: 'background.default',
                  borderColor: 'divider'
                }}
              >
                {previewItem?.channel === 'EMAIL' && previewItem.content?.includes('<') ? (
                  <Box
                    sx={{
                      bgcolor: '#ffffff',
                      color: '#1f2937',
                      p: 2.5,
                      borderRadius: 1.5,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: previewItem.content.replace(
                        /\{(\w+)\}/g,
                        '<span style="background:#fff3cd;color:#856404;font-weight:bold;padding:2px 4px;border-radius:3px;">{$1}</span>'
                      )
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem'
                    }}
                    color="text.primary"
                  >
                    {previewItem?.content}
                  </Typography>
                )}
              </Paper>
            </Stack>
          )}

          {previewTab === 'test' && (
            <Stack spacing={2.5}>
              <Typography variant="body2" color="text.secondary">
                Dispatch a live notification with test variables directly to a physical recipient.
              </Typography>

              {testSuccess && (
                <Alert icon={<CheckCircleOutlined />} severity="success">
                  {testSuccess}
                </Alert>
              )}

              {testError && (
                <Alert severity="error">
                  {testError}
                </Alert>
              )}

              {/* Channel Selector Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={testChannel}
                  onChange={(_, val) => {
                    setTestChannel(val);
                    if (val === 'EMAIL') setTestRecipient('support@bsmamart.com');
                    else if (val === 'FCM') setTestRecipient('dK3-sample-device-token...');
                    else setTestRecipient('+971501234567');
                  }}
                >
                  <Tab icon={<MailOutlined />} iconPosition="start" label="Email" value="EMAIL" />
                  <Tab icon={<MobileOutlined />} iconPosition="start" label="FCM Push" value="FCM" />
                  <Tab icon={<SendOutlined />} iconPosition="start" label="SMS" value="SMS" />
                </Tabs>
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    label={
                      testChannel === 'EMAIL'
                        ? 'Recipient Email Address'
                        : testChannel === 'FCM'
                        ? 'FCM Device Token'
                        : 'Mobile Phone Number (E.164)'
                    }
                    fullWidth
                    size="small"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="Target User ID (optional)"
                    fullWidth
                    size="small"
                    value={testUserId}
                    onChange={(e) => setTestUserId(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                  Test Placeholders JSON:
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  fullWidth
                  value={testPlaceholders}
                  onChange={(e) => setTestPlaceholders(e.target.value)}
                  InputProps={{
                    sx: {
                      fontFamily: 'Consolas, Monaco, monospace',
                      fontSize: '0.85rem'
                    }
                  }}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPreviewItem(null)} color="secondary">
            Close
          </Button>
          {previewTab === 'test' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={testingDispatch ? <CircularProgress size={18} color="inherit" /> : <SendOutlined />}
              disabled={testingDispatch}
              onClick={handleExecuteTest}
            >
              {testingDispatch ? 'Dispatching Live...' : 'Send Live Test'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Create / Edit Template Dialog with Modern HTML Editor */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingItem ? 'Edit Message Template' : 'Create Message Template'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {/* Event & Channel Selection */}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    select
                    label="Associated Notification Event"
                    required
                    fullWidth
                    value={formData.notificationId}
                    onChange={(e) => setFormData({ ...formData, notificationId: Number(e.target.value) })}
                  >
                    {(Array.isArray(notifications) ? notifications : []).map((n) => (
                      <MenuItem key={n.id} value={n.id}>
                        {n.type} ({n.subject}) - [{n.applicationId}]
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    select
                    label="Delivery Channel"
                    required
                    fullWidth
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  >
                    <MenuItem value="EMAIL">Email</MenuItem>
                    <MenuItem value="FCM">FCM Mobile Push</MenuItem>
                    <MenuItem value="SMS">SMS Gateway</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {/* Sender Details & Status */}
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 8 }}>
                  {formData.channel === 'EMAIL' && (
                    <TextField
                      label="From Sender Email"
                      fullWidth
                      size="small"
                      placeholder="support@bsmamart.com"
                      value={formData.fromEmail}
                      onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                      helperText="Outgoing sender address configured in SMTP provider"
                    />
                  )}
                  {formData.channel !== 'EMAIL' && (
                    <TextField
                      label="Sender ID / Header"
                      fullWidth
                      size="small"
                      placeholder="BSMA Mart"
                      value={formData.fromEmail}
                      onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                    />
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        color="success"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formData.active ? 'Template Active' : 'Template Disabled'}
                      </Typography>
                    }
                  />
                </Grid>
              </Grid>

              {/* Template Content Editor */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Template Content:
                </Typography>

                {formData.channel === 'EMAIL' ? (
                  /* Modern Visual HTML Editor with Plain HTML Option & Placeholders */
                  <HtmlTemplateEditor
                    value={formData.content}
                    onChange={(val) => setFormData({ ...formData, content: val })}
                    minHeight={320}
                  />
                ) : (
                  /* Plain Text Editor for FCM Push & SMS */
                  <Stack spacing={1.5}>
                    <TextField
                      multiline
                      rows={6}
                      fullWidth
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Enter push or SMS message text..."
                      InputProps={{
                        sx: {
                          fontFamily: 'monospace',
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="caption" color="text.secondary">
                        Insert Variable:
                      </Typography>
                      {['{customerName}', '{orderId}', '{totalAmount}', '{otp}'].map((v) => (
                        <Chip
                          key={v}
                          label={v}
                          size="small"
                          clickable
                          onClick={() => setFormData({ ...formData, content: formData.content + ' ' + v })}
                          variant="outlined"
                          color="primary"
                          sx={{ height: 22, fontSize: '0.75rem', fontFamily: 'monospace' }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenDialog(false)} color="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingItem ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Box>
      }
    >
      <TemplatesContent />
    </Suspense>
  );
}
