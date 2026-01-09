import React from 'react';
import { Box, Paper, Typography, Chip, LinearProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Task as TaskType } from '../../services/mentis/mentisApi';

interface Task extends TaskType {
  progress?: number;
}

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

/**
 * 任务列表组件
 */
export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon color="success" />;
      case 'FAILED':
        return <ErrorIcon color="error" />;
      default:
        return <ScheduleIcon color="action" />;
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'RUNNING':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        任务列表
      </Typography>
      {tasks.map((task) => (
        <Paper
          key={task.id}
          sx={{
            p: 2,
            mb: 2,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
          onClick={() => onTaskClick?.(task)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {getStatusIcon(task.status)}
            <Typography variant="subtitle1" sx={{ ml: 1, flex: 1 }}>
              {task.description}
            </Typography>
            <Chip
              label={task.status}
              color={getStatusColor(task.status)}
              size="small"
            />
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            类型: {task.taskType}
          </Typography>
          
          {task.status === 'RUNNING' && task.progress !== undefined && (
            <LinearProgress variant="determinate" value={task.progress} sx={{ mt: 1 }} />
          )}
          
          {task.status === 'FAILED' && task.errorMessage && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              错误: {task.errorMessage}
            </Typography>
          )}
          
          {task.status === 'COMPLETED' && task.result && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              结果: {task.result.substring(0, 100)}...
            </Typography>
          )}
        </Paper>
      ))}
      {tasks.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          暂无任务
        </Typography>
      )}
    </Box>
  );
};
