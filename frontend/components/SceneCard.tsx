
import React from 'react';
import { WorldScene } from '../types';

interface SceneCardProps {
  scene: WorldScene;
  onSelect: () => void;
  onEdit?: (scene: WorldScene) => void;
  onDelete?: (scene: WorldScene) => void;
  isUserOwned?: boolean; // 是否是用户拥有的场景
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, onSelect, onEdit, onDelete, isUserOwned = false }) => {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(scene);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm(`确定要删除 "${scene.name}" 吗？删除后将移至回收站。`)) {
      onDelete(scene);
    }
  };
  return (
    <div 
      onClick={onSelect}
      className="group relative h-96 w-full cursor-pointer overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-purple-400/50"
    >
      <div className="absolute inset-0 bg-gray-900">
        {scene.imageUrl ? (
          <img 
            src={scene.imageUrl} 
            alt={scene.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 flex items-center justify-center">
            <div className="text-6xl opacity-30">✨</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent opacity-90 transition-opacity group-hover:opacity-75" />
      </div>

      {/* Action Buttons (Top Right) */}
      {isUserOwned && (onEdit || onDelete) && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 flex flex-col gap-2">
          {onEdit && (
            <button
              onClick={handleEditClick}
              className="bg-black/50 backdrop-blur-md text-white p-3 rounded-full border border-white/20 transition-all duration-300 shadow-lg hover:bg-blue-500/50"
              title="编辑时代"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="bg-black/50 backdrop-blur-md text-white p-3 rounded-full border border-white/20 transition-all duration-300 shadow-lg hover:bg-red-500/50"
              title="删除时代"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full p-6 text-center">
        <h3 className="mb-2 text-3xl font-black text-white" style={{ textShadow: '0 2px 15px rgba(0,0,0,0.5)' }}>
          {scene.name}
        </h3>
        <p className="text-sm text-white/80 line-clamp-2">
          {scene.description}
        </p>
      </div>
      
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:border-purple-400 pointer-events-none" />
    </div>
  );
};