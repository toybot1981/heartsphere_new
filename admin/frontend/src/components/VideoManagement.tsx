import React, { useState, useEffect, useRef } from 'react';
import { videoApi } from '../services/api';
import { adminApi } from '../services/api/admin';
import { InputGroup, TextInput } from './AdminUIComponents';
import { showAlert } from "../utils/dialog";
import type { VideoToAnimationRequest } from '../services/api/video/types';
import './VideoManagement.css';

interface VideoItem {
  url: string;
  relativePath: string;
  name: string;
  category: string;
  size?: number;
  duration?: number;
  width?: number;
  height?: number;
  createdAt?: string;
}

interface VideoManagementProps {
  adminToken: string | null;
}

export const VideoManagement: React.FC<VideoManagementProps> = ({
  adminToken,
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [category, setCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [useCustomFolder, setUseCustomFolder] = useState(false);
  const [customFolderName, setCustomFolderName] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Set<string>>(new Set());
  const [convertedAnimations, setConvertedAnimations] = useState<Array<{
    url: string;
    format: string;
    relativePath: string;
    createdAt: string;
  }>>([]);

  // 预设视频分类选项
  const presetCategories = [
    { value: 'all', label: '全部' },
    { value: 'character', label: '角色' },
    { value: 'era', label: '时代' },
    { value: 'general', label: '通用' },
    { value: 'resource_character', label: '角色资源' },
  ];

  // 动画格式选项
  const animationFormats: AnimationFormatOption[] = [
    { value: 'gif', label: 'GIF', description: '通用动画格式，兼容性好' },
    { value: 'lottie', label: 'Lottie', description: 'JSON格式，文件小，适合Web和移动端' },
    { value: 'pag', label: 'PAG', description: '腾讯格式，移动端性能优化' },
  ];

  // 加载视频列表
  const loadVideos = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      // 使用 adminApi.videos.getVideos() 获取系统预置资源
      const result = await adminApi.videos.getVideos({
        category: category === 'all' ? undefined : category,
        isSystemResource: true,
        page: 0,
        size: 1000, // 获取所有视频
      });
      
      if (result && result.videos) {
        const videoItems: VideoItem[] = result.videos.map((video: any) => ({
          url: video.url,
          relativePath: video.relativePath || video.url,
          name: video.name || video.url.split('/').pop() || '未命名',
          category: video.category || 'general',
          size: video.size,
          createdAt: video.createdAt ? new Date(video.createdAt).toISOString() : undefined,
        }));
        setVideos(videoItems);
        
        // 更新可用的分类列表（从视频中提取所有存在的分类）
        const categoriesFromVideos = new Set<string>();
        videoItems.forEach(video => {
          if (video.category) {
            categoriesFromVideos.add(video.category);
          }
        });
        setAvailableCategories(categoriesFromVideos);
      } else {
        setVideos([]);
      }
    } catch (error: any) {
      showAlert('加载视频失败: ' + (error.message || '未知错误'), '加载失败', 'error');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadVideos();
    }
  }, [adminToken, category]);

  // 处理视频上传
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !adminToken) return;

    // 验证文件类型
    if (!file.type.startsWith('video/')) {
      showAlert('请选择视频文件', '文件类型错误', 'error');
      return;
    }

    // 验证文件大小（100MB）
    if (file.size > 100 * 1024 * 1024) {
      showAlert('视频大小不能超过100MB', '文件过大', 'error');
      return;
    }

    // 确定使用的分类/文件夹名称
    let uploadCategory: string;
    if (useCustomFolder && customFolderName.trim()) {
      uploadCategory = customFolderName.trim();
      if (!/^[a-zA-Z0-9_-]+$/.test(uploadCategory)) {
        showAlert('文件夹名称只能包含字母、数字、下划线和连字符', '名称无效', 'error');
        return;
      }
    } else {
      uploadCategory = category === 'all' ? 'general' : category;
    }

    setUploading(true);
    try {
      const result = await videoApi.uploadVideo(
        file,
        uploadCategory,
        adminToken,
        true  // isSystemResource = true
      );

      if (result.success) {
        showAlert('视频上传成功', '上传成功', 'success');
        setShowUploadModal(false);
        if (useCustomFolder && customFolderName.trim()) {
          const folderValue = customFolderName.trim();
          setCategory(folderValue);
          setAvailableCategories(prev => new Set(prev).add(folderValue));
        }
        setUseCustomFolder(false);
        setCustomFolderName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        await loadVideos();
      } else {
        showAlert(result.error || '视频上传失败', '上传失败', 'error');
      }
    } catch (error: any) {
      showAlert('视频上传失败: ' + (error.message || '未知错误'), '上传失败', 'error');
    } finally {
      setUploading(false);
    }
  };

  // 处理视频转换
  const handleConvertToAnimation = async (options: VideoToAnimationRequest) => {
    if (!selectedVideo || !adminToken) return;

    setProcessing(true);
    try {
      // 使用 adminApi.videos.convertToAnimation 转换视频
      const { url, ...convertOptions } = options;
      const videoUrl = url || selectedVideo.url;
      
      const result = await adminApi.videos.convertToAnimation(videoUrl, convertOptions);

      // 将转换结果添加到展示列表
      if (result && result.url) {
        const newAnimation = {
          url: result.url,
          format: result.format || convertOptions.format || 'gif',
          relativePath: result.relativePath || '',
          createdAt: new Date().toISOString(),
        };
        setConvertedAnimations(prev => [newAnimation, ...prev]);
      }

      showAlert('视频转换成功', '处理成功', 'success');
      setShowConvertModal(false);
      await loadVideos();
    } catch (error: any) {
      showAlert('视频转换失败: ' + (error.message || '未知错误'), '处理失败', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '未知';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // 格式化时长
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '未知';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-management">
      <div className="video-management-header">
        <h2>视频管理</h2>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            📤 上传视频
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="video-management-filters">
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
            placeholder="搜索视频名称或分类..."
          />
        </InputGroup>
      </div>

      {/* 视频列表 */}
      <div className="video-management-content">
        <div className="video-list">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <span>加载中...</span>
            </div>
          ) : videos.length === 0 ? (
            <div className="empty-state">
              <p>暂无视频</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowUploadModal(true)}
              >
                上传第一个视频
              </button>
            </div>
          ) : (
            <div className="video-grid">
              {videos
                .filter((video) => {
                  if (searchTerm) {
                    return video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.category.toLowerCase().includes(searchTerm.toLowerCase());
                  }
                  return true;
                })
                .map((video) => (
                  <div
                    key={video.url}
                    className={`video-card ${selectedVideo?.url === video.url ? 'selected' : ''}`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="video-thumbnail">
                      <video src={video.url} preload="metadata" />
                      <div className="video-overlay">
                        <span className="play-icon">▶</span>
                      </div>
                    </div>
                    <div className="video-info">
                      <h4 className="video-name">{video.name}</h4>
                      <span className="category">{video.category}</span>
                      <div className="video-meta">
                        <span>{formatFileSize(video.size)}</span>
                        {video.duration && <span>{formatDuration(video.duration)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 视频详情面板 */}
        {selectedVideo && (
          <div className="video-detail-panel">
            <h3>视频详情</h3>
            <div className="detail-item">
              <label>名称:</label>
              <span>{selectedVideo.name}</span>
            </div>
            <div className="detail-item">
              <label>分类:</label>
              <span>{selectedVideo.category}</span>
            </div>
            <div className="detail-item">
              <label>大小:</label>
              <span>{formatFileSize(selectedVideo.size)}</span>
            </div>
            {selectedVideo.duration && (
              <div className="detail-item">
                <label>时长:</label>
                <span>{formatDuration(selectedVideo.duration)}</span>
              </div>
            )}
            {selectedVideo.width && selectedVideo.height && (
              <div className="detail-item">
                <label>尺寸:</label>
                <span>{selectedVideo.width} × {selectedVideo.height}</span>
              </div>
            )}
            <div className="detail-actions">
              <button
                className="btn btn-primary"
                onClick={() => setShowConvertModal(true)}
                disabled={processing}
              >
                🎬 转换为动画
              </button>
            </div>

            {/* 转换后的动画展示区域 */}
            {convertedAnimations.length > 0 && (
              <div className="converted-animations-section">
                <h4>转换后的动画</h4>
                <div className="converted-animations-list">
                  {convertedAnimations.map((animation, index) => (
                    <div key={index} className="converted-animation-item">
                      <div className="animation-preview">
                        {animation.format === 'gif' && (
                          <img 
                            src={animation.url} 
                            alt={`GIF动画 ${index + 1}`}
                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                          />
                        )}
                        {animation.format === 'lottie' && (
                          <div className="lottie-placeholder">
                            <div className="lottie-icon">🎨</div>
                            <p>Lottie 动画</p>
                            <a 
                              href={animation.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-secondary"
                            >
                              查看 JSON
                            </a>
                          </div>
                        )}
                        {animation.format === 'pag' && (
                          <div className="pag-placeholder">
                            <div className="pag-icon">🎬</div>
                            <p>PAG 动画</p>
                            <a 
                              href={animation.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-secondary"
                            >
                              下载文件
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="animation-info">
                        <div className="animation-meta">
                          <span className="animation-format">{animation.format.toUpperCase()}</span>
                          <span className="animation-time">
                            {new Date(animation.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="animation-actions">
                          <a 
                            href={animation.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-primary"
                          >
                            查看
                          </a>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              navigator.clipboard.writeText(animation.url);
                              showAlert('URL已复制到剪贴板', '成功', 'success');
                            }}
                          >
                            复制URL
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {convertedAnimations.length > 0 && (
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setConvertedAnimations([])}
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    清空列表
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 上传视频模态框 */}
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
              <h3>上传视频</h3>
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
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="form-input"
                  disabled={uploading}
                />
                <div className="help-text">
                  支持 MP4、MOV、AVI、WebM 格式，最大 100MB
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

      {/* 转换为动画模态框 */}
      {showConvertModal && selectedVideo && (
        <AnimationConverterModal
          video={selectedVideo}
          onConvert={handleConvertToAnimation}
          onClose={() => setShowConvertModal(false)}
          processing={processing}
          adminToken={adminToken}
          animationFormats={animationFormats}
        />
      )}
    </div>
  );
};

// 动画格式选项类型
interface AnimationFormatOption {
  value: 'gif' | 'lottie' | 'pag';
  label: string;
  description: string;
}

// 动画转换模态框组件
interface AnimationConverterModalProps {
  video: VideoItem;
  onConvert: (options: VideoToAnimationRequest) => void;
  onClose: () => void;
  processing: boolean;
  adminToken: string | null;
  animationFormats: AnimationFormatOption[];
}

const AnimationConverterModal: React.FC<AnimationConverterModalProps> = ({
  video,
  onConvert,
  onClose,
  processing,
  adminToken,
  animationFormats,
}) => {
  const [format, setFormat] = useState<'gif' | 'lottie' | 'pag'>('gif');
  const [fps, setFps] = useState<number>(10);
  const [width, setWidth] = useState<number>(640);
  const [height, setHeight] = useState<number>(480);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [startTime, setStartTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // 格式特定参数
  const [lottiePrecision, setLottiePrecision] = useState<number>(3);
  const [lottieOptimize, setLottieOptimize] = useState<boolean>(true);
  const [pagCompressionLevel, setPagCompressionLevel] = useState<number>(6);
  
  // PAG 可用性检查
  const [pagAvailable, setPagAvailable] = useState<boolean | null>(null);
  const [checkingPag, setCheckingPag] = useState<boolean>(false);

  // 检查 PAG 转换是否可用
  const checkPagAvailability = async () => {
    if (checkingPag) return;
    setCheckingPag(true);
    try {
      const result = await adminApi.videos.checkPagAvailable();
      setPagAvailable(result.available === true);
    } catch (error) {
      console.error('检查 PAG 可用性失败:', error);
      setPagAvailable(false);
    } finally {
      setCheckingPag(false);
    }
  };

  // 当格式改变时，如果是 PAG 则检查可用性
  const handleFormatChange = (newFormat: 'gif' | 'lottie' | 'pag') => {
    setFormat(newFormat);
    if (newFormat === 'pag' && pagAvailable === null) {
      checkPagAvailability();
    }
  };

  const handleConvert = () => {
    // 如果选择 PAG 但不可用，提示用户
    if (format === 'pag' && pagAvailable === false) {
      alert('PAG 转换功能暂不可用。请安装 PAGConvertor 工具后重试。\n\n安装指南请查看：docs/12-开发指南/PAGConvertor安装指南.md');
      return;
    }
    const options: VideoToAnimationRequest = {
      url: video.url,
      format,
      fps,
      width,
      height,
      keepAspectRatio,
      quality: quality as 'low' | 'medium' | 'high' | number,
      startTime: startTime > 0 ? startTime : undefined,
      duration: duration > 0 ? duration : undefined,
    };

    if (format === 'lottie') {
      options.lottiePrecision = lottiePrecision;
      options.lottieOptimize = lottieOptimize;
    } else if (format === 'pag') {
      options.pagCompressionLevel = pagCompressionLevel;
    }

    onConvert(options);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>转换为动画</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="video-preview-section">
            <video src={video.url} controls className="preview-video" />
          </div>

          <div className="conversion-options">
            <InputGroup label="输出格式">
              <select
                value={format}
                onChange={(e) => handleFormatChange(e.target.value as 'gif' | 'lottie' | 'pag')}
                className="form-select"
                disabled={processing}
              >
                {animationFormats.map((fmt) => (
                  <option key={fmt.value} value={fmt.value} disabled={fmt.value === 'pag' && pagAvailable === false}>
                    {fmt.label} - {fmt.description}
                    {fmt.value === 'pag' && pagAvailable === false ? ' (暂不支持)' : ''}
                  </option>
                ))}
              </select>
              {format === 'pag' && pagAvailable === false && (
                <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', color: '#856404', fontSize: '14px' }}>
                  ⚠️ PAG 转换功能暂不可用。请安装 PAGConvertor 工具后重试。
                  <br />
                  <small>安装指南：docs/12-开发指南/PAGConvertor安装指南.md</small>
                </div>
              )}
              {format === 'pag' && checkingPag && (
                <div style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
                  正在检查 PAG 转换功能可用性...
                </div>
              )}
            </InputGroup>

            <InputGroup label="帧率 (FPS)">
              <input
                type="number"
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value) || 10)}
                min="1"
                max="30"
                className="form-input"
                disabled={processing}
              />
            </InputGroup>

            <InputGroup label="宽度 (px)">
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 640)}
                min="1"
                max="1920"
                className="form-input"
                disabled={processing}
              />
            </InputGroup>

            <InputGroup label="高度 (px)">
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 480)}
                min="1"
                max="1080"
                className="form-input"
                disabled={processing}
              />
            </InputGroup>

            <InputGroup label="保持宽高比">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={keepAspectRatio}
                  onChange={(e) => setKeepAspectRatio(e.target.checked)}
                  disabled={processing}
                />
                <span>保持原始宽高比</span>
              </label>
            </InputGroup>

            <InputGroup label="质量">
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value as 'low' | 'medium' | 'high')}
                className="form-select"
                disabled={processing}
              >
                <option value="low">低（文件小）</option>
                <option value="medium">中（平衡）</option>
                <option value="high">高（文件大）</option>
              </select>
            </InputGroup>

            <InputGroup label="开始时间 (秒)">
              <input
                type="number"
                value={startTime}
                onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
                className="form-input"
                disabled={processing}
              />
            </InputGroup>

            <InputGroup label="时长 (秒，0表示全部)">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
                min="0"
                max="30"
                step="0.1"
                className="form-input"
                disabled={processing}
              />
            </InputGroup>

            {/* Lottie格式特定选项 */}
            {format === 'lottie' && (
              <>
                <InputGroup label="Lottie精度">
                  <input
                    type="number"
                    value={lottiePrecision}
                    onChange={(e) => setLottiePrecision(parseInt(e.target.value) || 3)}
                    min="1"
                    max="10"
                    className="form-input"
                    disabled={processing}
                  />
                </InputGroup>
                <InputGroup label="Lottie优化">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={lottieOptimize}
                      onChange={(e) => setLottieOptimize(e.target.checked)}
                      disabled={processing}
                    />
                    <span>优化输出文件</span>
                  </label>
                </InputGroup>
              </>
            )}

            {/* PAG格式特定选项 */}
            {format === 'pag' && (
              <InputGroup label="PAG压缩级别 (0-9)">
                <input
                  type="number"
                  value={pagCompressionLevel}
                  onChange={(e) => setPagCompressionLevel(parseInt(e.target.value) || 6)}
                  min="0"
                  max="9"
                  className="form-input"
                  disabled={processing}
                />
              </InputGroup>
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
                onClick={handleConvert}
                disabled={processing}
              >
                {processing ? '转换中...' : '开始转换'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
