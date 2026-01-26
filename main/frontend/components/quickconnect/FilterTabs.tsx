import React from 'react';
import { SceneFilter } from './SceneFilter';

export type FilterType = 'all' | 'favorite' | 'recent' | 'scene';

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts?: {
    all?: number;
    favorite?: number;
    recent?: number;
  };
  selectedSceneIds?: number[];
  onSceneChange?: (sceneIds: number[]) => void;
}

/**
 * 筛选标签组件
 */
export const FilterTabs: React.FC<FilterTabsProps> = ({
  activeFilter,
  onFilterChange,
  counts = {},
  selectedSceneIds = [],
  onSceneChange,
}) => {
  const filters: Array<{ key: FilterType; label: string; icon: string }> = [
    { key: 'all', label: '全部', icon: '📋' },
    { key: 'favorite', label: '收藏', icon: '⭐' },
    { key: 'recent', label: '最近', icon: '🕒' },
  ];
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        const count = counts[filter.key as keyof typeof counts];
        
        return (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: isActive 
                ? 'var(--color-primary, #3b82f6)' 
                : 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
              color: isActive 
                ? 'var(--text-primary)' 
                : 'var(--text-secondary)',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              boxShadow: isActive ? 'var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.5))' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
            {count !== undefined && count > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: isActive 
                    ? 'var(--bg-overlay, rgba(255, 255, 255, 0.2))' 
                    : 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
      
      {/* 场景筛选 */}
      {onSceneChange && (
        <SceneFilter
          selectedSceneIds={selectedSceneIds}
          onSceneChange={onSceneChange}
        />
      )}
    </div>
  );
};

