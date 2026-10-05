'use client';

import { useState, useEffect } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';

// assets
import SendOutlined from '@ant-design/icons/SendOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';

// project imports
import MainCard from 'components/MainCard';
import { getNotifications, publishNotification } from '../../../api/notification';
import { NotificationType } from '../../../types/notification';

export default function TestSendPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedType, setSelectedType] = useState('');
  const [targetApp, setTargetApp] = useState('E-COMMERCE');
  const [recipientEmail, setRecipientEmail] = useState('support@bsmamart.com');
  const [recipientUserId, setRecipientUserId] = useState('1001');
  const [mobileNumber, setMobileNumber] = useState('');
  const [fcmToken, setFcmToken] = useState('');
  const [placeholdersJson, setPlaceholdersJson] = useState(
    JSON.stringify(
      {
        customerName: 'Mustafa',
        orderId: 'ORD-98214',
        totalAmount: '$150.00',
        items: [
          { name: 'Wireless Headphones', qty: 1, price: '$120.00' },
          { name: 'USB-C Cable', qty: 1, price: '$30.00' }
        ]
      },
      null,
      2
    )
  );

  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true);
        const data = await getNotifications();
        const safeData = Array.isArray(data) ? data : [];
        setNotifications(safeData);
        if (safeData.length > 0) {
          setSelectedType(safeData[0].type);
          setTargetApp(safeData[0].applicationId || 'E-COMMERCE');
        }
      } catch (err: any) {
        console.error('Failed to load notification types:', err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  const handleTypeChange = (typeStr: string) => {
    setSelectedType(typeStr);
    const safeList = Array.isArray(notifications) ? notifications : [];
    const found = safeList.find((n) => n?.type === typeStr);
    if (found?.applicationId) {
      setTargetApp(found.applicationId);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendSuccess(null);
    setSendError(null);

    let parsedPlaceholders: Record<string, any> = {};
    try {
      if (placeholdersJson.trim()) {
        parsedPlaceholders = JSON.parse(placeholdersJson);
      }
    } catch {
      setSendError('Placeholders JSON is invalid. Please check syntax.');
      return;
    }

    try {
      setSending(true);
      await publishNotification({
        notificationType: selectedType,
        applicationId: targetApp,
        userId: recipientUserId || undefined,
        toEmail: recipientEmail ? [recipientEmail] : undefined,
        mobileNumber: mobileNumber || undefined,
        fcmToken: fcmToken || undefined,
        placeholders: parsedPlaceholders
      });
      setSendSuccess(`Notification "${selectedType}" successfully dispatched to ${recipientEmail}!`);
    } catch (err: any) {
      setSendError(err.response?.data?.message || err.message || 'Failed to dispatch notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Interactive Dispatch Sandbox
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Trigger live outbound notifications (Email / FCM / SMS) and verify real-time template rendering
        </Typography>
      </Box>

      {sendSuccess && (
        <Alert icon={<CheckCircleOutlined />} severity="success" sx={{ mb: 3 }}>
          {sendSuccess}
        </Alert>
      )}

      {sendError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {sendError}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <MainCard title="Dispatch Configuration">
            <form onSubmit={handleSend}>
              <Stack spacing={2.5}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField
                      select
                      label="Select Notification Event"
                      required
                      fullWidth
                      value={selectedType}
                      onChange={(e) => handleTypeChange(e.target.value)}
                    >
                      {loading ? (
                        <MenuItem value="">Loading types...</MenuItem>
                      ) : (
                        (Array.isArray(notifications) ? notifications : []).map((n) => (
                          <MenuItem key={n.id} value={n.type}>
                            {n.type} — {n.subject}
                          </MenuItem>
                        ))
                      )}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Application ID"
                      fullWidth
                      value={targetApp}
                      onChange={(e) => setTargetApp(e.target.value)}
                      helperText="Target tenant"
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 7 }}>
                    <TextField
                      label="Recipient Email Address"
                      required
                      type="email"
                      fullWidth
                      placeholder="e.g. user@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      InputProps={{
                        startAdornment: <MailOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 5 }}>
                    <TextField
                      label="User ID (In-App Feed)"
                      fullWidth
                      placeholder="e.g. 10042"
                      value={recipientUserId}
                      onChange={(e) => setRecipientUserId(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Mobile Number (SMS)"
                      fullWidth
                      placeholder="+971501234567"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="FCM Device Token (Mobile Push)"
                      fullWidth
                      placeholder="Firebase Cloud Messaging device token"
                      value={fcmToken}
                      onChange={(e) => setFcmToken(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Payload Placeholders (JSON Object)
                  </Typography>
                  <TextField
                    multiline
                    rows={8}
                    fullWidth
                    value={placeholdersJson}
                    onChange={(e) => setPlaceholdersJson(e.target.value)}
                    InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.8125rem' } }}
                    helperText="Key-value pairs replaced inside {key} and {{#key}} blocks in templates"
                  />
                </Box>

                <Box sx={{ pt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={sending}
                    startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <SendOutlined />}
                    sx={{ textTransform: 'none', fontWeight: 700, px: 4 }}
                  >
                    {sending ? 'Dispatching...' : 'Send Live Notification'}
                  </Button>
                </Box>
              </Stack>
            </form>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <MainCard title="Sandbox Guide & Tips">
            <Stack spacing={2.5}>
              <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default', borderColor: 'divider', borderRadius: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  Multi-Channel Broadcast
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  When you trigger an event (e.g. <code>CUSTOMER_ORDER_PLACED</code>), the service automatically
                  dispatches to <strong>all active channel templates</strong> linked to it (Email, Push, SMS) and
                  records a message in the in-app notification center.
                </Typography>
              </Card>

              <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default', borderColor: 'divider', borderRadius: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main', mb: 0.5 }}>
                  Placeholders Syntax
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  - <strong>Single values:</strong> <code>{'{customerName}'}</code>, <code>{'{orderId}'}</code><br />
                  - <strong>Repeating lists:</strong> <code>{'{{#items}} {{name}} - {{price}} {{/items}}'}</code>
                </Typography>
              </Card>

              <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default', borderColor: 'divider', borderRadius: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'secondary.main', mb: 0.5 }}>
                  Email Deliverability Notice
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Outgoing emails are routed through the active SMTP relay configured in <strong>Service Providers</strong>.
                  Sender name and Message-ID are automatically formatted to avoid spam filtering.
                </Typography>
              </Card>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}
