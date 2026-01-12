/**
 * EraConstructor 公共逻辑 Hook
 * 提取时代/场景构建相关的业务逻辑，供 PC 和 Mobile 版本共用
 */

import { useState, useEffect, useRef } from 'react';
import { WorldScene } from '../../types';
import { aiService } from '../../services/ai';
import { constructEraCoverPrompt } from '../../utils/promptConstructors';
import { imageApi, eraApi } from '../../services/api';
import { showAlert, showConfirm } from '../../utils/dialog';

export interface UseEraConstructorOptions {
  initialScene?: WorldScene | null;
  worldStyle?: string;
  onSave: (scene: WorldScene) => void;
  onDelete?: () => void;
}

export interface UseEraConstructorReturn {
  // 表单状态
  name: string;
  description: string;
  imageUrl: string | null;
  imageMode: 'generate' | 'upload';
  creationMode: 'preset' | 'custom';
  selectedPresetEraId: number | undefined;
  uploadedFile: File | null;

  // UI状态
  isLoading: boolean;
  isUploading: boolean;
  isGeneratingImage: boolean;
  loadingSystemEras: boolean;
  error: string;
  showResourcePicker: boolean;

  // 数据
  systemEras: Array<{
    id: number;
    name: string;
    description: string;
    startYear: number | null;
    endYear: number | null;
    imageUrl: string | null;
    isActive: boolean;
    sortOrder: number;
  }>;

  // 设置方法
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setImageUrl: (url: string | null) => void;
  setImageMode: (mode: 'generate' | 'upload') => void;
  setCreationMode: (mode: 'preset' | 'custom') => void;
  setSelectedPresetEraId: (id: number | undefined) => void;
  setUploadedFile: (file: File | null) => void;
  setError: (error: string) => void;
  setShowResourcePicker: (show: boolean) => void;

  // 操作方法
  handleGetPrompt: () => Promise<string | null>;
  handleGenerateImage: () => Promise<void>;
  handleUploadImage: (file: File) => Promise<void>;
  handleSelectPresetEra: (eraId: number) => Promise<void>;
  handleSave: () => Promise<void>;
  handleDelete: () => Promise<void>;
  loadSystemEras: () => Promise<void>;
}

/**
 * EraConstructor 公共逻辑 Hook
 */
export const useEraConstructor = (options: UseEraConstructorOptions): UseEraConstructorReturn => {
  const { initialScene, worldStyle, onSave, onDelete } = options;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<'generate' | 'upload'>('generate');
  const [creationMode, setCreationMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetEraId, setSelectedPresetEraId] = useState<number | undefined>(undefined);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [loadingSystemEras, setLoadingSystemEras] = useState(false);
  const [error, setError] = useState('');
  const [showResourcePicker, setShowResourcePicker] = useState(false);

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

  const previousInitialSceneIdRef = useRef<string | undefined>(undefined);

  // 加载系统预置场景
  const loadSystemEras = async () => {
    if (initialScene || creationMode !== 'preset') return;

    setLoadingSystemEras(true);
    try {
      const eras = await eraApi.getSystemEras();
      setSystemEras(eras.filter(era => era.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      console.error('[useEraConstructor] 加载预置场景失败:', err);
      setSystemEras([]);
    } finally {
      setLoadingSystemEras(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    const currentId = initialScene?.id;
    if (currentId !== previousInitialSceneIdRef.current) {
      previousInitialSceneIdRef.current = currentId;
      if (initialScene) {
        setName(initialScene.name);
        setDescription(initialScene.description);
        setImageUrl(initialScene.imageUrl);
        setSelectedPresetEraId(initialScene.systemEraId);
        setCreationMode('custom');
        if (initialScene.imageUrl && initialScene.imageUrl.startsWith('data:')) {
          setImageMode('upload');
        }
      } else {
        setName('');
        setDescription('');
        setImageUrl(null);
        setSelectedPresetEraId(undefined);
        setCreationMode('preset');
      }
    }
  }, [initialScene?.id]);

  // 加载预置场景
  useEffect(() => {
    if (!initialScene && creationMode === 'preset') {
      loadSystemEras();
    }
  }, [initialScene, creationMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // 获取提示词
  const handleGetPrompt = async (): Promise<string | null> => {
    if (!name || !description) {
      setError('请先填写场景名称和简介。');
      return null;
    }

    try {
      const prompt = constructEraCoverPrompt(name, description, worldStyle);
      await navigator.clipboard.writeText(prompt);
      showAlert('提示词已复制到剪贴板！', '提示', 'success');
      return prompt;
    } catch (e) {
      setError('复制失败，请重试');
      return null;
    }
  };

  // 生成图片
  const handleGenerateImage = async () => {
    if (!name || !description) {
      setError('请先填写场景名称和简介。');
      return;
    }

    setIsGeneratingImage(true);
    setError('');

    try {
      const prompt = constructEraCoverPrompt(name, description, worldStyle);
      const generatedUrl = await aiService.generateImage(prompt);
      setImageUrl(generatedUrl);
    } catch (err: any) {
      setError(err.message || '生成图片失败，请重试');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 上传图片
  const handleUploadImage = async (file: File) => {
    setIsUploading(true);
    setError('');

    try {
      const result = await imageApi.uploadImage(file);
      setImageUrl(result.url);
      setUploadedFile(file);
    } catch (err: any) {
      setError(err.message || '上传图片失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  // 选择预置场景
  const handleSelectPresetEra = async (eraId: number) => {
    const selectedEra = systemEras.find(e => e.id === eraId);
    if (!selectedEra) return;

    setName(selectedEra.name);
    setDescription(selectedEra.description);
    setImageUrl(selectedEra.imageUrl);
    setSelectedPresetEraId(eraId);
    setCreationMode('custom');
  };

  // 保存
  const handleSave = async () => {
    if (!name.trim()) {
      setError('请输入场景名称');
      return;
    }

    if (!description.trim()) {
      setError('请输入场景简介');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const scene: WorldScene = {
        ...(initialScene || {}),
        id: initialScene?.id || `scene_${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageUrl || undefined,
        systemEraId: selectedPresetEraId,
      } as WorldScene;

      onSave(scene);
    } catch (err: any) {
      setError(err.message || '保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除
  const handleDelete = async () => {
    if (!onDelete) return;

    const confirmed = await showConfirm(
      '确定要删除这个场景吗？此操作无法撤销。',
      '删除场景',
      'warning'
    );

    if (confirmed) {
      onDelete();
    }
  };

  return {
    name,
    description,
    imageUrl,
    imageMode,
    creationMode,
    selectedPresetEraId,
    uploadedFile,
    isLoading,
    isUploading,
    isGeneratingImage,
    loadingSystemEras,
    error,
    showResourcePicker,
    systemEras,
    setName,
    setDescription,
    setImageUrl,
    setImageMode,
    setCreationMode,
    setSelectedPresetEraId,
    setUploadedFile,
    setError,
    setShowResourcePicker,
    handleGetPrompt,
    handleGenerateImage,
    handleUploadImage,
    handleSelectPresetEra,
    handleSave,
    handleDelete,
    loadSystemEras,
  };
};
