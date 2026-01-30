/**
 * 场景创建摘要预览组件
 * 显示即将创建的场景、角色、主线剧情和剧本数量
 */

import React from 'react';
import type { SelectedItem } from './types';

interface SceneCreationSummaryProps {
  selectedEras: Map<number, SelectedItem>;
  selectedCharacters: Map<number, SelectedItem>;
  selectedMainStories: Map<number, SelectedItem>;
  selectedScripts: Map<number, SelectedItem>;
}

export const SceneCreationSummary: React.FC<SceneCreationSummaryProps> = ({
  selectedEras,
  selectedCharacters,
  selectedMainStories,
  selectedScripts,
}) => {
  const totalScenes = selectedEras.size;
  const totalCharacters = selectedCharacters.size;
  const totalMainStories = selectedMainStories.size;
  const totalScripts = selectedScripts.size;

  return (
    <div 
      className="border rounded-lg p-6 space-y-4"
      style={{
        backgroundColor: 'var(--bg-overlay, rgba(17, 24, 39, 0.5))',
        borderColor: 'var(--bg-overlay, #374151)',
      }}
    >
      <h3 
        className="text-lg font-bold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        创建摘要
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div 
            className="text-3xl font-bold"
            style={{ color: 'var(--color-primary, #f472b6)' }}
          >
            {totalScenes}
          </div>
          <div 
            className="text-xs mt-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            场景
          </div>
        </div>
        
        <div className="text-center">
          <div 
            className="text-3xl font-bold"
            style={{ color: 'var(--color-info, #818cf8)' }}
          >
            {totalCharacters}
          </div>
          <div 
            className="text-xs mt-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            角色
          </div>
        </div>
        
        <div className="text-center">
          <div 
            className="text-3xl font-bold"
            style={{ color: 'var(--color-primary, #a855f7)' }}
          >
            {totalMainStories}
          </div>
          <div 
            className="text-xs mt-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            主线剧情
          </div>
        </div>
        
        <div className="text-center">
          <div 
            className="text-3xl font-bold"
            style={{ color: 'var(--color-info, #60a5fa)' }}
          >
            {totalScripts}
          </div>
          <div 
            className="text-xs mt-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            剧本
          </div>
        </div>
      </div>

      {totalScenes > 0 && (
        <div 
          className="mt-4 pt-4 border-t"
          style={{ borderColor: 'var(--bg-overlay, #374151)' }}
        >
          <h4 
            className="text-sm font-semibold mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            即将创建的场景：
          </h4>
          <div className="space-y-1">
            {Array.from(selectedEras.values()).map((eraItem) => (
              <div 
                key={eraItem.id} 
                className="text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                • {eraItem.customName || eraItem.originalName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
