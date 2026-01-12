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
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { adminMemoryApi, UserMemory, UserSearchResult } from '../../services/api/admin/memory';
import { hsmemApi, MemoryItem, RetrieveResponse } from '../../services/api/hsmem/hsmemApi';
import { MUIProvider } from '../MUIProvider';

/**
 * 用户记忆管理组件
 */
interface UserMemoryManagementProps {
  adminToken: string | null;
}

const UserMemoryManagementContent: React.FC<UserMemoryManagementProps> = ({ adminToken }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // 原有功能状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memoryDetailOpen, setMemoryDetailOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<UserMemory | null>(null);
  
  // HSMem查询功能状态
  const [hsmemQueryText, setHsmemQueryText] = useState('');
  const [hsmemUserId, setHsmemUserId] = useState('');
  const [hsmemLimit, setHsmemLimit] = useState('10');
  const [hsmemResults, setHsmemResults] = useState<MemoryItem[]>([]);
  const [hsmemLoading, setHsmemLoading] = useState(false);
  const [hsmemError, setHsmemError] = useState<string | null>(null);
  const [hsmemResultDetailOpen, setHsmemResultDetailOpen] = useState(false);
  const [selectedHsmemItem, setSelectedHsmemItem] = useState<MemoryItem | null>(null);

  const handleSearch = async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const result = await adminMemoryApi.searchUsers(adminToken, searchKeyword, 0, 20);
      setUsers(result.content || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || '搜索失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMemories = async (userId: number) => {
    if (!adminToken) return;
    try {
      setLoading(true);
      setSelectedUserId(userId);
      const result = await adminMemoryApi.getUserMemories(adminToken, userId, undefined, 0, 20);
      setMemories(result.content || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || '加载记忆失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMemoryDetail = async (memoryId: string) => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const memory = await adminMemoryApi.getMemoryDetail(adminToken, memoryId);
      setSelectedMemory(memory);
      setMemoryDetailOpen(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || '加载详情失败');
    } finally {
      setLoading(false);
    }
  };

  // HSMem查询功能
  const handleHsmemQuery = async () => {
    try {
      setHsmemLoading(true);
      setHsmemError(null);
      setHsmemResults([]);

      if (!hsmemQueryText.trim()) {
        setHsmemError('请输入查询文本');
        return;
      }

      const where: Record<string, any> = {};
      if (hsmemUserId.trim()) {
        where.user_id = hsmemUserId.trim();
      }

      const response = await hsmemApi.retrieve({
        queries: [
          {
            role: 'user',
            content: { text: hsmemQueryText.trim() },
          },
        ],
        where: Object.keys(where).length > 0 ? where : undefined,
        limit: parseInt(hsmemLimit) || 10,
      });

      setHsmemResults(response.data.items || []);
    } catch (err: any) {
      setHsmemError(err.message || '查询失败');
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
      <Typography variant="h5" gutterBottom>
        用户记忆管理
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="用户记忆（Admin API）" />
        <Tab label="HSMem查询" />
      </Tabs>

      {/* 用户记忆管理（原有功能） */}
      {activeTab === 0 && (
        <Box>
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
      )}

      {/* HSMem查询功能 */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            HSMem记忆查询
          </Typography>
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
              <TextField
                label="用户ID（可选）"
                value={hsmemUserId}
                onChange={(e) => setHsmemUserId(e.target.value)}
                placeholder="user_123"
                sx={{ flex: 1 }}
              />
              <TextField
                label="返回数量"
                value={hsmemLimit}
                onChange={(e) => setHsmemLimit(e.target.value)}
                type="number"
                sx={{ width: 150 }}
              />
            </Box>

            <Button
              variant="contained"
              onClick={handleHsmemQuery}
              disabled={hsmemLoading}
            >
              {hsmemLoading ? <CircularProgress size={24} /> : '查询记忆'}
            </Button>
          </Paper>

          {hsmemError && <Alert severity="error" sx={{ mb: 2 }}>{hsmemError}</Alert>}

          {hsmemResults.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                查询结果 ({hsmemResults.length} 条)
              </Typography>
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
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.summary || '-'}</TableCell>
                        <TableCell>{item.memory_type || '-'}</TableCell>
                        <TableCell>
                          {item.categories && item.categories.length > 0 ? (
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {item.categories.map((cat, idx) => (
                                <Chip key={idx} label={cat} size="small" />
                              ))}
                            </Box>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{item.importance || '-'}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              onClick={() => handleViewHsmemItemDetail(item)}
                            >
                              查看详情
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              disabled
                              title="删除功能需要hsmem API支持，当前版本暂不可用"
                            >
                              删除
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* HSMem记忆项详情对话框 */}
          <Dialog
            open={hsmemResultDetailOpen}
            onClose={() => setHsmemResultDetailOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>记忆详情</DialogTitle>
            <DialogContent>
              {selectedHsmemItem && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>记忆ID:</strong> {selectedHsmemItem.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>摘要:</strong> {selectedHsmemItem.summary || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>类型:</strong> {selectedHsmemItem.memory_type || '-'}
                  </Typography>
                  {selectedHsmemItem.categories && selectedHsmemItem.categories.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        <strong>分类:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {selectedHsmemItem.categories.map((cat, idx) => (
                          <Chip key={idx} label={cat} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>重要性:</strong> {selectedHsmemItem.importance || '-'}
                  </Typography>
                  {selectedHsmemItem.content && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>内容:</strong> {selectedHsmemItem.content}
                    </Typography>
                  )}
                  {selectedHsmemItem.created_at && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>创建时间:</strong> {new Date(selectedHsmemItem.created_at).toLocaleString()}
                    </Typography>
                  )}
                  {selectedHsmemItem.updated_at && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>更新时间:</strong> {new Date(selectedHsmemItem.updated_at).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setHsmemResultDetailOpen(false)}>关闭</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
};

// 使用 MUI Provider 包装组件，解决 withEmotionCache 错误
const UserMemoryManagement: React.FC<UserMemoryManagementProps> = (props) => {
  return (
    <MUIProvider>
      <UserMemoryManagementContent {...props} />
    </MUIProvider>
  );
};

export default UserMemoryManagement;




