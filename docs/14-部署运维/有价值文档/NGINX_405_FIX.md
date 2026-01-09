# Nginx 405 错误修复指南

## 问题描述

登录时出现 405 Not Allowed 错误，错误信息显示：
```
405 Not Allowed
nginx/1.20.1
```

## 问题原因

405错误通常表示HTTP方法不被允许。可能的原因：

1. **nginx配置中 `proxy_pass` 路径不正确**
   - 如果 `proxy_pass` 后面没有 `/api/`，可能导致路径不匹配
   - 正确的配置应该是：`proxy_pass http://localhost:8081/api/;`

2. **nginx location 顺序问题**
   - 如果静态文件的 `location /` 在 API 的 `location /api/` 之前，可能会拦截API请求
   - 虽然nginx会自动匹配最长路径，但为了清晰，应该将API location放在前面

3. **nginx静态文件处理逻辑**
   - `try_files` 指令可能会尝试查找静态文件，导致POST请求被错误处理

## 修复方案

### 1. 修复 nginx 配置

确保 `proxy_pass` 路径正确：

```nginx
# 后端 API 代理（必须在静态文件location之前）
location /api/ {
    proxy_pass http://localhost:8081/api/;  # 注意：必须以 /api/ 结尾
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # 增加超时时间
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # 禁用缓冲，确保请求立即转发
    proxy_buffering off;
}
```

### 2. 确保 location 顺序

在nginx配置中，将API location放在静态文件location之前：

```nginx
server {
    # ... 其他配置 ...
    
    # 1. API代理（优先匹配）
    location /api/ {
        # ... API代理配置 ...
    }
    
    # 2. 静态文件（其次匹配）
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 3. 静态资源缓存（最后匹配）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. 应用修复

1. **更新nginx配置文件**
   ```bash
   # 编辑nginx配置文件
   sudo nano /etc/nginx/conf.d/heartsphere-frontend.conf
   # 或
   sudo nano /etc/nginx/sites-available/heartsphere-frontend
   ```

2. **测试nginx配置**
   ```bash
   sudo nginx -t
   ```

3. **重新加载nginx**
   ```bash
   sudo systemctl reload nginx
   # 或
   sudo systemctl restart nginx
   ```

4. **检查nginx日志**
   ```bash
   # 查看错误日志
   sudo tail -f /var/log/nginx/heartsphere-frontend-error.log
   
   # 查看访问日志
   sudo tail -f /var/log/nginx/heartsphere-frontend-access.log
   ```

### 4. 验证修复

1. **测试登录API**
   ```bash
   curl -X POST http://localhost/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test"}'
   ```

2. **检查响应**
   - 应该返回200状态码和JSON响应
   - 不应该返回405错误

## 已修复的文件

- `docs/部署/deploy-frontend.sh` - 修复了 `proxy_pass` 路径
- `deploy/deploy-frontend.sh` - 已包含正确的配置

## 注意事项

1. **nginx会自动转发所有HTTP方法**（GET, POST, PUT, DELETE等），不需要显式配置
2. **`proxy_pass` 路径必须以 `/api/` 结尾**，确保路径正确转发
3. **确保后端服务正在运行**，监听在配置的端口（默认8081）
4. **检查防火墙设置**，确保端口可访问

## 如果问题仍然存在

1. **检查后端服务状态**
   ```bash
   sudo systemctl status heartsphere-backend
   ```

2. **检查后端日志**
   ```bash
   tail -f /opt/heartsphere/backend/backend.log
   ```

3. **直接测试后端API**
   ```bash
   curl -X POST http://localhost:8081/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test"}'
   ```

4. **检查nginx错误日志**
   ```bash
   sudo tail -50 /var/log/nginx/error.log
   ```

## 相关文件

- `frontend/services/api/config.ts` - API基础URL配置
- `frontend/services/api/auth/auth.ts` - 登录API调用
- `backend/src/main/java/com/heartsphere/controller/AuthController.java` - 后端登录接口
