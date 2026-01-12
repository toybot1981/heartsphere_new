// API模块统一导出文件
// 此文件用于统一导出所有API模块，方便使用

// 场景模块
export * from './api/scene';

// 角色模块
export * from './api/character';

// 剧本模块
export * from './api/script';

// 主线剧情模块
export * from './api/mainStory';

// 剧本事件和物品模块
export * from './api/scenario';

// 心域连接模块
export * from './api/quickconnect';

// 心域共享模块
export * from './api/heartconnect';

// 传送门模块
export * from './api/portal';

// 对话日志模块
export * from './api/conversationLog';

// 图片API模块
export { imageApi } from './api/image';
export type {
  ProxyDownloadResponse,
  ImageUploadResponse,
  ImageDeleteResponse,
  ImageProcessingResponse,
  ImageListItem,
  ImageListResponse,
  ImageVariants,
} from './api/image/types';

// 视频API模块
export { videoApi } from './api/video';
export type {
  VideoUploadResponse,
  VideoToAnimationRequest,
  VideoToAnimationResponse,
  VideoInfo,
  VideoInfoResponse,
  VideoListItem,
  VideoListResponse,
} from './api/video/types';

// 注意：其他模块（auth, world, journal, membership等）仍在 api.ts 中
// 后续会逐步迁移到模块化结构

