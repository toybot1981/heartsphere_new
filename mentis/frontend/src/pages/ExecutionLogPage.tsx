import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ExecutionLogViewer } from '../components/ExecutionLogViewer';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  taskId?: string;
}

/**
 * 执行日志页面
 */
export const ExecutionLogPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // 模拟加载日志数据
    // 实际应该从 API 获取
    // 注意：ExecutionLogViewer 期望的 LogEntry 类型需要 timestamp 是 Date 类型
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date(),
        level: 'INFO' as const,
        message: '会话已创建',
        taskId: undefined
      },
      {
        id: '2',
        timestamp: new Date(),
        level: 'INFO' as const,
        message: '任务开始执行',
        taskId: 'task-1'
      }
    ];
    setLogs(mockLogs);
  }, [sessionId]);

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">执行日志</Typography>
          {sessionId && (
            <Typography variant="body2" color="text.secondary">
              会话: {sessionId}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <ExecutionLogViewer sessionId={sessionId || ''} logs={logs} />
      </Box>
    </Box>
  );
};
