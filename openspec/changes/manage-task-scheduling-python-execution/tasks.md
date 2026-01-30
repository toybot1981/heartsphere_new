# Tasks: 将任务调度提示词和 Python 执行流程信息在管理端进行管理

**变更ID**: `manage-task-scheduling-python-execution`

## 1. 数据模型设计

- [ ] 1.1 设计任务调度提示词的数据模型（复用 PromptTemplate 或扩展）
- [ ] 1.2 设计 Python 执行配置的数据模型（新建 ExecutionConfig 实体或扩展现有实体）
- [ ] 1.3 创建数据库迁移脚本（如果需要新表）
- [ ] 1.4 定义配置项的 JSON Schema（用于验证配置格式）

## 2. 配置数据初始化

- [ ] 2.1 提取 `AgentScopeTaskDecomposer` 中的 `MULTI_AGENT_DECOMPOSE_PROMPT_TEMPLATE` 提示词
- [ ] 2.2 提取 `LLMTaskDecomposer` 中的 `DECOMPOSE_PROMPT_TEMPLATE` 提示词
- [ ] 2.3 提取 `VmScriptExecutor` 中的 Python 执行配置信息（依赖检测、命令构建逻辑等）
- [ ] 2.4 准备配置数据导入脚本
- [ ] 2.5 执行数据导入，验证数据完整性

## 3. 后端服务实现

- [ ] 3.1 创建 `TaskSchedulingConfigService` 服务（用于读取任务调度提示词）
- [ ] 3.2 创建 `PythonExecutionConfigService` 服务（用于读取 Python 执行配置）
- [ ] 3.3 修改 `AgentScopeTaskDecomposer`，从管理系统读取提示词，保留硬编码作为 fallback
- [ ] 3.4 修改 `LLMTaskDecomposer`，从管理系统读取提示词，保留硬编码作为 fallback
- [ ] 3.5 修改 `VmScriptExecutor`，从管理系统读取配置，保留硬编码作为 fallback
- [ ] 3.6 实现配置缓存机制（提高性能）
- [ ] 3.7 添加配置验证逻辑（确保配置格式正确）

## 4. 管理端 API 实现

- [ ] 4.1 扩展 `AdminPromptController`，添加任务调度提示词管理接口
- [ ] 4.2 创建 `AdminExecutionConfigController`，提供 Python 执行配置管理接口
- [ ] 4.3 实现配置的 CRUD 操作（创建、读取、更新、删除）
- [ ] 4.4 实现配置版本管理接口（如果需要）
- [ ] 4.5 添加配置验证接口（验证配置格式是否正确）

## 5. 管理端前端实现

- [ ] 5.1 扩展 `PromptManagement.tsx`，添加任务调度提示词管理界面
- [ ] 5.2 创建 `PythonExecutionConfigManagement.tsx`，提供 Python 执行配置管理界面
- [ ] 5.3 实现配置的编辑、保存、预览功能
- [ ] 5.4 实现配置的版本历史查看功能（如果需要）
- [ ] 5.5 添加配置验证提示（实时验证配置格式）

## 6. 测试验证

- [ ] 6.1 单元测试：测试配置读取服务的功能
- [ ] 6.2 集成测试：测试任务调度提示词从管理系统读取的功能
- [ ] 6.3 集成测试：测试 Python 执行配置从管理系统读取的功能
- [ ] 6.4 功能测试：测试管理端配置编辑和保存功能
- [ ] 6.5 回退测试：测试 fallback 机制（当管理系统配置不存在时使用硬编码）
- [ ] 6.6 性能测试：测试配置读取性能（验证缓存机制）

## 7. 文档和迁移

- [ ] 7.1 编写配置管理使用指南
- [ ] 7.2 编写配置项说明文档（每个配置项的含义和用法）
- [ ] 7.3 更新开发指南，说明如何使用配置管理系统
- [ ] 7.4 确认所有配置都已迁移到管理系统
- [ ] 7.5 （可选）移除硬编码的提示词和配置（保留 fallback 机制）
