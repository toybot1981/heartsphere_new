import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab, Paper, Button } from '@mui/material';
import { MentisChatWindow } from './MentisChatWindow';
import { TaskList } from './TaskList';
import { VmScreenViewer } from './VmScreenViewer';
import { ExecutionLogViewer } from './ExecutionLogViewer';
import { MentisApiService, Task } from '../services/mentisApi';

interface MentisMainPageProps {
  sessionId: string;
}

/**
 * Mentis 主页面组件
 */
export const MentisMainPage: React.FC<MentisMainPageProps> = ({ sessionId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // 加载任务列表
  useEffect(() => {
    if (sessionId && activeTab === 1) {
      loadTasks();
    }
  }, [sessionId, activeTab]);

  const loadTasks = async () => {
    try {
      const taskList = await MentisApiService.getTasks(sessionId);
      setTasks(taskList);
    } catch (error) {
      console.error('加载任务列表失败:', error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // 切换到任务标签时加载任务
    if (newValue === 1 && tasks.length === 0) {
      loadTasks();
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="对话" />
        <Tab label="任务" />
        <Tab label="虚拟机屏幕" />
        <Tab label="执行日志" />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 0 && (
          <MentisChatWindow
            sessionId={sessionId}
            onMessageSent={(message) => {
              console.log('消息已发送:', message);
            }}
          />
        )}
        {activeTab === 1 && (
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/mentis/session/${sessionId}/tasks`)}
              >
                查看完整任务列表
              </Button>
            </Box>
            <TaskList tasks={tasks} />
          </Box>
        )}
        {activeTab === 2 && (
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/mentis/session/${sessionId}/vm`)}
              >
                查看完整虚拟机管理
              </Button>
            </Box>
            <VmScreenViewer sessionId={sessionId} />
          </Box>
        )}
        {activeTab === 3 && (
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/mentis/session/${sessionId}/logs`)}
              >
                查看完整执行日志
              </Button>
            </Box>
            <ExecutionLogViewer sessionId={sessionId} logs={logs} />
          </Box>
        )}
      </Box>
    </Box>
  );
};
