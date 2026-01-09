# AgentScope 工具系统适配性评估

## 评估日期

2026-01-09

## 评估目标

评估 AgentScope 的工具系统（AgentTool/Toolkit）是否能够满足 Computer-Use 场景的需求，包括接口适配性、工具管理机制和技术难点。

## 一、AgentTool 接口适配性评估

### 1.1 接口方法评估

#### 1.1.1 getName() 方法 ✅

**需求**: 工具需要有唯一的名称

**AgentScope 实现**:
```java
String getName();
```

**评估结果**: ✅ **满足需求**
- 返回工具名称（String）
- 用于工具注册和查找
- 可以设置为描述性的名称（如 "vm_manager", "computer_use"）

#### 1.1.2 getDescription() 方法 ✅

**需求**: 工具需要有清晰的描述，用于 Agent 理解工具的用途

**AgentScope 实现**:
```java
String getDescription();
```

**评估结果**: ✅ **满足需求**
- 返回工具描述（String）
- Agent 使用描述来决定是否调用工具
- 可以包含使用说明和参数说明

#### 1.1.3 getParameters() 方法 ✅

**需求**: 工具需要定义参数结构（JSON Schema），包括 sessionId

**AgentScope 实现**:
```java
Map<String, Object> getParameters();
```

**评估结果**: ✅ **满足需求**
- 返回 JSON Schema 格式的参数定义
- 支持定义必需参数、可选参数、参数类型、参数描述
- **可以定义 sessionId 为必需参数** ✅

#### 1.1.4 callAsync() 方法 ✅

**需求**: 工具需要支持异步执行，返回执行结果

**AgentScope 实现**:
```java
Mono<ToolResultBlock> callAsync(ToolCallParam param);
```

**评估结果**: ✅ **满足需求**
- 返回 `Mono<ToolResultBlock>`（响应式编程）
- 支持异步执行长时间运行的操作
- 可以使用 `Mono.timeout()` 设置超时

**关键 API**（已验证）:
- `ToolCallParam.getInput()` → `Map<String, Object>` ✅
- `ToolCallParam.getContext()` → `ToolExecutionContext` ✅
- `ToolCallParam.getAgent()` → `Agent` ✅

### 1.2 ToolCallParam 参数传递评估

#### 1.2.1 getInput() 方法 ✅

**实际 API**:
```java
Map<String, Object> getInput();
```

**评估结果**: ✅ **满足需求**
- 返回工具调用参数（`Map<String, Object>`）
- 参数键值对对应 JSON Schema 中定义的 properties
- **可以从 map 中提取 sessionId** ✅

**sessionId 传递验证**: ✅ **可行**
- sessionId 可以作为工具参数传入
- Agent 在调用工具时传入 sessionId（需要在系统提示词中说明）
- 工具从 `getInput()` 中提取 sessionId

**使用示例**:
```java
@Override
public Mono<ToolResultBlock> callAsync(ToolCallParam param) {
    Map<String, Object> args = param.getInput();  // ✅ 使用 getInput()
    String sessionId = (String) args.get("sessionId");
    String action = (String) args.get("action");
    // ...
}
```

#### 1.2.2 getContext() 方法 ⚠️

**实际 API**:
```java
ToolExecutionContext getContext();
```

**评估结果**: ⚠️ **可选方案**
- `ToolExecutionContext` 可能用于传递上下文信息
- 可以存储和获取自定义上下文数据
- **需要验证是否可以作为 sessionId 的传递方式**

**潜在用途**:
- 在 Agent 调用前设置 sessionId 到上下文
- 工具从上下文中获取 sessionId
- 避免在每个工具调用中都传入 sessionId

**验证需求**: 需要实际测试验证是否支持

### 1.3 ToolResultBlock 结果反馈评估

#### 1.3.1 结果结构 ✅

**实际 API**（已验证）:
```java
public class ToolResultBlock {
    String getId();
    String getName();
    List<ContentBlock> getOutput();  // ✅ 使用 getOutput()，不是 getContent()
    Map<String, Object> getMetadata();
    
    // 静态工厂方法
    static ToolResultBlock text(String text);      // ✅ 已确认
    static ToolResultBlock error(String error);    // ✅ 已确认
    static ToolResultBlock of(ContentBlock...);    // ✅ 已确认
    static ToolResultBlock of(List<ContentBlock>); // ✅ 已确认
}
```

**评估结果**: ✅ **满足需求**
- 支持多种结果格式（文本、错误、内容块列表）
- 支持元数据（metadata）
- 提供了便捷的静态工厂方法

#### 1.3.2 文本结果 ✅

**支持方式**:
```java
ToolResultBlock.text("执行结果");
```

**评估结果**: ✅ **满足需求**
- 适合返回简单的文本结果
- 适合命令执行结果（stdout、stderr）
- 适合脚本执行结果（output）

#### 1.3.3 错误结果 ✅

**支持方式**:
```java
ToolResultBlock.error("错误信息");
```

**评估结果**: ✅ **满足需求**
- 专门用于错误情况
- Agent 能够识别错误并处理

#### 1.3.4 内容块结果 ✅

**支持的内容块类型**（已验证）:
- ✅ **TextBlock** - 文本内容（已确认）
- ✅ **ImageBlock** - 图片内容（已确认，可以用于截图）
- ✅ **AudioBlock** - 音频内容（已确认）
- ✅ **VideoBlock** - 视频内容（已确认）

**截图支持验证**: ✅ **支持**
- `ImageBlock` 类存在
- 可以包含图片源（Source）
- **可以用于传递 GUI 操作的截图** ✅

**使用示例**:
```java
// 文本结果
List<ContentBlock> content = Arrays.asList(
    TextBlock.builder().text("执行结果").build()
);

// 包含截图的结果
List<ContentBlock> content = Arrays.asList(
    TextBlock.builder().text("GUI操作成功").build(),
    ImageBlock.builder().source(imageSource).build()  // 截图
);

ToolResultBlock.of(content);
```

## 二、Toolkit 工具管理机制评估

### 2.1 工具注册机制 ✅

#### 2.1.1 registerAgentTool() 方法

**实际 API**:
```java
void registerAgentTool(AgentTool tool);
```

**评估结果**: ✅ **满足需求**
- 支持注册自定义工具
- 工具注册后可以被 Agent 发现和使用
- 支持注册多个工具

### 2.2 工具调用流程评估 ✅

#### 2.2.1 Agent 工具调用决策

**工作流程**:
```
用户消息
  ↓
ReActAgent（内部推理）
  ├── 分析用户意图
  ├── 查看可用工具列表
  ├── 根据工具描述决定是否调用工具
  ├── 选择合适的工具
  └── 调用工具（传入参数）
```

**评估结果**: ✅ **满足需求**
- Agent 自动决定是否调用工具
- 基于工具描述和用户消息进行推理

### 2.3 工具调用的同步/异步特性 ✅

#### 2.3.1 异步执行支持

**评估结果**: ✅ **满足需求**
- 工具调用是异步的（返回 `Mono`）
- 支持长时间运行的操作
- 不会阻塞 Agent 的其他操作

#### 2.3.2 超时控制

**支持方式**:
```java
return Mono.fromCallable(() -> {
    // 长时间运行的操作
    return result;
})
.timeout(Duration.ofMinutes(5));  // 5 分钟超时
```

**评估结果**: ✅ **满足需求**
- 使用 `Mono.timeout()` 设置超时
- 超时后抛出 `TimeoutException`
- 可以在 `doOnError` 中处理超时

## 三、技术难点识别和解决方案

### 3.1 会话上下文传递难点

#### 3.1.1 问题描述

**难点**: Agent 在调用工具时如何获取 sessionId？

#### 3.1.2 解决方案 ✅

**推荐方案：在系统提示词中包含 sessionId**

**实现方式**:
```java
String sysPrompt = String.format("""
    你是 Mentis，一个智能助手，可以操作虚拟机。
    
    当前会话ID: %s
    
    重要规则：
    1. 所有工具调用都必须包含 sessionId 参数，值为: %s
    2. 不要从用户消息中提取 sessionId，直接使用上述值
    """, sessionId, sessionId);
```

**评估结果**: ✅ **可行**
- 简单直接
- 不需要修改 AgentScope 框架
- sessionId 总是可用

### 3.2 虚拟机状态管理难点

#### 3.2.1 解决方案 ✅

**方案：在工具调用时实时获取**

**实现方式**:
```java
// 实时获取虚拟机
VmInstance vm = vmManager.getVmForSession(sessionId);
if (vm == null) {
    return Mono.just(ToolResultBlock.error(
        "No VM found for session: " + sessionId));
}
```

**评估结果**: ✅ **可行**
- 总是使用最新的虚拟机状态
- 状态变更能够及时反映

### 3.3 长时间运行操作难点

#### 3.3.1 解决方案 ✅

**方案：使用 Mono.timeout() 设置超时**

**实现方式**:
```java
return Mono.fromCallable(() -> {
    ScriptResult result = executor.executeScript(sessionId, script, language);
    return createResultBlock(result);
})
.timeout(Duration.ofMinutes(30))  // 30 分钟超时
.onErrorReturn(ToolResultBlock.error("执行超时"));
```

**评估结果**: ✅ **可行**

### 3.4 截图传递难点 ✅

#### 3.4.1 解决方案

**方案：使用 ImageBlock**

**验证结果**: ✅ **ImageBlock 类存在，支持截图传递**

## 四、适配性评估总结

### 4.1 总体评估

| 评估项 | 需求 | AgentScope 支持 | 评估结果 |
|--------|------|----------------|---------|
| 工具接口 | AgentTool 接口 | ✅ 完全支持 | ✅ 满足 |
| 参数传递 | sessionId 传递 | ✅ 通过 getInput() | ✅ 满足 |
| 结果反馈 | 结构化结果 | ✅ ToolResultBlock | ✅ 满足 |
| 截图支持 | 图片结果 | ✅ ImageBlock | ✅ 满足 |
| 异步执行 | 长时间运行 | ✅ Mono 异步 | ✅ 满足 |
| 超时控制 | 超时机制 | ✅ Mono.timeout() | ✅ 满足 |
| 错误处理 | 错误反馈 | ✅ error() 方法 | ✅ 满足 |

### 4.2 关键发现

**✅ 满足需求的功能**:
1. ✅ AgentTool 接口完全满足需求
2. ✅ sessionId 可以通过工具参数传递
3. ✅ 结果反馈支持文本、错误、图片等多种格式
4. ✅ 异步执行和超时控制支持良好
5. ✅ 截图可以通过 ImageBlock 传递

**⚠️ 需要注意的点**:
1. ⚠️ Agent 需要知道 sessionId（需要在系统提示词中说明）
2. ⚠️ ToolExecutionContext 作为 sessionId 传递方式需要验证
3. ⚠️ 长时间运行操作的进度反馈可能不支持

### 4.3 适配性结论

**评估结果**: ✅ **AgentScope 工具系统能够满足 Computer-Use 场景的需求**

**理由**:
1. ✅ 所有核心功能都有对应支持
2. ✅ sessionId 传递机制可行（通过工具参数）
3. ✅ 结果反馈机制完善（支持文本、错误、图片）
4. ✅ 异步执行和超时控制支持良好

**限制条件**:
- ⚠️ 需要在系统提示词中包含 sessionId
- ⚠️ 长时间运行操作的进度反馈可能不支持（需要任务拆分）

## 最后更新

2026-01-09 - 完成 AgentScope 工具系统适配性评估
