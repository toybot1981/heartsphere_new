# Graph技术预研代码

## 目录说明

本目录包含Spring AI Graph技术预研的相关代码。

## 文件列表

1. **SpringAIGraphTest.java** - Spring AI Graph可用性测试
   - 使用反射查找Spring AI Graph相关类
   - 提供可用性测试和报告功能

2. **CustomGraphEngine.java** - 自定义Graph引擎（备选方案）
   - 实现基本的Graph执行引擎
   - 包含节点、边、状态、路由等核心概念
   - 提供测试示例

3. **GraphResearchController.java** - REST API控制器
   - 提供HTTP接口用于测试

4. **GraphResearchTest.java** - 单元测试类
   - 位于 `backend/src/test/java/com/heartsphere/aiagent/graph/research/`

## 快速开始

### 运行测试

```bash
# 运行单元测试
cd backend
mvn test -Dtest=GraphResearchTest

# 或启动应用后通过HTTP测试
mvn spring-boot:run
curl http://localhost:8081/api/graph-research/report
```

## 详细文档

- [使用指南](../../../../../docs/graph-research-guide.md)
- [预研总结](../../../../../docs/graph-research-summary.md)

