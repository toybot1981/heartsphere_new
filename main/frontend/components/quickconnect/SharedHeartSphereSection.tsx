import React, { useState, useEffect } from 'react';
import { SharedHeartSphereCard } from '../heartconnect/SharedHeartSphereCard';
import { heartConnectApi } from '../../services/api/heartconnect';
import type { SharedHeartSphere } from '../../services/api/heartconnect/types';

interface SharedHeartSphereSectionProps {
  onSelectHeartSphere?: (shareCode: string, sharedHeartSphere: SharedHeartSphere) => void;
  selectedShareCode?: string | null;
  onEnterSharedMode?: () => void; // 进入共享模式后的回调（用于关闭模态框等）
}

/**
 * 共享心域展示区域
 * 在快速连接界面中醒目的展示共享的心域
 * 支持选中状态，点击卡片可以查看对应的角色
 */
export const SharedHeartSphereSection: React.FC<SharedHeartSphereSectionProps> = ({
  onSelectHeartSphere,
  selectedShareCode,
  onEnterSharedMode,
}) => {
  const [sharedHeartSpheres, setSharedHeartSpheres] = useState<SharedHeartSphere[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSelectedDefault, setHasSelectedDefault] = useState(false); // 标记是否已经选中过默认项
  
  useEffect(() => {
    loadSharedHeartSpheres();
  }, []);
  
  // 默认选中第一个共享心域（只在首次加载时执行一次）
  useEffect(() => {
    if (sharedHeartSpheres.length > 0 && !selectedShareCode && !hasSelectedDefault && onSelectHeartSphere) {
      const firstShared = sharedHeartSpheres[0];
      setHasSelectedDefault(true);
      onSelectHeartSphere(firstShared.shareCode, firstShared);
    }
  }, [sharedHeartSpheres.length, selectedShareCode, hasSelectedDefault, onSelectHeartSphere]);
  
  const loadSharedHeartSpheres = async () => {
    setLoading(true);
    setError(null);
    // 重置选中状态，以便刷新后重新选中第一个
    setHasSelectedDefault(false);
    try {
      const data = await heartConnectApi.getPublicSharedHeartSpheres();
      if (data && data.length > 0) {
        // 如果数据多于5个，随机选择5个
        let selectedData = data;
        if (data.length > 5) {
          // 随机打乱数组并取前5个
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          selectedData = shuffled.slice(0, 5);
        }
        setSharedHeartSpheres(selectedData);
      } else {
        setSharedHeartSpheres([]);
      }
    } catch (err: any) {
      console.error('[SharedHeartSphereSection] 加载共享心域失败:', err);
      if (err.message?.includes('未授权') || err.message?.includes('401') || err.response?.status === 401) {
        setError('请先登录后再查看共享心域');
      } else if (err.response?.status === 500) {
        setError('服务器错误，请稍后重试');
      } else {
        setError(err.message || '加载失败');
      }
      setSharedHeartSpheres([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCardClick = (sharedHeartSphere: SharedHeartSphere) => {
    if (onSelectHeartSphere) {
      onSelectHeartSphere(sharedHeartSphere.shareCode, sharedHeartSphere);
    }
  };
  
  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-center py-12">
          <div 
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--color-primary, #a855f7)' }}
          />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mb-6">
        <div 
          className="border rounded-lg p-4 text-center"
          style={{
            backgroundColor: 'var(--color-error, rgba(239, 68, 68, 0.2))',
            borderColor: 'var(--color-error, rgba(239, 68, 68, 0.5))',
            color: 'var(--color-error, #fca5a5)',
          }}
        >
          {error}
        </div>
      </div>
    );
  }
  
  if (sharedHeartSpheres.length === 0) {
    return (
      <div className="mb-6">
        <div 
          className="text-center py-8"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <div className="text-4xl mb-2">🌟</div>
          <p className="text-sm">暂无其他用户共享的心域</p>
          <p className="text-xs mt-1">当有用户分享心域时，会在这里显示</p>
          <button
            onClick={loadSharedHeartSpheres}
            className="mt-4 px-4 py-2 rounded-lg transition-colors text-sm"
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
            刷新
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-4">
      {/* 标题区域 - 增强视觉效果 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="text-4xl relative inline-block animate-pulse"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.6)) drop-shadow(0 0 20px rgba(250, 204, 21, 0.4))',
            }}
          >
            ⭐
          </div>
          <div>
            <h3 
              className="text-2xl font-bold mb-1"
              style={{
                color: 'var(--text-primary)',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(147, 51, 234, 0.4)',
              }}
            >
              发现共享心域
            </h3>
            <p 
              className="text-sm"
              style={{
                color: 'var(--text-secondary)',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              }}
            >
              体验其他用户分享的心域世界
            </p>
          </div>
        </div>
        <button
          onClick={loadSharedHeartSpheres}
          className="px-4 py-2 rounded-lg transition-all text-sm whitespace-nowrap font-medium shadow-lg"
          style={{
            background: 'linear-gradient(to right, var(--color-primary, #9333ea), var(--color-primary, #ec4899))',
            color: 'var(--text-primary)',
            boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4), 0 0 10px rgba(236, 72, 153, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, var(--color-primary-light, #7e22ce), var(--color-primary-light, #db2777))';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.5), 0 0 15px rgba(236, 72, 153, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, var(--color-primary, #9333ea), var(--color-primary, #ec4899))';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(147, 51, 234, 0.4), 0 0 10px rgba(236, 72, 153, 0.3)';
          }}
        >
          刷新
        </button>
      </div>
      
      {/* 共享心域卡片 - 横向滚动，增强展示 */}
      <div className="overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
        <div className="flex gap-4 min-w-max">
          {sharedHeartSpheres.map((shared, index) => (
            <div
              key={shared.shareConfigId}
              onClick={() => handleCardClick(shared)}
              className={`cursor-pointer transition-all relative flex-shrink-0 ${
                selectedShareCode === shared.shareCode
                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900 z-10'
                  : 'hover:ring-2 hover:ring-purple-500/50 hover:ring-offset-1 hover:ring-offset-gray-900'
              }`}
              style={{ 
                width: '260px',
                transform: selectedShareCode === shared.shareCode ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'transform 0.3s ease, ring 0.3s ease',
              }}
            >
              <SharedHeartSphereCard
                sharedHeartSphere={shared}
                onConnect={loadSharedHeartSpheres}
                isSelected={selectedShareCode === shared.shareCode}
                onViewCharacters={() => handleCardClick(shared)}
                onEnterSharedMode={onEnterSharedMode}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
