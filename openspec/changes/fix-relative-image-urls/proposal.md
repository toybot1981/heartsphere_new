# Change: Fix Relative Image URLs to Full URLs with Schema

## Why

当前系统存在图片URL处理不一致的问题：

1. **后端返回相对路径**: 后端API在某些情况下返回相对路径（如 `era/2026/01/xxx.png`），而不是完整的URL（如 `http://localhost:8081/images/era/2026/01/xxx.png`）

2. **前端无法加载**: 前端组件（如 `LazyImage`）接收到相对路径时，无法正确加载图片，导致图片加载失败

3. **游客模式问题**: 游客登录后，场景卡片图片使用相对路径，无法正确显示

4. **不一致的处理**: 部分接口返回完整URL，部分返回相对路径，导致前端需要处理两种情况

因此，需要统一图片URL的处理方式，确保所有返回给前端的图片URL都是完整的URL（包含schema和base URL）。

## What Changes

### Core Changes

- **MODIFIED**: 后端API响应 - 所有返回图片URL的接口统一使用完整URL（通过 `ImageUrlUtils.toFullUrl()` 转换）
- **ADDED**: 前端工具函数 - 添加 `toFullImageUrl()` 工具函数，将相对路径转换为完整URL（作为兜底方案）
- **MODIFIED**: 前端组件 - `LazyImage`、`SceneCard` 等组件在接收到相对路径时自动转换为完整URL
- **MODIFIED**: 图片变体生成 - `generateVariantUrl()` 和 `generateImageVariants()` 函数处理相对路径时转换为完整URL

### Backend Changes

- **MODIFIED**: `EraController` - 返回场景图片URL时使用 `imageUrlUtils.toFullUrl()` 转换为完整URL
- **MODIFIED**: `CharacterController` - 返回角色图片URL时使用 `imageUrlUtils.toFullUrl()` 转换为完整URL
- **MODIFIED**: `DTOMapper` - 确保所有DTO中的图片URL都是完整URL
- **MODIFIED**: 图片变体生成 - `ImageUrlUtils.generateImageVariants()` 返回的变体URL都是完整URL

### Frontend Changes

- **ADDED**: `utils/imageUrl.ts` - 新增工具函数 `toFullImageUrl()`，将相对路径转换为完整URL
- **MODIFIED**: `utils/imageResolution.ts` - `generateVariantUrl()` 函数处理相对路径时转换为完整URL
- **MODIFIED**: `components/LazyImage.tsx` - 在加载图片前检查并转换相对路径
- **MODIFIED**: `components/SceneCard.tsx` - 在生成图片变体前转换相对路径

## Impact

- **Affected specs**: 
  - 图片处理（image-handling）
  - 前端组件（frontend-components）

- **Affected code**:
  - `EraController.java` - 场景图片URL转换
  - `CharacterController.java` - 角色图片URL转换
  - `DTOMapper.java` - DTO图片URL转换
  - `ImageUrlUtils.java` - 图片URL工具类
  - `LazyImage.tsx` - 图片加载组件
  - `SceneCard.tsx` - 场景卡片组件
  - `imageResolution.ts` - 图片分辨率工具

- **Database**: 无变更

## Design Principles

1. **统一处理**: 后端统一返回完整URL，前端作为兜底方案处理相对路径
2. **向后兼容**: 前端同时支持完整URL和相对路径，确保兼容性
3. **性能优化**: 相对路径转换在组件层面进行，避免重复转换
4. **错误处理**: 图片加载失败时提供清晰的错误信息

## User Experience Flow

1. **后端返回**: API返回图片URL时，统一使用完整URL（如 `http://localhost:8081/images/era/2026/01/xxx.png`）

2. **前端接收**: 前端组件接收到图片URL（可能是完整URL或相对路径）

3. **自动转换**: 如果是相对路径，前端工具函数自动转换为完整URL

4. **图片加载**: `LazyImage` 组件使用完整URL加载图片，确保正确显示

## Risks & Mitigation

- **风险1**: 后端转换失败导致返回空URL
  - **缓解**: 前端兜底方案，如果后端返回相对路径，前端自动转换
  - **缓解**: 添加错误日志，便于排查问题

- **风险2**: 不同环境（开发/生产）的base URL不同
  - **缓解**: 使用环境变量配置图片base URL
  - **缓解**: 后端通过请求上下文获取base URL

- **风险3**: 图片变体URL转换不一致
  - **缓解**: 统一使用 `ImageUrlUtils.generateImageVariants()` 生成变体URL
  - **缓解**: 前端统一处理变体URL转换

## Success Criteria

- [ ] 后端所有API返回的图片URL都是完整URL（包含schema和base URL）
- [ ] 前端工具函数能够正确将相对路径转换为完整URL
- [ ] `LazyImage` 组件能够正确加载相对路径和完整URL的图片
- [ ] 游客登录后场景卡片图片正确显示
- [ ] 图片变体URL（thumbnail、medium、highQuality）都是完整URL
- [ ] 所有图片加载错误都有清晰的错误信息
