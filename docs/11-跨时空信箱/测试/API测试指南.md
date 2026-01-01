# 跨时空信箱API测试指南

**文档版本**: V1.0  
**更新日期**: 2025-12-31

---

## 一、测试环境准备

### 1.1 启动服务

```bash
# 启动后端服务
cd backend
mvn spring-boot:run

# 启动前端服务（如果需要）
cd frontend
npm start
```

### 1.2 获取认证Token

```bash
# 登录获取token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password"}'

# 返回示例
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer"
}
```

---

## 二、消息接口测试

### 2.1 获取消息列表

```bash
curl -X GET "http://localhost:8080/api/mailbox/messages?category=ESOUL_LETTER&page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应示例**:
```json
{
  "content": [
    {
      "id": 1,
      "title": "问候",
      "content": "你好，最近怎么样？",
      "messageCategory": "ESOUL_LETTER",
      "senderName": "测试角色",
      "isRead": false,
      "createdAt": "2025-12-31T10:00:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "number": 0,
  "size": 20
}
```

### 2.2 获取消息详情

```bash
curl -X GET "http://localhost:8080/api/mailbox/messages/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2.3 标记消息为已读

```bash
curl -X PUT "http://localhost:8080/api/mailbox/messages/1/read" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2.4 标记消息为重要

```bash
curl -X PUT "http://localhost:8080/api/mailbox/messages/1/important" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isImportant": true}'
```

### 2.5 收藏消息

```bash
curl -X PUT "http://localhost:8080/api/mailbox/messages/1/star" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isStarred": true}'
```

### 2.6 删除消息

```bash
curl -X DELETE "http://localhost:8080/api/mailbox/messages/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2.7 获取未读消息统计

```bash
curl -X GET "http://localhost:8080/api/mailbox/messages/unread/count" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应示例**:
```json
{
  "totalUnread": 5,
  "categoryUnread": {
    "ESOUL_LETTER": 2,
    "RESONANCE": 2,
    "SYSTEM": 1,
    "USER_MESSAGE": 0
  }
}
```

---

## 三、E-SOUL来信接口测试

### 3.1 触发E-SOUL来信

```bash
curl -X POST "http://localhost:8080/api/mailbox/esoul-letters?letterType=GREETING" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**响应示例**:
```json
{
  "success": true,
  "messageId": 1
}
```

### 3.2 回复E-SOUL来信

```bash
curl -X POST "http://localhost:8080/api/mailbox/esoul-letters/1/reply" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "谢谢你的来信！",
    "replyType": "full"
  }'
```

---

## 四、对话接口测试

### 4.1 获取对话列表

```bash
curl -X GET "http://localhost:8080/api/mailbox/conversations?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4.2 创建对话

```bash
curl -X POST "http://localhost:8080/api/mailbox/conversations" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participant2Id": 2,
    "initialMessage": "你好，想和你聊聊",
    "createMailboxNotification": true
  }'
```

### 4.3 发送对话消息

```bash
curl -X POST "http://localhost:8080/api/mailbox/conversations/1/messages" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "这是一条测试消息",
    "messageType": "text"
  }'
```

### 4.4 获取对话消息列表

```bash
curl -X GET "http://localhost:8080/api/mailbox/conversations/1/messages?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4.5 标记对话为已读

```bash
curl -X PUT "http://localhost:8080/api/mailbox/conversations/1/read" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 五、提醒设置接口测试

### 5.1 获取提醒设置

```bash
curl -X GET "http://localhost:8080/api/mailbox/notification-settings" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5.2 更新提醒设置

```bash
curl -X PUT "http://localhost:8080/api/mailbox/notification-settings" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enableNotifications": true,
    "esoulLetterEnabled": true,
    "resonanceEnabled": true,
    "systemMessageEnabled": true,
    "userMessageEnabled": true,
    "quietHoursStart": "22:00",
    "quietHoursEnd": "08:00",
    "soundEnabled": true
  }'
```

---

## 六、测试场景示例

### 场景1: 完整的E-SOUL来信流程

```bash
# 1. 触发来信
TOKEN="YOUR_TOKEN"
RESPONSE=$(curl -s -X POST "http://localhost:8080/api/mailbox/esoul-letters" \
  -H "Authorization: Bearer $TOKEN")

MESSAGE_ID=$(echo $RESPONSE | jq -r '.messageId')

# 2. 查看来信详情
curl -X GET "http://localhost:8080/api/mailbox/messages/$MESSAGE_ID" \
  -H "Authorization: Bearer $TOKEN"

# 3. 标记为已读
curl -X PUT "http://localhost:8080/api/mailbox/messages/$MESSAGE_ID/read" \
  -H "Authorization: Bearer $TOKEN"

# 4. 回复来信
curl -X POST "http://localhost:8080/api/mailbox/esoul-letters/$MESSAGE_ID/reply" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "谢谢你的来信！"}'
```

### 场景2: 创建对话并发送消息

```bash
# 1. 创建对话
TOKEN="YOUR_TOKEN"
CONV_RESPONSE=$(curl -s -X POST "http://localhost:8080/api/mailbox/conversations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participant2Id": 2,
    "initialMessage": "你好！"
  }')

CONV_ID=$(echo $CONV_RESPONSE | jq -r '.data.id')

# 2. 发送消息
curl -X POST "http://localhost:8080/api/mailbox/conversations/$CONV_ID/messages" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "这是一条测试消息",
    "messageType": "text"
  }'

# 3. 获取消息列表
curl -X GET "http://localhost:8080/api/mailbox/conversations/$CONV_ID/messages" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 七、Postman测试集合

可以使用以下JSON导入到Postman进行测试：

```json
{
  "info": {
    "name": "跨时空信箱API测试",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    },
    {
      "key": "token",
      "value": "YOUR_TOKEN_HERE"
    }
  ],
  "item": [
    {
      "name": "获取消息列表",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/api/mailbox/messages?page=0&size=20",
          "host": ["{{baseUrl}}"],
          "path": ["api", "mailbox", "messages"],
          "query": [
            {"key": "page", "value": "0"},
            {"key": "size", "value": "20"}
          ]
        }
      }
    }
  ]
}
```

---

## 八、常见问题

### 8.1 认证失败

**问题**: 401 Unauthorized  
**解决**: 
- 检查token是否过期
- 确认Authorization header格式正确：`Bearer YOUR_TOKEN`

### 8.2 权限不足

**问题**: 403 Forbidden  
**解决**: 
- 确认用户ID正确
- 检查是否有权限访问该资源

### 8.3 数据不存在

**问题**: 404 Not Found  
**解决**: 
- 确认资源ID正确
- 检查资源是否属于当前用户

---

**文档状态**: 测试指南已创建


