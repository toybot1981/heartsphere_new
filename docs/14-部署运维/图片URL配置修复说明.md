# 图片URL配置修复说明

## 问题描述

生产环境报错：
```
Access to image at 'http://localhost:8081/api/images/character/user/2025/12/xxx.png' 
from origin 'http://heartsphere.cn' has been blocked by CORS policy: 
The request client is not a secure context and the resource is in more-private address space `loopback`
```

**原因**：
- 后端生成的图片URL使用了 `localhost:8081` 而不是生产域名
- 前端访问 `http://heartsphere.cn`，但图片URL是 `http://localhost:8081`，导致混合内容错误

## 解决方案

### 方案1：配置环境变量（推荐）

在生产环境配置 `IMAGE_BASE_URL` 环境变量：

```bash
# 编辑 /opt/heartsphere/.env 文件
IMAGE_BASE_URL=http://heartsphere.cn/images
```

**注意**：
- 格式：`http://heartsphere.cn/images`（不需要 `/api` 前缀）
- 如果使用HTTPS，改为：`https://heartsphere.cn/images`
- 配置后需要重启后端服务

### 方案2：确保Nginx正确设置Header

确保Nginx配置中设置了正确的代理header：

```nginx
location /api/ {
    proxy_pass http://localhost:8081;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;  # 重要：设置实际域名
    proxy_set_header X-Forwarded-Port $server_port;
}
```

后端代码已更新，会优先使用 `X-Forwarded-Host` header。

### 方案3：同时配置（最稳妥）

同时配置环境变量和Nginx header，确保在任何情况下都能正确获取域名。

## 配置步骤

### 1. 配置环境变量

```bash
# 编辑环境变量文件
sudo nano /opt/heartsphere/.env

# 添加或修改以下行
IMAGE_BASE_URL=http://heartsphere.cn/images

# 保存后重启后端服务
sudo systemctl restart heartsphere-backend
# 或
cd /opt/heartsphere/backend
./restart-backend.sh
```

### 2. 检查Nginx配置

```bash
# 检查nginx配置
sudo nginx -t

# 查看当前配置
sudo cat /etc/nginx/conf.d/heartsphere.conf | grep -A 10 "location /api/"

# 确保包含以下header设置：
# proxy_set_header X-Forwarded-Host $host;
```

### 3. 验证配置

重启后端后，检查日志：

```bash
# 查看后端日志
tail -f /opt/heartsphere/backend.log | grep -i "baseUrl\|IMAGE_BASE_URL"

# 应该看到类似信息：
# 使用配置的baseUrl: http://heartsphere.cn/images
```

### 4. 测试图片URL

访问一个包含图片的API，检查返回的图片URL：

```bash
# 测试API
curl http://heartsphere.cn/api/characters/1

# 检查返回的JSON中，图片URL应该是：
# "avatarUrl": "http://heartsphere.cn/images/character/2025/12/xxx.png"
# 而不是：
# "avatarUrl": "http://localhost:8081/api/images/character/2025/12/xxx.png"
```

## 代码变更说明

### 后端代码更新

`backend/src/main/java/com/heartsphere/util/ImageUrlUtils.java` 已更新：

1. **优先使用 X-Forwarded-Host**：从nginx代理header中获取实际域名
2. **优先使用 X-Forwarded-Proto**：从nginx代理header中获取协议（http/https）
3. **检测localhost**：如果检测到localhost，自动尝试从环境变量获取
4. **端口处理**：正确处理X-Forwarded-Host中可能包含的端口

### 配置优先级

1. **环境变量 `IMAGE_BASE_URL`**（最高优先级）
2. **X-Forwarded-Host header**（nginx代理时）
3. **请求中的Host header**
4. **request.getServerName()**（最后备选）

## 常见问题

### Q1: 为什么图片URL还是localhost？

**A**: 检查以下几点：
1. 是否配置了 `IMAGE_BASE_URL` 环境变量？
2. Nginx是否设置了 `X-Forwarded-Host` header？
3. 后端服务是否重启？
4. 检查后端日志，看是否有错误信息

### Q2: 应该使用 `/images` 还是 `/api/images`？

**A**: 根据代码，应该使用 `/images`（不需要 `/api` 前缀）：
- 配置：`IMAGE_BASE_URL=http://heartsphere.cn/images`
- 访问路径：`http://heartsphere.cn/images/character/2025/12/xxx.png`

### Q3: HTTPS环境如何配置？

**A**: 将协议改为 `https`：
```bash
IMAGE_BASE_URL=https://heartsphere.cn/images
```

### Q4: 开发环境需要配置吗？

**A**: 开发环境可以不配置，后端会自动使用 `http://localhost:8081/images`。

## 相关文件

- `backend/src/main/java/com/heartsphere/util/ImageUrlUtils.java` - 图片URL工具类
- `backend/src/main/resources/application.yml` - 应用配置
- `deploy/env.template` - 环境变量模板
- `deploy/nginx-heartsphere.conf.example` - Nginx配置示例

## 总结

1. **生产环境必须配置** `IMAGE_BASE_URL` 环境变量
2. **确保Nginx设置** `X-Forwarded-Host` header
3. **重启后端服务**使配置生效
4. **验证图片URL**是否正确生成
