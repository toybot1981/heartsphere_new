import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Chip,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { MentisApiService } from '../services/mentisApi';

interface SessionCreationWizardProps {
  open: boolean;
  onClose: () => void;
  onSessionCreated: (session: any) => void;
}

type SessionType = 'normal' | 'task' | 'vm' | 'custom';

/**
 * 会话创建向导组件
 * 引导用户创建新会话，支持类型选择和配置
 */
export const SessionCreationWizard: React.FC<SessionCreationWizardProps> = ({
  open,
  onClose,
  onSessionCreated,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [sessionType, setSessionType] = useState<SessionType>('normal');
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = ['选择类型', '配置信息', '确认创建'];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleCreate();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const title = sessionTitle || getDefaultTitle(sessionType);
      const session = await MentisApiService.createSession(title);
      onSessionCreated(session);
      handleReset();
    } catch (error: any) {
      console.error('创建会话失败:', error);
      const errorMessage = error?.message || '创建会话失败，请重试';
      alert(errorMessage);
      // 不重置表单，让用户可以重试
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setSessionType('normal');
    setSessionTitle('');
    setSessionDescription('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const getDefaultTitle = (type: SessionType): string => {
    const titles = {
      normal: '新会话',
      task: '任务会话',
      vm: 'VM 会话',
      custom: '自定义会话',
    };
    return titles[type];
  };

  const getTypeDescription = (type: SessionType): string => {
    const descriptions = {
      normal: '标准对话会话，适合一般性对话和任务',
      task: '任务导向会话，专注于任务执行和管理',
      vm: '虚拟机会话，专注于 VM 操作和管理',
      custom: '自定义配置会话，可自由配置',
    };
    return descriptions[type];
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <FormControl component="fieldset">
              <FormLabel component="legend">选择会话类型</FormLabel>
              <RadioGroup
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as SessionType)}
              >
                <FormControlLabel
                  value="normal"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">标准会话</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getTypeDescription('normal')}
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="task"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">任务会话</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getTypeDescription('task')}
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="vm"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">VM 会话</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getTypeDescription('vm')}
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="custom"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">自定义会话</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getTypeDescription('custom')}
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="会话名称"
              fullWidth
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              placeholder={getDefaultTitle(sessionType)}
              helperText="留空将使用默认名称"
            />
            <TextField
              label="会话描述（可选）"
              fullWidth
              multiline
              rows={3}
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              placeholder="输入会话描述..."
            />
            <Box>
              <Typography variant="body2" component="div" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                会话类型: <Chip label={sessionType} size="small" />
              </Typography>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              确认创建会话
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>名称:</strong> {sessionTitle || getDefaultTitle(sessionType)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>类型:</strong> {sessionType}
              </Typography>
              {sessionDescription && (
                <Typography variant="body2" gutterBottom>
                  <strong>描述:</strong> {sessionDescription}
                </Typography>
              )}
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>创建新会话</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3, mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              正在创建会话...
            </Typography>
          </Box>
        )}
        <Box sx={{ minHeight: 200 }}>
          {renderStepContent()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button onClick={handleBack} disabled={activeStep === 0}>
          上一步
        </Button>
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {activeStep === steps.length - 1 ? (loading ? '创建中...' : '创建') : '下一步'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
