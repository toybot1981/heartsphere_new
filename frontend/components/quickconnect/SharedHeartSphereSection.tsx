import React, { useState, useEffect } from 'react';
import { SharedHeartSphereCard } from '../heartconnect/SharedHeartSphereCard';
import { heartConnectApi } from '../../services/api/heartconnect';
import type { SharedHeartSphere } from '../../services/api/heartconnect/types';

/**
 * 共享心域展示区域
 * 在快速连接界面中醒目的展示共享的心域
 */
export const SharedHeartSphereSection: React.FC = () => {
  const [sharedHeartSpheres, setSharedHeartSpheres] = useState<SharedHeartSphere[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadSharedHeartSpheres();
  }, []);
  
  const loadSharedHeartSpheres = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[SharedHeartSphereSection] 开始加载共享心域列表...');
      const data = await heartConnectApi.getPublicSharedHeartSpheres();
      console.log('[SharedHeartSphereSection] 加载成功，数据:', data, '数量:', data?.length || 0);
      setSharedHeartSpheres(data || []);
    } catch (err: any) {
      console.error('[SharedHeartSphereSection] 加载共享心域失败:', err);
      setError(err.message || '加载失败');
      // 即使加载失败，也设置为空数组，避免显示错误（可能是没有共享的心域）
      setSharedHeartSpheres([]);
    } finally {
      setLoading(false);
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
    // 即使没有数据，也显示一个提示，让用户知道这里会显示共享心域
    return (
      <div className="mb-6">
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">🌟</div>
          <p className="text-sm">暂无其他用户共享的心域</p>
          <p className="text-xs mt-1">当有用户分享心域时，会在这里显示</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      {/* 标题区域 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🌟</div>
          <div>
            <h3 className="text-2xl font-bold text-white">发现共享心域</h3>
            <p className="text-gray-400 text-sm">体验其他用户分享的心域世界</p>
          </div>
        </div>
        <button
          onClick={loadSharedHeartSpheres}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          刷新
        </button>
      </div>
      
      {/* 共享心域卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sharedHeartSpheres.map((shared) => (
          <SharedHeartSphereCard
            key={shared.shareConfigId}
            sharedHeartSphere={shared}
            onConnect={loadSharedHeartSpheres}
          />
        ))}
      </div>
    </div>
  );
};

