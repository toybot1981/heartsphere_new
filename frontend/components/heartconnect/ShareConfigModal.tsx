import React, { useState, useEffect } from 'react';
import { heartConnectApi } from '../../services/api/heartconnect';
import { worldApi } from '../../services/api/world';
import { eraApi } from '../../services/api/scene';
import { getToken } from '../../services/api/base/tokenStorage';
import type { ShareConfig, CreateShareConfigRequest, UpdateShareConfigRequest } from '../../services/api/heartconnect/types';
import type { World } from '../../services/api/world/types';
import type { UserEra } from '../../services/api/scene/types';

interface ShareConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * 共享配置模态框组件
 */
export const ShareConfigModal: React.FC<ShareConfigModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState(1); // 1: 选择共享范围, 2: 权限和描述设置
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingConfig, setExistingConfig] = useState<ShareConfig | null>(null);
  
  // 表单数据
  const [shareType, setShareType] = useState<'all' | 'world' | 'era'>('all');
  const [accessPermission, setAccessPermission] = useState<'approval' | 'free' | 'invite'>('approval');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<Array<{ scopeType: 'world' | 'era'; scopeId: number }>>([]);
  
  // 加载现有配置
  useEffect(() => {
    if (isOpen) {
      // 重置表单状态
      setStep(1);
      setError(null);
      setLoading(false);
      // 加载现有配置
      loadExistingConfig();
    } else {
      // 关闭时重置状态
      setExistingConfig(null);
      setShareType('all');
      setAccessPermission('approval');
      setDescription('');
      setCoverImageUrl('');
      setSelectedScopes([]);
    }
  }, [isOpen]);
  
  const loadExistingConfig = async () => {
    try {
      const config = await heartConnectApi.getMyShareConfig();
      console.log('加载现有共享配置:', config);
      setExistingConfig(config);
      setShareType(config.shareType);
      setAccessPermission(config.accessPermission);
      setDescription(config.description || "");
      setCoverImageUrl(config.coverImageUrl || "");
      setSelectedScopes(config.scopes?.map(s => ({ scopeType: s.scopeType, scopeId: s.scopeId })) || []);
      console.log('共享配置已加载，准备编辑');
    } catch (err: any) {
      // 如果没有配置（404错误），这是正常情况，静默处理
      const errorMessage = err?.message || "";
      const isNotFound = err?.response?.status === 404 || 
                        errorMessage.includes("共享配置不存在") ||
                        errorMessage.includes("不存在");
      if (!isNotFound) {
        console.error("加载共享配置失败:", err);
        setError("加载共享配置失败，请刷新后重试");
      } else {
        console.debug("共享配置不存在（正常情况），将创建新配置");
        // 重置为默认值
        setExistingConfig(null);
        setShareType('all');
        setAccessPermission('approval');
        setDescription('');
        setCoverImageUrl('');
        setSelectedScopes([]);
      }
    }
  };
  
  const handleNext = () => {
    if (step === 1) {
      // 验证共享范围
      if (shareType !== 'all' && selectedScopes.length === 0) {
        setError('请选择要共享的范围');
        return;
      }
      setStep(2);
    }
  };
  
  const handleBack = () => {
    setStep(1);
  };
  
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
      
      if (existingConfig) {
        await heartConnectApi.updateShareConfig(existingConfig.id, request);
      } else {
        await heartConnectApi.createShareConfig(request);
      }
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">共享我的心域</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              {error}
            </div>
          )}
          
          {step === 1 ? (
            <ShareScopeStep
              shareType={shareType}
              setShareType={setShareType}
              selectedScopes={selectedScopes}
              setSelectedScopes={setSelectedScopes}
            />
          ) : (
            <PermissionStep
              accessPermission={accessPermission}
              setAccessPermission={setAccessPermission}
              description={description}
              setDescription={setDescription}
              coverImageUrl={coverImageUrl}
              setCoverImageUrl={setCoverImageUrl}
              shareType={shareType}
              selectedScopes={selectedScopes}
            />
          )}
        </div>
        
        {/* 底部按钮 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            步骤 {step}/2
          </div>
          <div className="flex gap-3">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              >
                上一步
              </button>
            )}
            {step === 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                下一步
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '保存中...' : existingConfig ? '更新配置' : '保存并开启共享'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 共享范围选择步骤
 */
interface ShareScopeStepProps {
  shareType: 'all' | 'world' | 'era';
  setShareType: (type: 'all' | 'world' | 'era') => void;
  selectedScopes: Array<{ scopeType: 'world' | 'era'; scopeId: number }>;
  setSelectedScopes: (scopes: Array<{ scopeType: 'world' | 'era'; scopeId: number }>) => void;
}

const ShareScopeStep: React.FC<ShareScopeStepProps> = ({
  shareType,
  setShareType,
  selectedScopes,
  setSelectedScopes,
}) => {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [eras, setEras] = useState<UserEra[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadWorldsAndEras();
  }, []);
  
  const loadWorldsAndEras = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (token) {
        const worldsData = await worldApi.getAllWorlds(token);
        setWorlds(worldsData);
        
        // 加载所有场景
        const erasData = await eraApi.getAllEras(token);
        setEras(erasData);
      }
    } catch (err) {
      console.error('加载世界和场景失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
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
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">选择共享范围</h3>
      
      {/* 全部共享 */}
      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
          shareType === 'all'
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-700 hover:border-gray-600'
        }`}
        onClick={() => setShareType('all')}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 ${
                shareType === 'all' ? 'border-blue-500 bg-blue-500' : 'border-gray-600'
              }`}>
                {shareType === 'all' && (
                  <div className="w-full h-full rounded-full bg-white scale-50" />
                )}
              </div>
              <span className="text-white font-medium">全部共享 ⭐推荐</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">共享所有世界和场景</p>
            <p className="text-gray-500 text-xs mt-1">适合：完全开放的心域</p>
          </div>
        </div>
      </div>
      
      {/* 按世界共享 */}
      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
          shareType === 'world'
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-700 hover:border-gray-600'
        }`}
        onClick={() => {
          setShareType('world');
          // 切换到按世界共享时，只保留世界选择，清空场景选择
          setSelectedScopes(selectedScopes.filter(s => s.scopeType === 'world'));
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 ${
                shareType === 'world' ? 'border-blue-500 bg-blue-500' : 'border-gray-600'
              }`}>
                {shareType === 'world' && (
                  <div className="w-full h-full rounded-full bg-white scale-50" />
                )}
              </div>
              <span className="text-white font-medium">按世界共享 ⭐推荐</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">选择要共享的世界</p>
          </div>
        </div>
        
        {shareType === 'world' && (
          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="text-center py-4 text-gray-400">加载中...</div>
            ) : worlds.length === 0 ? (
              <div className="text-center py-4 text-gray-400">暂无世界</div>
            ) : (
              worlds.map(world => (
                <label
                  key={world.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.some(s => s.scopeType === 'world' && s.scopeId === world.id)}
                    onChange={() => handleScopeToggle('world', world.id)}
                    className="w-4 h-4 text-blue-500 rounded"
                  />
                  <span className="text-white">{world.name}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* 按场景共享 */}
      <div
        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
          shareType === 'era'
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-700 hover:border-gray-600'
        }`}
        onClick={() => {
          setShareType('era');
          // 切换到按场景共享时，只保留场景选择，清空世界选择
          setSelectedScopes(selectedScopes.filter(s => s.scopeType === 'era'));
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 ${
                shareType === 'era' ? 'border-blue-500 bg-blue-500' : 'border-gray-600'
              }`}>
                {shareType === 'era' && (
                  <div className="w-full h-full rounded-full bg-white scale-50" />
                )}
              </div>
              <span className="text-white font-medium">按场景共享</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">精确选择要共享的场景</p>
          </div>
        </div>
        
        {shareType === 'era' && (
          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="text-center py-4 text-gray-400">加载中...</div>
            ) : eras.length === 0 ? (
              <div className="text-center py-4 text-gray-400">暂无场景</div>
            ) : (
              eras.map(era => (
                <label
                  key={era.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.some(s => s.scopeType === 'era' && s.scopeId === era.id)}
                    onChange={() => handleScopeToggle('era', era.id)}
                    className="w-4 h-4 text-blue-500 rounded"
                  />
                  <span className="text-white">{era.name}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
      
      {shareType !== 'all' && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg text-sm text-gray-400">
          已选择 {selectedScopes.filter(s => s.scopeType === shareType).length} 个{shareType === 'world' ? '世界' : '场景'}
        </div>
      )}
    </div>
  );
};

/**
 * 权限和描述设置步骤
 */
interface PermissionStepProps {
  accessPermission: 'approval' | 'free' | 'invite';
  setAccessPermission: (permission: 'approval' | 'free' | 'invite') => void;
  description: string;
  setDescription: (description: string) => void;
  coverImageUrl: string;
  setCoverImageUrl: (url: string) => void;
  shareType: 'all' | 'world' | 'era';
  selectedScopes: Array<{ scopeType: 'world' | 'era'; scopeId: number }>;
}

const PermissionStep: React.FC<PermissionStepProps> = ({
  accessPermission,
  setAccessPermission,
  description,
  setDescription,
  coverImageUrl,
  setCoverImageUrl,
  shareType,
  selectedScopes,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">权限和描述设置</h3>
      
      {/* 连接权限 */}
      <div>
        <label className="block text-white font-medium mb-3">连接权限</label>
        <div className="space-y-3">
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              accessPermission === 'approval'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => setAccessPermission('approval')}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 ${
                accessPermission === 'approval' ? 'border-blue-500 bg-blue-500' : 'border-gray-600'
              }`}>
                {accessPermission === 'approval' && (
                  <div className="w-full h-full rounded-full bg-white scale-50" />
                )}
              </div>
              <span className="text-white font-medium">需要我审批（推荐）</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">其他人需要请求，我同意后才能进入</p>
          </div>
          
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              accessPermission === 'free'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onClick={() => setAccessPermission('free')}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 ${
                accessPermission === 'free' ? 'border-blue-500 bg-blue-500' : 'border-gray-600'
              }`}>
                {accessPermission === 'free' && (
                  <div className="w-full h-full rounded-full bg-white scale-50" />
                )}
              </div>
              <span className="text-white font-medium">自由连接</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">任何人可以直接进入，无需审批</p>
          </div>
        </div>
      </div>
      
      {/* 共享描述 */}
      <div>
        <label className="block text-white font-medium mb-2">共享描述（可选）</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="介绍一下你的心域..."
          maxLength={200}
          className="w-full h-24 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <div className="text-right text-sm text-gray-400 mt-1">
          {description.length}/200 字
        </div>
      </div>
      
      {/* 预览 */}
      <div>
        <label className="block text-white font-medium mb-2">预览效果</label>
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">
            共享范围：{shareType === 'all' ? '全部' : `${selectedScopes.filter(s => s.scopeType === shareType).length}个${shareType === 'world' ? '世界' : '场景'}`}
          </div>
          {description && (
            <div className="text-white text-sm mt-2">{description}</div>
          )}
        </div>
      </div>
    </div>
  );
};

