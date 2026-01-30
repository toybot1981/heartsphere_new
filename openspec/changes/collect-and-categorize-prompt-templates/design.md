# 收集并分类管理系统中的提示词模板 - 设计文档

**变更ID**: `collect-and-categorize-prompt-templates`  
**创建日期**: 2025-01-13

---

## 设计决策

### 决策1: 提示词分类体系

**问题**: 如何对收集到的提示词进行分类？

**方案**: 建立三级分类体系

1. **一级分类**：按项目模块分类
   - `main` - 主项目相关提示词
   - `mentis` - Mentis项目相关提示词
   - `admin` - 管理后台相关提示词
   - `shared` - 共享提示词

2. **二级分类**：按功能模块分类
   - `ai-service` - AI服务相关（文本生成、情感分析等）
   - `task-decomposition` - 任务分解相关
   - `intent-recognition` - 意图识别相关
   - `response-generation` - 响应生成相关
   - `skill-execution` - 技能执行相关
   - `letter-generation` - 信件生成相关
   - `emotion-analysis` - 情感分析相关
   - `multi-agent` - 多智能体协作相关

3. **三级分类**：按具体用途分类
   - 具体的提示词模板名称（如：`intent-recognition-basic`, `task-decomposition-single`, `response-generation-friendly`）

**理由**:
- 三级分类体系便于查找和管理
- 按项目模块分类便于区分不同项目的提示词
- 按功能模块分类便于理解提示词的用途
- 支持未来扩展

---

### 决策2: 提示词收集策略

**问题**: 如何识别和收集代码中的提示词模板？

**方案**: 分阶段收集策略

1. **自动扫描阶段**
   - 使用正则表达式扫描代码，识别常见的提示词模式：
     - `private static final String.*PROMPT.*=`
     - `String.*prompt.*=.*"""`
     - `StringBuilder.*prompt.*=`
     - 包含 `systemPrompt`, `userPrompt`, `prompt` 等关键词的字符串常量

2. **手动审查阶段**
   - 对自动扫描结果进行人工审查
   - 识别真正的提示词模板（排除误报）
   - 补充自动扫描遗漏的提示词

3. **代码分析阶段**
   - 分析提示词的使用上下文
   - 识别提示词的变量和参数
   - 理解提示词的功能和用途

**理由**:
- 自动扫描提高效率
- 手动审查确保准确性
- 代码分析确保完整性

---

### 决策3: 数据迁移方案

**问题**: 如何将硬编码的提示词迁移到管理系统？

**方案**: 渐进式迁移策略

1. **第一阶段：收集和导入**
   - 收集所有提示词模板
   - 创建分类体系
   - 导入到数据库（通过管理界面或SQL脚本）

2. **第二阶段：代码重构（可选fallback）**
   - 修改代码，优先从管理系统读取提示词
   - 如果管理系统没有找到，使用硬编码作为fallback
   - 确保向后兼容

3. **第三阶段：完全迁移**
   - 确认所有提示词都已迁移
   - 移除硬编码的提示词
   - 完全依赖管理系统

**理由**:
- 渐进式迁移降低风险
- Fallback机制确保兼容性
- 分阶段实施便于测试和验证

---

### 决策4: 提示词命名规范

**问题**: 如何命名提示词模板？

**方案**: 使用语义化命名规范

**命名格式**: `{category}-{function}-{variant}`

示例:
- `mentis-intent-recognition-basic` - Mentis项目的基础意图识别
- `mentis-task-decomposition-single` - Mentis项目的单任务分解
- `mentis-response-generation-friendly` - Mentis项目的友好响应生成
- `main-emotion-analysis-default` - 主项目的默认情感分析
- `main-letter-generation-character` - 主项目的角色信件生成

**理由**:
- 语义化命名便于理解
- 统一的命名规范便于管理
- 支持变体（variant）便于扩展

---

### 决策5: 变量定义规范

**问题**: 如何定义提示词中的变量？

**方案**: 使用JSON格式定义变量

**变量定义格式**:
```json
{
  "variableName": {
    "type": "string|number|boolean|object|array",
    "description": "变量描述",
    "required": true|false,
    "default": "默认值（可选）",
    "example": "示例值"
  }
}
```

**理由**:
- JSON格式便于解析和验证
- 支持类型定义和验证
- 支持默认值和示例

---

## 架构设计

### 数据模型

```
PromptCategory (分类)
├── code: 分类代码（如：mentis-intent-recognition）
├── name: 分类名称
└── description: 分类描述

PromptTemplate (模板)
├── name: 模板名称（如：mentis-intent-recognition-basic）
├── categoryCode: 所属分类
├── systemPrompt: 系统提示词
├── userPrompt: 用户提示词
├── variables: 变量定义（JSON格式）
└── exampleData: 示例数据（JSON格式）
```

### 代码集成点

1. **PromptTemplateIntegrationService** (已存在)
   - 提供 `getPrompts(categoryCode, variables, defaultSystemPrompt, defaultUserPrompt)` 方法
   - 优先从数据库读取，如果不存在则使用默认值

2. **各服务类修改点**
   - `LLMIntentRecognizer` - 意图识别
   - `LLMTaskDecomposer` - 任务分解
   - `LLMResponseGenerator` - 响应生成
   - `AgentScopeTaskDecomposer` - 多智能体任务分解
   - `EmotionService` - 情感分析
   - `ESoulLetterGenerator` - 信件生成
   - `LLMBasedSkillExecutor` - 技能执行

---

## 实施步骤

1. **阶段1：收集和分类**（不修改代码）
   - 扫描代码库，收集所有提示词
   - 建立分类体系
   - 创建分类数据

2. **阶段2：数据导入**（不修改代码）
   - 将收集到的提示词导入数据库
   - 验证数据完整性

3. **阶段3：代码重构**（可选fallback）
   - 修改代码，从管理系统读取提示词
   - 保留硬编码作为fallback
   - 测试功能正常

4. **阶段4：完全迁移**（移除硬编码）
   - 确认所有提示词都已迁移
   - 移除硬编码
   - 完全依赖管理系统

---

## 技术细节

### 提示词扫描脚本

需要创建一个脚本，扫描代码库中的提示词：

```bash
# 扫描Java文件中的提示词
grep -r "private static final String.*PROMPT" --include="*.java"
grep -r "String.*prompt.*=.*\"\"\"" --include="*.java"
```

### 数据导入方式

1. **通过管理界面导入**（推荐）
   - 使用现有的提示词管理界面
   - 批量导入功能

2. **通过SQL脚本导入**
   - 生成SQL INSERT语句
   - 直接执行SQL脚本

3. **通过API导入**
   - 使用AdminPromptController的API
   - 编写导入脚本

---

## 验证标准

1. **数据完整性**
   - 所有硬编码的提示词都已收集
   - 所有提示词都已正确分类
   - 所有提示词都已导入数据库

2. **功能正确性**
   - 代码能够正确从管理系统读取提示词
   - AI功能正常工作
   - 响应质量不受影响

3. **性能影响**
   - 提示词读取性能可接受（可通过缓存优化）
   - 不影响现有功能性能
