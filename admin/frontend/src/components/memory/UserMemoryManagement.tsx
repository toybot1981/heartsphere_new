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
import { hsmemApi, MemoryItem, RetrieveResponse, Resource, Category } from '../../services/api/hsmem/hsmemApi';
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

  // 记忆提取追溯功能状态
  const [traceUserId, setTraceUserId] = useState('');
  const [traceResources, setTraceResources] = useState<Resource[]>([]);
  const [traceItems, setTraceItems] = useState<MemoryItem[]>([]);
  const [traceCategories, setTraceCategories] = useState<Category[]>([]);
  const [traceStats, setTraceStats] = useState({ resourcesCount: 0, itemsCount: 0, categoriesCount: 0 });
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceError, setTraceError] = useState<string | null>(null);
  const [resourceDetailOpen, setResourceDetailOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [categoryDetailOpen, setCategoryDetailOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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

  // 记忆提取追溯功能
  const handleTraceQuery = async () => {
    if (!traceUserId.trim()) {
      setTraceError('请输入用户ID');
      return;
    }

    try {
      setTraceLoading(true);
      setTraceError(null);

      const userId = traceUserId.trim();

      // 并行获取数据
      const [itemsResponse, resourcesResponse, categoriesResponse] = await Promise.all([
        hsmemApi.getAllItems(userId),
        hsmemApi.getAllResources(),
        hsmemApi.getCategories(),
      ]);

      const allItems = itemsResponse.data.items || [];
      const allResources = resourcesResponse.data.resources || [];
      const allCategories = categoriesResponse.data.categories || [];

      // 过滤资源：通过记忆项的resource_id来关联
      const itemResourceIds = new Set(allItems.map(item => item.resource_id).filter(Boolean));
      const userResources = allResources.filter(resource => itemResourceIds.has(resource.id));

      // 过滤分类：通过记忆项的categories来关联
      const userCategoryNames = new Set<string>();
      allItems.forEach(item => {
        if (item.categories) {
          item.categories.forEach(cat => userCategoryNames.add(cat));
        }
      });
      const userCategories = allCategories.filter(cat => userCategoryNames.has(cat.name));

      setTraceItems(allItems);
      setTraceResources(userResources);
      setTraceCategories(userCategories);
      setTraceStats({
        resourcesCount: userResources.length,
        itemsCount: allItems.length,
        categoriesCount: userCategories.length,
      });
    } catch (err: any) {
      setTraceError(err.message || '查询失败');
    } finally {
      setTraceLoading(false);
    }
  };

  const handleViewResourceDetail = async (resourceId: string) => {
    try {
      const response = await hsmemApi.getResource(resourceId);
      setSelectedResource(response.data);
      setResourceDetailOpen(true);
    } catch (err: any) {
      setTraceError(err.message || '加载资源详情失败');
    }
  };

  const handleViewCategoryDetail = async (categoryName: string) => {
    try {
      const response = await hsmemApi.getCategoryItems(categoryName);
      // 构造分类对象
      const category = traceCategories.find(cat => cat.name === categoryName);
      if (category) {
        setSelectedCategory({
          ...category,
          item_ids: response.data.items.map(item => item.id),
        });
        setCategoryDetailOpen(true);
      }
    } catch (err: any) {
      setTraceError(err.message || '加载分类详情失败');
    }
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
        <Tab label="记忆提取追溯" />
      </Tabs>

      {/* 用户记忆管理（原有功能） */}
      {activeTab === 0 && (
        <Box>
          {/* 快速检索：根据userid直接检索记忆 */}
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
                    if (!isNaN(userId) && userId > 0) {
                      handleViewMemories(userId);
                    } else if (searchKeyword.trim()) {
                      handleSearch();
                    }
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
                  if (!isNaN(userId) && userId > 0) {
                    handleViewMemories(userId);
                  } else if (searchKeyword.trim()) {
                    handleSearch();
                  }
                }} 
                disabled={loading || !searchKeyword.trim()}
                sx={{ minWidth: 100 }}
              >
                {loading ? <CircularProgress size={20} /> : '检索'}
              </Button>
            </Box>
          </Box>

          {/* 用户搜索 */}
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
                  <TableRow 
                    key={memory.id}
                    onClick={() => handleViewMemoryDetail(memory.id)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <TableCell>{memory.id}</TableCell>
                    <TableCell>{memory.memoryType}</TableCell>
                    <TableCell>{memory.contentPreview}</TableCell>
                    <TableCell>{memory.importance}</TableCell>
                    <TableCell>
                      {new Date(memory.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
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
                      <TableRow 
                        key={item.id}
                        onClick={() => handleViewHsmemItemDetail(item)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                      >
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
                        <TableCell onClick={(e) => e.stopPropagation()}>
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

      {/* 记忆提取追溯功能 */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            记忆提取追溯
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            查看用户记忆的三层架构：Resource Layer → Memory Item Layer → Memory Category Layer
          </Typography>

          {/* 用户ID输入 */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="用户ID"
                value={traceUserId}
                onChange={(e) => setTraceUserId(e.target.value)}
                placeholder="user_123"
                sx={{ flex: 1 }}
                onKeyPress={(e) => e.key === 'Enter' && handleTraceQuery()}
              />
              <Button
                variant="contained"
                onClick={handleTraceQuery}
                disabled={traceLoading || !traceUserId.trim()}
              >
                {traceLoading ? <CircularProgress size={20} /> : '查询'}
              </Button>
            </Box>
            {traceError && <Alert severity="error" sx={{ mt: 2 }}>{traceError}</Alert>}
          </Paper>

          {/* 统计卡片 */}
          {traceStats.itemsCount > 0 && (
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">{traceStats.resourcesCount}</Typography>
                <Typography variant="body2" color="text.secondary">资源总数</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">{traceStats.itemsCount}</Typography>
                <Typography variant="body2" color="text.secondary">记忆项总数</Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">{traceStats.categoriesCount}</Typography>
                <Typography variant="body2" color="text.secondary">分类总数</Typography>
              </Paper>
            </Box>
          )}

          {/* 资源列表 */}
          {traceResources.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                资源列表 (Resource Layer)
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>资源ID</TableCell>
                      <TableCell>模态类型</TableCell>
                      <TableCell>创建时间</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {traceResources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell>{resource.id}</TableCell>
                        <TableCell>{resource.modality}</TableCell>
                        <TableCell>
                          {new Date(resource.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleViewResourceDetail(resource.id)}
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

          {/* 记忆项列表 */}
          {traceItems.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                记忆项列表 (Memory Item Layer)
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>记忆项ID</TableCell>
                      <TableCell>摘要</TableCell>
                      <TableCell>类型</TableCell>
                      <TableCell>分类</TableCell>
                      <TableCell>重要性</TableCell>
                      <TableCell>创建时间</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {traceItems.map((item) => (
                      <TableRow 
                        key={item.id}
                        onClick={() => handleViewHsmemItemDetail(item)}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover'
                          }
                        }}
                      >
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.summary}</TableCell>
                        <TableCell>{item.memory_type}</TableCell>
                        <TableCell>
                          {item.categories && item.categories.length > 0 ? (
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {item.categories.slice(0, 2).map((cat, idx) => (
                                <Chip key={idx} label={cat} size="small" />
                              ))}
                              {item.categories.length > 2 && (
                                <Chip label={`+${item.categories.length - 2}`} size="small" />
                              )}
                            </Box>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{item.importance || '-'}</TableCell>
                        <TableCell>
                          {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="small"
                            onClick={() => handleViewHsmemItemDetail(item)}
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

          {/* 分类列表 */}
          {traceCategories.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                分类列表 (Memory Category Layer)
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>分类名称</TableCell>
                      <TableCell>摘要</TableCell>
                      <TableCell>记忆项数量</TableCell>
                      <TableCell>创建时间</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {traceCategories.map((category) => (
                      <TableRow key={category.id || category.name}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>{category.summary || '-'}</TableCell>
                        <TableCell>{category.item_count}</TableCell>
                        <TableCell>
                          {category.created_at ? new Date(category.created_at).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => handleViewCategoryDetail(category.name)}
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

          {/* 空状态 */}
          {!traceLoading && traceStats.itemsCount === 0 && traceUserId && (
            <Alert severity="info" sx={{ mt: 2 }}>
              该用户暂无记忆提取记录
            </Alert>
          )}

          {/* 资源详情对话框 */}
          <Dialog
            open={resourceDetailOpen}
            onClose={() => setResourceDetailOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>资源详情</DialogTitle>
            <DialogContent>
              {selectedResource && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>资源ID:</strong> {selectedResource.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>模态类型:</strong> {selectedResource.modality}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>创建时间:</strong> {new Date(selectedResource.created_at).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <strong>原始数据:</strong>
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {JSON.stringify(selectedResource.data, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setResourceDetailOpen(false)}>关闭</Button>
            </DialogActions>
          </Dialog>

          {/* 分类详情对话框 */}
          <Dialog
            open={categoryDetailOpen}
            onClose={() => setCategoryDetailOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>分类详情: {selectedCategory?.name}</DialogTitle>
            <DialogContent>
              {selectedCategory && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>分类名称:</strong> {selectedCategory.name}
                  </Typography>
                  {selectedCategory.summary && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>摘要:</strong> {selectedCategory.summary}
                    </Typography>
                  )}
                  {selectedCategory.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>描述:</strong> {selectedCategory.description}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>记忆项数量:</strong> {selectedCategory.item_count}
                  </Typography>
                  {selectedCategory.created_at && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>创建时间:</strong> {new Date(selectedCategory.created_at).toLocaleString()}
                    </Typography>
                  )}
                  {selectedCategory.item_ids && selectedCategory.item_ids.length > 0 && (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>包含的记忆项ID:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selectedCategory.item_ids.map((itemId) => {
                          const item = traceItems.find(i => i.id === itemId);
                          return (
                            <Chip
                              key={itemId}
                              label={item ? item.summary : itemId}
                              size="small"
                              onClick={() => item && handleViewHsmemItemDetail(item)}
                              sx={{ cursor: item ? 'pointer' : 'default' }}
                            />
                          );
                        })}
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCategoryDetailOpen(false)}>关闭</Button>
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




