/**
 * Settings 公共逻辑 Hook
 * 提取设置相关的业务逻辑，供 PC 和 Mobile 版本共用
 */

import { useState, useEffect } from 'react';
import { AppSettings, UserProfile, DialogueStyle, GameState, AIProvider } from '../../types';
import { storageService } from '../../services/storage';
import { showAlert, showConfirm } from '../../utils/dialog';
import { constructUserAvatarPrompt } from '../../utils/promptConstructors';
import { AIConfigManager } from '../../services/ai/config';
import { AIMode, UserAIConfig } from '../../services/ai/types';

export interface UseSettingsOptions {
  settings: AppSettings;
  gameState: GameState;
  onSettingsChange: (newSettings: AppSettings) => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export interface UseSettingsReturn {
  // AI配置状态
  aiConfig: UserAIConfig;
  localApiKeys: Record<AIProvider, string | undefined>;
  loading: boolean;
  setAiConfig: (config: UserAIConfig) => void;
  setLocalApiKeys: (keys: Record<AIProvider, string | undefined>) => void;
  setLoading: (loading: boolean) => void;

  // 备份相关
  backupMsg: string;
  setBackupMsg: (msg: string) => void;

  // 方法
  handleExportBackup: () => void;
  handleImportClick: (fileInputRef: React.RefObject<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGetAvatarPrompt: () => Promise<void>;
  updateProviderConfig: (provider: AIProvider, key: string, value: string) => void;
  saveAIConfig: () => Promise<void>;
  switchAIMode: (mode: AIMode) => Promise<void>;
}

/**
 * Settings 公共逻辑 Hook
 */
export const useSettings = (options: UseSettingsOptions): UseSettingsReturn => {
  const { settings, gameState, onSettingsChange, onUpdateProfile } = options;

  const [aiConfig, setAiConfig] = useState<UserAIConfig>(AIConfigManager.getUserConfigSync());
  const [localApiKeys, setLocalApiKeys] = useState<Record<AIProvider, string | undefined>>(
    AIConfigManager.getLocalApiKeys()
  );
  const [loading, setLoading] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');

  // 加载AI配置
  useEffect(() => {
    const loadConfig = async () => {
      const config = await AIConfigManager.getUserConfig();
      const keys = AIConfigManager.getLocalApiKeys();
      // 确保如果没有配置，默认使用统一接入模式
      if (!config.mode || (config.mode === 'local' && !localStorage.getItem('ai_service_config'))) {
        const defaultConfig = { ...config, mode: 'unified' as AIMode };
        setAiConfig(defaultConfig);
        await AIConfigManager.saveUserConfig(defaultConfig);
      } else {
        setAiConfig(config);
      }
      setLocalApiKeys(keys);
    };
    loadConfig();
  }, []);

  // 导出备份
  const handleExportBackup = () => {
    const data = storageService.exportBackup(gameState);
    if (!data) {
      showAlert("没有可备份的数据！", "提示", "warning");
      return;
    }

    // Create a Blob and trigger download
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const date = new Date().toISOString().split('T')[0];
    link.download = `HeartSphere_Backup_${date}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setBackupMsg('备份已下载到您的设备。');
    setTimeout(() => setBackupMsg(''), 3000);
  };

  // 导入备份
  const handleImportClick = (fileInputRef: React.RefObject<HTMLInputElement>) => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Confirm before overwriting
    const confirmed = await showConfirm(
      "警告：恢复备份将覆盖当前的日记、角色和进度。确定要继续吗？",
      "恢复备份",
      "warning"
    );
    if (!confirmed) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBackupMsg('正在恢复...');
        const success = await storageService.restoreBackup(content);
        if (success) {
          showAlert("记忆核心恢复成功！系统将重新启动。", "恢复成功", "success");
          window.location.reload();
        } else {
          showAlert("恢复失败：文件格式错误或已损坏。", "恢复失败", "error");
          setBackupMsg('');
        }
      }
    };
    reader.readAsText(file);
  };

  // 头像上传
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!gameState.userProfile || !onUpdateProfile) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ ...gameState.userProfile!, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // 获取头像提示词
  const handleGetAvatarPrompt = async () => {
    if (!gameState.userProfile) return;
    const prompt = constructUserAvatarPrompt(gameState.userProfile.nickname);
    try {
      await navigator.clipboard.writeText(prompt);
      showAlert("头像提示词已复制！", "提示", "success");
    } catch (e) {
      showAlert("复制失败: " + prompt, "错误", "error");
    }
  };

  // 更新提供商配置
  const updateProviderConfig = (provider: AIProvider, key: string, value: string) => {
    const configKey = provider === 'gemini' ? 'geminiConfig' : provider === 'openai' ? 'openaiConfig' : provider === 'doubao' ? 'doubaoConfig' : 'qwenConfig';
    const currentConfig = settings[configKey];
    onSettingsChange({
      ...settings,
      [configKey]: { ...currentConfig, [key]: value }
    });
  };

  // 保存AI配置
  const saveAIConfig = async () => {
    setLoading(true);
    try {
      await AIConfigManager.saveUserConfig(aiConfig);
      AIConfigManager.saveLocalApiKeys(localApiKeys);

      // 同步 localApiKeys 到 settings 的各个 config 中
      const updatedSettings: AppSettings = {
        ...settings,
        geminiConfig: {
          ...settings.geminiConfig,
          apiKey: localApiKeys.gemini || settings.geminiConfig.apiKey
        },
        openaiConfig: {
          ...settings.openaiConfig,
          apiKey: localApiKeys.openai || settings.openaiConfig.apiKey
        },
        qwenConfig: {
          ...settings.qwenConfig,
          apiKey: localApiKeys.qwen || settings.qwenConfig.apiKey
        },
        doubaoConfig: {
          ...settings.doubaoConfig,
          apiKey: localApiKeys.doubao || settings.doubaoConfig.apiKey
        }
      };

      onSettingsChange(updatedSettings);
      showAlert('配置已保存', '成功', 'success');
    } catch (error) {
      showAlert('保存失败: ' + (error instanceof Error ? error.message : String(error)), '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 切换AI模式
  const switchAIMode = async (mode: AIMode) => {
    const newConfig = { ...aiConfig, mode };
    setAiConfig(newConfig);
    setLoading(true);
    try {
      await AIConfigManager.saveUserConfig(newConfig);
      showAlert(
        mode === 'unified' ? '已切换到统一接入模式' : '已切换到本地配置模式，请配置API Key',
        '模式切换',
        'success'
      );
    } catch (error) {
      console.error('[useSettings] 模式切换失败:', error);
      showAlert('切换失败: ' + (error instanceof Error ? error.message : String(error)), '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    aiConfig,
    localApiKeys,
    loading,
    setAiConfig,
    setLocalApiKeys,
    setLoading,
    backupMsg,
    setBackupMsg,
    handleExportBackup,
    handleImportClick,
    handleFileChange,
    handleAvatarUpload,
    handleGetAvatarPrompt,
    updateProviderConfig,
    saveAIConfig,
    switchAIMode,
  };
};
