import React, { useState } from 'react';
import { ConnectionRequestModal } from './ConnectionRequestModal';
import { ShareCodeInputModal } from './ShareCodeInputModal';
import { heartConnectApi } from '../../services/api/heartconnect';
import type { SharedHeartSphere } from '../../services/api/heartconnect/types';

interface SharedHeartSphereCardProps {
  sharedHeartSphere: SharedHeartSphere;
  onConnect?: () => void;
}

/**
 * 共享心域卡片组件
 * 醒目的展示样式，用于快速连接界面
 */
export const SharedHeartSphereCard: React.FC<SharedHeartSphereCardProps> = ({
  sharedHeartSphere,
  onConnect,
}) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showCodeInputModal, setShowCodeInputModal] = useState(false);
  
  const handleConnect = () => {
    if (sharedHeartSphere.accessPermission === 'free') {
      // 自由连接，直接进入体验模式
      window.location.href = `/share/${sharedHeartSphere.shareCode}`;
    } else if (sharedHeartSphere.accessPermission === 'approval') {
      // 需要审批，显示连接请求模态框
      setShowRequestModal(true);
    }
  };
  
  const handleRequestSuccess = () => {
    setShowRequestModal(false);
    onConnect?.();
  };
  
  const handleCodeInput = (shareCode: string) => {
    // 通过共享码连接
    window.location.href = `/share/${shareCode}`;
  };
  
  // 根据请求状态显示不同的按钮
  const getActionButton = () => {
    if (sharedHeartSphere.requestStatus === 'pending') {
      return (
        <button
          disabled
          className="px-6 py-3 bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-500/30 cursor-not-allowed"
        >
          等待审批
        </button>
      );
    }
    
    if (sharedHeartSphere.requestStatus === 'approved') {
      return (
        <button
          onClick={() => window.location.href = `/share/${sharedHeartSphere.shareCode}`}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
        >
          进入体验
        </button>
      );
    }
    
    if (sharedHeartSphere.accessPermission === 'free') {
      return (
        <button
          onClick={handleConnect}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg transform hover:scale-105"
        >
          立即体验
        </button>
      );
    }
    
    return (
      <button
        onClick={handleConnect}
        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all font-semibold shadow-lg transform hover:scale-105"
      >
        申请连接
      </button>
    );
  };
  
  return (
    <>
      <div className="relative bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-blue-900/80 rounded-2xl p-6 border-2 border-purple-500/50 shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105">
        {/* 醒目标识 */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-yellow-400/20 px-3 py-1 rounded-full border border-yellow-400/50">
          <span className="text-2xl">🌟</span>
          <span className="text-yellow-300 font-bold text-sm">共享心域</span>
        </div>
        
        {/* 封面图片 */}
        {sharedHeartSphere.coverImageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img
              src={sharedHeartSphere.coverImageUrl}
              alt={sharedHeartSphere.heartSphereName}
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        
        {/* 主人信息 */}
        <div className="flex items-center gap-3 mb-4">
          {sharedHeartSphere.ownerAvatar ? (
            <img
              src={sharedHeartSphere.ownerAvatar}
              alt={sharedHeartSphere.ownerName}
              className="w-12 h-12 rounded-full border-2 border-white/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
              {sharedHeartSphere.ownerName?.[0] || 'U'}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-white">{sharedHeartSphere.heartSphereName}</h3>
            <p className="text-gray-300 text-sm">主人：{sharedHeartSphere.ownerName}</p>
          </div>
        </div>
        
        {/* 描述 */}
        {sharedHeartSphere.description && (
          <p className="text-gray-200 mb-4 line-clamp-2">{sharedHeartSphere.description}</p>
        )}
        
        {/* 统计信息 */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1 text-gray-300">
            <span>👁️</span>
            <span>{sharedHeartSphere.viewCount || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-300">
            <span>💬</span>
            <span>{sharedHeartSphere.requestCount || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-300">
            <span>✅</span>
            <span>{sharedHeartSphere.approvedCount || 0}</span>
          </div>
        </div>
        
        {/* 共享范围 */}
        <div className="mb-4 flex flex-wrap gap-2">
          {sharedHeartSphere.shareType === 'all' && (
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs border border-blue-500/30">
              全部共享
            </span>
          )}
          {sharedHeartSphere.worldCount && sharedHeartSphere.worldCount > 0 && (
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30">
              {sharedHeartSphere.worldCount} 个世界
            </span>
          )}
          {sharedHeartSphere.eraCount && sharedHeartSphere.eraCount > 0 && (
            <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs border border-pink-500/30">
              {sharedHeartSphere.eraCount} 个场景
            </span>
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex gap-2">
          {getActionButton()}
          <button
            onClick={() => setShowCodeInputModal(true)}
            className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            title="输入共享码"
          >
            🔑
          </button>
        </div>
      </div>
      
      {/* 连接请求模态框 */}
      <ConnectionRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        shareCode={sharedHeartSphere.shareCode}
        onSuccess={handleRequestSuccess}
      />
      
      {/* 共享码输入模态框 */}
      <ShareCodeInputModal
        isOpen={showCodeInputModal}
        onClose={() => setShowCodeInputModal(false)}
        onSubmit={handleCodeInput}
      />
    </>
  );
};

