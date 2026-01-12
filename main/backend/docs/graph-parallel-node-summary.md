# ParallelNode（并行节点）实现总结

**文档版本**: V1.0  
**编写日期**: 2025-01-02  
**状态**: ✅ 后端实现完成，执行器支持待完善

---

## 📋 完成情况

### ✅ 已完成功能

#### 1. ParallelNode 类 ✅

**文件**: `backend/src/main/java/com/heartsphere/aiagent/graph/core/node/ParallelNode.java`

**功能**:
- 定义并行节点数据结构
- 支持多个并行分支（每个分支是节点ID列表）
- 支持状态合并策略（ALL, FIRST, LAST）
- 提供状态合并方法

**关键特性**:
- `branches`: 并行分支列表，每个分支是一个节点ID列表
- `mergeNodeId`: 合并节点ID，所有分支执行完成后跳转到此节点
- `mergeStrategy`: 状态合并策略
  - `ALL`: 合并所有分支的状态（默认）
  - `FIRST`: 使用第一个分支的状态
  - `LAST`: 使用最后一个分支的状态

**状态合并逻辑**:
- Map类型数据：合并所有键值对（后面的覆盖前面的）
- List类型数据：合并所有元素（去重）
- 其他类型：后面的覆盖前面的

---

#### 2. ParallelNodeConfig 配置类 ✅

**文件**: `backend/src/main/java/com/heartsphere/aiagent/graph/core/node/ParallelNodeConfig.java`

**功能**:
- 支持从JSON创建ParallelNode
- 提供默认值（mergeStrategy默认为ALL）

---

#### 3. NodeFactory 集成 ✅

**文件**: `backend/src/main/java/com/heartsphere/aiagent/graph/core/node/NodeFactory.java`

**功能**:
- 在NodeFactory中注册ParallelNode
- 支持通过节点类型"parallel"创建ParallelNode

---

### ⏳ 待实现功能

#### 4. EnhancedGraphExecutor 并行执行支持 ⏳

**目标**: 在EnhancedGraphExecutor中实现并行执行逻辑

**任务**:
- [ ] 检测ParallelNode
- [ ] 为每个分支创建独立的执行上下文
- [ ] 并行执行所有分支（可以使用线程池或顺序模拟）
- [ ] 等待所有分支执行完成
- [ ] 合并所有分支的状态（使用ParallelNode.mergeStates）
- [ ] 跳转到合并节点继续执行

**实现思路**:
1. 检测到ParallelNode时，获取branches列表
2. 为每个分支创建独立的GraphState副本
3. 并行执行所有分支（每个分支独立执行）
4. 等待所有分支完成
5. 合并所有分支的最终状态
6. 跳转到mergeNodeId继续执行

**注意事项**:
- 并行执行可以使用Java的ExecutorService或CompletableFuture
- 需要考虑分支执行过程中的等待（WaitNode, ChoiceNode）
- 需要考虑错误处理（某个分支执行失败的处理策略）

---

#### 5. 前端编辑器支持 ⏳

**目标**: 在前端编辑器中支持并行节点的可视化

**任务**:
- [ ] 添加parallel节点类型到节点类型列表
- [ ] 创建ParallelNode属性编辑面板
- [ ] 支持添加/删除分支
- [ ] 支持配置合并节点ID
- [ ] 支持选择合并策略
- [ ] 可视化显示并行分支（可能需要特殊的节点样式）

---

## 📁 文件结构

```
backend/src/main/java/com/heartsphere/aiagent/graph/core/node/
├── ParallelNode.java              # 并行节点类 ✅
└── ParallelNodeConfig.java        # 并行节点配置类 ✅

frontend/admin/components/
└── NodePropertyPanel.tsx          # 需要添加ParallelNode支持 ⏳
```

---

## 🔄 使用示例

### JSON配置示例

```json
{
  "id": "parallel_1",
  "nodeType": "parallel",
  "nodeConfig": {
    "id": "parallel_1",
    "branches": [
      ["dialogue_1", "dialogue_2"],
      ["dialogue_3", "dialogue_4"]
    ],
    "mergeNodeId": "merge_1",
    "mergeStrategy": "ALL"
  }
}
```

### Java代码示例

```java
// 创建并行节点
ParallelNode parallelNode = ParallelNode.builder()
    .id("parallel_1")
    .branches(Arrays.asList(
        Arrays.asList("dialogue_1", "dialogue_2"),
        Arrays.asList("dialogue_3", "dialogue_4")
    ))
    .mergeNodeId("merge_1")
    .mergeStrategy(ParallelNode.MergeStrategy.ALL)
    .build();

// 合并状态
List<GraphState> branchStates = ...; // 各分支的状态
GraphState mergedState = ParallelNode.mergeStates(branchStates, MergeStrategy.ALL);
```

---

## 📝 实现细节

### 状态合并策略

#### ALL（合并所有分支的状态）
- Map类型：合并所有键值对
- List类型：合并所有元素（去重）
- 其他类型：后面的覆盖前面的

#### FIRST（使用第一个分支的状态）
- 直接返回第一个分支的状态副本

#### LAST（使用最后一个分支的状态）
- 直接返回最后一个分支的状态副本

---

## ⚠️ 注意事项

1. **并行执行的实现**:
   - 当前GraphEngine是单线程执行模型
   - 需要扩展EnhancedGraphExecutor支持并行执行
   - 可以使用CompletableFuture实现异步并行执行
   - 或者使用顺序模拟（逐个执行分支，但逻辑上是并行的）

2. **状态隔离**:
   - 每个分支需要有独立的状态副本
   - 使用GraphState.clone()创建状态副本
   - 分支之间不能相互影响

3. **错误处理**:
   - 某个分支执行失败时的处理策略
   - 是否需要所有分支都成功，还是允许部分失败
   - 失败分支的状态如何合并

4. **等待和选择节点**:
   - 如果分支中包含WaitNode或ChoiceNode，需要特殊处理
   - 可能需要等待所有分支都完成等待后才能继续

---

## ✅ 完成检查清单

- [x] ParallelNode 类实现
- [x] ParallelNodeConfig 配置类
- [x] NodeFactory 注册
- [ ] EnhancedGraphExecutor 并行执行支持
- [ ] 单元测试
- [ ] 前端编辑器支持
- [ ] 文档更新

---

**文档维护者**: HeartSphere Development Team  
**最后更新**: 2025-01-02
