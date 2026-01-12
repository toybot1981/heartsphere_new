import React from 'react';
import { Box, LinearProgress, Typography, Tooltip } from '@mui/material';

interface TaskProgressBarProps {
  taskId: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  currentStepDescription?: string;
}

/**
 * 任务进度条组件
 */
export const TaskProgressBar: React.FC<TaskProgressBarProps> = ({
  taskId,
  description,
  currentStep,
  totalSteps,
  status,
  currentStepDescription
}) => {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  const getProgressColor = (): 'primary' | 'success' | 'error' | 'inherit' => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'RUNNING':
        return 'primary';
      default:
        return 'inherit';
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Tooltip title={description}>
          <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {description}
          </Typography>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          {currentStep}/{totalSteps} ({Math.round(progress)}%)
        </Typography>
      </Box>
      
      <LinearProgress
        variant={status === 'RUNNING' ? 'determinate' : 'determinate'}
        value={status === 'COMPLETED' ? 100 : progress}
        color={getProgressColor()}
        sx={{ height: 8, borderRadius: 1 }}
      />
      
      {status === 'RUNNING' && currentStepDescription && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          当前步骤: {currentStepDescription}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          任务ID: {taskId}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          状态: {status}
        </Typography>
      </Box>
    </Box>
  );
};
