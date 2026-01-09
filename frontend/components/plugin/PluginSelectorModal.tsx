// 插件选择器弹窗组件
import React, { useState, useEffect } from 'react';
import { userPluginApi } from '../../services/api/plugin';
import type { Plugin } from '../../services/api/admin/pluginTypes';
import { showAlert } from '../../utils/dialog';
import { logger } from '../../utils/logger';

interface PluginSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (plugin: Plugin) => void;
  token?: string;
}

export const PluginSelectorModal: React.FC<PluginSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  token,
}) => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPlugins();
    }
  }, [isOpen]);

  const loadPlugins = async () => {
    setLoading(true);
    try {
      const response = await userPluginApi.getAvailablePlugins(
        {
          keyword: searchQuery || undefined,
          category: selectedCategory || undefined,
          status: 'ACTIVE',
          page: 0,
          size: 50,
        },
        token
      );
      setPlugins(response.plugins || []);
    } catch (error) {
      logger.error('[PluginSelectorModal] 加载插件列表失败', error);
      showAlert('加载插件列表失败: ' + (error instanceof Error ? error.message : '未知错误'), '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (plugin: Plugin) => {
    console.log('[PluginSelectorModal] handleSelect 被调用', { 
      pluginId: plugin.pluginId, 
      pluginName: plugin.name 
    });
    onSelect(plugin);
    onClose();
  };

  const categories = Array.from(new Set(plugins.map(p => p.category).filter(Boolean)));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">添加插件</h2>
            <p className="text-sm text-slate-400 mt-1">选择要添加到现实世界的插件</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    loadPlugins();
                  }
                }}
                placeholder="搜索插件..."
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 pl-10 text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={loadPlugins}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              搜索
            </button>
          </div>
          
          {categories.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  loadPlugins();
                }}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedCategory === null
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat || null);
                    loadPlugins();
                  }}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Plugin List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : plugins.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>暂无可用插件</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-cyan-500 transition-all hover:shadow-lg hover:shadow-cyan-500/20 flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {plugin.iconUrl ? (
                      <img src={plugin.iconUrl} alt={plugin.name} className="w-12 h-12 rounded-lg" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-2xl">🔌</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{plugin.name}</h3>
                      <p className="text-xs text-slate-400">v{plugin.version}</p>
                    </div>
                  </div>
                  
                  {plugin.description && (
                    <p className="text-sm text-slate-300 line-clamp-2 mb-3 flex-1">{plugin.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    {plugin.category && (
                      <span className="px-2 py-1 bg-slate-800 rounded">{plugin.category}</span>
                    )}
                    {plugin.rating && (
                      <span className="flex items-center gap-1">
                        ⭐ {plugin.rating}
                      </span>
                    )}
                  </div>
                  
                  {/* 添加到场景按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('[PluginSelectorModal] 点击添加到场景按钮', { pluginId: plugin.pluginId, pluginName: plugin.name });
                      handleSelect(plugin);
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>添加到场景</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};
