'use client';

import { useState, useEffect } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';

// project imports
import MainCard from 'components/MainCard';
import { getMessages, MessagePageResponse } from '../../../api/notification';
import { MessageEntity } from '../../../types/notification';

export default function MessageLogsPage() {
  const [data, setData] = useState<MessagePageResponse | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail Modal
  const [selectedMessage, setSelectedMessage] = useState<MessageEntity | null>(null);

  const loadData = async (currentPage: number, currentSize: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMessages(currentPage, currentSize);
      setData(res && typeof res === 'object' && Array.isArray(res.content) ? res : { content: [], totalElements: 0, totalPages: 0, size: currentSize, number: currentPage });
    } catch (err: any) {
      console.error('Failed to load message logs:', err);
      setError('Failed to fetch message logs from backend service.');
      setData({ content: [], totalElements: 0, totalPages: 0, size: currentSize, number: currentPage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Delivery Audit Logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Immutable delivery history of all outbound emails, pushes, and in-app feed alerts
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ReloadOutlined />}
          onClick={() => loadData(page, rowsPerPage)}
          sx={{ textTransform: 'none' }}
        >
          Refresh Feed
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <MainCard content={false}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Application</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Recipient User ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Event Key</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Delivered At</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Payload</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : Array.isArray(data?.content) && data.content.length > 0 ? (
                data.content.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>#{row.id}</TableCell>
                    <TableCell>
                      <Chip label={row.app || 'GLOBAL'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                      {row.userId || 'Broadcast / N/A'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {row.messageType}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.subject || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.seen ? 'Read by user' : 'Delivered'}
                        color={row.seen ? 'default' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                      {row.time ? new Date(row.time).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Rendered Message">
                        <IconButton size="small" onClick={() => setSelectedMessage(row)} color="primary">
                          <EyeOutlined />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No delivery logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 15, 25, 50]}
          component="div"
          count={data?.totalElements || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </MainCard>

      {/* Rendered Content Modal */}
      <Dialog open={Boolean(selectedMessage)} onClose={() => setSelectedMessage(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Message Payload: #{selectedMessage?.id} - {selectedMessage?.messageType}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Application: <strong>{selectedMessage?.app}</strong> | Recipient User:{' '}
              <code>{selectedMessage?.userId || 'N/A'}</code>
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
              Subject: {selectedMessage?.subject}
            </Typography>
          </Box>
          <Paper variant="outlined" sx={{ p: 2, minHeight: 250, bgcolor: '#ffffff' }}>
            {selectedMessage?.messageContent?.includes('<') ? (
              <div dangerouslySetInnerHTML={{ __html: selectedMessage.messageContent }} />
            ) : (
              <Typography sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {selectedMessage?.messageContent}
              </Typography>
            )}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMessage(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
