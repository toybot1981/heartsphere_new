# Change: 分析 HSMem 实现逻辑、判断 Java 可行性并在 Main 后端 memory 中实现

## Why

HSMem（HeartSphere Memory System）当前为 Python 实现（FastAPI + 文件存储），为 Main/Admin 提供记忆化与检索能力。为统一技术栈、便于与现有 Main 后端集成或替代独立 Python 进程，需要：（1）**系统梳理 HSMem 的实现逻辑**并**给出 Java 实现的可行性结论**；（2）**在 Main 后端 memory 模块中实现与 HSMem 完全一致的逻辑与 API**，使「我的记忆」与管理端用户记忆可走同一套本地实现；（3）**为上述 memory/HSMem 接口提供 API 自动化测试方案**（由 api-automation-testing 技能完成，先需求分析再编写用例）。

## What Changes

- **产出 HSMem 实现逻辑分析**
  - 梳理当前 HSMem 的架构、存储、API、提取器与检索器行为及依赖（见 `design.md`）。
  - 明确各组件职责、数据流与对外契约（REST 接口与存储格式），作为 Java 实现与测试的输入。

- **产出 Java 实现可行性结论**
  - 在 `design.md` 中给出可行性结论（可行/部分可行/不可行）及理由。
  - 说明组件到 Java 技术栈的映射、数据兼容性、部署方式与风险边界。
  - 若可行，明确在 Main 后端 memory 中的实现范围与 API 契约对齐方式。

- **在 Main 后端 memory 中实现 HSMem 等价逻辑与 API**
  - 在 `main/backend` 的 memory 相关包中实现与 HSMem **完全一致**的逻辑：三层文件存储（Resource / MemoryItem / MemoryCategory）、规则提取器（对话/文本/文档）、simple 检索器；REST API 与 HSMem 现有契约**一致**（路径、请求/响应体、状态码）。
  - 可通过配置切换「调用外部 HSMem 服务」与「使用 Main 内置实现」；内置实现使用可配置的文件存储路径，与现有 HSMem 目录结构及 JSON 格式兼容。
  - 实现细节与包结构见 `design.md` 第 4 节。

- **API 自动化测试方案**
  - 针对 Main 后端 memory 中暴露的 HSMem 兼容 API，提供 **API 自动化测试方案**：由 **api-automation-testing** 技能完成，先对 memory/HSMem 接口做**需求分析**，再围绕需求编写用例。
  - 测试资产存放在 Main 后端专有目录，如 `main/backend/api-tests/memory-hsmem/`（含 `api_test_plan.json`、需求对应关系、失败时 `agent_failure_summary.md` 与 `test_run_state.json`）；执行失败时按技能约定查看后台日志、交 Agent 修复、使用 `scripts/start/` 下脚本重启 Main 后端后继续测试直至通过。

- **规范增量**
  - 新增 capability `hsmem`，在 `specs/hsmem/spec.md` 中 ADDED 要求：项目 SHALL 维护 HSMem 实现逻辑与 Java 可行性分析文档；若在 Main 后端实现 HSMem 等价，则 SHALL 与 HSMem 逻辑与 API 完全一致，并 SHALL 提供该部分 API 的自动化测试方案（由 api-automation-testing 技能完成，先需求分析再编写用例，资产存于对应后端 `api-tests/` 下）。

## Impact

- **受影响的能力**：新增 capability `hsmem`（本变更内以 ADDED 形式出现在 `specs/hsmem/spec.md`）。
- **受影响的代码与资产**：
  - `main/backend`：新增或扩展 memory 包下的存储层、提取器、检索器及与 HSMem 契约一致的 Controller/API；可选配置切换外部 HSMem 与内置实现。
  - `main/backend/api-tests/memory-hsmem/`：API 测试计划与结果、报告、失败摘要与现场状态（按 api-automation-testing 约定）。
- **受影响的文档**：
  - `openspec/changes/analyze-hsmem-java-feasibility/design.md`：在现有分析基础上增加「Main 后端实现方案」与「API 自动化测试方案」。
  - 不修改现有 `hsmem/` 下 Python 代码（可保留作对照或独立部署），除非后续另有变更。
- **依赖与前置**：依赖现有 HSMem Python 实现与文档作为契约与逻辑参照；依赖 `openspec` 中 automation-test-scheme 与 api-automation-testing 技能约定。
