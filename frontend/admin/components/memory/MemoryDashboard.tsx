import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { adminMemoryApi, MemorySystemDashboard } from '../../../services/api/admin/memory';

/**
 * 记忆系统概览仪表板
 */
const MemoryDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<MemorySystemDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminMemoryApi.getDashboard();
      setDashboard(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || '加载数据失败');
    } finally {
      setLoading(false);
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
      <Typography variant="h5" gutterBottom>
        记忆系统概览
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* 系统状态 */}
        <Grid size={{ xs: 12, md: 4 }}>
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
        </Grid>

        {/* 数据统计 */}
        <Grid size={{ xs: 12, md: 4 }}>
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
        </Grid>

        {/* 性能指标 */}
        <Grid size={{ xs: 12, md: 4 }}>
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
        </Grid>

        {/* Redis状态 */}
        {dashboard.redisStatus && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
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
          </Grid>
        )}

        {/* MongoDB状态 */}
        {dashboard.mongoStatus && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
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
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default MemoryDashboard;


