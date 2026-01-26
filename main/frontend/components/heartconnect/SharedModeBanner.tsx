import React, { useState } from 'react';

interface SharedModeBannerProps {
  heartSphereName: string;
  ownerName?: string;
  onCollapse?: () => void;
  onLeave?: () => void;
}

/**
 * 共享模式标识栏组件
 * 显示在访问他人心域时的顶部标识
 */
export const SharedModeBanner: React.FC<SharedModeBannerProps> = ({
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
        className="fixed bottom-0 left-0 right-0 z-50 border-t-2 shadow-md backdrop-blur-sm"
        style={{
          background: 'linear-gradient(to right, var(--bg-card, #fffbeb), var(--bg-card, #eff6ff))',
          borderColor: 'var(--color-primary, #93c5fd)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-2 gap-3">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setIsCollapsed(false)}
              className="flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm font-medium"
              style={{
                backgroundColor: 'var(--bg-card, rgba(255, 255, 255, 0.8))',
                color: 'var(--text-primary, #374151)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card, #ffffff)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card, rgba(255, 255, 255, 0.8))';
              }}
              title="展开共享模式标识"
            >
              <span className="text-lg">🌟</span>
              <span>共享模式</span>
            </button>
            <div 
              className="text-xs flex items-center gap-1 flex-1"
              style={{ color: 'var(--color-warning, #b45309)' }}
            >
              <span>⚠️</span>
              <span>共享模式下，内容不会保存到主人的心域</span>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="px-3 py-1 text-sm transition-colors whitespace-nowrap"
            style={{ color: 'var(--text-secondary, #4b5563)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary, #1f2937)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary, #4b5563)';
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
      className="fixed bottom-0 left-0 right-0 z-50 border-t-2 shadow-md backdrop-blur-sm"
      style={{
        background: 'linear-gradient(to right, var(--bg-card, rgba(255, 251, 235, 0.95)), var(--bg-card, rgba(239, 246, 255, 0.95)))',
        borderColor: 'var(--color-primary, #93c5fd)',
      }}
    >
      <div className="px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="text-2xl">🌟</div>
            <div className="flex-1">
              <div 
                className="font-semibold mb-1"
                style={{ color: 'var(--text-primary, #1f2937)' }}
              >
                正在查看 <span style={{ color: 'var(--color-primary, #2563eb)' }}>{heartSphereName}</span> 的共享心域
                {ownerName && (
                  <span 
                    className="text-sm ml-2"
                    style={{ color: 'var(--text-secondary, #4b5563)' }}
                  >
                    （主人：{ownerName}）
                  </span>
                )}
              </div>
              <div 
                className="text-sm flex items-center gap-1"
                style={{ color: 'var(--color-warning, #b45309)' }}
              >
                <span>⚠️</span>
                <span>共享模式下，内容不会保存到主人的心域</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleCollapse}
              className="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              style={{
                backgroundColor: 'var(--bg-card, rgba(255, 255, 255, 0.8))',
                color: 'var(--text-primary, #374151)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card, #ffffff)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-card, rgba(255, 255, 255, 0.8))';
              }}
            >
              收起
            </button>
            <button
              onClick={handleLeave}
              className="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              style={{
                backgroundColor: 'var(--color-error, #ef4444)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-error-light, #dc2626)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-error, #ef4444)';
              }}
            >
              离开
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

