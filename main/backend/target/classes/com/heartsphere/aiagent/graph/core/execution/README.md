# Graph 执行增强功能

**文档版本**: V1.0  
**编写日期**: 2025-01-02  
**状态**: 实现中

---

## 概述

本模块提供了 Graph 执行器的增强功能，包括执行上下文管理、用户选择处理、等待逻辑、暂停/恢复等功能。

---

## 核心类

### 1. ExecutionContext（执行上下文）

用于管理 Graph 执行过程中的上下文信息。

**主要功能**:
- 执行状态管理（RUNNING, PAUSED, WAITING, COMPLETED, FAILED, CANCELLED）
- 等待状态管理（等待用户选择、等待条件等）
- 用户选择缓存
- 执行步骤计数
- 自定义上下文数据存储

**使用示例**:
```java
ExecutionContext context = ExecutionContext.builder()
    .executionId("exec-123")
    .graphId(1L)
    .status(ExecutionStatus.RUNNING)
    .currentNodeId("start")
    .state(initialState)
    .build();

// 设置用户选择
context.setUserChoice("option_1");

// 标记等待
context.setWaiting("choice_node_1", WaitType.CHOICE);

// 暂停执行
context.pause("用户请求暂停");
```

---

### 2. EnhancedGraphExecutor（增强的执行器）

提供增强的 Graph 执行功能，支持暂停/恢复、用户选择处理等。

**主要功能**:
- 支持 ChoiceNode 的实际用户选择处理
- 支持 WaitNode 的等待逻辑
- 支持执行暂停/恢复
- 优化的节点路由选择
- 执行上下文管理

**使用示例**:
```java
// 创建执行器
EnhancedGraphExecutor executor = new EnhancedGraphExecutor(graphDefinition);

// 开始执行
GraphState initialState = graphEngine.createState();
ExecutionContext context = executor.start(initialState);

// 如果遇到 ChoiceNode，等待用户选择
if (context.getStatus() == ExecutionStatus.WAITING && 
    context.getWaitType() == WaitType.CHOICE) {
    // 获取可用的选项
    ChoiceNode choiceNode = (ChoiceNode) graph.getNode(context.getWaitingNodeId());
    List<ChoiceOption> options = choiceNode.getAvailableOptions(context.getState());
    
    // 用户选择后
    context = executor.setUserChoice(context, "option_1");
}

// 继续执行
if (context.getStatus() == ExecutionStatus.WAITING) {
    context = executor.continueExecution(context);
}

// 暂停执行
context = executor.pause(context, "需要检查");

// 恢复执行
context = executor.resume(context);

// 取消执行
context = executor.cancel(context);
```

---

## 功能特性

### 1. ChoiceNode 用户选择处理 ✅

**之前**: ChoiceNode 只是标记需要等待，选择是模拟的  
**现在**: 支持真实的用户选择处理

**流程**:
1. 执行器检测到 ChoiceNode
2. 暂停执行，设置等待状态为 CHOICE
3. 外部系统获取可用的选项列表
4. 用户选择后，调用 `setUserChoice(context, optionId)`
5. 执行器使用 ChoiceNode.handleChoice() 处理选择
6. 应用选择效果，跳转到下一个节点

---

### 2. WaitNode 等待逻辑 ✅

**之前**: WaitNode 只是标记需要等待  
**现在**: 支持等待条件检查和继续执行

**流程**:
1. 执行器检测到 WaitNode
2. 检查 WaitNode.checkWaitCondition()
3. 如果条件不满足，暂停执行，设置等待状态为 WAIT
4. 外部系统等待条件满足后，调用 `continueExecution(context)`
5. 继续执行下一个节点

---

### 3. 执行暂停/恢复 ✅

**功能**: 支持在执行过程中暂停和恢复

**使用场景**:
- 用户手动暂停
- 调试和检查
- 系统维护

**API**:
```java
// 暂停
context = executor.pause(context, "用户请求暂停");

// 恢复
context = executor.resume(context);
```

---

### 4. 优化的节点路由选择 ✅

**改进**:
1. 优先使用带路由器的边
2. 使用状态中的 next_node（由节点执行时设置）
3. 默认选择第一条边

**支持的节点路由方式**:
- ConditionNode: 通过 next_node 路由到 true/false 分支
- SkillCheckNode: 通过 next_node 路由到 success/failure 分支
- ChoiceNode: 通过 handleChoice 返回的 nextNodeId 路由
- 其他节点: 使用边的路由器或默认路由

---

### 5. 执行上下文管理 ✅

**功能**: 完整的执行上下文管理，包括状态、数据、等待信息等

**上下文数据**:
- 执行ID
- Graph ID
- 执行状态
- 当前节点ID
- Graph状态
- 执行步骤数
- 等待信息
- 用户选择
- 自定义数据

---

## 执行流程

### 标准执行流程

```
1. start(initialState)
   ↓
2. 执行节点
   ↓
3. 检查节点类型
   ├─ ChoiceNode → 等待用户选择
   ├─ WaitNode → 检查等待条件
   └─ 其他节点 → 继续执行
   ↓
4. 选择下一个节点
   ↓
5. 重复步骤2-4，直到结束
```

### ChoiceNode 执行流程

```
1. 执行 ChoiceNode
   ↓
2. ChoiceNode.execute() → 标记需要等待
   ↓
3. 执行器检测到 ChoiceNode
   ↓
4. 设置等待状态 (WAITING, CHOICE)
   ↓
5. 返回上下文，等待用户选择
   ↓
6. 外部系统调用 setUserChoice(context, optionId)
   ↓
7. ChoiceNode.handleChoice() → 应用效果，返回 nextNodeId
   ↓
8. 继续执行下一个节点
```

### WaitNode 执行流程

```
1. 执行 WaitNode
   ↓
2. WaitNode.execute() → 标记需要等待
   ↓
3. WaitNode.checkWaitCondition() → 检查条件
   ↓
4. 如果条件不满足 → 设置等待状态 (WAITING, WAIT)
   ↓
5. 返回上下文，等待条件满足
   ↓
6. 外部系统检查条件，满足后调用 continueExecution(context)
   ↓
7. 继续执行下一个节点
```

---

## API 参考

### EnhancedGraphExecutor

#### start(GraphState initialState)
开始执行 Graph

**参数**:
- `initialState`: 初始状态

**返回**: ExecutionContext

---

#### continueExecution(ExecutionContext context)
继续执行（从等待或暂停状态恢复）

**参数**:
- `context`: 执行上下文

**返回**: ExecutionContext

---

#### setUserChoice(ExecutionContext context, String optionId)
设置用户选择（用于 ChoiceNode）

**参数**:
- `context`: 执行上下文
- `optionId`: 选项ID

**返回**: ExecutionContext

---

#### pause(ExecutionContext context, String reason)
暂停执行

**参数**:
- `context`: 执行上下文
- `reason`: 暂停原因

**返回**: ExecutionContext

---

#### resume(ExecutionContext context)
恢复执行

**参数**:
- `context`: 执行上下文

**返回**: ExecutionContext

---

#### cancel(ExecutionContext context)
取消执行

**参数**:
- `context`: 执行上下文

**返回**: ExecutionContext

---

## 下一步工作

- [ ] 支持异步节点执行
- [ ] 执行状态持久化
- [ ] 执行日志记录
- [ ] 执行性能监控
- [ ] 执行历史查询

---

**文档维护者**: HeartSphere Development Team  
**最后更新**: 2025-01-02
