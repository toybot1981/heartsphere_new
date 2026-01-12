import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
} from '@mui/material';
import { adminMemoryApi, MemorySystemDashboard } from '../../services/api/admin/memory';
import { hsmemApi, StatisticsResponse, HSMemHealthStatus } from '../../services/api/hsmem/hsmemApi';
import { MUIProvider } from '../MUIProvider';

/**
 * 记忆系统概览仪表板
 */
interface MemoryDashboardProps {
  adminToken: string | null;
}

const MemoryDashboardContent: React.FC<MemoryDashboardProps> = ({ adminToken }) => {
  const [dashboard, setDashboard] = useState<MemorySystemDashboard | null>(null);
  const [hsmemStats, setHsmemStats] = useState<StatisticsResponse | null>(null);
  const [hsmemHealth, setHsmemHealth] = useState<HSMemHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [hsmemLoading, setHsmemLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hsmemError, setHsmemError] = useState<string | null>(null);

  useEffect(() => {
    if (adminToken) {
      loadDashboard();
      loadHsmemData();
    }
  }, [adminToken]);

  const loadDashboard = async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const data = await adminMemoryApi.getDashboard(adminToken);
      setDashboard(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadHsmemData = async () => {
    try {
      setHsmemLoading(true);
      setHsmemError(null);
      
      // 加载健康检查和统计信息
      const [health, stats] = await Promise.all([
        hsmemApi.healthCheck().catch(() => null),
        hsmemApi.getStatistics().catch(() => null),
      ]);
      
      if (health) {
        setHsmemHealth(health);
      }
      if (stats) {
        setHsmemStats(stats);
      }
    } catch (err: any) {
      setHsmemError(err.message || '加载HSMem数据失败');
    } finally {
      setHsmemLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!dashboard) {
    return <Alert severity="info">暂无数据</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          记忆系统概览
        </Typography>
        <Button variant="outlined" onClick={loadHsmemData} disabled={hsmemLoading}>
          {hsmemLoading ? <CircularProgress size={20} /> : '刷新HSMem数据'}
        </Button>
      </Box>

      {/* HSMem服务状态 */}
      <Box sx={{ mb: 3 }}>
        <Card sx={{ bgcolor: hsmemHealth ? 'success.light' : 'error.light' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                HSMem服务状态
              </Typography>
              <Chip
                label={hsmemHealth ? hsmemHealth.status : '未知'}
                color={hsmemHealth?.status === 'healthy' ? 'success' : 'error'}
                size="small"
              />
            </Box>
            {hsmemError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {hsmemError}
              </Alert>
            )}
            {hsmemStats && (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 2
              }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>资源总数:</strong> {hsmemStats.data.statistics.resources_count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>记忆项总数:</strong> {hsmemStats.data.statistics.items_count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>分类总数:</strong> {hsmemStats.data.statistics.categories_count}
                </Typography>
              </Box>
            )}
            {hsmemHealth && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>详细统计:</strong>
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                  gap: 1
                }}>
                  <Typography variant="body2" color="text.secondary">
                    资源: {hsmemHealth.statistics.resources_count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    记忆项: {hsmemHealth.statistics.items_count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    分类: {hsmemHealth.statistics.categories_count}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 3,
        mt: 1
      }}>
        {/* 系统状态 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              系统状态
            </Typography>
            <Typography variant="body2" color="text.secondary">
              运行状态: {dashboard.systemStatus}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              服务可用率: {dashboard.serviceAvailability}%
            </Typography>
          </CardContent>
        </Card>

        {/* 数据统计 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              数据统计
            </Typography>
            <Typography variant="body2" color="text.secondary">
              用户总数: {dashboard.totalUsers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              24小时活跃: {dashboard.activeUsers24h}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              记忆总量: {dashboard.totalMemories}
            </Typography>
          </CardContent>
        </Card>

        {/* 性能指标 */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              性能指标
            </Typography>
            <Typography variant="body2" color="text.secondary">
              平均响应时间: {dashboard.averageResponseTime}ms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              成功率: {dashboard.successRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              缓存命中率: {dashboard.cacheHitRate}%
            </Typography>
          </CardContent>
        </Card>

        {/* Redis状态 */}
        {dashboard.redisStatus && (
          <Card sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Redis状态
              </Typography>
              <Typography variant="body2" color="text.secondary">
                连接状态: {dashboard.redisStatus.connected ? '已连接' : '未连接'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                活跃会话: {dashboard.redisStatus.activeSessions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                总键数: {dashboard.redisStatus.totalKeys}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* MongoDB状态 */}
        {dashboard.mongoStatus && (
          <Card sx={{ gridColumn: { xs: '1', md: 'span 2' } }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                MongoDB状态
              </Typography>
              <Typography variant="body2" color="text.secondary">
                连接状态: {dashboard.mongoStatus.connected ? '已连接' : '未连接'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                总文档数: {dashboard.mongoStatus.totalDocuments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                总集合数: {dashboard.mongoStatus.totalCollections}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

// 使用 MUI Provider 包装组件，解决 withEmotionCache 错误
const MemoryDashboard: React.FC<MemoryDashboardProps> = (props) => {
  return (
    <MUIProvider>
      <MemoryDashboardContent {...props} />
    </MUIProvider>
  );
};

export default MemoryDashboard;


