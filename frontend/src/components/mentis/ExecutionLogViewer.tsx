import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface LogEntry {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  timestamp: Date;
  taskId?: string;
}

interface ExecutionLogViewerProps {
  sessionId: string;
  logs: LogEntry[];
}

/**
 * 执行日志查看器组件
 */
export const ExecutionLogViewer: React.FC<ExecutionLogViewerProps> = ({
  sessionId,
  logs = []
}) => {
  const [searchText, setSearchText] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [taskFilter, setTaskFilter] = useState<string>('ALL');

  const getLevelColor = (level: string): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
    switch (level) {
      case 'ERROR':
        return 'error';
      case 'WARN':
        return 'warning';
      case 'INFO':
        return 'primary';
      default:
        return 'default';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchText === '' || 
      log.message.toLowerCase().includes(searchText.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchesTask = taskFilter === 'ALL' || log.taskId === taskFilter;
    return matchesSearch && matchesLevel && matchesTask;
  });

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        执行日志
      </Typography>

      {/* 过滤控件 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="搜索日志..."
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ flex: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>级别</InputLabel>
          <Select
            value={levelFilter}
            label="级别"
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <MenuItem value="ALL">全部</MenuItem>
            <MenuItem value="ERROR">错误</MenuItem>
            <MenuItem value="WARN">警告</MenuItem>
            <MenuItem value="INFO">信息</MenuItem>
            <MenuItem value="DEBUG">调试</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>任务</InputLabel>
          <Select
            value={taskFilter}
            label="任务"
            onChange={(e) => setTaskFilter(e.target.value)}
          >
            <MenuItem value="ALL">全部</MenuItem>
            {/* TODO: 动态加载任务列表 */}
          </Select>
        </FormControl>
      </Box>

      {/* 日志列表 */}
      <Box
        sx={{
          maxHeight: '500px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.875rem'
        }}
      >
        {filteredLogs.map((log) => (
          <Box
            key={log.id}
            sx={{
              py: 0.5,
              px: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={log.level}
                color={getLevelColor(log.level)}
                size="small"
                sx={{ minWidth: 60 }}
              />
              <Typography variant="caption" color="text.secondary">
                {log.timestamp.toLocaleString()}
              </Typography>
              {log.taskId && (
                <Typography variant="caption" color="text.secondary">
                  [任务: {log.taskId}]
                </Typography>
              )}
            </Box>
            <Typography variant="body2" sx={{ mt: 0.5, ml: 1 }}>
              {log.message}
            </Typography>
          </Box>
        ))}
        {filteredLogs.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            暂无日志
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
