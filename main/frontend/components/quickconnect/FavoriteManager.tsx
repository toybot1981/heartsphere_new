import React, { useState } from 'react';
import { quickConnectApi } from '../../services/api/quickconnect';
import type { Favorite } from '../../services/api/quickconnect/types';

interface FavoriteManagerProps {
  favorites: Favorite[];
  onReorder: (items: Array<{ characterId: number; sortOrder: number }>) => void;
}

/**
 * 收藏管理组件
 * 支持拖拽排序收藏列表
 */
export const FavoriteManager: React.FC<FavoriteManagerProps> = ({
  favorites,
  onReorder,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newFavorites = [...favorites];
    const draggedItem = newFavorites[draggedIndex];
    newFavorites.splice(draggedIndex, 1);
    newFavorites.splice(index, 0, draggedItem);
    
    // 更新排序
    const reorderItems = newFavorites.map((fav, idx) => ({
      characterId: fav.characterId,
      sortOrder: idx,
    }));
    
    onReorder(reorderItems);
    setDraggedIndex(index);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  return (
    <div className="space-y-2">
      {favorites.map((favorite, index) => (
        <div
          key={favorite.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`p-3 rounded-lg border cursor-move transition-all ${
            draggedIndex === index ? 'opacity-50' : ''
          }`}
          style={{
            backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
            borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.2))',
          }}
          onMouseEnter={(e) => {
            if (draggedIndex !== index) {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="text-sm w-6"
              style={{ color: 'var(--text-tertiary)' }}
            >
              #{index + 1}
            </div>
            <div className="flex-1">
              <div 
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {favorite.character?.characterName || `角色 ${favorite.characterId}`}
              </div>
              <div 
                className="text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {favorite.character?.sceneName || ''}
              </div>
            </div>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8h16M4 16h16"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};




