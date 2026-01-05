# CORS 自定义请求头问题修复

## 错误信息

```
Access to fetch at 'http://heartsphere.cn:8080/api/heartconnect/shared/worlds' 
from origin 'http://heartsphere.cn' has been blocked by CORS policy: 
Request header field x-share-config-id is not allowed by 
Access-Control-Allow-Headers in preflight response.
```

## 问题原因

`SharedController` 使用了 `@CrossOrigin(origins = "*")` 注解，但**没有指定 `allowedHeaders`**。

`@CrossOrigin` 注解的默认行为：
- 允许所有来源（`origins = "*"`）
- 允许标准 HTTP 方法（GET, POST, PUT, DELETE, OPTIONS）
- **但只允许标准请求头**（如 `Content-Type`, `Authorization` 等）

自定义请求头（如 `X-Share-Config-Id`, `X-Shared-Mode`）不在标准请求头列表中，所以被 CORS 策略拒绝了。

## 解决方案

在 `@CrossOrigin` 注解中添加 `allowedHeaders = "*"` 参数：

```java
@CrossOrigin(origins = "*", allowedHeaders = "*")
```

这样会允许所有请求头，包括自定义请求头。

## 修复位置

**文件**：`backend/src/main/java/com/heartsphere/heartconnect/controller/SharedController.java`

**修改前**：
```java
@CrossOrigin(origins = "*")
public class SharedController {
```

**修改后**：
```java
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class SharedController {
```

## 为什么其他接口能访问？

其他接口可能：
1. **没有使用自定义请求头**：只使用标准请求头（如 `Authorization`）
2. **使用了全局 CORS 配置**：`WebSecurityConfig` 中的全局 CORS 配置允许所有请求头（`config.addAllowedHeader("*")`）
3. **没有 `@CrossOrigin` 注解覆盖**：如果没有 `@CrossOrigin` 注解，会使用全局 CORS 配置

## 相关代码

### 自定义请求头

`SharedModeInterceptor` 使用了以下自定义请求头：
- `X-Shared-Mode`：标识是否为共享模式
- `X-Share-Config-Id`：共享配置 ID

```java
private static final String SHARED_MODE_HEADER = "X-Shared-Mode";
private static final String SHARE_CONFIG_ID_HEADER = "X-Share-Config-Id";
```

### 全局 CORS 配置

`WebSecurityConfig` 中的全局 CORS 配置：

```java
config.addAllowedHeader("*");  // 允许所有请求头
```

但是 `@CrossOrigin` 注解会覆盖全局配置，所以需要在注解中明确指定。

## 验证

修复后，重新编译并重启后端服务：

```bash
cd backend
mvn clean compile
mvn spring-boot:run
```

然后测试共享模式的 API 请求，应该不再有 CORS 错误。

## 相关文件

- `backend/src/main/java/com/heartsphere/heartconnect/controller/SharedController.java` - 已修复
- `backend/src/main/java/com/heartsphere/heartconnect/interceptor/SharedModeInterceptor.java` - 使用自定义请求头
- `backend/src/main/java/com/heartsphere/config/WebSecurityConfig.java` - 全局 CORS 配置
