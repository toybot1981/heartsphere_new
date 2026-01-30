# Change: 分析 HSMem 记忆类型并优化 ChatWindow 记忆集成

## Why

当前系统中存在多个记忆系统（hsmem、backend MemoryType、frontend MemorySystem），记忆类型定义不统一，ChatWindow 中的记忆使用方式需要优化。需要：

1. **统一记忆类型体系**：明确 hsmem 中的记忆类型分类，与 backend MemoryType 建立映射关系
2. **明确长短期记忆边界**：区分短期记忆（会话上下文）和长期记忆（持久化用户信息）的使用场景
3. **优化 ChatWindow 记忆使用**：改进记忆检索、记忆注入、记忆提取的流程，提升对话质量

## What Changes

### 1. 记忆类型分析
- **hsmem 记忆类型**：preference, habit, personal_info, text_memory, document, general
- **Backend MemoryType**：PERSONAL_INFO, PREFERENCE, HABIT, IMPORTANT_MOMENT, EMOTIONAL_EXPERIENCE, CONVERSATION_TOPIC 等
- **建立映射关系**：hsmem memory_type ↔ Backend MemoryType

### 2. 长短期记忆区分
- **短期记忆（Short Memory）**：
  - 存储：Redis（内存）
  - 用途：当前会话上下文、工作记忆
  - 生命周期：7天 TTL，会话结束后清理
  - 使用场景：对话上下文、临时状态

- **长期记忆（Long Memory）**：
  - 存储：MySQL（user_memories 表）+ hsmem（文件系统）
  - 用途：用户事实、偏好、习惯、重要时刻
  - 生命周期：永久存储（除非手动删除）
  - 使用场景：跨会话记忆、个性化推荐、用户画像

- **hsmem 系统定位**：长期记忆系统，提供三层架构（Resource → Item → Category）

### 3. ChatWindow 记忆集成优化
- **记忆检索时机**：在生成 AI 响应前检索相关长期记忆
- **记忆注入方式**：将检索到的记忆作为系统提示词的一部分
- **记忆提取时机**：在对话完成后提取并保存到 hsmem
- **记忆类型识别**：根据对话内容自动识别记忆类型（Event, Habit, Asset, Work 等）

## Impact

- **Affected specs**: 
  - 新增 `chat-memory-integration` capability
  - 可能需要修改现有的记忆系统相关规范

- **Affected code**:
  - `main/frontend/components/chat/ChatWindow.tsx`
  - `main/frontend/components/chat/utils/generateAIResponse.ts`
  - `main/frontend/components/chat/hooks/useSystemIntegration.ts`
  - `main/frontend/services/api/memory/memory.ts`
  - `main/backend/src/main/java/com/heartsphere/memory/controller/MemoryController.java`
  - `hsmem/hscore/memory/memory_extractor.py`

- **Breaking changes**: 无
