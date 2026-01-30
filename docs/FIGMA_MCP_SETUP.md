# Figma MCP 接入指南

## ✅ 配置已完成

Figma MCP 配置已添加到 `~/.cursor/mcp.json` 文件中。

## 📋 下一步操作

### 1. 获取 Figma Access Token

1. 登录 [Figma](https://www.figma.com/)
2. 点击右上角头像 → **Settings**
3. 在左侧菜单找到 **Account** → **Personal Access Tokens**
4. 点击 **"Create a new personal access token"**
5. 输入 token 名称（如：`Cursor MCP`）
6. **复制生成的 token**（⚠️ 只显示一次，请妥善保存）

### 2. 更新配置文件

编辑 `~/.cursor/mcp.json`，找到以下部分：

```json
"figma": {
  "command": "npx",
  "args": [
    "-y",
    "figma-mcp-server"
  ],
  "env": {
    "FIGMA_ACCESS_TOKEN": "YOUR_FIGMA_ACCESS_TOKEN"  // ← 替换这里
  },
  ...
}
```

将 `"YOUR_FIGMA_ACCESS_TOKEN"` 替换为你刚才复制的实际 token。

### 3. 重启 Cursor

配置完成后，**完全重启 Cursor** 使配置生效。

## 🔍 验证配置

重启后，在 Cursor 中你应该能够：

- 使用 MCP 工具访问 Figma 文件
- 查看设计组件信息
- 获取设计规范
- 导出设计资源

## 📦 使用的包

当前配置使用：**`figma-mcp-server`** (v2.1.1)

这是一个功能完整的 Figma MCP 服务器，支持：
- 列出 Figma 文件
- 获取设计组件
- 导出资源
- 查看设计规范

## 🔄 其他可选包

如果 `figma-mcp-server` 不满足需求，可以尝试：

1. **`figma-mcp-pro`** (v3.49.0) - 功能更强大
   ```json
   "args": ["-y", "figma-mcp-pro"]
   ```

2. **`figma-developer-mcp`** (v0.6.4) - 开发者友好
   ```json
   "args": ["-y", "figma-developer-mcp"]
   ```

3. **`cursor-talk-to-figma-mcp`** (v0.3.4) - Cursor 专用
   ```json
   "args": ["-y", "cursor-talk-to-figma-mcp"]
   ```

## 🔒 安全提示

⚠️ **重要安全事项**：

- ✅ 不要将 `FIGMA_ACCESS_TOKEN` 提交到代码仓库
- ✅ Token 具有访问你的 Figma 文件的权限，请妥善保管
- ✅ 定期轮换访问令牌
- ✅ 如果 token 泄露，立即在 Figma 中撤销

## 🐛 故障排除

### 问题：MCP 服务器无法启动

**解决方案**：
- 检查 Node.js 版本（建议 v18+）
- 确认网络连接正常
- 检查 token 是否有效

```bash
# 测试 token 是否有效
curl -H "X-Figma-Token: YOUR_TOKEN" https://api.figma.com/v1/me
```

### 问题：无法访问 Figma 文件

**解决方案**：
- 确认 token 有正确的权限
- 检查文件是否在可访问的工作区
- 确认文件不是私有的（或 token 有访问权限）

### 问题：包安装失败

**解决方案**：
- 清除 npm 缓存：`npm cache clean --force`
- 使用全局安装：`npm install -g figma-mcp-server`
- 然后修改配置使用全局命令：
  ```json
  "command": "figma-mcp-server"
  ```

## 📚 参考资源

- [Figma API 文档](https://www.figma.com/developers/api)
- [MCP 协议文档](https://modelcontextprotocol.io/)
- [Cursor MCP 文档](https://docs.cursor.com/mcp)
- [figma-mcp-server npm 包](https://www.npmjs.com/package/figma-mcp-server)

## 📝 配置备份

原配置已备份到：
```
~/.cursor/mcp.json.backup.20260125_094649
```

如果需要恢复，可以：
```bash
cp ~/.cursor/mcp.json.backup.20260125_094649 ~/.cursor/mcp.json
```

---

**配置完成后，重启 Cursor 即可开始使用 Figma MCP！** 🎉
