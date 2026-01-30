/**
 * 用户记忆管理容器：Tabs、activeTab、组合 6 个 Tab 子组件
 * 各 Tab 内容见 UserMemoryTab、HsmemQueryTab、MemoryTraceTab、ResourceLayerTab、ItemLayerTab、CategoryLayerTab
 */
import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { MUIProvider } from '../MUIProvider';
import { useAdminState } from '../../contexts/AdminStateContext';
import UserMemoryTab from './UserMemoryTab';
import HsmemQueryTab from './HsmemQueryTab';
import MemoryTraceTab from './MemoryTraceTab';
import ResourceLayerTab from './ResourceLayerTab';
import ItemLayerTab from './ItemLayerTab';
import CategoryLayerTab from './CategoryLayerTab';

export interface UserMemoryManagementProps {
  adminToken: string | null;
}

const UserMemoryManagementContent: React.FC<UserMemoryManagementProps> = ({ adminToken }) => {
  const { selectedUserId: contextSelectedUserId, setSelectedUserId: setContextSelectedUserId } = useAdminState();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        用户记忆管理
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="用户记忆（Admin API）" />
        <Tab label="HSMem查询" />
        <Tab label="记忆提取追溯" />
        <Tab label="资源管理（Resource Layer）" />
        <Tab label="记忆项管理（Item Layer）" />
        <Tab label="类别管理（Category Layer）" />
      </Tabs>

      {activeTab === 0 && (
        <UserMemoryTab
          adminToken={adminToken}
          contextSelectedUserId={contextSelectedUserId}
          setContextSelectedUserId={setContextSelectedUserId}
        />
      )}
      {activeTab === 1 && <HsmemQueryTab />}
      {activeTab === 2 && <MemoryTraceTab />}
      {activeTab === 3 && <ResourceLayerTab />}
      {activeTab === 4 && <ItemLayerTab />}
      {activeTab === 5 && <CategoryLayerTab />}
    </Box>
  );
};

const UserMemoryManagement: React.FC<UserMemoryManagementProps> = (props) => {
  return (
    <MUIProvider>
      <UserMemoryManagementContent {...props} />
    </MUIProvider>
  );
};

export default UserMemoryManagement;
