import React, { useState } from 'react';

interface MobileSharedModeBannerProps {
  heartSphereName: string;
  ownerName?: string;
  onCollapse?: () => void;
  onLeave?: () => void;
}

/**
 * Mobile版本共享模式标识栏组件
 * 显示在访问他人心域时的顶部标识，适配移动端
 */
export const MobileSharedModeBanner: React.FC<MobileSharedModeBannerProps> = ({
  heartSphereName,
  ownerName,
  onCollapse,
  onLeave,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  const handleCollapse = () => {
    setIsCollapsed(true);
    onCollapse?.();
  };
  
  const handleLeave = () => {
    if (confirm('确定要离开共享心域吗？你可以选择留下暖心留言。')) {
      onLeave?.();
    }
  };
  
  if (isCollapsed) {
    return (
      <div 
        className="fixed top-0 left-0 right-0 z-50 border-b-2 shadow-md backdrop-blur-sm"
        style={{
          background: 'linear-gradient(to right, var(--bg-warning-alpha, rgba(245, 158, 11, 0.9)), var(--bg-info-alpha, rgba(59, 130, 246, 0.9)))',
          borderColor: 'var(--border-info-alpha, rgba(147, 197, 253, 1))',
        }}
      >
        <div className="flex items-center justify-between px-4 py-2 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => setIsCollapsed(false)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors text-xs font-medium shrink-0"
              style={{
                backgroundColor: 'var(--bg-primary-light, rgba(255, 255, 255, 0.8))',
                color: 'var(--text-primary-dark, #374151)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-primary-light, rgba(255, 255, 255, 1))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-primary-light, rgba(255, 255, 255, 0.8))';
              }}
              title="展开共享模式标识"
            >
              <span className="text-base">🌟</span>
              <span>共享模式</span>
            </button>
            <div 
              className="text-xs flex items-center gap-1 flex-1 min-w-0"
              style={{ color: 'var(--text-warning-light, #fef3c7)' }}
            >
              <span>⚠️</span>
              <span className="truncate">共享模式下，内容不会保存到主人的心域</span>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="px-2.5 py-1 text-xs transition-colors whitespace-nowrap shrink-0"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary, #f3f4f6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            离开
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 border-b-2 shadow-md backdrop-blur-sm"
      style={{
        background: 'linear-gradient(to right, var(--bg-warning-alpha, rgba(245, 158, 11, 0.95)), var(--bg-info-alpha, rgba(59, 130, 246, 0.95)))',
        borderColor: 'var(--border-info-alpha, rgba(147, 197, 253, 1))',
      }}
    >
      <div className="px-4 py-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-2xl">🌟</div>
            <div className="flex-1">
              <div 
                className="font-semibold text-sm mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                正在查看 <span 
                  className="font-bold"
                  style={{ color: 'var(--text-info-light, #dbeafe)' }}
                >
                  {heartSphereName}
                </span> 的共享心域
                {ownerName && (
                  <span 
                    className="text-xs ml-1"
                    style={{ color: 'var(--text-primary, rgba(255, 255, 255, 0.8))' }}
                  >
                    （主人：{ownerName}）
                  </span>
                )}
              </div>
              <div 
                className="text-xs flex items-center gap-1"
                style={{ color: 'var(--text-warning-light, #fef3c7)' }}
              >
                <span>⚠️</span>
                <span>共享模式下，内容不会保存到主人的心域</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCollapse}
            className="ml-2 px-2 py-1 rounded-lg transition-colors text-xs"
            style={{
              backgroundColor: 'var(--bg-primary-light, rgba(255, 255, 255, 0.8))',
              color: 'var(--text-primary-dark, #374151)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-primary-light, rgba(255, 255, 255, 1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-primary-light, rgba(255, 255, 255, 0.8))';
            }}
          >
            收起
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            onClick={handleLeave}
            className="px-4 py-1.5 rounded-lg transition-colors text-sm font-medium"
            style={{
              backgroundColor: 'var(--bg-error-button, #ef4444)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-error-button-hover, #dc2626)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-error-button, #ef4444)';
            }}
          >
            离开
          </button>
        </div>
      </div>
    </div>
  );
};
