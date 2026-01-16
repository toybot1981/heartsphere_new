import React, { useEffect, useState } from 'react';
import { Box, Paper, IconButton, Typography, CircularProgress } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import { MentisApiService } from '../services/mentisApi';

interface VmScreenViewerProps {
  sessionId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // 毫秒
}

/**
 * 虚拟机屏幕展示组件
 */
export const VmScreenViewer: React.FC<VmScreenViewerProps> = ({
  sessionId,
  autoRefresh = true,
  refreshInterval = 2000
}) => {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!autoRefresh) return;

    let retryTimeout: NodeJS.Timeout | null = null;
    let hasRetried = false;

    const fetchScreenshot = async () => {
      try {
        setIsLoading(true);
        const response = await MentisApiService.getVmScreenshot(sessionId);
        setScreenshotUrl(response.screenshot || response.screenshotUrl || null);
        // 如果成功获取截图，清除重试定时器并重置重试标志
        if (retryTimeout) {
          clearTimeout(retryTimeout);
          retryTimeout = null;
        }
        hasRetried = false;
      } catch (error: any) {
        // 如果错误是"会话没有关联的虚拟机"或"未关联虚拟机"，这是正常状态
        const errorMessage = error.message || '';
        if (errorMessage.includes('没有关联的虚拟机') || 
            errorMessage.includes('未关联虚拟机') || 
            errorMessage.includes('自动创建失败')) {
          setScreenshotUrl(null);
          // 3秒后自动重试一次（仅在第一次失败时）
          if (!hasRetried && !retryTimeout) {
            hasRetried = true;
            retryTimeout = setTimeout(() => {
              fetchScreenshot();
            }, 3000);
          }
          return; // 静默处理，不输出错误日志
        }
        console.error('获取截图失败:', error);
        setScreenshotUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScreenshot();
    const interval = setInterval(fetchScreenshot, refreshInterval);

    return () => {
      clearInterval(interval);
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [sessionId, autoRefresh, refreshInterval]);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  return (
    <Paper
      sx={{
        p: 2,
        height: isFullscreen ? '100vh' : 'auto',
        position: isFullscreen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        zIndex: isFullscreen ? 9999 : 1
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">虚拟机屏幕</Typography>
        <Box>
          <IconButton onClick={handleZoomOut} size="small">
            <ZoomOutIcon />
          </IconButton>
          <IconButton onClick={handleZoomIn} size="small">
            <ZoomInIcon />
          </IconButton>
          <IconButton onClick={handleFullscreen} size="small">
            <FullscreenIcon />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'relative',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'black',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto'
        }}
      >
        {isLoading ? (
          <CircularProgress />
        ) : screenshotUrl ? (
          <img
            src={screenshotUrl}
            alt="虚拟机屏幕"
            style={{
              width: `${zoom * 100}%`,
              height: 'auto',
              maxWidth: '100%'
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            暂无截图
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
