import React, { useState } from 'react';
import { Box, Tabs, Tab, IconButton, Paper, Tooltip } from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { VmScreenViewer } from './VmScreenViewer';
import { TaskList } from './TaskList';
import { ExecutionLogViewer } from './ExecutionLogViewer';

interface ExecutionPanelProps {
  sessionId: string;
  tasks?: any[];
  logs?: any[];
  onClose?: () => void;
  onOpenInNewWindow?: () => void;
}

/**
 * 执行窗口面板组件
 * 整合 VM 屏幕、任务列表、执行日志
 */
export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  sessionId,
  tasks = [],
  logs = [],
  onClose,
  onOpenInNewWindow,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      {/* 执行窗口标题栏 */}
      <Paper
        sx={{
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 40 }}
          >
            <Tab
              icon={<ComputerIcon />}
              label="VM"
              iconPosition="start"
              sx={{ minHeight: 40, fontSize: '0.75rem' }}
            />
            <Tab
              icon={<AssignmentIcon />}
              label="任务"
              iconPosition="start"
              sx={{ minHeight: 40, fontSize: '0.75rem' }}
            />
            <Tab
              icon={<DescriptionIcon />}
              label="日志"
              iconPosition="start"
              sx={{ minHeight: 40, fontSize: '0.75rem' }}
            />
          </Tabs>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {onOpenInNewWindow && (
            <Tooltip title="独立窗口">
              <IconButton size="small" onClick={onOpenInNewWindow}>
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onClose && (
            <Tooltip title="关闭">
              <IconButton size="small" onClick={onClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Paper>

      {/* 执行窗口内容区 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 0 && <VmScreenViewer sessionId={sessionId} />}
        {activeTab === 1 && (
          <Box sx={{ p: 2 }}>
            <TaskList tasks={tasks} />
          </Box>
        )}
        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <ExecutionLogViewer sessionId={sessionId} logs={logs} />
          </Box>
        )}
      </Box>
    </Box>
  );
};
