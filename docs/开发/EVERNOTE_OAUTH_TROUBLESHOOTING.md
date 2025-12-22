# 印象笔记 OAuth 1.0a 403 Forbidden 问题排查指南

## 问题描述
在使用印象笔记 OAuth 1.0a 授权时，遇到 403 Forbidden 错误。

## 已修复的问题

### 1. 回调地址错误（已修复）
- **问题**：前端使用的回调地址是 `http://localhost:3000/notes/evernote/callback`（前端服务器）
- **修复**：已修改为 `http://localhost:8081/api/notes/evernote/callback`（后端服务器）
- **位置**：`frontend/components/NoteSyncModal.tsx` 第 119 行

## 需要检查的配置项

### 1. 印象笔记开发者平台配置

#### 获取 API Key
1. 访问印象笔记开发者平台：https://dev.yinxiang.com/
2. 登录您的印象笔记账号
3. 进入"我的应用"或"API Key"页面
4. 查看或创建 API Key，获取 Consumer Key 和 Consumer Secret

#### 回调地址配置（重要）
根据印象笔记 OAuth 1.0a 的要求：
- 回调地址需要在开发者平台预先配置（如果平台支持）
- 或者在获取 request token 时传递的回调地址必须与平台配置的匹配

**当前使用的回调地址**：`http://localhost:8081/api/notes/evernote/callback`

**注意事项**：
- 如果印象笔记要求在开发者平台配置回调地址，请确保：
  1. 在开发者平台中配置的回调地址为：`http://localhost:8081/api/notes/evernote/callback`
  2. 如果平台不支持配置回调地址，则需要使用 `oob`（out-of-band）模式
  3. 沙箱环境可能不需要配置回调地址，而生产环境需要

### 2. Consumer Key 和 Consumer Secret 配置

#### 检查后端配置
1. 在管理后台的"笔记同步配置"中，确认已正确填写：
   - Consumer Key: `heartsphere`
   - Consumer Secret: `727e18caad249ed0`
   - 沙箱环境: 已勾选（使用 `sandbox.yinxiang.com`）

#### 检查 API Key 状态
1. 在印象笔记开发者平台中，确认 API Key 已激活
2. 确认 API Key 的状态为"正常"或"已启用"
3. 如果 API Key 未激活，请激活它

### 3. 沙箱环境 vs 生产环境

当前配置使用沙箱环境（`sandbox.yinxiang.com`）：
- 沙箱环境的 API Key 和回调地址要求可能与生产环境不同
- 沙箱环境通常用于开发和测试
- 如果沙箱环境的 API Key 有问题，可能需要：
  1. 重新创建沙箱环境的 API Key
  2. 或者切换到生产环境（需要生产环境的 API Key）

### 4. 检查后端日志

查看后端日志中的错误信息：
```bash
tail -100 /tmp/backend.log | grep -i "evernote\|oauth\|403\|forbidden"
```

重点关注：
- OAuth 配置详情日志
- Consumer Key 和 Callback URL 的值
- 获取 request token 时的错误信息

## 可能的解决方案

### 方案 1：使用 oob 回调地址（如果平台不支持配置回调地址）
如果印象笔记开发者平台不支持配置回调地址，或者您不确定如何配置，可以尝试使用 `oob`（out-of-band）模式：

修改 `frontend/components/NoteSyncModal.tsx`：
```typescript
const callbackUrl = 'oob'; // 使用 out-of-band 模式
```

### 方案 2：检查 API Key 权限
确认 API Key 是否有足够的权限：
1. 在印象笔记开发者平台中，检查 API Key 的权限设置
2. 确保 API Key 有 OAuth 授权权限
3. 确保 API Key 适用于沙箱环境（如果使用沙箱）

### 方案 3：联系印象笔记开发者支持
如果以上方法都无法解决问题，建议：
1. 访问印象笔记开发者支持页面：https://dev.yinxiang.com/support/
2. 发送邮件至 dev-api@yinxiang.com
3. 提供以下信息：
   - Consumer Key
   - 回调地址：`http://localhost:8081/api/notes/evernote/callback`
   - 错误信息：403 Forbidden
   - 使用的环境：沙箱环境（sandbox.yinxiang.com）

## 测试步骤

1. **检查后端服务是否运行**：
   ```bash
   curl http://localhost:8081/actuator/health
   ```

2. **检查 OAuth 配置**：
   - 在管理后台查看印象笔记配置是否正确
   - 确认 Consumer Key 和 Consumer Secret 已正确填写

3. **测试获取授权 URL**：
   - 在前端点击"授权印象笔记"按钮
   - 查看浏览器控制台的错误信息
   - 查看后端日志中的详细错误信息

4. **检查回调地址**：
   - 确认回调地址指向后端服务器：`http://localhost:8081/api/notes/evernote/callback`
   - 确认该地址可以从印象笔记服务器访问（如果是生产环境，需要使用公网可访问的地址）

## 相关文档

- 印象笔记开发者文档：https://dev.yinxiang.com/doc/
- OAuth 1.0a 认证文档：https://dev.yinxiang.com/doc/articles/authentication.php
- 开发者支持页面：https://dev.yinxiang.com/support/




