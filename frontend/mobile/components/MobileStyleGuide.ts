/**
 * Mobile组件样式规范
 * 统一所有Mobile组件的样式标准
 */

/**
 * 颜色方案
 */
export const MobileColors = {
  // 主色调
  primary: {
    pink: 'from-pink-400 to-purple-400',
    purple: 'from-purple-500 to-pink-500',
    indigo: 'from-indigo-600 to-purple-600',
  },
  
  // 背景色
  background: {
    dark: 'bg-black',
    slate: 'bg-slate-950',
    card: 'bg-slate-800/50',
    modal: 'bg-slate-900',
  },
  
  // 文字颜色
  text: {
    primary: 'text-white',
    secondary: 'text-slate-300',
    muted: 'text-slate-400',
    accent: 'text-purple-400',
  },
  
  // 边框颜色
  border: {
    default: 'border-slate-700/50',
    accent: 'border-purple-500/50',
  },
};

/**
 * 间距规范
 */
export const MobileSpacing = {
  // 内边距
  padding: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  },
  
  // 外边距
  margin: {
    xs: 'm-2',
    sm: 'm-3',
    md: 'm-4',
    lg: 'm-6',
  },
  
  // 间距
  gap: {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  },
};

/**
 * 圆角规范
 */
export const MobileRadius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
};

/**
 * 阴影规范
 */
export const MobileShadow = {
  sm: 'shadow-md',
  md: 'shadow-lg',
  lg: 'shadow-xl',
  glow: 'shadow-purple-500/20',
};

/**
 * 按钮样式
 */
export const MobileButtonStyles = {
  primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
  outline: 'border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white',
  ghost: 'text-slate-400 hover:text-white',
};

/**
 * 输入框样式
 */
export const MobileInputStyles = 'w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20';

/**
 * 卡片样式
 */
export const MobileCardStyles = 'bg-slate-800/50 border border-slate-700/50 rounded-xl p-4';

/**
 * 模态框样式
 */
export const MobileModalStyles = {
  overlay: 'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm',
  container: 'bg-slate-900 rounded-2xl shadow-2xl overflow-hidden',
  header: 'p-4 border-b border-slate-700',
  body: 'p-4',
  footer: 'p-4 border-t border-slate-700',
};

/**
 * 触摸区域最小尺寸（44x44px，iOS推荐）
 */
export const MobileTouchTarget = {
  minSize: 'min-w-[44px] min-h-[44px]',
  padding: 'p-3',
};

/**
 * 加载状态样式
 */
export const MobileLoadingStyles = {
  spinner: 'w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin',
  skeleton: 'bg-slate-700/50 animate-pulse rounded',
};

/**
 * 空状态样式
 */
export const MobileEmptyStateStyles = {
  container: 'flex flex-col items-center justify-center py-12 px-4',
  icon: 'text-6xl mb-4 opacity-50',
  text: 'text-slate-400 text-center',
};

/**
 * 错误提示样式
 */
export const MobileErrorStyles = {
  container: 'bg-red-500/20 border border-red-500/50 rounded-lg p-3',
  text: 'text-red-300 text-sm',
};

/**
 * 成功提示样式
 */
export const MobileSuccessStyles = {
  container: 'bg-green-500/20 border border-green-500/50 rounded-lg p-3',
  text: 'text-green-300 text-sm',
};

/**
 * 响应式断点
 */
export const MobileBreakpoints = {
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
};

/**
 * 安全区域适配（iOS）
 */
export const MobileSafeArea = {
  top: 'pt-[env(safe-area-inset-top)]',
  bottom: 'pb-[env(safe-area-inset-bottom)]',
  left: 'pl-[env(safe-area-inset-left)]',
  right: 'pr-[env(safe-area-inset-right)]',
};
