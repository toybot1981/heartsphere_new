import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import MemoryDashboard from './MemoryDashboard';
import UserMemoryManagement from './UserMemoryManagement';
import ShortTermMemoryManagement from './ShortTermMemoryManagement';
import LongTermMemoryManagement from './LongTermMemoryManagement';
import MemoryStatistics from './MemoryStatistics';
import MemoryMaintenance from './MemoryMaintenance';

/**
 * 记忆系统管理主组件
 * 提供记忆系统的完整管理功能
 */
interface MemoryManagementProps {
  adminToken: string | null;
}

const MemoryManagement: React.FC<MemoryManagementProps> = ({ adminToken }) => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: '系统概览', value: 0 },
    { label: '用户记忆', value: 1 },
    { label: '短时记忆', value: 2 },
    { label: '长时记忆', value: 3 },
    { label: '统计分析', value: 4 },
    { label: '数据维护', value: 5 },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && <MemoryDashboard adminToken={adminToken} />}
        {activeTab === 1 && <UserMemoryManagement adminToken={adminToken} />}
        {activeTab === 2 && <ShortTermMemoryManagement adminToken={adminToken} />}
        {activeTab === 3 && <LongTermMemoryManagement adminToken={adminToken} />}
        {activeTab === 4 && <MemoryStatistics adminToken={adminToken} />}
        {activeTab === 5 && <MemoryMaintenance adminToken={adminToken} />}
      </Box>
    </Box>
  );
};

export default MemoryManagement;




