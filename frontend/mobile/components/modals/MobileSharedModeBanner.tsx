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
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500/90 to-blue-500/90 border-b-2 border-blue-300 shadow-md backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-2 px-3 py-1 bg-white/80 rounded-lg hover:bg-white transition-colors text-sm font-medium text-gray-700"
            title="展开共享模式标识"
          >
            <span className="text-lg">🌟</span>
            <span>共享模式</span>
          </button>
          <button
            onClick={handleLeave}
            className="px-3 py-1 text-sm text-white hover:text-gray-100 transition-colors"
          >
            离开
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500/95 to-blue-500/95 border-b-2 border-blue-300 shadow-md backdrop-blur-sm">
      <div className="px-4 py-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-2xl">🌟</div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm mb-1">
                正在查看 <span className="text-blue-100 font-bold">{heartSphereName}</span> 的共享心域
                {ownerName && (
                  <span className="text-white/80 text-xs ml-1">（主人：{ownerName}）</span>
                )}
              </div>
              <div className="text-amber-100 text-xs flex items-center gap-1">
                <span>⚠️</span>
                <span>共享模式下，内容不会保存到主人的心域</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCollapse}
            className="ml-2 px-2 py-1 bg-white/80 rounded-lg hover:bg-white transition-colors text-xs text-gray-700"
          >
            收起
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            onClick={handleLeave}
            className="px-4 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            离开
          </button>
        </div>
      </div>
    </div>
  );
};
