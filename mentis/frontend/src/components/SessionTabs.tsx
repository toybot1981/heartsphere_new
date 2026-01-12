import React from 'react';
import { Box, Tabs, Tab, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';

interface SessionTab {
  id: string;
  title: string;
  active: boolean;
}

interface SessionTabsProps {
  tabs: SessionTab[];
  currentTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

/**
 * 会话标签页管理组件
 * 支持多会话标签页切换和关闭
 */
export const SessionTabs: React.FC<SessionTabsProps> = ({
  tabs,
  currentTabId,
  onTabSelect,
  onTabClose,
}) => {
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const selectedTab = tabs[newValue];
    if (selectedTab) {
      onTabSelect(selectedTab.id);
    }
  };

  const currentTabIndex = tabs.findIndex(tab => tab.id === currentTabId);

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Tabs
        value={currentTabIndex >= 0 ? currentTabIndex : 0}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            icon={<ChatIcon fontSize="small" />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{tab.title || '未命名会话'}</span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                  sx={{
                    ml: 0.5,
                    p: 0.5,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            }
            sx={{
              minHeight: 48,
              textTransform: 'none',
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};
