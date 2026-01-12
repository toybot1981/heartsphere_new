import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { MentisApiService, McpServerConfig } from '../services/mentisApi';
import { useToast } from './Toast';

/**
 * MCP 服务器配置管理组件
 */
export const McpConfigManager: React.FC = () => {
  const [configs, setConfigs] = useState<McpServerConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<McpServerConfig | null>(null);
  const [formData, setFormData] = useState<Partial<McpServerConfig>>({
    name: '',
    serverType: 'tavily',
    serverUrl: '',
    apiKey: '',
    enabled: true,
    description: '',
  });
  const [testing, setTesting] = useState<number | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await MentisApiService.getMcpConfigs();
      setConfigs(data);
    } catch (error: any) {
      toast.showError('加载 MCP 配置失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (config?: McpServerConfig) => {
    if (config) {
      setEditingConfig(config);
      setFormData(config);
    } else {
      setEditingConfig(null);
      setFormData({
        name: '',
        serverType: 'tavily',
        serverUrl: 'https://mcp.tavily.com/mcp/?tavilyApiKey=',
        apiKey: '',
        enabled: true,
        description: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConfig(null);
    setFormData({
      name: '',
      serverType: 'tavily',
      serverUrl: '',
      apiKey: '',
      enabled: true,
      description: '',
    });
  };

  const handleSave = async () => {
    try {
      if (editingConfig?.id) {
        await MentisApiService.updateMcpConfig(editingConfig.id, formData);
        toast.showSuccess('MCP 配置已更新');
      } else {
        await MentisApiService.createMcpConfig(formData);
        toast.showSuccess('MCP 配置已创建');
      }
      handleCloseDialog();
      loadConfigs();
    } catch (error: any) {
      toast.showError('保存失败: ' + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('确定要删除这个 MCP 配置吗？')) {
      return;
    }
    try {
      await MentisApiService.deleteMcpConfig(id);
      toast.showSuccess('MCP 配置已删除');
      loadConfigs();
    } catch (error: any) {
      toast.showError('删除失败: ' + error.message);
    }
  };

  const handleToggle = async (id: number, enabled: boolean) => {
    try {
      await MentisApiService.toggleMcpConfig(id, enabled);
      toast.showSuccess(enabled ? 'MCP 配置已启用' : 'MCP 配置已禁用');
      loadConfigs();
    } catch (error: any) {
      toast.showError('操作失败: ' + error.message);
    }
  };

  const handleTest = async (id: number) => {
    try {
      setTesting(id);
      const result = await MentisApiService.testMcpConnection(id);
      if (result.connected) {
        toast.showSuccess('连接测试成功');
      } else {
        toast.showWarning('连接测试失败: ' + result.message);
      }
      loadConfigs();
    } catch (error: any) {
      toast.showError('测试失败: ' + error.message);
    } finally {
      setTesting(null);
    }
  };

  const getStatusChip = (config: McpServerConfig) => {
    if (config.connectionStatus === 'CONNECTED') {
      return <Chip icon={<CheckCircleIcon />} label="已连接" color="success" size="small" />;
    } else if (config.connectionStatus === 'ERROR') {
      return <Chip icon={<ErrorIcon />} label="错误" color="error" size="small" />;
    } else {
      return <Chip label="未连接" color="default" size="small" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">MCP 服务器配置</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadConfigs}
            disabled={loading}
          >
            刷新
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            新建配置
          </Button>
        </Stack>
      </Box>

      {loading && configs.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>名称</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>连接状态</TableCell>
                <TableCell>启用</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>{config.name}</TableCell>
                  <TableCell>{config.serverType}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {config.serverUrl}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(config)}</TableCell>
                  <TableCell>
                    {config.lastTestedAt && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(config.lastTestedAt).toLocaleString()}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={config.enabled}
                      onChange={(e) => handleToggle(config.id!, e.target.checked)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleTest(config.id!)}
                        disabled={testing === config.id}
                      >
                        {testing === config.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <RefreshIcon fontSize="small" />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(config)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(config.id!)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {configs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      暂无 MCP 配置，点击"新建配置"添加
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 配置对话框 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConfig ? '编辑 MCP 配置' : '新建 MCP 配置'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="配置名称"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>服务器类型</InputLabel>
              <Select
                value={formData.serverType}
                label="服务器类型"
                onChange={(e) => {
                  const type = e.target.value;
                  setFormData({
                    ...formData,
                    serverType: type,
                    serverUrl: type === 'tavily' 
                      ? 'https://mcp.tavily.com/mcp/?tavilyApiKey=' 
                      : formData.serverUrl,
                  });
                }}
              >
                <MenuItem value="tavily">Tavily (搜索)</MenuItem>
                <MenuItem value="filesystem">Filesystem</MenuItem>
                <MenuItem value="github">GitHub</MenuItem>
                <MenuItem value="custom">自定义</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="服务器 URL"
              fullWidth
              value={formData.serverUrl}
              onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })}
              required
              helperText="对于 Tavily，URL 格式: https://mcp.tavily.com/mcp/?tavilyApiKey=YOUR_API_KEY"
            />
            <TextField
              label="API Key"
              fullWidth
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              helperText="如果 URL 中已包含 API Key，可以留空"
            />
            <TextField
              label="描述"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
              }
              label="启用此配置"
            />
            {formData.serverType === 'tavily' && (
              <Alert severity="info">
                提示：Tavily MCP 服务器用于网络搜索。请确保 API Key 已正确配置在 URL 中。
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name || !formData.serverUrl}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
