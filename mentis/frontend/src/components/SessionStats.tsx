import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MessageIcon from '@mui/icons-material/Message';

interface SessionStatsProps {
  messageCount?: number;
  taskCount?: number;
  lastActiveAt?: string;
  duration?: number; // 执行时间（秒）
}

/**
 * 会话统计信息组件
 */
export const SessionStats: React.FC<SessionStatsProps> = ({
  messageCount = 0,
  taskCount = 0,
  lastActiveAt,
  duration,
}) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0秒';
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`;
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
        会话统计
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MessageIcon fontSize="small" color="primary" />
          <Box>
            <Typography variant="caption" color="text.secondary">
              消息数
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {messageCount}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon fontSize="small" color="secondary" />
          <Box>
            <Typography variant="caption" color="text.secondary">
              任务数
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {taskCount}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">
              执行时间
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {formatDuration(duration)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChatIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary">
              最后活跃
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {formatDate(lastActiveAt)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
