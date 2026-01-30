/**
 * Tab 0：用户记忆（Admin API）— 检索、用户列表、记忆列表、记忆详情弹窗
 */
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { adminMemoryApi, UserMemory, UserSearchResult } from '../../services/api/admin/memory';
import { hsmemApi } from '../../services/api/hsmem/hsmemApi';
import type { MemoryItem } from '../../services/api/hsmem/hsmemApi';
import { hsmemItemToUserMemory } from './memoryUtils';

export interface UserMemoryTabProps {
  adminToken: string | null;
  contextSelectedUserId: number | null;
  setContextSelectedUserId: (id: number | null) => void;
}

const UserMemoryTab: React.FC<UserMemoryTabProps> = ({
  adminToken,
  contextSelectedUserId,
  setContextSelectedUserId,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memoryDetailOpen, setMemoryDetailOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<UserMemory | null>(null);
  const [selectedMemoryDetail, setSelectedMemoryDetail] = useState<MemoryItem | null>(null);

  useEffect(() => {
    if (contextSelectedUserId !== null && adminToken) {
      const userId = contextSelectedUserId;
      setContextSelectedUserId(null);
      setSelectedUserId(userId);
      setSearchKeyword(String(userId));
      const loadMemories = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await hsmemApi.getAllItems(String(userId));
          const items = response?.data?.items ?? [];
          setMemories(items.map((item) => hsmemItemToUserMemory(item, userId)));
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : '加载HSMem记忆失败');
          setMemories([]);
        } finally {
          setLoading(false);
        }
      };
      loadMemories();
    }
  }, [contextSelectedUserId, setContextSelectedUserId, adminToken]);

  const handleSearch = async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const result = await adminMemoryApi.searchUsers(adminToken, searchKeyword, 0, 20);
      setUsers(result.content || []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '搜索失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMemories = async (userId: number) => {
    try {
      setLoading(true);
      setSelectedUserId(userId);
      setError(null);
      const response = await hsmemApi.getAllItems(String(userId));
      const items = response?.data?.items ?? [];
      setMemories(items.map((item) => hsmemItemToUserMemory(item, userId)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加载HSMem记忆失败');
      setMemories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMemoryDetail = async (memoryId: string) => {
    try {
      setLoading(true);
      setSelectedMemoryDetail(null);
      const response = await hsmemApi.getItem(memoryId);
      const item = response?.data;
      if (item) {
        setSelectedMemoryDetail(item);
        setSelectedMemory(selectedUserId != null ? hsmemItemToUserMemory(item, selectedUserId) : null);
      }
      setMemoryDetailOpen(true);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加载HSMem记忆详情失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
          快速检索：根据用户ID检索记忆
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="用户ID"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const userId = parseInt(searchKeyword.trim());
                if (!isNaN(userId) && userId > 0) handleViewMemories(userId);
                else if (searchKeyword.trim()) handleSearch();
              }
            }}
            placeholder="输入用户ID（纯数字）直接检索记忆，或输入用户名搜索用户"
            sx={{ flex: 1 }}
            helperText="输入纯数字作为用户ID，或输入文本作为用户名"
          />
          <Button
            variant="contained"
            onClick={() => {
              const userId = parseInt(searchKeyword.trim());
              if (!isNaN(userId) && userId > 0) handleViewMemories(userId);
              else if (searchKeyword.trim()) handleSearch();
            }}
            disabled={loading || !searchKeyword.trim()}
            sx={{ minWidth: 100 }}
          >
            {loading ? <CircularProgress size={20} /> : '检索'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="搜索用户"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ flex: 1 }}
        />
        <Button variant="outlined" onClick={handleSearch} disabled={loading}>
          搜索用户
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}

      {users.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>用户ID</TableCell>
                <TableCell>用户名</TableCell>
                <TableCell>邮箱</TableCell>
                <TableCell>记忆数量</TableCell>
                <TableCell>最后活动</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.userId}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.memoryCount}</TableCell>
                  <TableCell>
                    {user.lastActivityAt ? new Date(user.lastActivityAt).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => handleViewMemories(user.userId)}>
                      查看记忆
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedUserId && (
        <Box>
          <Typography variant="h6" gutterBottom>
            用户 {selectedUserId} 的 HSMem 记忆列表
          </Typography>
          {memories.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              该用户暂无 HSMem 记忆，或 HSMem 服务未返回数据。
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>记忆ID</TableCell>
                    <TableCell>类型</TableCell>
                    <TableCell>内容预览</TableCell>
                    <TableCell>重要性</TableCell>
                    <TableCell>创建时间</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {memories.map((memory) => (
                    <TableRow
                      key={memory.id}
                      onClick={() => handleViewMemoryDetail(memory.id)}
                      sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                    >
                      <TableCell>{memory.id}</TableCell>
                      <TableCell>{memory.memoryType}</TableCell>
                      <TableCell>{memory.contentPreview}</TableCell>
                      <TableCell>{memory.importance}</TableCell>
                      <TableCell>{new Date(memory.createdAt).toLocaleString()}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button size="small" onClick={() => handleViewMemoryDetail(memory.id)}>
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      <Dialog
        open={memoryDetailOpen}
        onClose={() => { setMemoryDetailOpen(false); setSelectedMemoryDetail(null); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>记忆详情（HSMem）</DialogTitle>
        <DialogContent>
          {selectedMemoryDetail ? (
            <Box>
              <Typography variant="body2" color="text.secondary">记忆ID: {selectedMemoryDetail.id}</Typography>
              <Typography variant="body2" color="text.secondary">资源ID: {selectedMemoryDetail.resource_id ?? '-'}</Typography>
              <Typography variant="body2" color="text.secondary">类型: {selectedMemoryDetail.memory_type}</Typography>
              <Typography variant="body2" color="text.secondary">重要性: {String(selectedMemoryDetail.importance ?? '-')}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>摘要: {selectedMemoryDetail.summary ?? '-'}</Typography>
              {selectedMemoryDetail.content && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>内容: {selectedMemoryDetail.content}</Typography>
              )}
              {selectedMemoryDetail.categories && selectedMemoryDetail.categories.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>分类: {selectedMemoryDetail.categories.join(', ')}</Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                创建时间: {selectedMemoryDetail.created_at ? new Date(selectedMemoryDetail.created_at).toLocaleString() : '-'}
              </Typography>
              {selectedMemoryDetail.updated_at && (
                <Typography variant="body2" color="text.secondary">更新时间: {new Date(selectedMemoryDetail.updated_at).toLocaleString()}</Typography>
              )}
            </Box>
          ) : selectedMemory ? (
            <Box>
              <Typography variant="body2" color="text.secondary">记忆ID: {selectedMemory.id}</Typography>
              <Typography variant="body2" color="text.secondary">类型: {selectedMemory.memoryType}</Typography>
              <Typography variant="body2" color="text.secondary">内容预览: {selectedMemory.contentPreview}</Typography>
              <Typography variant="body2" color="text.secondary">创建时间: {new Date(selectedMemory.createdAt).toLocaleString()}</Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setMemoryDetailOpen(false); setSelectedMemoryDetail(null); }}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserMemoryTab;
