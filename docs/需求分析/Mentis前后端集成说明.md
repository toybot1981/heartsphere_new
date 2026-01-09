# Mentis 前后端集成说明

**日期**：2025-01-06  
**状态**：已完成基础集成

---

## 一、API 接口映射

### 1. 对话相关接口

| 前端方法 | 后端接口 | 方法 | 说明 |
|---------|---------|------|------|
| `sendMessage()` | `/api/mentis/chat/send` | POST | 发送消息（同步） |
| `sendMessageStream()` | `/api/mentis/chat/stream` | POST | 发送消息（流式） |

### 2. 会话管理接口

| 前端方法 | 后端接口 | 方法 | 说明 |
|---------|---------|------|------|
| `createSession()` | `/api/mentis/sessions` | POST | 创建会话 |
| `getSessions()` | `/api/mentis/sessions` | GET | 获取会话列表 |
| `getSession()` | `/api/mentis/sessions/{sessionId}` | GET | 获取会话详情 |
| `updateSessionStatus()` | `/api/mentis/sessions/{sessionId}/status` | PUT | 更新会话状态 |
| `deleteSession()` | `/api/mentis/sessions/{sessionId}` | DELETE | 删除会话 |

### 3. 任务管理接口

| 前端方法 | 后端接口 | 方法 | 说明 |
|---------|---------|------|------|
| `getTasks()` | `/api/mentis/tasks?sessionId={sessionId}` | GET | 获取任务列表 |
| `getTask()` | `/api/mentis/tasks/{taskId}` | GET | 获取任务详情 |
| `cancelTask()` | `/api/mentis/tasks/{taskId}/cancel` | POST | 取消任务 |

### 4. 虚拟机管理接口

| 前端方法 | 后端接口 | 方法 | 说明 |
|---------|---------|------|------|
| `getVmStatus()` | `/api/mentis/vm/{sessionId}/status` | GET | 获取虚拟机状态 |
| `createVmSnapshot()` | `/api/mentis/vm/{sessionId}/snapshot` | POST | 创建快照 |
| `restoreVmSnapshot()` | `/api/mentis/vm/{sessionId}/restore` | POST | 恢复快照 |
| `getVmScreenshot()` | `/api/mentis/vm/{sessionId}/screenshot` | GET | 获取截图 |
| `getVmStatistics()` | `/api/mentis/vm/statistics` | GET | 获取统计信息 |

---

## 二、数据格式

### 1. 请求格式

#### ChatRequest
```typescript
interface ChatRequest {
  sessionId?: string;
  message: string;
  taskType?: 'COMMAND' | 'SCRIPT' | 'INTERACTIVE' | 'COMPUTER_USE';
  parameters?: Record<string, any>;
  enableComputerUse?: boolean;
}
```

对应后端 `ChatRequestDTO`：
```java
public class ChatRequestDTO {
    private String sessionId;
    private String message;
    private String taskType;
    private Map<String, Object> parameters;
    private Boolean enableComputerUse = true;
}
```

### 2. 响应格式

#### ChatResponse
```typescript
interface ChatResponse {
  sessionId: string;
  messageId: string;
  response: string;
  taskId?: string;
  taskStatus?: string;
  result?: Record<string, any>;
  conversationHistory?: MentisMessage[];
  vmState?: Record<string, any>;
}
```

对应后端 `ChatResponseDTO`：
```java
public class ChatResponseDTO {
    private String sessionId;
    private String messageId;
    private String response;
    private String taskId;
    private String taskStatus;
    private Map<String, Object> result;
    private List<MentisMessageDTO> conversationHistory;
    private Map<String, Object> vmState;
}
```

### 3. 统一响应格式

所有接口都使用 `ApiResponse<T>` 包装：

```typescript
interface ApiResponse<T> {
  code: number;      // 200 表示成功
  message?: string;  // 错误信息
  data: T;          // 实际数据
}
```

后端对应：
```java
public class ApiResponse<T> {
    private Integer code;
    private String message;
    private T data;
}
```

---

## 三、认证配置

### 1. Token 存储

前端在 `localStorage` 或 `sessionStorage` 中存储 token：
```typescript
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
```

### 2. 请求头

所有请求自动添加 Authorization 头：
```typescript
headers['Authorization'] = `Bearer ${token}`;
```

### 3. 错误处理

- **401 未授权**：自动清除 token 并跳转登录页
- **403 禁止访问**：显示无权访问错误
- **404 未找到**：显示资源不存在错误
- **500+ 服务器错误**：显示服务器错误提示

---

## 四、流式响应处理

### 1. 后端实现

使用 Spring 的 `SseEmitter` 实现流式响应：

```java
@PostMapping("/stream")
public SseEmitter chatStream(@RequestBody ChatRequestDTO request, ...) {
    SseEmitter emitter = new SseEmitter(300000L); // 5分钟超时
    
    // 发送消息事件
    emitter.send(SseEmitter.event().name("message").data(chunk));
    
    // 发送完成事件
    emitter.send(SseEmitter.event().name("complete").data("..."));
    
    return emitter;
}
```

### 2. 前端实现

使用 `fetch` API 读取流式响应：

```typescript
const response = await fetch(url, {
  method: 'POST',
  headers: { ... },
  body: JSON.stringify(request)
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  // 解析 SSE 格式: event: message\ndata: {...}\n\n
  // 调用 onMessage 回调
}
```

### 3. SSE 事件类型

- `message` - 消息事件（ChatResponse 对象）
- `complete` - 完成事件
- `error` - 错误事件

---

## 五、路由配置

### 前端路由

需要在 `App.tsx` 或路由配置文件中添加：

```typescript
<Route path="/mentis" element={<SessionListPage />} />
<Route path="/mentis/:sessionId" element={<MentisPage />} />
```

### 后端 CORS 配置

确保后端允许前端域名访问：

```java
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
```

或者在 `WebSecurityConfig` 中配置全局 CORS。

---

## 六、使用示例

### 1. 发送消息

```typescript
try {
  const response = await MentisApiService.sendMessage({
    sessionId: 'mentis_xxx',
    message: '帮我执行 ls 命令',
    enableComputerUse: true
  });
  
  console.log('响应:', response.response);
  console.log('任务ID:', response.taskId);
} catch (error) {
  console.error('发送失败:', error);
}
```

### 2. 流式发送消息

```typescript
const closeStream = await MentisApiService.sendMessageStream(
  {
    sessionId: 'mentis_xxx',
    message: '帮我执行 ls 命令',
    enableComputerUse: true
  },
  (chunk) => {
    // 收到部分响应
    console.log('收到:', chunk.response);
  },
  (error) => {
    // 错误处理
    console.error('错误:', error);
  },
  () => {
    // 完成回调
    console.log('流式响应完成');
  }
);

// 稍后可以关闭流
// closeStream();
```

### 3. 创建会话

```typescript
const session = await MentisApiService.createSession('我的新会话');
console.log('会话ID:', session.sessionId);
```

### 4. 获取任务列表

```typescript
const tasks = await MentisApiService.getTasks('mentis_xxx');
tasks.forEach(task => {
  console.log('任务:', task.description, '状态:', task.status);
});
```

---

## 七、错误处理策略

### 1. 网络错误

- 显示友好提示
- 提供重试按钮
- 记录错误日志

### 2. 业务错误

- 显示错误消息
- 根据错误码采取不同处理
- 记录到日志系统

### 3. 超时处理

- 设置合理的超时时间（默认 60 秒）
- 超时后显示提示
- 允许用户取消请求

---

## 八、性能优化

### 1. 请求优化

- 使用请求拦截器统一添加认证头
- 使用响应拦截器统一处理错误
- 实现请求去重和防抖

### 2. 数据缓存

- 会话列表缓存
- 任务列表缓存
- 使用 React Query 或 SWR 进行数据管理

### 3. 流式响应优化

- 实现断线重连
- 缓冲处理
- 优化解析性能

---

## 九、测试建议

### 1. 单元测试

- 测试 API 服务的各个方法
- 测试错误处理
- 测试数据转换

### 2. 集成测试

- 测试完整的用户流程
- 测试前后端数据同步
- 测试流式响应

### 3. E2E 测试

- 测试完整的对话流程
- 测试任务创建和执行
- 测试虚拟机管理

---

## 十、已知问题和待优化

### 1. 流式响应

- [ ] 实现断线重连机制
- [ ] 优化 SSE 解析性能
- [ ] 添加进度指示

### 2. 错误处理

- [ ] 完善错误类型定义
- [ ] 统一错误处理逻辑
- [ ] 添加错误重试机制

### 3. 性能优化

- [ ] 实现请求缓存
- [ ] 优化大数据量传输
- [ ] 实现请求合并

---

## 十一、总结

前后端集成已完成基础功能：

1. ✅ API 接口映射完成
2. ✅ 数据格式统一
3. ✅ 认证配置完成
4. ✅ 流式响应实现
5. ✅ 错误处理完善

后续需要：
- 完善流式响应的错误处理
- 优化性能
- 添加更多测试
- 完善文档

---

**更新时间**：2025-01-06
