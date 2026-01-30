/**
 * Tab 3：资源管理（Resource Layer）— 筛选、列表、资源详情弹窗
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
} from '@mui/material';
import { hsmemApi } from '../../services/api/hsmem/hsmemApi';
import type { Resource } from '../../services/api/hsmem/hsmemApi';

const ResourceLayerTab: React.FC = () => {
  const [resourceModalityFilter, setResourceModalityFilter] = useState<string>('all');
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [resourceDetailOpen, setResourceDetailOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const handleLoadAllResources = async () => {
    try {
      setResourceLoading(true);
      setResourceError(null);
      const response = await hsmemApi.getAllResources();
      setAllResources(response.data.resources || []);
    } catch (err: unknown) {
      setResourceError(err instanceof Error ? err.message : '加载资源失败');
    } finally {
      setResourceLoading(false);
    }
  };

  useEffect(() => {
    handleLoadAllResources();
  }, []);

  const handleViewResourceDetail = async (resourceId: string) => {
    try {
      const response = await hsmemApi.getResource(resourceId);
      setSelectedResource(response.data);
      setResourceDetailOpen(true);
    } catch (err: unknown) {
      setResourceError(err instanceof Error ? err.message : '加载资源详情失败');
    }
  };

  const filtered = allResources.filter((r) => resourceModalityFilter === 'all' || r.modality === resourceModalityFilter);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>资源管理（Resource Layer）</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        管理多模态资源：对话（Conversation）、文本（Text）、文档（Document）、音频（Audio）等
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>模态类型筛选</InputLabel>
            <Select value={resourceModalityFilter} onChange={(e) => setResourceModalityFilter(e.target.value)} label="模态类型筛选">
              <MenuItem value="all">全部</MenuItem>
              <MenuItem value="conversation">对话（Conversation）</MenuItem>
              <MenuItem value="text">文本（Text）</MenuItem>
              <MenuItem value="document">文档（Document）</MenuItem>
              <MenuItem value="audio">音频（Audio）</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleLoadAllResources} disabled={resourceLoading}>
            {resourceLoading ? <CircularProgress size={20} /> : '刷新资源列表'}
          </Button>
        </Box>
        {resourceError && <Alert severity="error" sx={{ mt: 2 }}>{resourceError}</Alert>}
      </Paper>

      {allResources.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {['conversation', 'text', 'document', 'audio'].map((modality) => {
            const count = allResources.filter((r) => r.modality === modality).length;
            return (
              <Card key={modality} sx={{ flex: 1 }}>
                <CardContent>
                  <Typography variant="h4" color="primary">{count}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {modality === 'conversation' ? '对话' : modality === 'text' ? '文本' : modality === 'document' ? '文档' : '音频'}
                  </Typography>
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
                <TableCell>资源ID</TableCell>
                <TableCell>模态类型</TableCell>
                <TableCell>创建时间</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>{resource.id}</TableCell>
                  <TableCell>
                    <Chip label={resource.modality} size="small" color={resource.modality === 'conversation' ? 'primary' : resource.modality === 'text' ? 'secondary' : resource.modality === 'document' ? 'success' : 'info'} />
                  </TableCell>
                  <TableCell>{new Date(resource.created_at).toLocaleString()}</TableCell>
                  <TableCell><Button size="small" onClick={() => handleViewResourceDetail(resource.id)}>查看详情</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!resourceLoading && allResources.length === 0 && <Alert severity="info" sx={{ mt: 2 }}>暂无资源数据，请点击"刷新资源列表"加载</Alert>}

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
    </Box>
  );
};

export default ResourceLayerTab;
