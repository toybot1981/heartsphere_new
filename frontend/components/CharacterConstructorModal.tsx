
import React, { useState, useEffect, useRef } from 'react';
import { Character, WorldScene } from '../types';
import { aiService } from '../services/ai';
import { imageApi, characterApi } from '../services/api';
import { Button } from './Button';
import { ResourcePicker } from './ResourcePicker';
import { showAlert } from '../utils/dialog';

interface CharacterConstructorModalProps {
  scene: WorldScene;
  initialCharacter?: Character | null; // Support editing
  onSave: (character: Character) => void;
  onClose: () => void;
  worldStyle?: string; // 当前世界风格
}

export const CharacterConstructorModal: React.FC<CharacterConstructorModalProps> = ({ scene, initialCharacter, onSave, onClose, worldStyle }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCharacter, setGeneratedCharacter] = useState<Character | null>(null);
  
  // Edit Mode State - 移除Tab，改为直接显示所有字段
  
  // Upload states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showAvatarResourcePicker, setShowAvatarResourcePicker] = useState(false);
  const [showBackgroundResourcePicker, setShowBackgroundResourcePicker] = useState(false);
  
  // 预置角色相关状态
  const [systemCharacters, setSystemCharacters] = useState<Array<{
    id: number;
    name: string;
    description: string;
    age: number | null;
    gender: string | null;
    role: string | null;
    bio: string | null;
    avatarUrl: string | null;
    backgroundUrl: string | null;
    themeColor: string | null;
    colorAccent: string | null;
    firstMessage: string | null;
    systemInstruction: string | null;
    voiceName: string | null;
    mbti: string | null;
    tags: string | null;
    speechStyle: string | null;
    catchphrases: string | null;
    secrets: string | null;
    motivations: string | null;
    relationships: string | null;
    systemEraId: number | null;
    isActive: boolean;
    sortOrder: number;
  }>>([]);
  const [showPresetCharacters, setShowPresetCharacters] = useState(false);
  const [creationMode, setCreationMode] = useState<'preset' | 'custom'>('preset');
  const [loadingSystemCharacters, setLoadingSystemCharacters] = useState(false);
  
  // Refs for uploads
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  // 加载系统预置角色 - 在打开模态框时自动加载（如果有systemEraId）
  useEffect(() => {
    // 编辑模式下不自动加载预置角色
    if (initialCharacter) {
      return;
    }
    
    // 只有存在systemEraId时才加载预置角色
    if (!scene.systemEraId) {
      console.log('[CharacterConstructorModal] 场景没有systemEraId，直接进入手动创建模式');
      setSystemCharacters([]);
      setLoadingSystemCharacters(false);
      setCreationMode('custom'); // 没有systemEraId时直接使用自定义模式
      return;
    }
    
    // 有systemEraId时，先尝试加载预置角色
    setLoadingSystemCharacters(true);
    console.log('[CharacterConstructorModal] 加载预置角色，systemEraId:', scene.systemEraId, 'scene:', { id: scene.id, name: scene.name, systemEraId: scene.systemEraId });
    characterApi.getSystemCharacters(scene.systemEraId)
      .then(chars => {
        const activeChars = chars.filter(char => char.isActive).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        console.log('[CharacterConstructorModal] 加载到预置角色数量:', activeChars.length);
        setSystemCharacters(activeChars);
        
        // 如果没有预置角色，直接进入自定义创建模式
        if (activeChars.length === 0) {
          console.log('[CharacterConstructorModal] 没有预置角色，直接进入手动创建模式');
          setCreationMode('custom');
        } else {
          // 有预置角色，显示选择界面
          console.log('[CharacterConstructorModal] 有预置角色，显示选择界面');
          setCreationMode('preset');
        }
      })
      .catch(err => {
        console.error('加载预置角色失败:', err);
        setSystemCharacters([]);
        // 加载失败时，直接进入自定义创建模式
        setCreationMode('custom');
      })
      .finally(() => {
        setLoadingSystemCharacters(false);
      });
  }, [initialCharacter, scene.id, scene.systemEraId]);

  // 只在 initialCharacter 的 id 变化时重置，避免用户输入时被覆盖
  const previousInitialCharacterIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const currentId = initialCharacter?.id;
    // 只有当 initialCharacter 的 id 真正变化时才重置
    if (currentId !== previousInitialCharacterIdRef.current) {
      previousInitialCharacterIdRef.current = currentId;
      if (initialCharacter) {
        // 编辑模式下，确保设置generatedCharacter并切换到自定义模式
        setGeneratedCharacter(initialCharacter);
        setCreationMode('custom');
        setShowPresetCharacters(false); // 编辑模式下不显示预置角色选择界面
      } else {
        // 新建时，重置状态
        setGeneratedCharacter(null);
        // creationMode 会在加载预置角色的 useEffect 中根据实际情况设置
        // 这里不需要预设，让加载预置角色的逻辑来决定
      }
    }
  }, [initialCharacter?.id]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
        setError('请输入一个关于角色的想法。');
        return;
    }
    setError('');
    setIsLoading(true);
    setGeneratedCharacter(null);
    try {
        // 使用统一的AI服务，支持所有模式和provider，具备容错能力
        const newCharacter = await aiService.generateCharacterFromPrompt(prompt, scene.name);
        if (newCharacter) {
            // 清除占位符头像URL（picsum.photos），要求用户手动上传或生成
            if (newCharacter.avatarUrl && newCharacter.avatarUrl.includes('picsum.photos')) {
                newCharacter.avatarUrl = '';
            }
            if (newCharacter.backgroundUrl && newCharacter.backgroundUrl.includes('picsum.photos')) {
                newCharacter.backgroundUrl = '';
            }
            setGeneratedCharacter(newCharacter);
        } else {
            setError('角色生成失败，请调整你的想法或稍后重试。');
        }
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        setError(`角色生成失败：${errorMessage}。请检查API配置或稍后重试。`);
    } finally {
        setIsLoading(false);
    }
  };

  const updateCharacter = (field: keyof Character, value: any) => {
      // 编辑模式下，如果generatedCharacter为空，使用initialCharacter
      const currentCharacter = generatedCharacter || initialCharacter;
      if (!currentCharacter) return;
      
      // 如果当前使用的是initialCharacter，需要创建新的对象
      if (!generatedCharacter && initialCharacter) {
          setGeneratedCharacter({ ...initialCharacter, [field]: value });
      } else {
          setGeneratedCharacter({ ...currentCharacter, [field]: value });
      }
  };
  
  const updateArrayField = (field: 'tags' | 'catchphrases', value: string) => {
      if (!generatedCharacter) return;
      // Split comma-separated string back to array
      const arr = value.split(/,|，/).map(s => s.trim()).filter(s => s);
      setGeneratedCharacter({ ...generatedCharacter, [field]: arr });
  };

  const handleSave = () => {
    if (generatedCharacter) {
        onSave(generatedCharacter);
    }
  };

  // 选择预置角色 - 完整复制所有字段，确保与系统预置角色表结构一致
  const handleSelectPresetCharacter = (presetChar: typeof systemCharacters[0]) => {
    // 处理 tags：可能是字符串（逗号分隔）或数组
    let tagsArray: string[] = [];
    if (presetChar.tags) {
      if (typeof presetChar.tags === 'string') {
        tagsArray = presetChar.tags.split(',').map(t => t.trim()).filter(t => t);
      } else if (Array.isArray(presetChar.tags)) {
        tagsArray = presetChar.tags;
      }
    }
    
    // 处理 catchphrases：可能是字符串（逗号分隔）或数组
    let catchphrasesArray: string[] = [];
    if (presetChar.catchphrases) {
      if (typeof presetChar.catchphrases === 'string') {
        catchphrasesArray = presetChar.catchphrases.split(',').map(c => c.trim()).filter(c => c);
      } else if (Array.isArray(presetChar.catchphrases)) {
        catchphrasesArray = presetChar.catchphrases;
      }
    }
    
    // 处理头像URL：如果是picsum.photos占位符，清空它
    let avatarUrl = presetChar.avatarUrl || '';
    if (avatarUrl.includes('picsum.photos')) {
      avatarUrl = '';
    }
    
    let backgroundUrl = presetChar.backgroundUrl || '';
    if (backgroundUrl.includes('picsum.photos')) {
      backgroundUrl = '';
    }
    
    // 完整复制预置角色的所有字段，确保与系统预置角色表结构一致
    const character: Character = {
      id: initialCharacter ? initialCharacter.id : `preset_${presetChar.id}_${Date.now()}`,
      name: presetChar.name || '未命名角色',
      age: presetChar.age ?? 20, // 使用 ?? 确保 null 也被处理
      role: presetChar.role || '角色',
      bio: presetChar.bio || presetChar.description || '',
      avatarUrl: avatarUrl,
      backgroundUrl: backgroundUrl,
      themeColor: presetChar.themeColor || 'blue-500',
      colorAccent: presetChar.colorAccent || '#3b82f6',
      firstMessage: presetChar.firstMessage || '',
      systemInstruction: presetChar.systemInstruction || '',
      voiceName: presetChar.voiceName || 'Aoede',
      mbti: presetChar.mbti || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      speechStyle: presetChar.speechStyle || undefined,
      catchphrases: catchphrasesArray.length > 0 ? catchphrasesArray : undefined,
      secrets: presetChar.secrets || undefined,
      motivations: presetChar.motivations || undefined,
      relationships: presetChar.relationships || undefined
    };
    setGeneratedCharacter(character);
    setCreationMode('custom'); // 选择后切换到自定义模式以便进一步编辑
    setShowPresetCharacters(false);
  };

  const handleFileUpload = async (type: 'avatar' | 'background', e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !generatedCharacter) return;

      // 先显示预览（base64）
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64Url = reader.result as string;
          
          // 对于头像，如果是手动上传的，缓存到本地
          if (type === 'avatar') {
              try {
                  const { imageCacheService } = await import('../utils/imageCache');
                  const cachedUrl = await imageCacheService.cacheImage(base64Url, generatedCharacter.id);
                  updateCharacter('avatarUrl', cachedUrl);
              } catch (error) {
                  console.error('缓存头像失败，使用base64:', error);
                  updateCharacter('avatarUrl', base64Url);
              }
          } else {
              updateCharacter('backgroundUrl', base64Url);
          }
      };
      reader.readAsDataURL(file);

      // 自动上传到服务器
      if (type === 'avatar') {
          setIsUploadingAvatar(true);
      } else {
          setIsUploadingBackground(true);
      }
      setUploadError('');
      
      try {
          const token = localStorage.getItem('auth_token');
          // 用户手动上传的头像使用 character/user 分类，与系统预置分开
          const category = type === 'avatar' ? 'character/user' : 'character/user';
          const result = await imageApi.uploadImage(file, category, token || undefined);
          
          if (result.success && result.url) {
              // 对于头像，如果是手动上传的，也要缓存本地URL（blob URL），优先使用本地缓存
              if (type === 'avatar') {
                  // 如果当前使用的是blob URL（本地缓存），保留它；否则使用服务器URL
                  const currentUrl = generatedCharacter?.avatarUrl;
                  if (currentUrl && currentUrl.startsWith('blob:')) {
                      // 已缓存，保留blob URL
                      console.log('头像已缓存到本地，保留本地URL:', currentUrl);
                  } else {
                      // 使用服务器URL，但也缓存到本地
                      try {
                          const { imageCacheService } = await import('../utils/imageCache');
                          const cachedUrl = await imageCacheService.cacheImage(result.url, generatedCharacter.id);
                          updateCharacter('avatarUrl', cachedUrl);
                      } catch (error) {
                          console.error('缓存服务器头像失败，使用服务器URL:', error);
                  updateCharacter('avatarUrl', result.url);
                      }
                  }
              } else {
                  updateCharacter('backgroundUrl', result.url);
              }
              console.log('图片上传成功:', result.url);
          } else {
              throw new Error(result.error || '上传失败');
          }
      } catch (err: any) {
          console.error('图片上传失败:', err);
          setUploadError('图片上传失败: ' + (err.message || '未知错误') + '。将使用本地预览。');
          // 保持本地缓存（blob URL或base64）
      } finally {
          if (type === 'avatar') {
              setIsUploadingAvatar(false);
          } else {
              setIsUploadingBackground(false);
          }
      }
  };

  const handleGetPrompt = async (type: 'avatar' | 'background') => {
      if (!generatedCharacter) return;
      let p = '';
      if (type === 'avatar') {
          p = constructCharacterAvatarPrompt(generatedCharacter.name, generatedCharacter.role, generatedCharacter.bio, generatedCharacter.themeColor, worldStyle);
      } else {
          p = constructCharacterBackgroundPrompt(generatedCharacter.name, generatedCharacter.bio, scene.name, worldStyle);
      }
      try {
          await navigator.clipboard.writeText(p);
          showAlert('提示词已复制！', '提示', 'success');
      } catch(e) { showAlert('复制失败', '错误', 'error'); }
  };

  const renderEditor = () => {
      // 编辑模式下，如果generatedCharacter为空，使用initialCharacter
      const characterToEdit = generatedCharacter || initialCharacter;
      if (!characterToEdit) return null;

      return (
          <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
             {/* 与管理后台一致的布局：两列网格，增加间距 */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* 左列：基础信息 */}
                 <div className="space-y-5">
                     <h4 className="text-base font-bold text-indigo-400 border-b border-indigo-900/30 pb-2">基础信息</h4>
                     
                     <div>
                         <label className="text-sm text-gray-400 block mb-2 font-medium">姓名</label>
                         <div className="flex gap-2">
                             <input 
                                 value={characterToEdit.name} 
                                 onChange={e => updateCharacter('name', e.target.value)} 
                                 className="flex-1 bg-gray-900 rounded px-3 py-2 border border-gray-700 text-sm focus:border-indigo-500 outline-none" 
                             />
                             <button
                                 onClick={async () => {
                                     if (!characterToEdit) return;
                                     try {
                                         setIsLoading(true);
                                         const prompt = `请为这个角色生成一个符合其特点的中文名字。角色信息：${characterToEdit.role || ''}，${characterToEdit.bio || ''}。只返回名字，不要其他内容。`;
                                         const tempChar: Character = {
                                             id: 'temp_name_gen',
                                             name: '临时',
                                             age: 20,
                                             role: '助手',
                                             bio: '',
                                             avatarUrl: '',
                                             backgroundUrl: '',
                                             themeColor: 'blue-500',
                                             colorAccent: '#3b82f6',
                                             systemInstruction: '你是一个专业的命名助手，擅长为角色起名。只返回名字，不要其他内容。',
                                             firstMessage: '',
                                             voiceName: 'Kore'
                                         };
                                         let fullText = '';
                                         await aiService.generateTextStream(
                                             {
                                                 prompt: prompt,
                                                 systemInstruction: tempChar.systemInstruction,
                                                 temperature: 0.7,
                                             },
                                             (chunk) => {
                                                 if (!chunk.done && chunk.content) {
                                                     fullText += chunk.content;
                                                 }
                                             }
                                         );
                                         const cleanName = fullText.trim().replace(/["'"]/g, '').split('\n')[0].trim();
                                         if (cleanName) {
                                             updateCharacter('name', cleanName);
                                         } else {
                                             showAlert('AI生成名字失败，请手动输入', '提示', 'warning');
                                         }
                                     } catch (error) {
                                         console.error('AI生成名字失败:', error);
                                         showAlert('AI生成名字失败，请手动输入', '错误', 'error');
                                     } finally {
                                         setIsLoading(false);
                                     }
                                 }}
                                 disabled={isLoading}
                                 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
                                 title="AI生成名字"
                             >
                                 {isLoading ? '生成中...' : '✨ AI'}
                             </button>
                         </div>
                     </div>
                     
                     <div>
                         <label className="text-sm text-gray-400 block mb-2 font-medium">角色定位 (Role)</label>
                         <input 
                             value={characterToEdit.role || ''} 
                             onChange={e => updateCharacter('role', e.target.value)} 
                             className="w-full bg-gray-900 rounded px-3 py-2 border border-gray-700 text-sm focus:border-indigo-500 outline-none" 
                         />
                     </div>
                     
                     <div>
                         <label className="text-sm text-gray-400 block mb-2 font-medium">所属场景 (Scene)</label>
                         <input 
                             value={scene.name} 
                             disabled
                             className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700 text-sm text-gray-500 cursor-not-allowed" 
                         />
                     </div>
                     
                     <div>
                         <label className="text-sm text-gray-400 block mb-2 font-medium">简介 (Bio)</label>
                         <textarea 
                             value={characterToEdit.bio || ''} 
                             onChange={e => updateCharacter('bio', e.target.value)} 
                             className="w-full bg-gray-900 rounded px-3 py-2 border border-gray-700 text-sm focus:border-indigo-500 outline-none resize-none" 
                             rows={4}
                         />
                     </div>
                 </div>

                 {/* 右列：视觉与人设 */}
                 <div className="space-y-5">
                     <h4 className="text-base font-bold text-pink-400 border-b border-pink-900/30 pb-2">视觉与人设</h4>
                     
                     {/* 头像 */}
                     <div>
                         <label className="text-sm text-gray-400 block mb-2 font-medium">头像</label>
                         <div className="space-y-2">
                             <div className="flex flex-col gap-2">
                                 <input 
                                     value={characterToEdit.avatarUrl || ''} 
                                     onChange={e => updateCharacter('avatarUrl', e.target.value)} 
                                     placeholder="头像URL或点击上传"
                                     className="w-full bg-gray-900 rounded px-3 py-2 border border-gray-700 text-sm focus:border-indigo-500 outline-none" 
                                 />
                                 <div className="flex gap-2">
                                 <button 
                                     onClick={() => {
                                         const token = localStorage.getItem('auth_token');
                                         if (token) {
                                             setShowAvatarResourcePicker(true);
                                         } else {
                                             showAlert('请先登录', '提示', 'warning');
                                         }
                                     }}
                                         className="flex-1 px-4 py-2.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20 border border-indigo-700/50 rounded text-sm font-medium transition-colors"
                                         title="选择预置头像"
                                     >
                                         🖼️ 选择预置
                                     </button>
                                     <button 
                                         onClick={async () => {
                                             if (!characterToEdit) return;
                                             setIsUploadingAvatar(true);
                                             setUploadError('');
                                             try {
                                                 // 生成头像
                                                 const avatarUrl = await aiService.generateCharacterImage(
                                                     characterToEdit,
                                                     worldStyle
                                                 );
                                                 if (avatarUrl) {
                                                     // 缓存到本地
                                                     const { imageCacheService } = await import('../utils/imageCache');
                                                     const cachedUrl = await imageCacheService.cacheImage(avatarUrl, characterToEdit.id);
                                                     
                                                     // 上传到服务器（使用character/user分类）
                                                     try {
                                                         let blob: Blob;
                                                         
                                                         // 如果缓存URL是blob URL，直接使用
                                                         if (cachedUrl.startsWith('blob:')) {
                                                             const response = await fetch(cachedUrl);
                                                             blob = await response.blob();
                                                         } else if (cachedUrl.startsWith('data:')) {
                                                             // Base64 URL
                                                             const response = await fetch(cachedUrl);
                                                             blob = await response.blob();
                                                         } else {
                                                             // 如果返回的是原始URL（非blob URL），说明无法缓存（通常是CORS限制）
                                                             // 通过后端代理下载，然后上传到服务器
                                                             console.log('[CharacterConstructorModal] 缓存失败，通过后端代理下载并上传:', cachedUrl);
                                                             const proxyResult = await imageApi.proxyDownload(cachedUrl);
                                                             
                                                             if (proxyResult.success && proxyResult.dataUrl) {
                                                                 // 将 data URL 转换为 blob
                                                                 const response = await fetch(proxyResult.dataUrl);
                                                                 blob = await response.blob();
                                                                 console.log('[CharacterConstructorModal] 通过后端代理下载成功，大小:', proxyResult.size, 'bytes');
                                                             } else {
                                                                 throw new Error(proxyResult.error || '后端代理下载失败');
                                                             }
                                                         }
                                                         
                                                         const file = new File([blob], `character-${characterToEdit.id}-avatar-${Date.now()}.png`, { type: blob.type || 'image/png' });
                                                         
                                                         const token = localStorage.getItem('auth_token');
                                                         const result = await imageApi.uploadImage(file, 'character/user', token || undefined);
                                                         
                                                         if (result.success && result.url) {
                                                             // 使用服务器URL，但也保留本地缓存
                                                             updateCharacter('avatarUrl', result.url);
                                                             showAlert('头像生成并上传成功', '成功', 'success');
                                                         } else {
                                                             // 上传失败，使用本地缓存
                                                             updateCharacter('avatarUrl', cachedUrl);
                                                             showAlert('头像生成成功，但上传失败，已使用本地缓存', '提示', 'warning');
                                                         }
                                                     } catch (uploadError) {
                                                         console.error('上传生成的头像失败:', uploadError);
                                                         // 上传失败，使用本地缓存
                                                         updateCharacter('avatarUrl', cachedUrl);
                                                         showAlert('头像生成成功，但上传失败，已使用本地缓存', '提示', 'warning');
                                                     }
                                                 } else {
                                                     showAlert('头像生成失败，请重试', '错误', 'error');
                                                 }
                                             } catch (error: any) {
                                                 console.error('生成头像失败:', error);
                                                 setUploadError('生成头像失败: ' + (error.message || '未知错误'));
                                                 showAlert('生成头像失败: ' + (error.message || '未知错误'), '错误', 'error');
                                             } finally {
                                                 setIsUploadingAvatar(false);
                                             }
                                         }}
                                         disabled={isUploadingAvatar || isLoading}
                                         className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                         title="AI生成头像"
                                     >
                                         {isUploadingAvatar ? '生成中...' : '✨ AI生成'}
                                 </button>
                                 <button 
                                     onClick={() => avatarInputRef.current?.click()} 
                                     disabled={isUploadingAvatar}
                                         className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                 >
                                         {isUploadingAvatar ? '上传中...' : '📤 上传'}
                                 </button>
                                 </div>
                             </div>
                             <input 
                                 type="file" 
                                 ref={avatarInputRef} 
                                 onChange={e => handleFileUpload('avatar', e)} 
                                 accept="image/*" 
                                 className="hidden" 
                             />
                             {characterToEdit.avatarUrl && !characterToEdit.avatarUrl.includes('picsum.photos') && (
                                 <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-700">
                                     <img src={characterToEdit.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                     <button 
                                         onClick={() => updateCharacter('avatarUrl', '')} 
                                         className="absolute top-0 right-0 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors text-xs"
                                     >
                                         ×
                                     </button>
                                 </div>
                             )}
                             {characterToEdit.avatarUrl && characterToEdit.avatarUrl.includes('picsum.photos') && (
                                 <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-700 bg-gray-800 flex items-center justify-center">
                                     <span className="text-xs text-gray-500">占位符</span>
                                     <button 
                                         onClick={() => updateCharacter('avatarUrl', '')} 
                                         className="absolute top-0 right-0 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors text-xs"
                                     >
                                         ×
                                     </button>
                                 </div>
                             )}
                         </div>
                     </div>
                     
                     {/* 背景 */}
                     <div>
                         <label className="text-sm text-gray-400 block mb-2 font-medium">背景</label>
                         <div className="space-y-2">
                             <div className="flex flex-col gap-2">
                                 <input 
                                     value={characterToEdit.backgroundUrl || ''} 
                                     onChange={e => updateCharacter('backgroundUrl', e.target.value)} 
                                     placeholder="背景URL或点击上传"
                                     className="w-full bg-gray-900 rounded px-3 py-2 border border-gray-700 text-sm focus:border-indigo-500 outline-none" 
                                 />
                                 <div className="flex gap-2">
                                 <button 
                                     onClick={() => {
                                         const token = localStorage.getItem('auth_token');
                                         if (token) {
                                             setShowBackgroundResourcePicker(true);
                                         } else {
                                             showAlert('请先登录', '提示', 'warning');
                                         }
                                     }}
                                         className="flex-1 px-4 py-2.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20 border border-indigo-700/50 rounded text-sm font-medium transition-colors"
                                         title="选择预置背景"
                                     >
                                         🖼️ 选择预置
                                     </button>
                                     <button 
                                         onClick={async () => {
                                             if (!characterToEdit) return;
                                             setIsUploadingBackground(true);
                                             setUploadError('');
                                             try {
                                                 // 生成背景
                                                 const { constructCharacterBackgroundPrompt } = await import('../utils/promptConstructors');
                                                 const prompt = constructCharacterBackgroundPrompt(
                                                     characterToEdit.name,
                                                     characterToEdit.bio || '',
                                                     scene.name,
                                                     worldStyle
                                                 );
                                                 const backgroundUrl = await aiService.generateImageFromPrompt(prompt, '16:9');
                                                 
                                                 if (backgroundUrl) {
                                                     // 缓存到本地
                                                     const { imageCacheService } = await import('../utils/imageCache');
                                                     const cachedUrl = await imageCacheService.cacheImage(backgroundUrl, characterToEdit.id);
                                                     
                                                     // 上传到服务器（使用character/user分类）
                                                     try {
                                                         let blob: Blob;
                                                         
                                                         // 如果缓存URL是blob URL，直接使用
                                                         if (cachedUrl.startsWith('blob:')) {
                                                             const response = await fetch(cachedUrl);
                                                             blob = await response.blob();
                                                         } else if (cachedUrl.startsWith('data:')) {
                                                             // Base64 URL
                                                             const response = await fetch(cachedUrl);
                                                             blob = await response.blob();
                                                         } else {
                                                             // 如果返回的是原始URL（非blob URL），说明无法缓存（通常是CORS限制）
                                                             // 通过后端代理下载，然后上传到服务器
                                                             console.log('[CharacterConstructorModal] 背景缓存失败，通过后端代理下载并上传:', cachedUrl);
                                                             const proxyResult = await imageApi.proxyDownload(cachedUrl);
                                                             
                                                             if (proxyResult.success && proxyResult.dataUrl) {
                                                                 // 将 data URL 转换为 blob
                                                                 const response = await fetch(proxyResult.dataUrl);
                                                                 blob = await response.blob();
                                                                 console.log('[CharacterConstructorModal] 背景通过后端代理下载成功，大小:', proxyResult.size, 'bytes');
                                                             } else {
                                                                 throw new Error(proxyResult.error || '后端代理下载失败');
                                                             }
                                                         }
                                                         
                                                         const file = new File([blob], `character-${characterToEdit.id}-background-${Date.now()}.png`, { type: blob.type || 'image/png' });
                                                         
                                                         const token = localStorage.getItem('auth_token');
                                                         const result = await imageApi.uploadImage(file, 'character/user', token || undefined);
                                                         
                                                         if (result.success && result.url) {
                                                             // 使用服务器URL，但也保留本地缓存
                                                             updateCharacter('backgroundUrl', result.url);
                                                             showAlert('背景生成并上传成功', '成功', 'success');
                                                         } else {
                                                             // 上传失败，使用本地缓存
                                                             updateCharacter('backgroundUrl', cachedUrl);
                                                             showAlert('背景生成成功，但上传失败，已使用本地缓存', '提示', 'warning');
                                                         }
                                                     } catch (uploadError) {
                                                         console.error('上传生成的背景失败:', uploadError);
                                                         // 上传失败，使用本地缓存
                                                         updateCharacter('backgroundUrl', cachedUrl);
                                                         showAlert('背景生成成功，但上传失败，已使用本地缓存', '提示', 'warning');
                                                     }
                                                 } else {
                                                     showAlert('背景生成失败，请重试', '错误', 'error');
                                                 }
                                             } catch (error: any) {
                                                 console.error('生成背景失败:', error);
                                                 setUploadError('生成背景失败: ' + (error.message || '未知错误'));
                                                 showAlert('生成背景失败: ' + (error.message || '未知错误'), '错误', 'error');
                                             } finally {
                                                 setIsUploadingBackground(false);
                                             }
                                         }}
                                         disabled={isUploadingBackground || isLoading}
                                         className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                         title="AI生成背景"
                                     >
                                         {isUploadingBackground ? '生成中...' : '✨ AI生成'}
                                 </button>
                                 <button 
                                     onClick={() => bgInputRef.current?.click()} 
                                     disabled={isUploadingBackground}
                                         className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                 >
                                         {isUploadingBackground ? '上传中...' : '📤 上传'}
                                 </button>
                                 </div>
                             </div>
                             <input 
                                 type="file" 
                                 ref={bgInputRef} 
                                 onChange={e => handleFileUpload('background', e)} 
                                 accept="image/*" 
                                 className="hidden" 
                             />
                             {characterToEdit.backgroundUrl && (
                                 <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-700">
                                     <img src={characterToEdit.backgroundUrl} alt="Background" className="w-full h-full object-cover" />
                                     <button 
                                         onClick={() => updateCharacter('backgroundUrl', '')} 
                                         className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                                     >
                                         ×
                                     </button>
                                 </div>
                             )}
                         </div>
                     </div>
                     
                     {uploadError && <p className="text-xs text-red-400 mt-1">{uploadError}</p>}
                     
                     {/* 第一句问候 */}
                     <div>
                         <label className="text-sm text-gray-400 block mb-2 font-medium">第一句问候</label>
                         <textarea 
                             value={characterToEdit.firstMessage || ''} 
                             onChange={e => updateCharacter('firstMessage', e.target.value)} 
                             className="w-full bg-gray-900 rounded px-3 py-2 border border-gray-700 text-sm focus:border-indigo-500 outline-none resize-none" 
                             rows={3}
                         />
                     </div>
                 </div>
             </div>

             {/* 系统指令 - 独立大区域 */}
             <div className="mt-10">
                 <h4 className="text-base font-bold text-green-400 border-b border-green-900/30 pb-2 mb-4">系统指令 (System Prompt)</h4>
                 <div>
                     <label className="text-sm text-gray-400 block mb-2 font-medium">完整角色扮演指令 (Prompt)</label>
                     <textarea 
                         value={characterToEdit.systemInstruction || ''} 
                         onChange={e => updateCharacter('systemInstruction', e.target.value)} 
                         className="w-full bg-gray-900 rounded px-3 py-2 border border-gray-700 text-sm font-mono focus:border-indigo-500 outline-none resize-none" 
                         rows={8}
                     />
                 </div>
             </div>
          </div>
      );
  };

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
      <div className={`bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh] relative ${
        showPresetCharacters ? 'w-full max-w-5xl' : 'w-full max-w-4xl'
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

        <div className="mb-4">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            {initialCharacter ? '角色编辑器' : '角色构造器'}
            </h3>
            <p className="text-sm text-gray-400">
                {initialCharacter ? '微调TA的灵魂设定。' : `为场景 “${scene.name}” 注入新的灵魂。`}
            </p>
            {/* 编辑模式下也可以参考预置角色 */}
            {initialCharacter && scene.systemEraId && (
                <div className="mt-2">
                    <button
                        onClick={() => {
                            // 编辑模式下，点击参考预置角色时，直接打开资源选择器
                            setShowAvatarResourcePicker(true);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                    >
                        📚 参考预置角色模板
                    </button>
                </div>
            )}
        </div>

        {/* 预置角色选择界面 - 仅新建时显示，编辑模式下不显示此界面 */}
        {!initialCharacter && creationMode === 'preset' && scene.systemEraId && systemCharacters.length > 0 && (
          <div className="flex-1 space-y-4 overflow-y-auto">
            <div className="flex gap-3 border-b border-gray-700 pb-3">
              <button
                onClick={() => setCreationMode('preset')}
                className="text-sm font-bold pb-2 transition-colors text-indigo-400 border-b-2 border-indigo-400"
              >
                📚 {initialCharacter ? '参考预置角色' : '选择预置角色'}
              </button>
              <button
                onClick={() => {
                  setCreationMode('custom');
                  if (initialCharacter) {
                    // 编辑模式下，切换到自定义模式时恢复编辑的角色
                    setGeneratedCharacter(initialCharacter);
                  }
                }}
                className="text-sm font-bold pb-2 transition-colors text-gray-500 hover:text-white"
              >
                ✨ {initialCharacter ? '继续编辑' : '创建自定义角色'}
              </button>
            </div>

            {loadingSystemCharacters ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-400">加载预置角色...</span>
              </div>
            ) : systemCharacters.length > 0 ? (
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  {initialCharacter 
                    ? '选择一个预置角色模板，将应用其所有设定到当前编辑的角色' 
                    : '从预置角色中选择，或创建自定义角色'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                  {systemCharacters.map((char) => (
                    <div
                      key={char.id}
                      onClick={() => handleSelectPresetCharacter(char)}
                      className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all bg-gray-900/50"
                      title={initialCharacter ? '点击应用此预置角色的所有设定到当前编辑的角色' : '点击选择此预置角色'}
                    >
                      {char.avatarUrl ? (
                        <img
                          src={char.avatarUrl}
                          alt={char.name}
                          className="h-32 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="h-32 w-full bg-gradient-to-br from-indigo-900/30 to-pink-900/30 flex items-center justify-center">
                          <span className="text-4xl">👤</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h4 className="font-bold text-sm mb-1 truncate">{char.name}</h4>
                        <p className="text-xs text-gray-300 line-clamp-2">{char.role || char.description || char.bio}</p>
                        {char.age && (
                          <div className="text-xs text-gray-400 mt-1">
                            {char.age}岁
                          </div>
                        )}
                        {/* 显示更多信息提示 */}
                        <div className="text-xs text-indigo-300/80 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {initialCharacter ? '点击应用所有设定' : '点击选择'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <Button
                    onClick={() => setCreationMode('custom')}
                    className="w-full bg-gray-700 hover:bg-gray-600"
                  >
                    创建自定义角色
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">暂无预置角色</p>
                <Button
                  onClick={() => setCreationMode('custom')}
                  className="bg-indigo-600 hover:bg-indigo-500"
                >
                  创建自定义角色
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 加载预置角色时的加载提示 */}
        {!initialCharacter && loadingSystemCharacters && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-400">正在加载预置角色...</span>
          </div>
        )}

        {/* 自定义角色创建界面 - 当没有预置角色或选择了自定义模式时显示 */}
        {(!initialCharacter && !loadingSystemCharacters && creationMode === 'custom') || initialCharacter ? (
          <>
        {/* 新建模式下，如果没有生成角色，显示输入框 */}
        {!initialCharacter && !generatedCharacter && (
            <div className="flex-1 space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-white/80">你的想法</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="输入一个简单的角色概念，例如：&#10;“秦朝的第一个皇帝，秦始皇”&#10;“我的高中同桌，一个很幽默的女孩”"
                        className="w-full bg-white/5 border-2 border-white/10 rounded-lg py-2 px-4 text-white placeholder-white/40 focus:border-pink-400 focus:ring-0 outline-none transition-colors resize-none h-28"
                        disabled={isLoading}
                    />
                </div>
                <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} fullWidth className="bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center">
                    {isLoading ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />正在构思中...</>) : (<>✨ AI 生成设定 (不含图)</>)}
                </Button>
                {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            </div>
        )}

            {/* 编辑模式下或已生成角色时，显示编辑器 */}
            {(initialCharacter || generatedCharacter) && !isLoading && renderEditor()}

            {/* 编辑模式下或已生成角色时，显示保存按钮 */}
            {(initialCharacter || generatedCharacter) && (
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50 mt-4 shrink-0">
                <Button variant="ghost" onClick={onClose} disabled={isLoading || isUploadingAvatar || isUploadingBackground}>取消</Button>
                <Button onClick={handleSave} disabled={isLoading || !generatedCharacter || isUploadingAvatar || isUploadingBackground}>
                  {initialCharacter ? '保存修改' : '添加到场景'}
                </Button>
              </div>
            )}
          </>
        ) : null}
      </div>
      {showAvatarResourcePicker && (
          <ResourcePicker
              category="character"
              onSelect={async (url) => {
                  if (generatedCharacter) {
                      // 如果是从ResourcePicker选择的预置头像，直接使用URL（不缓存）
                      // 但如果是picsum.photos占位符，清空它
                      if (url.includes('picsum.photos')) {
                          updateCharacter('avatarUrl', '');
                          showAlert('请选择有效的头像，不要使用占位符', '提示', 'warning');
                      } else {
                      updateCharacter('avatarUrl', url);
                      }
                  }
                  setShowAvatarResourcePicker(false);
              }}
              onClose={() => setShowAvatarResourcePicker(false)}
              currentUrl={generatedCharacter?.avatarUrl}
              token={localStorage.getItem('auth_token') || undefined}
          />
      )}
      {showBackgroundResourcePicker && (
          <ResourcePicker
              category="character"
              onSelect={(url) => {
                  if (generatedCharacter) {
                      updateCharacter('backgroundUrl', url);
                  }
                  setShowBackgroundResourcePicker(false);
              }}
              onClose={() => setShowBackgroundResourcePicker(false)}
              currentUrl={generatedCharacter?.backgroundUrl}
              token={localStorage.getItem('auth_token') || undefined}
          />
      )}
    </div>
  );
};