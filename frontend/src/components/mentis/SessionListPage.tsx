import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { MentisApiService, Session } from '../../services/mentis/mentisApi';


/**
 * 会话列表页面
 */
export const SessionListPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await MentisApiService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('加载会话列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const session = await MentisApiService.createSession(newSessionTitle || undefined);
      setSessions(prev => [session, ...prev]);
      setCreateDialogOpen(false);
      setNewSessionTitle('');
    } catch (error) {
      console.error('创建会话失败:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('确定要删除这个会话吗？')) return;
    
    try {
      await MentisApiService.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    } catch (error: any) {
      console.error('删除会话失败:', error);
      alert('删除会话失败: ' + (error.message || '未知错误'));
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'error' => {
    switch (status) {
      case 'ACTIVE':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'PAUSED':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">会话列表</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          新建会话
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
        {sessions.map((session) => (
          <Card key={session.sessionId}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {session.title || '未命名会话'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip label={session.status} color={getStatusColor(session.status)} size="small" />
                <Chip label={session.vmStatus} size="small" />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block">
                创建时间: {new Date(session.createdAt).toLocaleString()}
              </Typography>
              {session.lastActiveAt && (
                <Typography variant="caption" color="text.secondary" display="block">
                  最后活跃: {new Date(session.lastActiveAt).toLocaleString()}
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" href={`/mentis/session/${session.sessionId}`}>
                打开
              </Button>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteSession(session.sessionId)}
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Box>

      {sessions.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            暂无会话，点击"新建会话"开始
          </Typography>
        </Box>
      )}

      {/* 创建会话对话框 */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>新建会话</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="会话标题"
            fullWidth
            variant="outlined"
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
            placeholder="可选，留空将使用默认标题"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button onClick={handleCreateSession} variant="contained">创建</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
