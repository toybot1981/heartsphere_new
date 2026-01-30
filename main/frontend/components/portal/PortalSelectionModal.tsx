/**
 * 传送门选择弹窗组件
 * 用于在共享心域页面选择目标心域和传送效果
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { heartConnectApi } from '../../services/api/heartconnect';
import { portalApi } from '../../services/api/portal';
import type { SharedHeartSphere } from '../../services/api/heartconnect/types';
import type { PortalType } from '../../services/api/portal/types';
import { logger } from '../../utils/logger';

interface PortalSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeleport: (targetShareCode: string, effect: PortalType) => void;
}

const PORTAL_TYPES: { value: PortalType; label: string; description: string }[] = [
  { value: 'stargate', label: '星门', description: '科幻风格的星门传送' },
  { value: 'wormhole', label: '虫洞', description: '扭曲空间的虫洞传送' },
  { value: 'quantum', label: '量子', description: '量子纠缠传送' },
  { value: 'garden', label: '花园', description: '典雅的花园传送' },
  { value: 'sakura', label: '樱花', description: '轻柔的樱花传送' },
  { value: 'butterfly', label: '蝴蝶', description: '优雅的蝴蝶传送' },
  { value: 'rainbow', label: '彩虹', description: '梦幻的彩虹传送' },
];

export const PortalSelectionModal: React.FC<PortalSelectionModalProps> = ({
  isOpen,
  onClose,
  onTeleport,
}) => {
  const [sharedHeartSpheres, setSharedHeartSpheres] = useState<SharedHeartSphere[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedShareCode, setSelectedShareCode] = useState<string>('');
  const [selectedEffect, setSelectedEffect] = useState<PortalType>('stargate');
  const [searchQuery, setSearchQuery] = useState('');

  // 加载共享心域列表
  useEffect(() => {
    if (isOpen) {
      loadSharedSpheres();
    }
  }, [isOpen]);

  const loadSharedSpheres = async () => {
    setLoading(true);
    try {
      const data = await heartConnectApi.getPublicSharedHeartSpheres();
      setSharedHeartSpheres(data || []);
    } catch (err) {
      logger.error('[PortalSelectionModal] 加载共享心域列表失败:', err);
      setSharedHeartSpheres([]);
    } finally {
      setLoading(false);
    }
  };

  // 过滤共享心域
  const filteredSpheres = sharedHeartSpheres.filter((sphere) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sphere.shareCode?.toLowerCase().includes(query) ||
      sphere.name?.toLowerCase().includes(query) ||
      sphere.description?.toLowerCase().includes(query)
    );
  });

  const handleConfirm = () => {
    if (!selectedShareCode) {
      return;
    }
    onTeleport(selectedShareCode, selectedEffect);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.5))' }}
    >
      <div 
        className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border"
        style={{
          backgroundColor: 'var(--bg-card, #111827)',
          borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
        }}
      >
        {/* 头部 */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))' }}
        >
          <h2 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            选择传送目的地
          </h2>
          <button
            onClick={onClose}
            className="p-2 transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 搜索框 */}
          <div>
            <input
              type="text"
              placeholder="搜索共享心域..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary, #1f2937)',
                borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-info, #06b6d4)';
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-info, rgba(6, 182, 212, 0.2))';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(55, 65, 81, 1))';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* 共享心域列表 */}
          <div>
            <h3 
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--text-tertiary)' }}
            >
              可访问的共享心域
            </h3>
            {loading ? (
              <div 
                className="text-center py-8"
                style={{ color: 'var(--text-tertiary)' }}
              >
                加载中...
              </div>
            ) : filteredSpheres.length === 0 ? (
              <div 
                className="text-center py-8"
                style={{ color: 'var(--text-disabled)' }}
              >
                {searchQuery ? '未找到匹配的共享心域' : '暂无可访问的共享心域'}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredSpheres.map((sphere) => (
                  <button
                    key={sphere.shareCode}
                    onClick={() => setSelectedShareCode(sphere.shareCode || '')}
                    className="w-full p-4 text-left rounded-lg border-2 transition-all"
                    style={{
                      borderColor: selectedShareCode === sphere.shareCode
                        ? 'var(--color-info, #06b6d4)'
                        : 'var(--bg-overlay, rgba(55, 65, 81, 1))',
                      backgroundColor: selectedShareCode === sphere.shareCode
                        ? 'var(--color-info, rgba(6, 182, 212, 0.1))'
                        : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedShareCode !== sphere.shareCode) {
                        e.currentTarget.style.borderColor = 'var(--bg-hover, #475569)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedShareCode !== sphere.shareCode) {
                        e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(55, 65, 81, 1))';
                      }
                    }}
                  >
                    <div 
                      className="font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {sphere.ownerName ? `${sphere.ownerName}的心域` : (sphere.name || '未命名心域')}
                    </div>
                    <div 
                      className="text-xs mt-1"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      共享码: {sphere.shareCode}
                    </div>
                    {sphere.description && (
                      <div 
                        className="text-sm mt-2"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {sphere.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 传送效果选择 */}
          <div>
            <h3 
              className="text-sm font-semibold mb-3"
              style={{ color: 'var(--text-tertiary)' }}
            >
              选择传送效果
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PORTAL_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedEffect(type.value)}
                  className="p-3 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: selectedEffect === type.value
                      ? 'var(--color-info, #06b6d4)'
                      : 'var(--bg-overlay, rgba(55, 65, 81, 1))',
                    backgroundColor: selectedEffect === type.value
                      ? 'var(--color-info, rgba(6, 182, 212, 0.1))'
                      : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedEffect !== type.value) {
                      e.currentTarget.style.borderColor = 'var(--bg-hover, #475569)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedEffect !== type.value) {
                      e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(55, 65, 81, 1))';
                    }
                  }}
                >
                  <div 
                    className="font-semibold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {type.label}
                  </div>
                  <div 
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div 
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{ borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))' }}
        >
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedShareCode}
            className="transition-opacity"
            style={{
              background: 'var(--gradient-button)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            传送
          </Button>
        </div>
      </div>
    </div>
  );
};
