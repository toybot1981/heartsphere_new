# 将常用工具在管理端进行管理，支持提示词和指令管理 - 设计文档

**变更ID**: `manage-tools-in-admin`

## Context

当前系统中，工具（Tool）的定义和执行逻辑都是硬编码在代码中的：

1. **工具定义**：每个工具实现 `Tool` 接口，硬编码工具名称、描述、参数模式
2. **工具执行**：工具的执行逻辑硬编码在 `execute()` 方法中
3. **工具提示词**：工具选择和参数生成时使用的提示词硬编码在代码中（如果有）
4. **工具指令**：工具执行时生成的指令硬编码在代码中（如 Python 脚本模板）

参照 Manus 的设计理念和现有管理界面的设计（`McpConfigManagement`、`PromptManagement`），需要将工具管理功能添加到管理端。

## Goals / Non-Goals

### Goals
- 在管理端提供工具管理界面，参照现有管理界面的设计风格
- 支持查看和编辑工具的配置信息（描述、参数说明、提示词、指令）
- 支持在管理界面中测试工具的执行
- 支持工具配置的版本管理（如果需要）
- 保持向后兼容性，保留硬编码作为 fallback 机制

### Non-Goals
- 不改变工具的核心执行逻辑
- 不实现复杂的工具编排功能（后续可扩展）
- 不实现工具的 A/B 测试功能（后续可扩展）
- 不实现工具的权限控制（使用现有的管理员权限）

## Decisions

### 决策1: 工具配置数据模型

**问题**: 如何存储工具配置信息？

**选项**:
1. 创建独立的 `ToolConfig` 实体
2. 复用 `PromptTemplate` 实体（用于工具提示词）
3. 扩展现有实体，添加工具配置字段

**决策**: 
- 创建独立的 `ToolConfig` 实体，存储工具的基本配置信息
- 工具提示词可以复用 `PromptTemplate` 实体（使用不同的 `categoryCode` 区分）
- 工具指令存储在 `ToolConfig` 实体的 `instructionTemplate` 字段中（JSON 格式）

**理由**:
- 工具配置是结构化数据，需要独立的实体和验证逻辑
- 工具提示词本质上是提示词模板，可以复用现有模型
- 分离关注点，便于维护和扩展

**数据模型设计**:
```java
@Entity
@Table(name = "tool_configs")
public class ToolConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String toolName;  // 工具名称，与 Tool.getName() 对应
    
    @Column(length = 500)
    private String description;  // 工具描述（可编辑）
    
    @Column(length = 50)
    private String category;  // 工具分类（browser、terminal、filesystem、code、system）
    
    @Column(name = "prompt_template_category", length = 100)
    private String promptTemplateCategory;  // 提示词模板的分类代码（关联 PromptTemplate）
    
    @Column(name = "instruction_template", columnDefinition = "TEXT")
    private String instructionTemplate;  // 指令模板（JSON 格式）
    
    @Column(name = "script_template", columnDefinition = "TEXT")
    private String scriptTemplate;  // 脚本模板（对于需要脚本的工具，如 Python）
    
    @Column(name = "parameters_schema", columnDefinition = "JSON")
    private String parametersSchema;  // 参数模式（JSON Schema 格式，可编辑）
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

### 决策2: 工具配置与工具实现的关联

**问题**: 如何将工具配置与工具实现类关联？

**选项**:
1. 通过工具名称关联（`toolName` 对应 `Tool.getName()`）
2. 通过工具类名关联
3. 通过工具 ID 关联

**决策**: 通过工具名称关联

**理由**:
- 工具名称是唯一标识，在 `ToolRegistry` 中已经使用
- 简单直接，易于实现和维护
- 工具名称在工具实现类中是固定的，不会改变

### 决策3: 工具提示词管理方式

**问题**: 工具提示词如何管理？

**选项**:
1. 存储在 `ToolConfig` 实体中
2. 复用 `PromptTemplate` 实体，使用不同的 `categoryCode`
3. 独立存储，通过关联关系引用

**决策**: 复用 `PromptTemplate` 实体，使用 `categoryCode` 区分

**理由**:
- 工具提示词本质上是提示词模板，可以复用现有模型
- 统一管理，便于维护和扩展
- 可以使用现有的提示词管理界面和功能

**分类代码规则**:
- 工具提示词使用分类代码：`mentis.tool.{toolName}.prompt`
- 例如：`mentis.tool.browser_goto.prompt`

### 决策4: 工具指令管理方式

**问题**: 工具指令如何管理？

**选项**:
1. 存储在 `ToolConfig` 实体的 `instructionTemplate` 字段中（JSON 格式）
2. 独立存储为指令模板实体
3. 复用 `PromptTemplate` 实体

**决策**: 存储在 `ToolConfig` 实体的 `instructionTemplate` 字段中（JSON 格式）

**理由**:
- 工具指令是工具特有的，不需要跨工具复用
- JSON 格式灵活，可以存储不同类型的指令（命令、脚本等）
- 减少数据库表结构复杂度

**指令模板格式示例**:
```json
{
  "type": "python_script",
  "template": "from playwright.sync_api import sync_playwright\n...",
  "variables": ["url", "waitSelector"],
  "defaultValues": {
    "timeout": 60000
  }
}
```

### 决策5: 工具测试功能

**问题**: 如何在管理界面中测试工具？

**选项**:
1. 在管理端直接调用工具执行逻辑
2. 创建一个测试会话，在测试会话中执行工具
3. 使用模拟环境执行工具

**决策**: 创建一个测试会话，在测试会话中执行工具

**理由**:
- 工具执行需要会话上下文（sessionId），测试会话提供隔离的测试环境
- 可以真实地测试工具的执行效果
- 测试会话可以自动清理，不影响生产环境

### 决策6: Fallback 机制

**问题**: 如何处理工具配置不存在或读取失败的情况？

**选项**:
1. 直接抛出异常，要求必须配置
2. 使用硬编码作为 fallback
3. 使用默认配置作为 fallback

**决策**: 使用硬编码作为 fallback

**理由**:
- 确保系统在配置缺失时仍能正常工作
- 向后兼容，不影响现有功能
- 降低配置错误导致系统崩溃的风险

### 决策7: 工具配置缓存策略

**问题**: 如何提高工具配置读取性能？

**选项**:
1. 每次执行都从数据库读取（简单但性能差）
2. 使用内存缓存（如 Caffeine）
3. 使用 Redis 缓存（分布式场景）

**决策**: 使用内存缓存（Caffeine），缓存时间 5 分钟

**理由**:
- 工具配置变更频率低，不需要实时更新
- 内存缓存简单高效，满足单机部署需求
- 后续可扩展为 Redis 缓存（如果需要分布式）

## Risks / Trade-offs

### 风险1: 配置错误导致工具执行失败
- **风险**: 管理员配置错误的提示词或指令，导致工具执行失败
- **缓解**: 
  - 提供配置验证功能，实时检查配置格式
  - 保留硬编码作为 fallback，确保系统可用性
  - 提供工具测试功能，管理员可以测试配置效果

### 风险2: 工具注册时机问题
- **风险**: 工具在运行时注册，配置数据可能与工具注册不同步
- **缓解**: 
  - 工具配置通过工具名称关联，工具名称是固定的
  - 在工具注册时自动加载配置，如果不存在则使用默认配置
  - 提供工具配置同步检查功能

### 风险3: 性能影响
- **风险**: 每次执行都需要读取配置，可能影响性能
- **缓解**: 
  - 使用内存缓存，减少数据库查询
  - 配置变更频率低，缓存命中率高
  - 监控工具配置读取性能，必要时优化

## Migration Plan

### 阶段1: 数据模型和初始化
1. 创建 `ToolConfig` 实体和相关 Repository
2. 扫描所有工具实现类，提取工具信息
3. 为每个工具创建默认配置记录
4. 准备数据导入脚本
5. 执行数据导入

### 阶段2: 后端服务实现
1. 创建工具配置读取服务
2. 修改工具执行逻辑，从管理系统读取配置
3. 实现 fallback 机制
4. 实现配置缓存

### 阶段3: 管理端实现
1. 创建管理端 API
2. 实现管理端前端界面
3. 实现工具测试功能
4. 添加配置验证功能

### 阶段4: 测试和验证
1. 单元测试和集成测试
2. 功能测试
3. 性能测试
4. 回退测试

### 阶段5: 文档和清理
1. 编写使用文档
2. 更新开发指南
3. （可选）移除硬编码

## Open Questions

1. **工具配置版本管理**: 是否需要实现工具配置的版本历史功能？
   - 初期版本：不需要，后续可扩展
   
2. **工具 A/B 测试**: 是否需要支持多个版本的配置进行 A/B 测试？
   - 初期版本：不需要，后续可扩展

3. **工具权限控制**: 是否需要限制哪些管理员可以修改工具配置？
   - 初期版本：使用现有的管理员权限控制

4. **工具配置变更通知**: 配置变更后是否需要通知相关系统？
   - 初期版本：不需要，通过缓存过期机制自动更新
