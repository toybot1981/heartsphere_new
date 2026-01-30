# SSE Hook使用指南

## 概述

`useSseStream` Hook提供了统一的SSE流式响应处理能力，支持自动重连、错误处理和状态管理。

## 基础使用

```typescript
import { useSseStream } from '@heartsphere/shared-frontend';

function MyComponent() {
  const { status, error, connect, disconnect } = useSseStream({
    url: '/api/my/stream',
    eventHandlers: {
      message: (data) => {
        console.log('Message:', data);
      },
    },
  });

  return (
    <div>
      <p>Status: {status}</p>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

## 选项说明

### url (必需)
SSE连接的URL。

### eventHandlers (必需)
事件处理器映射，key为事件类型，value为处理函数。

### enabled (可选)
是否启用连接，默认`true`。设置为`false`时会断开连接。

### autoReconnect (可选)
是否自动重连，默认`true`。

### maxReconnectAttempts (可选)
最大重连次数，默认`5`。

### reconnectInterval (可选)
重连间隔（毫秒），默认`3000`。

### onConnect (可选)
连接成功回调。

### onDisconnect (可选)
断开连接回调。

### onError (可选)
错误回调。

## 返回值

- `status`: 连接状态（`connecting` | `connected` | `disconnected` | `error`）
- `error`: 错误信息（如果有）
- `reconnectAttempts`: 重连次数
- `connect`: 手动连接函数
- `disconnect`: 手动断开函数

## 示例

### 示例1：聊天流式响应

```typescript
function ChatComponent() {
  const [messages, setMessages] = useState<string[]>([]);
  const [streamingContent, setStreamingContent] = useState('');

  const { status } = useSseStream({
    url: '/api/chat/stream',
    eventHandlers: {
      message: (data: { content: string }) => {
        setStreamingContent(prev => prev + data.content);
      },
      complete: () => {
        setMessages(prev => [...prev, streamingContent]);
        setStreamingContent('');
      },
    },
  });

  return (
    <div>
      {messages.map((msg, i) => <div key={i}>{msg}</div>)}
      {streamingContent && <div>{streamingContent}▊</div>}
    </div>
  );
}
```

### 示例2：进度更新

```typescript
function ProgressComponent() {
  const [progress, setProgress] = useState(0);

  useSseStream({
    url: '/api/task/123/stream',
    eventHandlers: {
      progress: (data: { percent: number }) => {
        setProgress(data.percent);
      },
      complete: () => {
        console.log('Task completed');
      },
    },
  });

  return <div>Progress: {progress}%</div>;
}
```

## 最佳实践

1. **条件连接**：使用`enabled`选项控制连接时机
2. **错误处理**：始终提供`error`事件处理器
3. **资源清理**：组件卸载时自动断开连接
4. **状态管理**：使用`status`显示连接状态
