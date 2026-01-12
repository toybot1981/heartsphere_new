/**
 * 键盘快捷键定义和工具函数
 */

export interface ShortcutDefinition {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  handler: () => void;
}

/**
 * 常用快捷键定义
 */
export const commonShortcuts: Record<string, ShortcutDefinition> = {
  newSession: {
    key: 'n',
    ctrl: true,
    description: '创建新会话',
    handler: () => {
      // 由使用方实现
    },
  },
  toggleSidebar: {
    key: 'k',
    ctrl: true,
    description: '切换侧边栏',
    handler: () => {
      // 由使用方实现
    },
  },
  tabChat: {
    key: '1',
    ctrl: true,
    description: '切换到对话标签页',
    handler: () => {
      // 由使用方实现
    },
  },
  tabTasks: {
    key: '2',
    ctrl: true,
    description: '切换到任务标签页',
    handler: () => {
      // 由使用方实现
    },
  },
  tabVM: {
    key: '3',
    ctrl: true,
    description: '切换到虚拟机标签页',
    handler: () => {
      // 由使用方实现
    },
  },
  tabLogs: {
    key: '4',
    ctrl: true,
    description: '切换到日志标签页',
    handler: () => {
      // 由使用方实现
    },
  },
};

/**
 * 获取快捷键显示文本
 */
export const getShortcutText = (shortcut: ShortcutDefinition): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.meta) parts.push('Cmd');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
};

/**
 * 格式化快捷键显示（跨平台）
 */
export const formatShortcutForPlatform = (shortcut: ShortcutDefinition): string => {
  const isMac = typeof window !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.platform);
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push(isMac ? '⌃' : 'Ctrl');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  if (shortcut.meta) parts.push(isMac ? '⌘' : 'Win');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(isMac ? '' : ' + ');
};
