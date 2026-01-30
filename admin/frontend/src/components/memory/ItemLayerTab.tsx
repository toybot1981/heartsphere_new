/**
 * Tab 4：记忆项管理（Item Layer）— 筛选、列表、项详情弹窗
 */
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { hsmemApi } from '../../services/api/hsmem/hsmemApi';
import type { MemoryItem } from '../../services/api/hsmem/hsmemApi';

const ItemLayerTab: React.FC = () => {
  const [itemMemoryTypeFilter, setItemMemoryTypeFilter] = useState<string>('all');
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>('all');
  const [allItems, setAllItems] = useState<MemoryItem[]>([]);
  const [itemLoading, setItemLoading] = useState(false);
  const [itemError, setItemError] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableMemoryTypes, setAvailableMemoryTypes] = useState<string[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MemoryItem | null>(null);

  const handleLoadAllItems = async () => {
    try {
      setItemLoading(true);
      setItemError(null);
      const response = await hsmemApi.getAllItems();
      const items = response.data.items || [];
      setAllItems(items);
      const categoriesSet = new Set<string>();
      const memoryTypesSet = new Set<string>();
      items.forEach((item) => {
        if (item.categories) item.categories.forEach((c) => categoriesSet.add(c));
        if (item.memory_type) memoryTypesSet.add(item.memory_type);
      });
      setAvailableCategories(Array.from(categoriesSet).sort());
      setAvailableMemoryTypes(Array.from(memoryTypesSet).sort());
    } catch (err: unknown) {
      setItemError(err instanceof Error ? err.message : '加载记忆项失败');
    } finally {
      setItemLoading(false);
    }
  };

  useEffect(() => {
    handleLoadAllItems();
  }, []);

  const handleViewItemDetail = (item: MemoryItem) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  const filtered = allItems.filter((item) => {
    const typeMatch = itemMemoryTypeFilter === 'all' || item.memory_type === itemMemoryTypeFilter;
    const categoryMatch = itemCategoryFilter === 'all' || (item.categories && item.categories.includes(itemCategoryFilter));
    return typeMatch && categoryMatch;
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>记忆项管理（Memory Item Layer）</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        管理从资源中提取的记忆项，按记忆类型（Event、Habit、Asset、Work等）和类别进行区分
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>记忆类型筛选</InputLabel>
              <Select value={itemMemoryTypeFilter} onChange={(e) => setItemMemoryTypeFilter(e.target.value)} label="记忆类型筛选">
                <MenuItem value="all">全部类型</MenuItem>
                {availableMemoryTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>类别筛选</InputLabel>
              <Select value={itemCategoryFilter} onChange={(e) => setItemCategoryFilter(e.target.value)} label="类别筛选">
                <MenuItem value="all">全部类别</MenuItem>
                {availableCategories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Button variant="contained" onClick={handleLoadAllItems} disabled={itemLoading}>
          {itemLoading ? <CircularProgress size={20} /> : '刷新记忆项列表'}
        </Button>
        {itemError && <Alert severity="error" sx={{ mt: 2 }}>{itemError}</Alert>}
      </Paper>

      {allItems.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          {availableMemoryTypes.map((type) => {
            const count = allItems.filter((item) => item.memory_type === type).length;
            return (
              <Card key={type} sx={{ minWidth: 150 }}>
                <CardContent>
                  <Typography variant="h4" color="primary">{count}</Typography>
                  <Typography variant="body2" color="text.secondary">{type}</Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {filtered.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>记忆项ID</TableCell>
                <TableCell>摘要</TableCell>
                <TableCell>记忆类型</TableCell>
                <TableCell>分类</TableCell>
                <TableCell>重要性</TableCell>
                <TableCell>创建时间</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} onClick={() => handleViewItemDetail(item)} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.summary}</TableCell>
                  <TableCell>
                    <Chip label={item.memory_type} size="small" color={item.memory_type === 'Event' ? 'primary' : item.memory_type === 'Habit' ? 'secondary' : item.memory_type === 'Asset' ? 'success' : item.memory_type === 'Work' ? 'info' : 'default'} />
                  </TableCell>
                  <TableCell>
                    {item.categories && item.categories.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {item.categories.slice(0, 2).map((cat, idx) => <Chip key={idx} label={cat} size="small" />)}
                        {item.categories.length > 2 && <Chip label={`+${item.categories.length - 2}`} size="small" />}
                      </Box>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{item.importance || '-'}</TableCell>
                  <TableCell>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}><Button size="small" onClick={() => handleViewItemDetail(item)}>查看详情</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!itemLoading && allItems.length === 0 && <Alert severity="info" sx={{ mt: 2 }}>暂无记忆项数据，请点击"刷新记忆项列表"加载</Alert>}

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>记忆项详情</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>记忆ID:</strong> {selectedItem.id}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>摘要:</strong> {selectedItem.summary || '-'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>类型:</strong> {selectedItem.memory_type || '-'}</Typography>
              {selectedItem.categories && selectedItem.categories.length > 0 && <Box sx={{ mb: 1 }}><Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}><strong>分类:</strong></Typography><Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{selectedItem.categories.map((c, i) => <Chip key={i} label={c} size="small" />)}</Box></Box>}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>重要性:</strong> {selectedItem.importance || '-'}</Typography>
              {selectedItem.content && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>内容:</strong> {selectedItem.content}</Typography>}
              {selectedItem.created_at && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>创建时间:</strong> {new Date(selectedItem.created_at).toLocaleString()}</Typography>}
              {selectedItem.updated_at && <Typography variant="body2" color="text.secondary"><strong>更新时间:</strong> {new Date(selectedItem.updated_at).toLocaleString()}</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setDetailOpen(false)}>关闭</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItemLayerTab;
