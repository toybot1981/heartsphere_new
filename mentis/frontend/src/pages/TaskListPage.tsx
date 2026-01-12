import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { MentisApiService, Task } from '../services/mentisApi';

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

/**
 * 任务详情对话框
 */
const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({ task, open, onClose }) => {
  if (!task) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {task.status === 'COMPLETED' && <CheckCircleIcon color="success" />}
          {task.status === 'FAILED' && <ErrorIcon color="error" />}
          {(task.status === 'PENDING' || task.status === 'RUNNING') && <ScheduleIcon color="action" />}
          {task.description}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">任务ID</Typography>
          <Typography variant="body1">{task.taskId}</Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">状态</Typography>
          <Chip
            label={task.status}
            color={
              task.status === 'COMPLETED' ? 'success' :
              task.status === 'FAILED' ? 'error' :
              task.status === 'RUNNING' ? 'primary' : 'default'
            }
            size="small"
            sx={{ mt: 0.5 }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">类型</Typography>
          <Typography variant="body1">{task.taskType}</Typography>
        </Box>
        {task.command && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">命令</Typography>
            <Typography variant="body2" component="pre" sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1, overflow: 'auto' }}>
              {task.command}
            </Typography>
          </Box>
        )}
        {task.result && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">结果</Typography>
            <Typography variant="body2" component="pre" sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1, overflow: 'auto', maxHeight: '300px' }}>
              {task.result}
            </Typography>
          </Box>
        )}
        {task.errorMessage && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">错误信息</Typography>
            <Typography variant="body2" color="error" component="pre" sx={{ p: 1, bgcolor: 'error.light', borderRadius: 1, overflow: 'auto' }}>
              {task.errorMessage}
            </Typography>
          </Box>
        )}
        {task.startedAt && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">开始时间</Typography>
            <Typography variant="body2">{new Date(task.startedAt).toLocaleString()}</Typography>
          </Box>
        )}
        {task.completedAt && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">完成时间</Typography>
            <Typography variant="body2">{new Date(task.completedAt).toLocaleString()}</Typography>
          </Box>
        )}
        {task.duration !== undefined && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">执行时长</Typography>
            <Typography variant="body2">{task.duration} 秒</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * 任务列表页面
 */
export const TaskListPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadTasks();
    }
  }, [sessionId]);

  const loadTasks = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const taskList = await MentisApiService.getTasks(sessionId);
      setTasks(Array.isArray(taskList) ? taskList : []);
    } catch (error) {
      console.error('加载任务列表失败:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

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

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'RUNNING':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">任务列表</Typography>
          {sessionId && (
            <Typography variant="body2" color="text.secondary">
              会话: {sessionId}
            </Typography>
          )}
        </Box>
        <Button variant="outlined" onClick={loadTasks} disabled={loading}>
          刷新
        </Button>
      </Box>

      {loading && tasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">加载中...</Typography>
        </Box>
      ) : tasks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">暂无任务</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 2 }}>
          {tasks.map((task) => (
            <Card key={task.taskId || task.id} sx={{ cursor: 'pointer' }} onClick={() => handleTaskClick(task)}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                  {getStatusIcon(task.status)}
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {task.description}
                  </Typography>
                  <Chip label={task.status} color={getStatusColor(task.status)} size="small" />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  类型: {task.taskType}
                </Typography>
                {task.status === 'RUNNING' && (
                  <LinearProgress sx={{ mt: 1 }} />
                )}
                {task.errorMessage && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    {task.errorMessage.substring(0, 100)}...
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskClick(task);
                  }}
                >
                  查看详情
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      <TaskDetailDialog task={selectedTask} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
};
