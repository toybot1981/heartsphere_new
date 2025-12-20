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

// 注意：其他模块（auth, world, journal, membership等）仍在 api.ts 中
// 后续会逐步迁移到模块化结构

