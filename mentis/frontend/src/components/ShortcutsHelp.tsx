import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { formatShortcutForPlatform } from '../utils/keyboardShortcuts';

interface Shortcut {
  action: string;
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

interface ShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 快捷键帮助对话框
 */
export const ShortcutsHelp: React.FC<ShortcutsHelpProps> = ({ open, onClose }) => {
  const shortcuts: Shortcut[] = [
    { action: '创建新会话', key: 'n', ctrl: true },
    { action: '切换侧边栏', key: 'k', ctrl: true },
    { action: '切换到对话标签页', key: '1', ctrl: true },
    { action: '切换到任务标签页', key: '2', ctrl: true },
    { action: '切换到虚拟机标签页', key: '3', ctrl: true },
    { action: '切换到日志标签页', key: '4', ctrl: true },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyboardIcon />
          <Typography variant="h6">快捷键帮助</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>操作</TableCell>
                <TableCell align="right">快捷键</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shortcuts.map((shortcut, index) => (
                <TableRow key={index}>
                  <TableCell>{shortcut.action}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatShortcutForPlatform({
                        key: shortcut.key,
                        ctrl: shortcut.ctrl,
                        shift: shortcut.shift,
                        alt: shortcut.alt,
                        meta: shortcut.meta,
                        description: shortcut.action,
                        handler: () => {},
                      })}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
};
