# 公司官网部署指南

## 概述

本文档说明如何部署泰安正心智能科技有限公司官网。

## 访问路径

- 开发环境: `http://localhost:3000/company`
- 生产环境: `https://yourdomain.com/company` 或 `https://www.yourdomain.com/company`

## 部署步骤

### 1. 前端构建

```bash
cd frontend
npm install
npm run build
```

构建产物将输出到 `frontend/dist/` 目录。

### 2. 配置Nginx（示例）

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 公司官网
    location /company {
        alias /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 其他路由
    location / {
        alias /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. 后端配置

确保后端API端点可访问：
- `POST /api/company/contact` - 联系表单提交

### 4. 环境变量

#### 前端
无需特殊环境变量，所有配置在代码中。

#### 后端
确保邮件服务配置正确（如果使用联系表单邮件通知）：
- `email_host`
- `email_port`
- `email_username`
- `email_password`
- `email_from`

### 5. 图片资源

1. 准备图片资源（参考 `frontend/public/company/images/README.md`）
2. 将图片放置到 `frontend/public/company/images/` 对应目录
3. 更新组件中的图片路径

### 6. SEO配置

更新 `frontend/components/company/SEOHead.tsx` 中的：
- `ogUrl`: 实际域名
- `ogImage`: Open Graph图片路径
- 结构化数据中的URL

## 验证清单

部署后验证以下内容：

- [ ] 所有页面可正常访问
- [ ] 导航菜单正常工作
- [ ] 响应式设计在不同设备上正常显示
- [ ] 联系表单可以正常提交
- [ ] 后端API正常响应
- [ ] 图片资源正常加载
- [ ] SEO标签正确设置
- [ ] 动画效果正常工作

## 性能优化

### 图片优化
- 压缩图片文件
- 使用WebP格式（如果支持）
- 实现响应式图片

### 代码优化
- 已实现代码分割和懒加载
- 使用CDN加速静态资源（如适用）

### 缓存策略
- 静态资源设置长期缓存
- HTML文件设置短期缓存

## 监控和维护

### 日志
- 前端错误日志（如Sentry）
- 后端API日志
- 联系表单提交日志

### 定期检查
- 检查联系表单提交是否正常
- 检查邮件通知是否正常
- 检查图片资源是否正常加载
- 检查SEO标签是否正确

## 故障排查

### 联系表单无法提交
1. 检查后端API是否正常运行
2. 检查CORS配置
3. 检查网络请求日志

### 图片无法加载
1. 检查图片路径是否正确
2. 检查图片文件是否存在
3. 检查服务器配置

### SEO标签不正确
1. 检查SEOHead组件配置
2. 检查页面路由是否正确
3. 使用SEO工具验证

## 更新内容

更新网站内容时：
1. 修改对应的组件文件
2. 重新构建前端
3. 部署更新后的文件
4. 清除CDN缓存（如适用）

## 备份

建议定期备份：
- 前端构建产物
- 图片资源
- 联系表单数据（如果存储到数据库）
