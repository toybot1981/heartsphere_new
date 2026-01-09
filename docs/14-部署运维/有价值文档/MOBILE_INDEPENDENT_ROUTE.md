# Mobile 版本独立路由实现

## 概述

实现了移动端版本的独立地址 `/mobile.html`，PC版本和移动版本现在使用完全独立的入口页面。

## 实现方案

### 1. 独立入口页面

- **PC版本入口**: `/` (index.html)
- **移动版本入口**: `/mobile.html` (mobile.html)

### 2. 文件结构

```
frontend/
├── index.html          # PC版本入口
├── mobile.html         # 移动版本入口（已存在）
├── index.tsx           # PC版本React入口
├── mobile.tsx          # 移动版本React入口
└── App.tsx             # PC版本主应用组件
```

### 3. 路由切换逻辑

#### PC版本切换到移动版本
- **位置**: `frontend/hooks/useDeviceMode.ts`
- **方法**: `handleSwitchToMobile`
- **行为**: 点击"切换到手机版"按钮时，跳转到 `/mobile.html`
- **代码**:
  ```typescript
  const handleSwitchToMobile = useCallback(async (): Promise<void> => {
    await storageService.saveState({ ...gameState, lastLoginTime: Date.now() });
    window.location.href = '/mobile.html';
  }, [gameState]);
  ```

#### 移动版本切换到PC版本
- **位置**: `frontend/mobile.tsx`
- **方法**: `handleSwitchToPC`
- **行为**: 点击"切换到PC端"按钮时，跳转到 `/`
- **代码**:
  ```typescript
  const handleSwitchToPC = () => {
    window.location.href = '/';
  };
  ```

### 4. 关键修改

#### 4.1 移除自动切换逻辑

**文件**: `frontend/App.tsx`
- 移除了根据设备检测自动切换到移动端的逻辑
- PC版本（/）现在始终显示PC界面，不会自动切换到移动端

**文件**: `frontend/hooks/useDeviceMode.ts`
- `isMobileMode` 初始值改为 `false`（不再自动检测）
- 移除了窗口大小变化自动切换的逻辑
- `handleSwitchToMobile` 改为页面跳转而不是状态切换

#### 4.2 构建配置

**文件**: `frontend/vite.config.ts`
- 已配置 `mobile.html` 作为独立的构建入口
- 配置了代码分割，移动端相关代码单独打包

```typescript
build: {
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, 'index.html'),
      admin: path.resolve(__dirname, 'admin.html'),
      mobile: path.resolve(__dirname, 'mobile.html'),  // 移动端入口
    },
    // ...
  }
}
```

## 使用方式

### 开发环境

1. **启动开发服务器**
   ```bash
   cd frontend
   npm run dev
   ```

2. **访问PC版本**
   - 地址: `http://localhost:3000/`
   - 点击"切换到手机版"按钮，跳转到 `http://localhost:3000/mobile.html`

3. **访问移动版本**
   - 地址: `http://localhost:3000/mobile.html`
   - 点击"切换到PC端"按钮，跳转到 `http://localhost:3000/`

### 生产环境

1. **构建项目**
   ```bash
   cd frontend
   npm run build
   ```

2. **部署文件**
   - `dist/index.html` → PC版本入口
   - `dist/mobile.html` → 移动版本入口
   - 其他静态资源文件

3. **Nginx配置**
   确保nginx配置支持两个入口页面：
   ```nginx
   # PC版本
   location / {
       try_files $uri $uri/ /index.html;
   }
   
   # 移动版本
   location /mobile.html {
       try_files /mobile.html =404;
   }
   ```

## 优势

1. **完全独立**: PC版本和移动版本使用不同的入口，互不干扰
2. **清晰的路由**: 通过URL明确区分PC和移动版本
3. **更好的SEO**: 移动版本有独立的URL，便于搜索引擎索引
4. **代码分割**: 移动端代码单独打包，减少PC版本包体积
5. **用户体验**: 用户可以通过URL直接访问移动版本

## 注意事项

1. **状态同步**: 切换版本时会保存当前状态，但两个版本的状态是独立的
2. **URL参数**: 切换时不会保留URL参数，如果需要可以手动添加
3. **浏览器历史**: 切换版本会在浏览器历史中创建新记录
4. **开发环境**: Vite开发服务器会自动处理两个入口页面

## 相关文件

- `frontend/index.html` - PC版本HTML入口
- `frontend/mobile.html` - 移动版本HTML入口
- `frontend/index.tsx` - PC版本React入口
- `frontend/mobile.tsx` - 移动版本React入口
- `frontend/App.tsx` - PC版本主应用
- `frontend/mobile/MobileApp.tsx` - 移动版本主应用
- `frontend/hooks/useDeviceMode.ts` - 设备模式管理Hook
- `frontend/vite.config.ts` - Vite构建配置

## 测试检查清单

- [ ] PC版本（/）正常加载
- [ ] 移动版本（/mobile.html）正常加载
- [ ] PC版本点击"切换到手机版"按钮，跳转到 /mobile.html
- [ ] 移动版本点击"切换到PC端"按钮，跳转到 /
- [ ] 两个版本的状态独立保存
- [ ] 构建后两个入口文件都正确生成
- [ ] Nginx配置正确支持两个入口
