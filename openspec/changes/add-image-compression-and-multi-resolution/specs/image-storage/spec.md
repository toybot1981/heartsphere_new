## ADDED Requirements

### Requirement: 图像上传时自动生成多分辨率版本
系统 SHALL 在上传图像时自动生成多个分辨率版本，包括：
- 原图（保持原始文件名和路径）
- 缩略图（小尺寸，用于列表、卡片等场景）
- 中等质量图（中等尺寸，用于详情页、对话框等场景）
- 高质量背景图（大尺寸，用于PC版ChatWindow背景，可选）

#### Scenario: 上传图像时自动生成多分辨率版本
- **WHEN** 用户上传一张图像（通过 `/api/images/upload` 或 `/api/images/upload-base64`）
- **THEN** 系统保存原图到指定路径
- **AND** 系统自动生成缩略图（默认200x200，质量0.7）
- **AND** 系统自动生成中等质量图（默认800x600，质量0.85）
- **AND** 系统返回原图URL，并在响应中包含所有分辨率版本的URL（可选）

#### Scenario: 多分辨率文件命名规范
- **WHEN** 系统生成多分辨率版本
- **THEN** 原图保持原始文件名（如：`uuid.jpg`）
- **AND** 缩略图命名为 `原图名称_200*200.扩展名`（如：`uuid_200*200.jpg`）
- **AND** 中等质量图命名为 `原图名称_800*600.扩展名`（如：`uuid_800*600.jpg`）
- **AND** 高质量背景图命名为 `原图名称_1920*1080.扩展名`（如：`uuid_1920*1080.jpg`）

#### Scenario: PC版ChatWindow背景生成高质量背景图
- **WHEN** 上传的图像用于PC版ChatWindow背景
- **THEN** 系统额外生成高质量背景图（1920x1080，质量0.9）
- **AND** 高质量背景图使用命名规范 `原图名称_1920*1080.扩展名`

### Requirement: 根据展示场景智能选择图片分辨率
系统 SHALL 根据图像的展示场景自动选择合适的分辨率版本，绝大多数情况下不使用原图。

#### Scenario: 缩略图/列表场景使用缩略图
- **WHEN** 图像在缩略图或列表场景中展示（如：角色列表、场景卡片、日记列表）
- **THEN** 前端自动选择缩略图版本（200x200）
- **AND** 如果缩略图不存在，回退到原图

#### Scenario: 详情页/对话框场景使用中等质量图
- **WHEN** 图像在详情页或对话框中展示（如：角色详情、场景详情、日记详情）
- **THEN** 前端自动选择中等质量图版本（800x600）
- **AND** 如果中等质量图不存在，回退到原图

#### Scenario: 移动端背景使用中等质量图
- **WHEN** 图像在移动端作为背景展示
- **THEN** 前端自动选择中等质量图版本（800x600）
- **AND** 如果中等质量图不存在，回退到原图

#### Scenario: PC版ChatWindow背景使用高质量背景图
- **WHEN** 图像在PC版ChatWindow中作为背景展示
- **THEN** 前端自动选择高质量背景图版本（1920x1080）
- **AND** 如果高质量背景图不存在，回退到中等质量图或原图

#### Scenario: 特殊需求可使用原图
- **WHEN** 有特殊需求需要使用原图（如：下载、打印、高质量预览）
- **THEN** 前端可以显式指定使用原图
- **AND** 系统提供原图URL

## MODIFIED Requirements

### Requirement: 图像上传API响应
图像上传API（`/api/images/upload` 和 `/api/images/upload-base64`）SHALL 在响应中包含原图URL，并可选择性地包含所有分辨率版本的URL。

#### Scenario: 上传API返回多分辨率URL
- **WHEN** 用户上传图像成功
- **THEN** API响应包含 `url` 字段（原图URL）
- **AND** API响应可选包含 `variants` 字段，包含所有分辨率版本的URL：
  ```json
  {
    "success": true,
    "url": "http://localhost:8081/images/character/2025/12/uuid.jpg",
    "variants": {
      "original": "http://localhost:8081/images/character/2025/12/uuid.jpg",
      "thumbnail": "http://localhost:8081/images/character/2025/12/uuid_200*200.jpg",
      "medium": "http://localhost:8081/images/character/2025/12/uuid_800*600.jpg",
      "highQuality": "http://localhost:8081/images/character/2025/12/uuid_1920*1080.jpg"
    },
    "relativePath": "character/2025/12/uuid.jpg",
    "message": "图片上传成功"
  }
  ```
