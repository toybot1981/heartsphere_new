# Mobile版本独立路径访问指南

## 概述

Mobile版本现在有独立的访问路径，参照管理端的实现方式，可以通过独立URL直接访问。

## 访问路径

### 开发环境
```
http://localhost:3000/mobile.html
```

### 生产环境
```
https://your-domain.com/mobile.html
```

## 文件结构

### 1. mobile.html
- **位置**：`frontend/mobile.html`
- **作用**：Mobile版本的独立HTML入口文件
- **内容**：包含移动端优化的viewport设置和样式

### 2. mobile.tsx
- **位置**：`frontend/mobile.tsx`
- **作用**：Mobile版本的React入口文件
- **内容**：初始化MobileApp组件，包裹GameStateProvider

### 3. vite.config.ts
- **配置**：在build.rollupOptions.input中添加了`mobile`入口
- **作用**：确保构建时生成独立的mobile.html文件

## 与PC版本的区别

### PC版本（index.html）
- **路径**：`/` 或 `/index.html`
- **入口**：`index.tsx`
- **组件**：`App.tsx` → `AppContent`
- **功能**：完整的PC端功能

### Mobile版本（mobile.html）
- **路径**：`/mobile.html`
- **入口**：`mobile.tsx`
- **组件**：`MobileApp`
- **功能**：移动端优化的功能

### 管理端（admin.html）
- **路径**：`/admin.html`
- **入口**：`admin.tsx`
- **组件**：`AdminScreen`
- **功能**：系统管理功能

## 路径检测逻辑

在`App.tsx`中添加了路径检测，如果访问`/mobile`路径，会自动重定向到`/mobile.html`：

```typescript
const pathname = window.location.pathname;
const isMobilePath = pathname.includes('/mobile') || pathname.includes('mobile.html');
if (isMobilePath) {
  if (!pathname.includes('mobile.html')) {
    window.location.href = '/mobile.html';
    return null;
  }
}
```

## 切换功能

### 从Mobile切换到PC
在MobileApp中，点击"切换到PC端"按钮会：
1. 移除URL中的`/mobile`路径
2. 跳转到根路径`/`（PC版本）

### 从PC切换到Mobile
在PC版本中，可以通过以下方式切换到Mobile：
1. 直接访问`/mobile.html`
2. 或者在代码中添加切换按钮（待实现）

## 构建配置

在`vite.config.ts`中配置了多入口构建：

```typescript
build: {
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, 'index.html'),      // PC版本
      admin: path.resolve(__dirname, 'admin.html'),     // 管理端
      mobile: path.resolve(__dirname, 'mobile.html'),   // Mobile版本
    },
    output: {
      manualChunks: {
        'admin': ['./admin/AdminScreen'],
        'mobile': ['./mobile/MobileApp'],
        // ...
      },
    },
  },
}
```

## 开发测试

### 本地开发
```bash
# 启动开发服务器
npm run dev

# 访问Mobile版本
http://localhost:3000/mobile.html
```

### 构建测试
```bash
# 构建项目
npm run build

# 构建后会在 dist/ 目录生成：
# - index.html (PC版本)
# - admin.html (管理端)
# - mobile.html (Mobile版本)
```

## 部署注意事项

### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;

    # PC版本
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Mobile版本
    location /mobile.html {
        try_files /mobile.html =404;
    }

    # 管理端
    location /admin.html {
        try_files /admin.html =404;
    }
}
```

### 静态文件服务
确保所有三个HTML文件都能被正确访问：
- `/` → `index.html` (PC版本)
- `/mobile.html` → `mobile.html` (Mobile版本)
- `/admin.html` → `admin.html` (管理端)

## 路径对比

| 版本 | 访问路径 | 入口文件 | 主组件 |
|------|---------|---------|--------|
| PC版本 | `/` 或 `/index.html` | `index.tsx` | `App.tsx` |
| Mobile版本 | `/mobile.html` | `mobile.tsx` | `MobileApp.tsx` |
| 管理端 | `/admin.html` | `admin.tsx` | `AdminScreen.tsx` |

## 优势

1. **独立部署**：可以单独部署Mobile版本
2. **独立缓存**：浏览器可以独立缓存Mobile版本
3. **独立构建**：可以针对Mobile版本进行优化
4. **清晰分离**：代码和资源清晰分离
5. **易于维护**：每个版本有独立的入口文件

## 相关文件

- `frontend/mobile.html` - Mobile版本HTML入口
- `frontend/mobile.tsx` - Mobile版本React入口
- `frontend/mobile/MobileApp.tsx` - Mobile版本主组件
- `frontend/vite.config.ts` - 构建配置
- `frontend/App.tsx` - PC版本主组件（包含路径检测）

---

**文档创建时间**：2025-01-XX
**最后更新时间**：2025-01-XX
**维护者**：开发团队
