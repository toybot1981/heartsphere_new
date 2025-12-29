import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { heartConnectApi } from '../../services/api/heartconnect';
import { ConnectionRequestModal } from './ConnectionRequestModal';
import { ExperienceModeProvider, useExperienceModeContext } from './ExperienceModeProvider';
import type { ShareConfig } from '../../services/api/heartconnect/types';
import { getToken } from '../../services/api/base/tokenStorage';

/**
 * 分享页面组件
 * 访问路径: /share/:shareCode
 */
const SharePageContent: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { enterExperienceMode } = useExperienceModeContext();
  
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
            enterExperienceMode(config, userId);
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
        enterExperienceMode(shareConfig, userId);
        // 显示提示：等待审批
        alert('连接请求已发送，等待主人审批后即可进入体验');
        navigate('/');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">加载中...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-white text-xl font-bold mb-2">访问失败</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* 头部 */}
          <div className="bg-gray-900 rounded-lg p-8 mb-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">
                {shareConfig.description || '心域分享'}
              </h1>
              <p className="text-gray-400 mb-6">
                共享码: <span className="font-mono text-blue-400">{shareConfig.shareCode}</span>
              </p>
              
              {shareConfig.coverImageUrl && (
                <img
                  src={shareConfig.coverImageUrl}
                  alt="心域封面"
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div>
                  <span className="text-white font-semibold">{shareConfig.viewCount || 0}</span> 次查看
                </div>
                <div>
                  <span className="text-white font-semibold">{shareConfig.requestCount || 0}</span> 次请求
                </div>
                <div>
                  <span className="text-white font-semibold">{shareConfig.approvedCount || 0}</span> 已批准
                </div>
              </div>
            </div>
          </div>
          
          {/* 权限说明 */}
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h3 className="text-white font-semibold mb-3">访问权限</h3>
            {shareConfig.accessPermission === 'free' ? (
              <p className="text-gray-400">自由连接 - 可以直接进入体验</p>
            ) : (
              <p className="text-gray-400">需要审批 - 主人同意后才能进入</p>
            )}
          </div>
          
          {/* 操作按钮 */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              返回首页
            </button>
            {shareConfig.accessPermission === 'approval' && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
 * 分享页面（带Provider）
 */
export const SharePage: React.FC = () => {
  return (
    <ExperienceModeProvider>
      <SharePageContent />
    </ExperienceModeProvider>
  );
};

