# system_resources 图片URL优化完成报告

## 优化目标

确保 `system_resources` 表中存储的图片URL都是相对路径，而不是绝对路径（如 `http://localhost:8081/...` 或 `https://heartsphere.cn/...`）。

## 问题分析

### 当前实现状态

1. **图片上传（createResource）**：
   - ✅ `ImageStorageService.saveImage()` 返回相对路径（格式：`resource_category/year/month/filename`）
   - ✅ 直接保存相对路径到数据库

2. **图片展示（toDTO）**：
   - ✅ 使用 `ImageUrlUtils.toFullUrl()` 将相对路径转换为完整URL返回给前端
   - ✅ 生产环境和开发环境会根据请求域名自动拼接

3. **资源更新（updateResource）**：
   - ❌ **问题**：如果传入完整URL，直接保存到数据库，未转换为相对路径
   - ✅ **已修复**：使用 `ImageUrlUtils.toRelativePath()` 转换

## 修复内容

### 1. SystemResourceService.updateResource()

**文件**: `backend/src/main/java/com/heartsphere/admin/service/SystemResourceService.java`

**修改**:
- 在更新资源URL时，使用 `imageUrlUtils.toRelativePath()` 将完整URL转换为相对路径

```java
// 将完整URL转换为相对路径存储
if (url != null && !url.isEmpty()) {
    resource.setUrl(imageUrlUtils.toRelativePath(url));
}
```

### 2. 数据迁移脚本

**文件**: `backend/src/main/resources/db/migration/V20250103002__convert_system_resources_localhost_urls_to_relative.sql`

**功能**: 将数据库中已有的 localhost URL 转换为相对路径

```sql
UPDATE system_resources
SET url = REPLACE(
    REPLACE(
        REPLACE(url, 'http://localhost:8081/api/images/files/', ''),
        'https://localhost:8081/api/images/files/', ''
    ),
    'http://localhost:8080/api/images/files/', ''
)
WHERE url LIKE '%localhost%api/images/files/%';
```

### 3. 检查脚本

**文件**: `scripts/check-system-resources-urls.sh`

**功能**: 检查 `system_resources` 表中URL的存储格式，统计绝对路径、相对路径、localhost URL的数量

## 工作流程

### 上传流程

1. 管理员上传图片 → `AdminResourceController.createResource()`
2. 调用 `SystemResourceService.createResource()`
3. `ImageStorageService.saveImage()` 保存文件，返回相对路径（如：`resource_era/2025/12/xxx.png`）
4. 保存相对路径到数据库 ✅

### 查询流程

1. 前端请求资源列表 → `AdminResourceController.getAllResources()`
2. 调用 `SystemResourceService.getAllResources()`
3. `toDTO()` 方法使用 `ImageUrlUtils.toFullUrl()` 转换相对路径为完整URL
4. 返回完整URL给前端（生产环境：`https://heartsphere.cn/api/images/files/...`，开发环境：`http://localhost:8081/api/images/files/...`）✅

### 更新流程

1. 管理员更新资源URL → `AdminResourceController.updateResource()`
2. 调用 `SystemResourceService.updateResource()`
3. 使用 `ImageUrlUtils.toRelativePath()` 将完整URL转换为相对路径 ✅
4. 保存相对路径到数据库 ✅

## ImageUrlUtils 方法说明

### toRelativePath()

将绝对URL转换为相对路径：
- 如果已经是相对路径，直接返回
- 如果是外部URL（不同域名），保持原样
- 如果是同域名的完整URL，提取相对路径（去除 `/api/images/files/` 前缀）

示例：
- `https://heartsphere.cn/api/images/files/resource_era/2025/12/xxx.png` → `resource_era/2025/12/xxx.png`
- `resource_era/2025/12/xxx.png` → `resource_era/2025/12/xxx.png`（已经是相对路径）
- `https://picsum.photos/300/300` → `https://picsum.photos/300/300`（外部URL，保持原样）

### toFullUrl()

将相对路径转换为完整URL：
- 如果配置了 `IMAGE_BASE_URL` 环境变量，使用该值
- 如果未配置，从当前HTTP请求中获取域名（scheme + host + port）
- 如果无法获取，返回相对路径（前端可以通过相对路径访问）

示例：
- `resource_era/2025/12/xxx.png` → `https://heartsphere.cn/api/images/files/resource_era/2025/12/xxx.png`（生产环境）
- `resource_era/2025/12/xxx.png` → `http://localhost:8081/api/images/files/resource_era/2025/12/xxx.png`（开发环境）

## 部署步骤

### 1. 执行数据迁移

如果数据库中已有包含 localhost 的URL，需要执行迁移脚本：

```bash
# 方式1：使用 Flyway（推荐）
# 脚本会自动执行：V20250103002__convert_system_resources_localhost_urls_to_relative.sql

# 方式2：手动执行SQL
mysql -u root -p heartsphere < backend/src/main/resources/db/migration/V20250103002__convert_system_resources_localhost_urls_to_relative.sql
```

### 2. 配置环境变量（生产环境推荐）

```bash
export IMAGE_BASE_URL=https://heartsphere.cn/api/images
```

### 3. 重启后端服务

```bash
cd /opt/heartsphere/backend
./restart-backend.sh
```

## 验证步骤

### 1. 检查数据库

使用检查脚本验证：

```bash
./scripts/check-system-resources-urls.sh
```

确认：
- `localhost_count` 为 0
- `relative_path_count` 等于 `total_count`（减去空值）

### 2. 测试上传

1. 上传新资源 → 数据库中应该是相对路径
2. 查询资源列表 → 返回完整URL（通过 toDTO 转换）
3. 更新资源URL → 如果传入完整URL，应转换为相对路径保存

### 3. 检查日志

检查后端日志，确认：
- 资源上传返回相对路径
- 资源更新时URL被转换为相对路径
- 资源查询时相对路径被转换为完整URL

## 相关文件

- `backend/src/main/java/com/heartsphere/admin/service/SystemResourceService.java` - 系统资源服务
- `backend/src/main/java/com/heartsphere/admin/controller/AdminResourceController.java` - 系统资源控制器
- `backend/src/main/java/com/heartsphere/util/ImageUrlUtils.java` - 图片URL工具类
- `backend/src/main/resources/db/migration/V20250103002__convert_system_resources_localhost_urls_to_relative.sql` - 数据迁移脚本
- `scripts/check-system-resources-urls.sh` - 检查脚本

## 总结

✅ **已完成**：
- 修复了 `SystemResourceService.updateResource()` 中的URL保存逻辑
- 创建了数据迁移脚本，清理数据库中的旧数据
- 创建了检查脚本，验证数据库状态
- 上传和展示逻辑已经正确（使用相对路径存储，查询时转换为完整URL）

📝 **后续工作**：
- 执行数据迁移脚本，清理数据库中的旧数据
- 在生产环境验证资源上传、查询、更新流程
- 定期检查数据库，确保没有新的完整URL被保存
