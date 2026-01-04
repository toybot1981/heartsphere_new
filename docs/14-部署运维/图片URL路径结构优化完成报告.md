# 图片URL路径结构优化完成报告

## 优化目标

修改图片URL路径结构：
1. **系统级图片**：`base_url + "/images/" + 类型名/年/月/图片名`（不使用 `/api/images`）
2. **用户自己的文件**：`base_url + "/images/" + userid/类型名/年/月/图片名`

## 修改内容

### 1. ImageUrlUtils

**文件**: `backend/src/main/java/com/heartsphere/util/ImageUrlUtils.java`

**修改**:
- `getBaseUrl()`: 将路径从 `/api/images` 改为 `/images`
- `toFullUrl()`: 移除 `/files/` 前缀，直接拼接路径
- `toRelativePath()`: 支持 `/images/` 前缀（兼容旧格式 `/api/images/files/`）

### 2. WebMvcConfig

**文件**: `backend/src/main/java/com/heartsphere/config/WebMvcConfig.java`

**修改**:
- 资源映射从 `/api/images/files/**` 改为 `/images/**`
- 映射到本地文件系统的 `uploads/images/` 目录

### 3. ImageStorageService

**文件**: `backend/src/main/java/com/heartsphere/service/ImageStorageService.java`

**修改**:
- `saveImage()`: 添加支持 `userId` 参数的重载方法
  - 系统资源：`saveImage(file, category)` - 路径格式：`category/year/month/filename`
  - 用户资源：`saveImage(file, category, userId)` - 路径格式：`userId/category/year/month/filename`
- `saveBase64Image()`: 添加支持 `userId` 参数的重载方法
  - 系统资源：`saveBase64Image(base64Data, category)` - 路径格式：`category/year/month/filename`
  - 用户资源：`saveBase64Image(base64Data, category, userId)` - 路径格式：`userId/category/year/month/filename`
- `saveToLocal()`: 支持 `userId` 参数，根据是否有 `userId` 生成不同的路径

### 4. ImageController

**文件**: `backend/src/main/java/com/heartsphere/controller/ImageController.java`

**修改**:
- 添加 `getCurrentUserId()` 方法，从认证信息中获取当前用户ID
- `uploadImage()`: 获取用户ID并传入 `saveImage(file, category, userId)`
- `uploadBase64Image()`: 获取用户ID并传入 `saveBase64Image(base64Data, category, userId)`

### 5. SystemResourceService

**文件**: `backend/src/main/java/com/heartsphere/admin/service/SystemResourceService.java`

**说明**:
- `createResource()`: 使用系统资源路径（不传 `userId`，使用 `saveImage(file, "resource_" + category)`）
- 路径格式：`resource_category/year/month/filename`

## 路径结构

### 系统资源

- **存储路径**：`uploads/images/{category}/{year}/{month}/{filename}`
- **访问URL**：`base_url/images/{category}/{year}/{month}/{filename}`
- **示例**：
  - 存储：`uploads/images/resource_era/2025/12/xxx.png`
  - 访问：`https://heartsphere.cn/images/resource_era/2025/12/xxx.png`

### 用户资源

- **存储路径**：`uploads/images/{userId}/{category}/{year}/{month}/{filename}`
- **访问URL**：`base_url/images/{userId}/{category}/{year}/{month}/{filename}`
- **示例**：
  - 存储：`uploads/images/114/character/2025/12/xxx.png`
  - 访问：`https://heartsphere.cn/images/114/character/2025/12/xxx.png`

## URL转换逻辑

### toFullUrl()

将相对路径转换为完整URL：
- 系统资源：`category/year/month/filename` → `base_url/images/category/year/month/filename`
- 用户资源：`userId/category/year/month/filename` → `base_url/images/userId/category/year/month/filename`

### toRelativePath()

将完整URL转换为相对路径：
- 支持新格式：`base_url/images/...` → `...`
- 兼容旧格式：`base_url/api/images/files/...` → `...`

## 兼容性

- **URL转换**：`toRelativePath()` 兼容旧格式 `/api/images/files/`，可以正确转换旧数据
- **路径映射**：只映射 `/images/**`，旧路径 `/api/images/files/**` 将无法访问
- **数据迁移**：旧数据需要迁移到新路径结构（通过数据迁移脚本）

## 后续工作

1. **数据迁移**：如果数据库中有旧路径格式的数据，需要迁移到新格式
2. **Nginx配置**：如果使用Nginx反向代理，需要更新配置，将 `/images/**` 映射到后端
3. **前端适配**：前端代码中如果有硬编码的 `/api/images/files/` 路径，需要更新为 `/images/`
4. **测试验证**：
   - 测试系统资源上传和访问
   - 测试用户资源上传和访问
   - 验证新旧格式的兼容性

## 相关文件

- `backend/src/main/java/com/heartsphere/util/ImageUrlUtils.java` - URL工具类
- `backend/src/main/java/com/heartsphere/config/WebMvcConfig.java` - 资源映射配置
- `backend/src/main/java/com/heartsphere/service/ImageStorageService.java` - 图片存储服务
- `backend/src/main/java/com/heartsphere/controller/ImageController.java` - 图片控制器
- `backend/src/main/java/com/heartsphere/admin/service/SystemResourceService.java` - 系统资源服务
