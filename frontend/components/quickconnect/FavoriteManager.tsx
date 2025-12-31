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
          className={`p-3 rounded-lg bg-white/10 border border-white/20 cursor-move transition-all ${
            draggedIndex === index ? 'opacity-50' : 'hover:bg-white/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="text-gray-400 text-sm w-6">#{index + 1}</div>
            <div className="flex-1">
              <div className="text-white font-medium">
                {favorite.character?.characterName || `角色 ${favorite.characterId}`}
              </div>
              <div className="text-gray-400 text-sm">
                {favorite.character?.sceneName || ''}
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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



