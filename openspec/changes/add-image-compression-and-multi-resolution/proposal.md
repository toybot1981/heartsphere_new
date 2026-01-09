# Change: 增加图像压缩和多分辨率支持

## Why

当前系统在上传图像时直接保存原图，没有进行压缩和多分辨率处理。这导致：
1. **存储空间浪费**：原图文件通常很大，但大多数展示场景不需要原图分辨率
2. **加载性能差**：前端加载大尺寸原图导致页面加载慢，用户体验差
3. **带宽浪费**：移动端和低带宽环境下加载大图浪费流量
4. **缺乏灵活性**：无法根据不同展示场景（如缩略图、列表、详情、背景等）选择合适的图片尺寸

通过在上传时自动生成多分辨率版本（原图、中等质量图、缩略图），并根据展示场景智能选择合适的分辨率，可以显著提升性能和用户体验。

## What Changes

- **ADDED**: 图像上传时自动压缩和多分辨率生成
  - 保存原图（作为主文件）
  - 自动生成缩略图（小尺寸，用于列表、卡片等）
  - 自动生成中等质量图（中等尺寸，用于详情页、对话框等）
  - PC版ChatWindow背景可额外生成高质量背景图（大尺寸）

- **ADDED**: 多分辨率文件命名规范
  - 原图：保持原始文件名
  - 缩略图：`原图名称_宽度*高度.扩展名`（如：`uuid_200*200.jpg`）
  - 中等质量图：`原图名称_宽度*高度.扩展名`（如：`uuid_800*600.jpg`）
  - 高质量背景图：`原图名称_宽度*高度.扩展名`（如：`uuid_1920*1080.jpg`）

- **ADDED**: 根据展示场景智能选择图片分辨率
  - 前端根据使用场景（缩略图、列表、详情、背景等）自动选择合适的分辨率
  - 绝大多数场景不使用原图，只在特殊需求时使用

- **MODIFIED**: 图像上传流程
  - 上传时自动触发压缩和多分辨率生成
  - 返回原图URL，同时提供其他分辨率的URL（可选）

## Impact

- **Affected specs**: `image-storage` capability
- **Affected code**:
  - `backend/src/main/java/com/heartsphere/service/ImageStorageService.java` - 添加上传时压缩和多分辨率生成
  - `backend/src/main/java/com/heartsphere/service/ImageProcessingService.java` - 扩展图像处理能力
  - `backend/src/main/java/com/heartsphere/controller/ImageController.java` - 更新上传API响应
  - `frontend/services/api/image/image.ts` - 更新图像API调用
  - `frontend/components/LazyImage.tsx` - 添加分辨率选择逻辑
  - `frontend/mobile/components/MobileLazyImage.tsx` - 添加移动端分辨率选择
  - 所有使用图像的组件（角色头像、场景背景、日记配图等）

- **Breaking changes**: 无（向后兼容，原图仍然可用）

- **Performance impact**: 
  - 上传时处理时间可能增加（异步处理可缓解）
  - 存储空间可能增加（但通过压缩可减少）
  - 前端加载性能显著提升（加载小图更快）
