# Computer-Use 场景技术难点识别

## 识别日期

2026-01-09

## 识别目标

识别 AgentScope Java 在 Computer-Use 场景中可能遇到的技术难点，并提供潜在的解决方案。

## 一、会话上下文传递难点

### 1.1 问题描述

**难点**: Agent 在调用工具时如何获取 sessionId？

**影响**:
- 所有 Computer-Use 操作都需要 sessionId
- sessionId 不在用户消息中明确提及
- Agent 需要在工具调用时知道 sessionId

### 1.2 解决方案

#### 方案 A：在系统提示词中包含 sessionId（推荐）✅

**实现方式**:
```java
String sysPrompt = String.format("""
    你是 Mentis，一个智能助手，可以操作虚拟机。
    
    当前会话ID: %s
    
    重要规则：
    1. 所有工具调用都必须包含 sessionId 参数，值为: %s
    2. 不要从用户消息中提取 sessionId，直接使用上述值
    3. 即使用户没有提到 sessionId，也必须使用上述值
    """, sessionId, sessionId);
```

**优点**:
- ✅ 简单直接，不需要修改框架
- ✅ sessionId 总是可用
- ✅ 易于实现和调试

**缺点**:
- ⚠️ 每次调用都需要更新系统提示词（如果 sessionId 变化）
- ⚠️ 如果 sessionId 变化，可能需要重新创建 Agent

**评估结果**: ✅ **推荐方案**

#### 方案 B：使用 ToolExecutionContext ⚠️

**实现方式**:
```java
// 在 Agent 调用前设置上下文（需要验证是否支持）
ToolExecutionContext context = ToolExecutionContext.builder()
    .put("sessionId", sessionId)
    .build();

// 工具从上下文获取
String sessionId = param.getContext().get("sessionId", String.class);
```

**优点**:
- ✅ 不污染系统提示词
- ✅ 上下文在工具调用链中保持

**缺点**:
- ⚠️ 需要验证 AgentScope 是否支持
- ⚠️ 实现可能更复杂
- ⚠️ 工具调用时如何设置上下文？（需要验证）

**评估结果**: ⚠️ **需要验证**

#### 方案 C：从消息元数据中提取 ⚠️

**实现方式**:
```java
Msg userMsg = Msg.builder()
    .textContent(userMessage)
    .metadata(Map.of("sessionId", sessionId))
    .build();

// 工具从消息元数据中提取（需要验证 AgentScope 是否支持）
```

**优点**:
- ✅ 语义清晰
- ✅ 不污染提示词

**缺点**:
- ⚠️ 需要验证 AgentScope 是否支持消息元数据
- ⚠️ 工具可能无法访问消息元数据

**评估结果**: ⚠️ **需要验证**

**推荐方案**: **方案 A**（在系统提示词中包含 sessionId）

### 1.3 验证计划

- [ ] 测试方案 A：在系统提示词中包含 sessionId
- [ ] 测试方案 B：使用 ToolExecutionContext（如果支持）
- [ ] 测试方案 C：从消息元数据提取（如果支持）
- [ ] 选择最佳方案

## 二、虚拟机状态管理难点

### 2.1 问题描述

**难点**: 如何在工具调用中获取和管理虚拟机状态？

**影响**:
- 虚拟机状态可能随时变化
- 需要在每次工具调用时验证虚拟机状态
- 虚拟机可能不存在、停止或异常

### 2.2 解决方案 ✅

**方案：在工具调用时实时获取虚拟机状态**

**实现方式**:
```java
@Override
public Mono<ToolResultBlock> callAsync(ToolCallParam param) {
    Map<String, Object> args = param.getInput();
    String sessionId = (String) args.get("sessionId");
    
    // 实时获取虚拟机
    VmInstance vm = vmManager.getVmForSession(sessionId);
    if (vm == null) {
        return Mono.just(ToolResultBlock.error(
            "No VM found for session: " + sessionId + 
            ". Please use vm_manager tool to create a VM first."));
    }
    
    // 检查虚拟机状态
    VmStatus status = vmManager.getVmStatus(vm.getVmId());
    if (!"RUNNING".equals(status.getStatus())) {
        return Mono.just(ToolResultBlock.error(
            "VM is not running. Current status: " + status.getStatus() + 
            ". Please use vm_manager tool to start the VM first."));
    }
    
    // 执行操作...
}
```

**优点**:
- ✅ 总是使用最新的虚拟机状态
- ✅ 状态变更能够及时反映
- ✅ 不需要状态同步机制
- ✅ 错误信息清晰，指导用户操作

**缺点**:
- ⚠️ 每次调用都需要查询状态（性能开销小，可接受）

**评估结果**: ✅ **可行**

### 2.3 验证计划

- [ ] 测试虚拟机不存在的情况
- [ ] 测试虚拟机停止的情况
- [ ] 测试虚拟机状态变更的情况
- [ ] 验证错误信息的清晰度

## 三、长时间运行操作难点

### 3.1 问题描述

**难点**: 长时间运行的操作（如脚本执行）如何处理？

**影响**:
- 某些操作可能需要几分钟到几十分钟
- 工具调用可能有超时限制
- 需要进度反馈（如果支持）

### 3.2 解决方案

#### 方案 A：使用 Mono.timeout() 设置超时（推荐）✅

**实现方式**:
```java
@Override
public Mono<ToolResultBlock> callAsync(ToolCallParam param) {
    Map<String, Object> args = param.getInput();
    String sessionId = (String) args.get("sessionId");
    String script = (String) args.get("script");
    String language = (String) args.get("language");
    
    return Mono.fromCallable(() -> {
        // 执行脚本（可能很长时间）
        ScriptResult result = executor.executeScript(sessionId, script, language);
        return createResultBlock(result);
    })
    .timeout(Duration.ofMinutes(30))  // 30 分钟超时
    .doOnError(TimeoutException.class, e -> {
        log.error("Script execution timeout: sessionId={}, language={}", 
            sessionId, language);
    })
    .onErrorReturn(ToolResultBlock.error(
        "Script execution timeout after 30 minutes. " +
        "The script may still be running in the background. " +
        "Please check the VM status or try again later."));
}
```

**优点**:
- ✅ 实现简单
- ✅ 对于大多数场景足够
- ✅ 超时控制明确

**缺点**:
- ⚠️ 如果操作确实需要更长时间，会超时失败
- ⚠️ 无法提供进度反馈

**评估结果**: ✅ **推荐方案（大多数场景）**

#### 方案 B：任务拆分 ⚠️

**实现方式**:
- 将长时间运行的任务拆分为多个步骤
- 每个步骤作为一个工具调用
- Agent 可以根据中间结果决定下一步操作

**示例**:
```
用户: "执行一个需要 1 小时的脚本"
  ↓
Agent → 调用 computer_use.start_long_running_script(sessionId, script)
  ↓ (返回任务ID)
Agent → 调用 computer_use.check_script_status(sessionId, taskId)
  ↓ (返回进度或完成状态)
Agent → 继续检查或获取结果
```

**优点**:
- ✅ 支持任意长时间的操作
- ✅ 可以提供进度反馈
- ✅ 可以取消操作

**缺点**:
- ⚠️ 需要实现任务管理系统
- ⚠️ 需要修改现有执行器
- ⚠️ 实现复杂度较高

**评估结果**: ⚠️ **可选方案（如果需要支持超长时间操作）**

**推荐方案**: **方案 A**（设置超时）

**理由**:
1. 实现简单
2. 对于大多数场景足够（30 分钟通常足够）
3. 如果确实需要更长时间，可以考虑方案 B

### 3.3 验证计划

- [ ] 测试长时间运行命令的超时控制
- [ ] 测试超时后的错误处理
- [ ] 测试不同超时时间的设置
- [ ] 如果需要，设计和实现任务拆分方案

## 四、截图传递难点

### 4.1 问题描述

**难点**: GUI 操作的截图（base64 或 URL）如何传递给 Agent？

**影响**:
- 截图可能很大（base64 编码会增加约 33%）
- Agent 需要能够理解和使用截图
- 截图用于视觉理解，非常重要

### 4.2 解决方案 ✅

**方案：使用 ImageBlock**

**实际 API**（已验证）:
```java
ImageBlock.builder()
    .source(imageSource)
    .build();
```

**验证结果**: ✅ **ImageBlock 类存在**

**需要进一步验证**:
- ⚠️ `Source` 类的实际 API（如何设置图片？）
- ⚠️ 是否支持 base64 编码的图片
- ⚠️ 是否支持 URL

**实现方式**（待验证）:
```java
// 方式 1：使用 base64
Source imageSource = Source.builder()
    .data("data:image/png;base64," + base64String)
    .build();

// 方式 2：使用 URL
Source imageSource = Source.builder()
    .url("https://example.com/screenshot.png")
    .build();

ImageBlock imageBlock = ImageBlock.builder()
    .source(imageSource)
    .build();

List<ContentBlock> content = Arrays.asList(
    TextBlock.builder().text("GUI操作成功").build(),
    imageBlock
);

ToolResultBlock.of(content);
```

**评估结果**: ✅ **可行（需要验证 Source 的 API）**

### 4.3 验证计划

- [ ] 验证 Source 类的 API
- [ ] 测试 base64 编码图片的传递
- [ ] 测试 URL 图片的传递
- [ ] 验证 Agent 是否能够理解图片

## 五、工具参数定义难点

### 5.1 问题描述

**难点**: 复杂对象（如 GuiAction）如何在 JSON Schema 中定义？

**影响**:
- GuiAction 包含多个字段（actionType, target, value）
- JSON Schema 需要正确定义这些字段
- Agent 需要能够正确理解和使用这些参数

### 5.2 解决方案 ✅

**方案：将复杂对象拆分为简单参数**

**当前实现**:
```java
class GuiAction {
    String actionType;  // CLICK, TYPE, SCROLL, SCREENSHOT
    String target;      // 目标元素或坐标
    String value;       // 操作的值（如输入文本）
}
```

**JSON Schema 定义**:
```java
@Override
public Map<String, Object> getParameters() {
    return Map.of(
        "type", "object",
        "properties", Map.of(
            "sessionId", Map.of(
                "type", "string",
                "description", "会话ID"
            ),
            "operation", Map.of(
                "type", "string",
                "enum", List.of("execute_command", "execute_script", "perform_gui_action"),
                "description", "操作类型"
            ),
            // GUI 操作参数（当 operation = perform_gui_action 时）
            "actionType", Map.of(
                "type", "string",
                "enum", List.of("CLICK", "TYPE", "SCROLL", "SCREENSHOT"),
                "description", "GUI操作类型"
            ),
            "target", Map.of(
                "type", "string",
                "description", "目标元素或坐标"
            ),
            "value", Map.of(
                "type", "string",
                "description", "操作的值（如输入文本）"
            )
        ),
        "required", List.of("sessionId", "operation")
    );
}
```

**评估结果**: ✅ **可行**

**理由**:
- JSON Schema 支持定义复杂对象
- 可以将复杂对象拆分为简单参数
- Agent 能够理解和使用这些参数

## 六、工具调用链中的上下文维护

### 6.1 问题描述

**难点**: 在多个工具调用的链式调用中，如何保持上下文（sessionId、虚拟机状态）一致？

**场景示例**:
```
用户: "创建一个 Ubuntu 虚拟机，然后执行 ls 命令"
  ↓
工具调用 1: vm_manager.create_vm(sessionId, config) → 返回 vmId
  ↓
工具调用 2: computer_use.execute_command(sessionId, "ls")
```

**关键点**:
- sessionId 在两次调用中必须一致
- 虚拟机在第一次调用时创建
- 第二次调用需要使用同一个虚拟机

### 6.2 解决方案 ✅

**方案：sessionId 在工具参数中传递，虚拟机状态通过 VmManager 管理**

**实现方式**:
1. **sessionId 一致性**：
   - sessionId 在系统提示词中定义
   - 所有工具调用都使用相同的 sessionId
   - Agent 在每次调用时都传入相同的 sessionId

2. **虚拟机状态一致性**：
   - 虚拟机状态由 VmManager 管理
   - 每次工具调用时都通过 `VmManager.getVmForSession(sessionId)` 获取最新状态
   - 虚拟机状态在 VmManager 中保持一致

**评估结果**: ✅ **可行**

**理由**:
- sessionId 通过系统提示词保持一致
- 虚拟机状态通过 VmManager 管理，保证一致性
- 不需要额外的上下文维护机制

## 七、难点总结和优先级

### 7.1 难点列表

| 难点 | 严重程度 | 解决方案 | 状态 |
|------|---------|---------|------|
| sessionId 传递 | 高 | 在系统提示词中包含 ✅ | ✅ 已解决 |
| 虚拟机状态管理 | 中 | 实时获取 ✅ | ✅ 已解决 |
| 长时间运行操作 | 中 | 设置超时 ✅ | ✅ 已解决 |
| 截图传递 | 低 | 使用 ImageBlock ✅ | ⚠️ 待验证 Source API |
| 工具参数定义 | 低 | 拆分为简单参数 ✅ | ✅ 已解决 |
| 上下文维护 | 中 | sessionId 在提示词中，状态由 VmManager 管理 ✅ | ✅ 已解决 |

### 7.2 待验证项目

1. ⚠️ **Source API 验证**（截图传递）
   - 验证 Source 类的实际 API
   - 测试 base64 和 URL 的支持

2. ⚠️ **ToolExecutionContext 验证**（可选方案）
   - 验证是否可以作为 sessionId 的传递方式
   - 测试上下文的设置和获取

3. ⚠️ **长时间运行操作测试**（实际验证）
   - 测试超时控制的实际效果
   - 测试超时后的错误处理

### 7.3 风险评估

**高风险**:
- 无

**中风险**:
- sessionId 传递依赖系统提示词（如果 sessionId 频繁变化，可能需要重新创建 Agent）
- 长时间运行操作的超时设置需要合理（太长浪费资源，太短可能失败）

**低风险**:
- 截图传递的 Source API 需要验证（但 ImageBlock 存在，应该可行）
- 工具参数定义的复杂度（但 JSON Schema 支持复杂对象）

## 最后更新

2026-01-09 - 完成技术难点识别和解决方案设计
