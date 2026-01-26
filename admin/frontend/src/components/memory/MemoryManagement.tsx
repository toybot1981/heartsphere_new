import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import MemoryDashboard from './MemoryDashboard';
import UserMemoryManagement from './UserMemoryManagement';
import ShortTermMemoryManagement from './ShortTermMemoryManagement';
import LongTermMemoryManagement from './LongTermMemoryManagement';
import MemoryStatistics from './MemoryStatistics';
import MemoryMaintenance from './MemoryMaintenance';
import MemoryTesting from './MemoryTesting';
import { MUIProvider } from '../MUIProvider';
import { useAdminState } from '../../contexts/AdminStateContext';

/**
 * 记忆系统管理主组件
 * 提供记忆系统的完整管理功能
 */
interface MemoryManagementProps {
  adminToken: string | null;
}

const MemoryManagementContent: React.FC<MemoryManagementProps> = ({ adminToken }) => {
  const { memoryTab, setMemoryTab } = useAdminState();
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: '系统概览', value: 0 },
    { label: '记忆测试', value: 1 },
    { label: '用户记忆', value: 2 },
    { label: '短时记忆', value: 3 },
    { label: '长时记忆', value: 4 },
    { label: '统计分析', value: 5 },
    { label: '数据维护', value: 6 },
  ];

  // 如果从用户管理页面跳转过来，自动切换到指定的标签页
  useEffect(() => {
    if (memoryTab !== null && memoryTab >= 0 && memoryTab < tabs.length) {
      setActiveTab(memoryTab);
      // 清除状态，避免下次进入时自动切换
      setMemoryTab(null);
    }
  }, [memoryTab, setMemoryTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // 提供给子组件切换标签页的回调函数
  const switchToTab = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ 
          mb: 3, 
          borderBottom: 1, 
          borderColor: 'divider',
          '& .MuiTab-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 500,
            '&.Mui-selected': {
              color: '#3b82f6', // indigo-500
              fontWeight: 600,
            },
            '&:hover': {
              color: 'rgba(255, 255, 255, 0.9)',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#3b82f6', // indigo-500
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && <MemoryDashboard adminToken={adminToken} onNavigateToUserMemory={() => switchToTab(2)} />}
        {activeTab === 1 && <MemoryTesting adminToken={adminToken} />}
        {activeTab === 2 && <UserMemoryManagement adminToken={adminToken} />}
        {activeTab === 3 && <ShortTermMemoryManagement adminToken={adminToken} />}
        {activeTab === 4 && <LongTermMemoryManagement adminToken={adminToken} />}
        {activeTab === 5 && <MemoryStatistics adminToken={adminToken} />}
        {activeTab === 6 && <MemoryMaintenance adminToken={adminToken} />}
      </Box>
    </Box>
  );
};

// 使用 MUI Provider 包装组件，解决 withEmotionCache 错误
const MemoryManagement: React.FC<MemoryManagementProps> = (props) => {
  return (
    <MUIProvider>
      <MemoryManagementContent {...props} />
    </MUIProvider>
  );
};

export default MemoryManagement;




