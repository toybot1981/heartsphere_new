# 立即解决 Vite 504 错误

**错误**: `GET http://localhost:3000/node_modules/.vite/deps/@antv_x6.js?v=23099b3c net::ERR_ABORTED 504 (Outdated Optimize Dep)`

---

## 🔧 解决步骤（按顺序执行）

### 步骤 1：停止当前运行的前端服务

**方法 A**：如果前端服务在你当前终端运行
- 按 `Ctrl + C` 停止服务

**方法 B**：如果前端服务在后台运行
```bash
# 在终端执行
pkill -f vite
pkill -f "npm.*dev"
```

---

### 步骤 2：清除 Vite 缓存（已为你清除，但可以再确认）

```bash
cd frontend
rm -rf node_modules/.vite
```

---

### 步骤 3：强制重新启动（推荐使用 --force）

```bash
cd frontend
npm run dev -- --force
```

**或者** 如果上面的命令不工作，使用：
```bash
cd frontend
rm -rf node_modules/.vite && npm run dev
```

---

## ✅ 快速命令（一键执行）

在项目根目录执行：

```bash
cd frontend && pkill -f vite 2>/dev/null; rm -rf node_modules/.vite && npm run dev -- --force
```

---

## 📝 说明

1. **`--force` 选项**：强制 Vite 重新预构建所有依赖，包括 @antv/x6
2. **清除缓存**：确保旧的缓存不会干扰
3. **等待几秒**：Vite 需要几秒钟来重新预构建依赖

---

## 🔍 验证

启动后，等待几秒钟让 Vite 完成预构建，然后：
1. 访问 http://localhost:3000
2. 进入 Graph 流程编辑器
3. 应该不再出现 504 错误

---

**如果还是有问题**，请检查终端输出，看看是否有其他错误信息。
