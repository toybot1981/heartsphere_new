# React 降级到 18 指南

## 为什么降级？

React 19 是相对较新的版本，可能存在以下问题：
- 与某些依赖包（如 @antv/x6-react-components）不完全兼容
- ForwardRef 错误
- 构建时的代码分割问题

React 18.2.0 是一个稳定版本，与大多数依赖包兼容性更好。

## 降级步骤

### 1. 修改 package.json

已更新 `frontend/package.json`：

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

### 2. 更新 HTML 文件中的 CDN 引用

已更新以下文件：
- `frontend/index.html`
- `frontend/admin.html`
- `frontend/mobile.html`

将 React CDN 从 `^19.2.0` 改为 `^18.2.0`

### 3. 重新安装依赖

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --force
```

### 4. 验证版本

```bash
npm list react react-dom
# 应该显示 18.2.0 或 18.x.x
```

### 5. 重新构建

```bash
rm -rf dist .vite
npm run build
```

## 使用重新部署脚本

脚本已更新，会自动检测 React 版本：

```bash
cd deploy
sudo ./redeploy-frontend.sh
```

## React 18 vs React 19 主要差异

### React 18 特性（保留）
- ✅ Concurrent Rendering（并发渲染）
- ✅ Automatic Batching（自动批处理）
- ✅ Suspense 改进
- ✅ useTransition, useDeferredValue
- ✅ useId, useSyncExternalStore

### React 19 新特性（降级后不可用）
- ❌ useFormStatus, useFormState（表单相关）
- ❌ useOptimistic（乐观更新）
- ❌ useActionState（服务端操作）
- ❌ 新的 ref 作为 prop 支持

**注意**：当前项目代码中没有使用 React 19 的新特性，降级不会影响功能。

## 验证降级

### 1. 检查版本

```bash
cd frontend
node -p "require('./node_modules/react/package.json').version"
# 应该输出: 18.2.0 或 18.x.x
```

### 2. 检查类型定义

```bash
npm list @types/react @types/react-dom
# 应该显示 18.x.x 版本
```

### 3. 构建测试

```bash
npm run build
# 应该成功构建，没有 React 相关错误
```

### 4. 运行时检查

在浏览器控制台执行：

```javascript
console.log('React version:', React.version);
// 应该输出: 18.2.0 或 18.x.x

console.log('ForwardRef available:', typeof React.forwardRef === 'function');
// 应该输出: true
```

## 如果降级后仍有问题

### 选项1：固定版本

在 `package.json` 中使用精确版本（不使用 ^）：

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}
```

### 选项2：使用 React 18.3.0

React 18.3.0 是 React 18 的最新稳定版本：

```bash
npm install react@18.3.0 react-dom@18.3.0 --legacy-peer-deps
```

### 选项3：检查依赖冲突

```bash
npm ls react react-dom
# 检查是否有多个版本
```

## 回滚到 React 19

如果将来需要升级回 React 19：

```bash
cd frontend
npm install react@^19.2.0 react-dom@^19.2.0 @types/react@^19.2.7 @types/react-dom@^19.2.3 --legacy-peer-deps
# 更新 HTML 文件中的 CDN 引用
npm run build
```

## 相关文件

- `frontend/package.json` - 依赖配置（已更新）
- `frontend/index.html` - 主页面（已更新）
- `frontend/admin.html` - 管理页面（已更新）
- `frontend/mobile.html` - 移动端页面（已更新）
- `deploy/redeploy-frontend.sh` - 重新部署脚本（已更新）

## 总结

✅ **已完成的修改**：
- package.json: React 19.2.0 → 18.2.0
- @types/react: 19.2.7 → 18.2.0
- HTML 文件中的 CDN 引用已更新
- 重新部署脚本已更新版本检查

📝 **下一步**：
1. 运行 `npm install` 重新安装依赖
2. 运行 `npm run build` 重新构建
3. 部署到生产环境
