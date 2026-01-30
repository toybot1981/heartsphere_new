/**
 * Tab 2：记忆提取追溯 — 用户ID、三层数据与详情弹窗
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
import type { MemoryItem, Resource, Category } from '../../services/api/hsmem/hsmemApi';

const MemoryTraceTab: React.FC = () => {
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
  const [selectedCategory, setSelectedCategory] = useState<(Category & { item_ids?: string[] }) | null>(null);
  const [hsmemItemDetailOpen, setHsmemItemDetailOpen] = useState(false);
  const [selectedHsmemItem, setSelectedHsmemItem] = useState<MemoryItem | null>(null);

  const handleTraceQuery = async () => {
    if (!traceUserId.trim()) {
      setTraceError('请输入用户ID');
      return;
    }
    try {
      setTraceLoading(true);
      setTraceError(null);
      const userId = traceUserId.trim();
      const [itemsResponse, resourcesResponse, categoriesResponse] = await Promise.all([
        hsmemApi.getAllItems(userId),
        hsmemApi.getAllResources(),
        hsmemApi.getCategories(),
      ]);
      const allItems = itemsResponse.data.items || [];
      const allResources = resourcesResponse.data.resources || [];
      const allCategories = categoriesResponse.data.categories || [];
      const itemResourceIds = new Set(allItems.map((item) => item.resource_id).filter(Boolean));
      const userResources = allResources.filter((r) => itemResourceIds.has(r.id));
      const userCategoryNames = new Set<string>();
      allItems.forEach((item) => { if (item.categories) item.categories.forEach((c) => userCategoryNames.add(c)); });
      const userCategories = allCategories.filter((c) => userCategoryNames.has(c.name));
      setTraceItems(allItems);
      setTraceResources(userResources);
      setTraceCategories(userCategories);
      setTraceStats({ resourcesCount: userResources.length, itemsCount: allItems.length, categoriesCount: userCategories.length });
    } catch (err: unknown) {
      setTraceError(err instanceof Error ? err.message : '查询失败');
    } finally {
      setTraceLoading(false);
    }
  };

  const handleViewResourceDetail = async (resourceId: string) => {
    try {
      const response = await hsmemApi.getResource(resourceId);
      setSelectedResource(response.data);
      setResourceDetailOpen(true);
    } catch (err: unknown) {
      setTraceError(err instanceof Error ? err.message : '加载资源详情失败');
    }
  };

  const handleViewCategoryDetail = async (categoryName: string) => {
    try {
      const response = await hsmemApi.getCategoryItems(categoryName);
      const category = traceCategories.find((c) => c.name === categoryName);
      if (category) {
        setSelectedCategory({ ...category, item_ids: response.data.items.map((i) => i.id) });
        setCategoryDetailOpen(true);
      }
    } catch (err: unknown) {
      setTraceError(err instanceof Error ? err.message : '加载分类详情失败');
    }
  };

  const handleViewHsmemItemDetail = (item: MemoryItem) => {
    setSelectedHsmemItem(item);
    setHsmemItemDetailOpen(true);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>记忆提取追溯</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        查看用户记忆的三层架构：Resource Layer → Memory Item Layer → Memory Category Layer
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="用户ID" value={traceUserId} onChange={(e) => setTraceUserId(e.target.value)} placeholder="user_123" sx={{ flex: 1 }} onKeyPress={(e) => e.key === 'Enter' && handleTraceQuery()} />
          <Button variant="contained" onClick={handleTraceQuery} disabled={traceLoading || !traceUserId.trim()}>
            {traceLoading ? <CircularProgress size={20} /> : '查询'}
          </Button>
        </Box>
        {traceError && <Alert severity="error" sx={{ mt: 2 }}>{traceError}</Alert>}
      </Paper>

      {traceStats.itemsCount > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}><Typography variant="h4" color="primary">{traceStats.resourcesCount}</Typography><Typography variant="body2" color="text.secondary">资源总数</Typography></Paper>
          <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}><Typography variant="h4" color="primary">{traceStats.itemsCount}</Typography><Typography variant="body2" color="text.secondary">记忆项总数</Typography></Paper>
          <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}><Typography variant="h4" color="primary">{traceStats.categoriesCount}</Typography><Typography variant="body2" color="text.secondary">分类总数</Typography></Paper>
        </Box>
      )}

      {traceResources.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>资源列表 (Resource Layer)</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow><TableCell>资源ID</TableCell><TableCell>模态类型</TableCell><TableCell>创建时间</TableCell><TableCell>操作</TableCell></TableRow></TableHead>
              <TableBody>
                {traceResources.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell><TableCell>{r.modality}</TableCell><TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell><Button size="small" onClick={() => handleViewResourceDetail(r.id)}>查看详情</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {traceItems.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>记忆项列表 (Memory Item Layer)</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow><TableCell>记忆项ID</TableCell><TableCell>摘要</TableCell><TableCell>类型</TableCell><TableCell>分类</TableCell><TableCell>重要性</TableCell><TableCell>创建时间</TableCell><TableCell>操作</TableCell></TableRow></TableHead>
              <TableBody>
                {traceItems.map((item) => (
                  <TableRow key={item.id} onClick={() => handleViewHsmemItemDetail(item)} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}>
                    <TableCell>{item.id}</TableCell><TableCell>{item.summary}</TableCell><TableCell>{item.memory_type}</TableCell>
                    <TableCell>{item.categories && item.categories.length > 0 ? <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{item.categories.slice(0, 2).map((c, i) => <Chip key={i} label={c} size="small" />)}{item.categories.length > 2 && <Chip label={`+${item.categories.length - 2}`} size="small" />}</Box> : '-'}</TableCell>
                    <TableCell>{item.importance || '-'}</TableCell><TableCell>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}><Button size="small" onClick={() => handleViewHsmemItemDetail(item)}>查看详情</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {traceCategories.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>分类列表 (Memory Category Layer)</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead><TableRow><TableCell>分类名称</TableCell><TableCell>摘要</TableCell><TableCell>记忆项数量</TableCell><TableCell>创建时间</TableCell><TableCell>操作</TableCell></TableRow></TableHead>
              <TableBody>
                {traceCategories.map((cat) => (
                  <TableRow key={cat.id || cat.name}>
                    <TableCell>{cat.name}</TableCell><TableCell>{cat.summary || '-'}</TableCell><TableCell>{cat.item_count}</TableCell><TableCell>{cat.created_at ? new Date(cat.created_at).toLocaleString() : '-'}</TableCell>
                    <TableCell><Button size="small" onClick={() => handleViewCategoryDetail(cat.name)}>查看详情</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {!traceLoading && traceStats.itemsCount === 0 && traceUserId && <Alert severity="info" sx={{ mt: 2 }}>该用户暂无记忆提取记录</Alert>}

      <Dialog open={resourceDetailOpen} onClose={() => setResourceDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>资源详情</DialogTitle>
        <DialogContent>
          {selectedResource && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>资源ID:</strong> {selectedResource.id}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>模态类型:</strong> {selectedResource.modality}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>创建时间:</strong> {new Date(selectedResource.created_at).toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}><strong>原始数据:</strong></Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: 400, overflow: 'auto' }}><pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(selectedResource.data, null, 2)}</pre></Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setResourceDetailOpen(false)}>关闭</Button></DialogActions>
      </Dialog>

      <Dialog open={categoryDetailOpen} onClose={() => setCategoryDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>分类详情: {selectedCategory?.name}</DialogTitle>
        <DialogContent>
          {selectedCategory && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>分类名称:</strong> {selectedCategory.name}</Typography>
              {selectedCategory.summary && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>摘要:</strong> {selectedCategory.summary}</Typography>}
              {selectedCategory.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>描述:</strong> {selectedCategory.description}</Typography>}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>记忆项数量:</strong> {selectedCategory.item_count}</Typography>
              {selectedCategory.created_at && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}><strong>创建时间:</strong> {new Date(selectedCategory.created_at).toLocaleString()}</Typography>}
              {selectedCategory.item_ids && selectedCategory.item_ids.length > 0 && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>包含的记忆项 ({selectedCategory.item_ids.length} 个):</strong></Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 300, overflow: 'auto' }}>
                    {selectedCategory.item_ids.map((itemId) => {
                      const item = traceItems.find((i) => i.id === itemId);
                      return <Chip key={itemId} label={item ? (item.summary || itemId) : itemId} size="small" onClick={() => item && handleViewHsmemItemDetail(item)} sx={{ cursor: item ? 'pointer' : 'default' }} />;
                    })}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setCategoryDetailOpen(false)}>关闭</Button></DialogActions>
      </Dialog>

      <Dialog open={hsmemItemDetailOpen} onClose={() => setHsmemItemDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>记忆项详情</DialogTitle>
        <DialogContent>
          {selectedHsmemItem && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>记忆ID:</strong> {selectedHsmemItem.id}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>摘要:</strong> {selectedHsmemItem.summary || '-'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>类型:</strong> {selectedHsmemItem.memory_type || '-'}</Typography>
              {selectedHsmemItem.categories && selectedHsmemItem.categories.length > 0 && <Box sx={{ mb: 1 }}><Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}><strong>分类:</strong></Typography><Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{selectedHsmemItem.categories.map((c, i) => <Chip key={i} label={c} size="small" />)}</Box></Box>}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>重要性:</strong> {selectedHsmemItem.importance || '-'}</Typography>
              {selectedHsmemItem.content && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>内容:</strong> {selectedHsmemItem.content}</Typography>}
              {selectedHsmemItem.created_at && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>创建时间:</strong> {new Date(selectedHsmemItem.created_at).toLocaleString()}</Typography>}
              {selectedHsmemItem.updated_at && <Typography variant="body2" color="text.secondary"><strong>更新时间:</strong> {new Date(selectedHsmemItem.updated_at).toLocaleString()}</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setHsmemItemDetailOpen(false)}>关闭</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemoryTraceTab;
