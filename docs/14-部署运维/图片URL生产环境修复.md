# 图片URL生产环境修复

## 问题描述

在生产环境部署后，图片地址仍然使用 `localhost`，导致前端无法正确加载图片。

## 修复内容

### 1. 修复 `ImageUrlUtils.java` 硬编码问题

**文件**: `backend/src/main/java/com/heartsphere/util/ImageUrlUtils.java`

**问题**: 当无法获取请求上下文时，返回硬编码的 `http://localhost:8081/api/images`

**修复**:
- 移除硬编码的 localhost 默认值
- 优先从环境变量 `IMAGE_BASE_URL` 获取
- 如果环境变量也未配置，返回空字符串并记录错误日志
- 在 `toFullUrl()` 方法中，如果 baseUrl 为空，返回相对路径让前端处理

### 2. 修复 `DTOMapper.java` 中日记图片URL转换

**文件**: `backend/src/main/java/com/heartsphere/utils/DTOMapper.java`

**问题**: `toJournalEntryDTO()` 方法中，`imageUrl` 没有使用 `imageUrlUtils.toFullUrl()` 转换

**修复**: 添加图片URL转换逻辑，确保日记图片URL也使用 `ImageUrlUtils.toFullUrl()` 转换

### 3. 修复数据库迁移脚本中的 localhost URL

**文件**:
- `backend/src/main/resources/db/migration/insert_preset_system_eras_from_resources.sql`
- `backend/src/main/resources/db/migration/insert_preset_system_characters_from_resources.sql`

**问题**: 插入脚本中包含硬编码的 localhost URL

**修复**: 将所有 `http://localhost:8081/api/images/files/` 开头的URL改为相对路径（如 `general/2025/12/xxx.png`）

### 4. 创建数据迁移脚本

**文件**: `backend/src/main/resources/db/migration/V20250103001__convert_localhost_image_urls_to_relative.sql`

**功能**: 将数据库中已有的 localhost URL 转换为相对路径

**涉及表**:
- `system_eras` (image_url)
- `system_characters` (avatar_url)
- `characters` (avatar_url, background_url)
- `eras` (image_url)
- `journal_entries` (image_url)
- `users` (avatar)
- `user_main_stories` (avatar_url, background_url)

## 部署步骤

### 1. 配置环境变量

在生产环境配置 `IMAGE_BASE_URL` 环境变量：

```bash
# 生产环境配置
export IMAGE_BASE_URL=https://heartsphere.cn/api/images

# 或者在 application.yml 中配置
app:
  image:
    storage:
      base-url: ${IMAGE_BASE_URL:}
```

### 2. 执行数据迁移

如果数据库中已有包含 localhost 的图片URL，需要执行迁移脚本：

```bash
# 方式1：使用 Flyway（推荐）
# 脚本会自动执行：V20250103001__convert_localhost_image_urls_to_relative.sql

# 方式2：手动执行SQL
mysql -u root -p heartsphere < backend/src/main/resources/db/migration/V20250103001__convert_localhost_image_urls_to_relative.sql
```

### 3. 重启后端服务

```bash
# 重启后端服务以应用代码更改
cd /opt/heartsphere/backend
./restart-backend.sh
```

## 验证

### 1. 检查环境变量

```bash
echo $IMAGE_BASE_URL
# 应该输出: https://heartsphere.cn/api/images
```

### 2. 检查图片URL生成

访问任意包含图片的API（如角色列表、时代列表），检查返回的图片URL：

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" https://heartsphere.cn/api/characters | jq '.[0].avatarUrl'
```

应该返回类似 `https://heartsphere.cn/api/images/files/character/2025/12/xxx.png` 的URL，而不是 `http://localhost:8081/...`

### 3. 检查数据库

```sql
-- 检查是否还有 localhost URL
SELECT COUNT(*) FROM system_eras WHERE image_url LIKE '%localhost%';
SELECT COUNT(*) FROM system_characters WHERE avatar_url LIKE '%localhost%';
SELECT COUNT(*) FROM characters WHERE avatar_url LIKE '%localhost%' OR background_url LIKE '%localhost%';
SELECT COUNT(*) FROM eras WHERE image_url LIKE '%localhost%';
SELECT COUNT(*) FROM journal_entries WHERE image_url LIKE '%localhost%';
SELECT COUNT(*) FROM users WHERE avatar LIKE '%localhost%';
SELECT COUNT(*) FROM user_main_stories WHERE avatar_url LIKE '%localhost%' OR background_url LIKE '%localhost%';
```

所有查询结果应该为 0。

## 工作原理

1. **数据库存储**: 只存储相对路径（如 `character/2025/12/xxx.png`）
2. **URL生成**: 后端在返回数据时，使用 `ImageUrlUtils.toFullUrl()` 将相对路径转换为完整URL
3. **URL优先级**:
   - 如果配置了 `IMAGE_BASE_URL` 环境变量，使用该值
   - 如果未配置，从当前HTTP请求中获取域名（scheme + host + port）
   - 如果都无法获取，返回相对路径（前端可以通过相对路径访问）

## 注意事项

1. **环境变量配置**: 生产环境必须配置 `IMAGE_BASE_URL` 环境变量，否则在后台任务等非HTTP上下文中无法生成正确的URL
2. **外部URL**: 外部URL（如 `https://picsum.photos/...`）不会被转换，保持原样
3. **相对路径**: 如果 baseUrl 无法获取，会返回相对路径（如 `/files/character/2025/12/xxx.png`），前端可以通过相对路径访问
4. **数据迁移**: 如果数据库中已有 localhost URL，需要执行迁移脚本进行转换

## 相关文件

- `backend/src/main/java/com/heartsphere/util/ImageUrlUtils.java` - 图片URL工具类
- `backend/src/main/java/com/heartsphere/utils/DTOMapper.java` - DTO转换器
- `backend/src/main/resources/db/migration/V20250103001__convert_localhost_image_urls_to_relative.sql` - 数据迁移脚本
- `backend/src/main/resources/application.yml` - 配置文件
