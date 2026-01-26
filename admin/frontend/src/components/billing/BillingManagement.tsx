/**
 * 计费管理主组件
 * 整合所有计费管理功能
 */
import React, { useState, useEffect } from 'react';
import { ProvidersManagement } from './ProvidersManagement';
import { ModelsManagement } from './ModelsManagement';
import { PricingManagement } from './PricingManagement';
import { UsageRecordsView } from './UsageRecordsView';
import { CostStatisticsView } from './CostStatisticsView';
import { UserQuotaManagement } from './UserQuotaManagement';
import { ResourcePoolManagement } from './ResourcePoolManagement';
import { useAdminState } from '../../contexts/AdminStateContext';

interface BillingManagementProps {
  adminToken: string | null;
  onReload?: () => void;
}

type BillingSubSection = 
  | 'providers' 
  | 'models' 
  | 'pricing' 
  | 'usage' 
  | 'cost' 
  | 'quota'
  | 'resource-pool';

export const BillingManagement: React.FC<BillingManagementProps> = ({
  adminToken,
  onReload,
}) => {
  const { billingSubSection, setBillingSubSection } = useAdminState();
  const [activeSubSection, setActiveSubSection] = useState<BillingSubSection>('providers');
  
  // 如果从用户管理页面跳转过来，自动切换到指定的子标签页
  useEffect(() => {
    if (billingSubSection && ['providers', 'models', 'pricing', 'usage', 'cost', 'quota', 'resource-pool'].includes(billingSubSection)) {
      setActiveSubSection(billingSubSection as BillingSubSection);
      // 清除状态，避免下次进入时自动切换
      setBillingSubSection(null);
    }
  }, [billingSubSection, setBillingSubSection]);

  const subSections: Array<{ key: BillingSubSection; label: string; icon: string }> = [
    { key: 'providers', label: '提供商管理', icon: '🏢' },
    { key: 'models', label: '模型管理', icon: '🤖' },
    { key: 'pricing', label: '资费配置', icon: '💰' },
    { key: 'resource-pool', label: '资源池管理', icon: '💧' },
    { key: 'usage', label: '使用记录', icon: '📊' },
    { key: 'cost', label: '成本统计', icon: '📈' },
    { key: 'quota', label: '用户配额', icon: '🎫' },
  ];

  const renderContent = () => {
    switch (activeSubSection) {
      case 'providers':
        return <ProvidersManagement adminToken={adminToken} onReload={onReload} />;
      case 'models':
        return <ModelsManagement adminToken={adminToken} onReload={onReload} />;
      case 'pricing':
        return <PricingManagement adminToken={adminToken} onReload={onReload} />;
      case 'usage':
        return <UsageRecordsView adminToken={adminToken} />;
      case 'cost':
        return <CostStatisticsView adminToken={adminToken} />;
      case 'quota':
        return <UserQuotaManagement adminToken={adminToken} />;
      case 'resource-pool':
        return <ResourcePoolManagement adminToken={adminToken} onReload={onReload} />;
      default:
        return <ProvidersManagement adminToken={adminToken} onReload={onReload} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* 子导航 */}
      <div className="mb-6">
        <div className="flex gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800">
          {subSections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSubSection(section.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeSubSection === section.key
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      {renderContent()}
    </div>
  );
};

