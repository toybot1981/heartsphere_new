# React ForwardRef 错误修复方案

## 问题描述

生产环境报错：
```
Uncaught TypeError: Cannot read properties of undefined (reading 'ForwardRef')
at vendor-9yK6GhpT.js:9:15063
```

## 根本原因

1. **多个 React 实例**：不同的依赖包可能引入了不同版本的 React，导致 React.forwardRef 未定义
2. **代码分割问题**：React 和依赖它的包（如 @antv/x6-react-components）被分割到不同的 chunk 中
3. **依赖版本冲突**：@antv/x6-react-components 可能与 React 19 不完全兼容

## 修复方案

### 方案1：更新 Vite 配置（已实施）

已更新 `frontend/vite.config.ts`：

1. **改进代码分割逻辑**：
   - 确保 React、React-DOM 和 @antv/x6-react 相关包在同一个 chunk (`vendor-react`)
   - 优先处理 React 相关包的代码分割

2. **优化依赖预构建**：
   - 将 `@antv/x6-react-components` 包含在 `optimizeDeps.include` 中
   - 确保所有 React 相关包使用同一个版本

3. **强制去重**：
   - 在 `resolve.dedupe` 中添加所有 React 相关包
   - 确保只有一个 React 实例

### 方案2：使用重新部署脚本（推荐）

```bash
cd deploy
sudo ./redeploy-frontend.sh
```

脚本会自动：
- 检查并修复多个 React 实例问题
- 清理所有缓存
- 重新构建项目

### 方案3：手动修复

如果脚本无法使用，按以下步骤操作：

#### 1. 清理所有缓存和依赖

```bash
cd /path/to/heartsphere_new/frontend
rm -rf node_modules dist .vite .cache package-lock.json
npm cache clean --force
```

#### 2. 检查是否有多个 React 实例

```bash
find node_modules -name "react" -type d | grep -v ".bin"
```

如果发现多个，需要修复：

```bash
# 查找所有额外的 React 实例
find node_modules -name "react" -type d | grep -v ".bin" | while read dir; do
    if [ "$dir" != "node_modules/react" ]; then
        echo "发现额外的 React 实例: $dir"
        # 删除并创建符号链接
        rm -rf "$dir"
        ln -s "$(pwd)/node_modules/react" "$dir"
    fi
done
```

#### 3. 重新安装依赖

```bash
npm install --legacy-peer-deps --force
```

#### 4. 验证 React 版本一致性

```bash
npm list react react-dom
# 应该只显示一个版本
```

#### 5. 重新构建

```bash
rm -rf dist .vite
npm run build
```

## Vite 配置关键修改

### 1. 代码分割优化

```typescript
manualChunks: (id) => {
  // 优先处理 React 相关包，确保它们在同一个 chunk
  if (id.includes('node_modules/react/') || 
      id.includes('node_modules/react-dom/') ||
      id.includes('node_modules/react/jsx-runtime')) {
    return 'vendor-react';
  }
  
  // @antv/x6-react 相关包也放在 vendor-react 中
  if (id.includes('node_modules/@antv/x6-react')) {
    return 'vendor-react';
  }
  
  // ... 其他分割逻辑
}
```

### 2. 依赖去重

```typescript
resolve: {
  dedupe: [
    'react', 
    'react-dom',
    'react/jsx-runtime',
    '@antv/x6-react-shape',
    '@antv/x6-react-components',
  ],
}
```

### 3. 预构建优化

```typescript
optimizeDeps: {
  include: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@antv/x6-react-components', // 确保也预构建
  ],
  force: true,
}
```

## 验证修复

### 1. 检查构建产物

```bash
# 检查 vendor-react chunk 是否包含 React
grep -r "ForwardRef" /opt/heartsphere/frontend/assets/vendor-react*.js

# 应该能找到 React.forwardRef 的定义
```

### 2. 检查浏览器控制台

1. 打开网站
2. 打开开发者工具（F12）
3. 检查 Console 是否还有 ForwardRef 错误
4. 检查 Network 标签，确认所有 chunk 都正常加载

### 3. 检查 React 实例

在浏览器控制台执行：

```javascript
// 检查是否有多个 React 实例
console.log('React version:', React.version);
console.log('React from window:', window.React);

// 检查 ForwardRef 是否可用
console.log('ForwardRef available:', typeof React.forwardRef === 'function');
```

## 如果问题仍然存在

### 选项1：降级 React 版本

如果 @antv/x6-react-components 与 React 19 不兼容，可以考虑降级：

```bash
cd frontend
npm install react@^18.2.0 react-dom@^18.2.0 --legacy-peer-deps
npm run build
```

### 选项2：移除 @antv/x6-react-components

如果不需要使用该包：

```bash
cd frontend
npm uninstall @antv/x6-react-components
# 检查代码中是否有使用，如果有需要替换
npm run build
```

### 选项3：使用 React 18

修改 `package.json`：

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

然后重新安装和构建。

## 预防措施

1. **固定依赖版本**：在 `package.json` 中使用固定版本号，避免自动更新
2. **定期检查**：使用 `npm list react react-dom` 检查是否有多个版本
3. **构建前清理**：每次构建前清理缓存
4. **使用 CI/CD**：自动化构建流程，确保一致性

## 相关文件

- `frontend/vite.config.ts` - Vite 配置（已更新）
- `deploy/redeploy-frontend.sh` - 重新部署脚本（已更新）
- `frontend/package.json` - 依赖配置

## 更新日志

- 2025-01-04: 更新 Vite 配置，改进代码分割和依赖去重
- 2025-01-04: 更新重新部署脚本，添加多 React 实例检测和修复
