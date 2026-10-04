'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// material-ui
import Box from '@mui/material/Box';
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

// assets
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';

// project imports
import MainCard from 'components/MainCard';
import {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification
} from '../../../api/notification';
import { NotificationType } from '../../../types/notification';

const APP_OPTIONS = ['E-COMMERCE', 'OAUTH-SERVER', 'FAST', 'ISSUE-TRACKER', 'GENERAL'];

export default function NotificationsPage() {
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
      setNotifications(data);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setError('Failed to fetch notification types from backend service.');
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
      type: '',
      subject: '',
      description: '',
      applicationId: 'E-COMMERCE'
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
        setNotifications((prev) => prev.filter((n) => n.id !== id));
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
        setNotifications((prev) => prev.map((n) => (n.id === editingItem.id ? updated : n)));
      } else {
        const created = await createNotification(formData);
        setNotifications((prev) => [...prev, created]);
      }
      setOpenDialog(false);
    } catch (err: any) {
      alert('Error saving notification: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    const matchesSearch =
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesApp = selectedApp === 'ALL' || item.applicationId === selectedApp;
    return matchesSearch && matchesApp;
  });

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Notification Types
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registered notification events across all applications and services
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlusOutlined />}
          onClick={handleOpenCreate}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Add Notification Type
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <MainCard content={false}>
        {/* Filters */}
        <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search by type, subject, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: '100%', sm: 320 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              select
              size="small"
              label="Application Filter"
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              sx={{ width: { xs: '100%', sm: 200 } }}
            >
              <MenuItem value="ALL">All Applications</MenuItem>
              {APP_OPTIONS.map((app) => (
                <MenuItem key={app} value={app}>
                  {app}
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
                <TableCell sx={{ fontWeight: 600 }}>Event Key / Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Default Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Application</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
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
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>#{item.id}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                        {item.type}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.applicationId || 'GLOBAL'}
                        size="small"
                        color={
                          item.applicationId === 'E-COMMERCE'
                            ? 'primary'
                            : item.applicationId === 'OAUTH-SERVER'
                            ? 'secondary'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                      {item.description || '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View Templates">
                          <IconButton
                            size="small"
                            component={Link}
                            href={`/templates?notificationId=${item.id}`}
                            color="info"
                          >
                            <FileTextOutlined />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenEdit(item)} color="primary">
                            <EditOutlined />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
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
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No notification types match your filter criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingItem ? 'Edit Notification Type' : 'Create Notification Type'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="Event Key / Type"
                required
                fullWidth
                placeholder="e.g. ORDER_CONFIRMED, OTP_EMAIL"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                helperText="Unique uppercase identifier used in code by producers"
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
                select
                label="Target Application"
                required
                fullWidth
                value={formData.applicationId}
                onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
              >
                {APP_OPTIONS.map((app) => (
                  <MenuItem key={app} value={app}>
                    {app}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Description"
                multiline
                rows={2}
                fullWidth
                placeholder="Optional internal notes about when this notification is triggered"
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
