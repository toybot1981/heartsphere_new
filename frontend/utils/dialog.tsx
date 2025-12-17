import React, { useState, useCallback } from 'react';
import { AlertDialog, ConfirmDialog } from '../components/AlertDialog';

// 全局对话框状态管理
let alertDialogState: {
  open: boolean;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
  confirmText?: string;
} = {
  open: false,
  message: '',
  onClose: () => {}
};

let confirmDialogState: {
  open: boolean;
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
} = {
  open: false,
  message: '',
  onConfirm: () => {},
  onCancel: () => {}
};

let alertDialogSetter: React.Dispatch<React.SetStateAction<typeof alertDialogState>> | null = null;
let confirmDialogSetter: React.Dispatch<React.SetStateAction<typeof confirmDialogState>> | null = null;

// 导出对话框组件（需要在 App 根组件中渲染）
export const GlobalDialogs: React.FC = () => {
  const [alertState, setAlertState] = useState(alertDialogState);
  const [confirmState, setConfirmState] = useState(confirmDialogState);

  React.useEffect(() => {
    alertDialogSetter = setAlertState;
    confirmDialogSetter = setConfirmState;
  }, []);

  return (
    <>
      <AlertDialog
        open={alertState.open}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={alertState.onClose}
        confirmText={alertState.confirmText}
      />
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
      />
    </>
  );
};

// 替代 alert 的函数
export const showAlert = (
  message: string,
  title?: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  confirmText?: string
): Promise<void> => {
  return new Promise((resolve) => {
    if (alertDialogSetter) {
      alertDialogSetter({
        open: true,
        message,
        title,
        type,
        confirmText,
        onClose: () => {
          if (alertDialogSetter) {
            alertDialogSetter(prev => ({ ...prev, open: false }));
          }
          resolve();
        }
      });
    } else {
      // 降级到原生 alert
      alert(message);
      resolve();
    }
  });
};

// 替代 confirm 的函数
export const showConfirm = (
  message: string,
  title?: string,
  type: 'info' | 'warning' | 'danger' = 'warning',
  confirmText?: string,
  cancelText?: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (confirmDialogSetter) {
      confirmDialogState = {
        open: true,
        message,
        title,
        type,
        confirmText,
        cancelText,
        onConfirm: () => {
          if (confirmDialogSetter) {
            confirmDialogSetter(prev => ({ ...prev, open: false }));
          }
          resolve(true);
        },
        onCancel: () => {
          if (confirmDialogSetter) {
            confirmDialogSetter(prev => ({ ...prev, open: false }));
          }
          resolve(false);
        }
      };
      confirmDialogSetter(confirmDialogState);
    } else {
      // 降级到原生 confirm
      resolve(window.confirm(message));
    }
  });
};
