# CORS 错误修复说明

## 错误信息

```
Access to fetch at 'http://heartsphere.cn:8080/api/auth/invite-code-required' 
from origin 'http://localhost:8080' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
The 'Access-Control-Allow-Origin' header contains multiple values 
'http://localhost:8080, http://heartsphere.cn', but only one is allowed.
```

## 问题原因

1. **前端配置问题**：
   - `.env` 文件中设置了 `VITE_API_BASE_URL=http://heartsphere.cn:8080`
   - 导致前端直接请求生产服务器，而不是通过 Vite 代理

2. **后端 CORS 配置重复**：
   - `WebSecurityConfig` 中配置了全局 CORS（`addAllowedOriginPattern("*")`）
   - 同时很多 Controller 上还有 `@CrossOrigin(origins = "*")` 注解
   - 导致 Spring 返回了多个 `Access-Control-Allow-Origin` 头

## 解决方案

### 方案1：修改前端配置（已实施）✅

**修改 `.env` 文件**：
```bash
# 使用相对路径，通过 Vite 代理
VITE_API_BASE_URL=
```

**修改 `vite.config.ts` 代理配置**：
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8081',  // 本地后端地址
    changeOrigin: true,
  }
}
```

**优点**：
- ✅ 开发环境通过 Vite 代理，不会有 CORS 问题
- ✅ 不需要修改后端代码
- ✅ 更符合开发环境的最佳实践

### 方案2：修复后端 CORS 配置（可选）

如果必须直接请求后端（不使用代理），需要修复后端的 CORS 配置：

**选项A：移除所有 `@CrossOrigin` 注解，只使用全局配置**

```java
// 移除所有 Controller 上的 @CrossOrigin(origins = "*") 注解
// 只保留 WebSecurityConfig 中的全局配置
```

**选项B：修改全局 CORS 配置，避免重复**

```java
// 在 WebSecurityConfig 中，确保只设置一次 CORS
.cors(cors -> cors.configurationSource(corsConfigurationSource()))

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.addAllowedOriginPattern("*");
    configuration.addAllowedMethod("*");
    configuration.addAllowedHeader("*");
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

## 当前配置

### 前端配置（已修复）

**`.env`**：
```bash
VITE_API_BASE_URL=  # 使用相对路径
```

**`vite.config.ts`**：
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8081',
    changeOrigin: true,
  }
}
```

### 后端配置（需要修复）

**问题**：
- `WebSecurityConfig` 中有全局 CORS 配置
- 多个 Controller 上有 `@CrossOrigin(origins = "*")` 注解
- 导致返回多个 `Access-Control-Allow-Origin` 头

**建议**：
- 移除所有 Controller 上的 `@CrossOrigin` 注解
- 只使用 `WebSecurityConfig` 中的全局配置

## 验证

### 开发环境

1. **启动前端**：
   ```bash
   cd frontend
   npm run dev
   ```

2. **启动后端**：
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **访问前端**：
   - 打开 `http://localhost:3000`
   - 检查浏览器控制台，应该没有 CORS 错误
   - API 请求应该通过 Vite 代理转发到后端

### 生产环境

生产环境通过 nginx 反向代理，不会有 CORS 问题。

## 注意事项

1. **开发环境**：
   - ✅ 使用相对路径（`VITE_API_BASE_URL=`）
   - ✅ 通过 Vite 代理转发到后端
   - ✅ 不会有 CORS 问题

2. **生产环境**：
   - ✅ 使用相对路径（`VITE_API_BASE_URL=`）
   - ✅ 通过 nginx 反向代理转发到后端
   - ✅ 不会有 CORS 问题

3. **直接请求后端**（不推荐）：
   - ⚠️ 需要修复后端的 CORS 配置
   - ⚠️ 移除重复的 CORS 配置

## 相关文件

- `frontend/.env` - 前端环境变量配置（已修复）
- `frontend/vite.config.ts` - Vite 代理配置（已修复）
- `backend/src/main/java/com/heartsphere/config/WebSecurityConfig.java` - 后端 CORS 全局配置
- `backend/src/main/java/com/heartsphere/controller/**/*.java` - 多个 Controller 上有 `@CrossOrigin` 注解
