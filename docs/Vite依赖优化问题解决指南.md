# Vite 依赖优化问题解决指南

**问题**: `GET http://localhost:3000/node_modules/.vite/deps/@antv_x6.js?v=23099b3c net::ERR_ABORTED 504 (Outdated Optimize Dep)`

**原因**: 这是 Vite 开发服务器的依赖预构建缓存过期问题。通常发生在安装新依赖后，Vite 需要重新预构建依赖。

---

## 解决方案

### 方案 1：重启开发服务器（推荐，最简单）

**步骤**：
1. 停止当前运行的开发服务器（Ctrl+C）
2. 重新启动开发服务器：
   ```bash
   cd frontend
   npm run dev
   ```

---

### 方案 2：清除 Vite 缓存并重启

**步骤**：
1. 停止开发服务器（Ctrl+C）
2. 删除 Vite 缓存目录：
   ```bash
   cd frontend
   rm -rf node_modules/.vite
   ```
3. 重新启动开发服务器：
   ```bash
   npm run dev
   ```

---

### 方案 3：强制重新预构建依赖

**步骤**：
1. 停止开发服务器（Ctrl+C）
2. 使用 `--force` 选项强制重新预构建：
   ```bash
   cd frontend
   npm run dev -- --force
   ```
   或者清除缓存后启动：
   ```bash
   rm -rf node_modules/.vite && npm run dev
   ```

---

## 详细说明

### 为什么会出现这个问题？

1. **Vite 依赖预构建**：Vite 在首次启动时会预构建 node_modules 中的依赖，以提高开发服务器的启动速度
2. **缓存过期**：当你安装新的依赖（如 @antv/x6）后，Vite 的缓存可能过期，需要重新预构建
3. **504 错误**：表示服务器处理请求超时，通常是因为 Vite 在后台重新预构建依赖时花费了太长时间

### 预防措施

1. **安装依赖后重启**：每次安装新的 npm 包后，建议重启开发服务器
2. **使用 `--force` 选项**：如果遇到问题，使用 `--force` 强制重新预构建

---

## 如果问题仍然存在

如果上述方案都无法解决问题，可以尝试：

### 1. 完全清理并重新安装

```bash
cd frontend
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json
# 清除 Vite 缓存（如果存在）
rm -rf node_modules/.vite
# 重新安装依赖
npm install
# 启动开发服务器
npm run dev
```

### 2. 检查 X6 依赖是否正确安装

```bash
cd frontend
# 检查 @antv/x6 是否已安装
npm list @antv/x6 @antv/x6-react-shape
```

如果未安装，使用：
```bash
npm install @antv/x6 @antv/x6-react-shape --save --legacy-peer-deps
```

---

## 快速解决命令

**一键解决（推荐）**：
```bash
cd frontend && rm -rf node_modules/.vite && npm run dev
```

---

**状态**: 这是正常的 Vite 行为，重启开发服务器即可解决 ✅
