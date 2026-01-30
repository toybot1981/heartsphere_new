# 脚本执行可视化窗口设计文档

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         ExecutionMonitor Component                │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  useLogStream Hook                          │  │  │
│  │  │  - EventSource Connection                  │  │  │
│  │  │  - Log State Management                    │  │  │
│  │  │  - Auto Reconnect                          │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Log Display Area                          │  │  │
│  │  │  - Real-time Log Rendering                 │  │  │
│  │  │  - Auto Scroll                            │  │  │
│  │  │  - Search & Filter                        │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  │                                                  │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Control Panel                             │  │  │
│  │  │  - Status Indicator                        │  │  │
│  │  │  - Cancel Button                           │  │  │
│  │  │  - Download Button                         │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                         │
                         │ SSE (Server-Sent Events)
                         │
┌───────────────────────▼─────────────────────────────────┐
│                  Backend (Spring Boot)                   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  DevOpsWorkbenchController                        │  │
│  │  GET /executions/{id}/logs/stream                │  │
│  │  - Returns SseEmitter                            │  │
│  └───────────────────────┬──────────────────────────┘  │
│                          │                              │
│  ┌───────────────────────▼──────────────────────────┐  │
│  │  LogStreamService                                │  │
│  │  - Manage SSE Connections                       │  │
│  │  - Push Log Messages                            │  │
│  │  - Cleanup Connections                          │  │
│  └───────────────────────┬──────────────────────────┘  │
│                          │                              │
│  ┌───────────────────────▼──────────────────────────┐  │
│  │  ScriptExecutionEngine                          │  │
│  │  - Execute Script                               │  │
│  │  - Capture Output                               │  │
│  │  - Push to LogStreamService                     │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## 后端设计

### LogStreamService

**职责**：
- 管理 SSE 连接（每个执行任务可能有多个客户端连接）
- 接收日志消息并推送给所有连接的客户端
- 清理已完成的执行任务的连接

**实现要点**：

```java
@Service
public class LogStreamService {
    // 存储每个执行任务的 SSE 连接列表
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
    
    /**
     * 添加 SSE 连接
     */
    public void addEmitter(Long executionId, SseEmitter emitter) {
        emitters.computeIfAbsent(executionId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        
        // 设置连接完成和超时回调
        emitter.onCompletion(() -> removeEmitter(executionId, emitter));
        emitter.onTimeout(() -> removeEmitter(executionId, emitter));
    }
    
    /**
     * 推送日志消息
     */
    public void pushLog(Long executionId, String logLine, String level) {
        List<SseEmitter> executionEmitters = emitters.get(executionId);
        if (executionEmitters == null) return;
        
        // 构建 SSE 消息格式
        String message = String.format("data: %s\n\n", 
            JSON.toJSONString(Map.of(
                "timestamp", System.currentTimeMillis(),
                "level", level,
                "message", logLine
            ))
        );
        
        // 推送给所有连接的客户端
        executionEmitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                    .data(message)
                    .name("log"));
            } catch (IOException e) {
                // 连接已断开，移除
                removeEmitter(executionId, emitter);
            }
        });
    }
    
    /**
     * 推送执行状态更新
     */
    public void pushStatus(Long executionId, String status) {
        // 类似 pushLog，但推送状态信息
    }
    
    /**
     * 移除连接
     */
    private void removeEmitter(Long executionId, SseEmitter emitter) {
        List<SseEmitter> executionEmitters = emitters.get(executionId);
        if (executionEmitters != null) {
            executionEmitters.remove(emitter);
            if (executionEmitters.isEmpty()) {
                emitters.remove(executionId);
            }
        }
    }
    
    /**
     * 清理执行任务的所有连接
     */
    public void cleanup(Long executionId) {
        List<SseEmitter> executionEmitters = emitters.remove(executionId);
        if (executionEmitters != null) {
            executionEmitters.forEach(SseEmitter::complete);
        }
    }
}
```

### ScriptExecutionEngine 修改

**修改点**：
- 在执行脚本时，将日志输出实时推送到 `LogStreamService`
- 同时保持原有的日志文件写入功能

```java
@Component
public class ScriptExecutionEngine {
    @Autowired
    private LogStreamService logStreamService;
    
    private void execute(ScriptExecution execution, ScriptInfoDTO script, Map<String, Object> parameters) {
        // ... 现有代码 ...
        
        try (BufferedReader stdoutReader = ...;
             BufferedReader stderrReader = ...;
             PrintWriter logWriter = ...) {
            
            // 读取标准输出
            CompletableFuture<Void> stdoutFuture = CompletableFuture.runAsync(() -> {
                stdoutReader.lines().forEach(line -> {
                    output.append(line).append("\n");
                    logWriter.println(line);
                    logWriter.flush();
                    
                    // 实时推送到 SSE
                    logStreamService.pushLog(execution.getId(), line, "INFO");
                });
            });
            
            // 读取错误输出
            CompletableFuture<Void> stderrFuture = CompletableFuture.runAsync(() -> {
                stderrReader.lines().forEach(line -> {
                    error.append(line).append("\n");
                    logWriter.println("[ERROR] " + line);
                    logWriter.flush();
                    
                    // 实时推送到 SSE
                    logStreamService.pushLog(execution.getId(), line, "ERROR");
                });
            });
            
            // ... 等待执行完成 ...
            
            // 执行完成后，推送最终状态
            logStreamService.pushStatus(execution.getId(), execution.getStatus().name());
            logStreamService.cleanup(execution.getId());
        }
    }
}
```

### Controller 端点

```java
@RestController
@RequestMapping("/api/admin/devops")
public class DevOpsWorkbenchController {
    @Autowired
    private LogStreamService logStreamService;
    
    /**
     * SSE 日志流端点
     */
    @GetMapping(value = "/executions/{executionId}/logs/stream", 
                produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamLogs(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long executionId) {
        SystemAdmin admin = validateAdminToken(authHeader);
        
        // 验证执行任务是否存在且用户有权限查看
        ScriptExecution execution = scriptExecutionRepository.findById(executionId)
            .orElseThrow(() -> new RuntimeException("执行记录不存在"));
        
        // 创建 SSE 连接
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE); // 无超时限制
        logStreamService.addEmitter(executionId, emitter);
        
        // 如果执行已完成，立即推送历史日志
        if (execution.getStatus() != ScriptExecution.ExecutionStatus.RUNNING) {
            // 推送已保存的日志内容
            String logContent = execution.getOutput() + (execution.getError() != null ? "\n[ERROR] " + execution.getError() : "");
            // 分批推送历史日志
        }
        
        return emitter;
    }
}
```

## 前端设计

### useLogStream Hook

```typescript
interface LogMessage {
  timestamp: number;
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';
  message: string;
}

export const useLogStream = (executionId: number | null) => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [status, setStatus] = useState<string>('UNKNOWN');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!executionId) return;
    
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    
    // 构建 SSE URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/admin';
    const url = `${baseUrl}/devops/executions/${executionId}/logs/stream`;
    
    // 创建 EventSource 连接
    const eventSource = new EventSource(url, {
      // 注意：EventSource 不支持自定义 headers，需要其他方式传递 token
      // 方案1: 使用 URL 参数（不推荐，token 会暴露在 URL 中）
      // 方案2: 使用 WebSocket（更复杂）
      // 方案3: 使用 fetch + ReadableStream（推荐）
    });
    
    // 由于 EventSource 不支持自定义 headers，我们需要使用 fetch + ReadableStream
    // 或者使用专门的 SSE 库（如 eventsource-polyfill）
    
    // 接收日志消息
    eventSource.addEventListener('log', (event) => {
      const data = JSON.parse(event.data);
      setLogs(prev => [...prev, data]);
    });
    
    // 接收状态更新
    eventSource.addEventListener('status', (event) => {
      const data = JSON.parse(event.data);
      setStatus(data.status);
    });
    
    // 连接打开
    eventSource.onopen = () => {
      setConnected(true);
      setError(null);
    };
    
    // 连接错误
    eventSource.onerror = (err) => {
      setConnected(false);
      setError('连接错误，正在重连...');
      // 实现自动重连逻辑
    };
    
    // 清理
    return () => {
      eventSource.close();
    };
  }, [executionId]);
  
  return { logs, status, connected, error, clearLogs: () => setLogs([]) };
};
```

**注意**：由于原生 `EventSource` 不支持自定义 headers，我们需要使用替代方案：

1. **使用 fetch + ReadableStream**（推荐）：
```typescript
const streamLogs = async (executionId: number) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/admin';
  const url = `${baseUrl}/devops/executions/${executionId}/logs/stream`;
  const token = localStorage.getItem('admin_token');
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream',
    },
  });
  
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    // 解析 SSE 格式的数据
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.substring(6));
        // 处理日志数据
      }
    }
  }
};
```

2. **使用 eventsource-polyfill 库**（简单但需要额外依赖）

### ExecutionMonitor 组件

```typescript
interface ExecutionMonitorProps {
  executionId: number;
  onClose: () => void;
  onCancel?: () => void;
}

export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  executionId,
  onClose,
  onCancel,
}) => {
  const { logs, status, connected, error, clearLogs } = useLogStream(executionId);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);
  
  // 过滤日志
  const filteredLogs = logs.filter(log => 
    searchTerm === '' || log.message.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">执行监控: #{executionId}</h2>
            <StatusIndicator status={status} connected={connected} />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        
        {/* 控制栏 */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="搜索日志..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1 text-white"
          />
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-1 rounded text-sm ${
              autoScroll ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            {autoScroll ? '🟢 自动滚动' : '⏸️ 暂停滚动'}
          </button>
          <button
            onClick={clearLogs}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
          >
            清屏
          </button>
          {status === 'RUNNING' && onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              取消执行
            </button>
          )}
        </div>
        
        {/* 日志显示区域 */}
        <div
          ref={logContainerRef}
          className="flex-1 bg-black p-4 overflow-y-auto font-mono text-sm"
        >
          {filteredLogs.map((log, index) => (
            <div
              key={index}
              className={`mb-1 ${
                log.level === 'ERROR' ? 'text-red-400' :
                log.level === 'WARN' ? 'text-yellow-400' :
                log.level === 'DEBUG' ? 'text-gray-500' :
                'text-green-400'
              }`}
            >
              <span className="text-gray-600">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              {' '}
              {log.message}
            </div>
          ))}
          {error && (
            <div className="text-red-400 mt-4">⚠️ {error}</div>
          )}
        </div>
        
        {/* 底部统计 */}
        <div className="p-4 border-t border-slate-800 text-sm text-slate-400">
          共 {logs.length} 条日志 {searchTerm && `(过滤后: ${filteredLogs.length})`}
        </div>
      </div>
    </div>
  );
};
```

## 数据流

### 日志推送流程

```
1. ScriptExecutionEngine 执行脚本
   ↓
2. 捕获标准输出/错误输出
   ↓
3. 写入日志文件（原有功能）
   ↓
4. 调用 LogStreamService.pushLog()
   ↓
5. LogStreamService 推送给所有连接的 SSE 客户端
   ↓
6. 前端 EventSource/fetch 接收数据
   ↓
7. useLogStream Hook 更新状态
   ↓
8. ExecutionMonitor 组件重新渲染
```

### 状态同步流程

```
1. 脚本执行状态变更（RUNNING → SUCCESS/FAILED）
   ↓
2. ScriptExecutionEngine 更新数据库
   ↓
3. 调用 LogStreamService.pushStatus()
   ↓
4. 推送给所有连接的客户端
   ↓
5. 前端更新状态指示器
   ↓
6. 如果执行完成，清理 SSE 连接
```

## 性能考虑

### 后端优化
1. **连接管理**：使用 `ConcurrentHashMap` 和 `CopyOnWriteArrayList` 保证线程安全
2. **日志缓冲**：对于高频日志，可以批量推送以减少网络开销
3. **连接清理**：执行完成后及时清理连接，释放资源

### 前端优化
1. **虚拟滚动**：如果日志量很大（>1000 行），使用虚拟滚动优化渲染
2. **防抖搜索**：搜索输入使用防抖，避免频繁过滤
3. **内存管理**：限制日志条数，超过限制时移除旧日志

## 错误处理

### 后端错误处理
- SSE 连接异常：捕获 `IOException`，自动移除断开的连接
- 执行任务不存在：返回 404
- 权限不足：返回 403

### 前端错误处理
- 连接失败：显示错误提示，提供重连按钮
- 网络中断：自动重连机制（指数退避）
- 浏览器不支持：检测并回退到轮询模式

## 安全考虑

1. **权限验证**：SSE 端点需要验证用户权限
2. **Token 传递**：由于 EventSource 限制，使用 fetch + ReadableStream 或 URL 参数（需考虑安全性）
3. **连接限制**：限制每个执行任务的连接数，防止资源耗尽
4. **日志脱敏**：敏感信息（如密码、token）在推送前进行脱敏处理
