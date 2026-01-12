import React, { useState } from 'react';
import { ShareConfigManagement } from './ShareConfigManagement';
import { ConnectionRequestManagement } from './ConnectionRequestManagement';
import { AccessRecordManagement } from './AccessRecordManagement';
import { WarmMessageManagement } from './WarmMessageManagement';
import { HeartSphereConnectionStatistics } from './HeartSphereConnectionStatistics';
import { ExceptionHandlingManagement } from './ExceptionHandlingManagement';

interface HeartSphereConnectionManagementProps {
  adminToken: string | null;
  onRefresh?: () => void;
}

type TabType = 'share-configs' | 'connection-requests' | 'access-records' | 'warm-messages' | 'statistics' | 'exceptions';

export const HeartSphereConnectionManagement: React.FC<HeartSphereConnectionManagementProps> = ({
  adminToken,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('share-configs');

  const tabs = [
    { id: 'share-configs' as TabType, label: '共享配置管理', icon: '🔗' },
    { id: 'connection-requests' as TabType, label: '连接请求管理', icon: '📨' },
    { id: 'access-records' as TabType, label: '访问记录管理', icon: '📊' },
    { id: 'warm-messages' as TabType, label: '留言管理', icon: '💬' },
    { id: 'statistics' as TabType, label: '数据统计', icon: '📈' },
    { id: 'exceptions' as TabType, label: '异常处理', icon: '⚠️' },
  ];

  return (
    <div className="space-y-6">
      {/* 标签页导航 */}
      <div className="border-b border-slate-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="mt-6">
        {activeTab === 'share-configs' && (
          <ShareConfigManagement adminToken={adminToken} onRefresh={onRefresh} />
        )}
        {activeTab === 'connection-requests' && (
          <ConnectionRequestManagement adminToken={adminToken} onRefresh={onRefresh} />
        )}
        {activeTab === 'access-records' && (
          <AccessRecordManagement adminToken={adminToken} onRefresh={onRefresh} />
        )}
        {activeTab === 'warm-messages' && (
          <WarmMessageManagement adminToken={adminToken} onRefresh={onRefresh} />
        )}
        {activeTab === 'statistics' && (
          <HeartSphereConnectionStatistics adminToken={adminToken} />
        )}
        {activeTab === 'exceptions' && (
          <ExceptionHandlingManagement adminToken={adminToken} onRefresh={onRefresh} />
        )}
      </div>
    </div>
  );
};




