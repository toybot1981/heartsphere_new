# Graph StateChangeNode 创建失败问题修复

## 问题描述

在执行Graph时，创建StateChangeNode节点失败，错误信息：
```
创建节点失败: state_change_1
```

## 问题原因

1. **StateChangeNodeConfig缺少无参构造函数**：Jackson反序列化时需要无参构造函数
2. **配置中可能缺少id字段**：StateChangeNodeConfig需要id字段，但nodeConfig可能不包含
3. **changes字段可能为null**：需要确保changes字段不为null

## 修复方案

### 1. 优化StateChangeNodeConfig类

- 添加`@NoArgsConstructor`和`@AllArgsConstructor`注解
- 移除`@JsonCreator`，使用标准的Jackson反序列化
- 确保changes字段有默认值

### 2. 优化NodeFactory.createStateChangeNode方法

- 添加详细的错误处理和日志
- 确保config中包含必要的字段
- 处理null值情况

### 3. 优化GraphExecutionService

- 在创建节点前，确保nodeConfig包含nodeId
- 如果config中没有id，使用nodeDTO.getNodeId()

## 修复文件

1. `backend/src/main/java/com/heartsphere/aiagent/graph/core/node/StateChangeNodeConfig.java`
2. `backend/src/main/java/com/heartsphere/aiagent/graph/core/node/NodeFactory.java`
3. `backend/src/main/java/com/heartsphere/aiagent/service/GraphExecutionService.java`

## 测试建议

1. 测试创建包含StateChangeNode的Graph
2. 测试执行包含StateChangeNode的Graph
3. 测试StateChangeNode的各种配置情况（有/无id，有/无changes）

## 后续优化建议

1. 添加更详细的节点配置验证
2. 提供更友好的错误信息
3. 添加节点配置的默认值处理
