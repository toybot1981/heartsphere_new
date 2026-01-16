/**
 * ShareConfig 公共逻辑 Hook
 * 提取共享配置相关的业务逻辑，供 PC 和 Mobile 版本共用
 */

import { useState, useEffect } from 'react';
import { heartConnectApi } from '../../services/api/heartconnect';
import { worldApi } from '../../services/api/world';
import { eraApi } from '../../services/api/scene';
import { getToken } from '../../services/api/base/tokenStorage';
import type {
  ShareConfig,
  CreateShareConfigRequest,
  UpdateShareConfigRequest,
} from '../../services/api/heartconnect/types';
import type { World } from '../../services/api/world/types';
import type { UserEra } from '../../services/api/scene/types';

export type ShareType = 'all' | 'world' | 'era';
export type AccessPermission = 'approval' | 'free' | 'invite';
export type ShareScope = { scopeType: 'world' | 'era'; scopeId: number };

export interface UseShareConfigOptions {
  isOpen: boolean;
  onSuccess?: () => void;
}

export interface UseShareConfigReturn {
  // 状态
  step: number;
  loading: boolean;
  error: string | null;
  existingConfig: ShareConfig | null;
  shareType: ShareType;
  accessPermission: AccessPermission;
  description: string;
  coverImageUrl: string;
  selectedScopes: ShareScope[];
  worlds: World[];
  eras: UserEra[];

  // 设置方法
  setStep: (step: number) => void;
  setShareType: (type: ShareType) => void;
  setAccessPermission: (permission: AccessPermission) => void;
  setDescription: (description: string) => void;
  setCoverImageUrl: (url: string) => void;
  setSelectedScopes: (scopes: ShareScope[]) => void;
  setError: (error: string | null) => void;

  // 操作方法
  loadExistingConfig: () => Promise<void>;
  loadWorldsAndEras: () => Promise<void>;
  handleNext: () => void;
  handleBack: () => void;
  handleSubmit: () => Promise<void>;
  handleScopeToggle: (scopeType: 'world' | 'era', scopeId: number) => void;
  handleRegenerateShareCode: () => Promise<void>;
}

/**
 * ShareConfig 公共逻辑 Hook
 */
export const useShareConfig = (options: UseShareConfigOptions): UseShareConfigReturn => {
  const { isOpen, onSuccess } = options;

  const [step, setStep] = useState(1); // 1: 选择共享范围, 2: 权限和描述设置, 3: 分享预览
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingConfig, setExistingConfig] = useState<ShareConfig | null>(null);
  const [shareType, setShareType] = useState<ShareType>('all');
  const [accessPermission, setAccessPermission] = useState<AccessPermission>('approval');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<ShareScope[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [eras, setEras] = useState<UserEra[]>([]);

  // 加载现有配置
  const loadExistingConfig = async () => {
    try {
      const config = await heartConnectApi.getMyShareConfig();
      setExistingConfig(config);
      setShareType(config.shareType);
      setAccessPermission(config.accessPermission);
      setDescription(config.description || '');
      setCoverImageUrl(config.coverImageUrl || '');
      setSelectedScopes(config.scopes?.map(s => ({ scopeType: s.scopeType, scopeId: s.scopeId })) || []);
    } catch (err: any) {
      const errorMessage = err?.message || '';
      const isNotFound =
        err?.response?.status === 404 ||
        errorMessage.includes('共享配置不存在') ||
        errorMessage.includes('不存在');
      if (!isNotFound) {
        console.error('[useShareConfig] 加载共享配置失败:', err);
        setError('加载共享配置失败，请刷新后重试');
      } else {
        // 共享配置不存在（正常情况），将创建新配置
        setExistingConfig(null);
        setShareType('all');
        setAccessPermission('approval');
        setDescription('');
        setCoverImageUrl('');
        setSelectedScopes([]);
      }
    }
  };

  // 加载世界和场景列表
  const loadWorldsAndEras = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (token) {
        const [worldsData, erasData] = await Promise.all([
          worldApi.getAllWorlds(token),
          eraApi.getAllEras(token),
        ]);
        setWorlds(worldsData);
        setEras(erasData);
      }
    } catch (err) {
      console.error('[useShareConfig] 加载世界和场景失败:', err);
      setError('加载数据失败，请刷新后重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始化：打开时加载配置和数据
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      setLoading(false);
      loadExistingConfig();
      loadWorldsAndEras();
    } else {
      // 关闭时重置状态
      setExistingConfig(null);
      setShareType('all');
      setAccessPermission('approval');
      setDescription('');
      setCoverImageUrl('');
      setSelectedScopes([]);
      setWorlds([]);
      setEras([]);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // 下一步
  const handleNext = () => {
    if (step === 1) {
      // 验证共享范围
      if (shareType !== 'all' && selectedScopes.length === 0) {
        setError('请选择要共享的范围');
        return;
      }
      setError(null);
      setStep(2);
    }
  };

  // 上一步
  const handleBack = () => {
    setError(null);
    setStep(1);
  };

  // 提交配置
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const request: CreateShareConfigRequest | UpdateShareConfigRequest = {
        shareType,
        accessPermission,
        description: description.trim() || undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
        scopes: shareType !== 'all' ? selectedScopes : undefined,
      };

      let savedConfig: ShareConfig;
      if (existingConfig) {
        savedConfig = await heartConnectApi.updateShareConfig(existingConfig.id, request);
      } else {
        savedConfig = await heartConnectApi.createShareConfig(request);
      }

      // 保存成功后，重新加载配置以获取最新数据（包括共享码）
      const updatedConfig = await heartConnectApi.getMyShareConfig();
      setExistingConfig(updatedConfig);

      // 切换到分享预览步骤
      setStep(3);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 切换范围选择
  const handleScopeToggle = (scopeType: 'world' | 'era', scopeId: number) => {
    const index = selectedScopes.findIndex(
      s => s.scopeType === scopeType && s.scopeId === scopeId
    );

    if (index >= 0) {
      setSelectedScopes(selectedScopes.filter((_, i) => i !== index));
    } else {
      setSelectedScopes([...selectedScopes, { scopeType, scopeId }]);
    }
  };

  // 重新生成共享码
  const handleRegenerateShareCode = async () => {
    if (!existingConfig) return;

    setLoading(true);
    try {
      await heartConnectApi.regenerateShareCode(existingConfig.id);
      // 重新加载配置
      const updatedConfig = await heartConnectApi.getMyShareConfig();
      setExistingConfig(updatedConfig);
    } catch (err: any) {
      setError(err.response?.data?.message || '重新生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    loading,
    error,
    existingConfig,
    shareType,
    accessPermission,
    description,
    coverImageUrl,
    selectedScopes,
    worlds,
    eras,
    setStep,
    setShareType,
    setAccessPermission,
    setDescription,
    setCoverImageUrl,
    setSelectedScopes,
    setError,
    loadExistingConfig,
    loadWorldsAndEras,
    handleNext,
    handleBack,
    handleSubmit,
    handleScopeToggle,
    handleRegenerateShareCode,
  };
};
