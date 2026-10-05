'use client';

import React, { useRef, useState, useEffect } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Menu from '@mui/material/Menu';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { useTheme, alpha } from '@mui/material/styles';

// assets
import BoldOutlined from '@ant-design/icons/BoldOutlined';
import ItalicOutlined from '@ant-design/icons/ItalicOutlined';
import UnderlineOutlined from '@ant-design/icons/UnderlineOutlined';
import StrikethroughOutlined from '@ant-design/icons/StrikethroughOutlined';
import AlignLeftOutlined from '@ant-design/icons/AlignLeftOutlined';
import AlignCenterOutlined from '@ant-design/icons/AlignCenterOutlined';
import AlignRightOutlined from '@ant-design/icons/AlignRightOutlined';
import UnorderedListOutlined from '@ant-design/icons/UnorderedListOutlined';
import OrderedListOutlined from '@ant-design/icons/OrderedListOutlined';
import LinkOutlined from '@ant-design/icons/LinkOutlined';
import CodeOutlined from '@ant-design/icons/CodeOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import UndoOutlined from '@ant-design/icons/UndoOutlined';
import RedoOutlined from '@ant-design/icons/RedoOutlined';
import FontColorsOutlined from '@ant-design/icons/FontColorsOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';

interface HtmlTemplateEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholders?: string[];
  minHeight?: number;
}

const DEFAULT_PLACEHOLDERS = [
  '{customerName}',
  '{orderId}',
  '{totalAmount}',
  '{otp}',
  '{date}',
  '{items}',
  '{{#items}}...{{/items}}'
];

export default function HtmlTemplateEditor({
  value,
  onChange,
  placeholders = DEFAULT_PLACEHOLDERS,
  minHeight = 280
}: HtmlTemplateEditorProps) {
  const theme = useTheme();
  const [editorMode, setEditorMode] = useState<'visual' | 'code' | 'preview'>('visual');
  const visualEditorRef = useRef<HTMLDivElement>(null);
  const isUpdatingFromProps = useRef(false);

  // Link Dialog State
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const savedSelection = useRef<Range | null>(null);

  // Color Menu State
  const [colorAnchor, setColorAnchor] = useState<null | HTMLElement>(null);

  // Synchronize incoming value into contentEditable when in visual mode
  useEffect(() => {
    if (editorMode === 'visual' && visualEditorRef.current) {
      if (visualEditorRef.current.innerHTML !== value) {
        isUpdatingFromProps.current = true;
        visualEditorRef.current.innerHTML = value || '';
        isUpdatingFromProps.current = false;
      }
    }
  }, [value, editorMode]);

  const handleVisualInput = () => {
    if (isUpdatingFromProps.current) return;
    if (visualEditorRef.current) {
      const html = visualEditorRef.current.innerHTML;
      onChange(html);
    }
  };

  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    if (editorMode !== 'visual') return;
    document.execCommand(cmd, false, val);
    if (visualEditorRef.current) {
      visualEditorRef.current.focus();
      handleVisualInput();
    }
  };

  const handleSaveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const handleRestoreSelection = () => {
    if (savedSelection.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelection.current);
      }
    }
  };

  const handleOpenLinkDialog = () => {
    handleSaveSelection();
    const sel = window.getSelection();
    setLinkText(sel ? sel.toString() : '');
    setLinkUrl('https://');
    setLinkDialogOpen(true);
  };

  const handleApplyLink = () => {
    handleRestoreSelection();
    if (linkUrl) {
      if (linkText) {
        document.execCommand(
          'insertHTML',
          false,
          `<a href="${linkUrl}" target="_blank" style="color: #1890ff; text-decoration: underline;">${linkText}</a>`
        );
      } else {
        execCmd('createLink', linkUrl);
      }
      handleVisualInput();
    }
    setLinkDialogOpen(false);
  };

  const handleInsertPlaceholder = (placeholder: string) => {
    if (editorMode === 'visual') {
      if (visualEditorRef.current) {
        visualEditorRef.current.focus();
        document.execCommand(
          'insertHTML',
          false,
          `<span style="background-color: ${alpha(theme.palette.primary.main, 0.12)}; color: ${
            theme.palette.primary.main
          }; font-weight: 600; padding: 1px 5px; border-radius: 4px; font-family: monospace;">${placeholder}</span>&nbsp;`
        );
        handleVisualInput();
      }
    } else if (editorMode === 'code') {
      onChange((value || '') + placeholder);
    }
  };

  const handleInsertButton = () => {
    if (editorMode === 'visual') {
      if (visualEditorRef.current) {
        visualEditorRef.current.focus();
        const btnHtml = `<table border="0" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
  <tr>
    <td align="center" style="border-radius: 6px; background-color: #1890ff;">
      <a href="https://bsmamart.com" target="_blank" style="font-size: 14px; font-family: sans-serif; color: #ffffff; text-decoration: none; border-radius: 6px; padding: 10px 20px; border: 1px solid #1890ff; display: inline-block; font-weight: bold;">
        View Order Details
      </a>
    </td>
  </tr>
</table><p><br/></p>`;
        document.execCommand('insertHTML', false, btnHtml);
        handleVisualInput();
      }
    } else {
      onChange((value || '') + '\n' + `<a href="#" style="background:#1890ff;color:#fff;padding:10px 18px;border-radius:4px;text-decoration:none;display:inline-block;">Action Button</a>\n`);
    }
  };

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
      {/* Top Header / Mode Switcher */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        spacing={1}
        sx={{
          p: 1.25,
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <ToggleButtonGroup
          value={editorMode}
          exclusive
          onChange={(_, newMode) => newMode && setEditorMode(newMode)}
          size="small"
        >
          <ToggleButton value="visual" sx={{ textTransform: 'none', px: 1.5, py: 0.5, gap: 0.75 }}>
            <EditOutlined />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Visual Editor
            </Typography>
          </ToggleButton>
          <ToggleButton value="code" sx={{ textTransform: 'none', px: 1.5, py: 0.5, gap: 0.75 }}>
            <CodeOutlined />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              HTML Source
            </Typography>
          </ToggleButton>
          <ToggleButton value="preview" sx={{ textTransform: 'none', px: 1.5, py: 0.5, gap: 0.75 }}>
            <EyeOutlined />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Preview
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="outlined"
            onClick={handleInsertButton}
            sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.5 }}
          >
            + CTA Button
          </Button>
        </Stack>
      </Stack>

      {/* Visual Toolbar (Only shown in visual mode) */}
      {editorMode === 'visual' && (
        <Box
          sx={{
            p: 0.75,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.5,
            alignItems: 'center'
          }}
        >
          <Tooltip title="Undo">
            <IconButton size="small" onClick={() => execCmd('undo')}>
              <UndoOutlined style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton size="small" onClick={() => execCmd('redo')}>
              <RedoOutlined style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Bold">
            <IconButton size="small" onClick={() => execCmd('bold')}>
              <BoldOutlined style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton size="small" onClick={() => execCmd('italic')}>
              <ItalicOutlined style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton size="small" onClick={() => execCmd('underline')}>
              <UnderlineOutlined style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Strikethrough">
            <IconButton size="small" onClick={() => execCmd('strikeThrough')}>
              <StrikethroughOutlined style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Heading 1">
            <IconButton size="small" onClick={() => execCmd('formatBlock', '<h1>')}>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                H1
              </Typography>
            </IconButton>
          </Tooltip>
          <Tooltip title="Heading 2">
            <IconButton size="small" onClick={() => execCmd('formatBlock', '<h2>')}>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                H2
              </Typography>
            </IconButton>
          </Tooltip>
          <Tooltip title="Paragraph">
            <IconButton size="small" onClick={() => execCmd('formatBlock', '<p>')}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                ¶
              </Typography>
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Align Left">
            <IconButton size="small" onClick={() => execCmd('justifyLeft')}>
              <AlignLeftOutlined style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Center">
            <IconButton size="small" onClick={() => execCmd('justifyCenter')}>
              <AlignCenterOutlined style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Right">
            <IconButton size="small" onClick={() => execCmd('justifyRight')}>
              <AlignRightOutlined style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Bullet List">
            <IconButton size="small" onClick={() => execCmd('insertUnorderedList')}>
              <UnorderedListOutlined style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton size="small" onClick={() => execCmd('insertOrderedList')}>
              <OrderedListOutlined style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Text Color">
            <IconButton size="small" onClick={(e) => setColorAnchor(e.currentTarget)}>
              <FontColorsOutlined style={{ fontSize: 14, color: theme.palette.primary.main }} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={colorAnchor}
            open={Boolean(colorAnchor)}
            onClose={() => setColorAnchor(null)}
          >
            <Box sx={{ p: 1.5, display: 'grid', gridTemplateColumns: 'repeat(5, 24px)', gap: 1 }}>
              {['#000000', '#434343', '#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#faad14'].map(
                (c) => (
                  <Box
                    key={c}
                    onClick={() => {
                      execCmd('foreColor', c);
                      setColorAnchor(null);
                    }}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: c,
                      cursor: 'pointer',
                      border: '2px solid #fff',
                      boxShadow: '0 0 0 1px #d9d9d9',
                      '&:hover': { transform: 'scale(1.2)' }
                    }}
                  />
                )
              )}
            </Box>
          </Menu>

          <Tooltip title="Insert Link">
            <IconButton size="small" onClick={handleOpenLinkDialog}>
              <LinkOutlined style={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Divider Line">
            <IconButton size="small" onClick={() => execCmd('insertHorizontalRule')}>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                —
              </Typography>
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Formatting">
            <IconButton size="small" onClick={() => execCmd('removeFormat')}>
              <Typography variant="caption" sx={{ textDecoration: 'line-through' }}>
                Tx
              </Typography>
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Placeholder Chips Bar */}
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 0.75
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>
          Insert Variable:
        </Typography>
        {placeholders.map((p) => (
          <Chip
            key={p}
            label={p}
            size="small"
            clickable
            onClick={() => handleInsertPlaceholder(p)}
            variant="outlined"
            color="primary"
            sx={{
              height: 22,
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              bgcolor: 'background.paper',
              cursor: 'pointer'
            }}
          />
        ))}
      </Box>

      {/* Editor Body Area */}
      <Box sx={{ p: 2, minHeight }}>
        {editorMode === 'visual' && (
          <Box
            ref={visualEditorRef}
            contentEditable
            onInput={handleVisualInput}
            onBlur={handleVisualInput}
            sx={{
              minHeight,
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: '0.925rem',
              lineHeight: 1.6,
              color: 'text.primary',
              '& a': { color: 'primary.main', textDecoration: 'underline' },
              '& p': { my: 1 },
              '& h1, & h2, & h3': { my: 1.5 },
              '& ul, & ol': { pl: 3, my: 1 }
            }}
          />
        )}

        {editorMode === 'code' && (
          <TextField
            multiline
            fullWidth
            minRows={12}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="<html><body>Enter raw HTML template code here...</body></html>"
            InputProps={{
              sx: {
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                bgcolor: 'background.default'
              }
            }}
          />
        )}

        {editorMode === 'preview' && (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              minHeight,
              bgcolor: '#ffffff',
              color: '#1f2937',
              borderRadius: 1.5,
              border: '1px solid #e5e7eb'
            }}
          >
            <Box
              dangerouslySetInnerHTML={{
                __html: (value || '<p><em>Template is empty</em></p>').replace(
                  /\{(\w+)\}/g,
                  '<span style="background-color: #fff3cd; color: #856404; font-weight: bold; padding: 2px 5px; border-radius: 3px;">{$1}</span>'
                )
              }}
            />
          </Paper>
        )}
      </Box>

      {/* Insert Link Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Insert Hyperlink</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Link Text (optional)"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              fullWidth
              size="small"
              placeholder="Click here"
            />
            <TextField
              label="Destination URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              fullWidth
              size="small"
              placeholder="https://bsmamart.com/orders"
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleApplyLink} variant="contained" color="primary">
            Insert Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
