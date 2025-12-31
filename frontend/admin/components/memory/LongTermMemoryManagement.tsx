import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
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
  Grid,
} from '@mui/material';
import {
  adminMemoryApi,
  UserMemory,
  LongTermMemoryStats,
  ExtractionTask,
  ExtractionConfig,
} from '../../../services/api/admin/memory';

/**
 * 长时记忆管理组件
 */
const LongTermMemoryManagement: React.FC = () => {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [stats, setStats] = useState<LongTermMemoryStats | null>(null);
  const [extractionTasks, setExtractionTasks] = useState<ExtractionTask[]>([]);
  const [extractionConfig, setExtractionConfig] = useState<ExtractionConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [memoryType, setMemoryType] = useState<string>('');

  useEffect(() => {
    loadStats();
    loadExtractionConfig();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminMemoryApi.getLongTermMemoryStats();
      setStats(data);
    } catch (err: any) {
      console.error('加载统计失败:', err);
    }
  };

  const loadMemories = async () => {
    try {
      setLoading(true);
      const result = await adminMemoryApi.queryLongTermMemories(
        userId ? parseInt(userId) : undefined,
        memoryType || undefined,
        undefined,
        undefined,
        undefined,
        0,
        20
      );
      setMemories(result.content || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || '加载记忆失败');
    } finally {
      setLoading(false);
    }
  };

  const loadExtractionTasks = async () => {
    try {
      setLoading(true);
      const result = await adminMemoryApi.getExtractionTasks(undefined, undefined, 0, 20);
      setExtractionTasks(result.content || []);
    } catch (err: any) {
      console.error('加载提取任务失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExtractionConfig = async () => {
    try {
      const config = await adminMemoryApi.getExtractionConfig();
      setExtractionConfig(config);
    } catch (err: any) {
      console.error('加载提取配置失败:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        长时记忆管理
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* 统计信息 */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  记忆统计
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  总记忆数: {stats.totalMemories}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 提取配置 */}
      {extractionConfig && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              提取配置
            </Typography>
            <Typography variant="body2" color="text.secondary">
              LLM提取: {extractionConfig.enableLLMExtraction ? '启用' : '禁用'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              规则提取: {extractionConfig.enableRuleBasedExtraction ? '启用' : '禁用'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              批次大小: {extractionConfig.batchSize}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* 查询条件 */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="用户ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          size="small"
        />
        <TextField
          label="记忆类型"
          value={memoryType}
          onChange={(e) => setMemoryType(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={loadMemories} disabled={loading}>
          查询
        </Button>
        <Button variant="outlined" onClick={loadExtractionTasks} disabled={loading}>
          查看提取任务
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}

      {/* 记忆列表 */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>记忆ID</TableCell>
              <TableCell>用户ID</TableCell>
              <TableCell>类型</TableCell>
              <TableCell>内容预览</TableCell>
              <TableCell>重要性</TableCell>
              <TableCell>创建时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {memories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  暂无记忆数据
                </TableCell>
              </TableRow>
            ) : (
              memories.map((memory) => (
                <TableRow key={memory.id}>
                  <TableCell>{memory.id}</TableCell>
                  <TableCell>{memory.userId}</TableCell>
                  <TableCell>{memory.memoryType}</TableCell>
                  <TableCell>{memory.contentPreview}</TableCell>
                  <TableCell>{memory.importance}</TableCell>
                  <TableCell>
                    {new Date(memory.createdAt).toLocaleString()}
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

export default LongTermMemoryManagement;



