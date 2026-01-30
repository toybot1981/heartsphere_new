# 提示词模板收集和分类 - 实施进度报告

**创建日期**: 2025-01-13  
**最后更新**: 2025-01-13

---

## 实施进度总览

### ✅ 阶段1: 收集和分类（100%）

已完成所有任务：
- ✅ 创建提示词扫描脚本（`scan-prompts.py`）
- ✅ 扫描代码库（找到4个静态提示词）
- ✅ 手动补充StringBuilder模式提示词（2个）
- ✅ 分析和分类（共6个提示词）
- ✅ 建立分类体系（SQL脚本）

### ✅ 阶段2: 数据导入（80%）

已完成：
- ✅ 准备导入数据（转换为PromptTemplate格式）
- ✅ 生成SQL导入脚本（`import-prompts.sql`，366行）
- ✅ 创建分类创建脚本（`create-categories.sql`）

待完成：
- ⏳ 执行SQL脚本导入数据到数据库
- ⏳ 在管理界面验证数据

### ✅ 阶段3: 代码重构（90%）

已完成的服务类：
- ✅ **LLMIntentRecognizer** - 使用 `mentis-intent-recognition`
- ✅ **LLMTaskDecomposer** - 使用 `mentis-task-decomposition`
- ✅ **LLMResponseGenerator** - 使用 `mentis-response-generation`
- ✅ **AgentScopeTaskDecomposer** - 使用 `mentis-task-decomposition`
- ✅ **EmotionService** - 使用 `main-emotion-analysis`
- ✅ **ESoulLetterGenerator** - 使用 `main-letter-generation`

待处理：
- ⏳ **LLMBasedSkillExecutor** - 提示词是动态构建的，需要进一步分析

---

## 已收集的提示词（6个）

### Mentis项目（4个）

1. **mentis-intent-recognition-basic**
   - 分类: `mentis-intent-recognition`
   - 用途: 意图识别
   - 变量: `userMessage`

2. **mentis-task-decomposition-single**
   - 分类: `mentis-task-decomposition`
   - 用途: 单任务分解
   - 变量: `userRequest`

3. **mentis-task-decomposition-multi-agent**
   - 分类: `mentis-task-decomposition`
   - 用途: 多智能体任务分解
   - 变量: `userRequest`

4. **mentis-response-generation-friendly**
   - 分类: `mentis-response-generation`
   - 用途: 响应生成
   - 变量: `executionResult`

### Main项目（2个）

5. **main-emotion-analysis-default**
   - 分类: `main-emotion-analysis`
   - 用途: 情感分析
   - 变量: `text`, `context`

6. **main-letter-generation-character**
   - 分类: `main-letter-generation`
   - 用途: 信件生成
   - 变量: `characterName`, `characterRole`, `characterBio`, `speechStyle`, `letterType`, `emotionInfo`, `journalInfo`

---

## 分类体系

### 一级分类（项目模块）
- `main` - 主项目
- `mentis` - Mentis项目
- `admin` - 管理后台
- `shared` - 共享

### 二级分类（功能模块）

#### Main项目
- `main-emotion-analysis` - 情感分析
- `main-letter-generation` - 信件生成
- `main-ai-service` - AI服务
- `main-skill-execution` - 技能执行

#### Mentis项目
- `mentis-intent-recognition` - 意图识别
- `mentis-task-decomposition` - 任务分解
- `mentis-response-generation` - 响应生成
- `mentis-multi-agent` - 多智能体

---

## 代码修改详情

### 1. LLMIntentRecognizer

**文件**: `mentis/backend/src/main/java/com/heartsphere/mentis/agent/impl/LLMIntentRecognizer.java`

**修改**:
- 使用 `templateService.getPrompts("mentis-intent-recognition", ...)`
- 保留硬编码 `INTENT_RECOGNITION_PROMPT` 作为fallback

### 2. LLMTaskDecomposer

**文件**: `mentis/backend/src/main/java/com/heartsphere/mentis/executor/impl/LLMTaskDecomposer.java`

**修改**:
- 添加 `PromptTemplateIntegrationService` 依赖
- 使用 `templateService.getPrompts("mentis-task-decomposition", ...)`
- 保留硬编码 `DECOMPOSE_PROMPT_TEMPLATE` 作为fallback

### 3. LLMResponseGenerator

**文件**: `mentis/backend/src/main/java/com/heartsphere/mentis/agent/impl/LLMResponseGenerator.java`

**修改**:
- 使用 `templateService.getPrompts("mentis-response-generation", ...)`
- 保留硬编码 `RESPONSE_GENERATION_PROMPT` 作为fallback

### 4. AgentScopeTaskDecomposer

**文件**: `mentis/backend/src/main/java/com/heartsphere/mentis/executor/impl/AgentScopeTaskDecomposer.java`

**修改**:
- 添加 `PromptTemplateIntegrationService` 依赖
- 使用 `templateService.getPrompts("mentis-task-decomposition", ...)`
- 保留硬编码 `MULTI_AGENT_DECOMPOSE_PROMPT_TEMPLATE` 作为fallback

### 5. EmotionService

**文件**: `main/backend/src/main/java/com/heartsphere/emotion/service/EmotionService.java`

**修改**:
- 将分类代码从 `"emotion"` 改为 `"main-emotion-analysis"`
- 保留硬编码 `buildEmotionAnalysisPrompt()` 作为fallback

### 6. ESoulLetterGenerator

**文件**: `main/backend/src/main/java/com/heartsphere/mailbox/service/ESoulLetterGenerator.java`

**修改**:
- 添加 `PromptTemplateIntegrationService` 依赖
- 使用 `templateService.getPrompts("main-letter-generation", ...)`
- 保留硬编码 `buildLetterPrompt()` 作为fallback

---

## 生成的文件

### 脚本文件
- `scripts/prompt-collection/scan-prompts.py` - 扫描脚本
- `scripts/prompt-collection/analyze-and-categorize.py` - 分析脚本
- `scripts/prompt-collection/import-prompts.py` - 导入脚本生成器

### 数据文件
- `scripts/prompt-collection/scan-results.json` - 扫描结果
- `scripts/prompt-collection/categorized-prompts.json` - 分类结果
- `scripts/prompt-collection/manual-prompts.json` - 手动补充的提示词

### SQL脚本
- `scripts/prompt-collection/import-prompts.sql` - 完整的导入脚本（366行）
- `scripts/prompt-collection/create-categories.sql` - 分类创建脚本

### 文档
- `scripts/prompt-collection/README.md` - 使用说明
- `scripts/prompt-collection/import-instructions.md` - 导入说明

---

## 下一步工作

### 立即执行
1. **执行SQL脚本导入数据**
   ```bash
   mysql -u <username> -p <database> < scripts/prompt-collection/import-prompts.sql
   ```

2. **在管理界面验证数据**
   - 检查分类是否正确显示
   - 检查提示词模板是否正确导入
   - 测试预览功能

### 后续工作
3. **继续收集遗漏的提示词**
   - LLMMemoryExtractor中的多个提示词
   - LLMBasedSkillExecutor中的动态提示词
   - 其他可能遗漏的提示词

4. **功能测试**
   - 测试所有修改的功能
   - 验证AI响应质量
   - 验证fallback机制工作正常
   - 性能测试（提示词读取性能）

5. **完全迁移（阶段4）**
   - 确认所有提示词都已迁移
   - 移除硬编码
   - 完全依赖管理系统

---

## 注意事项

1. **Fallback机制**: 所有修改都保留了硬编码作为fallback，确保向后兼容
2. **分类代码**: 使用新的分类代码（如 `mentis-intent-recognition` 而不是 `intent`）
3. **变量传递**: 使用Map传递变量，支持模板变量替换
4. **错误处理**: 如果模板不存在或读取失败，自动使用硬编码fallback

---

## 验证清单

- [ ] SQL脚本执行成功
- [ ] 分类在管理界面正确显示
- [ ] 提示词模板在管理界面正确显示
- [ ] 意图识别功能正常
- [ ] 任务分解功能正常
- [ ] 响应生成功能正常
- [ ] 情感分析功能正常
- [ ] 信件生成功能正常
- [ ] Fallback机制工作正常
- [ ] 性能可接受
