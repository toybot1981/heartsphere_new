# Design: HSMem 实现逻辑分析与 Java 实现可行性

## 1. HSMem 当前实现逻辑概览

### 1.1 架构与职责

- **入口**：`rest_api_server.py`（FastAPI），提供 REST API；依赖 `hscore.MemoryService`。
- **MemoryService**（`hscore/memory/memory_service.py`）：
  - 持有 `MemoryStore`（存储）、`MemoryExtractor`（提取）、`MemoryRetriever`（检索）。
  - `memorize(resource_data, modality, user_id, agent_id)`：存资源 → 按 modality 调用提取器 → 存记忆项与分类。
  - `get_all_items(user_id?)`、`retrieve(queries, where, limit)`、`get_statistics()`、`get_all_categories()` 等读接口。
- **MemoryStore**（`hscore/storage/memory_store.py`）：
  - 三层：ResourceLayer、MemoryItemLayer、MemoryCategoryLayer。
  - 纯文件系统：JSON 文件 + 索引文件（如 `items/index.json`、`categories/categories_index.json`），无数据库。
- **ResourceLayer**：按 modality 分目录（conversation/text/document），每资源一文件 `{resource_id}.json`。
- **MemoryItemLayer**：每记忆项一文件 `{item_id}.json`，索引在 `index.json`；支持按 resource_id、category、user_id 查询。
- **MemoryCategoryLayer**：每分类一 JSON + 一 Markdown 文件，索引在 `categories_index.json`。
- **MemoryExtractor**（`hscore/memory/memory_extractor.py`）：
  - 接受可选 `llm_client`，**当前未使用**。
  - 对话：规则提取（关键词匹配）偏好、习惯、个人信息，聚合成若干记忆项。
  - 文本：整段文本作一条 text_memory。
  - 文档：title+content 作一条 document 记忆项。
- **MemoryRetriever**（`hscore/memory/memory_retriever.py`）：
  - 方法：simple / rag / llm；**当前 rag/llm 均为 simple 的包装**，无向量、无 LLM 调用。
  - simple：按查询关键词对分类的 name/summary/description 做字符串匹配并打分；若 `where.user_id` 存在则过滤该分类下记忆项的 user_id。

### 1.2 数据与契约

- **存储格式**：JSON；资源/记忆项/分类结构见 `hsmem/STORAGE_ARCHITECTURE.md`。记忆项含 `user_id`（可选）、`resource_id`、categories 等。
- **REST 契约**：见 `hsmem/API_EXTENSIONS.md`、`rest_api_server.py`。关键接口：`POST /api/v1/memory/memorize/{conversation|text|document}`，`POST /api/v1/memory/retrieve`，`GET /api/v1/memory/items?user_id=`，`GET /api/v1/memory/statistics`，`GET /api/v1/memory/categories` 等。
- **依赖**：`requirements.txt` 仅列 `python-dateutil`；实际运行依赖 FastAPI、Pydantic、uvicorn（未在 requirements 中显式列出）。无强制 LLM/向量库依赖；可选扩展预留 openai、chromadb、sentence-transformers。

### 1.3 小结

当前 HSMem 为**无数据库、无向量、无 LLM 调用**的轻量实现：REST + 文件存储 + 规则提取 + 关键词检索，逻辑可直接用其它语言等价实现。

---

## 2. Java 实现可行性结论

**结论：在当前功能范围内，用 Java 实现 HSMem 行为可行。**

### 2.1 理由摘要

| 维度 | 说明 |
|------|------|
| 存储 | 仅文件 I/O + JSON；Java 可用 `java.nio.file`、Jackson 读写相同目录与文件格式，与现有 Python 数据兼容。 |
| 提取 | 当前为规则与字符串处理，无 LLM；Java 可完全复刻逻辑，或后续通过 HTTP 调用现有 Python 提取服务。 |
| 检索 | simple 为关键词匹配；rag/llm 为占位；Java 可先实现 simple，预留 RAG/LLM 接口。 |
| API | REST 契约固定；Spring Boot（Web MVC 或 WebFlux）即可实现相同路径与请求/响应体。 |
| 异步 | Python 使用 async/await；Java 可用 `CompletableFuture` 或 WebFlux 响应式，或同步阻塞式（数据量不大时亦可接受）。 |

### 2.2 组件到 Java 的映射建议

| Python 组件 | Java 映射建议 |
|-------------|----------------|
| FastAPI + uvicorn | Spring Boot Web（MVC 或 WebFlux），OpenAPI 与现有 Main/Admin 一致。 |
| Pydantic 请求/响应 | DTO + Jackson 序列化；校验可用 Bean Validation。 |
| MemoryStore + 三层 Layer | 同包下三个 Layer 类，同一 base path；接口保持 `store/get/get_all` 等语义。 |
| MemoryExtractor | Service 类，方法 `extractFromConversation/FromText/FromDocument`，内部规则与现有一致。 |
| MemoryRetriever | Service 类，`retrieve(query, where, limit)`；先实现 simple，rag/llm 返回与 simple 相同或委托远程。 |
| 文件路径与 JSON 结构 | 与现有 `memory_data/` 目录及 `*.json` 结构一致，便于双写或迁移。 |

### 2.3 数据兼容性

- **读已有数据**：Java 使用相同目录与 JSON 字段名，可直接读取 Python 写入的资源/记忆项/分类文件。
- **写**：Java 写入的 JSON 与当前 Python 格式一致时，Python 服务也可读；若未来仅保留 Java 实现，无需迁移脚本。

### 2.4 部署与集成方式

- **独立服务**：与现 Python 类似，单独进程、独立端口，Main/Admin 通过 HTTP 调用。
- **嵌入 Main 后端**：以 Spring Boot 模块形式提供相同 REST，与 Main 同进程，减少部署组件；存储路径可配置为本地目录或共享盘。

### 2.5 风险与边界

- **扩展能力**：若未来在 Python 侧接入真实 RAG/LLM，Java 侧需同步增加调用（如 HTTP 调 Python 或 Java 内嵌/调用嵌入模型与向量库）。
- **性能**：大量记忆项时，simple 检索为全分类扫描；若需优化，可在 Java 侧加索引或后续引入数据库/向量库，与当前“可行性”评估不冲突。
- **本分析不包含**：具体 Java 代码实现、迁移脚本、双写/灰度方案；仅确认逻辑可移植与数据兼容，供后续实施提案使用。

---

## 3. 建议的实施范围（若采纳 Java 实现）

1. **Phase 1**：REST API 与三层文件存储与现有契约、目录结构一致；MemoryExtractor 规则与当前 Python 一致；MemoryRetriever 仅实现 simple，rag/llm 返回与 simple 相同或 501。
2. **Phase 2**（可选）：RAG/LLM 检索以接口形式预留，内部调用现有 Python 或未来 Java 嵌入/向量服务。
3. **数据**：不改变现有 JSON 文件格式与 `user_id`、`resource_id`、categories 等字段语义，保证与现有 Main/Admin 客户端兼容。

---

## 4. 在 Main 后端 memory 中实现 HSMem 等价逻辑与 API

### 4.1 目标

在 **Main 后端**（`main/backend`）的 **memory** 模块中实现与当前 HSMem **完全一致**的业务逻辑与 REST API，使「我的记忆」与管理端用户记忆可统一走 Main 内置实现（或通过配置在「外部 HSMem 服务」与「Main 内置实现」之间切换）。

### 4.2 API 契约对齐

- **与 HSMem 保持一致**：请求/响应体、HTTP 方法、路径、状态码与 HSMem REST API 一致。
- **Main 现有路径**：当前 Main 暴露为 `/api/memory/v1/hsmem/*`（如 `/api/memory/v1/hsmem/memorize/conversation`），对应调用外部 HSMem 的 `/api/v1/memory/*`。内置实现时，**同一路径**由 Main 本地服务处理，请求/响应格式与 HSMem 文档一致（如 `POST /api/v1/memory/memorize/conversation` 的 body/response 与 Main 的 DTO 对齐）。
- **契约参考**：`hsmem/API_EXTENSIONS.md`、`hsmem/rest_api_server.py` 中定义的路径与 Pydantic 模型；Java 侧 DTO 与响应结构与之一一对应。

### 4.3 实现范围与包结构建议

| 层级 | 位置（建议） | 职责 |
|------|----------------|------|
| **Controller** | `memory.controller` 下现有或新增 | 暴露与 HSMem 一致的 API；根据配置注入「HSMem 客户端」或「本地 MemoryService」，统一入口。 |
| **MemoryService** | `memory.service.hsmem.local`（或等价包） | 与 Python MemoryService 一致：memorize、get_all_items、retrieve、get_statistics、get_all_categories、get_all_resources 等。 |
| **MemoryStore** | `memory.service.hsmem.local.store` | 三层：ResourceLayer、MemoryItemLayer、MemoryCategoryLayer；文件存储路径可配置（如 `memory.hsmem.local.base-path`）。 |
| **MemoryExtractor** | `memory.service.hsmem.local.extractor` | 规则与 Python 一致：对话提取偏好/习惯/个人信息，文本/文档单条或 title+content。 |
| **MemoryRetriever** | `memory.service.hsmem.local.retriever` | simple 检索：按关键词对分类 name/summary/description 匹配，where.user_id 过滤；rag/llm 可委托 simple 或 501。 |
| **存储格式** | 与 HSMem 相同 | 目录结构、JSON 字段名与 `STORAGE_ARCHITECTURE.md` 一致，便于与 Python 数据互读或迁移。 |

### 4.4 配置与切换

- **配置项**（示例）：`memory.hsmem.mode=remote | local`；`memory.hsmem.local.base-path` 为文件存储根目录。
- **remote**：沿用现有 `HSMemClientService` 调用外部 HSMem 服务。
- **local**：使用 Main 内置的 MemoryService + Store + Extractor + Retriever，读写本地目录。
- 切换时**不改变**对外 API 路径与契约，仅后端数据源不同。

### 4.5 与现有 MemoryController 的集成

- 现有 `MemoryController` 已提供 `/api/memory/v1/hsmem/*`，并注入 `HSMemClientService`。
- 实现时新增「本地 MemoryService」实现同一接口（如 `HSMemApi`），Controller 根据配置选择调用 `HSMemClientService` 或本地 `HSMemLocalService`，保证对外暴露的仍是同一套 HSMem 兼容 API。

---

## 5. API 自动化测试方案

### 5.1 适用范围

针对 Main 后端 **memory 模块中暴露的 HSMem 兼容 API**（memorize/conversation、memorize/text、memorize/document、retrieve、statistics、categories、items、resources 等），提供 **API 自动化测试方案**。

### 5.2 执行约定

- **技能**：由 **api-automation-testing** 技能完成。
- **流程**：先对 memory/HSMem 接口做**需求分析**（从设计文档与 HSMem API 契约提取接口、参数、预期状态码与响应要点），再围绕需求编写用例；执行失败时停止、采集后台日志、产出 `agent_failure_summary.md` 与 `test_run_state.json`，交 Agent 修复后使用 `scripts/start/` 下脚本（如 `start-main-backend.sh`）重启 Main 后端，再继续测试直至通过。
- **资产位置**：测试计划、结果、报告、失败摘要与现场状态存放于 Main 后端专有目录，如 `main/backend/api-tests/memory-hsmem/`（含 `api_test_plan.json`、`results.json`、`report.md`、`agent_failure_summary.md`、`test_run_state.json`），符合 automation-test-scheme 与 api-automation-testing 约定。

### 5.3 需求分析要点

- 接口列表：memorize（conversation/text/document）、retrieve、GET statistics/categories/items/resources、GET items/{id}、GET resources/{id}、GET categories/{name}。
- 每个接口：方法、路径、请求体/查询参数、期望状态码、响应体关键字段或包含关系。
- 用例覆盖：正常路径、缺失参数、非法 ID、user_id 过滤行为等；可与「HSMem 实现逻辑」与「design 4.2 契约」对应，便于追溯。
