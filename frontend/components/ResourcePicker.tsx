import React, { useState, useEffect } from 'react';
import { resourceApi, adminApi } from '../services/api';

interface ResourcePickerProps {
  category: 'avatar' | 'character' | 'era' | 'scenario' | 'journal' | 'general';
  onSelect: (url: string) => void;
  onClose: () => void;
  currentUrl?: string;
  token?: string;
  useAdminApi?: boolean; // 是否使用管理员 API
}

export const ResourcePicker: React.FC<ResourcePickerProps> = ({ 
  category, 
  onSelect, 
  onClose, 
  currentUrl,
  token,
  useAdminApi = false
}) => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(currentUrl || null);

  useEffect(() => {
    const loadResources = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        // 根据 useAdminApi 决定使用哪个 API
        const data = useAdminApi 
          ? await adminApi.resources.getAll(category, token)
          : await resourceApi.getAll(category, token);
        setResources(data);
      } catch (err) {
        console.error('加载资源失败:', err);
      } finally {
        setLoading(false);
      }
    };
    loadResources();
  }, [category, token, useAdminApi]);

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
    onSelect(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
            选择预置资源
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>暂无预置资源</p>
              <p className="text-sm mt-2">请在管理后台上传资源</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  onClick={() => handleSelect(resource.url)}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedUrl === resource.url
                      ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                      : 'border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  <div className="aspect-square bg-slate-800 flex items-center justify-center">
                    <img
                      src={resource.url}
                      alt={resource.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23334155" width="100" height="100"/%3E%3Ctext fill="%2394a3b8" x="50" y="50" text-anchor="middle" dy=".3em" font-size="12"%3E图片加载失败%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  {selectedUrl === resource.url && (
                    <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs text-white font-medium truncate">{resource.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
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



