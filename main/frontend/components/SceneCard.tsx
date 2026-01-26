
import React, { useEffect, useMemo } from 'react';
import { WorldScene } from '../types';
import { showConfirm } from '../utils/dialog';
import { LazyImage } from './LazyImage';
import { generateVariantUrl, type ImageVariants } from '../utils/imageResolution';

interface SceneCardProps {
  scene: WorldScene;
  onSelect: () => void;
  onEdit?: (scene: WorldScene) => void;
  onDelete?: (scene: WorldScene) => void;
  isUserOwned?: boolean; // 是否是用户拥有的场景
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, onSelect, onEdit, onDelete, isUserOwned = false }) => {
  // 从 imageUrl 生成多分辨率版本（根据命名规则）
  const imageVariants: ImageVariants | undefined = useMemo(() => {
    if (!scene.imageUrl || !scene.imageUrl.trim()) return undefined;
    
    return {
      original: scene.imageUrl,
      thumbnail: generateVariantUrl(scene.imageUrl, 200, 200),
      medium: generateVariantUrl(scene.imageUrl, 800, 600),
      highQuality: generateVariantUrl(scene.imageUrl, 1920, 1080),
    };
  }, [scene.imageUrl]);

  // 打印场景图片信息（详细日志）
  useEffect(() => {
    if (scene.imageUrl && scene.imageUrl.trim()) {
      console.log('[SceneCard] 场景列表页面 - 图片展示信息', {
        componentName: 'SceneCard',
        pageType: '场景列表页面',
        imageType: '场景封面图',
        originalImageUrl: scene.imageUrl,
        imageVariants: {
          thumbnail: imageVariants?.thumbnail || null,
          medium: imageVariants?.medium || null,
          highQuality: imageVariants?.highQuality || null,
        },
        expectedResolution: 'medium (800×600) - 场景列表使用中等分辨率以获得更好的清晰度',
        sceneObject: {
          id: scene.id,
          name: scene.name,
          description: scene.description,
          imageUrl: scene.imageUrl,
          style: scene.style,
          charactersCount: scene.characters?.length || 0,
          hasMainStory: !!scene.mainStory,
          scriptsCount: scene.scripts?.length || 0,
        },
        displayPurpose: 'list',
        isUserOwned,
        timestamp: new Date().toISOString(),
      });
    }
  }, [scene.imageUrl, scene.id, scene.name, isUserOwned, imageVariants]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(scene);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    const confirmed = await showConfirm(`确定要删除 "${scene.name}" 吗？删除后将移至回收站。`, '删除场景', 'warning');
    if (confirmed) {
      onDelete(scene);
    }
  };
  return (
    <div 
      onClick={onSelect}
      className="group relative h-96 w-full cursor-pointer overflow-hidden rounded-3xl border shadow-2xl transition-all duration-500 hover:scale-[1.02]"
      style={{
        borderColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: 'var(--shadow-lg)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {scene.imageUrl && scene.imageUrl.trim() ? (
          <LazyImage
            src={scene.imageUrl}
            alt={scene.name}
            variants={imageVariants}
            purpose="list"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
          />
        ) : (
          <div 
            className="h-full w-full flex items-center justify-center pointer-events-none gradient-bg"
            style={{ opacity: 0.5 }}
          >
            <div className="text-6xl opacity-30">✨</div>
          </div>
        )}
        <div 
          className="absolute inset-0 opacity-90 transition-opacity group-hover:opacity-75 z-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, var(--bg-primary) 90%, var(--bg-primary) 60%, transparent)',
          }}
        />
      </div>

      {/* Action Buttons (Top Right) */}
      {isUserOwned && (onEdit || onDelete) && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 flex flex-col gap-2">
          {onEdit && (
            <button
              onClick={handleEditClick}
              className="backdrop-blur-md p-3 rounded-full border transition-all duration-300 shadow-lg"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'var(--text-primary)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
              }}
              title="编辑场景"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="backdrop-blur-md p-3 rounded-full border transition-all duration-300 shadow-lg"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'var(--text-primary)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
              }}
              title="删除场景"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full p-6 text-center z-10 pointer-events-none">
        <h3 
          className="mb-2 text-3xl font-black drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]"
          style={{ color: 'var(--text-primary)' }} 
            style={{ 
              textShadow: '0 3px 15px rgba(0,0,0,0.95), 0 0 20px rgba(0,0,0,0.7), 0 0 30px rgba(0,0,0,0.5)',
              WebkitTextStroke: '1px rgba(0,0,0,0.4)',
              letterSpacing: '0.03em'
            }}>
          {scene.name}
        </h3>
        <p 
          className="text-sm font-bold line-clamp-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
          style={{ color: 'var(--text-primary)' }}
           style={{ 
             textShadow: '0 2px 8px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.6)',
             letterSpacing: '0.01em'
           }}>
          {scene.description}
        </p>
      </div>
      
      <div 
        className="absolute inset-0 rounded-3xl border-2 border-transparent opacity-0 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          borderColor: 'var(--color-primary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0';
        }}
      />
    </div>
  );
};