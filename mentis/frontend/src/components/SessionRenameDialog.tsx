import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

interface SessionRenameDialogProps {
  open: boolean;
  currentTitle: string;
  onClose: () => void;
  onConfirm: (newTitle: string) => void;
}

/**
 * 会话重命名对话框
 */
export const SessionRenameDialog: React.FC<SessionRenameDialogProps> = ({
  open,
  currentTitle,
  onClose,
  onConfirm,
}) => {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    if (open) {
      setTitle(currentTitle);
    }
  }, [open, currentTitle]);

  const handleConfirm = () => {
    if (title.trim()) {
      onConfirm(title.trim());
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      disableEnforceFocus={false}
      disableAutoFocus={false}
      disableRestoreFocus={false}
    >
      <DialogTitle>重命名会话</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="会话名称"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleConfirm();
            }
          }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleConfirm} variant="contained" disabled={!title.trim()}>
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
};
