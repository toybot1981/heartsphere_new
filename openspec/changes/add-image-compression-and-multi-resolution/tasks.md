## 1. 后端实现

### 1.1 扩展 ImageProcessingService（复用现有方法）
- [x] 1.1.1 添加 `generateMediumQualityImage()` 方法
  - 复用现有的 `generateThumbnail(BufferedImage, width, height, keepAspectRatio, quality)` 方法
  - 参数：800x600，质量0.85，保持宽高比
- [x] 1.1.2 添加 `generateHighQualityBackground()` 方法
  - 复用现有的 `generateThumbnail()` 方法
  - 参数：1920x1080，质量0.9，保持宽高比
- [x] 1.1.3 添加 `generateAndSaveMediumQuality()` 方法
  - 复用现有的 `generateThumbnail()` 和 `saveProcessedImage()` 方法
  - 使用 `_800*600` 后缀（`saveProcessedImage()` 已支持此格式）
- [x] 1.1.4 添加 `generateAndSaveHighQualityBackground()` 方法
  - 复用现有的 `generateThumbnail()` 和 `saveProcessedImage()` 方法
  - 使用 `_1920*1080` 后缀
- [x] 1.1.5 添加 `generateAllVariants()` 方法
  - 批量生成所有分辨率版本（缩略图、中等质量图、高质量背景图）
  - 复用现有的 `generateAndSaveThumbnail()`、`generateAndSaveMediumQuality()`、`generateAndSaveHighQualityBackground()` 方法

### 1.2 扩展 ImageStorageService
- [x] 1.2.1 修改 `saveImage()` 方法，添加上传后自动生成多分辨率版本
- [x] 1.2.2 修改 `saveBase64Image()` 方法，添加上传后自动生成多分辨率版本
- [x] 1.2.3 实现多分辨率文件命名规范（`原图名称_宽度*高度.扩展名`）
- [x] 1.2.4 添加配置项：缩略图尺寸、中等质量图尺寸、高质量背景图尺寸、压缩质量
- [ ] 1.2.5 支持异步处理（可选，避免阻塞上传响应）- 暂不实现，保持同步处理

### 1.3 更新 ImageController
- [x] 1.3.1 更新 `/api/images/upload` 响应，包含所有分辨率版本的URL
- [x] 1.3.2 更新 `/api/images/upload-base64` 响应，包含所有分辨率版本的URL
- [ ] 1.3.3 添加新API：`/api/images/{path}/variants` - 获取图片的所有分辨率版本（可选，暂不实现）

### 1.4 配置管理
- [x] 1.4.1 在 `application.yml` 中添加图像压缩和多分辨率配置
- [x] 1.4.2 配置默认尺寸：缩略图（200x200）、中等质量（800x600）、高质量背景（1920x1080）
- [x] 1.4.3 配置压缩质量：缩略图（0.7）、中等质量（0.85）、高质量背景（0.9）

## 2. 前端实现

### 2.1 图像API服务更新
- [x] 2.1.1 更新 `frontend/services/api/image/types.ts`，添加 `ImageVariants` 和更新 `ImageUploadResponse`
- [x] 2.1.2 创建图像分辨率选择工具函数 `frontend/utils/imageResolution.ts`（根据场景选择合适的分辨率）

### 2.2 图像组件更新
- [x] 2.2.1 更新 `LazyImage.tsx`，添加分辨率选择逻辑（支持 `variants` 和 `purpose` 参数）
- [x] 2.2.2 更新 `MobileLazyImage.tsx`，添加移动端分辨率选择（支持 `variants` 和 `displayPurpose` 参数）
- [x] 2.2.3 创建图像分辨率选择工具函数（根据展示场景自动选择）

### 2.3 展示场景映射
- [x] 2.3.1 定义展示场景枚举（thumbnail, list, detail, background, chatBackground等）
- [x] 2.3.2 实现场景到分辨率的映射逻辑（在 `imageResolution.ts` 中实现）
- [x] 2.3.3 PC版ChatWindow背景使用高质量背景图（在 `selectImageResolution` 中实现）

### 2.4 组件集成（渐进式更新）
- [ ] 2.4.1 更新角色头像组件，使用缩略图（列表）和中等质量图（详情）
  - 注意：组件已支持 `variants` 和 `purpose` 参数，只需在调用时传入即可
- [ ] 2.4.2 更新场景背景组件，使用中等质量图（移动端）和高质量背景图（PC端）
  - 注意：组件已支持，只需在调用时传入 `variants` 和 `purpose='chatBackground'`
- [ ] 2.4.3 更新日记配图组件，使用缩略图（列表）和中等质量图（详情）
  - 注意：组件已支持，只需在调用时传入 `variants` 和相应的 `purpose`
- [ ] 2.4.4 更新资源管理组件，使用缩略图（列表）和中等质量图（预览）
  - 注意：组件已支持，只需在调用时传入 `variants` 和相应的 `purpose`

## 3. 测试和验证

### 3.1 后端测试
- [ ] 3.1.1 测试图像上传时多分辨率生成
- [ ] 3.1.2 测试文件命名规范
- [ ] 3.1.3 测试不同尺寸和质量的压缩效果
- [ ] 3.1.4 测试异步处理（如果实现）

### 3.2 前端测试
- [ ] 3.2.1 测试不同场景下的分辨率选择
- [ ] 3.2.2 测试图像加载性能（对比原图和多分辨率图）
- [ ] 3.2.3 测试移动端和PC端的差异处理

### 3.3 集成测试
- [ ] 3.3.1 测试完整上传流程（上传→生成多分辨率→前端选择合适分辨率）
- [ ] 3.3.2 测试向后兼容性（旧图片仍可正常显示）
- [ ] 3.3.3 性能测试（上传时间、存储空间、加载速度）

## 4. 文档和迁移

### 4.1 文档更新
- [ ] 4.1.1 更新图像上传API文档
- [ ] 4.1.2 更新图像处理服务文档
- [ ] 4.1.3 添加多分辨率使用指南

### 4.2 数据迁移（可选）
- [ ] 4.2.1 为现有图片生成多分辨率版本（后台任务）
- [ ] 4.2.2 迁移脚本：扫描现有图片，批量生成多分辨率版本
