# 图片URL相对路径方案设计

## 概述

为了支持服务器迁移时只需要迁移 `uploads` 目录并配置域名，将数据库中的图片URL从绝对地址改为相对路径存储。

## 设计目标

1. **数据库存储**：只存储相对路径（如：`character/2024/12/abc-123.jpg`）
2. **前端访问**：通过配置的 `IMAGE_BASE_URL` 拼接完整URL
3. **兼容性**：支持外部URL（如 `picsum.photos`）保持不变
4. **迁移友好**：迁移服务器时只需修改配置文件中的 `IMAGE_BASE_URL`

## 技术实现

### 1. 配置项

在 `application.yml` 中配置（可选）：

```yaml
app:
  image:
    storage:
      base-url: ${IMAGE_BASE_URL:}  # 如果未配置，自动使用当前请求的域名
```

**配置优先级**：
1. 如果配置了 `IMAGE_BASE_URL` 环境变量或 `app.image.storage.base-url`，使用配置的值
2. 如果未配置，自动从当前HTTP请求中获取域名（scheme + host + port + /api/images）
3. 如果无法获取请求上下文（如后台任务），使用默认值 `http://localhost:8081/api/images`

环境变量配置示例（可选）：
```bash
# 开发环境（可选）
IMAGE_BASE_URL=http://localhost:8081/api/images

# 生产环境（推荐配置）
IMAGE_BASE_URL=https://yourdomain.com/api/images

# 不配置则自动使用请求域名（推荐用于单服务器场景）
```

### 2. 工具类：ImageUrlUtils

位置：`backend/src/main/java/com/heartsphere/util/ImageUrlUtils.java`

功能：
- `toFullUrl(String path)`: 将相对路径转换为完整URL
- `toRelativePath(String url)`: 将绝对URL转换为相对路径（仅限同域名）
- `isExternalUrl(String url)`: 判断是否是外部URL

### 3. 存储服务修改

`ImageStorageService.saveImage()` 和 `saveBase64Image()` 现在返回相对路径，而不是完整URL。

### 4. DTO转换

在返回给前端时，需要使用 `ImageUrlUtils.toFullUrl()` 将相对路径转换为完整URL。

示例：
```java
@Autowired
private ImageUrlUtils imageUrlUtils;

public CharacterDTO toDTO(Character character) {
    CharacterDTO dto = new CharacterDTO();
    // ... 其他字段
    dto.setAvatarUrl(imageUrlUtils.toFullUrl(character.getAvatarUrl()));
    dto.setBackgroundUrl(imageUrlUtils.toFullUrl(character.getBackgroundUrl()));
    return dto;
}
```

### 5. 数据库迁移

执行迁移脚本：`backend/src/main/resources/db/migration/migrate_image_urls_to_relative.sql`

此脚本会：
- 将同域名的绝对URL转换为相对路径
- 保持外部URL不变（如 `picsum.photos`）
- 支持多种URL格式（`/api/images/files/...`、`/files/...` 等）

## 数据格式说明

### 相对路径格式

```
{category}/{year}/{month}/{filename}
```

示例：
- `character/2024/12/uuid-123.jpg`
- `era/2024/11/uuid-456.png`

### 完整URL格式（前端访问）

```
{IMAGE_BASE_URL}/files/{相对路径}
```

示例（假设 `IMAGE_BASE_URL=http://localhost:8081/api/images`）：
- `http://localhost:8081/api/images/files/character/2024/12/uuid-123.jpg`

## 迁移步骤

### 1. 备份数据库

```bash
mysqldump -u root -p heartsphere > backup_before_url_migration.sql
```

### 2. 更新代码

- 部署包含 `ImageUrlUtils` 的新版本代码
- 更新所有DTO转换逻辑，使用 `ImageUrlUtils.toFullUrl()`

### 3. 执行迁移脚本

```bash
mysql -u root -p --default-character-set=utf8mb4 heartsphere < \
  backend/src/main/resources/db/migration/migrate_image_urls_to_relative.sql
```

### 4. 验证迁移结果

```sql
-- 检查是否还有内部绝对URL
SELECT 'characters.avatar_url' as table_column, avatar_url 
FROM characters 
WHERE avatar_url LIKE 'http://localhost%' OR avatar_url LIKE 'http://127.0.0.1%'
LIMIT 10;

-- 检查相对路径数量
SELECT COUNT(*) as relative_paths
FROM characters 
WHERE avatar_url IS NOT NULL 
  AND avatar_url NOT LIKE 'http%';
```

### 5. 配置新服务器

在新服务器上：
1. 复制 `uploads` 目录
2. （可选）设置环境变量 `IMAGE_BASE_URL=https://newdomain.com/api/images`
   - 如果不配置，系统会自动使用访问请求的域名
3. 重启应用

## 注意事项

1. **外部URL处理**：外部URL（如 `picsum.photos`）不会转换为相对路径，会保持原样
2. **向后兼容**：`ImageUrlUtils.toFullUrl()` 如果接收到绝对URL，会直接返回，确保兼容性
3. **路径格式**：相对路径不以 `/` 开头，格式为 `category/year/month/filename`
4. **URL前缀**：完整URL会自动添加 `/files/` 前缀以匹配静态资源处理器
5. **自动域名检测**：如果未配置 `IMAGE_BASE_URL`，系统会自动从HTTP请求中获取域名，适用于单服务器场景
6. **后台任务**：如果无法获取请求上下文（如定时任务、异步任务），会使用默认值 `http://localhost:8081/api/images`，建议在后台任务中配置 `IMAGE_BASE_URL`

## 相关文件

- `backend/src/main/java/com/heartsphere/util/ImageUrlUtils.java` - URL工具类
- `backend/src/main/java/com/heartsphere/service/ImageStorageService.java` - 图片存储服务（已修改）
- `backend/src/main/resources/db/migration/migrate_image_urls_to_relative.sql` - 迁移脚本
- `backend/src/main/resources/application.yml` - 配置文件

## 后续优化建议

1. 考虑在数据库层面添加约束，确保URL字段只存储相对路径
2. 添加验证逻辑，防止前端直接传入绝对URL
3. 考虑使用CDN时，`IMAGE_BASE_URL` 可以指向CDN地址

