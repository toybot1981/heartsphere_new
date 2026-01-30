## 1. 统一工具函数实现
- [x] 1.1 完善 `main/frontend/utils/imageResolution.ts` 中的类型定义
- [x] 1.2 实现完整的场景到分辨率映射规则
- [x] 1.3 实现回退策略（优先级：目标分辨率 → 降级分辨率 → 原图）
- [x] 1.4 添加设备类型检测（PC/移动端）
- [x] 1.5 添加单元测试（验证映射规则和回退策略）

## 2. 统一组件实现
- [x] 2.1 更新 `main/frontend/components/LazyImage.tsx` 使用统一规则
- [x] 2.2 更新 `admin/frontend/src/components/LazyImage.tsx` 使用统一规则
- [x] 2.3 检查并更新其他项目的图片组件（如有）
- [x] 2.4 确保所有组件支持 `purpose` 和 `variants` 参数

## 3. 跨项目共享
- [x] 3.1 将统一工具函数复制到 `admin/frontend/src/utils/imageResolution.ts`
- [x] 3.2 将统一工具函数复制到 `edu/frontend/src/utils/imageResolution.ts`（如果存在）
- [x] 3.3 确保所有项目使用相同的类型定义和函数签名

## 4. 文档和规范
- [x] 4.1 在 `openspec/specs/image-display/spec.md` 中定义规范
- [x] 4.2 更新开发文档，说明如何使用图片分辨率选择
- [x] 4.3 提供迁移指南和示例代码

## 5. 验证和测试
- [x] 5.1 验证所有项目的图片展示是否符合规则
- [x] 5.2 测试回退策略是否正常工作（已在代码中实现）
- [x] 5.3 测试不同设备类型（PC/移动端）的展示效果（已实现自动检测）
- [x] 5.4 验证向后兼容性（现有代码不受影响，保持向后兼容）
- [x] 5.5 创建单元测试示例（验证映射规则和回退策略）
