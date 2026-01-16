
import React, { useState, useRef, useEffect } from 'react';
import { WorldScene, WorldStyle, WORLD_STYLE_DESCRIPTIONS } from '../types';
import { aiService } from '../services/ai';
import { constructEraCoverPrompt } from '../utils/promptConstructors';
import { imageApi, eraApi } from '../services/api';
import { Button } from './Button';
import { ResourcePicker } from './ResourcePicker';
import { showAlert, showConfirm } from '../utils/dialog';
import { PortalManagement } from './portal';
import { LazyImage } from './LazyImage';
import { generateVariantUrl, type ImageVariants } from '../utils/imageResolution';

interface EraConstructorModalProps {
  initialScene?: WorldScene | null; // Optional: If provided, we are editing
  onSave: (scene: WorldScene) => void;
  onDelete?: () => void;
  onClose: () => void;
  worldStyle?: string; // 当前世界风格
  onOpenSceneCreationWizard?: () => void; // 可选：打开场景创建向导
}

export const EraConstructorModal: React.FC<EraConstructorModalProps> = ({ initialScene, onSave, onDelete, onClose, worldStyle, onOpenSceneCreationWizard }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [style, setStyle] = useState<WorldStyle>('realistic'); // 场景风格，默认写实风格
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState('');
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [showPortalManagement, setShowPortalManagement] = useState(false);
  
  // 预置场景相关状态
  const [systemEras, setSystemEras] = useState<Array<{
    id: number;
    name: string;
    description: string;
    startYear: number | null;
    endYear: number | null;
    imageUrl: string | null;
    isActive: boolean;
    sortOrder: number;
  }>>([]);
  const [showPresetEras, setShowPresetEras] = useState(false);
  const [creationMode, setCreationMode] = useState<'preset' | 'custom'>('preset');
  const [loadingSystemEras, setLoadingSystemEras] = useState(false);
  const [selectedPresetEraId, setSelectedPresetEraId] = useState<number | undefined>(undefined);
  
  // Image Source Mode: 'generate' | 'upload'
  const [imageMode, setImageMode] = useState<'generate' | 'upload'>('generate');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // 加载系统预置场景
  useEffect(() => {
    if (!initialScene && creationMode === 'preset') {
      setLoadingSystemEras(true);
      eraApi.getSystemEras()
        .then(eras => {
          setSystemEras(eras.filter(era => era.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
        })
        .catch(err => {
          console.error('加载预置场景失败:', err);
          setSystemEras([]);
        })
        .finally(() => {
          setLoadingSystemEras(false);
        });
    }
  }, [initialScene, creationMode]);

  // Pre-fill data if editing (只在 initialScene 的 id 变化时重置，避免用户输入时被覆盖)
  const previousInitialSceneIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const currentId = initialScene?.id;
    // 只有当 initialScene 的 id 真正变化时才重置（比如切换到不同的场景编辑，或从编辑切换到新建）
    if (currentId !== previousInitialSceneIdRef.current) {
      previousInitialSceneIdRef.current = currentId;
      if (initialScene) {
          setName(initialScene.name);
          setDescription(initialScene.description);
          setImageUrl(initialScene.imageUrl);
          setStyle(initialScene.style || 'realistic'); // 恢复场景风格，默认写实
          setSelectedPresetEraId(initialScene.systemEraId); // 恢复系统场景ID
          setCreationMode('custom'); // 编辑时默认为自定义模式
          // If it looks like a base64 upload (long string), default to upload mode, otherwise generate mode
          if (initialScene.imageUrl && initialScene.imageUrl.startsWith('data:')) {
              setImageMode('upload');
          }
      } else {
          // 新建时，重置状态
          setName('');
          setDescription('');
          setImageUrl(null);
          setStyle('realistic'); // 新建时默认写实风格
          setSelectedPresetEraId(undefined);
          setCreationMode('preset');
      }
    }
  }, [initialScene?.id]);

  const handleGetPrompt = async () => {
    if (!name || !description) {
        setError('请先填写场景名称和简介。');
        return;
    }
    // 使用场景的风格，如果没有则使用默认的写实风格
    const sceneStyle = style || 'realistic';
    const prompt = constructEraCoverPrompt(name, description, sceneStyle);
    try {
        await navigator.clipboard.writeText(prompt);
        showAlert('提示词已复制到剪贴板！请使用 Midjourney 或其他工具生成图片后上传。', '提示', 'success');
        setImageMode('upload');
    } catch (e) {
        showAlert('复制失败，请手动复制：\n' + prompt, '错误', 'error');
    }
  };

  const handleGenerateImage = async () => {
    if (!name || !description) {
        setError('请先填写场景名称和简介。');
        return;
    }

    setIsGeneratingImage(true);
    setError('');

    try {
        // 构建提示词 - 使用场景的风格，如果没有则使用默认的写实风格
        const sceneStyle = style || 'realistic';
        const prompt = constructEraCoverPrompt(name, description, sceneStyle);
        
        // 调用AI生成图片（3:4比例，适合场景封面）
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

            // 处理返回的图片（可能是URL或base64）
            if (generatedImage.base64) {
                imageDataUrl = `data:image/png;base64,${generatedImage.base64}`;
            } else if (generatedImage.url) {
                // 如果是URL，需要先下载转换为base64
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
                setImageUrl(imageDataUrl);
                setImageMode('upload');

                // 自动上传到服务器
                setIsUploading(true);
                try {
                    const token = localStorage.getItem('auth_token');
                    const uploadResult = await imageApi.uploadBase64Image(imageDataUrl, 'era', token || undefined);
                    
                    if (uploadResult.success && uploadResult.url) {
                        setImageUrl(uploadResult.url);
                        showAlert('图片生成并上传成功！', '成功', 'success');
                    } else {
                        throw new Error(uploadResult.error || '上传失败');
                    }
                } catch (uploadErr: any) {
                    console.error('上传生成的图片失败:', uploadErr);
                    setError('图片生成成功，但上传失败: ' + (uploadErr.message || '未知错误') + '。将使用本地预览。');
                } finally {
                    setIsUploading(false);
                }
            } else {
                throw new Error('生成的图片数据无效');
            }
        } else {
            throw new Error('未生成图片');
        }
    } catch (err: any) {
        console.error('AI生成图片失败:', err);
        const errorMsg = err.message || '未知错误';
        if (errorMsg.includes('API key') || errorMsg.includes('配置')) {
            setError('AI生成失败：请检查设置中的图片生成API Key配置');
        } else {
            setError('AI生成图片失败: ' + errorMsg);
        }
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 先显示预览（base64）
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageUrl(result); // 临时显示预览
    };
    reader.readAsDataURL(file);
    setUploadedFile(file);

    // 自动上传到服务器
    setIsUploading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('auth_token');
      const result = await imageApi.uploadImage(file, 'era', token || undefined);
      
      if (result.success && result.url) {
        // 使用服务器返回的URL替换base64预览
        setImageUrl(result.url);
        // 图片上传成功
      } else {
        throw new Error(result.error || '上传失败');
      }
    } catch (err: any) {
      console.error('图片上传失败:', err);
      setError('图片上传失败: ' + (err.message || '未知错误') + '。将使用本地预览，保存时可能无法正常显示。');
      // 保持base64预览，但提示用户
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageUrl || imageMode !== 'upload') return;
    
    setIsLoading(true);
    try {
        // analyzeImageForEra 需要图片输入，当前暂不支持，返回null
        const analysis = await aiService.analyzeImageForEra(imageUrl);
        if (analysis) {
            setName(analysis.name);
            setDescription(analysis.description);
        } else {
            setError("无法解析图片，请手动填写。");
        }
    } catch(e) {
        setError("AI 解析失败，请重试。");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !description || !imageUrl) {
        setError('请填写所有字段并设置封面图片。');
        return;
    }

    // 如果imageUrl是base64（还未上传），先上传
    let finalImageUrl = imageUrl;
    if (imageUrl.startsWith('data:')) {
      if (uploadedFile) {
        // 有文件但还未上传成功，尝试上传
        setIsLoading(true);
        setError('');
        try {
          const token = localStorage.getItem('auth_token');
          const result = await imageApi.uploadImage(uploadedFile, 'era', token || undefined);
          if (result.success && result.url) {
            finalImageUrl = result.url;
          } else {
            throw new Error(result.error || '上传失败');
          }
        } catch (err: any) {
          setError('图片上传失败: ' + (err.message || '未知错误') + '。将使用本地预览。');
          // 继续使用base64，但提示用户
        } finally {
          setIsLoading(false);
        }
      } else {
        // 没有文件，可能是直接粘贴的base64，尝试上传base64
        setIsLoading(true);
        setError('');
        try {
          const token = localStorage.getItem('auth_token');
          const result = await imageApi.uploadBase64Image(imageUrl, 'era', token || undefined);
          if (result.success && result.url) {
            finalImageUrl = result.url;
          } else {
            throw new Error(result.error || '上传失败');
          }
        } catch (err: any) {
          setError('图片上传失败: ' + (err.message || '未知错误') + '。将使用本地预览。');
          // 继续使用base64
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    // If editing, keep the original ID. If new, generate ID.
    const newScene: WorldScene = {
        id: initialScene ? initialScene.id : `custom_era_${Date.now()}`,
        name,
        description,
        imageUrl: finalImageUrl,
        characters: initialScene ? initialScene.characters : [], // Preserve characters if editing
        mainStory: initialScene ? initialScene.mainStory : undefined,
        systemEraId: selectedPresetEraId, // 保存系统场景ID映射
        style: style // 保存场景风格
    } as WorldScene;
    onSave(newScene);
  };

  const handleSelectPresetEra = (era: typeof systemEras[0]) => {
    setName(era.name);
    setDescription(era.description);
    setImageUrl(era.imageUrl || null);
    setSelectedPresetEraId(era.id); // 保存系统场景ID
    setCreationMode('custom'); // 选择后切换到自定义模式以便进一步编辑
    setShowPresetEras(false);
  };

  const isSaveDisabled = !name || !description || !imageUrl || isLoading || isUploading;

  // 获取场景ID（用于传送门管理）
  // 始终使用作为主键的ID，从 id 字段中解析数字
  const getSceneId = (): number | null => {
    if (!initialScene) return null;
    
    // 从 id 中解析数字（格式可能是 "era_123" 或 "custom_era_123"）
    // 始终使用主键ID，不使用关联的 systemEraId
    const idMatch = initialScene.id.match(/(\d+)$/);
    if (idMatch) {
      return parseInt(idMatch[1], 10);
    }
    
    return null;
  };

  const sceneId = getSceneId();

  return (
    <div 
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => {
        // 点击背景关闭模态框
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-6 relative ${
        showPresetEras ? 'w-full max-w-5xl max-h-[90vh] overflow-y-auto' : 'w-full max-w-lg'
      }`}>
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700 z-10"
          aria-label="关闭"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div>
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
            {initialScene ? '编辑场景' : '场景构造器'}
            </h3>
            <p className="text-sm text-gray-400">{initialScene ? '修改这个世界的设定。' : '创造、回忆或重返任何一个时空。'}</p>
        </div>

        {/* 预置场景选择界面 */}
        {!initialScene && creationMode === 'preset' && (
          <div className="space-y-4">
            <div className="flex gap-3 border-b border-gray-700 pb-3 items-center">
              <button
                onClick={() => setCreationMode('preset')}
                className="text-sm font-bold pb-2 transition-colors text-indigo-400 border-b-2 border-indigo-400"
              >
                📚 选择预置场景
              </button>
              <button
                onClick={() => setCreationMode('custom')}
                className="text-sm font-bold pb-2 transition-colors text-gray-500 hover:text-white"
              >
                ✨ 创建自定义场景
              </button>
              {onOpenSceneCreationWizard && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSceneCreationWizard();
                  }}
                  className="text-sm font-bold pb-2 transition-colors text-pink-500 hover:text-pink-400 ml-auto"
                >
                  📦 使用向导批量创建
                </button>
              )}
            </div>

            {loadingSystemEras ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-400">加载预置场景...</span>
              </div>
            ) : systemEras.length > 0 ? (
              <div>
                <p className="text-sm text-gray-400 mb-4">从预置场景中选择，或创建自定义场景</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {systemEras.map((era) => (
                    <div
                      key={era.id}
                      onClick={() => handleSelectPresetEra(era)}
                      className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all bg-gray-900/50"
                    >
                      {era.imageUrl ? (
                        <PresetEraImage
                          src={era.imageUrl}
                          alt={era.name}
                          className="h-32 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-32 w-full bg-gradient-to-br from-indigo-900/30 to-pink-900/30 flex items-center justify-center">
                          <span className="text-4xl">📅</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h4 className="font-bold text-sm mb-1 truncate">{era.name}</h4>
                        <p className="text-xs text-gray-300 line-clamp-2">{era.description}</p>
                        {(era.startYear || era.endYear) && (
                          <div className="text-xs text-gray-400 mt-1">
                            {era.startYear && era.endYear
                              ? `${era.startYear} - ${era.endYear}`
                              : era.startYear
                              ? `${era.startYear} 起`
                              : era.endYear
                              ? `至 ${era.endYear}`
                              : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <Button
                    onClick={() => setCreationMode('custom')}
                    className="w-full bg-gray-700 hover:bg-gray-600"
                  >
                    创建自定义场景
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">暂无预置场景</p>
                <Button
                  onClick={() => setCreationMode('custom')}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  创建自定义场景
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 自定义场景编辑界面 */}
        {(!initialScene && creationMode === 'custom') || initialScene ? (
          <>
        {/* Image Section First (To drive the context) */}
        <div className="space-y-3">
             <div className="flex gap-4 border-b border-gray-700 pb-2">
                <button 
                  onClick={() => setImageMode('upload')}
                  className={`text-sm font-bold pb-2 transition-colors ${imageMode === 'upload' ? 'text-pink-400 border-b-2 border-pink-400' : 'text-gray-500 hover:text-white'}`}
                >
                    封面设置
                </button>
             </div>

             <div className="flex items-start gap-4">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-1/3 h-48 rounded-lg bg-black/30 border border-dashed flex items-center justify-center overflow-hidden transition-all cursor-pointer hover:border-pink-500 border-gray-600`}
                >
                   {imageUrl ? (
                       <SceneCoverImage src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
                   ) : (
                       <div className="text-center p-2">
                           <div className="flex flex-col items-center text-gray-400">
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                               </svg>
                               <span className="text-xs">点击上传</span>
                           </div>
                       </div>
                   )}
                </div>
                
                <div className="flex-1 space-y-3 flex flex-col justify-center h-48">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    <p className="text-xs text-gray-400">手动上传图片，或获取 AI 提示词去其他平台生成。</p>
                    
                    <div className="flex gap-2 flex-wrap">
                        <Button 
                            onClick={() => {
                                const token = localStorage.getItem('auth_token');
                                if (token) {
                                    setShowResourcePicker(true);
                                } else {
                                    showAlert('请先登录', '提示', 'warning');
                                }
                            }}
                            variant="secondary" 
                            className="text-xs"
                        >
                            🖼️ 选择预置资源
                        </Button>
                        <Button 
                            onClick={handleGenerateImage} 
                            disabled={!name || !description || isGeneratingImage || isUploading} 
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-xs disabled:opacity-50"
                        >
                            {isGeneratingImage ? '生成中...' : '🤖 AI 生成图片'}
                        </Button>
                        <Button onClick={handleGetPrompt} disabled={!name || !description} variant="secondary" className="text-xs">
                            📋 获取提示词
                        </Button>
                        {imageUrl && (
                            <Button onClick={handleAnalyzeImage} disabled={isLoading || isUploading} className="bg-gradient-to-r from-pink-600 to-purple-600 text-xs">
                                {isLoading ? '解析中...' : '🧠 解析影像记忆'}
                            </Button>
                        )}
                    </div>
                    {isUploading && <p className="text-xs text-blue-400">正在上传图片到服务器...</p>}
                    {!imageUrl && !isUploading && <p className="text-xs text-gray-600">请上传图片...</p>}
                </div>
            </div>
        </div>
        
        <div className="space-y-4">
             <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={imageMode === 'upload' ? "场景/事件名称 (例如：98年法兰西之夏)" : "场景名称 (例如：我的赛博梦境)"}
                className="w-full text-lg font-bold bg-white/5 border-2 border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/40 focus:border-pink-400 focus:ring-0 outline-none transition-colors"
              />
               <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={imageMode === 'upload' ? "描述这个瞬间给你的感觉，或让AI帮你解析..." : "描述这个世界的设定..."}
                className="w-full bg-white/5 border-2 border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/40 focus:border-pink-400 focus:ring-0 outline-none transition-colors resize-none h-24 scrollbar-hide"
              />
              
              {/* 场景风格选择器 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">场景风格</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as WorldStyle)}
                  className="w-full bg-white/5 border-2 border-white/10 rounded-lg py-2 px-4 text-white focus:border-pink-400 focus:ring-0 outline-none transition-colors"
                >
                  {(Object.keys(WORLD_STYLE_DESCRIPTIONS) as WorldStyle[]).map((styleOption) => (
                    <option key={styleOption} value={styleOption} className="bg-gray-900">
                      {WORLD_STYLE_DESCRIPTIONS[styleOption].name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400">
                  {WORLD_STYLE_DESCRIPTIONS[style].description}。风格将影响场景和角色图片的生成。
                </p>
              </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
            {initialScene && onDelete && (
                <Button 
                    variant="ghost" 
                    onClick={async () => {
                        const confirmed = await showConfirm("确定要删除这个场景吗？删除后将移至回收站，可以随时恢复。", '删除场景', 'warning');
                        if (confirmed) {
                            onDelete();
                        }
                    }} 
                    className="mr-auto text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                    删除场景
                </Button>
            )}
            {initialScene && sceneId && (
                <Button 
                    variant="ghost" 
                    onClick={() => setShowPortalManagement(true)}
                    className="mr-auto text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20"
                    title="管理该场景的传送门"
                >
                    🔮 管理传送门
                </Button>
            )}
            <Button variant="ghost" onClick={onClose} disabled={isLoading || isUploading}>取消</Button>
            <Button onClick={handleSave} disabled={isSaveDisabled}>
                {isLoading || isUploading ? '处理中...' : (initialScene ? '保存修改' : '创建场景')}
            </Button>
        </div>
          </>
        ) : null}
      </div>
      {showResourcePicker && (
          <ResourcePicker
              category="era"
              onSelect={(url) => {
                  setImageUrl(url);
                  setShowResourcePicker(false);
              }}
              onClose={() => setShowResourcePicker(false)}
              currentUrl={imageUrl || undefined}
              token={localStorage.getItem('auth_token') || undefined}
          />
      )}
      {showPortalManagement && sceneId && (
        <div 
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPortalManagement(false);
            }
          }}
        >
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowPortalManagement(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700 z-10"
              aria-label="关闭"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <PortalManagement
              sceneId={sceneId}
              onClose={() => setShowPortalManagement(false)}
              onPortalCreated={(portal) => {
                // 传送门已创建
                showAlert('传送门创建成功！', '成功', 'success');
              }}
              onPortalUpdated={(portal) => {
                // 传送门已更新
                showAlert('传送门更新成功！', '成功', 'success');
              }}
              onPortalDeleted={(portalId) => {
                // 传送门已删除
                showAlert('传送门删除成功！', '成功', 'success');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 预置场景图片组件（使用缩略图）
 */
const PresetEraImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
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
            alt={alt}
            className={className || ''}
            variants={imageVariants}
            purpose="thumbnail"
        />
    );
};

/**
 * 场景封面图片组件（使用中等像素）
 */
const SceneCoverImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
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
            alt={alt}
            className={className || ''}
            variants={imageVariants}
            purpose="detail"
        />
    );
};