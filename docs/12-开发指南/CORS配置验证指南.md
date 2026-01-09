# CORS配置验证指南

**最后更新**: 2025-01-04  
**文档类型**: 测试验证指南

---

## 📋 验证清单

### ✅ 代码检查

- [x] 所有Controller上的@CrossOrigin注解已移除
- [x] 全局CORS配置在WebSecurityConfig中统一管理
- [x] application.yml中已添加CORS配置项
- [x] 无用的import语句已清理

### 🔍 配置验证

#### 1. 检查全局CORS配置

**文件**: `backend/src/main/java/com/heartsphere/config/WebSecurityConfig.java`

**验证点**:
- [ ] `corsConfigurationSource()` 方法存在
- [ ] 开发环境使用 `addAllowedOriginPattern("*")`
- [ ] 生产环境从配置读取允许的来源
- [ ] 所有必要的请求头已添加
- [ ] `setAllowCredentials(true)` 已配置
- [ ] `setMaxAge(3600L)` 已配置

#### 2. 检查配置文件

**文件**: `backend/src/main/resources/application.yml`

**验证点**:
- [ ] `app.cors.allowed-origins` 配置项存在
- [ ] 支持环境变量 `APP_CORS_ALLOWED_ORIGINS`
- [ ] 配置注释清晰

---

## 🧪 运行时验证

### 1. 启动后端服务

```bash
cd backend
mvn spring-boot:run
```

**检查项**:
- [ ] 服务正常启动，无错误日志
- [ ] 没有CORS相关的配置错误
- [ ] Spring Security配置加载成功

**预期日志**:
```
Started HeartSphereApplication in X.XXX seconds
```

### 2. 测试CORS预检请求（OPTIONS）

使用curl测试OPTIONS请求：

```bash
# 测试预检请求
curl -X OPTIONS http://localhost:8081/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

**预期响应头**:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Requested-With, Cache-Control, Pragma
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

### 3. 测试实际API请求

```bash
# 测试GET请求
curl -X GET http://localhost:8081/api/health \
  -H "Origin: http://localhost:3000" \
  -v

# 测试POST请求（带认证）
curl -X POST http://localhost:8081/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"username":"test","password":"test"}' \
  -v
```

**检查项**:
- [ ] 响应包含 `Access-Control-Allow-Origin` 头
- [ ] 响应包含 `Access-Control-Allow-Credentials: true`
- [ ] 没有CORS错误

### 4. 浏览器控制台检查

**步骤**:
1. 启动前端服务（如果可用）
2. 打开浏览器开发者工具（F12）
3. 切换到 Network 标签
4. 执行一个API请求
5. 检查请求和响应头

**检查项**:
- [ ] 请求头包含 `Origin`
- [ ] 响应头包含 `Access-Control-Allow-Origin`
- [ ] 控制台没有CORS错误（如：`Access to fetch at '...' from origin '...' has been blocked by CORS policy`）
- [ ] 预检请求（OPTIONS）返回200状态码

**常见CORS错误**:
- ❌ `Access-Control-Allow-Origin` 头缺失或值不匹配
- ❌ `Access-Control-Allow-Credentials` 头缺失
- ❌ 自定义请求头被拒绝
- ❌ 预检请求返回非200状态码

### 5. 测试不同环境配置

#### 开发环境测试

```bash
# 设置环境变量
export SPRING_PROFILES_ACTIVE=dev

# 启动服务
mvn spring-boot:run
```

**验证**:
- [ ] 允许所有来源（`*`）
- [ ] 所有请求头都被允许

#### 生产环境测试

```bash
# 设置环境变量
export SPRING_PROFILES_ACTIVE=prod
export APP_CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# 启动服务
mvn spring-boot:run
```

**验证**:
- [ ] 只允许配置的来源
- [ ] 未配置的来源被拒绝（返回CORS错误）

---

## 🔧 故障排查

### 问题1：CORS错误仍然出现

**可能原因**:
1. Controller上仍有@CrossOrigin注解
2. 全局CORS配置未生效
3. Spring Security配置冲突

**解决方法**:
```bash
# 检查是否还有@CrossOrigin注解
find backend/src/main/java -name "*.java" -exec grep -l "@CrossOrigin" {} \;

# 检查WebSecurityConfig是否正确配置
grep -A 20 "corsConfigurationSource" backend/src/main/java/com/heartsphere/config/WebSecurityConfig.java
```

### 问题2：预检请求失败

**可能原因**:
1. OPTIONS请求未被允许
2. Spring Security拦截了OPTIONS请求

**解决方法**:
检查 `SecurityFilterChain` 中是否允许OPTIONS请求：
```java
.requestMatchers(request -> "OPTIONS".equals(request.getMethod())).permitAll()
```

### 问题3：自定义请求头被拒绝

**可能原因**:
1. 请求头未在全局配置中添加

**解决方法**:
在 `WebSecurityConfig.corsConfigurationSource()` 中添加：
```java
config.addAllowedHeader("X-Custom-Header");
```

---

## 📝 验证报告模板

```
CORS配置验证报告
日期: YYYY-MM-DD
验证人: [姓名]

1. 代码检查
   - Controller注解清理: ✅/❌
   - 全局配置: ✅/❌
   - 配置文件: ✅/❌

2. 运行时验证
   - 服务启动: ✅/❌
   - OPTIONS请求: ✅/❌
   - API请求: ✅/❌
   - 浏览器测试: ✅/❌

3. 环境测试
   - 开发环境: ✅/❌
   - 生产环境: ✅/❌

4. 发现的问题
   - [问题描述]

5. 验证结论
   - [通过/不通过]
```

---

## 🔗 相关文档

- [CORS配置规范](../开发规范/心域开发指南.md#335-cors配置规范)
- [WebSecurityConfig源码](../../backend/src/main/java/com/heartsphere/config/WebSecurityConfig.java)
- [application.yml配置](../../backend/src/main/resources/application.yml)

---

**维护者**: HeartSphere开发团队  
**最后更新**: 2025-01-04
