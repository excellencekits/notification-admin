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

// assets
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import MobileOutlined from '@ant-design/icons/MobileOutlined';
import SendOutlined from '@ant-design/icons/SendOutlined';

// project imports
import MainCard from 'components/MainCard';
import {
  getTemplates,
  getNotifications,
  createTemplate,
  updateTemplate,
  deleteTemplate
} from '../../../api/notification';
import { NotificationTemplate, NotificationType } from '../../../types/notification';

function TemplatesContent() {
  const searchParams = useSearchParams();
  const initialNotifId = searchParams.get('notificationId');

  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [selectedNotifFilter, setSelectedNotifFilter] = useState<string>(initialNotifId || 'ALL');
  const [error, setError] = useState<string | null>(null);

  // Preview state
  const [previewItem, setPreviewItem] = useState<NotificationTemplate | null>(null);

  // Edit / Create Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<NotificationTemplate | null>(null);
  const [editorTab, setEditorTab] = useState<'edit' | 'preview'>('edit');
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
      setTemplates(tList);
      setNotifications(nList);
      if (initialNotifId) {
        setSelectedNotifFilter(initialNotifId);
      }
    } catch (err: any) {
      console.error('Failed to load templates:', err);
      setError('Failed to fetch templates from backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      notificationId: notifications.length > 0 ? (notifications[0].id || 0) : 0,
      channel: 'EMAIL',
      content: 'Hello {customerName},\n\nYour notification content goes here.',
      fromEmail: 'support@bsmamart.com',
      toEmail: '',
      active: true
    });
    setEditorTab('edit');
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
    setEditorTab('edit');
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(id);
        setTemplates((prev) => prev.filter((t) => t.id !== id));
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
      setTemplates((prev) => prev.map((t) => (t.id === item.id ? updated : t)));
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
      const selectedNotif = notifications.find((n) => n.id === Number(formData.notificationId));
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
        setTemplates((prev) => prev.map((t) => (t.id === editingItem.id ? updated : t)));
      } else {
        const created = await createTemplate(payload);
        setTemplates((prev) => [...prev, created]);
      }
      setOpenDialog(false);
    } catch (err: any) {
      alert('Error saving template: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchChannel = selectedChannel === 'ALL' || t.channel === selectedChannel;
      const matchNotif =
        selectedNotifFilter === 'ALL' || String(t.notification?.id) === selectedNotifFilter;
      return matchChannel && matchNotif;
    });
  }, [templates, selectedChannel, selectedNotifFilter]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Message Templates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage channel-specific bodies, dynamic placeholders, and sender defaults
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlusOutlined />}
          onClick={handleOpenCreate}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Add Template
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <MainCard content={false}>
        {/* Channel Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={selectedChannel} onChange={(_, val) => setSelectedChannel(val)}>
            <Tab label="All Channels" value="ALL" />
            <Tab icon={<MailOutlined />} iconPosition="start" label="Email" value="EMAIL" />
            <Tab icon={<MobileOutlined />} iconPosition="start" label="FCM Mobile Push" value="FCM" />
            <Tab icon={<SendOutlined />} iconPosition="start" label="SMS" value="SMS" />
          </Tabs>
        </Box>

        {/* Filter Toolbar */}
        <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              select
              size="small"
              label="Notification Type Filter"
              value={selectedNotifFilter}
              onChange={(e) => setSelectedNotifFilter(e.target.value)}
              sx={{ width: { xs: '100%', sm: 320 } }}
            >
              <MenuItem value="ALL">All Notification Types ({notifications.length})</MenuItem>
              {notifications.map((n) => (
                <MenuItem key={n.id} value={String(n.id)}>
                  {n.type} ({n.subject})
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Notification Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Channel</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>From / Sender</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filteredTemplates.length > 0 ? (
                filteredTemplates.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>#{t.id}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {t.notification?.type || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t.notification?.subject || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          t.channel === 'EMAIL' ? (
                            <MailOutlined />
                          ) : t.channel === 'FCM' ? (
                            <MobileOutlined />
                          ) : (
                            <SendOutlined />
                          )
                        }
                        label={t.channel}
                        size="small"
                        color={
                          t.channel === 'EMAIL'
                            ? 'primary'
                            : t.channel === 'FCM'
                            ? 'success'
                            : 'warning'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                      {t.fromEmail || 'Default Provider'}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={t.active !== false}
                        onChange={() => handleToggleActive(t)}
                        size="small"
                        color="success"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Preview Content">
                          <IconButton size="small" onClick={() => setPreviewItem(t)} color="info">
                            <EyeOutlined />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenEdit(t)} color="primary">
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
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
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No templates match your selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      {/* Template Preview Dialog */}
      <Dialog open={Boolean(previewItem)} onClose={() => setPreviewItem(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Template Preview: {previewItem?.notification?.type} ({previewItem?.channel})
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Subject: <strong>{previewItem?.notification?.subject}</strong> | Sender:{' '}
              <code>{previewItem?.fromEmail || 'Default'}</code>
            </Typography>
          </Box>
          <Paper variant="outlined" sx={{ p: 2, minHeight: 250, bgcolor: 'background.default', borderColor: 'divider' }}>
            {previewItem?.channel === 'EMAIL' && previewItem.content?.includes('<') ? (
              <Box
                sx={{
                  bgcolor: '#ffffff',
                  color: '#1f2937',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid #e5e7eb'
                }}
                dangerouslySetInnerHTML={{
                  __html: previewItem.content
                    .replace(/\{(\w+)\}/g, '<span style="background:#fff3cd;color:#856404;padding:2px 4px;border-radius:3px;">{$1}</span>')
                }}
              />
            ) : (
              <Typography sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }} color="text.primary">
                {previewItem?.content}
              </Typography>
            )}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewItem(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingItem ? 'Edit Message Template' : 'Create Message Template'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
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
                    {notifications.map((n) => (
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
                    <MenuItem value="EMAIL">EMAIL</MenuItem>
                    <MenuItem value="FCM">FCM Mobile Push</MenuItem>
                    <MenuItem value="SMS">SMS Gateway</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              {formData.channel === 'EMAIL' && (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="From Email (Sender)"
                      fullWidth
                      placeholder="support@bsmamart.com"
                      value={formData.fromEmail}
                      onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                      helperText="Defaults to the active ServiceProvider username"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Default CC / BCC (Optional)"
                      fullWidth
                      placeholder="admin@bsmamart.com"
                      value={formData.toEmail}
                      onChange={(e) => setFormData({ ...formData, toEmail: e.target.value })}
                    />
                  </Grid>
                </Grid>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    color="success"
                  />
                }
                label="Template Active (Receives outbound events)"
              />

              {/* Editor / Live Preview toggle */}
              <Box>
                <Tabs value={editorTab} onChange={(_, val) => setEditorTab(val)} sx={{ mb: 1.5 }}>
                  <Tab label="Template Editor" value="edit" />
                  <Tab label="Live Preview" value="preview" />
                </Tabs>

                {editorTab === 'edit' ? (
                  <Box>
                    <TextField
                      label="Template Body / Content"
                      multiline
                      rows={12}
                      fullWidth
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.875rem' } }}
                    />
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Supported placeholders:
                      </Typography>
                      <Chip label="{name}" size="small" variant="outlined" />
                      <Chip label="{orderId}" size="small" variant="outlined" />
                      <Chip label="{otp}" size="small" variant="outlined" />
                      <Chip label="{{#items}}...{{/items}}" size="small" variant="outlined" />
                    </Stack>
                  </Box>
                ) : (
                  <Paper variant="outlined" sx={{ p: 2, minHeight: 280, bgcolor: 'background.default', borderColor: 'divider' }}>
                    {formData.channel === 'EMAIL' && formData.content.includes('<') ? (
                      <Box
                        sx={{
                          bgcolor: '#ffffff',
                          color: '#1f2937',
                          p: 2,
                          borderRadius: 1,
                          border: '1px solid #e5e7eb'
                        }}
                        dangerouslySetInnerHTML={{
                          __html: formData.content.replace(/\{(\w+)\}/g, '<mark>{$1}</mark>')
                        }}
                      />
                    ) : (
                      <Typography sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }} color="text.primary">
                        {formData.content}
                      </Typography>
                    )}
                  </Paper>
                )}
              </Box>
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

export default function TemplatesPage() {
  return (
    <Suspense fallback={<Box sx={{ p: 3, textAlign: 'center' }}><CircularProgress /></Box>}>
      <TemplatesContent />
    </Suspense>
  );
}
