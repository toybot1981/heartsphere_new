/**
 * Tab 5：类别管理（Category Layer）— 类别列表/卡片、类别详情弹窗
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
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { hsmemApi } from '../../services/api/hsmem/hsmemApi';
import type { Category } from '../../services/api/hsmem/hsmemApi';
import type { MemoryItem } from '../../services/api/hsmem/hsmemApi';

type CategoryWithItems = Category & { item_ids?: string[]; items?: MemoryItem[] };

const CategoryLayerTab: React.FC = () => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoryDetailOpen, setCategoryDetailOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithItems | null>(null);

  const handleLoadAllCategories = async () => {
    try {
      setCategoryLoading(true);
      setCategoryError(null);
      const response = await hsmemApi.getCategories();
      setAllCategories(response.data.categories || []);
    } catch (err: unknown) {
      setCategoryError(err instanceof Error ? err.message : '加载类别失败');
    } finally {
      setCategoryLoading(false);
    }
  };

  useEffect(() => {
    handleLoadAllCategories();
  }, []);

  const handleViewCategoryDetail = async (categoryName: string) => {
    try {
      const response = await hsmemApi.getCategoryItems(categoryName);
      const category = allCategories.find((c) => c.name === categoryName);
      if (category) {
        const items = response.data.items || [];
        setSelectedCategory({
          ...category,
          item_ids: items.map((i) => i.id),
          items,
        });
        setCategoryDetailOpen(true);
      }
    } catch (err: unknown) {
      setCategoryError(err instanceof Error ? err.message : '加载分类详情失败');
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>类别管理（Category Layer）</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        管理记忆类别，查看每个类别包含的记忆项，支持按类别进行区分管理
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Button variant="contained" onClick={handleLoadAllCategories} disabled={categoryLoading}>
          {categoryLoading ? <CircularProgress size={20} /> : '刷新类别列表'}
        </Button>
        {categoryError && <Alert severity="error" sx={{ mt: 2 }}>{categoryError}</Alert>}
      </Paper>

      {allCategories.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {allCategories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id || category.name}>
              <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => handleViewCategoryDetail(category.name)}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{category.name}</Typography>
                  {category.summary && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{category.summary}</Typography>}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                    <Chip label={`${category.item_count} 个记忆项`} size="small" color="primary" />
                    {category.created_at && <Typography variant="caption" color="text.secondary">{new Date(category.created_at).toLocaleDateString()}</Typography>}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {allCategories.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>类别名称</TableCell>
                <TableCell>摘要</TableCell>
                <TableCell>记忆项数量</TableCell>
                <TableCell>创建时间</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allCategories.map((category) => (
                <TableRow key={category.id || category.name}>
                  <TableCell><Typography variant="subtitle1" fontWeight="bold">{category.name}</Typography></TableCell>
                  <TableCell>{category.summary || '-'}</TableCell>
                  <TableCell><Chip label={category.item_count} size="small" color="primary" /></TableCell>
                  <TableCell>{category.created_at ? new Date(category.created_at).toLocaleString() : '-'}</TableCell>
                  <TableCell><Button size="small" onClick={() => handleViewCategoryDetail(category.name)}>查看详情</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!categoryLoading && allCategories.length === 0 && <Alert severity="info" sx={{ mt: 2 }}>暂无类别数据，请点击"刷新类别列表"加载</Alert>}

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
              {selectedCategory.items && selectedCategory.items.length > 0 && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>包含的记忆项 ({selectedCategory.items.length} 个):</strong></Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 300, overflow: 'auto' }}>
                    {selectedCategory.items.map((item) => (
                      <Chip key={item.id} label={item.summary || item.id} size="small" />
                    ))}
                  </Box>
                </>
              )}
              {selectedCategory.item_ids && selectedCategory.item_ids.length > 0 && !selectedCategory.items && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>包含的记忆项 ID ({selectedCategory.item_ids.length} 个):</strong></Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 300, overflow: 'auto' }}>
                    {selectedCategory.item_ids.map((id) => <Chip key={id} label={id} size="small" />)}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setCategoryDetailOpen(false)}>关闭</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryLayerTab;
