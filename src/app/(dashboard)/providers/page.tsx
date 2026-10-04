'use client';

import { useState, useEffect } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';

// assets
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import MobileOutlined from '@ant-design/icons/MobileOutlined';
import CloudServerOutlined from '@ant-design/icons/CloudServerOutlined';

// project imports
import MainCard from 'components/MainCard';
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider
} from '../../../api/notification';
import { ServiceProvider } from '../../../types/notification';

const APP_OPTIONS = ['E-COMMERCE', 'OAUTH-SERVER', 'FAST', 'ISSUE-TRACKER', 'GENERAL'];

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceProvider | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    channel: 'EMAIL',
    url: 'smtp.gmail.com',
    port: 587,
    username: 'support@bsmamart.com',
    password: '',
    headers: 'BSMA Mart',
    applicationId: 'E-COMMERCE',
    active: true
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProviders();
      setProviders(data);
    } catch (err: any) {
      console.error('Failed to load service providers:', err);
      setError('Failed to fetch service providers from backend service.');
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
      id: '',
      channel: 'EMAIL',
      url: 'smtp.gmail.com',
      port: 587,
      username: 'support@bsmamart.com',
      password: '',
      headers: 'BSMA Mart',
      applicationId: 'E-COMMERCE',
      active: true
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (item: ServiceProvider) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      channel: item.channel || 'EMAIL',
      url: item.url || '',
      port: item.port || 587,
      username: item.username || '',
      password: '',
      headers: item.headers || '',
      applicationId: item.applicationId || 'E-COMMERCE',
      active: item.active !== false
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete service provider ${id}?`)) {
      try {
        await deleteProvider(id);
        setProviders((prev) => prev.filter((p) => p.id !== id));
      } catch (err: any) {
        alert('Failed to delete service provider: ' + err.message);
      }
    }
  };

  const handleToggleActive = async (item: ServiceProvider) => {
    try {
      const updated = await updateProvider(item.id, {
        ...item,
        active: !item.active
      });
      setProviders((prev) => prev.map((p) => (p.id === item.id ? updated : p)));
    } catch (err: any) {
      alert('Failed to update active state: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.url.trim()) {
      alert('Provider ID and Host URL are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        const updated = await updateProvider(editingItem.id, formData);
        setProviders((prev) => prev.map((p) => (p.id === editingItem.id ? updated : p)));
      } else {
        const created = await createProvider(formData);
        setProviders((prev) => [...prev, created]);
      }
      setOpenDialog(false);
    } catch (err: any) {
      alert('Error saving provider: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Service Providers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure outbound relays, SMTP gateways, display names, and credentials per application
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlusOutlined />}
          onClick={handleOpenCreate}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Add Service Provider
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {providers.map((p) => (
            <Grid size={{ xs: 12, md: 6 }} key={p.id}>
              <MainCard
                sx={{
                  height: '100%',
                  borderLeft: `4px solid ${
                    p.channel === 'EMAIL' ? '#1890ff' : p.channel === 'FCM' ? '#52c41a' : '#fa8c16'
                  }`
                }}
              >
                <Stack spacing={2}>
                  {/* Top Bar */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '8px',
                          bgcolor: p.channel === 'EMAIL' ? '#e6f7ff' : '#f6ffed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {p.channel === 'EMAIL' ? (
                          <MailOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                        ) : p.channel === 'FCM' ? (
                          <MobileOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                        ) : (
                          <CloudServerOutlined style={{ fontSize: 20, color: '#fa8c16' }} />
                        )}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {p.id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          App: <strong>{p.applicationId}</strong>
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={p.active !== false}
                            onChange={() => handleToggleActive(p)}
                            size="small"
                            color="success"
                          />
                        }
                        label={p.active ? 'Active' : 'Disabled'}
                        sx={{ mr: 0 }}
                      />
                      <IconButton size="small" onClick={() => handleOpenEdit(p)} color="primary">
                        <EditOutlined />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(p.id)} color="error">
                        <DeleteOutlined />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* Provider Details */}
                  <Grid container spacing={1.5}>
                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary">
                        Server Host & Port
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {p.url}:{p.port || 587}
                      </Typography>
                    </Grid>

                    <Grid size={6}>
                      <Typography variant="caption" color="text.secondary">
                        Sender Display Name
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {p.headers || '—'}
                      </Typography>
                    </Grid>

                    <Grid size={12}>
                      <Typography variant="caption" color="text.secondary">
                        Username / Auth Account
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {p.username || 'None (No auth)'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 'auto', pt: 1 }}>
                    <Chip
                      label={p.channel}
                      size="small"
                      color={p.channel === 'EMAIL' ? 'primary' : 'success'}
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={p.active ? 'Live In Production' : 'Inactive'}
                      size="small"
                      color={p.active ? 'success' : 'default'}
                    />
                  </Box>
                </Stack>
              </MainCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingItem ? 'Edit Service Provider' : 'Create Service Provider'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                label="Provider ID / Code"
                required
                fullWidth
                disabled={Boolean(editingItem)}
                placeholder="e.g. BSMA_SUPPORT_MAIL, AWS_SES_RELAY"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                helperText={editingItem ? 'Provider ID cannot be renamed' : 'Unique identifier for provider lookup'}
              />

              <Grid container spacing={2}>
                <Grid size={8}>
                  <TextField
                    select
                    label="Channel Type"
                    required
                    fullWidth
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  >
                    <MenuItem value="EMAIL">EMAIL (SMTP)</MenuItem>
                    <MenuItem value="FCM">FCM Push</MenuItem>
                    <MenuItem value="SMS">SMS Gateway</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={4}>
                  <TextField
                    select
                    label="Application"
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
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={8}>
                  <TextField
                    label="Host / URL"
                    required
                    fullWidth
                    placeholder="smtp.gmail.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    label="Port"
                    type="number"
                    required
                    fullWidth
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: Number(e.target.value) })}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Sender Display Name (Stored in headers)"
                fullWidth
                placeholder="e.g. BSMA Mart or ExcellenceKits Support"
                value={formData.headers}
                onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                helperText="Controls the friendly display name: 'BSMA Mart <support@bsmamart.com>'"
              />

              <TextField
                label="Username / Email"
                fullWidth
                placeholder="support@bsmamart.com"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />

              <TextField
                label="Password / App Password"
                type="password"
                fullWidth
                placeholder={editingItem ? 'Leave blank to keep existing password' : 'Enter SMTP password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                helperText="For Google Workspace, use a 16-character App Password"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    color="success"
                  />
                }
                label="Active Provider (In Rotation)"
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
