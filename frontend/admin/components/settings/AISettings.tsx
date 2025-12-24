import React, { useState } from 'react';
import { ModelsManagement } from './ModelsManagement';
import { RoutingStrategies } from './RoutingStrategies';

interface AISettingsProps {
  adminToken: string;
  onReload: () => void;
}

export const AISettings: React.FC<AISettingsProps> = ({
  adminToken,
  onReload,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'models' | 'routing'>('models');

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveSubTab('models')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'models'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            AI模型配置
          </button>
          <button
            onClick={() => setActiveSubTab('routing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'routing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            路由策略
          </button>
        </nav>
      </div>

      {activeSubTab === 'models' && (
        <ModelsManagement adminToken={adminToken} onReload={onReload} />
      )}

      {activeSubTab === 'routing' && (
        <RoutingStrategies adminToken={adminToken} onReload={onReload} />
      )}
    </div>
  );
};

