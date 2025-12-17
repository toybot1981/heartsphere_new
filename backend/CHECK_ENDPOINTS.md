# 检查端点是否注册

后端服务需要重启才能加载新的Controller。

## 验证步骤

1. **停止当前服务**
   ```bash
   kill $(lsof -ti:8081)
   ```

2. **重新编译**
   ```bash
   cd backend
   mvn clean compile
   ```

3. **启动服务并查看日志**
   ```bash
   mvn spring-boot:run
   ```

4. **在启动日志中查找**
   - 应该能看到 `ImageController` 相关的日志
   - 或者查看所有映射的端点

5. **测试端点**
   ```bash
   curl -X POST http://localhost:8081/api/images/upload -F "file=@test.png" -F "category=test"
   ```

## 如果还是404

检查：
1. ImageController 是否在正确的包路径下（com.heartsphere.controller）
2. @RestController 和 @RequestMapping 注解是否正确
3. Spring Boot 是否扫描到了这个包



