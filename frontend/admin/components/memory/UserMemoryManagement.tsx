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
import { adminMemoryApi, UserMemory, UserSearchResult } from '../../../services/api/admin/memory';

/**
 * 用户记忆管理组件
 */
const UserMemoryManagement: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memoryDetailOpen, setMemoryDetailOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<UserMemory | null>(null);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const result = await adminMemoryApi.searchUsers(searchKeyword, 0, 20);
      setUsers(result.content || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || '搜索失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMemories = async (userId: number) => {
    try {
      setLoading(true);
      setSelectedUserId(userId);
      const result = await adminMemoryApi.getUserMemories(userId, undefined, 0, 20);
      setMemories(result.content || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || '加载记忆失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMemoryDetail = async (memoryId: string) => {
    try {
      setLoading(true);
      const memory = await adminMemoryApi.getMemoryDetail(memoryId);
      setSelectedMemory(memory);
      setMemoryDetailOpen(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || '加载详情失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        用户记忆管理
      </Typography>

      {/* 用户搜索 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="搜索用户"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={handleSearch} disabled={loading}>
          搜索
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}

      {/* 用户列表 */}
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
                    {user.lastActivityAt
                      ? new Date(user.lastActivityAt).toLocaleString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleViewMemories(user.userId)}
                    >
                      查看记忆
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 记忆列表 */}
      {selectedUserId && memories.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            用户 {selectedUserId} 的记忆列表
          </Typography>
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
                  <TableRow key={memory.id}>
                    <TableCell>{memory.id}</TableCell>
                    <TableCell>{memory.memoryType}</TableCell>
                    <TableCell>{memory.contentPreview}</TableCell>
                    <TableCell>{memory.importance}</TableCell>
                    <TableCell>
                      {new Date(memory.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleViewMemoryDetail(memory.id)}
                      >
                        查看详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* 记忆详情对话框 */}
      <Dialog
        open={memoryDetailOpen}
        onClose={() => setMemoryDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>记忆详情</DialogTitle>
        <DialogContent>
          {selectedMemory && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                记忆ID: {selectedMemory.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                用户ID: {selectedMemory.userId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                类型: {selectedMemory.memoryType}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                重要性: {selectedMemory.importance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                内容: {selectedMemory.contentPreview}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                创建时间: {new Date(selectedMemory.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                访问次数: {selectedMemory.accessCount}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemoryDetailOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserMemoryManagement;




