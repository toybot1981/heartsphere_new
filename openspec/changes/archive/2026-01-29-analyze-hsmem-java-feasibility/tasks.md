# Tasks: 分析 HSMem 实现逻辑、Java 可行性并在 Main 后端 memory 中实现

任务按顺序完成并打勾。分析阶段仅产出设计文档与规范增量；实施阶段编写代码与测试方案。

**阶段一：分析与规范**

- [x] 1. 阅读 HSMem 源码与既有文档（`hsmem/`、`hsmem/hscore/`、`STORAGE_ARCHITECTURE.md`、`DESIGN_ARCHITECTURE.md`），归纳架构、数据流与对外契约。
- [x] 2. 在 `design.md` 中撰写「HSMem 当前实现逻辑概览」：入口、MemoryService/Store/Extractor/Retriever 职责、存储格式与 REST 契约、依赖清单。
- [x] 3. 在 `design.md` 中撰写「Java 实现可行性结论」：可行/部分可行/不可行及理由；组件到 Java 技术栈的映射、数据兼容性、部署方式与风险边界。
- [x] 4. 在 `design.md` 中撰写「在 Main 后端 memory 中实现 HSMem 等价逻辑与 API」：目标、API 契约对齐、包结构、配置与切换、与现有 MemoryController 集成。
- [x] 5. 在 `design.md` 中撰写「API 自动化测试方案」：适用范围、执行约定（api-automation-testing 技能、需求分析、资产位置）、需求分析要点。
- [x] 6. 新增 capability `hsmem`，在 `specs/hsmem/spec.md` 中以 ADDED 形式增加需求：维护 HSMem 实现逻辑与 Java 可行性分析文档；若在 Main 后端实现 HSMem 等价，则逻辑与 API 完全一致，并提供该部分 API 的自动化测试方案（由 api-automation-testing 完成，先需求分析再编写用例，资产存于对应后端 api-tests/ 下）。
- [x] 7. 运行 `openspec validate analyze-hsmem-java-feasibility --strict` 并修复校验问题直至通过。

**阶段二：Main 后端实现（实施阶段）**

- [x] 8. 在 Main 后端 memory 包下实现三层文件存储：ResourceLayer、MemoryItemLayer、MemoryCategoryLayer（目录与 JSON 格式与 HSMem 一致，base-path 可配置）。
- [x] 9. 实现 MemoryExtractor：对话/文本/文档规则与 Python 一致（偏好、习惯、个人信息关键词；文本单条；文档 title+content）。
- [x] 10. 实现 MemoryRetriever：simple 检索（分类 name/summary/description 关键词匹配，where.user_id 过滤）；rag/llm 委托 simple 或返回 501。
- [x] 11. 实现本地 MemoryService：memorize、get_all_items、retrieve、get_statistics、get_all_categories、get_all_resources 等，与 HSMem 语义一致。
- [x] 12. 定义与 HSMem 契约一致的 DTO（请求/响应），实现暴露与 HSMem 相同 API 的 Controller 或委托层；通过配置（如 memory.hsmem.mode=local|remote）在「外部 HSMem 客户端」与「本地 MemoryService」之间切换。
- [x] 13. 为 memory/HSMem 兼容 API 编写 API 自动化测试计划：先需求分析（接口列表、参数、期望状态码与响应要点），再编写 `api_test_plan.json`，存放于 `main/backend/api-tests/memory-hsmem/`。
- [x] 14. 执行 API 自动化测试（api_test_executor）；失败时按 api-automation-testing 技能处理（日志、agent_failure_summary、重启 Main 后端、继续或 resume-from），直至全部通过。
