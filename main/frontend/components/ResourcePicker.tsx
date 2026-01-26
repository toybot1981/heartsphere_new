import React, { useState, useEffect } from 'react';
import { resourceApi } from '../services/api';
import { LazyImage } from './LazyImage';

interface ResourcePickerProps {
  category: 'avatar' | 'character' | 'era' | 'scenario' | 'journal' | 'general';
  onSelect: (url: string) => void;
  onClose: () => void;
  currentUrl?: string;
  token?: string;
}

export const ResourcePicker: React.FC<ResourcePickerProps> = ({ 
  category, 
  onSelect, 
  onClose, 
  currentUrl,
  token
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
        const data = await resourceApi.getAll(token, category);
        setResources(data);
      } catch (err) {
        console.error('加载资源失败:', err);
      } finally {
        setLoading(false);
      }
    };
    loadResources();
  }, [category, token]);

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
    onSelect(url);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-md p-4"
      style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.8))' }}
    >
      <div 
        className="rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-card, #0f172a)',
          borderColor: 'var(--color-primary, rgba(99, 102, 241, 0.3))',
        }}
      >
        {/* Header */}
        <div 
          className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--bg-overlay, rgba(30, 41, 59, 1))' }}
        >
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
            选择预置资源
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
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
              <div 
                className="w-8 h-8 border-4 rounded-full animate-spin"
                style={{
                  borderColor: 'var(--bg-overlay, rgba(226, 232, 240, 1)) var(--bg-overlay, rgba(226, 232, 240, 1)) var(--bg-overlay, rgba(226, 232, 240, 1)) var(--color-primary, #6366f1)',
                }}
              />
            </div>
          ) : resources.length === 0 ? (
            <div 
              className="text-center py-12"
              style={{ color: 'var(--text-tertiary)' }}
            >
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
                      ? 'ring-2'
                      : ''
                  }`}
                  style={{
                    borderColor: selectedUrl === resource.url
                      ? 'var(--color-primary, #6366f1)'
                      : 'var(--bg-overlay, rgba(51, 65, 85, 1))',
                    boxShadow: selectedUrl === resource.url
                      ? '0 0 0 2px var(--color-primary, rgba(99, 102, 241, 0.5))'
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedUrl !== resource.url) {
                      e.currentTarget.style.borderColor = 'var(--color-primary-light, #818cf8)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedUrl !== resource.url) {
                      e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(51, 65, 85, 1))';
                    }
                  }}
                >
                  <div 
                    className="aspect-square flex items-center justify-center"
                    style={{ backgroundColor: 'var(--bg-secondary, #1e293b)' }}
                  >
                    <LazyImage
                      src={resource.url}
                      alt={resource.name}
                      className="w-full h-full object-cover"
                      purpose="thumbnail"
                    />
                  </div>
                  {selectedUrl === resource.url && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'var(--color-primary, #6366f1)' }}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t p-2"
                    style={{
                      background: 'linear-gradient(to top, var(--bg-overlay, rgba(0, 0, 0, 0.8)), transparent)',
                    }}
                  >
                    <p 
                      className="text-xs font-medium truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {resource.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t flex justify-end"
          style={{ borderColor: 'var(--bg-overlay, rgba(30, 41, 59, 1))' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary, #475569)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(71, 85, 105, 1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #475569)';
            }}
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};



