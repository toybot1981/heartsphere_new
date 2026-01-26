import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { heartConnectApi } from '../../services/api/heartconnect';
import { ConnectionRequestModal } from './ConnectionRequestModal';
import { useSharedMode } from '../../hooks/useSharedMode';
import type { ShareConfig } from '../../services/api/heartconnect/types';
import { getToken } from '../../services/api/base/tokenStorage';

/**
 * 分享页面组件
 * 访问路径: /share/:shareCode
 */
const SharePageContent: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { enterSharedMode } = useSharedMode();
  
  const [shareConfig, setShareConfig] = useState<ShareConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  useEffect(() => {
    if (shareCode) {
      loadShareConfig();
    }
  }, [shareCode]);
  
  const loadShareConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await heartConnectApi.getShareConfigByCode(shareCode!);
      setShareConfig(config);
      
      // 如果是自由连接，直接进入体验模式
      if (config.accessPermission === 'free') {
        const token = getToken();
        if (token) {
          // 获取当前用户ID（需要从token解析或API获取）
          // 这里简化处理，实际应该从API获取
          const userId = getCurrentUserId(); // 需要实现这个函数
          if (userId) {
            enterSharedMode(config, userId);
            // 重定向到主应用
            navigate('/');
          }
        } else {
          // 未登录，显示登录提示
          setError('请先登录后再访问');
        }
      } else {
        // 需要审批，显示请求模态框
        setShowRequestModal(true);
      }
    } catch (err: any) {
      console.error('加载共享配置失败:', err);
      setError(err.response?.data?.message || '加载失败，请检查共享码是否正确');
    } finally {
      setLoading(false);
    }
  };
  
  const getCurrentUserId = (): number | null => {
    // TODO: 从token或API获取当前用户ID
    // 这里需要实现用户ID获取逻辑
    const token = getToken();
    if (!token) return null;
    
    // 临时方案：从localStorage获取（如果存储了用户信息）
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        return user.id || null;
      } catch {
        return null;
      }
    }
    
    return null;
  };
  
  const handleRequestSuccess = () => {
    if (shareConfig) {
      const userId = getCurrentUserId();
      if (userId) {
        enterSharedMode(shareConfig, userId);
        // 显示提示：等待审批
        alert('连接请求已发送，等待主人审批后即可进入体验');
        navigate('/');
      }
    }
  };
  
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(to bottom right, var(--bg-primary, #312e81), var(--bg-primary, #581c87), var(--bg-primary, #831843))',
        }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: 'var(--text-primary)' }}
          ></div>
          <p 
            className="text-lg"
            style={{ color: 'var(--text-primary)' }}
          >
            加载中...
          </p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(to bottom right, var(--bg-primary, #312e81), var(--bg-primary, #581c87), var(--bg-primary, #831843))',
        }}
      >
        <div 
          className="rounded-lg p-8 max-w-md w-full mx-4"
          style={{ backgroundColor: 'var(--bg-card, #111827)' }}
        >
          <div className="text-center">
            <div 
              className="text-4xl mb-4"
              style={{ color: 'var(--color-error, #ef4444)' }}
            >
              ⚠️
            </div>
            <h2 
              className="text-xl font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              访问失败
            </h2>
            <p 
              className="mb-6"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {error}
            </p>
            <button
              onClick={() => navigate('/')}
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
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!shareConfig) {
    return null;
  }
  
  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(to bottom right, var(--bg-primary, #312e81), var(--bg-primary, #581c87), var(--bg-primary, #831843))',
      }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* 头部 */}
          <div 
            className="rounded-lg p-8 mb-6"
            style={{ backgroundColor: 'var(--bg-card, #111827)' }}
          >
            <div className="text-center">
              <h1 
                className="text-3xl font-bold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                {shareConfig.description || '心域分享'}
              </h1>
              <p 
                className="mb-6"
                style={{ color: 'var(--text-tertiary)' }}
              >
                共享码: <span 
                  className="font-mono"
                  style={{ color: 'var(--color-primary, #60a5fa)' }}
                >
                  {shareConfig.shareCode}
                </span>
              </p>
              
              {shareConfig.coverImageUrl && (
                <img
                  src={shareConfig.coverImageUrl}
                  alt="心域封面"
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <div className="flex items-center justify-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                <div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{shareConfig.viewCount || 0}</span> 次查看
                </div>
                <div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{shareConfig.requestCount || 0}</span> 次请求
                </div>
                <div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{shareConfig.approvedCount || 0}</span> 已批准
                </div>
              </div>
            </div>
          </div>

          {/* 权限说明 */}
          <div
            className="rounded-lg p-6 mb-6"
            style={{
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>访问权限</h3>
            {shareConfig.accessPermission === 'free' ? (
              <p style={{ color: 'var(--text-tertiary)' }}>自由连接 - 可以直接进入体验</p>
            ) : (
              <p style={{ color: 'var(--text-tertiary)' }}>需要审批 - 主人同意后才能进入</p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
            >
              返回首页
            </button>
            {shareConfig.accessPermission === 'approval' && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex-1 px-6 py-3 rounded-lg transition-colors"
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
                请求连接
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* 连接请求模态框 */}
      {shareConfig.accessPermission === 'approval' && (
        <ConnectionRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          shareCode={shareCode!}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};

/**
 * 分享页面
 */
export const SharePage: React.FC = () => {
  return <SharePageContent />;
};

