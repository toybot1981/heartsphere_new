# 修改密码错误提示优化

## 修复的问题

### ✅ 旧密码错误时显示异常而不是友好提示
**问题**：当用户输入错误的旧密码时，系统会抛出异常，而不是以友好的方式提示具体的错误信息

**修复**：
1. 后端使用 `BusinessException` 替代 `RuntimeException`，确保错误消息能够正确传递
2. 通过全局异常处理器统一处理，返回标准的 `ApiResponse` 格式
3. 前端优化错误处理，确保能够正确显示错误消息

## 修改的文件

### 1. backend/src/main/java/com/heartsphere/admin/service/SystemAdminService.java
- 将所有 `RuntimeException` 改为 `BusinessException`
- 旧密码错误时抛出：`BusinessException(400, "旧密码错误，请检查后重试")`
- 其他错误也使用 `BusinessException` 并提供友好的错误消息

### 2. backend/src/main/java/com/heartsphere/admin/controller/SystemAdminController.java
- 添加 `BusinessException` 导入
- 更新异常处理逻辑，让 `BusinessException` 由全局异常处理器统一处理
- 确保错误消息能够正确传递到前端

### 3. frontend/admin/components/AdminsManagement.tsx
- 优化错误处理逻辑
- 确保能够正确提取和显示错误消息
- 直接显示后端返回的错误消息，而不是添加额外的"修改密码失败: "前缀

## 错误消息优化

### 之前
- 使用 `RuntimeException`，错误消息可能无法正确传递
- 前端显示：`修改密码失败: 未知错误` 或异常堆栈

### 之后
- 使用 `BusinessException`，错误消息明确且友好
- 旧密码错误：`旧密码错误，请检查后重试`
- 其他错误也有明确的提示信息
- 前端直接显示后端返回的错误消息

## 错误处理流程

1. **Service 层**：
   - 验证旧密码失败时抛出 `BusinessException(400, "旧密码错误，请检查后重试")`
   - 其他验证失败也抛出相应的 `BusinessException`

2. **Controller 层**：
   - 捕获 `BusinessException` 并重新抛出
   - 让全局异常处理器统一处理

3. **全局异常处理器**：
   - 捕获 `BusinessException`
   - 返回标准的 `ApiResponse` 格式：
     ```json
     {
       "code": 400,
       "message": "旧密码错误，请检查后重试",
       "data": null,
       "timestamp": "2025-01-01T10:00:00"
     }
     ```

4. **前端 request 函数**：
   - 解析错误响应
   - 提取 `errorJson.message` 字段
   - 抛出 `Error` 对象，message 为错误消息

5. **前端组件**：
   - 捕获错误
   - 直接显示 `error.message`，即后端返回的错误消息

## 测试建议

1. **测试旧密码错误**：
   - 在修改密码页面输入错误的旧密码
   - 应该显示：`旧密码错误，请检查后重试`
   - 不应该显示异常堆栈或"未知错误"

2. **测试其他错误情况**：
   - 旧密码为空：应该显示 `旧密码不能为空`
   - 新密码为空：应该显示 `新密码不能为空`
   - 管理员不存在：应该显示 `管理员不存在`

3. **测试成功情况**：
   - 输入正确的旧密码和新密码
   - 应该显示：`密码修改成功`

## 技术细节

### BusinessException vs RuntimeException

**BusinessException**：
- 继承自 `RuntimeException`
- 包含 `code` 字段，可以指定HTTP状态码
- 会被 `GlobalExceptionHandler` 统一处理
- 返回标准的 `ApiResponse` 格式

**RuntimeException**：
- 需要手动处理
- 错误消息可能无法正确传递
- 返回格式不统一

### 全局异常处理器

`GlobalExceptionHandler` 会捕获所有 `BusinessException` 并返回：
```json
{
  "code": 400,
  "message": "错误消息",
  "data": null,
  "timestamp": "2025-01-01T10:00:00"
}
```

### 前端错误解析

`request` 函数会：
1. 检查响应状态码
2. 解析错误响应JSON
3. 提取 `message` 字段
4. 抛出 `Error` 对象，message 为错误消息

## 注意事项

1. 所有业务异常都应该使用 `BusinessException`，而不是 `RuntimeException`
2. 错误消息应该清晰、友好，帮助用户理解问题
3. 前端应该直接显示后端返回的错误消息，而不是添加额外的前缀
