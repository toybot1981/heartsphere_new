import React, { useState, useEffect } from 'react';
import { heartConnectApi } from '../../services/api/heartconnect';
import { worldApi } from '../../services/api/world';
import { eraApi } from '../../services/api/scene';
import { getToken } from '../../services/api/base/tokenStorage';
import { ShareCodeDisplay } from './ShareCodeDisplay';
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
  const [step, setStep] = useState(1); // 1: 选择共享范围, 2: 权限和描述设置, 3: 分享预览
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
      setExistingConfig(config);
      setShareType(config.shareType);
      setAccessPermission(config.accessPermission);
      setDescription(config.description || "");
      setCoverImageUrl(config.coverImageUrl || "");
      setSelectedScopes(config.scopes?.map(s => ({ scopeType: s.scopeType, scopeId: s.scopeId })) || []);
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
        // 共享配置不存在（正常情况），将创建新配置
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
      setStep(3); // 3 表示分享预览步骤
      
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.7))' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--bg-card, #111827)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))' }}
        >
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            共享我的心域
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div 
              className="mb-4 p-4 border rounded-lg"
              style={{
                backgroundColor: 'var(--color-error, rgba(239, 68, 68, 0.2))',
                borderColor: 'var(--color-error, rgba(239, 68, 68, 0.5))',
                color: 'var(--color-error, #fca5a5)',
              }}
            >
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
          ) : step === 2 ? (
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
          ) : (
            <SharePreviewStep
              shareConfig={existingConfig}
              onClose={onClose}
            />
          )}
        </div>
        
        {/* 底部按钮 */}
        {step !== 3 && (
          <div 
            className="flex items-center justify-between p-6 border-t"
            style={{ borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))' }}
          >
            <div 
              className="text-sm"
              style={{ color: 'var(--text-tertiary)' }}
            >
              步骤 {step}/2
            </div>
            <div className="flex gap-3">
              {step === 2 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-secondary, #374151)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover, #4b5563)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #374151)';
                  }}
                >
                  上一步
                </button>
              )}
              {step === 1 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--color-primary, #3b82f6)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #2563eb)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary, #3b82f6)';
                  }}
                >
                  下一步
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--color-primary, #3b82f6)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #2563eb)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary, #3b82f6)';
                  }}
                >
                  {loading ? '保存中...' : existingConfig ? '更新配置' : '保存并开启共享'}
                </button>
              )}
            </div>
          </div>
        )}
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
      <h3 
        className="text-lg font-semibold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        选择共享范围
      </h3>
      
      {/* 全部共享 */}
      <div
        className="p-4 rounded-lg border-2 cursor-pointer transition-colors"
        style={{
          borderColor: shareType === 'all' ? 'var(--color-info)' : 'var(--border-color-overlay)',
          backgroundColor: shareType === 'all' ? 'var(--bg-info-alpha)' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (shareType !== 'all') {
            e.currentTarget.style.borderColor = 'var(--border-color-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (shareType !== 'all') {
            e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
          }
        }}
        onClick={() => setShareType('all')}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{
                  borderColor: shareType === 'all' ? 'var(--color-info)' : 'var(--border-color-overlay)',
                  backgroundColor: shareType === 'all' ? 'var(--color-info)' : 'transparent',
                }}
              >
                {shareType === 'all' && (
                  <div
                    className="w-full h-full rounded-full scale-50"
                    style={{ backgroundColor: 'var(--text-primary)' }}
                  />
                )}
              </div>
              <span 
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                全部共享 ⭐推荐
              </span>
            </div>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              共享所有世界和场景
            </p>
            <p 
              className="text-xs mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              适合：完全开放的心域
            </p>
          </div>
        </div>
      </div>
      
      {/* 按世界共享 */}
      <div
        className="p-4 rounded-lg border-2 cursor-pointer transition-colors"
        style={{
          borderColor: shareType === 'world' ? 'var(--color-info)' : 'var(--border-color-overlay)',
          backgroundColor: shareType === 'world' ? 'var(--bg-info-alpha)' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (shareType !== 'world') {
            e.currentTarget.style.borderColor = 'var(--border-color-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (shareType !== 'world') {
            e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
          }
        }}
        onClick={() => {
          setShareType('world');
          // 切换到按世界共享时，只保留世界选择，清空场景选择
          setSelectedScopes(selectedScopes.filter(s => s.scopeType === 'world'));
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{
                  borderColor: shareType === 'world' ? 'var(--color-info)' : 'var(--border-color-overlay)',
                  backgroundColor: shareType === 'world' ? 'var(--color-info)' : 'transparent',
                }}
              >
                {shareType === 'world' && (
                  <div
                    className="w-full h-full rounded-full scale-50"
                    style={{ backgroundColor: 'var(--text-primary)' }}
                  />
                )}
              </div>
              <span 
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                按世界共享 ⭐推荐
              </span>
            </div>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              选择要共享的世界
            </p>
          </div>
        </div>
        
        {shareType === 'world' && (
          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="text-center py-4" style={{ color: 'var(--text-tertiary)' }}>加载中...</div>
            ) : worlds.length === 0 ? (
              <div className="text-center py-4" style={{ color: 'var(--text-tertiary)' }}>暂无世界</div>
            ) : (
              worlds.map(world => (
                <label
                  key={world.id}
                  className="flex items-center gap-2 p-2 rounded cursor-pointer"
                  style={{
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover, #1f2937)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.some(s => s.scopeType === 'world' && s.scopeId === world.id)}
                    onChange={() => handleScopeToggle('world', world.id)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: 'var(--color-primary, #3b82f6)' }}
                  />
                  <span style={{ color: 'var(--text-primary)' }}>{world.name}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* 按场景共享 */}
      <div
        className="p-4 rounded-lg border-2 cursor-pointer transition-colors"
        style={{
          borderColor: shareType === 'era' ? 'var(--color-info)' : 'var(--border-color-overlay)',
          backgroundColor: shareType === 'era' ? 'var(--bg-info-alpha)' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (shareType !== 'era') {
            e.currentTarget.style.borderColor = 'var(--border-color-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (shareType !== 'era') {
            e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
          }
        }}
        onClick={() => {
          setShareType('era');
          // 切换到按场景共享时，只保留场景选择，清空世界选择
          setSelectedScopes(selectedScopes.filter(s => s.scopeType === 'era'));
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{
                  borderColor: shareType === 'era' ? 'var(--color-info)' : 'var(--border-color-overlay)',
                  backgroundColor: shareType === 'era' ? 'var(--color-info)' : 'transparent',
                }}
              >
                {shareType === 'era' && (
                  <div
                    className="w-full h-full rounded-full scale-50"
                    style={{ backgroundColor: 'var(--text-primary)' }}
                  />
                )}
              </div>
              <span 
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                按场景共享
              </span>
            </div>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              精确选择要共享的场景
            </p>
          </div>
        </div>
        
        {shareType === 'era' && (
          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="text-center py-4" style={{ color: 'var(--text-tertiary)' }}>加载中...</div>
            ) : eras.length === 0 ? (
              <div className="text-center py-4" style={{ color: 'var(--text-tertiary)' }}>暂无场景</div>
            ) : (
              eras.map(era => (
                <label
                  key={era.id}
                  className="flex items-center gap-2 p-2 rounded cursor-pointer"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.some(s => s.scopeType === 'era' && s.scopeId === era.id)}
                    onChange={() => handleScopeToggle('era', era.id)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: 'var(--color-info)' }}
                  />
                  <span style={{ color: 'var(--text-primary)' }}>{era.name}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>
      
      {shareType !== 'all' && (
        <div 
          className="mt-4 p-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--bg-secondary, #1f2937)',
            color: 'var(--text-tertiary)',
          }}
        >
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
      <h3 
        className="text-lg font-semibold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        权限和描述设置
      </h3>
      
      {/* 连接权限 */}
      <div>
        <label 
          className="block font-medium mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          连接权限
        </label>
        <div className="space-y-3">
          <div
            className="p-4 rounded-lg border-2 cursor-pointer transition-colors"
            style={{
              borderColor: accessPermission === 'approval' ? 'var(--color-info)' : 'var(--border-color-overlay)',
              backgroundColor: accessPermission === 'approval' ? 'var(--bg-info-alpha)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (accessPermission !== 'approval') {
                e.currentTarget.style.borderColor = 'var(--border-color-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (accessPermission !== 'approval') {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
              }
            }}
            onClick={() => setAccessPermission('approval')}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{
                  borderColor: accessPermission === 'approval' ? 'var(--color-info)' : 'var(--border-color-overlay)',
                  backgroundColor: accessPermission === 'approval' ? 'var(--color-info)' : 'transparent',
                }}
              >
                {accessPermission === 'approval' && (
                  <div
                    className="w-full h-full rounded-full scale-50"
                    style={{ backgroundColor: 'var(--text-primary)' }}
                  />
                )}
              </div>
              <span 
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                需要我审批（推荐）
              </span>
            </div>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              其他人需要请求，我同意后才能进入
            </p>
          </div>
          
          <div
            className="p-4 rounded-lg border-2 cursor-pointer transition-colors"
            style={{
              borderColor: accessPermission === 'free' ? 'var(--color-info)' : 'var(--border-color-overlay)',
              backgroundColor: accessPermission === 'free' ? 'var(--bg-info-alpha)' : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (accessPermission !== 'free') {
                e.currentTarget.style.borderColor = 'var(--border-color-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (accessPermission !== 'free') {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
              }
            }}
            onClick={() => setAccessPermission('free')}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{
                  borderColor: accessPermission === 'free' ? 'var(--color-info)' : 'var(--border-color-overlay)',
                  backgroundColor: accessPermission === 'free' ? 'var(--color-info)' : 'transparent',
                }}
              >
                {accessPermission === 'free' && (
                  <div
                    className="w-full h-full rounded-full scale-50"
                    style={{ backgroundColor: 'var(--text-primary)' }}
                  />
                )}
              </div>
              <span 
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                自由连接
              </span>
            </div>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              任何人可以直接进入，无需审批
            </p>
          </div>
        </div>
      </div>
      
      {/* 共享描述 */}
      <div>
        <label 
          className="block font-medium mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          共享描述（可选）
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="介绍一下你的心域..."
          maxLength={200}
          className="w-full h-24 px-4 py-2 border rounded-lg focus:outline-none"
          style={{
            backgroundColor: 'var(--bg-secondary, #1f2937)',
            borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary, #3b82f6)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(55, 65, 81, 1))';
          }}
        />
        <div 
          className="text-right text-sm mt-1"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {description.length}/200 字
        </div>
      </div>
      
      {/* 预览 */}
      <div>
        <label 
          className="block font-medium mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          预览效果
        </label>
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: 'var(--bg-secondary, #1f2937)',
            borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
          }}
        >
          <div 
            className="text-sm mb-2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            共享范围：{shareType === 'all' ? '全部' : `${selectedScopes.filter(s => s.scopeType === shareType).length}个${shareType === 'world' ? '世界' : '场景'}`}
          </div>
          {description && (
            <div 
              className="text-sm mt-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 分享预览步骤
 */
interface SharePreviewStepProps {
  shareConfig: ShareConfig | null;
  onClose: () => void;
}

const SharePreviewStep: React.FC<SharePreviewStepProps> = ({
  shareConfig,
  onClose,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRegenerate = async () => {
    if (!shareConfig) return;
    
    setRefreshing(true);
    try {
      await heartConnectApi.regenerateShareCode(shareConfig.id);
      // 重新加载配置
      const updatedConfig = await heartConnectApi.getMyShareConfig();
      // 通过 window.location.reload() 来刷新页面以显示新的共享码
      window.location.reload();
    } catch (err) {
      console.error('重新生成共享码失败:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (!shareConfig) {
    return (
      <div 
        className="text-center py-8"
        style={{ color: 'var(--text-secondary)' }}
      >
        配置加载中...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          共享配置已{shareConfig.shareCode ? '创建' : '更新'}成功！
        </h3>
        <p style={{ color: 'var(--text-tertiary)' }}>
          现在你可以分享你的心域了
        </p>
      </div>

      {/* 使用 ShareCodeDisplay 组件显示分享信息 */}
      <ShareCodeDisplay 
        shareConfig={shareConfig} 
        onRegenerate={handleRegenerate}
      />

      {/* 完成按钮 */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onClose}
          className="px-8 py-3 rounded-lg transition-colors font-semibold"
          style={{
            backgroundColor: 'var(--color-primary, #3b82f6)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #2563eb)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary, #3b82f6)';
          }}
        >
          完成
        </button>
      </div>
    </div>
  );
};
