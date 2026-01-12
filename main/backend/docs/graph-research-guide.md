# Graph技术预研指南

## 一、预研目的

验证Spring AI Alibaba Graph的可用性，为"高级角色和剧本设计器"项目提供技术决策依据。

## 二、预研代码位置

预研代码位于 `backend/src/main/java/com/heartsphere/aiagent/graph/research/` 目录下：

- `SpringAIGraphTest.java` - Spring AI Graph可用性测试
- `CustomGraphEngine.java` - 自定义Graph引擎（备选方案）
- `GraphResearchController.java` - REST API接口
- `GraphResearchTest.java` - 单元测试

## 三、运行预研测试

### 方式1：运行单元测试

```bash
cd backend
mvn test -Dtest=GraphResearchTest
```

### 方式2：启动应用后通过HTTP测试

1. 启动应用：
```bash
cd backend
mvn spring-boot:run
```

2. 测试Spring AI Graph可用性：
```bash
curl http://localhost:8081/api/graph-research/test-spring-ai-graph
```

3. 测试自定义Graph引擎（简单Graph）：
```bash
curl -X POST http://localhost:8081/api/graph-research/test-custom-graph
```

4. 测试自定义Graph引擎（带路由）：
```bash
curl -X POST "http://localhost:8081/api/graph-research/test-custom-graph?type=router"
```

5. 获取完整研究报告：
```bash
curl http://localhost:8081/api/graph-research/report
```

### 方式3：查看应用启动日志

启动应用时，查看日志中是否有Graph相关的错误或警告信息。

## 四、预期结果分析

### 4.1 Spring AI Graph可用性测试

**如果Spring AI Graph可用：**
- 测试会返回 `available: true`
- 报告中会显示找到的Graph类名
- 建议：可以继续使用Spring AI Graph

**如果Spring AI Graph不可用：**
- 测试会返回 `available: false`
- 报告中会说明未找到相关类
- 可能原因：
  1. 依赖包不存在或未添加
  2. Spring AI Alibaba未提供Graph功能
  3. 需要使用其他方式实现

### 4.2 自定义Graph引擎测试

**测试结果：**
- 简单Graph测试应该成功执行
- 带路由的Graph测试应该正确选择分支
- 证明自定义Graph引擎的基本功能可用

## 五、技术决策

### 决策1：如果Spring AI Graph可用

**建议：**
1. 进一步研究Spring AI Graph的API文档
2. 实现一个简单的示例验证功能完整性
3. 评估性能和稳定性
4. 如果满足需求，使用Spring AI Graph

### 决策2：如果Spring AI Graph不可用

**建议：**
1. 使用自定义Graph引擎（CustomGraphEngine）
2. 根据需求扩展自定义引擎的功能
3. 实现更复杂的节点类型（并行、循环等）
4. 优化性能和错误处理

## 六、下一步行动

1. **运行预研测试**，获取实际结果
2. **分析测试结果**，确定技术方向
3. **制定详细实现计划**
4. **开始实际开发**

## 七、注意事项

1. **依赖检查**：如果Spring AI Graph可用，需要在pom.xml中添加相关依赖
2. **版本兼容性**：确保Graph依赖与Spring Boot版本兼容
3. **文档参考**：参考Spring AI官方文档（如果存在）
4. **备选方案**：始终准备好自定义实现方案

## 八、相关文档

- [高级角色和剧本设计器思路梳理](../需求分析/高级角色和剧本设计器思路梳理.md)
- [高级角色和剧本设计器可行性分析](../需求分析/高级角色和剧本设计器可行性分析.md)
- Spring AI官方文档（如果存在）
- Spring AI Alibaba GitHub仓库
