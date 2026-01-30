/**
 * Tab 1：HSMem 查询 — 查询表单、结果列表、结果详情弹窗
 */
import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { hsmemApi } from '../../services/api/hsmem/hsmemApi';
import type { MemoryItem } from '../../services/api/hsmem/hsmemApi';

const HsmemQueryTab: React.FC = () => {
  const [hsmemQueryText, setHsmemQueryText] = useState('');
  const [hsmemUserId, setHsmemUserId] = useState('');
  const [hsmemLimit, setHsmemLimit] = useState('10');
  const [hsmemResults, setHsmemResults] = useState<MemoryItem[]>([]);
  const [hsmemLoading, setHsmemLoading] = useState(false);
  const [hsmemError, setHsmemError] = useState<string | null>(null);
  const [hsmemResultDetailOpen, setHsmemResultDetailOpen] = useState(false);
  const [selectedHsmemItem, setSelectedHsmemItem] = useState<MemoryItem | null>(null);

  const handleHsmemQuery = async () => {
    try {
      setHsmemLoading(true);
      setHsmemError(null);
      setHsmemResults([]);
      if (!hsmemQueryText.trim()) {
        setHsmemError('请输入查询文本');
        return;
      }
      const where: Record<string, string> = {};
      if (hsmemUserId.trim()) where.user_id = hsmemUserId.trim();
      const response = await hsmemApi.retrieve({
        queries: [{ role: 'user', content: { text: hsmemQueryText.trim() } }],
        where: Object.keys(where).length > 0 ? where : undefined,
        limit: parseInt(hsmemLimit, 10) || 10,
      });
      setHsmemResults(response.data.items || []);
    } catch (err: unknown) {
      setHsmemError(err instanceof Error ? err.message : '查询失败');
    } finally {
      setHsmemLoading(false);
    }
  };

  const handleViewHsmemItemDetail = (item: MemoryItem) => {
    setSelectedHsmemItem(item);
    setHsmemResultDetailOpen(true);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>HSMem记忆查询</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        通过hsmem API查询记忆，支持关键词搜索和用户过滤
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          label="查询文本"
          value={hsmemQueryText}
          onChange={(e) => setHsmemQueryText(e.target.value)}
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
          placeholder="输入要查询的内容，例如：用户喜欢什么？"
        />
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="用户ID（可选）" value={hsmemUserId} onChange={(e) => setHsmemUserId(e.target.value)} placeholder="user_123" sx={{ flex: 1 }} />
          <TextField label="返回数量" value={hsmemLimit} onChange={(e) => setHsmemLimit(e.target.value)} type="number" sx={{ width: 150 }} />
        </Box>
        <Button variant="contained" onClick={handleHsmemQuery} disabled={hsmemLoading}>
          {hsmemLoading ? <CircularProgress size={24} /> : '查询记忆'}
        </Button>
      </Paper>

      {hsmemError && <Alert severity="error" sx={{ mb: 2 }}>{hsmemError}</Alert>}

      {hsmemResults.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>查询结果 ({hsmemResults.length} 条)</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>记忆ID</TableCell>
                  <TableCell>摘要</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>分类</TableCell>
                  <TableCell>重要性</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hsmemResults.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => handleViewHsmemItemDetail(item)}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  >
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.summary || '-'}</TableCell>
                    <TableCell>{item.memory_type || '-'}</TableCell>
                    <TableCell>
                      {item.categories && item.categories.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {item.categories.map((cat, idx) => <Chip key={idx} label={cat} size="small" />)}
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{item.importance || '-'}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button size="small" onClick={() => handleViewHsmemItemDetail(item)}>查看详情</Button>
                      <Button size="small" color="error" disabled title="删除功能需要hsmem API支持，当前版本暂不可用">删除</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog open={hsmemResultDetailOpen} onClose={() => setHsmemResultDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>记忆详情</DialogTitle>
        <DialogContent>
          {selectedHsmemItem && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>记忆ID:</strong> {selectedHsmemItem.id}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>摘要:</strong> {selectedHsmemItem.summary || '-'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>类型:</strong> {selectedHsmemItem.memory_type || '-'}</Typography>
              {selectedHsmemItem.categories && selectedHsmemItem.categories.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}><strong>分类:</strong></Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedHsmemItem.categories.map((cat, idx) => <Chip key={idx} label={cat} size="small" />)}
                  </Box>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>重要性:</strong> {selectedHsmemItem.importance || '-'}</Typography>
              {selectedHsmemItem.content && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>内容:</strong> {selectedHsmemItem.content}</Typography>}
              {selectedHsmemItem.created_at && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>创建时间:</strong> {new Date(selectedHsmemItem.created_at).toLocaleString()}</Typography>}
              {selectedHsmemItem.updated_at && <Typography variant="body2" color="text.secondary"><strong>更新时间:</strong> {new Date(selectedHsmemItem.updated_at).toLocaleString()}</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHsmemResultDetailOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HsmemQueryTab;
