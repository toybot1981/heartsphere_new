/**
 * CharacterConstructor 公共逻辑 Hook
 * 提取角色构建相关的业务逻辑，供 PC 和 Mobile 版本共用
 */

import { useState, useEffect, useRef } from 'react';
import { Character, WorldScene } from '../../types';
import { aiService } from '../../services/ai';
import { imageApi, characterApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';

export interface UseCharacterConstructorOptions {
  scene: WorldScene;
  initialCharacter?: Character | null;
  worldStyle?: string;
  onSave: (character: Character) => void;
}

export interface UseCharacterConstructorReturn {
  // 表单状态（简化版，只包含核心字段）
  name: string;
  description: string;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  prompt: string;

  // UI状态
  isLoading: boolean;
  isUploadingAvatar: boolean;
  isUploadingBackground: boolean;
  error: string;
  generatedCharacter: Character | null;

  // 预置角色
  systemCharacters: Array<any>;
  creationMode: 'preset' | 'custom';
  loadingSystemCharacters: boolean;

  // 设置方法
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setAvatarUrl: (url: string | null) => void;
  setBackgroundUrl: (url: string | null) => void;
  setPrompt: (prompt: string) => void;
  setError: (error: string) => void;
  setCreationMode: (mode: 'preset' | 'custom') => void;

  // 操作方法
  handleGenerateCharacter: () => Promise<void>;
  handleUploadAvatar: (file: File) => Promise<void>;
  handleUploadBackground: (file: File) => Promise<void>;
  handleSelectPresetCharacter: (char: any) => void;
  handleSave: () => Promise<void>;
  loadSystemCharacters: () => Promise<void>;
}

/**
 * CharacterConstructor 公共逻辑 Hook（简化版）
 */
export const useCharacterConstructor = (options: UseCharacterConstructorOptions): UseCharacterConstructorReturn => {
  const { scene, initialCharacter, worldStyle, onSave } = options;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);
  const [error, setError] = useState('');
  const [generatedCharacter, setGeneratedCharacter] = useState<Character | null>(null);

  const [systemCharacters, setSystemCharacters] = useState<Array<any>>([]);
  const [creationMode, setCreationMode] = useState<'preset' | 'custom'>('preset');
  const [loadingSystemCharacters, setLoadingSystemCharacters] = useState(false);

  // 初始化数据
  useEffect(() => {
    if (initialCharacter) {
      setName(initialCharacter.name || '');
      setDescription(initialCharacter.description || '');
      setAvatarUrl(initialCharacter.avatarUrl || null);
      setBackgroundUrl(initialCharacter.backgroundUrl || null);
      setCreationMode('custom');
    } else {
      setName('');
      setDescription('');
      setAvatarUrl(null);
      setBackgroundUrl(null);
      if (!scene.systemEraId) {
        setCreationMode('custom');
      }
    }
  }, [initialCharacter, scene.systemEraId]);

  // 加载系统预置角色
  const loadSystemCharacters = async () => {
    if (initialCharacter || !scene.systemEraId) {
      setSystemCharacters([]);
      setLoadingSystemCharacters(false);
      return;
    }

    setLoadingSystemCharacters(true);
    try {
      const chars = await characterApi.getSystemCharacters(scene.systemEraId);
      const activeChars = chars.filter(char => char.isActive).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setSystemCharacters(activeChars);
      if (activeChars.length === 0) {
        setCreationMode('custom');
      }
    } catch (err) {
      console.error('[useCharacterConstructor] 加载预置角色失败:', err);
      setSystemCharacters([]);
      setCreationMode('custom');
    } finally {
      setLoadingSystemCharacters(false);
    }
  };

  useEffect(() => {
    if (!initialCharacter && scene.systemEraId) {
      loadSystemCharacters();
    }
  }, [scene.systemEraId, initialCharacter]); // eslint-disable-line react-hooks/exhaustive-deps

  // 生成角色
  const handleGenerateCharacter = async () => {
    if (!prompt.trim()) {
      setError('请输入角色描述');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 使用PC版本的API方法
      const newCharacter = await aiService.generateCharacterFromPrompt(prompt, scene.name);
      if (newCharacter) {
        setGeneratedCharacter(newCharacter);
        setName(newCharacter.name || '');
        setDescription(newCharacter.bio || newCharacter.description || '');
        setAvatarUrl(newCharacter.avatarUrl || null);
        setBackgroundUrl(newCharacter.backgroundUrl || null);
      }
    } catch (err: any) {
      setError(err.message || '生成角色失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 上传头像
  const handleUploadAvatar = async (file: File) => {
    setIsUploadingAvatar(true);
    setError('');

    try {
      const result = await imageApi.uploadImage(file);
      setAvatarUrl(result.url);
    } catch (err: any) {
      setError(err.message || '上传头像失败，请重试');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // 上传背景
  const handleUploadBackground = async (file: File) => {
    setIsUploadingBackground(true);
    setError('');

    try {
      const result = await imageApi.uploadImage(file);
      setBackgroundUrl(result.url);
    } catch (err: any) {
      setError(err.message || '上传背景失败，请重试');
    } finally {
      setIsUploadingBackground(false);
    }
  };

  // 选择预置角色
  const handleSelectPresetCharacter = (char: any) => {
    setName(char.name || '');
    setDescription(char.description || '');
    setAvatarUrl(char.avatarUrl || null);
    setBackgroundUrl(char.backgroundUrl || null);
    setCreationMode('custom');
  };

  // 保存
  const handleSave = async () => {
    if (!name.trim()) {
      setError('请输入角色名称');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const character: Character = {
        ...(initialCharacter || generatedCharacter || {}),
        id: initialCharacter?.id || generatedCharacter?.id || `character_${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        avatarUrl: avatarUrl || undefined,
        backgroundUrl: backgroundUrl || undefined,
        sceneId: scene.id,
      } as Character;

      onSave(character);
    } catch (err: any) {
      setError(err.message || '保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    name,
    description,
    avatarUrl,
    backgroundUrl,
    prompt,
    isLoading,
    isUploadingAvatar,
    isUploadingBackground,
    error,
    generatedCharacter,
    systemCharacters,
    creationMode,
    loadingSystemCharacters,
    setName,
    setDescription,
    setAvatarUrl,
    setBackgroundUrl,
    setPrompt,
    setError,
    setCreationMode,
    handleGenerateCharacter,
    handleUploadAvatar,
    handleUploadBackground,
    handleSelectPresetCharacter,
    handleSave,
    loadSystemCharacters,
  };
};
