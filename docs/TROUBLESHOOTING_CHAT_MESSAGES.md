# 聊天消息保存和加载问题排查指南

## 问题描述

**症状**: 角色应答的数据没有保存下来，再次进入的时候没有展示出来

**表现**:
- 用户消息可以正常显示
- 角色（ASSISTANT）的回复消息不显示
- 重新进入对话时，只看到用户消息，看不到角色回复

---

## 排查步骤

### 1. 检查浏览器控制台日志

打开浏览器开发者工具（F12），查看 Console 标签页，查找以下日志：

#### ✅ 正常情况应该看到：

```
[ChatWindow] ✅ 用户消息已成功保存到数据库
[generateAIResponse] ✅ AI回复消息已成功保存到数据库
[ChatWindow] ✅ 历史消息格式化完成
```

#### ❌ 如果看到错误：

```
[ChatWindow] ❌ 保存用户消息失败
[generateAIResponse] ❌ 保存AI回复消息失败
[ChatWindow] sessionId 无效
```

**解决方案**: 根据错误信息修复对应问题

---

### 2. 检查网络请求

在浏览器开发者工具的 Network 标签页中：

#### 检查保存消息的请求

1. 查找 `POST /api/memory/v1/chat/messages` 请求
2. 检查请求状态码：
   - ✅ `200 OK` - 保存成功
   - ❌ `400/401/500` - 保存失败，查看响应内容

3. 检查请求体：
   ```json
   {
     "sessionId": "chat_123_456",
     "role": "ASSISTANT",  // 或 "USER"
     "content": "消息内容",
     ...
   }
   ```

#### 检查加载消息的请求

1. 查找 `GET /api/memory/v1/chat/messages?sessionId=...` 请求
2. 检查响应数据：
   ```json
   {
     "code": 0,
     "data": [
       {
         "id": "...",
         "role": "USER",
         "content": "...",
         "timestamp": 1234567890
       },
       {
         "id": "...",
         "role": "ASSISTANT",  // 应该包含这个
         "content": "...",
         "timestamp": 1234567891
       }
     ]
   }
   ```

**如果响应中没有 ASSISTANT 角色的消息**，说明消息没有保存成功。

---

### 3. 检查 sessionId 一致性

**问题**: sessionId 在保存和加载时不一致，导致消息无法关联

#### 检查方法：

1. 在浏览器控制台运行：
   ```javascript
   // 查看当前 sessionId
   console.log('SessionId:', window.__currentSessionId);
   ```

2. 检查保存消息时的 sessionId：
   - 在 Network 标签页查看 `POST /api/memory/v1/chat/messages` 请求
   - 查看请求体中的 `sessionId` 值

3. 检查加载消息时的 sessionId：
   - 在 Network 标签页查看 `GET /api/memory/v1/chat/messages` 请求
   - 查看 URL 参数中的 `sessionId` 值

**如果两个 sessionId 不一致**，这就是问题所在。

#### 解决方案：

确保 `ChatWindow.tsx` 中的 sessionId 生成逻辑一致：

```typescript
// 会话ID：基于角色ID和用户ID
const sessionId = `chat_${character?.id || 'unknown'}_${userProfile?.id || 'guest'}`;
```

确保：
- `character?.id` 在保存和加载时相同
- `userProfile?.id` 在保存和加载时相同

---

### 4. 检查后端日志

查看后端应用日志（`/var/log/heartsphere/application.log` 或控制台输出）：

#### ✅ 正常情况应该看到：

```
✅ 聊天消息保存成功: sessionId=chat_123_456, role=ASSISTANT, messageId=xxx, contentLength=100
✅ 聊天消息加载成功: sessionId=chat_123_456, total=10, USER=5, ASSISTANT=5
```

#### ❌ 如果看到错误：

```
保存消息失败: sessionId=chat_123_456
获取聊天消息历史失败: sessionId=chat_123_456
```

**解决方案**: 根据错误信息修复后端问题

---

### 5. 检查数据库

直接查询数据库，确认消息是否保存：

```sql
-- 查看指定会话的所有消息
SELECT 
  id,
  session_id,
  role,
  content,
  timestamp,
  created_at
FROM chat_messages
WHERE session_id = 'chat_123_456'
ORDER BY timestamp ASC;

-- 统计各角色的消息数量
SELECT 
  role,
  COUNT(*) as count
FROM chat_messages
WHERE session_id = 'chat_123_456'
GROUP BY role;
```

**如果数据库中没有 ASSISTANT 角色的消息**，说明保存失败。

---

## 常见问题和解决方案

### 问题 1: sessionId 为 undefined 或 null

**原因**: `character?.id` 或 `userProfile?.id` 为空

**解决方案**:
```typescript
// 确保在保存消息前检查
if (!character?.id || !userProfile?.id) {
  logger.error('缺少必要参数，无法保存消息');
  return;
}
```

---

### 问题 2: Token 无效或过期

**原因**: 用户未登录或 token 已过期

**解决方案**:
- 检查用户是否已登录
- 刷新页面重新获取 token
- 检查 token 是否在请求头中正确传递

---

### 问题 3: 后端保存失败但前端没有显示错误

**原因**: 错误被静默捕获

**解决方案**: 
已修复！现在会记录详细的错误日志，包括：
- sessionId
- userId
- characterId
- 错误详情

查看浏览器控制台和网络请求即可看到详细错误信息。

---

### 问题 4: 消息保存成功但加载时没有显示

**原因**: 
1. sessionId 不一致
2. 消息加载时被过滤
3. 前端消息格式转换错误

**解决方案**:
1. 检查 sessionId 是否一致（见步骤 3）
2. 检查前端消息格式转换逻辑（`ChatWindow.tsx` 第 327-332 行）
3. 检查是否有过滤逻辑移除了 ASSISTANT 消息

---

## 调试工具

### 浏览器控制台调试脚本

```javascript
// 检查当前会话的消息
async function checkChatMessages() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    console.error('未登录');
    return;
  }
  
  // 获取当前 sessionId（需要根据实际情况调整）
  const sessionId = `chat_${window.__characterId}_${window.__userId}`;
  
  try {
    const response = await fetch(
      `/api/memory/v1/chat/messages?sessionId=${sessionId}&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    const data = await response.json();
    console.log('消息列表:', data.data);
    
    const userMessages = data.data.filter(m => m.role === 'USER');
    const assistantMessages = data.data.filter(m => m.role === 'ASSISTANT');
    
    console.log(`用户消息: ${userMessages.length} 条`);
    console.log(`角色回复: ${assistantMessages.length} 条`);
    
    if (assistantMessages.length === 0) {
      console.warn('⚠️ 没有找到角色回复消息！');
    }
  } catch (error) {
    console.error('检查消息失败:', error);
  }
}

// 运行检查
checkChatMessages();
```

---

## 修复后的改进

### 1. 增强的错误日志

现在会记录：
- ✅ 保存成功时的详细信息（sessionId, messageId, timestamp）
- ❌ 保存失败时的详细错误信息
- 📊 加载消息时的统计信息（总数、各角色数量）

### 2. 更严格的参数验证

- 检查 sessionId 是否有效
- 检查 token 是否存在
- 检查必要参数是否齐全

### 3. 开发环境下的错误提示

在开发环境下，错误会显示在浏览器控制台，方便调试。

---

## 如果问题仍然存在

1. **收集日志**:
   - 浏览器控制台日志
   - 网络请求详情
   - 后端应用日志

2. **检查环境**:
   - 数据库连接是否正常
   - 后端服务是否运行
   - 网络连接是否正常

3. **联系支持**:
   - 提供详细的错误日志
   - 提供复现步骤
   - 提供环境信息

---

最后更新：2026-01-24
