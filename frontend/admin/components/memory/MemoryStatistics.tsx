import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { adminMemoryApi, MemoryStatistics, PerformanceMetrics } from '../../../services/api/admin/memory';

/**
 * 记忆系统统计分析组件
 */
const MemoryStatisticsComponent: React.FC = () => {
  const [statistics, setStatistics] = useState<MemoryStatistics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats, perf] = await Promise.all([
        adminMemoryApi.getStatistics(),
        adminMemoryApi.getPerformanceMetrics(),
      ]);
      setStatistics(stats);
      setPerformance(perf);
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

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        统计分析
      </Typography>

      {statistics && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  用户统计
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  总用户数: {statistics.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  24小时活跃: {statistics.activeUsers24h}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  7天活跃: {statistics.activeUsers7d}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  留存率: {(statistics.userRetentionRate * 100).toFixed(2)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  使用量统计
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  记忆创建: {statistics.totalMemoriesCreated}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  提取次数: {statistics.totalExtractions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  检索次数: {statistics.totalRetrievals}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  性能统计
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  平均响应时间: {statistics.averageResponseTime}ms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  P95响应时间: {statistics.p95ResponseTime}ms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  成功率: {(statistics.successRate * 100).toFixed(2)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  缓存命中率: {(statistics.cacheHitRate * 100).toFixed(2)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {performance && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  性能指标
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  平均响应时间: {performance.averageResponseTime}ms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  P95响应时间: {performance.p95ResponseTime}ms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  P99响应时间: {performance.p99ResponseTime}ms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  总请求数: {performance.totalRequests}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  成功率: {(performance.successRate * 100).toFixed(2)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default MemoryStatisticsComponent;



