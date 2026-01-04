# LoopNode（循环节点）实现总结

**文档版本**: V1.0  
**编写日期**: 2025-01-02  
**状态**: ✅ 后端实现完成，执行器支持待完善

---

## 📋 完成情况

### ✅ 已完成功能

#### 1. LoopNode 类 ✅

**文件**: `backend/src/main/java/com/heartsphere/aiagent/graph/core/node/LoopNode.java`

**功能**:
- 定义循环节点数据结构
- 支持三种循环类型：条件循环、计数循环、无限循环
- 支持循环条件检查（变量、技能、好感度、事件、物品）
- 支持最大循环次数限制（防止无限循环）
- 提供循环条件检查方法

**关键特性**:
- `loopType`: 循环类型
  - `CONDITION`: 条件循环（条件满足时继续）
  - `COUNT`: 计数循环（达到最大次数后退出）
  - `FOREVER`: 无限循环（需要手动退出或达到最大次数）
- `condition`: 循环条件（条件循环时使用）
- `maxIterations`: 最大循环次数（默认1000，防止无限循环）
- `loopBody`: 循环体节点ID列表
- `exitNodeId`: 退出节点ID（循环退出后跳转）
- `loopVariableName`: 循环变量名（用于记录循环次数）

**循环条件类型**:
- `VARIABLE`: 变量
- `SKILL`: 技能值
- `FAVORABILITY`: 好感度
- `EVENT`: 事件
- `ITEM`: 物品

**条件检查逻辑**:
- 支持多种运算符: `>`, `<`, `>=`, `<=`, `==`, `!=`
- 支持数值和字符串比较
- 支持事件和物品的存在性检查（has/not_has）

---

#### 2. LoopNodeConfig 配置类 ✅

**文件**: `backend/src/main/java/com/heartsphere/aiagent/graph/core/node/LoopNodeConfig.java`

**功能**:
- 支持从JSON创建LoopNode
- 提供默认值（loopType默认为CONDITION，maxIterations默认为1000）
- 支持从Map创建LoopCondition（用于JSON反序列化）

---

#### 3. NodeFactory 集成 ✅

**文件**: `backend/src/main/java/com/heartsphere/aiagent/graph/core/node/NodeFactory.java`

**功能**:
- 在NodeFactory中注册LoopNode
- 支持通过节点类型"loop"创建LoopNode
- 处理condition的Map到LoopCondition的转换

---

### ⏳ 待实现功能

#### 4. EnhancedGraphExecutor 循环控制支持 ⏳

**目标**: 在EnhancedGraphExecutor中实现循环执行逻辑

**任务**:
- [ ] 检测LoopNode
- [ ] 初始化循环计数
- [ ] 执行循环体（loopBody中的节点序列）
- [ ] 检查循环条件（使用LoopNode.shouldContinueLoop）
- [ ] 如果条件满足，继续循环；否则退出循环
- [ ] 跳转到exitNodeId继续执行
- [ ] 防止无限循环（检查最大循环次数）

**实现思路**:
1. 检测到LoopNode时，获取loopBody列表
2. 初始化循环计数（在状态中记录）
3. 循环执行loopBody中的节点序列
4. 每次循环后，检查shouldContinueLoop()
5. 如果应该继续，增加循环计数，重复步骤3
6. 如果应该退出，跳转到exitNodeId继续执行

**注意事项**:
- 需要保持循环体内的状态隔离或合并
- 需要考虑循环体内的等待（WaitNode, ChoiceNode）
- 需要检查最大循环次数，防止无限循环
- 循环计数需要在状态中记录

---

#### 5. 前端编辑器支持 ⏳

**目标**: 在前端编辑器中支持循环节点的可视化

**任务**:
- [ ] 添加loop节点类型到节点类型列表
- [ ] 创建LoopNode属性编辑面板
- [ ] 支持配置循环类型
- [ ] 支持配置循环条件
- [ ] 支持添加/删除循环体节点
- [ ] 支持配置退出节点ID
- [ ] 支持配置最大循环次数
- [ ] 可视化显示循环体（可能需要特殊的节点样式）

---

## 📁 文件结构

```
backend/src/main/java/com/heartsphere/aiagent/graph/core/node/
├── LoopNode.java              # 循环节点类 ✅
└── LoopNodeConfig.java        # 循环节点配置类 ✅

frontend/admin/components/
└── NodePropertyPanel.tsx      # 需要添加LoopNode支持 ⏳
```

---

## 🔄 使用示例

### JSON配置示例

#### 条件循环

```json
{
  "id": "loop_1",
  "nodeType": "loop",
  "nodeConfig": {
    "id": "loop_1",
    "loopType": "CONDITION",
    "condition": {
      "type": "VARIABLE",
      "target": "loop_count",
      "operator": "<",
      "value": 5
    },
    "loopBody": ["dialogue_1", "dialogue_2"],
    "exitNodeId": "exit_1",
    "maxIterations": 1000,
    "loopVariableName": "loop_count"
  }
}
```

#### 计数循环

```json
{
  "id": "loop_2",
  "nodeType": "loop",
  "nodeConfig": {
    "id": "loop_2",
    "loopType": "COUNT",
    "maxIterations": 10,
    "loopBody": ["state_change_1"],
    "exitNodeId": "exit_2",
    "loopVariableName": "iteration"
  }
}
```

### Java代码示例

```java
// 创建循环节点（条件循环）
LoopNode.LoopCondition condition = LoopNode.LoopCondition.builder()
    .type(LoopNode.LoopCondition.ConditionType.VARIABLE)
    .target("loop_count")
    .operator("<")
    .value(5)
    .build();

LoopNode loopNode = LoopNode.builder()
    .id("loop_1")
    .loopType(LoopNode.LoopType.CONDITION)
    .condition(condition)
    .loopBody(Arrays.asList("dialogue_1", "dialogue_2"))
    .exitNodeId("exit_1")
    .maxIterations(1000)
    .loopVariableName("loop_count")
    .build();

// 检查是否应该继续循环
boolean shouldContinue = loopNode.shouldContinueLoop(state, iterationCount);
```

---

## 📝 实现细节

### 循环类型说明

#### CONDITION（条件循环）
- 根据条件决定是否继续循环
- 条件满足时继续循环，不满足时退出
- 仍然受maxIterations限制（防止无限循环）

#### COUNT（计数循环）
- 根据循环次数决定是否继续
- 达到maxIterations后退出循环
- 不需要条件

#### FOREVER（无限循环）
- 理论上无限循环
- 但仍然受maxIterations限制（安全机制）
- 通常需要通过状态变更来手动退出

### 循环条件检查

支持的条件类型：
- **VARIABLE**: 检查状态中的变量值
- **SKILL**: 检查角色技能值
- **FAVORABILITY**: 检查角色好感度
- **EVENT**: 检查事件是否已触发
- **ITEM**: 检查物品是否已获得

支持的运算符：
- 数值比较: `>`, `<`, `>=`, `<=`, `==`, `!=`
- 字符串比较: `==`, `!=`
- 存在性检查: `has`, `not_has`（用于事件和物品）

---

## ⚠️ 注意事项

1. **防止无限循环**:
   - 所有循环类型都受maxIterations限制
   - 默认最大次数为1000
   - 建议根据实际需求设置合理的最大值

2. **状态管理**:
   - 循环计数存储在状态中（使用loopVariableName）
   - 循环体内的状态变更会累积
   - 需要考虑状态隔离或合并策略

3. **循环体内的等待**:
   - 如果循环体内包含WaitNode或ChoiceNode，需要特殊处理
   - 可能需要等待所有分支都完成等待后才能继续

4. **性能考虑**:
   - 循环执行会增加执行步骤数
   - 建议合理设置循环次数和循环体大小
   - 避免在循环体内执行耗时操作

---

## ✅ 完成检查清单

- [x] LoopNode 类实现
- [x] LoopNodeConfig 配置类
- [x] NodeFactory 注册
- [ ] EnhancedGraphExecutor 循环控制支持
- [ ] 单元测试
- [ ] 前端编辑器支持
- [ ] 文档更新

---

**文档维护者**: HeartSphere Development Team  
**最后更新**: 2025-01-02
