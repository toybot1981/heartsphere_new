/**
 * 传送确认对话框
 * 在传送前确认用户意图
 */

import React from 'react';
import { ConfirmDialog } from '../AlertDialog';

interface TeleportationConfirmDialogProps {
  open: boolean;
  portalName: string;
  targetHeartsphereName?: string;
  targetOwnerName?: string;
  skipAnimation?: boolean;
  onConfirm: (skipAnimation?: boolean) => void;
  onCancel: () => void;
}

/**
 * 传送确认对话框
 */
export const TeleportationConfirmDialog: React.FC<TeleportationConfirmDialogProps> = ({
  open,
  portalName,
  targetHeartsphereName,
  targetOwnerName,
  skipAnimation = false,
  onConfirm,
  onCancel,
}) => {
  const message = targetHeartsphereName
    ? `确定要通过「${portalName}」传送到「${targetHeartsphereName}」${targetOwnerName ? `（${targetOwnerName}的心域）` : ''}吗？`
    : `确定要通过「${portalName}」传送吗？`;

  const handleConfirm = () => {
    onConfirm(skipAnimation);
  };

  return (
    <ConfirmDialog
      open={open}
      title="传送确认"
      message={message}
      type="info"
      onConfirm={handleConfirm}
      onCancel={onCancel}
      confirmText="传送"
      cancelText="取消"
    />
  );
};
