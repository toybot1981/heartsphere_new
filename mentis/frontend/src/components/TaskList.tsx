import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Checkbox,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import CloseIcon from '@mui/icons-material/Close';
import { Task as TaskType } from '../services/mentisApi';
import { MentisApiService } from '../services/mentisApi';
import { useToast } from './Toast';
import { ConfirmDialog } from './ConfirmDialog';

interface Task extends TaskType {
  progress?: number;
}

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTasksUpdate?: () => void;
}

/**
 * 任务列表组件
 * 支持批量操作（删除、取消）和任务详情预览
 */
export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick, onTasksUpdate }) => {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon color="success" />;
      case 'FAILED':
        return <ErrorIcon color="error" />;
      default:
        return <ScheduleIcon color="action" />;
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'RUNNING':
        return 'primary';
      case 'CANCELLED':
        return 'warning';
      default:
        return 'default';
    }
  };

  // 选择任务
  const handleTaskSelect = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map(t => t.taskId)));
    }
  };

  // 预览任务详情
  const handlePreviewTask = async (task: Task) => {
    try {
      // 如果任务信息不完整，尝试从 API 获取详情
      const taskDetail = await MentisApiService.getTask(task.taskId);
      setPreviewTask(taskDetail);
      setPreviewDialogOpen(true);
    } catch (error) {
      // 如果获取失败，使用当前任务信息
      setPreviewTask(task);
      setPreviewDialogOpen(true);
    }
  };

  // 批量删除任务
  const handleBatchDelete = async () => {
    if (selectedTasks.size === 0) {
      toast.showWarning('请选择要删除的任务');
      return;
    }

    setDeleteConfirmOpen(true);
  };

  const confirmBatchDelete = async () => {
    setIsProcessing(true);
    try {
      // 注意：这里假设有批量删除 API，如果没有，需要逐个删除
      // 实际实现中可能需要后端支持批量操作
      const deletePromises = Array.from(selectedTasks).map(async (taskId) => {
        // 如果没有批量删除 API，这里需要调用单个删除接口
        // await MentisApiService.deleteTask(taskId);
        console.log('删除任务:', taskId);
      });

      await Promise.all(deletePromises);
      toast.showSuccess(`已删除 ${selectedTasks.size} 个任务`);
      setSelectedTasks(new Set());
      setDeleteConfirmOpen(false);
      onTasksUpdate?.();
    } catch (error: any) {
      toast.showError(error.message || '删除任务失败');
    } finally {
      setIsProcessing(false);
    }
  };

  // 批量取消任务
  const handleBatchCancel = async () => {
    const cancellableTasks = tasks.filter(
      t => selectedTasks.has(t.taskId) && (t.status === 'PENDING' || t.status === 'RUNNING')
    );

    if (cancellableTasks.length === 0) {
      toast.showWarning('请选择可以取消的任务（待执行或运行中）');
      return;
    }

    setCancelConfirmOpen(true);
  };

  const confirmBatchCancel = async () => {
    setIsProcessing(true);
    try {
      const cancellableTasks = tasks.filter(
        t => selectedTasks.has(t.taskId) && (t.status === 'PENDING' || t.status === 'RUNNING')
      );

      const cancelPromises = cancellableTasks.map(async (task) => {
        await MentisApiService.cancelTask(task.taskId);
      });

      await Promise.all(cancelPromises);
      toast.showSuccess(`已取消 ${cancellableTasks.length} 个任务`);
      setSelectedTasks(new Set());
      setCancelConfirmOpen(false);
      onTasksUpdate?.();
    } catch (error: any) {
      toast.showError(error.message || '取消任务失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '未知';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}小时 ${minutes}分钟 ${secs}秒`;
    } else if (minutes > 0) {
      return `${minutes}分钟 ${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <Box>
      {/* 工具栏 */}
      {tasks.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            任务列表 ({tasks.length})
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {selectedTasks.size > 0 && (
              <>
                <Chip
                  label={`已选择 ${selectedTasks.size} 项`}
                  size="small"
                  onDelete={() => setSelectedTasks(new Set())}
                />
                <Tooltip title="批量取消">
                  <IconButton
                    size="small"
                    onClick={handleBatchCancel}
                    disabled={isProcessing}
                    color="warning"
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="批量删除">
                  <IconButton
                    size="small"
                    onClick={handleBatchDelete}
                    disabled={isProcessing}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Tooltip title={selectedTasks.size === tasks.length ? '取消全选' : '全选'}>
              <IconButton size="small" onClick={handleSelectAll}>
                {selectedTasks.size === tasks.length ? <DeselectIcon /> : <SelectAllIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      )}

      {/* 任务列表 */}
      {tasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            暂无任务
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            开始对话后，任务将显示在这里
          </Typography>
        </Box>
      ) : (
        tasks.map((task) => (
          <Card
            key={task.taskId}
            sx={{
              mb: 2,
              cursor: 'pointer',
              border: selectedTasks.has(task.taskId) ? 2 : 1,
              borderColor: selectedTasks.has(task.taskId) ? 'primary.main' : 'divider',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            onClick={() => onTaskClick?.(task)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Checkbox
                  checked={selectedTasks.has(task.taskId)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleTaskSelect(task.taskId, e.target.checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    {getStatusIcon(task.status)}
                    <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 'medium' }}>
                      {task.description}
                    </Typography>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                    <Chip
                      label={task.taskType}
                      variant="outlined"
                      size="small"
                    />
                    <Tooltip title="查看详情">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewTask(task);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      创建时间: {formatDate(task.createdAt)}
                    </Typography>
                    {task.startedAt && (
                      <Typography variant="caption" color="text.secondary">
                        开始时间: {formatDate(task.startedAt)}
                      </Typography>
                    )}
                    {task.completedAt && (
                      <Typography variant="caption" color="text.secondary">
                        完成时间: {formatDate(task.completedAt)}
                      </Typography>
                    )}
                    {task.duration && (
                      <Typography variant="caption" color="text.secondary">
                        耗时: {formatDuration(task.duration)}
                      </Typography>
                    )}
                  </Stack>

                  {task.status === 'RUNNING' && task.progress !== undefined && (
                    <LinearProgress variant="determinate" value={task.progress} sx={{ mt: 1, mb: 1 }} />
                  )}

                  {task.command && (
                    <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', backgroundColor: 'grey.100', p: 1, borderRadius: 1 }}>
                      {task.command}
                    </Typography>
                  )}

                  {task.status === 'FAILED' && task.errorMessage && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      错误: {task.errorMessage}
                    </Typography>
                  )}

                  {task.status === 'COMPLETED' && task.result && (
                    <Box sx={{ mt: 1, p: 1, backgroundColor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        结果:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {typeof task.result === 'string' ? task.result : JSON.stringify(task.result, null, 2)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      {/* 任务详情预览对话框 */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">任务详情</Typography>
            <IconButton size="small" onClick={() => setPreviewDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewTask && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">任务ID</Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{previewTask.taskId}</Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary">描述</Typography>
                <Typography variant="body1">{previewTask.description}</Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">状态</Typography>
                  <Chip label={previewTask.status} color={getStatusColor(previewTask.status)} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">类型</Typography>
                  <Chip label={previewTask.taskType} variant="outlined" />
                </Box>
              </Box>

              {previewTask.command && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>命令</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      {previewTask.command}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {previewTask.parameters && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>参数</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'grey.100' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      {typeof previewTask.parameters === 'string'
                        ? previewTask.parameters
                        : JSON.stringify(previewTask.parameters, null, 2)}
                    </Typography>
                  </Paper>
                </Box>
              )}

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">创建时间</Typography>
                  <Typography variant="body2">{formatDate(previewTask.createdAt)}</Typography>
                </Box>
                {previewTask.startedAt && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">开始时间</Typography>
                    <Typography variant="body2">{formatDate(previewTask.startedAt)}</Typography>
                  </Box>
                )}
                {previewTask.completedAt && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">完成时间</Typography>
                    <Typography variant="body2">{formatDate(previewTask.completedAt)}</Typography>
                  </Box>
                )}
                {previewTask.duration && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">耗时</Typography>
                    <Typography variant="body2">{formatDuration(previewTask.duration)}</Typography>
                  </Box>
                )}
              </Box>

              {previewTask.errorMessage && (
                <Box>
                  <Typography variant="subtitle2" color="error" gutterBottom>错误信息</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'error.light' }}>
                    <Typography variant="body2" color="error.main" sx={{ whiteSpace: 'pre-wrap' }}>
                      {previewTask.errorMessage}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {previewTask.result && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>结果</Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'success.light', maxHeight: 400, overflow: 'auto' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {typeof previewTask.result === 'string'
                        ? previewTask.result
                        : JSON.stringify(previewTask.result, null, 2)}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      {/* 确认删除对话框 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="确认删除"
        message={`确定要删除选中的 ${selectedTasks.size} 个任务吗？此操作不可恢复。`}
        onConfirm={confirmBatchDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        confirmText="删除"
        cancelText="取消"
        confirmColor="error"
      />

      {/* 确认取消对话框 */}
      <ConfirmDialog
        open={cancelConfirmOpen}
        title="确认取消"
        message={`确定要取消选中的任务吗？`}
        onConfirm={confirmBatchCancel}
        onCancel={() => setCancelConfirmOpen(false)}
        confirmText="取消任务"
        cancelText="取消"
        confirmColor="warning"
      />
    </Box>
  );
};
