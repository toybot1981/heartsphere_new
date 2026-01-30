# 短期记忆、长期记忆与 HSMem 关系分析

本文分析 Main 后端 memory 模块中**短期记忆**、**长期记忆（MySQL）**与 **HSMem（含 local）** 的职责、数据流与合并可行性。

---

## 1. 三者概览

| 维度 | 短期记忆 | 长期记忆（MySQL） | HSMem（含 local） |
|------|----------|-------------------|-------------------|
| **存储** | MySQL：`chat_messages`、`sessions`、`working_memories` | MySQL：`user_memories` | 文件：`resources/`、`items/`、`categories/`（local 时） |
| **组织** | 按 session，按会话消息 + 工作记忆 key-value | 按 user，结构化记忆条 | 按 user + resource，items 为提取结果 |
| **TTL/容量** | 消息 TTL 7 天、每会话最多 100 条；工作记忆 24h | 无 TTL | 无 TTL |
| **主要用途** | 对话上下文、从会话提取记忆的输入 | 检索「用户相关记忆」、部分前端写/读 | 对话/日记记忆化、检索给 AI、「我的记忆」列表 |

---

## 2. 短期记忆（Short-term）

### 2.1 是什么

- **接口**：`ShortMemoryService`（实现类 `MySQLShortMemoryService`）
- **存什么**：
  - **对话消息**：单会话内用户与 AI 的逐条消息（`ChatMessage`），存于 `chat_messages` 表，带 session
  - **工作记忆**：会话级 key-value（如临时状态），存于 `working_memories` 表，24 小时过期
- **配置**：`heartsphere.memory.shortMemory`（messageTtl、maxMessagesPerSession、workingMemoryTtl）

### 2.2 谁在用

- **写入**：对话进行时，消息写入短期记忆（Controller 侧调用 `shortMemoryService.saveMessage` 等）
- **读取**：
  - **从会话提取记忆**：`POST /users/{userId}/sessions/{sessionId}/extract` → `shortMemoryService.getMessages(sessionId, 100)` → `memoryExtractor.extractMemories` → **写入 MySQL 长期记忆**（`saveMemories`）

### 2.3 结论

短期记忆 = **会话内近期对话 + 临时工作状态**，为「提取长期记忆」提供输入，**与 HSMem 无直接存储重叠**。

---

## 3. 长期记忆（MySQL）

### 3.1 是什么

- **接口**：`LongMemoryService`（实现类 `MySQLLongMemoryService`）
- **存什么**：`user_memories` 表中的 `UserMemoryEntity`（userId、type、importance、content、source、sourceId、tags 等）
- **写入**：
  - `POST /users/{userId}/memories`、`POST /users/{userId}/memories/batch`（前端或后端直接保存）
  - `POST /users/{userId}/sessions/{sessionId}/extract`（从**短期记忆**的会话消息中提取后 `saveMemories`）
  - 其他场景（如日记相关逻辑）也可能写入
- **读取**：`GET /users/{userId}/memories/search?query=...&limit=...` → `longMemoryService.retrieveRelevantMemories`（关键词/空 query 列表）

### 3.2 与 HSMem 的关系

- 都是「**按用户的、持久化的、可检索的记忆**」。
- 区别：MySQL 长期记忆是「通用用户记忆」模型（MemoryType、MemorySource 等）；HSMem 是「资源 + 提取项」模型（conversation/text/document → items），且「我的记忆」和对话检索**当前以 HSMem 为主**（见下文）。

---

## 4. HSMem（含 local）

### 4.1 是什么

- **资源层（resources）**：原始输入——如一轮对话（messages）、一篇文本、一篇文档（title+content）。以 JSON 文件存储，无 TTL。
- **记忆项层（items）**：从资源中**规则/LLM 提取**出的记忆条（preference、habit、personal_info 等），带 summary、content、memory_type、categories、user_id 等。
- **分类层（categories）**：分类索引，供检索与展示。

### 4.2 谁在写 / 谁在读

- **写**：
  - 前端在「对话结束后」调用 `memorizeConversation` → 存 resource + 提取 → 写 items
  - 前端在「日记保存后」调用 `memorizeDocument` → 同上
  - `memorizeText` 同理
- **读**：
  - **对话前检索**：`memoryApi.retrieve` → Main `POST /hsmem/retrieve` → 给 AI 做上下文（现实世界主流程）
  - **「我的记忆」列表**：`memoryApi.getItems` → Main `GET /hsmem/items` → 弹窗展示

### 4.3 HSMem 里有没有短期记忆？有没有长期记忆？

- **HSMem 不包含短期记忆**：
  - 不存「最近 N 条会话消息」列表，也不存带 TTL 的会话/工作记忆。
  - 只存「本轮/本段」对话的**快照**（作为 resource）和从中**提取出的记忆项**（items）。不提供按 session 的滚动上下文或 7 天/24h 过期语义。
- **HSMem 的 items 本质是长期记忆**：
  - 无 TTL、按用户、可检索、用于「我的记忆」和对话上下文，与 MySQL 的「用户长期记忆」在**职责上重叠**，只是存储与 API 不同（文件 vs MySQL，hsmem/* vs memories/*）。

---

## 5. 数据流简图

```
[ 用户发消息 / 写日记 ]
        |
        v
+-------+--------+
| 短期记忆        |  会话消息、工作记忆（MySQL，TTL）
| (ShortMemory)  |  -> 仅「从会话提取」时被读，写出到 MySQL 长期
+-------+--------+
        |
        v (提取)
+-------+--------+
| 长期记忆(MySQL)|  user_memories；/memories/search 等
| (LongMemory)   |  写入：saveMemory、extractMemoriesFromSession、日记等
+-------+--------+

[ 对话结束 / 日记保存 ]（前端）
        |
        v
+-------+--------+
| HSMem          |  resources（原始对话/文档）+ items（提取结果）
| (local/remote)  |  写入：memorizeConversation / memorizeDocument
|                 |  读取：retrieve（给 AI）、getItems（我的记忆）
+----------------+
```

- 短期记忆 **不** 写入 HSMem，只作为「从会话提取」的输入写入 **MySQL 长期**。
- HSMem 的写入来自前端的 memorize 系列，与「从会话提取 → MySQL」是**两条并行的长期记忆写入路径**。

---

## 6. 能否合并？

### 6.1 短期记忆 vs 长期 / HSMem

- **不建议合并**。
- 短期记忆负责「会话内近期上下文 + 临时状态」，带 TTL 和容量上限；长期/HSMem 负责「跨会话的、持久的用户记忆」。
- 职责不同：短期是**输入**（供提取与上下文），长期/HSMem 是**输出**（提取结果与检索结果）。合并会混淆生命周期和访问模式。

### 6.2 MySQL 长期记忆 vs HSMem（已合并）

- **已实施**：以 HSMem 为唯一长期记忆。
  - 所有「用户长期记忆」只写 HSMem（`memorizeItems`、`memorizeConversation`、`memorizeDocument` 等）。
  - 「从会话提取」改为写入 HSMem（`extractMemoriesFromSession` → `hsmemApi.memorizeItems`）。
  - `/memories/search`、`/memories`、`/memories/{id}` 的读写均走 HSMem（retrieve、getItem、memorizeItems、updateItem、deleteItem）。
  - MySQL 长期记忆相关代码已删除：`UserMemoryEntity`、`UserMemoryRepository`、`MySQLLongMemoryService` 中的记忆方法、`LongMemoryService` 中的记忆检索方法。`user_memories` 表不再被代码使用；若需物理删除表，可单独添加 Flyway 迁移。

### 6.3 HSMem 是否包含短期 / 长期记忆（小结）

| 问题 | 结论 |
|------|------|
| HSMem 中是否包含**短期记忆**？ | **不包含**。不提供会话消息列表、工作记忆或 TTL 语义。 |
| HSMem 中是否包含**长期记忆**？ | **包含**。HSMem 的 **items** 即「按用户、持久化、可检索」的长期记忆，与 MySQL `user_memories` 职责重叠。 |

---

## 7. 建议（简要）

1. **短期记忆**：保持独立，仅作为会话上下文与「从会话提取」的输入，不与 HSMem 合并。
2. **长期记忆与 HSMem**：  
   - 若希望架构简化、单一数据源：在「以 HSMem 为准」或「以 MySQL 为准」中选一，再收口写入与检索路径。  
   - 若暂时维持双轨：在文档与代码中明确「MySQL 长期」与「HSMem」的各自用途与调用方，避免重复写、双源不一致。
3. **HSMem**：在文档和注释中明确写清「HSMem 不提供短期记忆；HSMem items 即长期记忆的一种实现」，便于后续维护与合并决策。

---

*文档基于当前 Main 后端 memory 模块与前端调用关系整理，若写入/读取路径有变更需同步更新本文。*
