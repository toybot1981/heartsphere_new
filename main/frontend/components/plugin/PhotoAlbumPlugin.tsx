// 家庭温馨相册插件组件
import React, { useState, useEffect } from 'react';
import { photoAlbumApi, type Album, type Photo } from '../../services/api/plugin/photoAlbum';
import { showAlert, showConfirm } from '../../utils/dialog';
import { logger } from '../../utils/logger';
import { LazyImage } from '../LazyImage';

interface PhotoAlbumPluginProps {
  pluginInstanceId: number;
  token?: string;
  onClose?: () => void;
}

type ViewMode = 'albums' | 'album-detail' | 'photo-upload' | 'album-create';

export const PhotoAlbumPlugin: React.FC<PhotoAlbumPluginProps> = ({
  pluginInstanceId,
  token,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('albums');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // 调试日志：组件初始化
  useEffect(() => {
    logger.info('[PhotoAlbumPlugin] 组件初始化', {
      pluginInstanceId,
      hasToken: !!token,
      viewMode,
    });
  }, []);

  // 调试日志：viewMode 变化
  useEffect(() => {
    logger.info('[PhotoAlbumPlugin] viewMode 变化', {
      pluginInstanceId,
      viewMode,
      selectedAlbumId: selectedAlbum?.id,
    });
  }, [viewMode, selectedAlbum]);

  // 新建相册表单
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumDescription, setNewAlbumDescription] = useState('');
  const [newAlbumTags, setNewAlbumTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // 上传照片
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});

  useEffect(() => {
    
    logger.info('[PhotoAlbumPlugin] useEffect 触发', {
      pluginInstanceId,
      viewMode,
      hasSelectedAlbum: !!selectedAlbum,
    });
    
    if (viewMode === 'albums') {
      logger.info('[PhotoAlbumPlugin] 加载相册列表');
      loadAlbums();
    } else if (viewMode === 'album-detail' && selectedAlbum) {
      logger.info('[PhotoAlbumPlugin] 加载照片列表', {
        albumId: selectedAlbum.id,
        albumName: selectedAlbum.name,
      });
      loadPhotos();
    }
  }, [viewMode, selectedAlbum]);

  const loadAlbums = async () => {
    logger.info('[PhotoAlbumPlugin] loadAlbums 开始', {
      pluginInstanceId,
      hasToken: !!token,
    });
    
    setLoading(true);
    try {
      const albumList = await photoAlbumApi.getAlbums(pluginInstanceId, token);
      
      logger.info('[PhotoAlbumPlugin] loadAlbums 成功', {
        pluginInstanceId,
        albumCount: albumList?.length || 0,
        albums: albumList?.map(a => ({ id: a.id, name: a.name })) || [],
      });
      
      setAlbums(albumList || []);
    } catch (error) {
      logger.error('[PhotoAlbumPlugin] 加载相册列表失败', {
        pluginInstanceId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // 如果后端API未实现，使用前端模拟数据
      setAlbums([]);
    } finally {
      setLoading(false);
      logger.info('[PhotoAlbumPlugin] loadAlbums 完成', {
        pluginInstanceId,
        loading: false,
      });
    }
  };

  const loadPhotos = async () => {
    if (!selectedAlbum) {
      logger.warn('[PhotoAlbumPlugin] loadPhotos 被调用但 selectedAlbum 为空');
      return;
    }

    logger.info('[PhotoAlbumPlugin] loadPhotos 开始', {
      albumId: selectedAlbum.id,
      albumName: selectedAlbum.name,
      hasToken: !!token,
    });

    setLoading(true);
    try {
      const photoList = await photoAlbumApi.getPhotos(selectedAlbum.id, token);
      
      logger.info('[PhotoAlbumPlugin] loadPhotos 成功', {
        albumId: selectedAlbum.id,
        photoCount: photoList?.length || 0,
      });
      
      setPhotos(photoList || []);
    } catch (error) {
      logger.error('[PhotoAlbumPlugin] 加载照片列表失败', {
        albumId: selectedAlbum.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      setPhotos([]);
    } finally {
      setLoading(false);
      logger.info('[PhotoAlbumPlugin] loadPhotos 完成', {
        albumId: selectedAlbum.id,
        loading: false,
      });
    }
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      showAlert('请输入相册名称', '提示', 'warning');
      return;
    }

    setLoading(true);
    try {
      const album = await photoAlbumApi.createAlbum(
        {
          pluginInstanceId,
          name: newAlbumName,
          description: newAlbumDescription || undefined,
          tags: newAlbumTags.length > 0 ? newAlbumTags : undefined,
        },
        token
      );
      showAlert('相册创建成功', '成功', 'success');
      setNewAlbumName('');
      setNewAlbumDescription('');
      setNewAlbumTags([]);
      setTagInput('');
      setViewMode('albums');
      await loadAlbums();
    } catch (error) {
      logger.error('[PhotoAlbumPlugin] 创建相册失败', error);
      showAlert('创建相册失败: ' + (error instanceof Error ? error.message : '未知错误'), '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlbum = async (album: Album) => {
    const confirmed = await showConfirm(
      `确定要删除相册"${album.name}"吗？相册中的所有照片也将被删除。`,
      '删除相册',
      'warning'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await photoAlbumApi.deleteAlbum(album.id, token);
      showAlert('相册已删除', '成功', 'success');
      await loadAlbums();
      if (selectedAlbum?.id === album.id) {
        setSelectedAlbum(null);
        setViewMode('albums');
      }
    } catch (error) {
      logger.error('[PhotoAlbumPlugin] 删除相册失败', error);
      showAlert('删除相册失败: ' + (error instanceof Error ? error.message : '未知错误'), '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhotos = async () => {
    if (!selectedAlbum || uploadFiles.length === 0) {
      showAlert('请选择要上传的照片', '提示', 'warning');
      return;
    }

    setUploading(true);
    const progress: Record<number, number> = {};

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        progress[i] = 0;
        setUploadProgress({ ...progress });

        try {
          await photoAlbumApi.uploadPhoto(selectedAlbum.id, file, undefined, token);
          progress[i] = 100;
          setUploadProgress({ ...progress });
        } catch (error) {
          logger.error(`[PhotoAlbumPlugin] 上传照片失败: ${file.name}`, error);
          progress[i] = -1; // 标记为失败
          setUploadProgress({ ...progress });
        }
      }

      showAlert('照片上传完成', '成功', 'success');
      setUploadFiles([]);
      setUploadProgress({});
      setViewMode('album-detail');
      await loadPhotos();
    } catch (error) {
      logger.error('[PhotoAlbumPlugin] 批量上传照片失败', error);
      showAlert('上传照片失败: ' + (error instanceof Error ? error.message : '未知错误'), '错误', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadFiles(files);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newAlbumTags.includes(tagInput.trim())) {
      setNewAlbumTags([...newAlbumTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewAlbumTags(newAlbumTags.filter(t => t !== tag));
  };

  // 渲染相册列表视图
  const renderAlbumsView = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="text-lg font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          我的相册
        </h3>
        <button
          onClick={() => setViewMode('album-create')}
          className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5"
          style={{
            background: 'var(--gradient-primary, linear-gradient(to right, #4f46e5, #9333ea))',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #6366f1, #a855f7))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #4f46e5, #9333ea))';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建相册
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div 
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{
              borderColor: 'var(--color-info, #06b6d4)',
              borderTopColor: 'transparent',
            }}
          />
        </div>
      ) : albums.length === 0 ? (
        <div 
          className="flex-1 flex flex-col items-center justify-center"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <div className="text-4xl mb-3">📷</div>
          <p>还没有相册</p>
          <p 
            className="text-xs mt-2"
            style={{ color: 'var(--text-disabled)' }}
          >
            点击"新建相册"创建第一个相册
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {albums.map((album) => (
              <div
                key={album.id}
                onClick={() => {
                  setSelectedAlbum(album);
                  setViewMode('album-detail');
                }}
                className="rounded-lg overflow-hidden cursor-pointer transition-all border"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                  borderColor: 'var(--bg-overlay, #475569)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.borderColor = 'var(--color-info, #06b6d4)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'var(--bg-overlay, #475569)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {album.coverPhotoUrl ? (
                  <div 
                    className="aspect-square"
                    style={{ backgroundColor: 'var(--bg-overlay, #0f172a)' }}
                  >
                    <LazyImage
                      src={album.coverPhotoUrl}
                      alt={album.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div 
                    className="aspect-square flex items-center justify-center"
                    style={{
                      background: 'var(--gradient-primary, linear-gradient(to bottom right, #6366f1, #9333ea))',
                    }}
                  >
                    <span className="text-4xl">📷</span>
                  </div>
                )}
                <div className="p-2">
                  <h4 
                    className="text-sm font-semibold truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {album.name}
                  </h4>
                  <p 
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {album.photoCount} 张照片
                  </p>
                  {album.tags && album.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {album.tags.slice(0, 2).map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: 'var(--bg-secondary, #334155)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // 渲染相册详情视图
  const renderAlbumDetailView = () => {
    if (!selectedAlbum) return null;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedAlbum(null);
                setViewMode('albums');
              }}
              className="p-1 transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 
              className="text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {selectedAlbum.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('photo-upload')}
              className="px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5"
              style={{
                background: 'var(--gradient-primary, linear-gradient(to right, #4f46e5, #9333ea))',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #6366f1, #a855f7))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #4f46e5, #9333ea))';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              上传照片
            </button>
            <button
              onClick={() => handleDeleteAlbum(selectedAlbum)}
              className="p-1.5 transition-colors"
              style={{ color: 'var(--color-error, #f87171)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-error-light, #fca5a5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-error, #f87171)';
              }}
              title="删除相册"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {selectedAlbum.description && (
          <p 
            className="text-sm mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            {selectedAlbum.description}
          </p>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div 
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor: 'var(--color-info, #06b6d4)',
                borderTopColor: 'transparent',
              }}
            />
          </div>
        ) : photos.length === 0 ? (
          <div 
            className="flex-1 flex flex-col items-center justify-center"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <div className="text-4xl mb-3">📸</div>
            <p>相册还是空的</p>
            <p 
              className="text-xs mt-2"
              style={{ color: 'var(--text-disabled)' }}
            >
              点击"上传照片"添加第一张照片
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer transition-all border"
                  style={{
                    backgroundColor: 'var(--bg-overlay, #0f172a)',
                    borderColor: 'var(--bg-overlay, #475569)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.borderColor = 'var(--color-info, #06b6d4)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'var(--bg-overlay, #475569)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <LazyImage
                    src={photo.thumbnailUrl || photo.photoUrl}
                    alt={photo.title || '照片'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染创建相册视图
  const renderCreateAlbumView = () => (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="text-lg font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          新建相册
        </h3>
        <button
          onClick={() => {
            setViewMode('albums');
            setNewAlbumName('');
            setNewAlbumDescription('');
            setNewAlbumTags([]);
            setTagInput('');
          }}
          className="p-1 transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            相册名称 *
          </label>
          <input
            type="text"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg outline-none"
            style={{
              backgroundColor: 'var(--bg-secondary, #1e293b)',
              borderColor: 'var(--bg-overlay, #475569)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-info, #06b6d4)';
              e.currentTarget.style.outline = '2px solid var(--color-info, rgba(6, 182, 212, 0.2))';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bg-overlay, #475569)';
              e.currentTarget.style.outline = 'none';
            }}
            placeholder="例如：恋爱纪念、宝宝成长"
          />
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            相册描述
          </label>
          <textarea
            value={newAlbumDescription}
            onChange={(e) => setNewAlbumDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg outline-none"
            style={{
              backgroundColor: 'var(--bg-secondary, #1e293b)',
              borderColor: 'var(--bg-overlay, #475569)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-info, #06b6d4)';
              e.currentTarget.style.outline = '2px solid var(--color-info, rgba(6, 182, 212, 0.2))';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bg-overlay, #475569)';
              e.currentTarget.style.outline = 'none';
            }}
            placeholder="描述这个相册的内容..."
            rows={3}
          />
        </div>

        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            标签
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-3 py-2 border rounded-lg outline-none"
              style={{
                backgroundColor: 'var(--bg-secondary, #1e293b)',
                borderColor: 'var(--bg-overlay, #475569)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-info, #06b6d4)';
                e.currentTarget.style.outline = '2px solid var(--color-info, rgba(6, 182, 212, 0.2))';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--bg-overlay, #475569)';
                e.currentTarget.style.outline = 'none';
              }}
              placeholder="输入标签后按回车"
            />
            <button
              onClick={handleAddTag}
              className="px-3 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary, #334155)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, #475569)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #334155)';
              }}
            >
              添加
            </button>
          </div>
          {newAlbumTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {newAlbumTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm"
                  style={{
                    backgroundColor: 'var(--color-primary, rgba(79, 70, 229, 0.2))',
                    color: 'var(--color-primary, #c7d2fe)',
                  }}
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="transition-colors"
                    style={{ color: 'var(--color-primary, #818cf8)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-primary-light, #a5b4fc)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-primary, #818cf8)';
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div 
        className="flex items-center justify-end gap-3 pt-4 border-t"
        style={{ borderColor: 'var(--bg-overlay, #475569)' }}
      >
        <button
          onClick={() => {
            setViewMode('albums');
            setNewAlbumName('');
            setNewAlbumDescription('');
            setNewAlbumTags([]);
            setTagInput('');
          }}
          className="px-4 py-2 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          取消
        </button>
        <button
          onClick={handleCreateAlbum}
          disabled={loading || !newAlbumName.trim()}
          className="px-4 py-2 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'var(--gradient-primary, linear-gradient(to right, #4f46e5, #9333ea))',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            if (!loading && newAlbumName.trim()) {
              e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #6366f1, #a855f7))';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && newAlbumName.trim()) {
              e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #4f46e5, #9333ea))';
            }
          }}
        >
          {loading ? '创建中...' : '创建相册'}
        </button>
      </div>
    </div>
  );

  // 渲染上传照片视图
  const renderUploadView = () => {
    if (!selectedAlbum) return null;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setViewMode('album-detail');
                setUploadFiles([]);
                setUploadProgress({});
              }}
              className="p-1 transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 
              className="text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              上传照片到 {selectedAlbum.name}
            </h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              选择照片
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold"
              style={{
                backgroundColor: 'var(--bg-secondary, #1e293b)',
                borderColor: 'var(--bg-overlay, #475569)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {uploadFiles.length > 0 && (
            <div>
              <p 
                className="text-sm mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                已选择 {uploadFiles.length} 张照片
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploadFiles.map((file, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 p-2 rounded"
                    style={{
                      backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--bg-secondary, #334155)',
                      }}
                    >
                      <span className="text-2xl">📷</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p 
                        className="text-sm truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {file.name}
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {uploadProgress[idx] !== undefined && (
                      <div 
                        className="text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {uploadProgress[idx] === -1 ? (
                          <span style={{ color: 'var(--color-error, #f87171)' }}>失败</span>
                        ) : uploadProgress[idx] === 100 ? (
                          <span style={{ color: 'var(--color-success, #4ade80)' }}>✓ 完成</span>
                        ) : (
                          <span>{uploadProgress[idx]}%</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div 
          className="flex items-center justify-end gap-3 pt-4 border-t"
          style={{ borderColor: 'var(--bg-overlay, #475569)' }}
        >
          <button
            onClick={() => {
              setViewMode('album-detail');
              setUploadFiles([]);
              setUploadProgress({});
            }}
            className="px-4 py-2 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            取消
          </button>
          <button
            onClick={handleUploadPhotos}
            disabled={uploading || uploadFiles.length === 0}
            className="px-4 py-2 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--gradient-primary, linear-gradient(to right, #4f46e5, #9333ea))',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              if (!uploading && uploadFiles.length > 0) {
                e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #6366f1, #a855f7))';
              }
            }}
            onMouseLeave={(e) => {
              if (!uploading && uploadFiles.length > 0) {
                e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #4f46e5, #9333ea))';
              }
            }}
          >
            {uploading ? '上传中...' : '开始上传'}
          </button>
        </div>
      </div>
    );
  };

  // 渲染照片查看器
  const renderPhotoViewer = () => {
    if (!selectedPhoto || !selectedAlbum) return null;

    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < photos.length - 1;

    return (
      <div 
        className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm"
        style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.9))' }}
      >
        <div className="relative max-w-5xl max-h-[90vh] p-4 w-full">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 z-10 transition-colors p-2 rounded-full"
            style={{
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.5))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-info, #22d3ee)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {hasPrev && (
            <button
              onClick={() => setSelectedPhoto(photos[currentIndex - 1])}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors p-2 rounded-full"
              style={{
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.5))',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-info, #22d3ee)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {hasNext && (
            <button
              onClick={() => setSelectedPhoto(photos[currentIndex + 1])}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-colors p-2 rounded-full"
              style={{
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.5))',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-info, #22d3ee)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div 
            className="rounded-xl p-4 border"
            style={{
              backgroundColor: 'var(--bg-overlay, #0f172a)',
              borderColor: 'var(--bg-overlay, #475569)',
            }}
          >
            <LazyImage
              src={selectedPhoto.photoUrl}
              alt={selectedPhoto.title || '照片'}
              className="max-w-full max-h-[70vh] object-contain rounded-lg mx-auto"
            />
            <div className="mt-4">
              {selectedPhoto.title && (
                <h3 
                  className="font-semibold text-lg mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {selectedPhoto.title}
                </h3>
              )}
              {selectedPhoto.description && (
                <p 
                  className="text-sm mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {selectedPhoto.description}
                </p>
              )}
              <div 
                className="flex items-center gap-4 text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {selectedPhoto.takenAt && <span>拍摄时间: {new Date(selectedPhoto.takenAt).toLocaleDateString('zh-CN')}</span>}
                {selectedPhoto.location && <span>地点: {selectedPhoto.location}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 调试日志：组件渲染
  useEffect(() => {
    logger.info('[PhotoAlbumPlugin] 组件渲染', {
      pluginInstanceId,
      viewMode,
      albumsCount: albums.length,
      photosCount: photos.length,
      hasSelectedAlbum: !!selectedAlbum,
      hasSelectedPhoto: !!selectedPhoto,
      loading,
      uploading,
      willRenderAlbums: viewMode === 'albums',
      willRenderAlbumDetail: viewMode === 'album-detail',
      willRenderCreate: viewMode === 'album-create',
      willRenderUpload: viewMode === 'photo-upload',
      willRenderPhotoViewer: !!selectedPhoto,
    });
  }, [pluginInstanceId, viewMode, albums.length, photos.length, selectedAlbum, selectedPhoto, loading, uploading]);

  return (
    <div 
      className="h-full w-full flex flex-col rounded-lg overflow-hidden"
      style={{ backgroundColor: 'var(--bg-overlay, #0f172a)' }}
    >
      {viewMode === 'albums' && renderAlbumsView()}
      {viewMode === 'album-detail' && renderAlbumDetailView()}
      {viewMode === 'album-create' && renderCreateAlbumView()}
      {viewMode === 'photo-upload' && renderUploadView()}
      {selectedPhoto && renderPhotoViewer()}
    </div>
  );
};
