# CORS 配置检查和修复建议

## 检查结果

### 已修复的文件
- ✅ `backend/src/main/java/com/heartsphere/heartconnect/controller/SharedController.java`
  - 已添加 `allowedHeaders = "*"`

### 其他文件（共 59 个 Controller）

所有其他 Controller 都使用了 `@CrossOrigin(origins = "*")` 但**没有指定 `allowedHeaders`**。

## 问题分析

### 当前情况

1. **全局 CORS 配置**（`WebSecurityConfig`）：
   ```java
   config.addAllowedHeader("*");  // 允许所有请求头
   ```

2. **Controller 级别的 `@CrossOrigin` 注解**：
   - 会**覆盖**全局配置
   - 如果不指定 `allowedHeaders`，只允许标准请求头

### 潜在风险

如果前端对任何 Controller 发送带有自定义请求头的请求，都会遇到 CORS 错误。

### 实际影响

- **SharedController**：已修复（使用了 `X-Share-Config-Id` 和 `X-Shared-Mode`）
- **其他 Controller**：目前可能没有问题，因为：
  1. 可能没有使用自定义请求头
  2. 使用标准请求头（如 `Authorization`, `Content-Type`）
  3. 但未来如果添加自定义请求头会出问题

## 修复建议

### 方案1：统一修复所有 Controller（推荐）

为了保持一致性，并避免将来出现问题，建议所有 Controller 都添加 `allowedHeaders = "*"`：

```java
@CrossOrigin(origins = "*", allowedHeaders = "*")
```

**优点**：
- 统一配置，避免混淆
- 未来使用自定义请求头不会出问题
- 与全局配置保持一致

**缺点**：
- 需要修改大量文件（59 个 Controller）
- 工作量较大

### 方案2：移除所有 `@CrossOrigin` 注解（推荐）

由于全局 CORS 配置已经允许所有请求头，可以移除所有 Controller 上的 `@CrossOrigin` 注解，统一使用全局配置。

**优点**：
- 简化配置
- 统一管理 CORS 策略
- 避免注解覆盖全局配置的问题

**缺点**：
- 需要修改大量文件
- 可能某些 Controller 需要特殊配置

### 方案3：按需修复（保守）

只修复实际使用自定义请求头的 Controller。

**优点**：
- 工作量最小
- 只修改必要的文件

**缺点**：
- 未来添加自定义请求头时容易遗漏
- 配置不一致

## 推荐的修复方案

### 推荐：方案1（统一添加 allowedHeaders）

理由：
1. 保持配置一致性
2. 避免未来出现问题
3. 与全局配置意图一致（允许所有请求头）
4. 修改相对简单（只需添加参数）

### 修复脚本

可以使用以下脚本批量修复（需要手动验证）：

```bash
# 查找所有需要修复的文件
find backend/src/main/java -name "*.java" -exec grep -l "@CrossOrigin(origins = \"*\")" {} \; | grep -v SharedController

# 批量替换（谨慎使用，建议先备份）
find backend/src/main/java -name "*.java" -exec sed -i 's/@CrossOrigin(origins = "\*")/@CrossOrigin(origins = "*", allowedHeaders = "*")/g' {} \;
```

## 需要修复的文件列表

以下是所有需要修复的文件（共 59 个）：

1. `backend/src/main/java/com/heartsphere/admin/controller/AdminGraphRecommendationController.java`
2. `backend/src/main/java/com/heartsphere/admin/controller/AdminEntityRelationController.java`
3. `backend/src/main/java/com/heartsphere/admin/controller/AdminEntityController.java`
4. `backend/src/main/java/com/heartsphere/admin/controller/SystemAdminController.java`
5. `backend/src/main/java/com/heartsphere/skill/controller/SkillController.java`
6. `backend/src/main/java/com/heartsphere/skill/controller/CharacterSkillController.java`
7. `backend/src/main/java/com/heartsphere/skill/controller/SkillExecutionController.java`
8. `backend/src/main/java/com/heartsphere/admin/controller/AdminUserController.java`
9. `backend/src/main/java/com/heartsphere/controller/RecycleBinController.java`
10. `backend/src/main/java/com/heartsphere/admin/controller/ExecutionLogController.java`
...（共 59 个文件）

## 验证

修复后，需要：
1. 编译后端代码：`mvn clean compile`
2. 运行测试：`mvn test`
3. 测试前端请求，确保没有 CORS 错误

## 相关文件

- `backend/src/main/java/com/heartsphere/config/WebSecurityConfig.java` - 全局 CORS 配置
- `backend/src/main/java/com/heartsphere/heartconnect/controller/SharedController.java` - 已修复的示例
