/**
 * Mobile组件样式规范
 * 统一所有Mobile组件的样式标准
 * 设计理念：扁平化、简洁、科技感、温馨
 * 
 * 更新日期: 2025-01-08
 * 版本: 2.0 - 符合新的UX设计规范
 */

/**
 * 颜色方案 - 符合科技感、扁平化、温馨风格
 */
export const MobileColors = {
  // 主色调（科技感渐变）
  primary: {
    gradient: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    gradientHover: 'hover:from-indigo-500 hover:to-purple-500',
    gradientText: 'bg-gradient-to-r from-indigo-400 to-purple-400',
    indigo: 'indigo-600',
    purple: 'purple-600',
    pink: 'pink-400',
  },
  
  // 背景色（扁平化，减少阴影）
  background: {
    dark: 'bg-black',
    slate: 'bg-slate-950',
    card: 'bg-slate-800/80 backdrop-blur-md',
    modal: 'bg-slate-900/95 backdrop-blur-xl',
    overlay: 'bg-black/60 backdrop-blur-sm',
  },
  
  // 文字颜色（清晰对比度）
  text: {
    primary: 'text-white',
    secondary: 'text-slate-300',
    muted: 'text-slate-400',
    accent: 'text-purple-400',
    indigo: 'text-indigo-400',
    pink: 'text-pink-400',
  },
  
  // 边框颜色（subtle边框）
  border: {
    default: 'border-white/10',
    accent: 'border-purple-500/50',
    indigo: 'border-indigo-500/50',
    slate: 'border-slate-700/50',
  },
  
  // 语义色（扁平化）
  semantic: {
    success: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      text: 'text-green-400',
    },
    warning: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
    },
    error: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
    },
    info: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
    },
  },
};

/**
 * 间距规范 - 8px基准系统
 */
export const MobileSpacing = {
  // 内边距（8px基准）
  padding: {
    xs: 'p-2',    // 8px
    sm: 'p-3',    // 12px
    md: 'p-4',    // 16px
    lg: 'p-6',    // 24px
    xl: 'p-8',    // 32px
  },
  
  // 外边距（8px基准）
  margin: {
    xs: 'm-2',    // 8px
    sm: 'm-3',    // 12px
    md: 'm-4',    // 16px
    lg: 'm-6',    // 24px
    xl: 'm-8',    // 32px
  },
  
  // 间距（8px基准）
  gap: {
    xs: 'gap-2',  // 8px
    sm: 'gap-3',  // 12px
    md: 'gap-4',  // 16px
    lg: 'gap-6',  // 24px
    xl: 'gap-8',  // 32px
  },
  
  // TabBar底部内边距
  tabBar: {
    bottom: 'pb-[calc(4rem+env(safe-area-inset-bottom))]',
    top: 'pt-[calc(1rem+env(safe-area-inset-top))]',
  },
};

/**
 * 圆角规范 - 扁平化风格（适度的圆角）
 */
export const MobileRadius = {
  sm: 'rounded-lg',    // 8px - 按钮、输入框
  md: 'rounded-xl',    // 12px - 卡片
  lg: 'rounded-2xl',   // 16px - 大卡片、模态框
  full: 'rounded-full', // 圆形 - 头像、图标按钮
};

/**
 * 阴影规范 - 扁平化风格（subtle shadow）
 */
export const MobileShadow = {
  sm: 'shadow-lg shadow-purple-500/10',      // 小阴影
  md: 'shadow-lg shadow-purple-500/20',      // 中等阴影
  lg: 'shadow-xl shadow-purple-500/30',      // 大阴影
  glow: 'shadow-lg shadow-purple-500/30',    // 发光效果（科技感）
  none: 'shadow-none',                       // 无阴影（完全扁平化）
};

/**
 * 按钮样式 - 符合新的UX规范（扁平化、科技感）
 */
export const MobileButtonStyles = {
  primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/30 font-semibold active:scale-95 transition-all duration-200 touch-manipulation',
  secondary: 'bg-slate-800/80 backdrop-blur-md border border-white/10 hover:bg-slate-700/80 text-white active:scale-95 transition-all duration-200 touch-manipulation',
  outline: 'border-2 border-slate-600/50 hover:border-purple-500/50 text-slate-300 hover:text-white bg-transparent backdrop-blur-sm active:scale-95 transition-all duration-200 touch-manipulation',
  ghost: 'text-slate-400 hover:text-white bg-transparent hover:bg-white/5 active:opacity-80 transition-all duration-200 touch-manipulation',
  danger: 'bg-red-600/90 backdrop-blur-md hover:bg-red-500 text-white shadow-lg shadow-red-500/30 font-semibold active:scale-95 transition-all duration-200 touch-manipulation',
};

/**
 * 交互反馈样式 - 统一的触摸反馈
 */
export const MobileInteractionStyles = {
  touchFeedback: 'active:scale-95 transition-transform duration-150 touch-manipulation',
  hoverFeedback: 'hover:opacity-80 transition-opacity duration-200',
  pressFeedback: 'active:opacity-70 transition-opacity duration-100',
  disabled: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
};

/**
 * 输入框样式 - 符合新的UX规范（扁平化、科技感）
 */
export const MobileInputStyles = 'w-full min-h-[44px] px-4 py-3 bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 touch-manipulation';

/**
 * 卡片样式 - 符合新的UX规范（扁平化、毛玻璃效果）
 */
/**
 * 卡片样式 - 符合新的UX规范（扁平化、科技感）
 */
export const MobileCardStyles = {
  default: 'bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg shadow-purple-500/10',
  interactive: 'active:scale-[0.97] transition-transform touch-manipulation cursor-pointer',
  shadow: 'shadow-lg shadow-purple-500/10',
  hover: 'hover:border-purple-500/50 hover:shadow-purple-500/20 transition-all duration-200',
};

/**
 * 模态框样式 - 符合新的UX规范
 */
export const MobileModalStyles = {
  overlay: 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4',
  container: 'bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col',
  header: 'p-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b border-white/10 flex items-center justify-between',
  body: 'p-4 overflow-y-auto flex-1',
  footer: 'p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-white/10 flex items-center gap-3',
};

/**
 * 动画和过渡规范 - 统一的动画时长和缓动函数
 */
export const MobileAnimationStyles = {
  duration: {
    fast: 'duration-150',    // 150ms - 微交互
    normal: 'duration-200',  // 200ms - 组件动画
    slow: 'duration-300',    // 300ms - 页面过渡
  },
  easing: {
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
  transition: {
    all: 'transition-all duration-200 ease-out',
    transform: 'transition-transform duration-150 ease-out',
    opacity: 'transition-opacity duration-200 ease-out',
    colors: 'transition-colors duration-200 ease-out',
  },
};

/**
 * 触摸区域最小尺寸（44x44px，iOS推荐）
 */
export const MobileTouchTarget = {
  minSize: 'min-w-[44px] min-h-[44px]',
  padding: 'p-3',
};

/**
 * 加载状态样式 - 符合新的UX规范（科技感）
 */
export const MobileLoadingStyles = {
  spinner: 'w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin',
  spinnerLarge: 'w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin',
  spinnerSmall: 'w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin',
  skeleton: 'bg-slate-700/50 animate-pulse rounded-lg',
  skeletonText: 'bg-slate-700/50 animate-pulse rounded h-4',
  skeletonCard: 'bg-slate-800/50 animate-pulse rounded-xl p-4',
};

/**
 * 字体系统 - 符合新的UX规范
 */
export const MobileTypography = {
  // 字号（8px基准）
  fontSize: {
    xs: 'text-xs',      // 12px
    sm: 'text-sm',      // 14px
    base: 'text-base',  // 16px
    lg: 'text-lg',      // 18px
    xl: 'text-xl',      // 20px
    '2xl': 'text-2xl',  // 24px
    '3xl': 'text-3xl',  // 30px
  },
  // 字重
  fontWeight: {
    normal: 'font-normal',   // 400
    medium: 'font-medium',   // 500
    semibold: 'font-semibold', // 600
    bold: 'font-bold',       // 700
  },
  // 行高
  lineHeight: {
    tight: 'leading-tight',     // 1.25
    normal: 'leading-normal',   // 1.5
    relaxed: 'leading-relaxed', // 1.625
  },
};

/**
 * 空状态样式 - 符合新的UX规范（友好、温馨）
 */
export const MobileEmptyStateStyles = {
  container: 'flex flex-col items-center justify-center py-12 px-4',
  icon: 'text-6xl mb-4 opacity-50',
  title: 'text-white font-semibold text-lg mb-2 text-center',
  description: 'text-slate-400 text-sm text-center mb-6 max-w-xs',
  action: 'px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/30 active:scale-95 transition-all duration-200 touch-manipulation',
};

/**
 * 状态提示样式 - 符合新的UX规范（清晰、友好）
 */
export const MobileStatusStyles = {
  error: {
    container: 'bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-lg p-4',
    text: 'text-red-400 text-sm',
    icon: 'text-red-400',
  },
  success: {
    container: 'bg-green-500/20 backdrop-blur-sm border border-green-500/50 rounded-lg p-4',
    text: 'text-green-400 text-sm',
    icon: 'text-green-400',
  },
  warning: {
    container: 'bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/50 rounded-lg p-4',
    text: 'text-yellow-400 text-sm',
    icon: 'text-yellow-400',
  },
  info: {
    container: 'bg-blue-500/20 backdrop-blur-sm border border-blue-500/50 rounded-lg p-4',
    text: 'text-blue-400 text-sm',
    icon: 'text-blue-400',
  },
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
