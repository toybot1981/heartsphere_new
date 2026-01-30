# 提示词模板收集和管理规范

**变更ID**: `collect-and-categorize-prompt-templates`  
**能力**: `prompt-template-collection`  
**创建日期**: 2025-01-13

---

## ADDED Requirements

### Requirement: 提示词模板收集能力

系统 **MUST** 能够自动扫描代码库，识别和收集所有硬编码的提示词模板。

#### Scenario: 自动扫描代码库中的提示词模板
- **Given** 代码库中存在硬编码的提示词模板
- **When** 运行提示词扫描脚本
- **Then** 脚本能够识别所有提示词模板
- **And** 生成包含提示词内容、位置、上下文的扫描报告

**实现要求**:
- 支持多种提示词定义模式（`private static final String`, `StringBuilder`, 多行字符串等）
- 能够识别提示词中的变量占位符（如 `{variableName}`）
- 能够提取提示词的使用上下文（所属类、方法等）

---

### Requirement: 提示词分类体系

系统 **MUST** 建立三级分类体系，用于组织和管理提示词模板。

#### Scenario: 创建三级分类体系
- **Given** 收集到多个提示词模板
- **When** 按照分类体系进行分类
- **Then** 每个提示词都被分配到合适的分类
- **And** 分类体系支持按项目模块、功能模块、具体用途三级分类

**分类结构**:
- **一级分类**（项目模块）: `main`, `mentis`, `admin`, `shared`
- **二级分类**（功能模块）: `ai-service`, `task-decomposition`, `intent-recognition`, `response-generation`, `skill-execution`, `letter-generation`, `emotion-analysis`, `multi-agent`
- **三级分类**（具体用途）: 具体的提示词模板名称

**实现要求**:
- 分类代码使用kebab-case命名（如：`mentis-intent-recognition`）
- 支持分类的层级关系（parent_id）
- 支持分类的排序（sort_order）

---

### Requirement: 提示词模板数据模型

系统 **MUST** 定义标准的数据模型，用于存储和管理提示词模板。

#### Scenario: 将硬编码提示词转换为数据库记录
- **Given** 收集到硬编码的提示词模板
- **When** 转换为PromptTemplate格式
- **Then** 包含以下字段：
  - `name`: 模板名称（语义化命名）
  - `categoryCode`: 所属分类代码
  - `description`: 模板描述
  - `systemPrompt`: 系统提示词（可选）
  - `userPrompt`: 用户提示词
  - `variables`: 变量定义（JSON格式）
  - `exampleData`: 示例数据（JSON格式）

**命名规范**:
- 格式: `{category}-{function}-{variant}`
- 示例: `mentis-intent-recognition-basic`, `main-emotion-analysis-default`

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

---

### Requirement: 提示词数据导入能力

系统 **MUST** 支持批量导入提示词模板到管理系统。

#### Scenario: 批量导入提示词模板到管理系统
- **Given** 收集并分类好的提示词模板数据
- **When** 执行数据导入
- **Then** 所有提示词模板都被导入到数据库
- **And** 在管理界面可以查看和管理这些模板

**导入方式**:
- 通过管理界面批量导入（如果支持）
- 通过SQL脚本导入
- 通过API导入（调用AdminPromptController）

**验证要求**:
- 导入后验证数据完整性
- 验证分类正确性
- 验证变量定义正确性

---

### Requirement: 代码重构支持fallback机制

系统 **MUST** 支持从管理系统读取提示词，同时保留硬编码作为fallback机制，确保向后兼容。

#### Scenario: 从管理系统读取提示词，支持fallback
- **Given** 提示词已导入管理系统
- **When** 代码需要获取提示词
- **Then** 优先从管理系统读取
- **And** 如果管理系统没有找到，使用硬编码作为fallback
- **And** 确保功能正常工作

**实现要求**:
- `PromptTemplateIntegrationService.getPrompts()` 方法支持fallback
- 如果数据库中没有找到，使用传入的默认值（硬编码）
- 添加日志记录（可选，用于调试）

---

## MODIFIED Requirements

### Requirement: 提示词管理功能数据初始化

提示词管理功能 **MUST** 能够显示和管理收集到的提示词模板数据。

#### Scenario: 提示词管理界面显示收集到的模板
- **Given** 提示词管理功能已实现但无数据
- **When** 完成提示词收集和导入
- **Then** 管理界面能够显示所有导入的提示词模板
- **And** 支持按分类筛选和搜索
- **And** 支持查看、编辑、删除模板

**修改点**:
- 补充提示词管理功能的数据
- 确保管理界面能够正常展示和管理数据

---

## 相关能力

- `prompt-template-management` - 提示词模板管理能力（已存在）
- `prompt-template-integration` - 提示词模板集成能力（已存在）

---

## 验收标准

1. **收集完整性**: 所有硬编码的提示词模板都被收集
2. **分类准确性**: 所有提示词都被正确分类
3. **数据完整性**: 所有提示词都已导入数据库
4. **功能正确性**: 代码能够正确从管理系统读取提示词，功能正常工作
5. **向后兼容**: 支持fallback机制，确保兼容性
