# 图片URL存储格式优化完成报告

## 优化目标

确保数据库中存储的图片URL都是相对路径，而不是绝对路径（如 `http://localhost:8081/...` 或 `https://heartsphere.cn/...`）。

## 问题分析

### 问题根源

1. **图片上传流程**：
   - `ImageStorageService.saveImage()` 返回相对路径（正确）✅
   - `ImageController` 使用 `ImageUrlUtils.toFullUrl()` 转换为完整URL返回给前端（正确）✅
   - 前端收到完整URL（如：`https://heartsphere.cn/api/images/files/character/2025/12/xxx.png`）

2. **数据保存流程**：
   - 前端将完整URL放入DTO（CharacterDTO/EraDTO/JournalEntryDTO等）
   - Controller 直接从DTO获取URL并保存到数据库
   - **问题**：如果DTO中包含完整URL，会直接保存完整URL到数据库 ❌

### 解决方案

在Controller保存数据前，使用 `ImageUrlUtils.toRelativePath()` 将完整URL转换为相对路径。

## 修复内容

### 1. CharacterController

**文件**: `backend/src/main/java/com/heartsphere/controller/CharacterController.java`

**修改**:
- 添加 `ImageUrlUtils` 依赖注入
- 在创建和更新角色时，使用 `imageUrlUtils.toRelativePath()` 转换 `avatarUrl` 和 `backgroundUrl`

```java
@Autowired
private com.heartsphere.util.ImageUrlUtils imageUrlUtils;

// 保存时转换
character.setAvatarUrl(imageUrlUtils.toRelativePath(characterDTO.getAvatarUrl()));
character.setBackgroundUrl(imageUrlUtils.toRelativePath(characterDTO.getBackgroundUrl()));
```

### 2. EraController

**文件**: `backend/src/main/java/com/heartsphere/controller/EraController.java`

**修改**:
- 添加 `ImageUrlUtils` 依赖注入
- 在创建和更新时代时，使用 `imageUrlUtils.toRelativePath()` 转换 `imageUrl`

```java
@Autowired
private com.heartsphere.util.ImageUrlUtils imageUrlUtils;

// 保存时转换
era.setImageUrl(imageUrlUtils.toRelativePath(eraDTO.getImageUrl()));
```

### 3. JournalEntryController

**文件**: `backend/src/main/java/com/heartsphere/controller/JournalEntryController.java`

**修改**:
- 添加 `ImageUrlUtils` 依赖注入
- 在创建和更新日记时，使用 `imageUrlUtils.toRelativePath()` 转换 `imageUrl`

```java
@Autowired
private com.heartsphere.util.ImageUrlUtils imageUrlUtils;

// 创建时转换（从Map读取）
journalEntry.setImageUrl(imageUrlUtils.toRelativePath(imageUrlValue));

// 更新时转换（从DTO读取）
journalEntry.setImageUrl(imageUrlUtils.toRelativePath(journalEntryDTO.getImageUrl()));
```

## ImageUrlUtils.toRelativePath() 方法说明

该方法能够：
1. **相对路径**：如果已经是相对路径，直接返回
2. **外部URL**：如果是外部URL（不同域名，如 `https://picsum.photos/...`），保持原样
3. **同域名URL**：如果是同域名的完整URL，提取相对路径（去除 `/api/images/files/` 或 `/files/` 前缀）

示例：
- `https://heartsphere.cn/api/images/files/character/2025/12/xxx.png` → `character/2025/12/xxx.png`
- `character/2025/12/xxx.png` → `character/2025/12/xxx.png`（已经是相对路径）
- `https://picsum.photos/300/300` → `https://picsum.photos/300/300`（外部URL，保持原样）

## 检查脚本

已创建检查脚本：`scripts/check-database-image-urls.sh`

使用方法：
```bash
./scripts/check-database-image-urls.sh
```

脚本会统计各表中：
- `absolute_url_count`: 绝对路径数量（http://或https://开头）
- `localhost_count`: 包含localhost的URL数量
- `relative_path_count`: 相对路径数量（正确的格式）
- `null_or_empty_count`: 空值数量

## 数据迁移

如果数据库中已有完整URL（特别是 localhost URL），需要执行迁移脚本：

**文件**: `backend/src/main/resources/db/migration/V20250103001__convert_localhost_image_urls_to_relative.sql`

该脚本会将所有 localhost URL 转换为相对路径。

执行方式：
1. Flyway 自动执行（推荐）
2. 手动执行：`mysql -u root -p heartsphere < backend/src/main/resources/db/migration/V20250103001__convert_localhost_image_urls_to_relative.sql`

## 验证步骤

### 1. 检查数据库

执行检查脚本，确认所有表的 `absolute_url_count` 和 `localhost_count` 都为 0（外部URL除外）。

### 2. 测试上传和保存

1. 上传图片 → 返回完整URL
2. 保存数据（角色/时代/日记）→ 数据库中应该是相对路径
3. 查询数据 → 返回完整URL（通过 DTOMapper 转换）

### 3. 检查日志

检查后端日志，确认：
- 图片上传返回相对路径
- 数据保存时URL被转换为相对路径
- 数据查询时相对路径被转换为完整URL

## 相关文件

- `backend/src/main/java/com/heartsphere/util/ImageUrlUtils.java` - 图片URL工具类
- `backend/src/main/java/com/heartsphere/controller/CharacterController.java` - 角色控制器
- `backend/src/main/java/com/heartsphere/controller/EraController.java` - 时代控制器
- `backend/src/main/java/com/heartsphere/controller/JournalEntryController.java` - 日记控制器
- `backend/src/main/java/com/heartsphere/utils/DTOMapper.java` - DTO转换器（读取时转换）
- `scripts/check-database-image-urls.sh` - 检查脚本

## 总结

✅ **已完成**：
- 修复了 CharacterController、EraController、JournalEntryController 中的图片URL保存逻辑
- 所有保存操作都会将完整URL转换为相对路径
- 编译通过，代码可以正常使用

📝 **后续工作**：
- 执行数据迁移脚本，清理数据库中的旧数据
- 在生产环境验证图片上传和保存流程
- 定期检查数据库，确保没有新的完整URL被保存
