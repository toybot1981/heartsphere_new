/**
 * 共享模式状态管理器
 * 用于在非 React 组件中访问共享模式信息（如 request.ts）
 */

interface SharedModeState {
  shareConfigId: number | null;
  visitorId: number | null;
}

let sharedModeState: SharedModeState = {
  shareConfigId: null,
  visitorId: null,
};

/**
 * 设置共享模式状态
 */
export const setSharedModeState = (shareConfigId: number | null, visitorId: number | null) => {
  sharedModeState = {
    shareConfigId,
    visitorId,
  };
};

/**
 * 获取共享模式状态
 */
export const getSharedModeState = (): SharedModeState => {
  return { ...sharedModeState };
};

/**
 * 清除共享模式状态
 */
export const clearSharedModeState = () => {
  sharedModeState = {
    shareConfigId: null,
    visitorId: null,
  };
};

