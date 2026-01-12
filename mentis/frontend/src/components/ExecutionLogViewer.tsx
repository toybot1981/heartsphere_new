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
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useToast } from './Toast';

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
 * 支持日志导出（JSON、CSV、TXT）和折叠展开功能
 */
export const ExecutionLogViewer: React.FC<ExecutionLogViewerProps> = ({
  sessionId,
  logs = []
}) => {
  const [searchText, setSearchText] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [taskFilter, setTaskFilter] = useState<string>('ALL');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const toast = useToast();

  const getLevelColor = (level: string): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
    switch (level) {
      case 'ERROR':
        return 'error';
      case 'WARN':
        return 'warning';
      case 'INFO':
        return 'primary';
      case 'DEBUG':
        return 'default';
      default:
        return 'default';
    }
  };

  const getLevelBgColor = (level: string): string => {
    switch (level) {
      case 'ERROR':
        return 'error.light';
      case 'WARN':
        return 'warning.light';
      case 'INFO':
        return 'info.light';
      case 'DEBUG':
        return 'grey.100';
      default:
        return 'grey.100';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchText === '' || 
      log.message.toLowerCase().includes(searchText.toLowerCase());
    const matchesLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchesTask = taskFilter === 'ALL' || log.taskId === taskFilter;
    return matchesSearch && matchesLevel && matchesTask;
  });

  const toggleLogExpand = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const isLongMessage = (message: string) => {
    return message.length > 200 || message.includes('\n');
  };

  const truncateMessage = (message: string, maxLength: number = 200) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  // 日志导出
  const handleExportLogs = (format: 'json' | 'csv' | 'txt') => {
    if (filteredLogs.length === 0) {
      toast.showWarning('没有日志可导出');
      return;
    }

    let content = '';
    let filename = `mentis-logs-${sessionId}-${Date.now()}`;

    if (format === 'json') {
      content = JSON.stringify(
        filteredLogs.map(log => ({
          id: log.id,
          level: log.level,
          message: log.message,
          timestamp: formatDate(log.timestamp),
          taskId: log.taskId,
        })),
        null,
        2
      );
      filename += '.json';
    } else if (format === 'csv') {
      const headers = ['ID', '级别', '时间', '任务ID', '消息'];
      const rows = filteredLogs.map(log => [
        log.id,
        log.level,
        formatDate(log.timestamp),
        log.taskId || '',
        `"${log.message.replace(/"/g, '""')}"`,
      ]);
      content = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      filename += '.csv';
    } else {
      content = filteredLogs
        .map(log => `[${formatDate(log.timestamp)}] ${log.level} ${log.taskId ? `[任务: ${log.taskId}]` : ''}\n${log.message}`)
        .join('\n\n');
      filename += '.txt';
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.showSuccess(`日志已导出为 ${format.toUpperCase()} (${filteredLogs.length} 条)`);
    setExportDialogOpen(false);
  };

  // 高亮搜索文本
  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={index} style={{ backgroundColor: '#ffeb3b', padding: '2px 0' }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          执行日志 ({logs.length})
        </Typography>
        <Tooltip title="导出日志">
          <IconButton onClick={() => setExportDialogOpen(true)}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      </Box>

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
            {Array.from(new Set(logs.map(log => log.taskId).filter(Boolean))).map(taskId => (
              <MenuItem key={taskId} value={taskId}>
                {taskId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {filteredLogs.length > 0 && (
        <Chip
          label={`显示 ${filteredLogs.length} / ${logs.length} 条日志`}
          size="small"
          sx={{ mb: 2 }}
        />
      )}

      {/* 日志列表 */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
        }}
      >
        {filteredLogs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {searchText || levelFilter !== 'ALL' || taskFilter !== 'ALL' 
                ? '未找到匹配的日志' 
                : '暂无日志'}
            </Typography>
            {(searchText || levelFilter !== 'ALL' || taskFilter !== 'ALL') && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                尝试调整过滤条件
              </Typography>
            )}
          </Box>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogs.has(log.id);
            const shouldTruncate = isLongMessage(log.message);
            const displayMessage = isExpanded || !shouldTruncate ? log.message : truncateMessage(log.message);

            return (
              <Card
                key={log.id}
                sx={{
                  mb: 1,
                  backgroundColor: getLevelBgColor(log.level),
                  '&:hover': {
                    backgroundColor: getLevelBgColor(log.level),
                    opacity: 0.9,
                  },
                }}
              >
                <CardContent sx={{ pb: '12px !important', pt: '12px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Chip
                      label={log.level}
                      color={getLevelColor(log.level)}
                      size="small"
                      sx={{ minWidth: 70, fontWeight: 'bold' }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(log.timestamp)}
                        </Typography>
                        {log.taskId && (
                          <Chip
                            label={`任务: ${log.taskId}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          lineHeight: 1.6,
                        }}
                      >
                        {highlightText(displayMessage, searchText)}
                      </Typography>
                      {shouldTruncate && (
                        <Button
                          size="small"
                          startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          onClick={() => toggleLogExpand(log.id)}
                          sx={{ mt: 0.5, p: 0, minWidth: 'auto' }}
                        >
                          {isExpanded ? '收起' : '展开'}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>

      {/* 导出对话框 */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>导出日志</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            选择导出格式 (共 {filteredLogs.length} 条日志)
          </Typography>
          <Stack spacing={1}>
            <Button variant="outlined" onClick={() => handleExportLogs('json')} startIcon={<DownloadIcon />}>
              导出为 JSON
            </Button>
            <Button variant="outlined" onClick={() => handleExportLogs('csv')} startIcon={<DownloadIcon />}>
              导出为 CSV
            </Button>
            <Button variant="outlined" onClick={() => handleExportLogs('txt')} startIcon={<DownloadIcon />}>
              导出为 TXT
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>取消</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
