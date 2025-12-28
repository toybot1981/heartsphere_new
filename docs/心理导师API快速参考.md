# 心理导师系统 API 快速参考

## 基础信息

- **Base URL**: `http://localhost:8082/api/psychology`
- **Content-Type**: `application/json`
- **响应格式**: JSON

---

## 会话管理

### 1. 开始会话
```
POST /sessions/start
```

**请求体**:
```json
{
  "userId": "string (必填)",
  "moodScore": 1-10 (必填),
  "stressLevel": 1-10 (必填),
  "sleepQuality": 1-10 (必填),
  "primaryConcern": "string (必填)",
  "goals": ["string"],
  "selectedMethodId": "cbt|dbt|psychodynamic|act|humanistic (必填)",
  "hasPreviousTherapy": boolean,
  "previousTherapyNotes": "string"
}
```

**响应**: `TherapySession` 对象

---

### 2. 发送消息
```
POST /sessions/{sessionId}/message
```

**请求体**:
```json
{
  "message": "string (必填)"
}
```

**响应**: `ChatMessage` 对象

---

### 3. 结束会话
```
POST /sessions/{sessionId}/end
```

**响应**: `TherapySession` 对象（含总结）

---

### 4. 获取会话详情
```
GET /sessions/{sessionId}
```

**响应**: `TherapySession` 对象

---

### 5. 获取消息历史
```
GET /sessions/{sessionId}/messages
```

**响应**: `ChatMessage[]` 数组

---

## 疗法与案例

### 6. 获取所有疗法
```
GET /methods
```

**响应**: `TherapyMethod[]` 数组

**示例**:
```json
[
  {
    "id": "cbt",
    "name": "认知行为疗法 (CBT)",
    "shortName": "CBT",
    "description": "通过识别并改变功能不良的认知和行为，缓解情感痛苦。",
    "therapistName": "Cognos 博士",
    "therapistAvatar": "🧠",
    "themeColor": "bg-blue-100 text-blue-800 border-blue-200",
    "keyTechniques": ["认知重构", "行为激活", "苏格拉底式提问"],
    "syllabus": [
      {
        "phase": 1,
        "title": "认知模型入门",
        "description": "理解情境、想法与情绪的联动机制",
        "durationWeeks": 1
      }
      // ... 更多阶段
    ]
  }
  // ... 更多疗法
]
```

---

### 7. 获取特定疗法
```
GET /methods/{methodId}
```

**methodId**: `cbt` | `dbt` | `psychodynamic` | `act` | `humanistic`

**响应**: `TherapyMethod` 对象

---

### 8. 获取所有案例
```
GET /cases
```

**响应**: `ClinicalCase[]` 数组

**示例**:
```json
[
  {
    "id": "case-1",
    "category": "亲密关系",
    "title": "夫妻沟通：权力争夺与冷暴力",
    "manifestation": "双方一开口就吵架...",
    "rootCause": "源于不安全的依恋模式...",
    "solution": "应用戈特曼沟通技巧...",
    "recommendedMethodId": "humanistic",
    "tags": ["婚姻", "沟通", "冷暴力"],
    "difficulty": "MODERATE",
    "verified": true
  }
  // ... 更多案例
]
```

---

### 9. 推荐疗法
```
GET /cases/recommend?concern={string}
```

**Query 参数**: `concern` - 用户的困扰描述

**响应**: `TherapyMethod[]` 数组（匹配的疗法）

**示例**:
```bash
GET /cases/recommend?concern=原生家庭创伤
```

---

## 深度功能

### 10. 生成深度知识
```
POST /deep-dive
```

**请求体**:
```json
{
  "methodId": "cbt (必填)",
  "phaseTitle": "string (必填)",
  "phaseDescription": "string (必填)"
}
```

**响应**:
```json
{
  "content": "生成的深度学术解析内容（1000+字）"
}
```

---

### 11. 健康检查
```
GET /health
```

**响应**:
```json
{
  "status": "UP",
  "service": "Psychology Mentor Service",
  "version": "1.0.0"
}
```

---

## 错误响应

### 400 Bad Request
```json
{
  "error": "BAD_REQUEST",
  "message": "会话不存在: xxx"
}
```

### 500 Internal Server Error
```json
{
  "error": "INTERNAL_ERROR",
  "message": "服务器内部错误: ..."
}
```

---

## 疗法 ID 速查表

| 疗法 | ID | 治疗师 | 专长 |
|------|----|--------|------|
| CBT | `cbt` | Dr. Cognos 🧠 | 焦虑、抑郁、恐惧 |
| DBT | `dbt` | Sage Harmony ⚖️ | 情绪调节、成瘾 |
| 心理动力学 | `psychodynamic` | Prof. Freudia 🛋️ | 原生家庭、创伤 |
| ACT | `act` | Guide River 🌊 | 灾难化、空心病 |
| 人本主义 | `humanistic` | Alex Beacon ❤️ | 自尊、亲密关系 |

---

## 案例分类速查表

| 分类 | 案例数 | 案例 ID |
|------|--------|---------|
| 亲密关系 | 3 | case-1, case-14, ... |
| 情绪障碍 | 3 | case-2, case-10, case-17 |
| 职场与自我 | 2 | case-3, case-7 |
| 焦虑障碍 | 2 | case-4, case-5 |
| 原生家庭 | 3 | case-6, case-11, case-16 |
| 青少年 | 1 | case-8 |
| 成瘾行为 | 1 | case-9 |
| 身体意象 | 1 | case-12 |
| 睡眠障碍 | 1 | case-13 |
| 性格卡点 | 1 | case-15 |

---

## 完整工作流示例

```bash
# 1. 开始会话
SESSION=$(curl -s -X POST http://localhost:8082/api/psychology/sessions/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-001",
    "moodScore": 5,
    "stressLevel": 7,
    "sleepQuality": 4,
    "primaryConcern": "工作压力大，经常焦虑",
    "goals": ["学会管理焦虑"],
    "selectedMethodId": "cbt"
  }' | jq -r '.sessionId')

echo "Session ID: $SESSION"

# 2. 发送消息
curl -X POST http://localhost:8082/api/psychology/sessions/$SESSION/message \
  -H "Content-Type: application/json" \
  -d '{"message": "我最近工作压力很大，总是担心做不好"}'

# 3. 继续对话
curl -X POST http://localhost:8082/api/psychology/sessions/$SESSION/message \
  -H "Content-Type: application/json" \
  -d '{"message": "晚上睡不着，脑子里一直在想工作的事"}'

# 4. 结束会话
curl -X POST http://localhost:8082/api/psychology/sessions/$SESSION/end

# 5. 查看总结
curl http://localhost:8082/api/psychology/sessions/$SESSION
```

---

## TypeScript 类型定义

```typescript
// 请求类型
interface SessionIntakeRequest {
  userId: string;
  moodScore: number;        // 1-10
  stressLevel: number;      // 1-10
  sleepQuality: number;     // 1-10
  primaryConcern: string;
  goals: string[];
  selectedMethodId: 'cbt' | 'dbt' | 'psychodynamic' | 'act' | 'humanistic';
  hasPreviousTherapy?: boolean;
  previousTherapyNotes?: string;
}

// 响应类型
interface TherapySession {
  sessionId: string;
  userId: string;
  therapyMethodId: string;
  status: 'INTAKE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  currentPhase: number;
  startTime: string;        // ISO 8601
  endTime?: string;
  sessionSummary?: string;
  keyIssues?: string[];
  learnedTechniques?: string[];
}

interface ChatMessage {
  messageId: string;
  sessionId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  timestamp: string;        // ISO 8601
}
```

---

**最后更新**: 2025-12-27
**API 版本**: v1.0.0
