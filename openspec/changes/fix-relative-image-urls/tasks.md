# Tasks: Fix Relative Image URLs to Full URLs

## 1. Backend Implementation

- [ ] 1.1 修改 `EraController` 返回完整URL
  - [ ] 在 `getAllEras()` 方法中使用 `imageUrlUtils.toFullUrl()` 转换场景图片URL
  - [ ] 在 `getErasByWorldId()` 方法中使用 `imageUrlUtils.toFullUrl()` 转换场景图片URL
  - [ ] 确保 `imageVariants` 中的URL也是完整URL
  - [ ] 测试场景列表API返回的URL格式

- [ ] 1.2 修改 `CharacterController` 返回完整URL
  - [ ] 在 `getAllCharacters()` 方法中使用 `imageUrlUtils.toFullUrl()` 转换角色图片URL
  - [ ] 在 `getCharactersByEraId()` 方法中使用 `imageUrlUtils.toFullUrl()` 转换角色图片URL
  - [ ] 确保 `avatarVariants` 和 `backgroundVariants` 中的URL也是完整URL
  - [ ] 测试角色列表API返回的URL格式

- [ ] 1.3 修改 `DTOMapper` 确保图片URL转换
  - [ ] 检查 `toEraDTO()` 方法，确保图片URL转换
  - [ ] 检查 `toCharacterDTO()` 方法，确保图片URL转换
  - [ ] 添加空值检查，避免NPE

- [ ] 1.4 验证 `ImageUrlUtils.generateImageVariants()` 返回完整URL
  - [ ] 检查 `generateImageVariants()` 方法实现
  - [ ] 确保所有变体URL都使用 `toFullUrl()` 转换
  - [ ] 测试变体URL生成

## 2. Frontend Implementation

- [ ] 2.1 创建图片URL工具函数
  - [ ] 创建 `utils/imageUrl.ts` 文件
  - [ ] 实现 `toFullImageUrl()` 函数
  - [ ] 添加环境变量 `VITE_IMAGE_BASE_URL` 支持
  - [ ] 添加默认值（开发环境：`http://localhost:8081/images`）
  - [ ] 添加单元测试

- [ ] 2.2 修改 `imageResolution.ts`
  - [ ] 修改 `generateVariantUrl()` 函数，处理相对路径时转换为完整URL
  - [ ] 使用 `toFullImageUrl()` 工具函数
  - [ ] 确保变体URL也是完整URL
  - [ ] 测试相对路径和完整URL的处理

- [ ] 2.3 修改 `LazyImage.tsx`
  - [ ] 在构建回退链前，检查并转换相对路径
  - [ ] 使用 `toFullImageUrl()` 转换所有URL
  - [ ] 确保变体URL也正确转换
  - [ ] 测试图片加载

- [ ] 2.4 修改 `SceneCard.tsx`
  - [ ] 在生成图片变体前，转换原始图片URL
  - [ ] 使用 `toFullImageUrl()` 转换
  - [ ] 确保变体URL也是完整URL
  - [ ] 测试场景卡片图片显示

- [ ] 2.5 修改其他使用图片URL的组件（可选）
  - [ ] 检查其他组件是否也需要处理相对路径
  - [ ] 统一使用 `toFullImageUrl()` 工具函数

## 3. Configuration

- [ ] 3.1 添加环境变量配置
  - [ ] 在 `.env.example` 中添加 `VITE_IMAGE_BASE_URL` 配置
  - [ ] 在 `vite.config.ts` 中添加环境变量定义
  - [ ] 更新文档说明环境变量配置

## 4. Testing

- [ ] 4.1 后端测试
  - [ ] 测试场景API返回的图片URL格式
  - [ ] 测试角色API返回的图片URL格式
  - [ ] 测试图片变体URL格式
  - [ ] 验证所有URL都是完整URL

- [ ] 4.2 前端测试
  - [ ] 测试完整URL加载
  - [ ] 测试相对路径兜底转换
  - [ ] 测试图片变体URL加载
  - [ ] 测试游客模式下场景卡片图片显示
  - [ ] 测试不同环境（开发/生产）的图片加载

- [ ] 4.3 集成测试
  - [ ] 测试游客登录后场景列表图片显示
  - [ ] 测试角色列表图片显示
  - [ ] 测试图片加载失败时的错误处理
  - [ ] 测试图片变体回退逻辑

## 5. Documentation

- [ ] 5.1 更新开发文档
  - [ ] 记录图片URL处理规范
  - [ ] 说明环境变量配置
  - [ ] 添加图片URL转换示例

- [ ] 5.2 更新API文档
  - [ ] 说明图片URL返回格式
  - [ ] 说明图片变体URL格式
