/**
 * 角色成长标签页组件
 * 整合成长轨迹、关系发展、导师能力三个面板
 */

import React, { useState } from 'react';
import { CharacterGrowthPanel } from './CharacterGrowthPanel';
import { CharacterRelationshipPanel } from './CharacterRelationshipPanel';
import { CharacterMentorshipPanel } from './CharacterMentorshipPanel';

interface CharacterGrowthTabProps {
  characterId: number;
  userId: number | string; // 支持数字或字符串，内部会转换为数字
  characterName?: string;
}

type SubTab = 'growth' | 'relationship' | 'mentorship';

export const CharacterGrowthTab: React.FC<CharacterGrowthTabProps> = ({
  characterId,
  userId,
  characterName = '角色',
}) => {
  const [subTab, setSubTab] = useState<SubTab>('growth');

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'growth', label: '成长轨迹' },
    { key: 'relationship', label: '关系发展' },
    { key: 'mentorship', label: '导师能力' },
  ];

  return (
    <div className="character-growth-tab p-4 sm:p-6">
      <div className="mb-4">
        <h3
          className="text-lg sm:text-xl font-semibold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {characterName ? `${characterName} 的成长` : '角色成长'}
        </h3>
        <p
          className="text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          自我成长、挚友能力与导师能力
        </p>
      </div>

      {/* 子标签 */}
      <div
        className="flex gap-1 mb-4 pb-2 border-b"
        style={{ borderColor: 'var(--border-color, #374151)' }}
      >
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setSubTab(key)}
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              color: subTab === key ? 'var(--color-primary-light, #818cf8)' : 'var(--text-secondary, #CBD5E1)',
              backgroundColor: subTab === key ? 'var(--bg-secondary, rgba(129, 140, 248, 0.1))' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (subTab !== key) {
                e.currentTarget.style.color = 'var(--text-primary, #FFFFFF)';
              }
            }}
            onMouseLeave={(e) => {
              if (subTab !== key) {
                e.currentTarget.style.color = 'var(--text-secondary, #CBD5E1)';
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 面板内容 */}
      <div className="min-h-[300px]">
        {subTab === 'growth' && (
          <CharacterGrowthPanel
            characterId={characterId}
            userId={userId}
            characterName={characterName}
          />
        )}
        {subTab === 'relationship' && (
          <CharacterRelationshipPanel
            characterId={characterId}
            userId={userId}
            characterName={characterName}
          />
        )}
        {subTab === 'mentorship' && (
          <CharacterMentorshipPanel
            characterId={characterId}
            userId={userId}
            characterName={characterName}
          />
        )}
      </div>
    </div>
  );
};
