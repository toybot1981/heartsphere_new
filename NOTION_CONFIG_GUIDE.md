# Notion 笔记同步配置指南

本文档介绍如何在系统中配置 Notion 笔记同步功能。

## 一、在 Notion 开发者门户创建 OAuth 集成

### 1. 访问 Notion 开发者门户

访问 [Notion 我的集成页面](https://www.notion.so/my-integrations) 并登录您的 Notion 账号。

### 2. 创建新的 OAuth 集成

1. 点击页面上的 **"New integration"** 或 **"新建集成"** 按钮
2. 选择 **"Public integration"**（公共集成）类型
3. 填写集成信息：
   - **Name（名称）**：为您的集成起一个名称，例如 "HeartSphere Notes Sync"
   - **Logo（图标）**：可选，上传一个图标
   - **Associated workspace（关联工作区）**：选择要使用的工作区

### 3. 配置 OAuth 设置

1. 在集成设置页面，找到 **"OAuth domain & URIs"** 部分
2. 设置 **Redirect URI（重定向 URI）**：
   ```
   http://localhost:8081/api/notes/notion/callback
   ```
   ⚠️ **注意**：如果是生产环境，需要设置为实际的后端服务器地址，例如：
   ```
   https://yourdomain.com/api/notes/notion/callback
   ```

3. 保存设置

### 4. 获取 OAuth 凭据

创建完成后，在集成详情页面可以看到：
- **OAuth Client ID**：这是您的 Client ID
- **OAuth Client Secret**：这是您的 Client Secret（需要点击显示）

请妥善保管这些凭据，后续配置中需要使用。

## 二、在管理后台配置 Notion

### 1. 登录管理后台

访问系统管理后台，使用管理员账号登录。

### 2. 进入系统配置

在左侧菜单中找到 **"系统配置"** 或 **"System Config"**，点击进入。

### 3. 配置 Notion 参数

在 **"Notion 配置"** 部分，填写以下信息：

1. **Client ID (OAuth Client ID)**
   - 输入在 Notion 集成中获取的 OAuth Client ID
   - 例如：`abc123def456...`

2. **Client Secret (OAuth Client Secret)**
   - 输入在 Notion 集成中获取的 OAuth Client Secret
   - 例如：`secret_xyz789...`

3. **回调地址 (Redirect URI)**
   - 默认值：`http://localhost:8081/api/notes/notion/callback`
   - ⚠️ **重要**：必须与在 Notion 集成中配置的 Redirect URI **完全一致**
   - 如果您的后端服务器地址不同，请修改此值

4. **笔记同步按钮显示**
   - 开启此选项后，用户在前端界面可以看到笔记同步功能
   - 关闭后，用户将无法使用笔记同步功能

### 4. 保存配置

点击 **"保存配置"** 按钮，系统会保存您的设置。

## 三、本地测试配置

### ⚠️ 重要：Notion OAuth 本地测试问题

Notion OAuth 的回调地址必须是 **可公开访问的 URL**。如果直接使用 `localhost`，Notion 无法访问您的本地服务器，授权会失败。

### 解决方案 1：使用 ngrok（推荐）

**ngrok** 是最常用的内网穿透工具，可以将本地服务器映射到公网地址。

#### 步骤 1：安装 ngrok

**macOS（使用 Homebrew）：**
```bash
brew install ngrok/ngrok/ngrok
```

**或从官网下载：**
访问 [ngrok 官网](https://ngrok.com/) 下载并安装

#### 步骤 2：启动后端服务

确保后端服务正在运行：
```bash
cd backend
mvn spring-boot:run
```

后端服务应该在 `http://localhost:8081` 运行。

#### 步骤 3：启动 ngrok 隧道

在**新的终端窗口**中运行：
```bash
ngrok http 8081
```

ngrok 会显示类似以下的信息：
```
Forwarding   https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:8081
```

**复制这个 HTTPS URL**（例如：`https://xxxx-xx-xx-xx-xx.ngrok-free.app`）

#### 步骤 4：在 Notion 集成中配置回调地址

1. 访问 [Notion 我的集成页面](https://www.notion.so/my-integrations)
2. 选择您的集成，进入设置页面
3. 在 **"OAuth domain & URIs"** 部分，添加 Redirect URI：
   ```
   https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/notes/notion/callback
   ```
   （将 `xxxx-xx-xx-xx-xx.ngrok-free.app` 替换为您的 ngrok URL）
4. 保存设置

#### 步骤 5：在管理后台配置回调地址

1. 登录管理后台
2. 进入 **"系统配置"** -> **"Notion 配置"**
3. 将 **"回调地址"** 设置为：
   ```
   https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/notes/notion/callback
   ```
   （与 Notion 集成中配置的地址完全一致）
4. 保存配置

#### 步骤 6：测试授权

1. 确保后端服务正在运行
2. 确保 ngrok 隧道正在运行（不要关闭 ngrok 终端窗口）
3. 在前端界面测试授权流程

**⚠️ 注意事项：**
- ngrok 免费版每次启动 URL 会变化，需要重新配置
- ngrok 免费版有连接数限制
- 如果需要固定 URL，可以使用 ngrok 付费版或使用其他方案

### 解决方案 2：使用 lvh.me（简单但有限制）

`lvh.me` 是一个始终解析到 `127.0.0.1` 的域名。

#### 步骤 1：在 Notion 集成中配置

1. 在 Notion 集成设置中，添加 Redirect URI：
   ```
   http://lvh.me:8081/api/notes/notion/callback
   ```

#### 步骤 2：在管理后台配置

1. 将回调地址设置为：
   ```
   http://lvh.me:8081/api/notes/notion/callback
   ```

**⚠️ 限制：**
- Notion 可能不支持 `lvh.me` 域名
- 某些浏览器可能对 `lvh.me` 有限制
- 如果 Notion 要求 HTTPS，此方案不可用

### 解决方案 3：修改 hosts 文件（需要 HTTPS）

如果 Notion 要求 HTTPS，可以使用自定义域名 + 本地 HTTPS 证书。

#### 步骤 1：修改 hosts 文件

**macOS/Linux：**
```bash
sudo nano /etc/hosts
```

添加一行：
```
127.0.0.1    notion-local.test
```

#### 步骤 2：配置本地 HTTPS

需要为本地服务器配置 HTTPS 证书（可以使用 mkcert 等工具）

#### 步骤 3：配置回调地址

在 Notion 和管理后台中配置：
```
https://notion-local.test:8081/api/notes/notion/callback
```

**⚠️ 限制：**
- 需要配置 HTTPS 证书，相对复杂
- Notion 可能不信任自签名证书

### 解决方案 4：使用其他内网穿透工具

除了 ngrok，还可以使用：
- **localtunnel**：`npm install -g localtunnel && lt --port 8081`
- **serveo**：`ssh -R 80:localhost:8081 serveo.net`
- **Cloudflare Tunnel**：免费且稳定

## 四、测试配置

### 1. 检查配置是否正确

配置保存后，系统会验证配置是否有效。如果配置有误，会显示错误信息。

### 2. 测试授权流程

1. 在前端界面，进入 **"现实世界"** 或相关页面
2. 点击 **"笔记同步"** 按钮
3. 选择 **"Notion"** 作为笔记服务
4. 点击 **"授权连接"** 按钮
5. 系统会打开 Notion 的授权页面
6. 在 Notion 授权页面中，点击 **"Allow"** 或 **"允许"** 授权
7. 授权成功后，系统会返回并显示授权成功信息

### 3. 测试笔记同步

1. 授权成功后，点击 **"立即同步"** 按钮
2. 系统会从 Notion 获取笔记数据
3. 同步完成后，可以在笔记列表中查看同步的笔记

## 五、常见问题

### 1. 授权失败，提示 "redirect_uri_mismatch"

**原因**：回调地址不匹配

**解决方法**：
- 检查管理后台中配置的 Redirect URI 是否与 Notion 集成中配置的一致
- 确保 URL 完全一致，包括协议（http/https）、域名、端口号和路径
- 如果使用 ngrok，确保 ngrok URL 与配置的一致（ngrok 免费版每次启动 URL 会变化）

### 2. 本地测试时 Notion 无法访问回调地址

**原因**：`localhost` 无法被 Notion 服务器访问

**解决方法**：
- 使用 ngrok 等内网穿透工具（推荐）
- 或使用其他解决方案（见"本地测试配置"章节）

### 3. 授权失败，提示 "invalid_client"

**原因**：Client ID 或 Client Secret 错误

**解决方法**：
- 检查在 Notion 集成中复制的 Client ID 和 Client Secret 是否正确
- 确保没有多余的空格或换行符
- 重新复制并粘贴到配置中

### 4. 无法打开授权页面

**原因**：浏览器阻止了弹窗

**解决方法**：
- 检查浏览器是否阻止了弹窗
- 在浏览器设置中允许该网站的弹窗
- 或者使用其他浏览器重试

### 5. 同步后没有笔记数据

**原因**：可能是权限不足或 Notion 工作区中没有可访问的页面

**解决方法**：
- 确保授权时选择了正确的工作区
- 确保工作区中有可访问的页面或数据库
- 检查 Notion 集成的权限设置

### 6. ngrok 连接断开或 URL 变化

**原因**：ngrok 免费版每次启动 URL 会变化，或连接超时

**解决方法**：
- 每次启动 ngrok 后，需要更新 Notion 集成和管理后台中的回调地址
- 考虑使用 ngrok 付费版获得固定域名
- 或使用其他内网穿透工具（如 Cloudflare Tunnel）

## 六、参考链接

- [Notion 开发者门户](https://www.notion.so/my-integrations)
- [Notion API 文档](https://developers.notion.com/)
- [Notion OAuth 认证指南](https://developers.notion.com/docs/authorization)

## 七、安全注意事项

1. **保护凭据安全**：
   - 不要将 Client ID 和 Client Secret 提交到公开的代码仓库
   - 在生产环境中，建议使用环境变量存储敏感信息

2. **HTTPS 使用**：
   - 生产环境建议使用 HTTPS
   - 需要在 Notion 集成中配置 HTTPS 的回调地址

3. **权限控制**：
   - 在 Notion 集成中，只授予必要的权限
   - 定期检查授权的用户和工作区

## 八、生产环境部署

如果要在生产环境中使用，需要：

1. **更新 Redirect URI**：
   - 在 Notion 集成中，添加生产环境的回调地址
   - 在管理后台配置中，更新回调地址为生产环境地址
   - 例如：`https://yourdomain.com/api/notes/notion/callback`

2. **使用 HTTPS**：
   - 确保后端服务器使用 HTTPS
   - Notion OAuth 要求使用 HTTPS 的回调地址（生产环境）

3. **环境变量配置**（可选）：
   - 可以在后端配置文件中使用环境变量：
     ```properties
     notion.client-id=${NOTION_CLIENT_ID}
     notion.client-secret=${NOTION_CLIENT_SECRET}
     notion.redirect-uri=${NOTION_REDIRECT_URI}
     ```

## 九、技术支持

如果遇到问题，可以：

1. 查看系统日志，查找错误信息
2. 检查 Notion 开发者门户中的集成状态
3. 参考 [Notion API 文档](https://developers.notion.com/) 和 [Notion 社区](https://developers.notion.com/docs/community)

