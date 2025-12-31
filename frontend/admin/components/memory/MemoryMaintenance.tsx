import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { adminMemoryApi } from '../../../services/api/admin/memory';

/**
 * 数据维护组件
 */
const MemoryMaintenance: React.FC = () => {
  const [cleanupType, setCleanupType] = useState('');
  const [archiveType, setArchiveType] = useState('');
  const [beforeDate, setBeforeDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCleanup = async () => {
    if (!cleanupType) {
      setError('请选择清理类型');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const count = await adminMemoryApi.cleanupData(cleanupType, {});
      setResult(`清理完成，共清理 ${count} 条记录`);
    } catch (err: any) {
      setError(err.message || '清理失败');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveType || !beforeDate) {
      setError('请填写归档类型和日期');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const count = await adminMemoryApi.archiveData(archiveType, beforeDate);
      setResult(`归档完成，共归档 ${count} 条记录`);
    } catch (err: any) {
      setError(err.message || '归档失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        数据维护
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {result && <Alert severity="success" sx={{ mb: 2 }}>{result}</Alert>}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* 数据清理 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                数据清理
              </Typography>
              <TextField
                label="清理类型"
                value={cleanupType}
                onChange={(e) => setCleanupType(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="例如: expired_sessions, old_memories"
              />
              <Button
                variant="contained"
                onClick={handleCleanup}
                disabled={loading || !cleanupType}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : '执行清理'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* 数据归档 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                数据归档
              </Typography>
              <TextField
                label="归档类型"
                value={archiveType}
                onChange={(e) => setArchiveType(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="例如: old_memories"
              />
              <TextField
                label="归档日期之前"
                type="datetime-local"
                value={beforeDate}
                onChange={(e) => setBeforeDate(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="contained"
                onClick={handleArchive}
                disabled={loading || !archiveType || !beforeDate}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : '执行归档'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MemoryMaintenance;



