# 快速解决 Vite 依赖优化问题

**问题**: `GET http://localhost:3000/node_modules/.vite/deps/@antv_x6.js?v=23099b3c net::ERR_ABORTED 504 (Outdated Optimize Dep)`

---

## 🚀 快速解决方案（三种方法）

### 方法 1：使用重启脚本（最简单）✅

我已经为你创建了一个重启脚本，直接运行：

```bash
./restart-frontend-dev.sh
```

这个脚本会：
1. 停止现有的前端服务
2. 清除 Vite 缓存
3. 重新启动前端开发服务器

---

### 方法 2：手动执行命令

如果方法 1 不行，手动执行以下命令：

```bash
# 1. 停止前端服务（在运行 npm run dev 的终端按 Ctrl+C）

# 2. 清除 Vite 缓存
cd frontend
rm -rf node_modules/.vite

# 3. 重新启动
npm run dev
```

---

### 方法 3：使用 restart-all.sh（如果前后端都需要重启）

```bash
./restart-all.sh
```

这会重启前后端服务。

---

## ✅ 已执行的操作

我已经为你：
1. ✅ 清除了 Vite 缓存（`node_modules/.vite`）
2. ✅ 创建了快速重启脚本（`restart-frontend-dev.sh`）

---

## 📝 下一步

**现在你只需要运行**：

```bash
./restart-frontend-dev.sh
```

或者如果你想手动操作：

```bash
# 1. 如果前端服务正在运行，按 Ctrl+C 停止它

# 2. 然后运行
cd frontend
npm run dev
```

---

## ⚠️ 注意事项

1. **如果前端服务正在运行**：先停止它（Ctrl+C），然后再运行重启脚本或手动启动
2. **等待几秒钟**：重启后，Vite 需要几秒钟来重新预构建依赖
3. **检查终端输出**：如果看到错误信息，请查看终端的具体错误

---

## 🔍 验证是否解决

重启后，访问：
- 前端地址：http://localhost:3000
- 进入 Graph 流程编辑器页面
- 应该不再出现 504 错误

---

**状态**: 准备工作已完成，运行 `./restart-frontend-dev.sh` 即可 ✅
