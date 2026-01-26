import React, { useState, useEffect, useRef } from 'react';
import { Character, WorldScene } from '../types';
import { imageApi, userMainStoryApi } from '../services/api';
import { Button } from './Button';
import { ResourcePicker } from './ResourcePicker';
import { showAlert } from '../utils/dialog';
import { aiService } from '../services/ai';
import { constructCharacterAvatarPrompt, constructCharacterBackgroundPrompt } from '../utils/promptConstructors';

interface MainStoryEditorProps {
  scene: WorldScene;
  initialMainStory?: Character | null;
  onSave: (mainStory: Character) => void;
  onClose: () => void;
  worldStyle?: string;
}

export const MainStoryEditor: React.FC<MainStoryEditorProps> = ({ 
  scene, 
  initialMainStory, 
  onSave, 
  onClose,
  worldStyle 
}) => {
  const [mainStory, setMainStory] = useState<Character>(() => {
    if (initialMainStory) {
      return initialMainStory;
    }
    return {
      id: '',
      name: '',
      age: 0,
      role: '叙事者',
      bio: '',
      avatarUrl: '',
      backgroundUrl: '',
      themeColor: 'indigo-500',
      colorAccent: '#6366f1',
      firstMessage: '',
      systemInstruction: '',
      voiceName: 'Aoede',
      tags: [],
      speechStyle: '',
      catchphrases: [],
      secrets: '',
      motivations: ''
    };
  });

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);
  const [showAvatarResourcePicker, setShowAvatarResourcePicker] = useState(false);
  const [showBackgroundResourcePicker, setShowBackgroundResourcePicker] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const updateField = (field: keyof Character, value: any) => {
    setMainStory(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (type: 'avatar' | 'background', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'avatar') {
        updateField('avatarUrl', reader.result as string);
      } else {
        updateField('backgroundUrl', reader.result as string);
      }
    };
    reader.readAsDataURL(file);

    if (type === 'avatar') {
      setIsUploadingAvatar(true);
    } else {
      setIsUploadingBackground(true);
    }

    try {
      const token = localStorage.getItem('auth_token');
      const result = await imageApi.uploadImage(file, 'character', token || undefined);
      if (type === 'avatar') {
        updateField('avatarUrl', result.url);
      } else {
        updateField('backgroundUrl', result.url);
      }
    } catch (error) {
      console.error('上传失败:', error);
      showAlert('图片上传失败，请稍后重试', '上传失败', 'error');
    } finally {
      if (type === 'avatar') {
        setIsUploadingAvatar(false);
      } else {
        setIsUploadingBackground(false);
      }
    }
  };

  const handleGenerateAvatar = async () => {
    if (!mainStory.name || !mainStory.role || !mainStory.bio) {
      showAlert('请先填写剧情名称、角色定位和简介', '提示', 'warning');
      return;
    }

    setIsGeneratingAvatar(true);

    try {
      // 构建提示词
      const prompt = constructCharacterAvatarPrompt(
        mainStory.name,
        mainStory.role,
        mainStory.bio,
        mainStory.themeColor || 'indigo-500',
        worldStyle
      );
      
      // 调用AI生成图片（3:4比例，适合头像）
      const response = await aiService.generateImage({
        prompt: prompt,
        aspectRatio: '3:4',
        width: 1024,
        height: 1366,
        numberOfImages: 1
      });

      if (response.images && response.images.length > 0) {
        const generatedImage = response.images[0];
        let imageDataUrl = '';

        // 处理返回的图片
        if (generatedImage.base64) {
          imageDataUrl = `data:image/png;base64,${generatedImage.base64}`;
        } else if (generatedImage.url) {
          try {
            const proxyResult = await imageApi.proxyDownload(generatedImage.url);
            if (proxyResult.success && proxyResult.dataUrl) {
              imageDataUrl = proxyResult.dataUrl;
            } else {
              imageDataUrl = generatedImage.url;
            }
          } catch (e) {
            imageDataUrl = generatedImage.url;
          }
        }

        if (imageDataUrl) {
          // 先显示预览
          updateField('avatarUrl', imageDataUrl);

          // 自动上传到服务器
          setIsUploadingAvatar(true);
          try {
            const token = localStorage.getItem('auth_token');
            const uploadResult = await imageApi.uploadBase64Image(imageDataUrl, 'character', token || undefined);
            
            if (uploadResult.success && uploadResult.url) {
              updateField('avatarUrl', uploadResult.url);
              showAlert('头像生成并上传成功！', '成功', 'success');
            } else {
              throw new Error(uploadResult.error || '上传失败');
            }
          } catch (uploadErr: any) {
            console.error('上传生成的头像失败:', uploadErr);
            showAlert('头像生成成功，但上传失败: ' + (uploadErr.message || '未知错误'), '上传失败', 'warning');
          } finally {
            setIsUploadingAvatar(false);
          }
        } else {
          throw new Error('生成的图片数据无效');
        }
      } else {
        throw new Error('未生成图片');
      }
    } catch (err: any) {
      console.error('AI生成头像失败:', err);
      const errorMsg = err.message || '未知错误';
      if (errorMsg.includes('API key') || errorMsg.includes('配置')) {
        showAlert('AI生成失败：请检查设置中的图片生成API Key配置', '生成失败', 'error');
      } else {
        showAlert('AI生成头像失败: ' + errorMsg, '生成失败', 'error');
      }
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleGenerateBackground = async () => {
    if (!mainStory.name || !mainStory.bio || !scene.name) {
      showAlert('请先填写剧情名称、简介和场景信息', '提示', 'warning');
      return;
    }

    setIsGeneratingBackground(true);

    try {
      // 构建提示词
      const prompt = constructCharacterBackgroundPrompt(
        mainStory.name,
        mainStory.bio,
        scene.name,
        worldStyle
      );
      
      // 调用AI生成图片（16:9比例，适合背景）
      const response = await aiService.generateImage({
        prompt: prompt,
        aspectRatio: '16:9',
        width: 1920,
        height: 1080,
        numberOfImages: 1
      });

      if (response.images && response.images.length > 0) {
        const generatedImage = response.images[0];
        let imageDataUrl = '';

        // 处理返回的图片
        if (generatedImage.base64) {
          imageDataUrl = `data:image/png;base64,${generatedImage.base64}`;
        } else if (generatedImage.url) {
          try {
            const proxyResult = await imageApi.proxyDownload(generatedImage.url);
            if (proxyResult.success && proxyResult.dataUrl) {
              imageDataUrl = proxyResult.dataUrl;
            } else {
              imageDataUrl = generatedImage.url;
            }
          } catch (e) {
            imageDataUrl = generatedImage.url;
          }
        }

        if (imageDataUrl) {
          // 先显示预览
          updateField('backgroundUrl', imageDataUrl);

          // 自动上传到服务器
          setIsUploadingBackground(true);
          try {
            const token = localStorage.getItem('auth_token');
            const uploadResult = await imageApi.uploadBase64Image(imageDataUrl, 'character', token || undefined);
            
            if (uploadResult.success && uploadResult.url) {
              updateField('backgroundUrl', uploadResult.url);
              showAlert('背景图生成并上传成功！', '成功', 'success');
            } else {
              throw new Error(uploadResult.error || '上传失败');
            }
          } catch (uploadErr: any) {
            console.error('上传生成的背景图失败:', uploadErr);
            showAlert('背景图生成成功，但上传失败: ' + (uploadErr.message || '未知错误'), '上传失败', 'warning');
          } finally {
            setIsUploadingBackground(false);
          }
        } else {
          throw new Error('生成的图片数据无效');
        }
      } else {
        throw new Error('未生成图片');
      }
    } catch (err: any) {
      console.error('AI生成背景图失败:', err);
      const errorMsg = err.message || '未知错误';
      if (errorMsg.includes('API key') || errorMsg.includes('配置')) {
        showAlert('AI生成失败：请检查设置中的图片生成API Key配置', '生成失败', 'error');
      } else {
        showAlert('AI生成背景图失败: ' + errorMsg, '生成失败', 'error');
      }
    } finally {
      setIsGeneratingBackground(false);
    }
  };

  const handleSave = () => {
    if (!mainStory.name.trim()) {
      showAlert('请输入剧情名称', '提示', 'warning');
      return;
    }
    if (!mainStory.firstMessage.trim()) {
      showAlert('请输入开场白', '提示', 'warning');
      return;
    }
    onSave(mainStory);
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.8))',
      }}
    >
      <div 
        className="rounded-2xl border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'var(--bg-secondary, #1f2937)',
          borderColor: 'var(--border-color-overlay, #374151)',
        }}
      >
        {/* 头部 */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border-color-overlay, #374151)' }}
        >
          <div>
            <h2 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              编辑主线剧情
            </h2>
          </div>
          <button
            onClick={onClose}
            className="transition-colors text-2xl"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            ×
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 所属场景 */}
          <div>
            <label 
              className="text-sm block mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              所属场景 <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              value={scene.name}
              disabled
              className="w-full rounded-lg px-4 py-2 border cursor-not-allowed"
              style={{
                backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 1))',
                borderColor: 'var(--border-color-overlay, #374151)',
                color: 'var(--text-tertiary)',
              }}
            />
          </div>

          {/* 剧情名称 */}
          <div>
            <label 
              className="text-sm block mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              剧情名称 <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              value={mainStory.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="请输入剧情名称"
              className="w-full rounded-lg px-4 py-2 border outline-none"
              style={{
                backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 1))',
                borderColor: 'var(--border-color-overlay, #374151)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay, #374151)';
              }}
            />
          </div>

          {/* 叙事者年龄和角色定位 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="text-sm block mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                叙事者年龄
              </label>
              <input
                type="number"
                value={mainStory.age || ''}
                onChange={e => updateField('age', parseInt(e.target.value) || 0)}
                className="w-full rounded-lg px-4 py-2 border outline-none"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 1))',
                  borderColor: 'var(--border-color-overlay, #374151)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color-overlay, #374151)';
                }}
              />
            </div>
            <div>
              <label 
                className="text-sm block mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                角色定位
              </label>
              <input
                value={mainStory.role || '叙事者'}
                onChange={e => updateField('role', e.target.value)}
                className="w-full rounded-lg px-4 py-2 border outline-none"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 1))',
                  borderColor: 'var(--border-color-overlay, #374151)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color-overlay, #374151)';
                }}
              />
            </div>
          </div>

          {/* 剧情简介 */}
          <div>
            <label 
              className="text-sm block mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              剧情简介
            </label>
            <textarea
              value={mainStory.bio || ''}
              onChange={e => updateField('bio', e.target.value)}
              placeholder="请输入剧情简介"
              rows={4}
              className="w-full rounded-lg px-4 py-2 border outline-none resize-none"
              style={{
                backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 1))',
                borderColor: 'var(--border-color-overlay, #374151)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay, #374151)';
              }}
            />
          </div>

          {/* 开场白 */}
          <div>
            <label 
              className="text-sm block mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              开场白（第一句问候） <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <textarea
              value={mainStory.firstMessage || ''}
              onChange={e => updateField('firstMessage', e.target.value)}
              placeholder="请输入开场白"
              rows={6}
              className="w-full rounded-lg px-4 py-2 border outline-none resize-none"
              style={{
                backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 1))',
                borderColor: 'var(--border-color-overlay, #374151)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay, #374151)';
              }}
            />
          </div>

          {/* 叙事者头像 */}
          <div>
            <label 
              className="text-sm block mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              叙事者头像
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={mainStory.avatarUrl || ''}
                  onChange={e => updateField('avatarUrl', e.target.value)}
                  placeholder="头像URL或点击上传"
                  className="flex-1 rounded-lg px-4 py-2 border outline-none"
                  style={{
                    backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 1))',
                    borderColor: 'var(--border-color-overlay, #374151)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color-overlay, #374151)';
                  }}
                />
                <button
                  onClick={() => {
                    const token = localStorage.getItem('auth_token');
                    if (token) {
                      setShowAvatarResourcePicker(true);
                    } else {
                      showAlert('请先登录', '提示', 'warning');
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: 'var(--color-primary, #6366f1)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary, #4f46e5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary, #6366f1)';
                  }}
                >
                  选择资源
                </button>
                <button
                  onClick={handleGenerateAvatar}
                  disabled={!mainStory.name || !mainStory.role || !mainStory.bio || isGeneratingAvatar || isUploadingAvatar}
                  className="px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors"
                  style={{
                    background: 'var(--gradient-primary, linear-gradient(to right, #6366f1, #9333ea))',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isGeneratingAvatar && !isUploadingAvatar) {
                      e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #4f46e5, #7c3aed))';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isGeneratingAvatar && !isUploadingAvatar) {
                      e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #6366f1, #9333ea))';
                    }
                  }}
                >
                  {isGeneratingAvatar ? '生成中...' : '🤖 AI生成'}
                </button>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar || isGeneratingAvatar}
                  className="px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors"
                  style={{
                    backgroundColor: 'var(--color-primary, #6366f1)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isUploadingAvatar && !isGeneratingAvatar) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary, #4f46e5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isUploadingAvatar && !isGeneratingAvatar) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary, #6366f1)';
                    }
                  }}
                >
                  {isUploadingAvatar ? '上传中...' : '上传'}
                </button>
              </div>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={e => handleFileUpload('avatar', e)}
                accept="image/*"
                className="hidden"
              />
              {mainStory.avatarUrl && (
                <div 
                  className="relative w-24 h-24 rounded-lg overflow-hidden border"
                  style={{ borderColor: 'var(--border-color-overlay, #374151)' }}
                >
                  <AvatarPreviewImage src={mainStory.avatarUrl} />
                  <button
                    onClick={() => updateField('avatarUrl', '')}
                    className="absolute top-1 right-1 rounded-full p-1 transition-colors text-xs z-10"
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
              )}
            </div>
          </div>

          {/* 背景图 */}
          <div>
            <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>背景图</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={mainStory.backgroundUrl || ''}
                  onChange={e => updateField('backgroundUrl', e.target.value)}
                  placeholder="背景图URL或点击上传"
                  className="flex-1 rounded-lg px-4 py-2 outline-none"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color-overlay)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-info)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                  }}
                />
                <button
                  onClick={() => {
                    const token = localStorage.getItem('auth_token');
                    if (token) {
                      setShowBackgroundResourcePicker(true);
                    } else {
                      showAlert('请先登录', '提示', 'warning');
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--color-info)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-info-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-info)';
                  }}
                >
                  选择资源
                </button>
                <button
                  onClick={handleGenerateBackground}
                  disabled={!mainStory.name || !mainStory.bio || !scene.name || isGeneratingBackground || isUploadingBackground}
                  className="px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  style={{
                    background: 'var(--gradient-primary-button)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {isGeneratingBackground ? '生成中...' : '🤖 AI生成'}
                </button>
                <button
                  onClick={() => bgInputRef.current?.click()}
                  disabled={isUploadingBackground || isGeneratingBackground}
                  className="px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--color-info)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isUploadingBackground && !isGeneratingBackground) {
                      e.currentTarget.style.backgroundColor = 'var(--color-info-light)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-info)';
                  }}
                >
                  {isUploadingBackground ? '上传中...' : '上传'}
                </button>
              </div>
              <input
                type="file"
                ref={bgInputRef}
                onChange={e => handleFileUpload('background', e)}
                accept="image/*"
                className="hidden"
              />
              {mainStory.backgroundUrl && (
                <div
                  className="relative w-full h-32 rounded-lg overflow-hidden border"
                  style={{ borderColor: 'var(--border-color-overlay)' }}
                >
                  <BackgroundPreviewImage src={mainStory.backgroundUrl} />
                  <button
                    onClick={() => updateField('backgroundUrl', '')}
                    className="absolute top-2 right-2 rounded-full p-1 transition-colors z-10"
                    style={{
                      backgroundColor: 'var(--bg-overlay-alpha)',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-error)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-overlay-alpha)';
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 主题色和强调色 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>主题色</label>
              <input
                value={mainStory.themeColor || 'indigo-500'}
                onChange={e => updateField('themeColor', e.target.value)}
                className="w-full rounded-lg px-4 py-2 outline-none"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color-overlay)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-info)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                }}
              />
            </div>
            <div>
              <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>强调色</label>
              <input
                type="color"
                value={mainStory.colorAccent || '#6366f1'}
                onChange={e => updateField('colorAccent', e.target.value)}
                className="w-full rounded-lg px-4 py-2 outline-none h-10"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color-overlay)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-info)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                }}
              />
            </div>
          </div>

          {/* 系统指令 */}
          <div>
            <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>系统指令</label>
            <textarea
              value={mainStory.systemInstruction || ''}
              onChange={e => updateField('systemInstruction', e.target.value)}
              placeholder="请输入系统指令"
              rows={6}
              className="w-full rounded-lg px-4 py-2 outline-none resize-none"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color-overlay)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-info)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
              }}
            />
          </div>

          {/* 语音名称 */}
          <div>
            <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>语音名称</label>
            <input
              value={mainStory.voiceName || ''}
              onChange={e => updateField('voiceName', e.target.value)}
              placeholder="例如: Charon"
              className="w-full rounded-lg px-4 py-2 outline-none"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color-overlay)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-info)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
              }}
            />
          </div>

          {/* 标签 */}
          <div>
            <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>标签（逗号分隔）</label>
            <input
              value={Array.isArray(mainStory.tags) ? mainStory.tags.join(',') : (mainStory.tags || '')}
              onChange={e => {
                const tagsArray = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                updateField('tags', tagsArray);
              }}
              placeholder="例如: Narrator,Story"
              className="w-full rounded-lg px-4 py-2 outline-none"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color-overlay)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-info)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
              }}
            />
          </div>

          {/* 语言风格 */}
          <div>
            <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>语言风格</label>
            <textarea
              value={mainStory.speechStyle || ''}
              onChange={e => updateField('speechStyle', e.target.value)}
              placeholder="请输入语言风格"
              rows={2}
              className="w-full rounded-lg px-4 py-2 outline-none resize-none"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color-overlay)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-info)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
              }}
            />
          </div>

          {/* 口头禅 */}
          <div>
            <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>口头禅（逗号分隔）</label>
            <input
              value={Array.isArray(mainStory.catchphrases) ? mainStory.catchphrases.join(',') : (mainStory.catchphrases || '')}
              onChange={e => {
                const catchphrasesArray = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                updateField('catchphrases', catchphrasesArray);
              }}
              placeholder="例如: 你知道吗,真的吗"
              className="w-full rounded-lg px-4 py-2 outline-none"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color-overlay)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-info)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
              }}
            />
          </div>

          {/* 动机 */}
          <div>
            <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>动机</label>
            <textarea
              value={mainStory.motivations || ''}
              onChange={e => updateField('motivations', e.target.value)}
              placeholder="请输入动机"
              rows={2}
              className="w-full rounded-lg px-4 py-2 outline-none resize-none"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color-overlay)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-info)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
              }}
            />
          </div>

          {/* 秘密 */}
          <div>
            <label className="text-sm block mb-2" style={{ color: 'var(--text-secondary)' }}>秘密</label>
            <textarea
              value={mainStory.secrets || ''}
              onChange={e => updateField('secrets', e.target.value)}
              placeholder="请输入秘密"
              rows={2}
              className="w-full rounded-lg px-4 py-2 outline-none resize-none"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color-overlay)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-info)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
              }}
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div 
          className="flex justify-end gap-4 p-6 border-t"
          style={{ borderColor: 'var(--border-color-overlay, #374151)' }}
        >
          <Button
            onClick={onClose}
            variant="secondary"
            className="px-6 py-2"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 py-2 transition-colors"
            style={{
              backgroundColor: 'var(--color-primary, #6366f1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, #4f46e5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, #6366f1)';
            }}
          >
            保存修改
          </Button>
        </div>

        {/* 资源选择器 */}
        {showAvatarResourcePicker && (
          <ResourcePicker
            category="character"
            token={localStorage.getItem('auth_token') || undefined}
            useAdminApi={false}
            onSelect={(url) => {
              updateField('avatarUrl', url);
              setShowAvatarResourcePicker(false);
            }}
            onClose={() => setShowAvatarResourcePicker(false)}
            currentUrl={mainStory.avatarUrl}
          />
        )}
        {showBackgroundResourcePicker && (
          <ResourcePicker
            category="character"
            token={localStorage.getItem('auth_token') || undefined}
            useAdminApi={false}
            onSelect={(url) => {
              updateField('backgroundUrl', url);
              setShowBackgroundResourcePicker(false);
            }}
            onClose={() => setShowBackgroundResourcePicker(false)}
            currentUrl={mainStory.backgroundUrl}
          />
        )}
      </div>
    </div>
  );
};

/**
 * 头像预览图片组件（使用缩略图）
 */
const AvatarPreviewImage: React.FC<{ src: string }> = ({ src }) => {
    const imageVariants: ImageVariants | undefined = React.useMemo(() => {
        if (!src || !src.trim()) return undefined;
        
        return {
            original: src,
            thumbnail: generateVariantUrl(src, 200, 200),
            medium: generateVariantUrl(src, 800, 600),
            highQuality: generateVariantUrl(src, 1920, 1080),
        };
    }, [src]);

    return (
        <LazyImage
            src={src}
            alt="Avatar Preview"
            className="w-full h-full object-cover"
            variants={imageVariants}
            purpose="thumbnail"
        />
    );
};

/**
 * 背景预览图片组件（使用高像素）
 */
const BackgroundPreviewImage: React.FC<{ src: string }> = ({ src }) => {
    const imageVariants: ImageVariants | undefined = React.useMemo(() => {
        if (!src || !src.trim()) return undefined;
        
        return {
            original: src,
            thumbnail: generateVariantUrl(src, 200, 200),
            medium: generateVariantUrl(src, 800, 600),
            highQuality: generateVariantUrl(src, 1920, 1080),
        };
    }, [src]);

    return (
        <LazyImage
            src={src}
            alt="Background Preview"
            className="w-full h-full object-cover"
            variants={imageVariants}
            purpose="chatBackground"
            isMobile={false}
        />
    );
};



