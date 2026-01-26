import React, { useState, useEffect } from 'react';
import { eraApi } from '../../services/api/scene';
import { sharedApi } from '../../services/api/heartconnect';
import { useSharedMode } from '../../hooks/useSharedMode';

interface Scene {
  id: number;
  name: string;
}

interface SceneFilterProps {
  selectedSceneIds: number[];
  onSceneChange: (sceneIds: number[]) => void;
}

/**
 * 场景筛选组件
 * 显示场景名称（era名称）用于筛选角色
 */
export const SceneFilter: React.FC<SceneFilterProps> = ({
  selectedSceneIds,
  onSceneChange,
}) => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isActive: isSharedMode } = useSharedMode();
  
  useEffect(() => {
    loadScenes();
  }, [isSharedMode]);
  
  const loadScenes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return;
      }
      
      let eras;
      if (isSharedMode) {
        // 共享模式：获取共享的场景列表
        eras = await sharedApi.getSharedEras(token);
      } else {
        // 正常模式：获取用户的场景列表
        eras = await eraApi.getAllEras(token);
      }
      
      // 将 eras 转换为 scenes 格式（场景ID格式为 era_数字）
      const sceneList = eras.map(era => ({
        id: era.id, // 使用 era.id，在筛选时会转换为 era_${id} 格式
        name: era.name || `场景 ${era.id}`,
      }));
      
      setScenes(sceneList);
    } catch (error) {
      console.error('[SceneFilter] 加载场景失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSceneToggle = (sceneId: number) => {
    if (selectedSceneIds.includes(sceneId)) {
      onSceneChange(selectedSceneIds.filter(id => id !== sceneId));
    } else {
      onSceneChange([...selectedSceneIds, sceneId]);
    }
  };
  
  const handleClearAll = () => {
    onSceneChange([]);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
        style={{
          backgroundColor: selectedSceneIds.length > 0
            ? 'var(--color-primary, #3b82f6)'
            : 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
          color: selectedSceneIds.length > 0
            ? 'var(--text-primary)'
            : 'var(--text-secondary)',
          boxShadow: selectedSceneIds.length > 0 ? 'var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.5))' : 'none',
        }}
        onMouseEnter={(e) => {
          if (selectedSceneIds.length === 0) {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedSceneIds.length === 0) {
            e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
      >
        <span>🏷️ 场景</span>
        {selectedSceneIds.length > 0 && (
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{
              backgroundColor: 'var(--bg-overlay-alpha)',
              color: 'var(--text-primary)',
            }}
          >
            {selectedSceneIds.length}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="absolute top-full left-0 mt-2 w-64 border rounded-xl shadow-2xl z-20 max-h-64 overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-card, #1f2937)',
              borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.2))',
            }}
          >
            {isLoading ? (
              <div 
                className="p-4 text-center"
                style={{ color: 'var(--text-tertiary)' }}
              >
                加载中...
              </div>
            ) : scenes.length === 0 ? (
              <div 
                className="p-4 text-center"
                style={{ color: 'var(--text-tertiary)' }}
              >
                暂无场景
              </div>
            ) : (
              <>
                <div 
                  className="p-2 border-b flex items-center justify-between"
                  style={{ borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))' }}
                >
                  <span 
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    选择场景
                  </span>
                  {selectedSceneIds.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs transition-colors"
                      style={{ color: 'var(--color-primary, #60a5fa)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--color-primary-light, #93c5fd)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--color-primary, #60a5fa)';
                      }}
                    >
                      清除
                    </button>
                  )}
                </div>
                <div className="p-2">
                  {scenes.map(scene => (
                    <label
                      key={scene.id}
                      className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
                      style={{
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.1))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSceneIds.includes(scene.id)}
                        onChange={() => handleSceneToggle(scene.id)}
                        className="w-4 h-4 rounded"
                        style={{
                          borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.2))',
                          backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                          accentColor: 'var(--color-primary, #3b82f6)',
                        }}
                      />
                      <span 
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {scene.name}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};



