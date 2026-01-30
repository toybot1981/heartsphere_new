# Design: 增强技能创建器：资源管理和验证功能

## 架构设计

### 1. 技能资源管理

#### 数据模型

```
skill_resources
├── id (PK)
├── skill_id (FK -> skill_definitions.id)
├── resource_type (ENUM: SCRIPT, REFERENCE, ASSET)
├── file_name (VARCHAR)
├── file_path (VARCHAR) - 文件存储路径
├── file_size (BIGINT)
├── mime_type (VARCHAR)
├── description (TEXT) - 资源描述
├── order_index (INT) - 排序索引
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### 资源类型

- **SCRIPT** (`scripts/`): 可执行代码（Python、Bash等）
  - 支持：.py, .sh, .js, .ts 等
  - 用途：自动化任务、数据处理、特定操作

- **REFERENCE** (`references/`): 参考文档（Markdown等）
  - 支持：.md, .txt, .json 等
  - 用途：API文档、数据库schema、工作流指南

- **ASSET** (`assets/`): 输出资源（模板、图片等）
  - 支持：.pptx, .html, .png, .ttf 等
  - 用途：模板文件、品牌资产、字体文件

#### API 设计

```java
// 上传资源
POST /api/admin/skills/{skillId}/resources
- MultipartFile file
- String resourceType (SCRIPT/REFERENCE/ASSET)
- String description

// 获取资源列表
GET /api/admin/skills/{skillId}/resources
- 返回按类型分组的资源列表

// 删除资源
DELETE /api/admin/skills/{skillId}/resources/{resourceId}

// 更新资源描述
PUT /api/admin/skills/{skillId}/resources/{resourceId}
- String description
```

### 2. 增强验证功能

#### 验证规则

参考 Claude 官方的 `quick_validate.py`，实现以下验证：

1. **YAML Frontmatter 验证**
   - 必需字段：name, description
   - 允许字段：license, metadata
   - 格式验证：YAML 语法正确性

2. **技能命名验证**
   - 格式：hyphen-case（小写字母、数字、连字符）
   - 长度：最大64字符
   - 禁止：以连字符开头/结尾，连续连字符

3. **描述验证**
   - 长度：最大1024字符
   - 禁止：包含尖括号（< >）
   - 质量：包含关键词、触发场景

4. **渐进式披露验证**
   - SKILL.md body 长度：建议 < 500 行
   - 资源组织：scripts/references/assets 分类正确
   - 资源引用：SKILL.md 中引用的资源文件存在

5. **目录结构验证**
   - SKILL.md 必须存在
   - 资源目录结构正确
   - 无多余文件（README.md, CHANGELOG.md 等）

#### API 设计

```java
// 增强验证
POST /api/admin/skills/{skillId}/validate-enhanced
- 返回详细验证报告
  ├── 基础验证（字段格式）
  ├── 结构验证（目录、文件）
  ├── 质量验证（描述、内容）
  └── 渐进式披露验证
```

### 3. 技能迭代支持

#### 使用统计

```
skill_usage_stats
├── skill_id (FK)
├── usage_count (BIGINT)
├── success_count (BIGINT)
├── failure_count (BIGINT)
├── avg_response_time (DOUBLE)
├── last_used_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

#### 质量评估

- 基于使用统计计算质量分数
- 提供改进建议
- 支持版本对比

## 技术实现

### 文件存储

- **选项1**: 使用现有文件存储服务（如 ImageStorageService）
- **选项2**: 使用对象存储（OSS/S3）
- **选项3**: 本地文件系统（开发环境）

### 验证实现

- 使用 SnakeYAML 解析 YAML frontmatter
- 使用正则表达式验证命名规范
- 使用文件系统 API 验证资源存在性

## 用户体验

### 资源管理界面

```
┌─────────────────────────────────────┐
│   技能资源管理                       │
├─────────────────────────────────────┤
│  [Scripts] [References] [Assets]    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 拖拽文件到此处或点击上传     │   │
│  │ 支持: .py, .sh, .md, .txt   │   │
│  └─────────────────────────────┘   │
│                                     │
│  已上传资源：                        │
│  • scripts/rotate_pdf.py            │
│  • references/api_docs.md           │
  │  • assets/template.pptx             │
└─────────────────────────────────────┘
```
