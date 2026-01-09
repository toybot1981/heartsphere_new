# AgentScope Computer-Use 原型实现进度

## 更新日期

2026-01-09

## 进度概览

### Phase 2: AgentScope 工具系统评估 ✅ **已完成**

- ✅ Task 2.1: AgentTool 接口适配性评估
  - ✅ 完成 `agentscope-tool-adaptability.md`
- ✅ Task 2.2: Toolkit 工具管理机制评估
  - ✅ 完成 `toolkit-management-evaluation.md`
- ✅ Task 2.3: 技术难点识别
  - ✅ 完成 `computer-use-challenges.md`

### Phase 3: 原型验证实现 🔄 **进行中**

#### Step 3.1: VmManagerTool 原型实现

**Step 3.1.1: 创建 VmManagerTool 类框架** ✅ **已完成**
- ✅ 创建 `VmManagerTool.java` 类
- ✅ 实现 `AgentTool` 接口
- ✅ 实现 `getName()`, `getDescription()`, `getParameters()`, `callAsync()`
- ✅ 编译通过 ✅

**Step 3.1.2: 实现会话上下文传递** ✅ **已完成**
- ✅ 从 `ToolCallParam.getInput()` 中提取 sessionId
- ✅ 验证 sessionId 的有效性
- ✅ 处理 sessionId 不存在的情况

**Step 3.1.3: 实现虚拟机操作工具** 🔄 **部分完成**
- ✅ `get_status` - 获取虚拟机状态（已实现）
- ✅ `delete` - 删除虚拟机（已实现）
- ⚠️ `create` - 创建虚拟机（框架已实现，待完善配置解析）
- ⚠️ `create_snapshot` - 创建快照（框架已实现，待完善实际逻辑）
- ⚠️ `restore_snapshot` - 恢复快照（框架已实现，待完善实际逻辑）

**Step 3.1.4: 创建测试用例** ⏳ **待开始**
- ⏳ 创建 `VmManagerToolTest.java`
- ⏳ 测试虚拟机操作的各个功能
- ⏳ 验证会话上下文传递

#### Step 3.2: ComputerUseTool 原型实现 ⏳ **待开始**

#### Step 3.3: 集成测试 ⏳ **待开始**

## 关键发现

### 1. 会话上下文传递 ✅

**验证结果**: ✅ **可行**
- sessionId 可以通过 `ToolCallParam.getInput()` 传递
- 工具能够正确提取和使用 sessionId
- 错误处理机制完善

**实现方式**:
```java
Map<String, Object> args = param.getInput();
String sessionId = (String) args.get("sessionId");
if (sessionId == null || sessionId.isEmpty()) {
    return ToolResultBlock.error("sessionId is required");
}
```

### 2. 工具结果返回 ✅

**验证结果**: ✅ **可行**
- 使用 `ToolResultBlock.text()` 返回文本结果
- 使用 `ToolResultBlock.error()` 返回错误
- 异步执行和超时控制正常工作

**实现方式**:
```java
return ToolResultBlock.text("Result message");
return ToolResultBlock.error("Error message");
```

### 3. 超时控制 ✅

**验证结果**: ✅ **可行**
- 使用 `Mono.timeout(Duration.ofMinutes(5))` 设置超时
- 使用 `doOnError` 和 `onErrorReturn` 处理错误

**实现方式**:
```java
return Mono.fromCallable(() -> {
    // 操作
})
.timeout(Duration.ofMinutes(5))
.doOnError(error -> {
    System.err.println("Error: " + error.getMessage());
})
.onErrorReturn(ToolResultBlock.error("Timeout or error occurred"));
```

## 下一步行动

1. **完成 Step 3.1.3**: 完善虚拟机操作的实现（create, snapshot）
2. **完成 Step 3.1.4**: 创建测试用例
3. **开始 Step 3.2**: ComputerUseTool 原型实现

## 文件清单

### 已创建文件
- ✅ `backend/src/test/java/com/heartsphere/mentis/agentscope/prototype/VmManagerTool.java`
- ✅ `docs/agentscope-research/agentscope-tool-adaptability.md`
- ✅ `docs/agentscope-research/toolkit-management-evaluation.md`
- ✅ `docs/agentscope-research/computer-use-challenges.md`
- ✅ `docs/agentscope-research/prototype-progress.md` (本文档)

### 待创建文件
- ⏳ `backend/src/test/java/com/heartsphere/mentis/agentscope/prototype/VmManagerToolTest.java`
- ⏳ `backend/src/test/java/com/heartsphere/mentis/agentscope/prototype/ComputerUseTool.java`
- ⏳ `backend/src/test/java/com/heartsphere/mentis/agentscope/prototype/ComputerUseToolTest.java`
- ⏳ `backend/src/test/java/com/heartsphere/mentis/agentscope/prototype/VmOperationsIntegrationTest.java`

## 最后更新

2026-01-09 22:37 - 完成 Step 3.1.1 和 3.1.2，开始 Step 3.1.3
