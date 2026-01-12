import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface TaskStep {
  stepId: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  order: number;
}

interface TaskFlowChartProps {
  steps: TaskStep[];
}

/**
 * 任务流程图组件
 */
export const TaskFlowChart: React.FC<TaskFlowChartProps> = ({ steps }) => {
  const getStepIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon color="success" />;
      case 'FAILED':
        return <ErrorIcon color="error" />;
      case 'RUNNING':
        return <PlayArrowIcon color="primary" />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getStepColor = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return '#4caf50';
      case 'FAILED':
        return '#f44336';
      case 'RUNNING':
        return '#2196f3';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        任务执行流程
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {steps.map((step, index) => (
          <Box key={step.stepId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* 步骤图标 */}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: getStepColor(step.status),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0
              }}
            >
              {getStepIcon(step.status)}
            </Box>

            {/* 步骤信息 */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" fontWeight="medium">
                步骤 {step.order}: {step.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                状态: {step.status}
              </Typography>
            </Box>

            {/* 连接线 */}
            {index < steps.length - 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  left: '48px',
                  top: '72px',
                  width: '2px',
                  height: '32px',
                  backgroundColor: getStepColor(step.status),
                  zIndex: 0
                }}
              />
            )}
          </Box>
        ))}
      </Box>
      {steps.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          暂无任务步骤
        </Typography>
      )}
    </Paper>
  );
};
