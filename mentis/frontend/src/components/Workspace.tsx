import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, Typography, IconButton, Tabs, Tab, Paper, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatIcon from '@mui/icons-material/Chat';
import { SessionSidebar } from './SessionSidebar';
import { MentisChatWindow } from './MentisChatWindow';
import { MentisApiService } from '../services/mentisApi';
import { LoadingSpinner } from './LoadingSpinner';
import { SessionStats } from './SessionStats';
import { useToast } from './Toast';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { ShortcutsHelp } from './ShortcutsHelp';
import { EmptyState } from './EmptyState';
import { TaskList } from './TaskList';
import { VmScreenViewer } from './VmScreenViewer';
import { ExecutionLogViewer } from './ExecutionLogViewer';
import { TaskProgressViewer } from './TaskProgressViewer';
import { VmScreenPreview } from './VmScreenPreview';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ComputerIcon from '@mui/icons-material/Computer';
import DescriptionIcon from '@mui/icons-material/Description';

/**
 * 统一工作台组件
 * 整合所有 Mentis 功能模块，提供统一的工作界面
 * 采用三栏布局：左侧会话列表、中间对话、右侧执行窗口
 */
export const Workspace: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const toast = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // 移动端默认收起侧边栏
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // 加载会话列表
  useEffect(() => {
    loadSessions();
  }, []);

  // 调试：检查会话数据
  useEffect(() => {
    console.log('Workspace - Sessions loaded:', sessions.length, sessions);
    console.log('Workspace - Current session ID:', currentSessionId);
    console.log('Workspace - Sidebar open:', sidebarOpen);
  }, [sessions, currentSessionId, sidebarOpen]);

  // 当 URL 中的 sessionId 变化时更新当前会话
  useEffect(() => {
    if (sessionId) {
      setCurrentSessionId(sessionId);
    } else if (location.pathname === '/mentis/workspace' && !sessionId) {
      // 如果没有 sessionId，保持当前状态或加载第一个会话
      if (sessions.length > 0 && !currentSessionId) {
        const firstSessionId = sessions[0].sessionId || sessions[0].id?.toString();
        if (firstSessionId) {
          setCurrentSessionId(firstSessionId);
          navigate(`/mentis/workspace/${firstSessionId}`, { replace: true });
        }
      }
    }
  }, [sessionId, location.pathname, sessions, currentSessionId, navigate]);

  // 加载任务列表
  useEffect(() => {
    if (currentSessionId && activeTab === 1) {
      loadTasks();
    }
  }, [currentSessionId, activeTab]);

  // 加载执行日志
  useEffect(() => {
    if (currentSessionId && activeTab === 3) {
      loadLogs();
    }
  }, [currentSessionId, activeTab]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const sessionList = await MentisApiService.getSessions();
      // 确保会话数据格式正确，统一使用 sessionId
      const normalizedSessions = sessionList.map(session => ({
        ...session,
        id: session.sessionId || session.id?.toString() || '',
        sessionId: session.sessionId || session.id?.toString() || '',
      }));
      setSessions(normalizedSessions);
      // 如果没有当前会话且有会话列表，使用第一个会话
      if (!currentSessionId && normalizedSessions.length > 0) {
        const firstSessionId = normalizedSessions[0].sessionId || normalizedSessions[0].id?.toString();
        if (firstSessionId) {
          setCurrentSessionId(firstSessionId);
          navigate(`/mentis/workspace/${firstSessionId}`);
        }
      }
    } catch (error) {
      console.error('加载会话列表失败:', error);
      toast.showError('加载会话列表失败');
      setSessions([]); // 确保即使出错也设置空数组
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    if (!currentSessionId) return;
    try {
      const taskList = await MentisApiService.getTasks(currentSessionId);
      setTasks(taskList);
    } catch (error) {
      console.error('加载任务列表失败:', error);
      setTasks([]);
    }
  };

  const loadLogs = async () => {
    if (!currentSessionId) return;
    try {
      // TODO: 实现日志加载 API
      setLogs([]);
    } catch (error) {
      console.error('加载执行日志失败:', error);
      setLogs([]);
    }
  };

  const handleNewSession = async () => {
    try {
      setLoading(true);
      const newSession = await MentisApiService.createSession('新会话');
      await loadSessions();
      const newSessionId = newSession.sessionId || newSession.id?.toString();
      if (newSessionId) {
        setCurrentSessionId(newSessionId);
        navigate(`/mentis/workspace/${newSessionId}`);
        toast.showSuccess('会话创建成功');
      }
    } catch (error) {
      console.error('创建会话失败:', error);
      toast.showError('创建会话失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = (selectedSessionId: string) => {
    setCurrentSessionId(selectedSessionId);
    navigate(`/mentis/workspace/${selectedSessionId}`);
  };

  const handleSessionDelete = async (sessionIdToDelete: string) => {
    try {
      setLoading(true);
      await MentisApiService.deleteSession(sessionIdToDelete);
      await loadSessions();
      // 如果删除的是当前会话，切换到其他会话
      if (sessionIdToDelete === currentSessionId) {
        const remainingSessions = sessions.filter(
          s => (s.sessionId || s.id?.toString()) !== sessionIdToDelete
        );
        if (remainingSessions.length > 0) {
          const firstSessionId = remainingSessions[0].sessionId || remainingSessions[0].id?.toString();
          if (firstSessionId) {
            setCurrentSessionId(firstSessionId);
            navigate(`/mentis/workspace/${firstSessionId}`);
          }
        } else {
          setCurrentSessionId(null);
          navigate('/mentis/workspace');
        }
      }
      toast.showSuccess('会话已删除');
    } catch (error) {
      console.error('删除会话失败:', error);
      toast.showError('删除会话失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 键盘快捷键
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      handler: handleNewSession,
      description: '创建新会话',
    },
    {
      key: 'k',
      ctrl: true,
      handler: () => setSidebarOpen(!sidebarOpen),
      description: '切换侧边栏',
    },
    {
      key: '?',
      ctrl: true,
      handler: () => setShortcutsHelpOpen(true),
      description: '显示快捷键帮助',
    },
    {
      key: '1',
      ctrl: true,
      handler: () => setActiveTab(0),
      description: '切换到对话',
    },
    {
      key: '2',
      ctrl: true,
      handler: () => setActiveTab(1),
      description: '切换到任务',
    },
    {
      key: '3',
      ctrl: true,
      handler: () => setActiveTab(2),
      description: '切换到虚拟机',
    },
    {
      key: '4',
      ctrl: true,
      handler: () => setActiveTab(3),
      description: '切换到日志',
    },
  ]);

  if (loading && sessions.length === 0) {
    return <LoadingSpinner message="加载会话列表..." fullScreen />;
  }

  if (!currentSessionId) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
        {/* 顶部应用栏 */}
        <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Mentis 工作台
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => setShortcutsHelpOpen(true)}
              title="快捷键帮助 (Ctrl+?)"
              sx={{ mr: 1 }}
            >
              <KeyboardIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* 左侧：会话列表侧边栏 - 固定显示 */}
          {isMobile ? (
            <Drawer
              variant="temporary"
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              sx={{
                width: '80%',
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: '80%',
                  boxSizing: 'border-box',
                  height: '100%',
                },
              }}
            >
              <SessionSidebar
                sessions={sessions}
                currentSessionId={null}
                onSessionSelect={handleSessionSelect}
                onNewSession={handleNewSession}
                onSessionDelete={handleSessionDelete}
              />
            </Drawer>
          ) : (
            <Box
              sx={{
                width: 300,
                flexShrink: 0,
                borderRight: 1,
                borderColor: 'divider',
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <SessionSidebar
                sessions={sessions}
                currentSessionId={null}
                onSessionSelect={handleSessionSelect}
                onNewSession={handleNewSession}
                onSessionDelete={handleSessionDelete}
              />
            </Box>
          )}

          {/* 主内容区 */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState
              icon={<ChatIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
              title="欢迎使用 Mentis 工作台"
              description="请选择一个会话或创建新会话来开始工作"
              action={{
                label: '创建新会话',
                onClick: handleNewSession,
              }}
            />
          </Box>
        </Box>

        {/* 快捷键帮助对话框 */}
        <ShortcutsHelp
          open={shortcutsHelpOpen}
          onClose={() => setShortcutsHelpOpen(false)}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* 顶部应用栏 */}
      <AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mentis 工作台
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            会话: {sessions.find(s => (s.sessionId || s.id?.toString()) === currentSessionId)?.title || currentSessionId}
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => setShortcutsHelpOpen(true)}
            title="快捷键帮助 (Ctrl+?)"
            sx={{ mr: 1 }}
          >
            <KeyboardIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧：会话列表侧边栏 - 固定显示 */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            sx={{
              width: '80%',
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: '80%',
                boxSizing: 'border-box',
                height: '100%',
              },
            }}
          >
            <SessionSidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSessionSelect={handleSessionSelect}
              onNewSession={handleNewSession}
              onSessionDelete={handleSessionDelete}
            />
          </Drawer>
        ) : (
          <Box
            sx={{
              width: 300,
              minWidth: 300,
              maxWidth: 300,
              flexShrink: 0,
              borderRight: 1,
              borderColor: 'divider',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'background.paper',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <SessionSidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSessionSelect={handleSessionSelect}
              onNewSession={handleNewSession}
              onSessionDelete={handleSessionDelete}
            />
          </Box>
        )}

        {/* 主内容区 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* 功能标签页 */}
          <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab icon={<ChatIcon />} label={isMobile ? undefined : '对话'} iconPosition="start" />
              <Tab icon={<AssignmentIcon />} label={isMobile ? undefined : '任务'} iconPosition="start" />
              <Tab icon={<ComputerIcon />} label={isMobile ? undefined : '虚拟机'} iconPosition="start" />
              <Tab icon={<DescriptionIcon />} label={isMobile ? undefined : '执行日志'} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* 功能内容区 */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {/* 会话统计信息 */}
            {currentSessionId && (
              <SessionStats
                messageCount={sessions.find(s => (s.sessionId || s.id?.toString()) === currentSessionId)?.messageCount}
                taskCount={tasks.length}
                lastActiveAt={sessions.find(s => (s.sessionId || s.id?.toString()) === currentSessionId)?.lastActiveAt || sessions.find(s => (s.sessionId || s.id?.toString()) === currentSessionId)?.updatedAt}
              />
            )}

            {activeTab === 0 && currentSessionId ? (
              <MentisChatWindow
                sessionId={currentSessionId}
                onMessageSent={(message) => {
                  console.log('消息已发送:', message);
                  // 刷新会话列表以更新消息数
                  loadSessions();
                  // 如果切换到任务标签页，刷新任务列表以显示新任务进度
                  if (activeTab === 1) {
                    loadTasks();
                  }
                }}
              />
            ) : activeTab === 0 && (
              <EmptyState
                title="请先选择一个会话"
                description="从左侧会话列表中选择一个会话，或创建新会话来开始对话"
                action={{
                  label: '创建新会话',
                  onClick: handleNewSession,
                }}
              />
            )}
            {activeTab === 1 && currentSessionId ? (
              <Box>
                {/* 显示当前执行的任务进度 */}
                {(() => {
                  const runningTask = tasks.find(t => t.status === 'RUNNING');
                  const executionId = runningTask?.executionId || runningTask?.taskId;
                  return executionId ? (
                    <Box sx={{ mb: 2 }}>
                      <TaskProgressViewer
                        executionId={executionId}
                        autoRefresh={true}
                        refreshInterval={2000}
                      />
                    </Box>
                  ) : null;
                })()}
                {loading && tasks.length === 0 ? (
                  <LoadingSpinner message="加载任务列表..." />
                ) : (
                  <TaskList tasks={tasks} onTasksUpdate={loadTasks} />
                )}
              </Box>
            ) : activeTab === 1 && (
              <EmptyState
                title="请先选择一个会话"
                description="选择一个会话以查看任务列表"
              />
            )}
            
            {activeTab === 2 && currentSessionId ? (
              <Box>
                {/* 使用新的 VmScreenPreview 组件 */}
                <VmScreenPreview
                  sessionId={currentSessionId}
                  autoRefresh={true}
                  refreshInterval={3000}
                  showActivity={true}
                />
                {/* 保留原有的 VmScreenViewer 作为备用 */}
                <Box sx={{ mt: 2 }}>
                  <VmScreenViewer sessionId={currentSessionId} />
                </Box>
              </Box>
            ) : activeTab === 2 && (
              <EmptyState
                title="请先选择一个会话"
                description="选择一个会话以查看虚拟机管理"
              />
            )}
            
            {activeTab === 3 && currentSessionId ? (
              <ExecutionLogViewer sessionId={currentSessionId} logs={logs} />
            ) : activeTab === 3 && (
              <EmptyState
                title="请先选择一个会话"
                description="选择一个会话以查看执行日志"
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* 快捷键帮助对话框 */}
      <ShortcutsHelp
        open={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
      />
    </Box>
  );
};
