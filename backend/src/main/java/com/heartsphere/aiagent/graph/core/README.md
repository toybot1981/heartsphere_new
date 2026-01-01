# Graph引擎核心实现

## 概述

这是"高级角色和剧本设计器"的核心Graph执行引擎。

**技术决策**：基于技术预研结果，使用自定义Graph引擎实现（不使用Spring AI Graph）。

## 包结构

```
com.heartsphere.aiagent.graph.core/
├── GraphEngine.java          # 核心Graph引擎实现
├── node/                     # 节点实现（待开发）
├── router/                   # 路由实现（待开发）
└── exception/                # 异常定义（待开发）
```

## 核心概念

### GraphState（状态）
- 用于在节点之间传递数据
- 支持数据读写和克隆

### GraphNode（节点）
- Graph的执行单元
- 每个节点执行特定的逻辑
- 接收状态，返回更新后的状态

### GraphRouter（路由）
- 根据条件选择下一个节点
- 支持条件分支逻辑

### GraphEdge（边）
- 连接节点
- 可以带路由条件

### GraphDefinition（Graph定义）
- 包含所有节点和边
- 定义起始节点

### GraphExecutor（执行器）
- 执行Graph定义
- 控制执行流程
- 防止无限循环

## 使用示例

```java
@Autowired
private GraphEngine graphEngine;

public void example() {
    // 创建Graph定义
    GraphEngine.GraphDefinition graph = graphEngine.createGraphDefinition();
    
    // 创建节点
    GraphEngine.GraphNode startNode = new GraphEngine.GraphNode() {
        @Override
        public String getId() {
            return "start";
        }
        
        @Override
        public GraphEngine.GraphState execute(GraphEngine.GraphState state) {
            state.setData("message", "开始");
            return state;
        }
    };
    
    // 添加节点和边
    graph.addNode(startNode);
    graph.addEdge(new GraphEngine.GraphEdge("start", "next"));
    graph.setStartNodeId("start");
    
    // 执行Graph
    GraphEngine.GraphState initialState = graphEngine.createState();
    GraphEngine.GraphExecutor executor = graphEngine.createExecutor(graph);
    GraphEngine.GraphState finalState = executor.execute(initialState);
}
```

## 后续开发计划

1. **节点类型实现**（优先级：高）
   - 对话节点
   - 选择节点
   - 条件判断节点
   - 技能检查节点
   - 状态变更节点

2. **高级功能**（优先级：中）
   - 并行节点执行
   - 循环节点
   - 错误处理和回滚

3. **状态持久化**（优先级：中）
   - 状态保存
   - 状态恢复

4. **性能优化**（优先级：低）
   - 执行性能优化
   - 缓存机制

## 相关文档

- [技术预研报告](../../../../docs/graph-research-final-report.md)
- [高级角色和剧本设计器思路梳理](../../../../../../docs/需求分析/高级角色和剧本设计器思路梳理.md)
