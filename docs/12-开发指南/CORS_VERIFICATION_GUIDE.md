# CORS 配置验证指南

## 问题描述
`api/heartconnect/shared/worlds` API 的 CORS 预检请求失败，错误信息：
```
Access to fetch at 'http://heartsphere.cn:8080/api/heartconnect/shared/worlds' 
from origin 'http://heartsphere.cn' has been blocked by CORS policy: 
Request header field x-share-config-id is not allowed by Access-Control-Allow-Headers 
in preflight response.
```

## 修复内容

### 1. 后端修复
- **文件**: `backend/src/main/java/com/heartsphere/config/WebSecurityConfig.java`
- **修改**: 
  - 创建统一的 `corsConfigurationSource()` Bean
  - 明确列出所有允许的请求头（包括共享模式相关的自定义请求头）
  - 当使用 `setAllowCredentials(true)` 时，不能使用通配符 `*`，必须明确列出

- **文件**: `backend/src/main/java/com/heartsphere/heartconnect/controller/SharedController.java`
- **修改**: 删除 `@CrossOrigin` 注解，与其他控制器保持一致

### 2. 允许的自定义请求头
- `X-Shared-Mode` / `x-shared-mode`
- `X-Share-Config-Id` / `x-share-config-id`
- `X-Visitor-Id` / `x-visitor-id`

## 验证方法

### 方法 1: 使用测试脚本（推荐）

```bash
# 基本测试（只测试 OPTIONS 预检请求）
./scripts/test-cors.sh http://heartsphere.cn:8080

# 完整测试（包括实际 GET 请求）
./scripts/test-cors.sh http://heartsphere.cn:8080 tongyexin 123456
```

### 方法 2: 使用 curl 命令

#### 2.1 测试 OPTIONS 预检请求
```bash
curl -i -X OPTIONS "http://heartsphere.cn:8080/api/heartconnect/shared/worlds" \
  -H "Origin: http://heartsphere.cn" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: x-share-config-id,x-shared-mode,x-visitor-id,authorization,content-type"
```

**预期响应头**:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://heartsphere.cn
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, ...
Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Shared-Mode, X-Share-Config-Id, X-Visitor-Id, x-shared-mode, x-share-config-id, x-visitor-id
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

#### 2.2 测试实际 GET 请求
```bash
# 先登录获取 token
TOKEN=$(curl -s -X POST "http://heartsphere.cn:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"tongyexin","password":"123456"}' | \
  grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 测试 GET 请求
curl -i -X GET "http://heartsphere.cn:8080/api/heartconnect/shared/worlds" \
  -H "Origin: http://heartsphere.cn" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "X-Share-Config-Id: 1" \
  -H "X-Shared-Mode: true" \
  -H "X-Visitor-Id: 1"
```

### 方法 3: 浏览器开发者工具验证

1. **打开浏览器开发者工具**（F12）
2. **切换到 Network（网络）标签**
3. **清除网络日志**
4. **访问共享心域功能**（触发 API 请求）
5. **检查 OPTIONS 预检请求**：
   - 找到 `worlds` 的 OPTIONS 请求
   - 查看 Response Headers
   - 确认包含以下响应头：
     - `Access-Control-Allow-Origin: http://heartsphere.cn`
     - `Access-Control-Allow-Headers: ... x-share-config-id ...`
     - `Access-Control-Allow-Credentials: true`
6. **检查实际 GET 请求**：
   - 确认没有 CORS 错误
   - 状态码应该是 200、403 或 401（不是 CORS 错误）

### 方法 4: 检查后端日志

查看后端日志，确认：
1. OPTIONS 请求被正确处理
2. 没有 CORS 相关的错误
3. SharedModeInterceptor 正常工作

```bash
# 查看后端日志
tail -f backend.log | grep -i "cors\|options\|shared"
```

## 验证检查清单

- [ ] OPTIONS 预检请求返回 200 状态码
- [ ] `Access-Control-Allow-Origin` 响应头存在
- [ ] `Access-Control-Allow-Headers` 响应头包含 `x-share-config-id`
- [ ] `Access-Control-Allow-Headers` 响应头包含 `x-shared-mode`
- [ ] `Access-Control-Allow-Headers` 响应头包含 `x-visitor-id`
- [ ] `Access-Control-Allow-Credentials: true` 存在
- [ ] 实际 GET 请求没有 CORS 错误
- [ ] 浏览器控制台没有 CORS 相关错误
- [ ] 前端功能正常工作

## 重要提示

### ⚠️ 必须重启后端服务
修改 CORS 配置后，**必须重启后端服务**才能使配置生效。

```bash
# 重启后端服务
cd /Users/admin/Workspace/heartsphere_new/backend
# 停止旧服务
pkill -f "spring-boot:run" || pkill -f "HeartSphereApplication"
# 启动新服务
mvn spring-boot:run -DskipTests > ../backend.log 2>&1 &
```

### ⚠️ 检查配置是否生效
如果测试脚本显示响应头仍然是 `Content-Type, Authorization`，说明：
1. 后端服务可能没有重启
2. 或者配置没有正确编译

**解决方法**：
```bash
# 1. 重新编译
cd backend
mvn clean compile -DskipTests

# 2. 重启服务
# 3. 再次测试
```

## 常见问题

### Q1: 仍然看到 CORS 错误
**A**: 确保：
1. 后端服务已重启
2. 配置已正确编译
3. 检查浏览器缓存（尝试硬刷新 Ctrl+Shift+R）

### Q2: OPTIONS 请求返回 404
**A**: 检查：
1. Spring Security 配置是否正确允许 OPTIONS 请求
2. 路径映射是否正确

### Q3: 预检请求成功，但实际请求失败
**A**: 检查：
1. 实际请求的响应头是否包含 CORS 头
2. 请求头是否与预检请求中声明的完全一致

### Q4: 测试脚本显示响应头只有 Content-Type, Authorization
**A**: 这说明后端的 CORS 配置没有生效，可能原因：
1. 后端服务没有重启
2. 配置没有正确编译
3. 有其他配置覆盖了 CORS 设置

**解决步骤**：
1. 检查后端服务是否运行：`ps aux | grep HeartSphereApplication`
2. 重新编译：`cd backend && mvn clean compile -DskipTests`
3. 重启服务
4. 再次测试

## 相关文件

- `backend/src/main/java/com/heartsphere/config/WebSecurityConfig.java` - CORS 全局配置
- `backend/src/main/java/com/heartsphere/heartconnect/controller/SharedController.java` - API 控制器
- `scripts/test-cors.sh` - CORS 验证脚本
