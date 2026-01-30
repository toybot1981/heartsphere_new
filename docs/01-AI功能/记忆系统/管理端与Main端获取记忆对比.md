# 管理端与 Main 端「获取用户记忆」流程对比

通过 Info 日志可对比两端的入参、数据源和返回条数，便于排查「管理端有数据、现实世界我的记忆无数据」等问题。

## 1. 管理端（Admin）— 用户记忆管理

- **数据来源**: **HSMem**（与 Main「我的记忆」一致）
- **获取方式**: Admin 前端直接调用 `hsmemApi.getAllItems(userId)`（请求 HSMem 服务 `GET /api/v1/memory/items?user_id=...`，Base URL 由 `VITE_HSMEM_BASE_URL` 配置，默认 `http://localhost:8000`）
- **展示**: 将 HSMem 返回的 `MemoryItem[]` 映射为列表与详情展示结构；详情弹窗通过 `hsmemApi.getItem(memoryId)` 拉取单条
- **说明**: 已不再从 Admin 库 MySQL `user_memories` 读取；管理端与 Main 端「我的记忆」均从 HSMem 获取

**特点**:
- 数据来自 HSMem，与 Main「我的记忆」同一数据源
- 列表为 HSMem 该用户全部 items，无分页（由前端/HSMem 返回条数决定）
- 详情为 HSMem 单条 item（id、resource_id、memory_type、summary、content、categories、importance、created_at 等）

---

## 2. Main 端 — 两条获得记忆的路径

### 2.1 长期记忆（MySQL，/memories/search）

- **接口**: `GET /memory/v1/users/{userId}/memories/search?query=...&limit=...`（Main 后端）
- **数据源**: Main 后端连接的 MySQL，`longMemoryService.retrieveRelevantMemories`（同一库内的长期记忆表）
- **日志标识**: `[Main-记忆]` + 「搜索长期记忆」/「长期记忆检索」

**Info 日志示例**:
```
[Main-记忆] 获得记忆-搜索长期记忆: 入参 userId={}, query={}, limit={}
[Main-记忆] 长期记忆检索: userId={}, queryBlank={}, query={}, limit={}
[Main-记忆] 长期记忆检索-返回: 路径=空query列表|关键词搜索|关键词无结果回退, 库内条数={}, 返回条数={}
[Main-记忆] 获得记忆-搜索长期记忆: 数据源=MySQL(longMemoryService.retrieveRelevantMemories), 返回条数={}
[Main-记忆] 获得记忆-搜索长期记忆-返回: 条数={}
```

**特点**:
- 与 Admin 不是同一库：Main 的 MySQL ≠ Admin 的 MySQL（除非配置成同一库）
- query 为空时走「空query列表」；有关键词先 searchByContent，无结果再回退到按用户列表

### 2.2 HSMem 列表（/hsmem/items，现实世界「我的记忆」当前使用）

- **接口**: `GET /memory/v1/hsmem/items?user_id=...`（Main 后端转发到 HSMem 服务）
- **数据源**: HSMem 服务（独立服务），非 MySQL 长期记忆表
- **日志标识**: `[Main-记忆]` + 「HSMem列表」

**Info 日志示例**:
```
[Main-记忆] 获得记忆-HSMem列表: 入参 user_id={}
[Main-记忆] 获得记忆-HSMem列表: authenticatedUserId={}
[Main-记忆] 获得记忆-HSMem列表: user_id 为空，使用认证用户 userIdToQuery={}  （当未传 user_id 时）
[Main-记忆] 获得记忆-HSMem列表: 数据源=HSMem(getItems), items条数={}, total={}
[Main-记忆] 获得记忆-HSMem列表-返回: items条数={}, total={}
```

**特点**:
- 数据来自 HSMem，与 Admin 的 MySQL、Main 的长期记忆 MySQL 均不同
- 现实世界「我的记忆」弹窗已改为只走此接口

---

## 3. 对比小结（统一为 HSMem 后）

| 项目       | 管理端用户记忆管理      | Main 我的记忆 /hsmem/items |
|------------|-------------------------|----------------------------|
| 数据源     | **HSMem**（前端直连）    | **HSMem**（经 Main 后端代理） |
| 获取方式   | `hsmemApi.getAllItems(userId)` | `memoryApi.getItems(userId, token)` → Main `GET /memory/v1/hsmem/items` |
| 前端使用   | 管理后台「用户记忆管理」 | 现实世界「我的记忆」弹窗   |

**结论**:  
**管理端「用户记忆管理」与 Main「我的记忆」均已改为从 HSMem 获取**，两端看到的是同一套 HSMem 记忆数据。Main 端经后端代理（带用户 token），Admin 端前端直连 HSMem（需配置 `VITE_HSMEM_BASE_URL`）。

---

## 4. HSMem 中 user_id 与业务侧用户的关联

- **写入**：Main 端记忆化（对话/文本/文档）时，从认证用户得到数字 ID（如 `123`），会格式化为 `user_123` 写入 HSMem 记忆项。
- **查询**：按用户过滤时需使用**同一格式**。管理端调用 `hsmemApi.getAllItems(userId)` 时，内部会用 `formatUserIdForHsmem` 将数字 ID 转为 `user_123` 再请求 `GET /api/v1/memory/items?user_id=user_123`，才能与 HSMem 中已存记录匹配。
- **历史数据**：早期或未传 `user_id` 写入的记忆项可能没有 `user_id` 字段；API 返回时会统一带上 `user_id`（无则为 `null`），便于前端显示「未关联用户」。

## 5. 管理端「用户记忆管理」数据来源（已统一为 HSMem）

| 项目 | 说明 |
|------|------|
| **数据来源** | **HSMem 服务**（与 Main「我的记忆」一致） |
| **获取方式** | Admin 前端 `hsmemApi.getAllItems(userId)` → 内部格式化为 `user_xxx` → `GET /api/v1/memory/items?user_id=user_xxx` |
| **Base URL** | `VITE_HSMEM_BASE_URL`（默认 `http://localhost:8000`） |
| **说明** | 管理端「用户记忆管理」已不再从 MySQL `user_memories` 读取，全部通过 HSMem 获取。MySQL 长期记忆表仍由 Main 后端写入，供其它功能或检索使用。

---

## 6. 这些数据是怎么生成的？

管理端**只读** `user_memories` 表，**不写入**。  
写入 `user_memories` 的只有 **Main 后端**（当 Admin 与 Main 连的是**同一库** `heartsphere` 时，管理端看到的正是 Main 写入的这张表）。

### 6.1 谁在写？

- **Main 后端**：`MemoryController.saveMemory`、`saveMemories`，以及 `extractMemoriesFromSession` 里对提取结果的 `saveMemories`。
- **写入位置**：Main 后端配置的 MySQL（`spring.datasource.url`，默认库名也是 **`heartsphere`**），表 **`user_memories`**（`main` 项目里的 `UserMemoryRepository` / `UserMemoryEntity`）。

若 Admin 的 `spring.datasource.admin.url` 和 Main 的 `spring.datasource.url` 指向**同一库**（例如都是 `heartsphere`），则 Admin「用户记忆管理」里看到的数据，就是 Main 写入的那批。

### 6.2 写入是怎么触发的？

| 触发场景 | 链路 | 说明 |
|----------|------|------|
| **用户创建/更新日记** | 前端 `useJournalHandlers`（创建/更新日记成功）→ `JournalMemoryIntegration.extractMemoriesFromJournal(entry)` → `memorySystem.extractAndSave(...)` → 每条记忆 `RemoteMemoryStorage.save` → `memoryApi.saveMemory` → Main 后端 `POST /memory/v1/users/{userId}/memories` → `mySQLLongMemoryService.saveMemory` | 从日记标题、内容、洞察、标签中提取记忆并保存到 MySQL |
| **用户与角色对话后** | 前端 `generateAIResponse` 或 `useSystemIntegration` 中调用 `memorySystem.extractAndSave(...)` → 同上 `RemoteMemoryStorage.save` → Main `saveMemory` | 从对话内容中提取记忆并保存到 MySQL |
| **会话提取接口** | 调用方请求 Main 后端 `POST /memory/v1/users/{userId}/sessions/{sessionId}/extract` → Main 从短期记忆拉取会话消息 → `memoryExtractor.extractMemories` → `mySQLLongMemoryService.saveMemories` | 后端从会话消息中提取记忆并批量写入 MySQL |

### 6.3 简要流程

1. **日记**：用户保存/更新日记 → 前端提取记忆 → 调用 Main 的 `saveMemory`（单条）或通过 `addMemory` 再经 storage 保存。
2. **对话**：用户发消息、AI 回复后 → 前端从对话文本提取记忆 → 同上调用 Main `saveMemory`。
3. **会话提取**：直接调 Main 的「从会话提取」接口 → Main 内完成提取并 `saveMemories`。

以上所有写入都进入 **Main 连接的 MySQL** 的 **`user_memories`** 表；若该库即 Admin 使用的 `heartsphere`，则管理端「用户记忆管理」里看到的就是这些数据。

---

## 7. HSMem 记忆是怎么使用的？

HSMem 是独立于 MySQL 长期记忆的另一套记忆服务：**写入**（对话/日记记忆化）和**读取**（检索、列表展示）都走 Main 后端的 HSMem 代理接口（`/memory/v1/hsmem/*`），由 Main 后端再请求 HSMem 服务。

### 7.1 HSMem 的写入（数据从哪来）

| 场景 | 接口 | 链路 |
|------|------|------|
| **对话完成后** | `POST /memory/v1/hsmem/memorize/conversation` | 前端 `generateAIResponse` 在 AI 回复完成后 → `memoryApi.memorizeConversation({ messages: [用户消息, AI回复], ... }, token)` → Main 后端转发到 HSMem，把本轮对话记入 HSMem |
| **日记保存后** | `POST /memory/v1/hsmem/memorize/document` | 前端 `JournalMemoryIntegration.extractMemoriesFromJournal` 在日记保存成功后 → `memoryApi.memorizeDocument({ title, content, ... }, token)` → Main 后端转发到 HSMem，把日记内容记入 HSMem |

即：HSMem 里的记忆来自**用户与角色的对话**和**用户写的日记**，由前端在对应时机调用上述接口写入。

### 7.2 HSMem 的读取与使用（数据用在哪）

| 用途 | 接口 | 链路 | 说明 |
|------|------|------|------|
| **对话时给 AI 当上下文** | `POST /memory/v1/hsmem/retrieve` | 用户发消息时，`ChatWindow` 调用 `systemIntegration.getRelevantMemories(userText, 5, characterId)` → 内部 `memoryApi.retrieve({ queries: [{ role: 'user', content: { text: userText } }], limit }, token)` → Main 后端转发到 HSMem 做语义检索 → 返回的 items 与角色资产合并为 `relevantMemories` → 传入 `generateAIResponse` → 在 `generateAIResponse` 里被格式化成「用户长期记忆」段落拼进**系统指令**（`systemInstruction`）→ AI 生成回复时会参考这些记忆 | 用 HSMem 的**检索**结果增强对话个性化和连贯性 |
| **现实世界「我的记忆」列表** | `GET /memory/v1/hsmem/items?user_id=...` | 用户点击「我的记忆」→ `JournalMemoryModal` 打开 → `memoryApi.getItems(userId, token)` → Main 后端转发到 HSMem → 返回该用户的 items 列表 → 前端用 `hsmemItemToUserMemory` 转成展示结构并渲染 | 用 HSMem 的**列表**给用户查看自己的记忆 |

### 7.3 简要流程小结

- **写入**：对话结束 → `memorizeConversation`；日记保存 → `memorizeDocument`。数据只进 HSMem，不进 MySQL `user_memories`。
- **使用**：  
  1. **对话**：发消息前 `retrieve` 按当前输入检索相关记忆 → 结果注入系统指令 → AI 参考这些记忆生成回复。  
  2. **展示**：「我的记忆」弹窗用 `getItems` 拉该用户全部 items 展示。

因此：**HSMem 的记忆 = 写入（memorize） + 使用（retrieve 给 AI 用、getItems 给人看）**；和 MySQL `user_memories` 是两套存储。**管理端「用户记忆管理」与 Main「我的记忆」均从 HSMem 获取**（见上文 §1、§5）。

---

## 8. Main 端 HSMem：remote 与 local 模式

Main 后端对外暴露的 HSMem 兼容 API（`/memory/v1/hsmem/*`）不变；**数据源**可由配置切换：

| 模式 | 配置 | 数据源 | 说明 |
|------|------|--------|------|
| **local**（默认） | 不配置或 `HSMEM_MODE=local` | Main 内置等价实现，本地文件存储 | 不依赖外部 HSMem 进程；存储根目录 `heartsphere.memory.hsmem.local.base-path`（默认 `./memory_data`），目录与 JSON 格式与 HSMem 一致 |
| **remote** | `HSMEM_MODE=remote` 或 `heartsphere.memory.hsmem.mode=remote` | 外部 HSMem 服务（`heartsphere.memory.hsmem.base-url`，默认 `http://localhost:8000`） | Main 通过 HTTP 调用独立 HSMem 服务，与 Admin 直连的 HSMem 为同一服务时，两端看到同一套数据 |

- **切换方式**：默认 **local**，无需配置。使用外部 HSMem 时设置环境变量 `HSMEM_MODE=remote` 启动 Main，或在配置中设置 `heartsphere.memory.hsmem.mode=remote`。
- **运维确认**：Main 启动完成后日志会打印 `[HSMem] mode=local|remote`，便于确认当前使用的数据源。
- **API 契约**：两种模式路径、请求/响应一致；仅后端数据源不同。自动化测试见 `main/backend/api-tests/memory-hsmem/`。
