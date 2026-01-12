import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import { MentisApiService, VmStatus, VmInstance } from '../services/mentisApi';
import { VmScreenViewer } from '../components/VmScreenViewer';

/**
 * 虚拟机管理页面
 */
export const VmManagementPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [vmStatus, setVmStatus] = useState<VmStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (sessionId) {
      loadVmStatus();
    }
  }, [sessionId]);

  const loadVmStatus = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const status = await MentisApiService.getVmStatus(sessionId);
      setVmStatus(status);
    } catch (error: any) {
      // 如果错误码是 404 且消息是"该会话未关联虚拟机"，这是正常状态，不显示错误
      if (error.code === 404 && error.message === '该会话未关联虚拟机') {
        // 会话未关联虚拟机是正常状态，不显示错误提示
        setVmStatus(null);
        return;
      }
      console.error('加载虚拟机状态失败:', error);
      setSnackbar({
        open: true,
        message: error.message || '加载虚拟机状态失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVm = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const instance = await MentisApiService.createVm(sessionId);
      setSnackbar({
        open: true,
        message: `虚拟机创建成功: ${instance.vmId}`,
        severity: 'success'
      });
      // 创建成功后刷新状态
      loadVmStatus();
    } catch (error: any) {
      console.error('创建虚拟机失败:', error);
      setSnackbar({
        open: true,
        message: error.message || '创建虚拟机失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSnapshot = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const result = await MentisApiService.createVmSnapshot(sessionId);
      setSnackbar({
        open: true,
        message: `快照创建成功: ${result.snapshotId}`,
        severity: 'success'
      });
    } catch (error: any) {
      console.error('创建快照失败:', error);
      setSnackbar({
        open: true,
        message: error.message || '创建快照失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreSnapshot = async (snapshotId: string) => {
    if (!sessionId) return;
    try {
      setLoading(true);
      await MentisApiService.restoreVmSnapshot(sessionId, snapshotId);
      setSnackbar({
        open: true,
        message: '快照恢复成功',
        severity: 'success'
      });
      loadVmStatus();
    } catch (error: any) {
      console.error('恢复快照失败:', error);
      setSnackbar({
        open: true,
        message: error.message || '恢复快照失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' => {
    switch (status) {
      case 'RUNNING':
        return 'success';
      case 'STOPPED':
        return 'default';
      case 'ERROR':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">虚拟机管理</Typography>
          {sessionId && (
            <Typography variant="body2" color="text.secondary">
              会话: {sessionId}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadVmStatus}
            disabled={loading}
          >
            刷新状态
          </Button>
          {!vmStatus && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateVm}
              disabled={loading || !sessionId}
            >
              创建虚拟机
            </Button>
          )}
          {vmStatus && (
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleCreateSnapshot}
              disabled={loading || !sessionId}
            >
              创建快照
            </Button>
          )}
        </Box>
      </Box>

      {loading && !vmStatus ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            加载中...
          </Typography>
        </Box>
      ) : (
        <>
          {vmStatus ? (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6">虚拟机状态</Typography>
                  <Chip
                    label={vmStatus.status}
                    color={getStatusColor(vmStatus.status)}
                    size="small"
                  />
                </Box>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">虚拟机ID</Typography>
                  <Typography variant="body1">{vmStatus.vmId}</Typography>
                </Box>
                {vmStatus.ipAddress && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">IP地址</Typography>
                    <Typography variant="body1">{vmStatus.ipAddress}</Typography>
                  </Box>
                )}
                {vmStatus.resourceUsage && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>资源使用情况</Typography>
                    {Object.entries(vmStatus.resourceUsage).map(([key, value]) => (
                      <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{key}:</Typography>
                        <Typography variant="body2">{value}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    该会话未关联虚拟机
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    当前会话还没有创建虚拟机。如果需要使用虚拟机功能，请先创建虚拟机。
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {sessionId && vmStatus && (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">虚拟机屏幕</Typography>
                <Button
                  variant="outlined"
                  startIcon={<CameraAltIcon />}
                  onClick={loadVmStatus}
                  size="small"
                >
                  刷新截图
                </Button>
              </Box>
              <VmScreenViewer sessionId={sessionId} autoRefresh={true} refreshInterval={3000} />
            </Paper>
          )}
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
