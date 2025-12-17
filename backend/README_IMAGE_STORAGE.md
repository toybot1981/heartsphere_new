# 图片存储服务使用说明

## 概述

图片存储服务提供了灵活的图片上传和存储方案，支持：
- **本地文件存储**（默认）
- **云存储**（OSS、S3等，可扩展）

## 配置

在 `application.yml` 中配置：

```yaml
app:
  image:
    storage:
      type: local  # local, oss, s3
      local:
        path: ./uploads/images  # 本地存储路径
      base-url: http://localhost:8081/api/images  # 图片访问基础URL
      max-size: 10485760  # 最大文件大小（10MB）
```

## API 端点

### 1. 上传图片文件
**POST** `/api/images/upload`

**参数：**
- `file` (MultipartFile): 图片文件
- `category` (String, 可选): 图片分类，默认为 "general"
  - 可选值：`era`, `character`, `journal`, `general` 等

**响应：**
```json
{
  "success": true,
  "url": "http://localhost:8081/api/images/era/2025/12/uuid.png",
  "message": "图片上传成功"
}
```

### 2. 上传Base64图片
**POST** `/api/images/upload-base64`

**请求体：**
```json
{
  "base64": "data:image/png;base64,iVBORw0KG...",
  "category": "era"
}
```

**响应：**
```json
{
  "success": true,
  "url": "http://localhost:8081/api/images/era/2025/12/uuid.png",
  "message": "图片上传成功"
}
```

### 3. 删除图片
**DELETE** `/api/images/delete?url={imageUrl}`

**响应：**
```json
{
  "success": true,
  "message": "图片删除成功"
}
```

## 存储结构

本地存储的文件结构：
```
uploads/images/
  ├── era/
  │   ├── 2025/
  │   │   ├── 12/
  │   │   │   ├── uuid1.png
  │   │   │   └── uuid2.jpg
  ├── character/
  │   ├── 2025/
  │   │   ├── 12/
  │   │   │   └── uuid3.png
  └── journal/
      └── ...
```

## 前端使用示例

### 上传文件
```typescript
import { imageApi } from './services/api';

// 方式1：上传文件
const file = event.target.files[0];
const result = await imageApi.uploadImage(file, 'era', token);
console.log('图片URL:', result.url);

// 方式2：上传Base64
const base64Data = 'data:image/png;base64,...';
const result = await imageApi.uploadBase64Image(base64Data, 'era', token);
console.log('图片URL:', result.url);
```

### 删除图片
```typescript
await imageApi.deleteImage(imageUrl, token);
```

## 扩展云存储

要扩展为云存储（如OSS、S3），只需：

1. 在 `ImageStorageService` 中添加对应的存储方法
2. 在 `saveImage` 和 `deleteImage` 方法中添加对应的 case
3. 在配置文件中添加云存储相关配置

## 注意事项

1. **文件大小限制**：默认10MB，可在配置中修改
2. **文件类型验证**：只接受图片文件（image/*）
3. **目录自动创建**：服务启动时会自动创建上传目录
4. **URL访问**：上传后的图片可通过返回的URL直接访问
5. **生产环境**：建议使用云存储（OSS/S3）而不是本地存储



