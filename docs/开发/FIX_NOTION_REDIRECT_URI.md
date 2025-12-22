# 修复 Notion redirect_uri 错误

## 当前回调地址
```
https://athetoid-sacrosciatic-karson.ngrok-free.dev/api/notes/notion/callback
```

## 解决步骤

### 步骤 1: 在 Notion 开发者门户配置 Redirect URI

1. **访问 Notion 开发者门户**
   - 打开：https://www.notion.so/my-integrations
   - 登录您的 Notion 账号

2. **找到您的集成（Integration）**
   - 点击您创建的集成名称

3. **配置 OAuth 设置**
   - 找到 "OAuth domain & URIs" 部分
   - 在 "Redirect URIs" 中添加：
     ```
     https://athetoid-sacrosciatic-karson.ngrok-free.dev/api/notes/notion/callback
     ```
   - **重要**：必须包含完整的 URL（包括 `https://`）
   - 可以添加多个 Redirect URI（每行一个）

4. **保存配置**
   - 点击 "Save changes" 保存

### 步骤 2: 更新后端配置

#### 方法 A: 通过管理后台（推荐）

1. 访问管理后台
2. 进入 "系统配置" → "Notion 配置"
3. 设置 "回调地址" 为：
   ```
   https://athetoid-sacrosciatic-karson.ngrok-free.dev/api/notes/notion/callback
   ```
4. 保存配置

#### 方法 B: 通过 API（需要管理员 token）

```bash
# 设置管理员 token
export ADMIN_TOKEN=your_admin_token

# 运行自动更新脚本
./update_callback.sh
```

### 步骤 3: 验证配置

运行检查脚本：
```bash
ADMIN_TOKEN=your_token ./check_notion_config.sh
```

## 常见问题

### Q: 为什么还是报错？
A: 请确保：
1. Notion 开发者门户中的 Redirect URI **完全匹配**（包括协议、域名、路径）
2. 后端配置中的回调地址与 Notion 中的一致
3. 两个地址都使用 `https://`（不是 `http://`）

### Q: ngrok 地址会变化吗？
A: 是的，免费版 ngrok 每次重启地址都会变化。解决方案：
1. 在 Notion 中配置多个可能的回调地址
2. 或者使用 ngrok 的固定域名（需要付费版）

### Q: 如何查看当前使用的回调地址？
A: 查看后端日志，搜索 "Redirect URI" 或运行：
```bash
./check_notion_config.sh
```

## 调试技巧

1. **查看后端日志**
   ```bash
   tail -f /tmp/backend.log | grep -i "notion\|redirect"
   ```

2. **查看 ngrok 请求**
   - 访问：http://127.0.0.1:4040
   - 查看所有经过 ngrok 的请求

3. **测试回调地址**
   ```bash
   curl -I https://athetoid-sacrosciatic-karson.ngrok-free.dev/api/notes/notion/callback
   ```

## 配置检查清单

- [ ] Notion 开发者门户中已添加 Redirect URI
- [ ] Redirect URI 使用 `https://` 协议
- [ ] Redirect URI 路径为 `/api/notes/notion/callback`
- [ ] 后端配置中的回调地址与 Notion 中的一致
- [ ] ngrok 正在运行
- [ ] 后端服务正在运行（端口 8081）
