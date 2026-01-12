import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  TextField,
  InputAdornment,
  Typography,
  Divider,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import DownloadIcon from '@mui/icons-material/Download';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { SessionCreationWizard } from './SessionCreationWizard';
import { ConfirmDialog } from './ConfirmDialog';
import { SessionRenameDialog } from './SessionRenameDialog';
import { SessionStatusIndicator } from './SessionStatusIndicator';
import { useToast } from './Toast';
import { exportSession } from '../utils/sessionExport';
import { MentisApiService } from '../services/mentisApi';

interface Session {
  id?: string;
  sessionId?: string;
  title?: string;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  messageCount?: number;
}

interface SessionSidebarProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onSessionDelete: (sessionId: string) => void;
}

/**
 * 会话列表侧边栏组件
 * 显示所有会话，支持搜索、过滤、快速创建和操作
 */
export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onSessionDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const toast = useToast();

  // 调试：检查接收到的数据
  React.useEffect(() => {
    console.log('SessionSidebar - Received sessions:', sessions.length, sessions);
    console.log('SessionSidebar - Current session ID:', currentSessionId);
  }, [sessions, currentSessionId]);

  // 过滤会话
  const filteredSessions = sessions.filter(session => {
    const sessionId = session.id || session.sessionId || '';
    const title = session.title || '';
    return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sessionId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // 处理会话菜单
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, sessionId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedSessionId(sessionId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRename = () => {
    handleMenuClose();
    setRenameDialogOpen(true);
  };

  const handleArchive = () => {
    handleMenuClose();
    setArchiveConfirmOpen(true);
  };

  const handleDelete = () => {
    handleMenuClose();
    setDeleteConfirmOpen(true);
  };

  const handleRenameConfirm = (newTitle: string) => {
    if (selectedSessionId) {
      // TODO: 调用 API 更新会话名称
      toast.showSuccess('会话已重命名');
      // 触发父组件更新
      const session = sessions.find(s => (s.id || s.sessionId) === selectedSessionId);
      if (session) {
        session.title = newTitle;
      }
    }
    setSelectedSessionId(null);
  };

  const handleArchiveConfirm = async () => {
    if (!selectedSessionId) return;
    
    try {
      // TODO: 调用 API 归档会话
      // await MentisApiService.archiveSession(selectedSessionId);
      
      toast.showSuccess('会话已归档');
      
      // 触发父组件更新（如果提供了回调）
      // onSessionArchive?.(selectedSessionId);
    } catch (error: any) {
      console.error('归档会话失败:', error);
      toast.showError(error?.message || '归档会话失败');
    } finally {
      setArchiveConfirmOpen(false);
      setSelectedSessionId(null);
    }
  };

  const handleExport = async () => {
    if (!selectedSessionId) return;
    
    try {
      handleMenuClose();
      
      // 获取会话详情
      const session = sessions.find(s => (s.id || s.sessionId) === selectedSessionId);
      if (!session) {
        toast.showError('会话不存在');
        return;
      }

      // 获取消息列表和任务列表（TODO: 需要实现 API）
      const exportData = {
        sessionId: selectedSessionId,
        title: session.title || '未命名会话',
        createdAt: session.createdAt || '',
        updatedAt: session.updatedAt || (session as any).lastActiveAt || session.createdAt,
        messages: [], // TODO: 从 API 获取
        tasks: [], // TODO: 从 API 获取
      };

      // 导出为 JSON
      exportSession(exportData, 'json');
      toast.showSuccess('会话已导出');
      setSelectedSessionId(null);
    } catch (error) {
      console.error('导出会话失败:', error);
      toast.showError('导出会话失败');
    }
  };

  const confirmDelete = () => {
    if (selectedSessionId) {
      try {
        onSessionDelete(selectedSessionId);
        toast.showSuccess('会话已删除');
      } catch (error) {
        toast.showError('删除会话失败');
      }
    }
    setDeleteConfirmOpen(false);
    setSelectedSessionId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%',
      minWidth: 300,
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'background.paper',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 1,
    }}>
      {/* 搜索和创建区域 */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="搜索会话..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            onClick={() => setWizardOpen(true)}
            title="点击创建新会话（或按 Ctrl+N）"
          >
            <AddIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">新建会话</Typography>
          </Box>
          <Box
            sx={{
              ml: 1,
              p: 1,
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: 1,
              cursor: 'pointer',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
            onClick={async () => {
              try {
                await onNewSession();
              } catch (error) {
                console.error('快速创建会话失败:', error);
              }
            }}
            title="快速创建默认会话"
          >
            <AddIcon fontSize="small" />
          </Box>
        </Box>
      </Box>

      {/* 会话列表 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {filteredSessions.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? '未找到匹配的会话' : '暂无会话，点击上方按钮创建'}
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredSessions.map((session) => {
              const sessionId = session.id || session.sessionId || '';
              return (
              <ListItem
                key={sessionId}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleMenuOpen(e, sessionId)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={sessionId === currentSessionId}
                  onClick={() => onSessionSelect(sessionId)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon>
                    <ChatBubbleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SessionStatusIndicator
                          status={(session.status || 'ACTIVE') as 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED' | 'ERROR'}
                          size="small"
                        />
                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                          {session.title || '未命名会话'}
                        </Typography>
                        {session.messageCount !== undefined && session.messageCount > 0 && (
                          <Chip
                            label={session.messageCount}
                            size="small"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(session.updatedAt || session.createdAt)}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      {/* 会话操作菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRename}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          重命名
        </MenuItem>
        <MenuItem onClick={handleArchive}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          归档
        </MenuItem>
        <MenuItem onClick={handleExport}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          导出
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          删除
        </MenuItem>
      </Menu>

      {/* 会话创建向导 */}
      <SessionCreationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSessionCreated={() => {
          setWizardOpen(false);
          onNewSession();
        }}
      />

      {/* 重命名对话框 */}
      <SessionRenameDialog
        open={renameDialogOpen}
        currentTitle={
          sessions.find(s => (s.id || s.sessionId) === selectedSessionId)?.title || '未命名会话'
        }
        onClose={() => {
          setRenameDialogOpen(false);
          setSelectedSessionId(null);
        }}
        onConfirm={handleRenameConfirm}
      />

      {/* 归档确认对话框 */}
      <ConfirmDialog
        open={archiveConfirmOpen}
        title="归档会话"
        message={`确定要归档会话 "${sessions.find(s => (s.id || s.sessionId) === selectedSessionId)?.title || '未命名会话'}" 吗？归档后会话将不再显示在列表中。`}
        confirmText="归档"
        cancelText="取消"
        confirmColor="warning"
        onConfirm={handleArchiveConfirm}
        onCancel={() => {
          setArchiveConfirmOpen(false);
          setSelectedSessionId(null);
        }}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="删除会话"
        message={`确定要删除会话 "${sessions.find(s => (s.id || s.sessionId) === selectedSessionId)?.title || '未命名会话'}" 吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setSelectedSessionId(null);
        }}
      />
    </Box>
  );
};
