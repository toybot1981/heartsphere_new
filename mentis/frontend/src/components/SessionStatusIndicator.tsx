import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';

interface SessionStatusIndicatorProps {
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED' | 'ERROR';
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

/**
 * 会话状态指示器组件
 */
export const SessionStatusIndicator: React.FC<SessionStatusIndicatorProps> = ({
  status,
  size = 'small',
  showLabel = false,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'ACTIVE':
        return {
          icon: <CircleIcon sx={{ fontSize: 12, color: 'success.main' }} />,
          color: 'success' as const,
          label: '活跃',
        };
      case 'PAUSED':
        return {
          icon: <PauseCircleIcon sx={{ fontSize: 12, color: 'warning.main' }} />,
          color: 'warning' as const,
          label: '暂停',
        };
      case 'COMPLETED':
        return {
          icon: <CheckCircleIcon sx={{ fontSize: 12, color: 'info.main' }} />,
          color: 'info' as const,
          label: '已完成',
        };
      case 'ARCHIVED':
        return {
          icon: <CircleIcon sx={{ fontSize: 12, color: 'text.secondary' }} />,
          color: 'default' as const,
          label: '已归档',
        };
      case 'ERROR':
        return {
          icon: <ErrorIcon sx={{ fontSize: 12, color: 'error.main' }} />,
          color: 'error' as const,
          label: '错误',
        };
      default:
        return {
          icon: <CircleIcon sx={{ fontSize: 12, color: 'text.secondary' }} />,
          color: 'default' as const,
          label: '未知',
        };
    }
  };

  const config = getStatusConfig();

  if (showLabel) {
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size={size}
        variant="outlined"
      />
    );
  }

  return (
    <Tooltip title={config.label}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {config.icon}
      </Box>
    </Tooltip>
  );
};
