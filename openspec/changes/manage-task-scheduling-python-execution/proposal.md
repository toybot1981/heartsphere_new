# Change: 将任务调度提示词和 Python 执行流程信息在管理端进行管理

**变更ID**: `manage-task-scheduling-python-execution`  
**状态**: 提案中

## Why

当前系统中，任务调度提示词和 Python 执行流程信息都是硬编码在代码中的，存在以下问题：

1. **无法灵活调整**：任务调度提示词和 Python 执行配置需要修改代码才能调整，无法通过管理界面动态更新
2. **缺乏统一管理**：这些配置信息分散在代码中（`AgentScopeTaskDecomposer`、`LLMTaskDecomposer`、`VmScriptExecutor`），难以统一管理和维护
3. **版本管理困难**：无法追踪配置的变更历史，难以回滚到之前的版本
4. **缺乏可视化**：管理员无法直观地查看和编辑这些配置信息

## What Changes

- **任务调度提示词管理**：
  - 将 `AgentScopeTaskDecomposer` 中的 `MULTI_AGENT_DECOMPOSE_PROMPT_TEMPLATE` 迁移到管理系统
  - 将 `LLMTaskDecomposer` 中的 `DECOMPOSE_PROMPT_TEMPLATE` 迁移到管理系统
  - 支持在管理端编辑和调整这些提示词模板

- **Python 执行流程配置管理**：
  - 将 `VmScriptExecutor` 中的 Python 依赖检测逻辑配置化
  - 将 Python 命令构建逻辑配置化（如脚本文件路径、base64 编码方式等）
  - 支持在管理端配置 Python 执行相关的参数

- **代码重构**：
  - 修改 `AgentScopeTaskDecomposer` 和 `LLMTaskDecomposer`，从管理系统读取提示词
  - 修改 `VmScriptExecutor`，从管理系统读取 Python 执行配置
  - 保留硬编码作为 fallback 机制，确保向后兼容

## Impact

- **影响的规范**：
  - `task-scheduling-config` - 任务调度配置管理能力（新增）
  - `python-execution-config` - Python 执行配置管理能力（新增）
  - `prompt-template-management` - 提示词模板管理能力（扩展）

- **影响的代码**：
  - `mentis/backend/src/main/java/com/heartsphere/mentis/executor/impl/AgentScopeTaskDecomposer.java`
  - `mentis/backend/src/main/java/com/heartsphere/mentis/executor/impl/LLMTaskDecomposer.java`
  - `mentis/backend/src/main/java/com/heartsphere/mentis/executor/impl/VmScriptExecutor.java`
  - `admin/backend/src/main/java/com/heartsphere/admin/controller/AdminPromptController.java`（扩展）
  - `admin/frontend/src/components/PromptManagement.tsx`（扩展）
  - `shared/backend/src/main/java/com/heartsphere/shared/entity/PromptTemplate.java`（可能需要扩展）

- **数据库**：
  - `prompt_templates` 表（扩展，用于存储任务调度提示词）
  - 可能需要新增 `execution_configs` 表（用于存储 Python 执行配置）

## Benefits

1. **灵活调整**：管理员可以通过管理界面调整任务调度提示词和 Python 执行配置，无需修改代码
2. **统一管理**：所有配置信息集中在管理系统中，便于维护
3. **版本控制**：配置变更历史可追溯，支持版本回滚
4. **可视化编辑**：管理员可以直观地查看和编辑配置信息
5. **A/B 测试**：可以轻松创建多个版本的配置进行测试

## Risks

- **配置错误风险**：错误的配置可能导致任务调度或 Python 执行失败
- **向后兼容性**：需要确保 fallback 机制正常工作
- **性能影响**：每次执行都需要从数据库读取配置，可能需要缓存优化

## Migration Plan

1. 创建新的配置数据模型（如果需要）
2. 将现有硬编码的提示词和配置导入管理系统
3. 修改代码，从管理系统读取配置，保留硬编码作为 fallback
4. 在管理界面添加配置管理功能
5. 测试验证功能正常
6. 确认所有配置都已迁移后，移除硬编码（可选）
