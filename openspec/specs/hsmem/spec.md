# hsmem Specification

## Purpose

定义 HSMem（HeartSphere Memory System）的规范约束：维护实现逻辑与 Java 可行性分析文档；若 Main 后端提供等价实现，则逻辑与 API 须与 HSMem 一致，并配备 API 自动化测试方案（api-automation-testing）。
## Requirements
### Requirement: HSMem 实现逻辑与 Java 可行性分析文档

项目 SHALL 维护 HSMem（HeartSphere Memory System）的实现逻辑分析与 Java 实现可行性分析文档；分析结论与设计决策 SHALL 记录在对应 OpenSpec 变更的 `design.md` 或项目既定文档位置，便于后续实施或归档时追溯。

#### Scenario: 产出实现逻辑分析

- **WHEN** 需要对 HSMem 进行技术评估或迁移（如 Java 重写、替代实现）
- **THEN** 须有文档描述 HSMem 当前架构、存储、API、提取器与检索器行为及依赖
- **AND** 该描述 SHALL 足以支撑可行性判断与实施范围划分
- **AND** 文档 SHALL 存放在 OpenSpec 变更的 `design.md` 或项目 `docs/` / `hsmem/` 下并可从规范或提案引用

#### Scenario: 产出 Java 可行性结论

- **WHEN** 评估 HSMem 是否可用 Java（或其它技术栈）实现
- **THEN** 须有明确的可行性结论（可行 / 部分可行 / 不可行）及理由
- **AND** 须说明组件映射、数据兼容性、部署方式与风险边界
- **AND** 结论与建议实施范围 SHALL 记录在同一分析文档或关联 design 中

### Requirement: Main 后端 HSMem 等价实现与 API 一致性

若在 Main 后端 memory 模块中实现 HSMem 等价逻辑，则 SHALL 与 HSMem 的**逻辑与 API 完全一致**：三层文件存储、规则提取器、simple 检索器行为与 Python 实现一致；REST 路径、请求/响应体、状态码与 HSMem 现有契约一致；存储目录与 JSON 格式与 HSMem 兼容，可通过配置在「外部 HSMem 服务」与「Main 内置实现」之间切换。

#### Scenario: Main 后端实现与 HSMem 逻辑一致

- **WHEN** Main 后端提供 HSMem 等价实现（本地 MemoryService + Store + Extractor + Retriever）
- **THEN** 存储层 SHALL 使用与 HSMem 相同的三层结构与 JSON 格式（Resource / MemoryItem / MemoryCategory）
- **AND** 提取器规则 SHALL 与 Python MemoryExtractor 一致（对话偏好/习惯/个人信息关键词；文本/文档单条或 title+content）
- **AND** 检索器 simple 行为 SHALL 与 Python MemoryRetriever 一致（分类 name/summary/description 匹配，where.user_id 过滤）

#### Scenario: Main 后端实现与 HSMem API 一致

- **WHEN** Main 后端暴露 HSMem 兼容 API（memorize、retrieve、statistics、categories、items、resources 等）
- **THEN** 路径、HTTP 方法、请求体与查询参数、响应体结构与 HSMem REST API 文档一致
- **AND** 客户端（Main 前端、Admin 前端或代理）无需因切换「外部 HSMem」与「Main 内置」而修改请求格式

### Requirement: Main 后端 memory/HSMem API 的自动化测试方案

若在 Main 后端实现 HSMem 等价并暴露相应 API，则 SHALL 为该部分 API 提供 **API 自动化测试方案**：由 **api-automation-testing** 技能完成，先对 memory/HSMem 接口做**需求分析**，再围绕需求编写用例；测试资产存放在 Main 后端专有目录（如 `main/backend/api-tests/memory-hsmem/`）；执行失败时按技能约定查看后台日志、交 Agent 修复、使用 `scripts/start/` 下脚本重启 Main 后端后继续测试直至通过。

#### Scenario: 提供 memory/HSMem API 测试计划与执行

- **WHEN** Main 后端提供 HSMem 兼容 API（本地或代理）
- **THEN** 须有 API 自动化测试计划（如 `api_test_plan.json`），覆盖 memorize、retrieve、statistics、categories、items、resources 等接口
- **AND** 测试计划 SHALL 基于需求分析（接口契约、参数、期望状态码与响应要点）编写，用例与需求可追溯
- **AND** 测试资产（计划、结果、报告、agent_failure_summary、test_run_state）SHALL 存放在 `main/backend/api-tests/memory-hsmem/` 或项目约定的 api-tests 目录
- **AND** 执行失败时 SHALL 按 api-automation-testing 技能流程：停止、采集日志、产出失败摘要与现场状态、Agent 修复、使用 `scripts/start/` 重启 Main 后端、继续或 --resume-from 直至通过

