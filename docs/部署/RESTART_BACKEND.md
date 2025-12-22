# 重启后端服务以启用图片上传功能

## 问题
404错误：`/api/images/upload` 端点找不到

## 原因
后端服务在添加 `ImageController` 之前启动，需要重启以加载新的Controller。

## 解决方案

### 方法1：停止并重启后端服务

1. **停止当前运行的后端服务**
   ```bash
   # 查找并停止运行在8081端口的进程
   lsof -ti:8081 | xargs kill -9
   ```

2. **重新编译并启动**
   ```bash
   cd backend
   mvn clean compile
   mvn spring-boot:run
   ```

### 方法2：如果使用IDE运行

1. 在IDE中停止当前运行的后端服务
2. 重新运行 `HeartSphereApplication` 主类

### 验证

重启后，可以通过以下方式验证：

1. **检查日志**：启动日志中应该能看到Spring加载了 `ImageController`
2. **测试端点**：访问 `http://localhost:8081/api/images/upload`（应该返回405 Method Not Allowed，而不是404）
3. **前端测试**：在前端尝试上传图片，应该能成功

## 预期结果

重启后，图片上传功能应该正常工作：
- 选择图片后自动上传
- 上传成功后返回服务器URL
- 图片保存在 `backend/uploads/images/era/` 目录下



