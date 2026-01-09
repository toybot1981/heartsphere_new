// 相册模态框组件
import React, { useState, useEffect } from 'react';
import { imageApi } from '../services/api/image/image';
import { showAlert } from '../utils/dialog';
import { logger } from '../utils/logger';
import { LazyImage } from './LazyImage';

interface ImageInfo {
  url: string;
  relativePath: string;
  name: string;
  category: string;
  size?: number;
  width?: number;
  height?: number;
  createdAt?: number;
  variants?: any;
}

interface PhotoAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
}

export const PhotoAlbumModal: React.FC<PhotoAlbumModalProps> = ({
  isOpen,
  onClose,
  token,
}) => {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [showUserImages, setShowUserImages] = useState(true); // 默认显示用户图片

  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen, category, showUserImages]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await imageApi.listImages(
        category,
        !showUserImages, // isSystemResource: 如果不显示用户图片，则只显示系统资源
        token
      );
      
      if (response.success && response.images) {
        setImages(response.images);
      } else {
        logger.warn('[PhotoAlbumModal] 获取图片列表失败', response);
        setImages([]);
      }
    } catch (error) {
      logger.error('[PhotoAlbumModal] 加载图片列表失败', error);
      showAlert('加载图片失败: ' + (error instanceof Error ? error.message : '未知错误'), '错误', 'error');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (image: ImageInfo) => {
    setSelectedImage(image);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700 w-full max-w-6xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            我的相册
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">分类:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">全部</option>
              <option value="general">通用</option>
              <option value="avatar">头像</option>
              <option value="journal">日志</option>
              <option value="scene">场景</option>
              <option value="character">角色</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">类型:</label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showUserImages}
                onChange={(e) => setShowUserImages(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              <span className="ml-2 text-sm text-slate-300">用户图片</span>
            </label>
          </div>
          <div className="flex-1 text-right text-sm text-slate-400">
            共 {images.length} 张图片
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-3">📷</div>
              <p>暂无图片</p>
              <p className="text-xs mt-2 text-slate-500">上传一些图片到相册吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  onClick={() => handleImageClick(image)}
                  className="group relative aspect-square bg-slate-800 rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 border border-slate-700 hover:border-cyan-500"
                >
                  <LazyImage
                    src={image.url}
                    alt={image.name}
                    variants={image.variants}
                    purpose="thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-xs text-white truncate" title={image.name}>
                        {image.name}
                      </p>
                      {image.category && (
                        <p className="text-[10px] text-slate-300 mt-1">
                          {image.category}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] p-4">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 text-white hover:text-cyan-400 transition-colors p-2 bg-black/50 rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div
              className="bg-slate-900 rounded-xl p-4 border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <LazyImage
                src={selectedImage.url}
                alt={selectedImage.name}
                variants={selectedImage.variants}
                purpose="display"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="mt-4 text-white">
                <h3 className="font-semibold text-lg mb-2">{selectedImage.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                  {selectedImage.category && (
                    <div>
                      <span className="text-slate-400">分类: </span>
                      <span>{selectedImage.category}</span>
                    </div>
                  )}
                  {selectedImage.size && (
                    <div>
                      <span className="text-slate-400">大小: </span>
                      <span>{formatFileSize(selectedImage.size)}</span>
                    </div>
                  )}
                  {selectedImage.width && selectedImage.height && (
                    <div>
                      <span className="text-slate-400">尺寸: </span>
                      <span>{selectedImage.width} × {selectedImage.height}</span>
                    </div>
                  )}
                  {selectedImage.createdAt && (
                    <div>
                      <span className="text-slate-400">上传时间: </span>
                      <span>{formatDate(selectedImage.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
