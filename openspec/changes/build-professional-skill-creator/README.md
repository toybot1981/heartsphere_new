# 专业 Skill Creator 工具

## 📋 项目概述

专业 Skill Creator 工具是一个功能完整的技能创建系统，提供了类似 Claude 官方技能创建器的能力，但生成的技能会存储到数据库中。

### 核心特性

- ✅ **8步创建向导**：从模板选择到最终预览的完整流程
- ✅ **MCP工具集成**：支持MCP协议，完全移除Function Calling
- ✅ **实时验证**：格式验证、内容验证、MCP工具可用性验证
- ✅ **质量分析**：描述质量评分和完整性检查
- ✅ **模板系统**：4个预定义模板，加速创建
- ✅ **返回合理性检查**：检测并警告FunctionCall格式
- ✅ **草稿保存**：支持保存草稿，稍后继续

---

## 🚀 快速开始

### 1. 数据库迁移

执行 Flyway 迁移脚本：
```sql
-- 文件位置: main/backend/src/main/resources/db/migration/V20260127__enhance_skill_definitions_for_professional_creator.sql
```

### 2. 启动服务

确保后端和前端服务正常运行：
- 后端：`http://localhost:8085`
- 前端：Admin 前端应用

### 3. 使用创建器

1. 登录 Admin 前端
2. 进入技能管理页面
3. 点击 **"✨ 专业创建器"** 按钮
4. 按照8个步骤填写技能信息
5. 完成创建

---

## 📁 文件结构

### 数据库
- `main/backend/src/main/resources/db/migration/V20260127__enhance_skill_definitions_for_professional_creator.sql`

### 后端服务（新建）
- `admin/backend/src/main/java/com/heartsphere/admin/service/skill/SkillValidationService.java`
- `admin/backend/src/main/java/com/heartsphere/admin/service/skill/McpToolValidator.java`
- `admin/backend/src/main/java/com/heartsphere/admin/service/skill/SkillQualityAnalyzer.java`
- `admin/backend/src/main/java/com/heartsphere/admin/service/skill/SkillTemplateService.java`
- `admin/backend/src/main/java/com/heartsphere/admin/service/skill/SkillCreatorService.java`
- `admin/backend/src/main/java/com/heartsphere/admin/service/skill/SkillContentBuilder.java`

### 后端 DTO（新建）
- `admin/backend/src/main/java/com/heartsphere/admin/dto/skill/SkillCreatorRequest.java`
- `admin/backend/src/main/java/com/heartsphere/admin/dto/skill/SkillCreatorResponse.java`
- `admin/backend/src/main/java/com/heartsphere/admin/dto/skill/SkillValidationResultDTO.java`
- `admin/backend/src/main/java/com/heartsphere/admin/dto/skill/SkillQualityReportDTO.java`

### 前端服务
- `admin/frontend/src/services/skill/SkillCreatorService.ts`

### 前端组件
- `admin/frontend/src/components/skill/SkillCreator.tsx`

---

## 🔌 API 接口

### 创建流程管理

#### 开始创建流程
```http
POST /api/admin/skills/creator/start
```

#### 保存草稿
```http
POST /api/admin/skills/creator/save-draft
Content-Type: application/json

{
  "sessionId": "string",
  "skillData": {}
}
```

#### 验证技能
```http
POST /api/admin/skills/creator/validate
Content-Type: application/json

{
  "skillData": {}
}
```

#### 完成创建
```http
POST /api/admin/skills/creator/finalize
Content-Type: application/json

{
  "skillData": {}
}
```

### 模板和工具

#### 获取模板列表
```http
GET /api/admin/skills/creator/templates
```

#### 获取分类模板
```http
GET /api/admin/skills/creator/templates/{category}
```

#### 获取MCP工具列表
```http
GET /api/admin/skills/creator/mcp-tools
```

#### 验证MCP工具
```http
POST /api/admin/skills/creator/validate-mcp-tool
Content-Type: application/json

{
  "mcpConfigId": 1,
  "toolNames": ["tool1", "tool2"]
}
```

#### 分析技能质量
```http
POST /api/admin/skills/creator/analyze-quality
Content-Type: application/json

{
  "skillData": {}
}
```

---

## 📝 使用指南

### 步骤1：选择模板（可选）
- 选择预定义模板，或跳过直接创建
- 模板会自动填充相关字段

### 步骤2：基础信息
- **技能ID**：格式要求 `^[a-z0-9]+(-[a-z0-9]+)*$`
- **名称**：技能显示名称
- **描述**：1-1024字符，建议包含关键词
- **分类**：技能分类
- **类型**：ACTIVE 或 PASSIVE

### 步骤3：元数据配置
- **许可证**：许可证信息（可选）
- **兼容性**：兼容性信息（JSON格式，可选）
- **自定义元数据**：自定义元数据（JSON格式，可选）
- **版本**：技能版本号
- **作者**：技能作者

### 步骤4：指令编写
- 使用 Markdown 格式编写技能指令
- 点击"分析质量"查看质量评分
- 系统会检测 FunctionCall 标记并警告

### 步骤5：MCP工具配置（可选）
- 选择 MCP 服务器
- 选择要使用的工具（多选）
- 点击"验证工具"检查可用性
- 如果工具不可用，可以使用描述方式让大模型执行

### 步骤6：执行配置
- **执行类型**：RULE_BASED, SCRIPT, API, GRAPH, DATABASE
- **执行配置**：JSON格式的配置参数

### 步骤7：资源管理（可选）
- 资源说明（当前版本仅支持说明，上传功能待后续实现）

### 步骤8：预览与验证
- 预览完整的技能内容（SKILL.md格式）
- 点击"验证"进行完整验证
- 查看验证结果和质量报告
- 验证通过后点击"完成创建"

---

## ⚠️ 注意事项

1. **草稿存储**：当前使用内存存储，重启后会丢失。生产环境建议使用Redis或数据库。

2. **资源上传**：资源管理步骤当前只提供说明输入，完整的上传功能将在后续版本实现。

3. **Function Schema**：数据库中的 `function_schema` 字段保留但标记为废弃，新创建的技能应使用 `mcp_tool_config`。

4. **向后兼容**：所有新字段允许为 NULL，现有技能数据不受影响。

5. **MCP工具验证**：创建时会验证MCP工具可用性，如果工具不可用，建议使用描述方式让大模型执行任务。

---

## 🔍 验证规则

### 技能ID验证
- 格式：`^[a-z0-9]+(-[a-z0-9]+)*$`
- 必须唯一

### 描述验证
- 长度：1-1024字符
- 建议包含关键词以提高质量评分

### MCP工具配置验证
- JSON格式验证
- 工具可用性验证
- 服务器连接测试

### 返回格式验证
- 检测 FunctionCall 标记
- 警告并提供修改建议

---

## 📊 质量分析

质量分析从以下维度评估技能：

1. **描述质量**（0-100分）
   - 关键词覆盖
   - 结构完整性
   - 长度合理性

2. **内容完整性**（0-100分）
   - 必填字段检查
   - MCP工具配置检查
   - 降级方案检查

3. **改进建议**
   - 描述改进建议
   - 完整性改进建议

---

## 🎯 模板系统

当前提供4个预定义模板：

1. **UTILITY** - 实用工具类技能
2. **HEALTHCARE** - 医疗健康类技能
3. **EDUCATION** - 教育培训类技能
4. **SOCIAL** - 社交互动类技能

每个模板包含：
- 预填充的元数据
- 指令结构示例
- MCP工具配置示例

---

## 🔧 技术栈

- **后端**：Spring Boot, Java
- **前端**：React, TypeScript
- **数据库**：MySQL (Flyway迁移)
- **协议**：MCP (Model Context Protocol)

---

## 📚 相关文档

- [提案文档](./proposal.md)
- [设计文档](./design.md)
- [任务清单](./tasks.md)
- [规格说明](./specs/skill-creation/spec.md)
- [实现总结](./IMPLEMENTATION_SUMMARY.md)
- [实现完成报告](./IMPLEMENTATION_COMPLETE.md)
- [最终检查清单](./FINAL_CHECKLIST.md)

---

## ✅ 验证状态

- ✅ OpenSpec 验证通过
- ✅ 无编译错误
- ✅ 无 Lint 错误
- ✅ 所有功能测试通过

---

## 🎉 项目状态

**实现状态**: ✅ 完成  
**代码质量**: ✅ 通过  
**文档完整性**: ✅ 完整  
**部署就绪**: ✅ 就绪

---

**最后更新**: 2026-01-27
