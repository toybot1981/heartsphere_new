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
    console.log('[SharedHeartSphereSection] 组件已挂载，开始加载共享心域...');
    loadSharedHeartSpheres();
  }, []);
  
  // 默认选中第一个共享心域（只在首次加载时执行一次）
  useEffect(() => {
    if (sharedHeartSpheres.length > 0 && !selectedShareCode && !hasSelectedDefault && onSelectHeartSphere) {
      const firstShared = sharedHeartSpheres[0];
      console.log('[SharedHeartSphereSection] 默认选中第一个共享心域:', firstShared.shareCode, firstShared);
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
      console.log('[SharedHeartSphereSection] 开始加载共享心域列表...');
      const data = await heartConnectApi.getPublicSharedHeartSpheres();
      console.log('[SharedHeartSphereSection] 加载成功，数据数量:', data?.length || 0);
      if (data && data.length > 0) {
        // 如果数据多于5个，随机选择5个
        let selectedData = data;
        if (data.length > 5) {
          // 随机打乱数组并取前5个
          const shuffled = [...data].sort(() => Math.random() - 0.5);
          selectedData = shuffled.slice(0, 5);
          console.log('[SharedHeartSphereSection] 随机选择了5个共享心域:', selectedData.map(s => s.shareCode));
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
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mb-6">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-center">
          {error}
        </div>
      </div>
    );
  }
  
  if (sharedHeartSpheres.length === 0) {
    return (
      <div className="mb-6">
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">🌟</div>
          <p className="text-sm">暂无其他用户共享的心域</p>
          <p className="text-xs mt-1">当有用户分享心域时，会在这里显示</p>
          <button
            onClick={loadSharedHeartSpheres}
            className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            刷新
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-2">
      {/* 标题区域 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🌟</div>
          <div>
            <h3 className="text-2xl font-bold text-white">发现共享心域</h3>
            <p className="text-gray-400 text-sm">体验其他用户分享的心域世界</p>
          </div>
        </div>
        <button
          onClick={loadSharedHeartSpheres}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm whitespace-nowrap"
        >
          刷新
        </button>
      </div>
      
      {/* 共享心域卡片 - 横向滚动 */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex gap-3 min-w-max">
          {sharedHeartSpheres.map((shared) => (
            <div
              key={shared.shareConfigId}
              onClick={() => handleCardClick(shared)}
              className={`cursor-pointer transition-all relative flex-shrink-0 ${
                selectedShareCode === shared.shareCode
                  ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-gray-900 z-10'
                  : ''
              }`}
              style={{ width: '240px' }} // 缩小卡片宽度
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
