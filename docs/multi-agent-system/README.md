# 多智能体框架文档

## 欢迎

欢迎使用多智能体框架文档！本文档集合提供了框架的完整指南。

## 快速导航

### 🚀 新手入门
- [快速开始指南](./QUICKSTART.md) - 10分钟快速上手
- [快速参考](./QUICK_REFERENCE.md) - 常用操作和代码示例
- [文档索引](./INDEX.md) - 完整文档导航

### 📖 核心文档
- [架构设计](./ARCHITECTURE.md) - 完整的架构设计文档
- [API 使用指南](./API_GUIDE.md) - API 使用示例和最佳实践
- [API 参考](./API_REFERENCE.md) - API 详细参考
- [使用指南](./USAGE_GUIDE.md) - 详细使用说明

### 💡 最佳实践
- [最佳实践](./BEST_PRACTICES.md) - 开发和使用最佳实践
- [性能优化](./PERFORMANCE.md) - 性能优化策略和测试方法
- [配置指南](./CONFIGURATION_GUIDE.md) - 配置说明

### 🧪 测试和部署
- [测试指南](./TESTING_GUIDE.md) - 测试策略和测试用例编写
- [覆盖率报告](./COVERAGE_REPORT.md) - 测试覆盖率统计和改进计划
- [CI/CD 指南](./CI_CD_GUIDE.md) - CI/CD 集成指南
- [部署指南](./DEPLOYMENT.md) - 部署和运行指南

### 🔌 集成
- [AgentScope 集成](./AGENTSCOPE_INTEGRATION.md) - AgentScope 集成说明
- [MCP 工具执行](./MCP_TOOL_EXECUTION.md) - MCP 工具执行说明

### 📝 其他
- [示例场景](./EXAMPLE_SCENARIOS.md) - 实际使用场景示例
- [变更日志](./CHANGELOG.md) - 变更历史
- [实施完成报告](./IMPLEMENTATION_COMPLETE.md) - 实施完成详细报告

## 文档结构

```
docs/multi-agent-system/
├── README.md                    # 本文档
├── INDEX.md                     # 文档索引
├── QUICKSTART.md               # 快速开始
├── QUICK_REFERENCE.md          # 快速参考
├── ARCHITECTURE.md             # 架构设计
├── API_GUIDE.md                # API 使用指南
├── API_REFERENCE.md            # API 参考
├── BEST_PRACTICES.md           # 最佳实践
├── PERFORMANCE.md              # 性能优化
├── TESTING_GUIDE.md            # 测试指南
├── COVERAGE_REPORT.md          # 覆盖率报告
├── CI_CD_GUIDE.md             # CI/CD 指南
├── DEPLOYMENT.md              # 部署指南
├── CONFIGURATION_GUIDE.md     # 配置指南
├── USAGE_GUIDE.md            # 使用指南
├── EXAMPLE_SCENARIOS.md      # 示例场景
├── AGENTSCOPE_INTEGRATION.md # AgentScope 集成
├── MCP_TOOL_EXECUTION.md    # MCP 工具执行
├── CHANGELOG.md              # 变更日志
└── IMPLEMENTATION_COMPLETE.md # 实施完成报告
```

## 快速开始

1. **阅读快速开始指南**
   ```bash
   cat docs/multi-agent-system/QUICKSTART.md
   ```

2. **查看快速参考**
   ```bash
   cat docs/multi-agent-system/QUICK_REFERENCE.md
   ```

3. **运行示例**
   ```bash
   cd main/backend
   mvn test -Dtest=com.heartsphere.multiagent.*
   ```

## 获取帮助

- 查看 [文档索引](./INDEX.md) 找到相关文档
- 查看 [快速参考](./QUICK_REFERENCE.md) 查找常用操作
- 查看 [最佳实践](./BEST_PRACTICES.md) 了解推荐做法

## 更新日志

最新更新请查看 [变更日志](./CHANGELOG.md)。

## 相关资源

- 代码仓库：`main/backend/src/main/java/com/heartsphere/multiagent/`
- 测试代码：`main/backend/src/test/java/com/heartsphere/multiagent/`
- CI/CD 配置：`.github/workflows/multi-agent-tests.yml`

---

**最后更新**：2026-01-24
