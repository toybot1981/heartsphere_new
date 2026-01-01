# 邮箱API全面测试计划

## 测试用户

1. **tongyexin** / 123456
2. **ty1** / Tyx@1234
3. **heartsphere** / Tyx@1234

## 测试环境

- API地址: `http://localhost:8081/api`
- 数据库: `heartsphere` (MySQL)
- 数据库表: `mailbox_messages`

## 测试API列表

### 基础API

1. **POST** `/api/mailbox/messages` - 创建消息
2. **GET** `/api/mailbox/messages` - 获取消息列表（支持多种查询参数）
3. **GET** `/api/mailbox/messages/{id}` - 获取消息详情
4. **PUT** `/api/mailbox/messages/{id}/read` - 标记为已读
5. **PUT** `/api/mailbox/messages/{id}/important` - 标记/取消重要
6. **PUT** `/api/mailbox/messages/{id}/star` - 收藏/取消收藏
7. **DELETE** `/api/mailbox/messages/{id}` - 删除消息
8. **DELETE** `/api/mailbox/messages/batch` - 批量删除消息
9. **GET** `/api/mailbox/messages/unread/count` - 获取未读数量

## 测试阶段

### 阶段1: 用户登录和基础验证 ✅

**目标**: 验证三个用户能够成功登录，获取token和user_id，并验证数据库中的用户数据。

**测试步骤**:
1. 登录用户 tongyexin
2. 登录用户 ty1
3. 登录用户 heartsphere
4. 验证每个用户在数据库中的记录

**数据库验证**:
```sql
SELECT id, username FROM users WHERE username IN ('tongyexin', 'ty1', 'heartsphere');
```

**执行命令**:
```bash
bash test_mailbox_stage1.sh
```

---

### 阶段2: 创建消息API测试

**目标**: 测试创建消息API，验证消息正确保存到数据库。

**测试用例**:
1. 用户1创建普通消息
2. 用户1创建重要消息
3. 用户2创建E-SOUL类型消息（模拟）
4. 用户3创建系统消息（模拟）

**API请求示例**:
```json
POST /api/mailbox/messages
{
  "senderType": "user",
  "senderId": <user_id>,
  "senderName": "tongyexin",
  "messageType": "text",
  "messageCategory": "user_message",
  "title": "测试消息",
  "content": "这是测试消息内容",
  "isRead": false,
  "isImportant": false,
  "isStarred": false
}
```

**数据库验证**:
```sql
SELECT id, receiver_id, sender_type, title, content, is_read, is_important, is_starred, created_at
FROM mailbox_messages
WHERE receiver_id = <user_id>
ORDER BY created_at DESC
LIMIT 10;
```

---

### 阶段3: 获取消息列表API测试

**目标**: 测试各种查询参数，验证返回结果和数据库数据一致。

**测试用例**:
1. 获取所有消息（默认）
2. 按分类筛选（category=esoul_letter, resonance, system, user_message）
3. 筛选未读消息（isRead=false）
4. 筛选重要消息（isImportant=true）
5. 筛选收藏消息（isStarred=true）
6. 按时间范围筛选（startDate, endDate）
7. 关键词搜索（keyword）
8. 分页测试（page, size）

**API请求示例**:
```bash
# 获取所有消息
GET /api/mailbox/messages?page=0&size=20

# 获取未读消息
GET /api/mailbox/messages?isRead=false

# 搜索消息
GET /api/mailbox/messages?keyword=测试
```

**数据库验证**:
```sql
-- 验证总数
SELECT COUNT(*) FROM mailbox_messages WHERE receiver_id = <user_id> AND deleted_at IS NULL;

-- 验证未读数量
SELECT COUNT(*) FROM mailbox_messages WHERE receiver_id = <user_id> AND is_read = false AND deleted_at IS NULL;
```

---

### 阶段4: 消息详情API测试

**目标**: 测试获取单个消息详情，验证数据准确性。

**测试用例**:
1. 获取存在的消息详情
2. 尝试获取其他用户的消息（应返回403或404）
3. 尝试获取不存在的消息（应返回404）

**API请求示例**:
```bash
GET /api/mailbox/messages/{messageId}
```

**数据库验证**:
```sql
SELECT * FROM mailbox_messages WHERE id = <message_id> AND receiver_id = <user_id>;
```

---

### 阶段5: 标记操作API测试

**目标**: 测试标记已读、重要、收藏功能，验证数据库字段更新。

**测试用例**:
1. 标记消息为已读
2. 取消已读状态（通过再次标记？）
3. 标记消息为重要
4. 取消重要标记
5. 标记消息为收藏
6. 取消收藏标记

**API请求示例**:
```json
# 标记已读
PUT /api/mailbox/messages/{id}/read

# 标记重要
PUT /api/mailbox/messages/{id}/important
{
  "isImportant": true
}

# 标记收藏
PUT /api/mailbox/messages/{id}/star
{
  "isStarred": true
}
```

**数据库验证**:
```sql
-- 验证已读状态和read_at时间
SELECT id, is_read, read_at FROM mailbox_messages WHERE id = <message_id>;

-- 验证重要状态
SELECT id, is_important FROM mailbox_messages WHERE id = <message_id>;

-- 验证收藏状态
SELECT id, is_starred FROM mailbox_messages WHERE id = <message_id>;
```

---

### 阶段6: 删除操作API测试

**目标**: 测试单个删除和批量删除，验证软删除机制。

**测试用例**:
1. 删除单条消息（软删除）
2. 批量删除消息
3. 尝试删除其他用户的消息（应返回403或404）
4. 验证删除后的消息不在列表中显示

**API请求示例**:
```bash
# 删除单条消息
DELETE /api/mailbox/messages/{id}

# 批量删除
DELETE /api/mailbox/messages/batch
{
  "messageIds": [1, 2, 3]
}
```

**数据库验证**:
```sql
-- 验证软删除（deleted_at字段）
SELECT id, deleted_at FROM mailbox_messages WHERE id = <message_id>;

-- 验证删除后的消息不在查询结果中
SELECT COUNT(*) FROM mailbox_messages WHERE receiver_id = <user_id> AND deleted_at IS NULL;
```

---

### 阶段7: 未读数量API测试

**目标**: 测试未读数量统计，验证按分类统计的准确性。

**测试用例**:
1. 获取总未读数量
2. 验证各分类的未读数量（esoul_letter, resonance, system, user_message）
3. 标记消息为已读后验证数量变化

**API请求示例**:
```bash
GET /api/mailbox/messages/unread/count
```

**预期响应**:
```json
{
  "total": 5,
  "byCategory": {
    "esoul_letter": 2,
    "resonance": 1,
    "system": 1,
    "user_message": 1
  }
}
```

**数据库验证**:
```sql
-- 验证总未读数量
SELECT COUNT(*) FROM mailbox_messages 
WHERE receiver_id = <user_id> AND is_read = false AND deleted_at IS NULL;

-- 验证各分类未读数量
SELECT message_category, COUNT(*) as count
FROM mailbox_messages
WHERE receiver_id = <user_id> AND is_read = false AND deleted_at IS NULL
GROUP BY message_category;
```

---

## 测试数据验证清单

每个测试阶段都需要验证以下数据库字段：

### mailbox_messages 表字段验证

- ✅ `id` - 消息ID（自动生成）
- ✅ `receiver_id` - 接收者用户ID（外键关联users表）
- ✅ `sender_type` - 发送者类型（枚举：esoul/heartsphere/system/user）
- ✅ `sender_id` - 发送者ID
- ✅ `sender_name` - 发送者名称
- ✅ `sender_avatar` - 发送者头像URL
- ✅ `message_type` - 消息类型
- ✅ `message_category` - 消息分类（枚举：esoul_letter/resonance/system/user_message）
- ✅ `title` - 消息标题
- ✅ `content` - 消息内容
- ✅ `content_data` - 消息扩展数据（JSON格式）
- ✅ `is_read` - 是否已读（默认false）
- ✅ `is_important` - 是否重要（默认false）
- ✅ `is_starred` - 是否收藏（默认false）
- ✅ `related_id` - 关联对象ID
- ✅ `related_type` - 关联对象类型
- ✅ `reply_to_id` - 回复的消息ID
- ✅ `read_at` - 阅读时间（标记已读时更新）
- ✅ `deleted_at` - 删除时间（软删除，NULL表示未删除）
- ✅ `created_at` - 创建时间（自动生成）

---

## 执行测试

### 前置条件

1. 后端应用正在运行（端口8081）
2. 数据库已连接并可访问
3. 三个测试用户已存在于数据库中

### 执行步骤

1. **阶段1**: 运行登录测试
   ```bash
   bash test_mailbox_stage1.sh
   ```

2. **阶段2-7**: 按顺序执行后续测试脚本（待创建）

### 测试报告

每个阶段测试完成后，会生成测试报告，包括：
- 测试用例总数
- 通过数量
- 失败数量
- 失败的详细信息和原因

---

## 注意事项

1. **数据隔离**: 每个用户只能访问自己的消息
2. **软删除**: 删除操作不会物理删除数据，而是设置`deleted_at`字段
3. **时间字段**: `created_at`自动生成，`read_at`在标记已读时更新
4. **权限验证**: 所有API都需要JWT token认证
5. **数据一致性**: API返回的数据必须与数据库中的数据一致
