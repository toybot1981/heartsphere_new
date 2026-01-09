# 图片URL修复完成报告

## 修复时间
2026-01-08

## 问题描述
数据库中存储的图片URL是相对地址（如 `character/2025/12/xxx.png`），但在返回给前端时没有拼接 `IMAGE_BASE_URL`，导致前端无法正常显示图片。

## 修复内容

### 1. 修复 ImageUrlUtils.toFullUrl() 方法
**文件**: `backend/src/main/java/com/heartsphere/util/ImageUrlUtils.java`

**修改**:
- 确保 `toFullUrl()` 方法始终返回完整的URL
- 如果无法获取 baseUrl，使用默认值 `http://localhost:8081/images`
- 优先级：
  1. 配置的 `app.image.storage.base-url`
  2. 从当前HTTP请求中获取域名
  3. 从环境变量 `IMAGE_BASE_URL` 获取
  4. 使用默认值 `http://localhost:8081/images`

### 2. 修复 DTOMapper 的 ImageUrlUtils 注入问题
**文件**: `backend/src/main/java/com/heartsphere/utils/DTOMapper.java`

**修改**:
- 实现 `ApplicationContextAware` 接口，确保 `ImageUrlUtils` 正确初始化
- 在 `smartImageUrl()` 方法中添加 fallback 逻辑：
  - 如果 `imageUrlUtils` 为 null，尝试从 `ApplicationContext` 获取
  - 如果仍无法获取，使用默认值构造完整URL

**影响的方法**:
- `toCharacterDTO()` - 用户角色DTO转换
- `toEraDTO()` - 用户场景DTO转换
- `toJournalEntryDTO()` - 日记DTO转换
- `toUserDTO()` - 用户DTO转换

### 3. 修复编译依赖问题
**文件**: `backend/pom.xml`

**修改**:
- 添加 Selenium、Docker、支付宝/微信支付 SDK 的 provided scope 依赖（用于编译）
- 这些依赖只在 prod profile 中作为完整依赖加载

**文件**: 
- `backend/src/main/java/com/heartsphere/mentis/executor/computeruse/impl/SeleniumGuiAutomationExecutor.java`
- `backend/src/main/java/com/heartsphere/mentis/vm/impl/DockerVmProviderImpl.java`

**修改**:
- 添加 `@Profile("prod")` 注解，使这些类只在 prod profile 中加载

## 修复结果

### 修复前
- 返回相对路径：`character/2025/12/xxx.png`
- 前端无法正常显示图片

### 修复后
- 返回完整URL：`http://localhost:8081/images/character/2025/12/xxx.png`
- 前端可以正常显示图片

## 测试验证

### 测试场景
1. 系统资源图片URL（`SystemResourceDTO`）
2. 用户角色图片URL（`CharacterDTO` - avatarUrl, backgroundUrl）
3. 用户场景图片URL（`EraDTO` - imageUrl）
4. 日记图片URL（`JournalEntryDTO` - imageUrl）

### 预期结果
所有图片URL都应该是完整的URL格式，以 `http://` 或 `https://` 开头。

## 注意事项

1. **开发环境**: 默认使用 `http://localhost:8081/images`
2. **生产环境**: 建议配置环境变量 `IMAGE_BASE_URL` 或 `app.image.storage.base-url`
3. **外部URL**: 如果URL已经是绝对URL（以 `http://` 或 `https://` 开头），直接返回，不做处理
4. **Placeholder**: placeholder URL（`placeholder://...`）保持原样，不转换为完整URL

## 相关文件

- `backend/src/main/java/com/heartsphere/util/ImageUrlUtils.java`
- `backend/src/main/java/com/heartsphere/utils/DTOMapper.java`
- `backend/src/main/java/com/heartsphere/admin/service/SystemResourceService.java`
- `backend/src/main/java/com/heartsphere/admin/util/SystemDTOMapper.java`
- `backend/pom.xml`

## 后续建议

1. 在生产环境配置 `IMAGE_BASE_URL` 环境变量
2. 前端可以不再需要手动拼接 base URL
3. 考虑在 `ImageUrlUtils` 中添加缓存机制，提高性能

