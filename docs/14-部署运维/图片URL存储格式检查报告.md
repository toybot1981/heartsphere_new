# 图片URL存储格式检查报告

## 问题分析

### 当前流程

1. **图片上传**：
   - 前端调用 `/api/images/upload`
   - `ImageStorageService.saveImage()` 返回相对路径（如：`character/2025/12/xxx.png`）
   - `ImageController` 使用 `ImageUrlUtils.toFullUrl()` 转换为完整URL返回给前端
   - 前端收到完整URL（如：`https://heartsphere.cn/api/images/files/character/2025/12/xxx.png`）

2. **数据保存**：
   - 前端将完整URL放入DTO（CharacterDTO/EraDTO/JournalEntryDTO等）
   - Controller 直接从DTO获取URL并保存到数据库
   - **问题**：如果DTO中包含完整URL，会直接保存完整URL到数据库

### 问题根源

Controller 中保存数据时，没有将完整URL转换为相对路径。例如：

```java
// CharacterController.java
character.setAvatarUrl(characterDTO.getAvatarUrl()); // 可能是完整URL
```

## 解决方案

### 方案1：在Controller中转换（推荐）

在Controller保存数据前，使用 `ImageUrlUtils.toRelativePath()` 将完整URL转换为相对路径：

```java
@Autowired
private ImageUrlUtils imageUrlUtils;

character.setAvatarUrl(imageUrlUtils.toRelativePath(characterDTO.getAvatarUrl()));
```

### 方案2：在DTO转换时处理

在 `DTOMapper.toCharacterDTO()` 等方法的反向转换中处理，但这需要创建反向DTOMapper。

### 方案3：在前端处理

前端在上传图片后保存数据时，使用相对路径而不是完整URL。但这需要前端改动。

## 推荐的修复方案

采用方案1，在Controller中统一处理：

1. 在所有保存/更新图片URL的地方，使用 `ImageUrlUtils.toRelativePath()` 转换
2. 涉及的Controller：
   - `CharacterController` - avatarUrl, backgroundUrl
   - `EraController` - imageUrl
   - `JournalEntryController` - imageUrl
   - `UserProfileController` - avatar
   - `UserMainStoryController` - avatarUrl, backgroundUrl

## 检查脚本

已创建检查脚本：`scripts/check-database-image-urls.sh`

使用方法：
```bash
./scripts/check-database-image-urls.sh
```

## 数据迁移

如果数据库中已有完整URL，需要执行迁移脚本：
- `backend/src/main/resources/db/migration/V20250103001__convert_localhost_image_urls_to_relative.sql`

该脚本会将所有 localhost URL 转换为相对路径。
