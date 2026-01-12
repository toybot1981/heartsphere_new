import React, { useState, useEffect, useRef } from 'react';
import { imageApi, type ImageVariants } from '../services/api';
import { InputGroup, TextInput } from './AdminUIComponents';
import { showAlert } from "../utils/dialog";
import type { ImageProcessingResponse } from '../services/api/image/types';
import { LazyImage } from '../components/LazyImage';
import './ImageManagement.css';

interface ImageItem {
  url: string;
  relativePath: string;
  name: string;
  category: string;
  size?: number;
  width?: number;
  height?: number;
  createdAt?: string;
  variants?: ImageVariants;
}

interface ImageManagementProps {
  adminToken: string | null;
}

export const ImageManagement: React.FC<ImageManagementProps> = ({
  adminToken,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [useCustomFolder, setUseCustomFolder] = useState(false);
  const [customFolderName, setCustomFolderName] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Set<string>>(new Set());

  // 预设图片分类选项
  const presetCategories = [
    { value: 'all', label: '全部' },
    { value: 'character', label: '角色' },
    { value: 'era', label: '时代' },
    { value: 'journal', label: '日记' },
    { value: 'general', label: '通用' },
    { value: 'resource_character', label: '角色资源' },
  ];

  // 加载图片列表
  const loadImages = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      // 图片管理模块主要用于系统预置资源
      const result = await imageApi.listImages(
        category === 'all' ? 'all' : category,
        true,  // isSystemResource = true，只获取系统预置资源
        adminToken
      );
      
      if (result.success && result.images) {
        const imageItems: ImageItem[] = result.images.map((img) => ({
          url: img.url,
          relativePath: img.relativePath,
          name: img.name,
          category: img.category,
          size: img.size,
          width: img.width,
          height: img.height,
          createdAt: img.createdAt ? new Date(img.createdAt).toISOString() : undefined,
        }));
        setImages(imageItems);
        
        // 更新可用的分类列表（从图片中提取所有存在的分类）
        const categoriesFromImages = new Set<string>();
        imageItems.forEach(img => {
          if (img.category) {
            categoriesFromImages.add(img.category);
          }
        });
        setAvailableCategories(categoriesFromImages);
      } else {
        setImages([]);
        if (result.error) {
          showAlert('加载图片失败: ' + result.error, '加载失败', 'error');
        }
      }
    } catch (error: any) {
      showAlert('加载图片失败: ' + (error.message || '未知错误'), '加载失败', 'error');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadImages();
    }
  }, [adminToken, category]);

  // 处理文件上传
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !adminToken) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      showAlert('请选择图片文件', '文件类型错误', 'error');
      return;
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      showAlert('图片大小不能超过10MB', '文件过大', 'error');
      return;
    }

    // 确定使用的分类/文件夹名称
    let uploadCategory: string;
    if (useCustomFolder && customFolderName.trim()) {
      // 使用自定义文件夹
      uploadCategory = customFolderName.trim();
      // 验证文件夹名称（只允许字母、数字、下划线、连字符）
      if (!/^[a-zA-Z0-9_-]+$/.test(uploadCategory)) {
        showAlert('文件夹名称只能包含字母、数字、下划线和连字符', '名称无效', 'error');
        return;
      }
    } else {
      // 使用预设分类
      uploadCategory = category === 'all' ? 'general' : category;
    }

    setUploading(true);
    try {
      // 图片管理模块主要用于系统预置资源，所以上传时标记为系统资源
      const result = await imageApi.uploadImage(
        file,
        uploadCategory,
        adminToken,
        true  // isSystemResource = true，标记为系统资源
      );

      if (result.success) {
        showAlert('图片上传成功', '上传成功', 'success');
        setShowUploadModal(false);
        // 如果使用自定义文件夹，切换到该文件夹
        if (useCustomFolder && customFolderName.trim()) {
          const folderValue = customFolderName.trim();
          setCategory(folderValue);
          // 将新文件夹添加到可用分类集合
          setAvailableCategories(prev => new Set(prev).add(folderValue));
        }
        // 重置上传状态
        setUseCustomFolder(false);
        setCustomFolderName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        await loadImages();
        // 选中刚上传的图片
        if (result.url) {
          setSelectedImage({
            url: result.url,
            relativePath: result.url,
            name: file.name,
            category: category === 'all' ? 'general' : category,
            size: file.size,
            variants: result.variants,
          });
        }
      } else {
        showAlert(result.error || '上传失败', '上传失败', 'error');
      }
    } catch (error: any) {
      showAlert('上传失败: ' + (error.message || '未知错误'), '上传失败', 'error');
    } finally {
      setUploading(false);
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 删除图片
  const handleDelete = async (image: ImageItem) => {
    if (!adminToken) return;
    if (!confirm(`确定要删除图片 "${image.name}" 吗？`)) return;

    try {
      const result = await imageApi.deleteImage(image.url, adminToken);
      if (result.success) {
        showAlert('图片删除成功', '删除成功', 'success');
        await loadImages();
        if (selectedImage?.url === image.url) {
          setSelectedImage(null);
        }
      } else {
        showAlert(result.error || '删除失败', '删除失败', 'error');
      }
    } catch (error: any) {
      showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
    }
  };

  // 生成缩略图
  const handleGenerateThumbnail = async (width: number, height: number, quality: number = 0.85) => {
    if (!selectedImage || !adminToken) return;

    setProcessing(true);
    try {
      const result = await imageApi.generateThumbnail(
        selectedImage.url,
        width,
        height,
        adminToken
      );

      if (result.success) {
        showAlert('缩略图生成成功', '处理成功', 'success');
        setShowThumbnailModal(false);
        await loadImages();
      } else {
        showAlert(result.error || '生成缩略图失败', '处理失败', 'error');
      }
    } catch (error: any) {
      showAlert('生成缩略图失败: ' + (error.message || '未知错误'), '处理失败', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // 过滤图片
  const filteredImages = images.filter((img) => {
    if (searchTerm) {
      return img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             img.category.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  // 格式化文件大小
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '未知';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="image-management">
      <div className="image-management-header">
        <h2>图片管理</h2>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            📤 上传图片
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="image-management-filters">
        <InputGroup label="分类筛选">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
          >
            {presetCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
            {/* 显示动态发现的文件夹（不在预设列表中） */}
            {Array.from(availableCategories)
              .filter(cat => !presetCategories.find(pc => pc.value === cat))
              .sort()
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>
        </InputGroup>

        <InputGroup label="搜索">
          <TextInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索图片名称或分类..."
          />
        </InputGroup>
      </div>

      {/* 图片列表和预览 */}
      <div className="image-management-content">
        {/* 图片列表 */}
        <div className="image-list">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : filteredImages.length === 0 ? (
            <div className="empty-state">
              <p>暂无图片</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowUploadModal(true)}
              >
                上传第一张图片
              </button>
            </div>
          ) : (
            <div className="image-grid">
              {filteredImages.map((image, index) => (
                <div
                  key={index}
                  className={`image-card ${selectedImage?.url === image.url ? 'selected' : ''}`}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="image-preview">
                    <LazyImage 
                      src={image.url} 
                      alt={image.name}
                      variants={image.variants}
                      purpose="thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="image-info">
                    <div className="image-name" title={image.name}>
                      {image.name}
                    </div>
                    <div className="image-meta">
                      <span className="category">{image.category}</span>
                      {image.size && (
                        <span className="size">{formatFileSize(image.size)}</span>
                      )}
                    </div>
                  </div>
                  <div className="image-actions">
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image);
                      }}
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 图片详情和工具 */}
        {selectedImage && (
          <div className="image-details">
            <div className="image-details-header">
              <h3>图片详情</h3>
              <button
                className="btn-icon"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </div>

            <div className="image-preview-large">
              <LazyImage 
                src={selectedImage.url} 
                alt={selectedImage.name}
                variants={selectedImage.variants}
                purpose="detail"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="image-info-panel">
              <div className="info-row">
                <label>名称:</label>
                <span>{selectedImage.name}</span>
              </div>
              <div className="info-row">
                <label>分类:</label>
                <span>{selectedImage.category}</span>
              </div>
              <div className="info-row">
                <label>文件大小:</label>
                <span>{formatFileSize(selectedImage.size)}</span>
              </div>
              {selectedImage.width && selectedImage.height && (
                <div className="info-row">
                  <label>尺寸:</label>
                  <span>{selectedImage.width} × {selectedImage.height} px</span>
                </div>
              )}
              <div className="info-row">
                <label>URL:</label>
                <span className="url-text" title={selectedImage.url}>
                  {selectedImage.url}
                </span>
              </div>
            </div>

            {/* 图片处理工具 */}
            <div className="image-tools">
              <h4>图片处理</h4>
              <div className="tool-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowThumbnailModal(true)}
                  disabled={processing}
                >
                  📐 生成缩略图
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCropper(true)}
                  disabled={processing}
                >
                  ✂️ 裁剪图片
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(selectedImage)}
                >
                  🗑️ 删除图片
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 上传模态框 */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => {
          setShowUploadModal(false);
          setUseCustomFolder(false);
          setCustomFolderName('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>上传图片</h3>
              <button
                className="btn-icon"
                onClick={() => {
                  setShowUploadModal(false);
                  setUseCustomFolder(false);
                  setCustomFolderName('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <InputGroup label="上传到文件夹">
                <div className="folder-option-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      checked={!useCustomFolder}
                      onChange={() => setUseCustomFolder(false)}
                    />
                    <span>使用预设分类</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      checked={useCustomFolder}
                      onChange={() => setUseCustomFolder(true)}
                    />
                    <span>使用自定义文件夹</span>
                  </label>
                </div>
              </InputGroup>
              
              {!useCustomFolder ? (
                <InputGroup label="选择分类">
                  <select
                    value={category === 'all' ? 'general' : category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select"
                    disabled={uploading}
                  >
                    {presetCategories.filter(cat => cat.value !== 'all').map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                    {/* 显示动态发现的文件夹（不在预设列表中） */}
                    {Array.from(availableCategories)
                      .filter(cat => !presetCategories.find(pc => pc.value === cat))
                      .sort()
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </InputGroup>
              ) : (
                <InputGroup label="自定义文件夹名称">
                  <input
                    type="text"
                    value={customFolderName}
                    onChange={(e) => setCustomFolderName(e.target.value)}
                    placeholder="输入文件夹名称（只能包含字母、数字、下划线和连字符）"
                    className="form-input"
                    disabled={uploading}
                    pattern="[a-zA-Z0-9_-]+"
                  />
                  <div className="help-text">
                    文件夹名称只能包含字母、数字、下划线(_)和连字符(-)
                  </div>
                </InputGroup>
              )}
              
              <InputGroup label="选择文件">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="form-input"
                  disabled={uploading}
                />
                <div className="help-text">
                  支持 JPG、PNG、WEBP、GIF 格式，最大 10MB
                </div>
              </InputGroup>
              {uploading && (
                <div className="upload-progress">
                  <div className="spinner"></div>
                  <span>上传中...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 生成缩略图模态框 */}
      {showThumbnailModal && selectedImage && (
        <ThumbnailGeneratorModal
          image={selectedImage}
          onGenerate={handleGenerateThumbnail}
          onClose={() => setShowThumbnailModal(false)}
          processing={processing}
          adminToken={adminToken}
        />
      )}

      {/* 图片裁剪模态框 */}
      {showCropper && selectedImage && (
        <ImageCropperModal
          image={selectedImage}
          onCrop={(croppedUrl) => {
            setShowCropper(false);
            showAlert('图片裁剪成功', '处理成功', 'success');
            loadImages();
          }}
          onClose={() => setShowCropper(false)}
          adminToken={adminToken}
        />
      )}
    </div>
  );
};

// 生成缩略图模态框组件
interface ThumbnailGeneratorModalProps {
  image: ImageItem;
  onGenerate: (width: number, height: number, quality: number) => void;
  onClose: () => void;
  processing: boolean;
  adminToken: string | null;
}

const ThumbnailGeneratorModal: React.FC<ThumbnailGeneratorModalProps> = ({
  image,
  onGenerate,
  onClose,
  processing,
  adminToken,
}) => {
  const [width, setWidth] = useState<number>(200);
  const [height, setHeight] = useState<number>(200);
  const [quality, setQuality] = useState<number>(0.85);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);

  // 预设尺寸 - PC和移动端常用分辨率
  const presetSizes = [
    // 缩略图系列
    { label: '超小缩略图 (28×28)', width: 28, height: 28, type: 'thumbnail' },
    { label: '小缩略图 (108×108)', width: 108, height: 108, type: 'thumbnail' },
    { label: '缩略图 (150×150)', width: 150, height: 150, type: 'thumbnail' },
    { label: '中缩略图 (200×200)', width: 200, height: 200, type: 'thumbnail' },
    // 移动端常用尺寸
    { label: '移动端小 (320×240)', width: 320, height: 240, type: 'mobile' },
    { label: '移动端中 (640×480)', width: 640, height: 480, type: 'mobile' },
    { label: '移动端大 (750×1334)', width: 750, height: 1334, type: 'mobile' },
    { label: '移动端横屏 (1334×750)', width: 1334, height: 750, type: 'mobile' },
    // PC端常用尺寸
    { label: 'PC小 (400×300)', width: 400, height: 300, type: 'pc' },
    { label: 'PC中 (800×600)', width: 800, height: 600, type: 'pc' },
    { label: 'PC大 (1280×720)', width: 1280, height: 720, type: 'pc' },
    { label: 'PC全高清 (1920×1080)', width: 1920, height: 1080, type: 'pc' },
    // 正方形尺寸
    { label: '正方形小 (300×300)', width: 300, height: 300, type: 'square' },
    { label: '正方形中 (500×500)', width: 500, height: 500, type: 'square' },
    { label: '正方形大 (800×800)', width: 800, height: 800, type: 'square' },
  ];

  const handlePresetSelect = (preset: typeof presetSizes[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>生成缩略图</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="thumbnail-preview-section">
            <LazyImage 
              src={image.url} 
              alt="预览" 
              className="preview-image"
              variants={image.variants}
              purpose="detail"
            />
          </div>

          <div className="thumbnail-options">
            <h4>预设尺寸</h4>
            <div className="preset-sections">
              <div className="preset-group">
                <h5>缩略图</h5>
                <div className="preset-buttons">
                  {presetSizes.filter(p => p.type === 'thumbnail').map((preset, index) => (
                    <button
                      key={index}
                      className="btn btn-sm"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="preset-group">
                <h5>移动端</h5>
                <div className="preset-buttons">
                  {presetSizes.filter(p => p.type === 'mobile').map((preset, index) => (
                    <button
                      key={index}
                      className="btn btn-sm"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="preset-group">
                <h5>PC端</h5>
                <div className="preset-buttons">
                  {presetSizes.filter(p => p.type === 'pc').map((preset, index) => (
                    <button
                      key={index}
                      className="btn btn-sm"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="preset-group">
                <h5>正方形</h5>
                <div className="preset-buttons">
                  {presetSizes.filter(p => p.type === 'square').map((preset, index) => (
                    <button
                      key={index}
                      className="btn btn-sm"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <h4>自定义尺寸</h4>
            <InputGroup label="宽度 (px)">
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                min="1"
                max="5000"
                className="form-input"
              />
            </InputGroup>
            <InputGroup label="高度 (px)">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                min="1"
                max="5000"
                className="form-input"
              />
            </InputGroup>

            <InputGroup label="保持宽高比">
              <input
                type="checkbox"
                checked={keepAspectRatio}
                onChange={(e) => setKeepAspectRatio(e.target.checked)}
                className="form-checkbox"
              />
            </InputGroup>

            <InputGroup label="压缩质量">
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="form-range"
              />
              <div className="range-value">{Math.round(quality * 100)}%</div>
            </InputGroup>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={onClose}
                disabled={processing}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={() => onGenerate(width, height, quality)}
                disabled={processing || width <= 0 || height <= 0}
              >
                {processing ? '处理中...' : '生成缩略图'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 图片裁剪模态框组件
interface ImageCropperModalProps {
  image: ImageItem;
  onCrop: (croppedUrl: string) => void;
  onClose: () => void;
  adminToken: string | null;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  image,
  onCrop,
  onClose,
  adminToken,
}) => {
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 图片加载后初始化裁剪区域
  const handleImageLoad = () => {
    if (imgRef.current) {
      const img = imgRef.current;
      const width = Math.min(img.naturalWidth, 400);
      const height = Math.min(img.naturalHeight, 400);
      setCropArea({
        x: Math.floor((img.width - width) / 2),
        y: Math.floor((img.height - height) / 2),
        width,
        height,
      });
      setImageLoaded(true);
    }
  };

  // 处理裁剪
  const handleCrop = async () => {
    if (!adminToken || !imgRef.current) return;

    // 计算相对于原始图片的坐标
    const img = imgRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const actualX = Math.floor(cropArea.x * scaleX);
    const actualY = Math.floor(cropArea.y * scaleY);
    const actualWidth = Math.floor(cropArea.width * scaleX);
    const actualHeight = Math.floor(cropArea.height * scaleY);

    setProcessing(true);
    try {
      const result = await imageApi.cropImage(
        image.url,
        actualX,
        actualY,
        actualWidth,
        actualHeight,
        adminToken
      );

      if (result.success && result.url) {
        onCrop(result.url);
      } else {
        showAlert(result.error || '裁剪失败', '处理失败', 'error');
      }
    } catch (error: any) {
      showAlert('裁剪失败: ' + (error.message || '未知错误'), '处理失败', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // 鼠标拖拽处理
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !imgRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否点击在裁剪区域内
    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      setStartPos({ x: x - cropArea.x, y: y - cropArea.y });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !startPos || !containerRef.current || !imgRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - startPos.x;
    const y = e.clientY - rect.top - startPos.y;

    const maxX = imgRef.current.width - cropArea.width;
    const maxY = imgRef.current.height - cropArea.height;

    setCropArea({
      ...cropArea,
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setStartPos(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>裁剪图片</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="cropper-container">
            <div
              ref={containerRef}
              className="cropper-preview"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imgRef}
                src={image.url}
                alt="裁剪预览"
                onLoad={handleImageLoad}
                style={{ maxWidth: '100%', maxHeight: '500px' }}
              />
              {imageLoaded && (
                <div
                  className="crop-overlay"
                  style={{
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.width,
                    height: cropArea.height,
                  }}
                >
                  <div className="crop-handle crop-handle-nw"></div>
                  <div className="crop-handle crop-handle-ne"></div>
                  <div className="crop-handle crop-handle-sw"></div>
                  <div className="crop-handle crop-handle-se"></div>
                </div>
              )}
            </div>

            {imageLoaded && (
              <div className="crop-info">
                <div className="info-row">
                  <label>位置:</label>
                  <span>({cropArea.x}, {cropArea.y})</span>
                </div>
                <div className="info-row">
                  <label>尺寸:</label>
                  <span>{cropArea.width} × {cropArea.height} px</span>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={onClose}
                disabled={processing}
              >
                取消
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCrop}
                disabled={processing || !imageLoaded || cropArea.width <= 0 || cropArea.height <= 0}
              >
                {processing ? '处理中...' : '确认裁剪'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
