
import React, { useState, useRef } from 'react';
import { WorldScene, EraMemory } from '../types';
import { imageApi, type ImageVariants } from '../services/api';
import { Button } from './Button';
import { LazyImage } from './LazyImage';

interface EraMemoryModalProps {
  scene: WorldScene;
  memories: EraMemory[];
  onAddMemory: (content: string, imageUrl?: string) => void;
  onDeleteMemory: (memoryId: string) => void;
  onClose: () => void;
}

export const EraMemoryModal: React.FC<EraMemoryModalProps> = ({ scene, memories, onAddMemory, onDeleteMemory, onClose }) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageVariants, setImageVariants] = useState<import('../../utils/imageResolution').ImageVariants | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 先显示预览（base64）
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 自动上传到服务器
    setIsUploading(true);
    setUploadError('');
    
    try {
      const token = localStorage.getItem('auth_token');
      const result = await imageApi.uploadImage(file, 'journal', token || undefined);
      
      if (result.success && result.url) {
        // 使用服务器返回的URL替换base64预览
        setImageUrl(result.url);
        // 保存多分辨率版本信息
        if (result.variants) {
          setImageVariants(result.variants);
        }
      } else {
        throw new Error(result.error || '上传失败');
      }
    } catch (err: any) {
      console.error('图片上传失败:', err);
      setUploadError('图片上传失败: ' + (err.message || '未知错误') + '。将使用本地预览。');
      // 保持base64预览
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && !imageUrl) return;
    onAddMemory(content, imageUrl || undefined);
    setContent('');
    setImageUrl(null);
  };

  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.8))',
      }}
    >
      <div 
        className="border rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col md:flex-row overflow-hidden shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-secondary, #0f172a)',
          borderColor: 'var(--border-color-overlay, #334155)',
        }}
      >
        
        {/* Left Side: Memory Creator */}
        <div 
          className="w-full md:w-1/3 p-6 flex flex-col border-r"
          style={{
            backgroundColor: 'var(--bg-primary, rgba(2, 6, 23, 0.5))',
            borderColor: 'var(--border-color-overlay, #1e293b)',
          }}
        >
          <div className="mb-6">
            <h3 
              className="text-xl font-bold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              场景记忆
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              在 <span 
                className="font-bold"
                style={{ color: 'var(--color-primary, #ec4899)' }}
              >
                {scene.name}
              </span> 留下的印记
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下关于这个场景的回忆、故事，或者对它的印象..."
              className="w-full h-32 border rounded-lg p-3 outline-none resize-none text-sm"
              style={{
                backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                borderColor: 'var(--border-color-overlay, #334155)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary, #ec4899)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay, #334155)';
              }}
            />
            
            <div 
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center transition-all overflow-hidden"
              style={{
                borderColor: imageUrl 
                  ? 'var(--color-primary, #ec4899)' 
                  : isUploading 
                    ? 'var(--color-info, #3b82f6)' 
                    : 'var(--border-color-overlay, #334155)',
                cursor: isUploading ? 'wait' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!imageUrl && !isUploading) {
                  e.currentTarget.style.borderColor = 'var(--border-color-overlay, #475569)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(30, 41, 59, 1))';
                }
              }}
              onMouseLeave={(e) => {
                if (!imageUrl && !isUploading) {
                  e.currentTarget.style.borderColor = 'var(--border-color-overlay, #334155)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" disabled={isUploading} />
              {isUploading ? (
                <div 
                  className="flex flex-col items-center"
                  style={{ color: 'var(--color-info, #60a5fa)' }}
                >
                  <div 
                    className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-2"
                    style={{
                      borderColor: 'var(--color-info, #60a5fa)',
                      borderTopColor: 'transparent',
                    }}
                  />
                  <span className="text-xs">上传中...</span>
                </div>
              ) : imageUrl ? (
                <div className="relative w-full h-full">
                  <LazyImage 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    variants={imageVariants}
                    purpose="detail"
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageUrl(null);
                      setImageVariants(undefined);
                    }}
                    className="absolute top-2 right-2 rounded-full p-1 transition-colors z-10"
                    style={{
                      backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.6))',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-error, #ef4444)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(0, 0, 0, 0.6))';
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div 
                  className="flex flex-col items-center"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6v12a2.25 2.25 0 002.25 2.25zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span className="text-xs">上传老照片 / 纪念物</span>
                </div>
              )}
            </div>
            {uploadError && (
              <p 
                className="text-xs mt-1"
                style={{ color: 'var(--color-error, #f87171)' }}
              >
                {uploadError}
              </p>
            )}
            
            <Button 
              onClick={handleSubmit} 
              disabled={!content.trim() && !imageUrl} 
              className="mt-2"
              style={{
                backgroundColor: 'var(--color-primary, #db2777)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                if (!(!content.trim() && !imageUrl)) {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary, #ec4899)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!content.trim() && !imageUrl)) {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary, #db2777)';
                }
              }}
            >
              封存记忆
            </Button>
          </div>
          
          <button 
            onClick={onClose} 
            className="text-sm flex items-center gap-2 transition-colors"
            style={{ color: 'var(--text-disabled)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-disabled)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            返回场景
          </button>
        </div>

        {/* Right Side: Memory Gallery */}
        <div 
          className="flex-1 p-6 overflow-y-auto"
          style={{
            backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.2))',
          }}
        >
          {memories.length === 0 ? (
            <div 
              className="h-full flex flex-col items-center justify-center opacity-50"
              style={{ color: 'var(--text-disabled)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>这里还没有回忆。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...memories].sort((a,b) => b.timestamp - a.timestamp).map(memory => (
                <div 
                  key={memory.id} 
                  className="border rounded-xl overflow-hidden group transition-all"
                  style={{
                    backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.05))',
                    borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary, rgba(236, 72, 153, 0.3))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))';
                  }}
                >
                  {memory.imageUrl && (
                    <div className="h-48 w-full overflow-hidden relative">
                      <LazyImage 
                        src={memory.imageUrl} 
                        alt="Memory" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        purpose="detail"
                      />
                      <div 
                        className="absolute inset-0 opacity-60 pointer-events-none"
                        style={{
                          background: 'linear-gradient(to top, var(--bg-overlay-alpha), transparent)',
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4 relative">
                    <button 
                      onClick={() => onDeleteMemory(memory.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--text-disabled)' }}
                      title="删除"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--color-error, #f87171)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-disabled)';
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <p 
                      className="text-sm whitespace-pre-wrap font-serif leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {memory.content}
                    </p>
                    <p 
                      className="text-xs mt-3 border-t pt-2"
                      style={{
                        color: 'var(--text-disabled)',
                        borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.05))',
                      }}
                    >
                      {new Date(memory.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
