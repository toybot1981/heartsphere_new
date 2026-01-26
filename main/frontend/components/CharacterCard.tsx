
import React, { useMemo } from 'react';
import { Character } from '../types';
import { LazyImage } from './LazyImage';
import { generateVariantUrl, type ImageVariants } from '../utils/imageResolution';

interface CharacterCardProps {
  character: Character;
  customAvatarUrl?: string;
  isGenerating: boolean;
  onSelect: (char: Character) => void;
  onGenerate: (char: Character) => void;
  onEdit?: (char: Character) => void;
  onDelete?: (char: Character) => void;
  isUserCreated?: boolean; // 是否是用户创建的角色
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ 
  character, 
  customAvatarUrl,
  isGenerating,
  onSelect,
  onGenerate,
  onEdit,
  onDelete,
  isUserCreated = false
}) => {
  const displayImage = customAvatarUrl || character.avatarUrl;
  
  // 从 avatarUrl 生成多分辨率版本（根据命名规则）
  const imageVariants: ImageVariants | undefined = useMemo(() => {
    if (!displayImage || !displayImage.trim()) return undefined;
    
    return {
      original: displayImage,
      thumbnail: generateVariantUrl(displayImage, 200, 200),
      medium: generateVariantUrl(displayImage, 800, 600),
      highQuality: generateVariantUrl(displayImage, 1920, 1080),
    };
  }, [displayImage]);

  const handleGenerateClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    onGenerate(character);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    if (onEdit) {
      onEdit(character);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    if (onDelete) {
      onDelete(character);
    }
  };

  return (
    <div 
      onClick={() => onSelect(character)}
      className="group relative h-96 w-full cursor-pointer overflow-hidden rounded-3xl border shadow-2xl transition-all duration-500 hover:scale-[1.02]"
      style={{
        borderColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: 'var(--shadow-lg)',
      }}
      style={{
        '--card-accent': character.colorAccent
      } as React.CSSProperties}
    >
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {displayImage && displayImage.trim() ? (
          <LazyImage
            src={displayImage}
            alt={character.name}
            variants={imageVariants}
            purpose="list"
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none ${isGenerating ? 'opacity-50 blur-sm scale-105' : ''}`}
          />
        ) : (
          <div 
            className="h-full w-full flex items-center justify-center pointer-events-none gradient-bg"
            style={{ opacity: 0.5 }}
          >
            <div className="text-6xl opacity-30">👤</div>
          </div>
        )}
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div 
               className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: `${character.colorAccent} transparent transparent transparent` }}
             />
          </div>
        )}
        <div 
          className="absolute inset-0 opacity-80 transition-opacity group-hover:opacity-70 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, var(--bg-primary) 90%, var(--bg-primary) 40%, transparent)',
          }}
        />
      </div>

      {/* Action Buttons (Top Right) */}
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0 flex flex-col gap-2">
        <button
          onClick={handleGenerateClick}
          disabled={isGenerating}
          className="backdrop-blur-md p-3 rounded-full border transition-all duration-300 shadow-lg hover:rotate-180"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'var(--text-primary)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          }}
          style={{ borderColor: character.colorAccent }}
          title="生成新形象"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
        {isUserCreated && onEdit && (
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
            title="编辑角色"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </button>
        )}
        {isUserCreated && onDelete && (
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
            title="删除角色"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 transition-transform duration-300 group-hover:translate-y-0 pointer-events-none z-10">
        <div className="flex flex-wrap gap-2 mb-2">
          {/* 生活助手徽章 */}
          {character.tags && character.tags.includes('生活助手') && (
            <div 
              className="inline-block rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md border"
              style={{ 
                backgroundColor: '#3b82f633', // 蓝色背景，20% opacity
                color: '#60a5fa',
                borderColor: '#3b82f64D' // 30% opacity
              }}
            >
              生活助手
            </div>
          )}
          {/* 角色定位 */}
          <div 
            className="inline-block rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md border"
            style={{ 
              backgroundColor: `${character.colorAccent}33`, // 20% opacity
              color: character.colorAccent,
              borderColor: `${character.colorAccent}4D` // 30% opacity
            }}
          >
            {character.role}
          </div>
        </div>
        <h3 
          className="mb-1 text-2xl font-black transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          style={{ color: 'var(--text-primary)' }}
            style={{ 
              textShadow: `0 2px 12px rgba(0,0,0,0.9), 0 0 20px ${character.colorAccent}40, 0 0 30px rgba(0,0,0,0.7)`,
              WebkitTextStroke: '0.5px rgba(0,0,0,0.3)',
              letterSpacing: '0.02em'
            }}>
          {character.name}
        </h3>
        <p 
          className="text-sm font-semibold line-clamp-2 mb-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]"
          style={{ color: 'var(--text-primary)' }}
           style={{ 
             textShadow: '0 1px 6px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5)',
             letterSpacing: '0.01em'
           }}>
          {character.bio}
        </p>
      </div>
      
      {/* Selection Ring effect */}
      <div 
        className="absolute inset-0 rounded-3xl border-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" 
        style={{ borderColor: character.colorAccent }}
      />
    </div>
  );
};