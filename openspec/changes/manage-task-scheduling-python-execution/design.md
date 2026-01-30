# 将任务调度提示词和 Python 执行流程信息在管理端进行管理 - 设计文档

**变更ID**: `manage-task-scheduling-python-execution`

## Context

当前系统中，任务调度提示词和 Python 执行流程信息都是硬编码在代码中的：

1. **任务调度提示词**：
   - `AgentScopeTaskDecomposer.MULTI_AGENT_DECOMPOSE_PROMPT_TEMPLATE` - 多智能体任务分解提示词
   - `LLMTaskDecomposer.DECOMPOSE_PROMPT_TEMPLATE` - 单智能体任务分解提示词

2. **Python 执行流程信息**：
   - `VmScriptExecutor` 中的 Python 依赖检测逻辑（`detectAndInstallPythonDependencies` 方法）
   - Python 命令构建逻辑（脚本文件路径、base64 编码方式等）

这些信息需要能够通过管理界面灵活调整，而无需修改代码。

## Goals / Non-Goals

### Goals
- 将任务调度提示词迁移到管理系统，支持在管理端编辑
- 将 Python 执行流程配置迁移到管理系统，支持在管理端配置
- 保持向后兼容性，保留硬编码作为 fallback 机制
- 提供配置验证功能，确保配置格式正确

### Non-Goals
- 不改变任务调度和 Python 执行的核心逻辑
- 不实现复杂的配置版本管理系统（初期版本）
- 不实现配置的 A/B 测试功能（后续可扩展）

## Decisions

### 决策1: 数据模型选择

**问题**: 如何存储任务调度提示词和 Python 执行配置？

**选项**:
1. 复用现有的 `PromptTemplate` 实体（用于任务调度提示词）
2. 创建新的 `ExecutionConfig` 实体（用于 Python 执行配置）
3. 扩展 `PromptTemplate` 实体，支持存储配置信息

**决策**: 
- 任务调度提示词：复用 `PromptTemplate` 实体，使用不同的 `categoryCode` 区分
- Python 执行配置：创建新的 `ExecutionConfig` 实体，使用 JSON 格式存储配置

**理由**:
- 任务调度提示词本质上是提示词模板，可以复用现有模型
- Python 执行配置是结构化数据，需要独立的实体和验证逻辑
- 分离关注点，便于维护和扩展

### 决策2: 配置存储格式

**问题**: Python 执行配置如何存储？

**选项**:
1. 使用 JSON 格式存储在单个字段中
2. 使用多个字段分别存储不同的配置项
3. 使用关系表存储配置项

**决策**: 使用 JSON 格式存储在单个字段中

**理由**:
- 配置项可能动态变化，JSON 格式更灵活
- 便于在管理界面中编辑和验证
- 减少数据库表结构变更

**配置结构示例**:
```json
{
  "python": {
    "scriptFilePrefix": "/tmp/mentis_script_",
    "scriptFileSuffix": ".py",
    "useBase64Encoding": true,
    "autoDetectDependencies": true,
    "commonLibraries": [
      "playwright", "selenium", "requests", "beautifulsoup4", "bs4",
      "pandas", "numpy", "matplotlib", "pillow", "PIL"
    ],
    "installCommandTemplate": "pip3 install {library} --quiet --disable-pip-version-check 2>/dev/null || pip install {library} --quiet --disable-pip-version-check 2>/dev/null || true",
    "playwrightInstallCommand": "(pip3 install playwright --quiet --disable-pip-version-check 2>/dev/null || pip install playwright --quiet --disable-pip-version-check 2>/dev/null || true) && (playwright install chromium --quiet 2>/dev/null || true)"
  }
}
```

### 决策3: Fallback 机制

**问题**: 如何处理管理系统配置不存在或读取失败的情况？

**选项**:
1. 直接抛出异常，要求必须配置
2. 使用硬编码作为 fallback
3. 使用默认配置作为 fallback

**决策**: 使用硬编码作为 fallback

**理由**:
- 确保系统在配置缺失时仍能正常工作
- 向后兼容，不影响现有功能
- 降低配置错误导致系统崩溃的风险

### 决策4: 配置缓存策略

**问题**: 如何提高配置读取性能？

**选项**:
1. 每次执行都从数据库读取（简单但性能差）
2. 使用内存缓存（如 Caffeine）
3. 使用 Redis 缓存（分布式场景）

**决策**: 使用内存缓存（Caffeine），缓存时间 5 分钟

**理由**:
- 配置变更频率低，不需要实时更新
- 内存缓存简单高效，满足单机部署需求
- 后续可扩展为 Redis 缓存（如果需要分布式）

## Risks / Trade-offs

### 风险1: 配置错误导致系统故障
- **风险**: 管理员配置错误的提示词或执行配置，导致任务调度或 Python 执行失败
- **缓解**: 
  - 提供配置验证功能，实时检查配置格式
  - 保留硬编码作为 fallback，确保系统可用性
  - 提供配置预览功能，管理员可以预览配置效果

### 风险2: 性能影响
- **风险**: 每次执行都需要读取配置，可能影响性能
- **缓解**: 
  - 使用内存缓存，减少数据库查询
  - 配置变更频率低，缓存命中率高
  - 监控配置读取性能，必要时优化

### 风险3: 配置版本管理
- **风险**: 配置变更后无法回滚到之前的版本
- **缓解**: 
  - 初期版本不实现版本管理，后续可扩展
  - 保留硬编码作为 fallback，可以手动回滚
  - 记录配置变更日志（通过数据库的 `updated_at` 字段）

## Migration Plan

### 阶段1: 数据模型和初始化
1. 创建 `ExecutionConfig` 实体和相关 Repository
2. 提取现有硬编码的提示词和配置
3. 准备数据导入脚本
4. 执行数据导入

### 阶段2: 后端服务实现
1. 创建配置读取服务
2. 修改现有代码，从管理系统读取配置
3. 实现 fallback 机制
4. 实现配置缓存

### 阶段3: 管理端实现
1. 扩展管理端 API
2. 实现管理端前端界面
3. 添加配置验证功能

### 阶段4: 测试和验证
1. 单元测试和集成测试
2. 功能测试
3. 性能测试
4. 回退测试

### 阶段5: 文档和清理
1. 编写使用文档
2. 更新开发指南
3. （可选）移除硬编码

## Open Questions

1. **配置版本管理**: 是否需要实现配置的版本历史功能？
   - 初期版本：不需要，后续可扩展
   
2. **配置 A/B 测试**: 是否需要支持多个版本的配置进行 A/B 测试？
   - 初期版本：不需要，后续可扩展

3. **配置权限控制**: 是否需要限制哪些管理员可以修改配置？
   - 初期版本：使用现有的管理员权限控制

4. **配置变更通知**: 配置变更后是否需要通知相关系统？
   - 初期版本：不需要，通过缓存过期机制自动更新
