import React, { useState, useCallback } from 'react';

// 简化的对话框状态管理（不依赖外部组件，使用原生 alert/confirm）
// 如果需要更复杂的 UI，可以后续替换为自定义组件

// 全局对话框状态管理
let alertDialogState: {
  open: boolean;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'danger';
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

  // 如果设置了对话框状态，使用原生 alert/confirm 作为降级方案
  // 后续可以替换为自定义 UI 组件
  return null;
};

// 替代 alert 的函数
export const showAlert = (
  message: string,
  title?: string,
  type: 'info' | 'success' | 'warning' | 'error' | 'danger' = 'info',
  confirmText?: string,
  autoClose?: number // 自动关闭时间（毫秒），如果提供则会在指定时间后自动关闭
): Promise<void> => {
  // 将 'danger' 映射为 'error' 以匹配 alertDialogState 的类型
  const alertType = type === 'danger' ? 'error' : type;
  return new Promise((resolve) => {
    if (alertDialogSetter) {
      let timeoutId: NodeJS.Timeout | null = null;
      
      const closeDialog = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (alertDialogSetter) {
          alertDialogSetter(prev => ({ ...prev, open: false }));
        }
        resolve();
      };
      
      alertDialogSetter({
        open: true,
        message,
        title,
        type: alertType,
        confirmText,
        onClose: closeDialog
      });
      
      // 如果设置了自动关闭时间，则在指定时间后自动关闭
      if (autoClose && autoClose > 0) {
        timeoutId = setTimeout(() => {
          closeDialog();
        }, autoClose);
      }
    } else {
      // 降级到原生 alert
      alert(title ? `${title}\n\n${message}` : message);
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
      resolve(window.confirm(title ? `${title}\n\n${message}` : message));
    }
  });
};
