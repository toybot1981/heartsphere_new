import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { adminMemoryApi, SessionInfo, RedisCacheStats } from '../../services/api/admin/memory';
import { MUIProvider } from '../MUIProvider';

/**
 * 短时记忆管理组件
 */
interface ShortTermMemoryManagementProps {
  adminToken: string | null;
}

const ShortTermMemoryManagementContent: React.FC<ShortTermMemoryManagementProps> = ({ adminToken }) => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [cacheStats, setCacheStats] = useState<RedisCacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (adminToken) {
      loadSessions();
      loadCacheStats();
    }
  }, [adminToken]);

  const loadSessions = async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const result = await adminMemoryApi.getSessions(adminToken, undefined, undefined, undefined, undefined, 0, 20);
      setSessions(result.content || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || '加载会话失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCacheStats = async () => {
    if (!adminToken) return;
    try {
      const stats = await adminMemoryApi.getRedisCacheStats(adminToken);
      setCacheStats(stats);
    } catch (err: any) {
      console.error('加载缓存统计失败:', err);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!adminToken || !window.confirm('确定要终止此会话吗？')) return;
    
    try {
      await adminMemoryApi.terminateSession(adminToken, sessionId);
      await loadSessions();
    } catch (err: any) {
      setError(err.message || '终止会话失败');
    }
  };

  const handleCleanupExpired = async () => {
    if (!adminToken || !window.confirm('确定要清理所有过期会话吗？')) return;
    
    try {
      const count = await adminMemoryApi.cleanupExpiredSessions(adminToken);
      alert(`已清理 ${count} 个过期会话`);
      await loadSessions();
    } catch (err: any) {
      setError(err.message || '清理失败');
    }
  };

  const handleClearCache = async () => {
    if (!adminToken || !window.confirm('确定要清理缓存吗？')) return;
    
    try {
      await adminMemoryApi.clearCache(adminToken);
      await loadCacheStats();
      alert('缓存已清理');
    } catch (err: any) {
      setError(err.message || '清理缓存失败');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        短时记忆管理
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* 缓存统计 */}
      {cacheStats && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 2,
          mb: 3
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Redis缓存统计
              </Typography>
              <Typography variant="body2" color="text.secondary">
                总键数: {cacheStats.totalKeys}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                内存使用: {(cacheStats.memoryUsed / 1024 / 1024).toFixed(2)} MB
              </Typography>
              <Typography variant="body2" color="text.secondary">
                命中率: {(cacheStats.hitRate * 100).toFixed(2)}%
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearCache}
                sx={{ mt: 2 }}
              >
                清理缓存
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* 操作按钮 */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={loadSessions} disabled={loading}>
          刷新
        </Button>
        <Button variant="outlined" onClick={handleCleanupExpired}>
          清理过期会话
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}

      {/* 会话列表 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>会话ID</TableCell>
              <TableCell>用户ID</TableCell>
              <TableCell>消息数量</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell>最后活动</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  暂无会话数据
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.sessionId}>
                  <TableCell>{session.sessionId}</TableCell>
                  <TableCell>{session.userId}</TableCell>
                  <TableCell>{session.messageCount}</TableCell>
                  <TableCell>{session.status}</TableCell>
                  <TableCell>
                    {new Date(session.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(session.lastActivityAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleTerminateSession(session.sessionId)}
                    >
                      终止
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// 使用 MUI Provider 包装组件，解决 withEmotionCache 错误
const ShortTermMemoryManagement: React.FC<ShortTermMemoryManagementProps> = (props) => {
  return (
    <MUIProvider>
      <ShortTermMemoryManagementContent {...props} />
    </MUIProvider>
  );
};

export default ShortTermMemoryManagement;




