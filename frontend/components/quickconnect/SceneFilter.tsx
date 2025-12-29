import React, { useState, useEffect } from 'react';
import { worldApi } from '../../services/api/world';

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
 */
export const SceneFilter: React.FC<SceneFilterProps> = ({
  selectedSceneIds,
  onSceneChange,
}) => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    loadScenes();
  }, []);
  
  const loadScenes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const worlds = await worldApi.getAllWorlds(token);
        setScenes(worlds.map(w => ({ id: w.id, name: w.name })));
      }
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
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selectedSceneIds.length > 0
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
        }`}
      >
        <span>🏷️ 场景</span>
        {selectedSceneIds.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
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
          <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-white/20 rounded-xl shadow-2xl z-20 max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">加载中...</div>
            ) : scenes.length === 0 ? (
              <div className="p-4 text-center text-gray-400">暂无场景</div>
            ) : (
              <>
                <div className="p-2 border-b border-white/10 flex items-center justify-between">
                  <span className="text-sm text-gray-300">选择场景</span>
                  {selectedSceneIds.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      清除
                    </button>
                  )}
                </div>
                <div className="p-2">
                  {scenes.map(scene => (
                    <label
                      key={scene.id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSceneIds.includes(scene.id)}
                        onChange={() => handleSceneToggle(scene.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">{scene.name}</span>
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

