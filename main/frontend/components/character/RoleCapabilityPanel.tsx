/**
 * 角色能力面板组件
 * 整合能力雷达图、能力成长、关系-能力协同可视化
 * 专注于能力维度的展示和分析
 */

import React, { useState } from 'react';
import { CapabilityRadarChart } from './CapabilityRadarChart';
import { CharacterGrowthPanel } from './CharacterGrowthPanel';

interface RoleCapabilityPanelProps {
  characterId: number;
  userId: number | string; // 支持数字或字符串，内部会转换为数字
  characterName?: string;
}

type Tab = 'overview' | 'capability-growth' | 'synergy';

export const RoleCapabilityPanel: React.FC<RoleCapabilityPanelProps> = ({
  characterId,
  userId,
  characterName = '角色',
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: '能力概览' },
    { key: 'capability-growth', label: '能力成长' },
    { key: 'synergy', label: '能力协同' },
  ];

  return (
    <div className="role-capability-panel p-4 sm:p-6">
      <div className="mb-4">
        <h3
          className="text-lg sm:text-xl font-semibold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {characterName} 的能力体系
        </h3>
        <p
          className="text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          多维度能力评估、能力成长和能力协同分析
        </p>
      </div>

      {/* 标签页 */}
      <div
        className="flex gap-1 mb-4 pb-2 border-b"
        style={{ borderColor: 'var(--border-color, #374151)' }}
      >
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              color: activeTab === key ? 'var(--color-primary-light, #818cf8)' : 'var(--text-secondary, #CBD5E1)',
              backgroundColor: activeTab === key ? 'var(--bg-secondary, rgba(129, 140, 248, 0.1))' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== key) {
                e.currentTarget.style.color = 'var(--text-primary, #FFFFFF)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== key) {
                e.currentTarget.style.color = 'var(--text-secondary, #CBD5E1)';
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 面板内容 */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <CapabilityRadarChart characterId={characterId} characterName={characterName} />
          </div>
        )}
        
        {activeTab === 'capability-growth' && (
          <>
            {(() => {
              // 检查 userId 是否有效（不是 0、空字符串、null 或 undefined）
              const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
              const isValidUserId = userIdNum && !isNaN(userIdNum) && userIdNum > 0;
              
              return isValidUserId ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.5))' }}>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary, #CBD5E1)' }}>
                      展示角色在能力维度上的成长历程，包括能力提升、学习成果等与能力相关的成长事件。
                    </p>
                    <CharacterGrowthPanel
                      characterId={characterId}
                      userId={userIdNum}
                      characterName={characterName}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.5))', color: 'var(--text-tertiary)' }}>
                  <p>需要有效的用户ID才能查看能力成长</p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                    请确保已登录并刷新页面
                  </p>
                </div>
              );
            })()}
          </>
        )}
        
        {activeTab === 'synergy' && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.5))' }}>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              能力协同可视化功能开发中...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
