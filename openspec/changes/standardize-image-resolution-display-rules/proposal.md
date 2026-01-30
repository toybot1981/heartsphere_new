# Change: 标准化图片分辨率展示规则

## Why

当前系统已经实现了多分辨率图片生成功能（`add-image-compression-and-multi-resolution`），但不同项目（admin、main、edu等）中图片展示规则不统一，存在以下问题：

1. **规则分散**：图片分辨率选择逻辑分散在各个项目中，缺乏统一的规范
2. **场景覆盖不全**：不同项目对展示场景的定义不一致，导致用户体验不一致
3. **维护困难**：规则分散导致维护成本高，修改时需要同步多个项目
4. **扩展性差**：新增项目或新场景时缺乏明确的指导规范

通过制定统一的图片分辨率展示规则，确保所有项目（admin、main、edu等）遵循相同的标准，提升用户体验一致性和代码可维护性。

## What Changes

- **ADDED**: 统一的图片展示场景定义
  - 定义标准化的展示场景类型（thumbnail、list、detail、background、chatBackground等）
  - 明确每个场景的适用场景和使用规则

- **ADDED**: 场景到分辨率的映射规则
  - 缩略图/列表场景 → 200×200 小缩略图
  - 详情页/对话框场景 → 800×600 中等质量图
  - 移动端背景场景 → 800×600 中等质量图
  - PC ChatWindow背景场景 → 1920×1080 高质量图（PC）或 800×600 中等质量图（移动端）
  - 特殊需求场景 → 原图（不推荐，仅特殊场景使用）

- **ADDED**: 跨项目统一实现规范
  - 所有项目（admin、main、edu等）必须使用统一的工具函数或组件
  - 统一的类型定义和接口规范
  - 统一的回退策略（如果目标分辨率不存在，按优先级回退）

- **MODIFIED**: 现有图片展示组件和工具
  - 统一 `LazyImage` 组件的分辨率选择逻辑
  - 统一 `imageResolution.ts` 工具函数的实现
  - 确保所有项目使用相同的规则

## Impact

- **Affected specs**: `image-display` capability (new)
- **Affected code**:
  - `main/frontend/utils/imageResolution.ts` - 统一实现
  - `admin/frontend/src/components/LazyImage.tsx` - 统一规则
  - `main/frontend/components/LazyImage.tsx` - 统一规则
  - `edu/frontend/` - 应用统一规则（如果存在）
  - 所有使用图片的组件（角色头像、场景背景、日记配图等）

- **Breaking changes**: 无（向后兼容，现有代码可逐步迁移）

- **Performance impact**: 
  - 无负面影响（规则统一后可能提升缓存命中率）
  - 用户体验一致性提升
