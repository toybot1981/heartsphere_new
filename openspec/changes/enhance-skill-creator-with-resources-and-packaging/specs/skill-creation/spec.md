## MODIFIED Requirements

### Requirement: 技能资源管理
系统 SHALL 支持在技能创建过程中上传和管理技能资源文件（scripts/, references/, assets/），参考 Claude 官方 skill-creator 的资源管理规范。

#### Scenario: 上传脚本资源
- **WHEN** 管理员在技能创建器的资源管理步骤中上传脚本文件（.py, .sh, .js 等）
- **THEN** 系统验证文件类型和大小（最大10MB）
- **AND** 系统将文件存储到技能资源存储位置
- **AND** 系统在 `skill_resources` 表中创建资源记录，类型为 SCRIPT
- **AND** 系统返回资源ID和文件路径
- **AND** 管理员可以在资源列表中查看、预览和删除上传的脚本

#### Scenario: 上传参考文档资源
- **WHEN** 管理员在技能创建器的资源管理步骤中上传参考文档（.md, .txt, .json 等）
- **THEN** 系统验证文件类型和大小（最大10MB）
- **AND** 系统将文件存储到技能资源存储位置
- **AND** 系统在 `skill_resources` 表中创建资源记录，类型为 REFERENCE
- **AND** 系统支持 Markdown 文件的预览功能
- **AND** 管理员可以在资源列表中查看、预览和删除上传的参考文档

#### Scenario: 上传资产资源
- **WHEN** 管理员在技能创建器的资源管理步骤中上传资产文件（.pptx, .html, .png, .ttf 等）
- **THEN** 系统验证文件类型和大小（最大50MB）
- **AND** 系统将文件存储到技能资源存储位置
- **AND** 系统在 `skill_resources` 表中创建资源记录，类型为 ASSET
- **AND** 系统支持图片和文档的预览功能
- **AND** 管理员可以在资源列表中查看、预览和删除上传的资产

#### Scenario: 管理技能资源
- **WHEN** 管理员查看技能的资源列表
- **THEN** 系统按资源类型分组显示（Scripts, References, Assets）
- **AND** 系统显示每个资源的文件名、大小、上传时间、描述
- **AND** 管理员可以编辑资源描述
- **AND** 管理员可以删除资源（删除文件和相关记录）
- **AND** 管理员可以调整资源顺序（通过 order_index）

#### Scenario: 资源引用验证
- **WHEN** 管理员在 SKILL.md 中引用资源文件（如 `[scripts/rotate_pdf.py](scripts/rotate_pdf.py)`）
- **THEN** 系统验证引用的资源文件是否存在
- **AND** 如果资源不存在，系统显示警告提示
- **AND** 系统在验证报告中列出所有未找到的资源引用

### Requirement: 增强技能验证
系统 SHALL 实现增强的验证功能，参考 Claude 官方的 `quick_validate.py`，验证技能结构、资源组织、渐进式披露原则等。

#### Scenario: YAML Frontmatter 验证
- **WHEN** 系统验证技能的 YAML frontmatter
- **THEN** 系统验证：
  - YAML 语法正确性（使用 SnakeYAML 解析）
  - 必需字段存在：name, description
  - 允许字段：license, metadata（其他字段不允许）
  - name 字段格式：字符串类型，非空
  - description 字段格式：字符串类型，非空
- **AND** 如果验证失败，系统返回具体的错误信息

#### Scenario: 技能命名规范验证
- **WHEN** 系统验证技能名称
- **THEN** 系统验证：
  - 格式：hyphen-case（小写字母、数字、单连字符，正则：`^[a-z0-9-]+$`）
  - 长度：最大64字符
  - 禁止：以连字符开头或结尾，包含连续连字符（--）
- **AND** 如果验证失败，系统返回具体的错误信息和建议

#### Scenario: 描述格式验证
- **WHEN** 系统验证技能描述
- **THEN** 系统验证：
  - 长度：最大1024字符
  - 禁止字符：不包含尖括号（< >）
  - 质量检查：包含关键词、触发场景说明
- **AND** 如果验证失败，系统返回具体的错误信息和建议

#### Scenario: 渐进式披露验证
- **WHEN** 系统验证技能是否符合渐进式披露原则
- **THEN** 系统验证：
  - SKILL.md body 长度：建议 < 500 行（超过时显示警告）
  - 资源组织：scripts/, references/, assets/ 分类正确
  - 资源引用：SKILL.md 中引用的资源文件存在
  - 目录结构：无多余文件（README.md, CHANGELOG.md 等）
- **AND** 系统生成渐进式披露验证报告，包含建议和改进意见

#### Scenario: 资源文件验证
- **WHEN** 系统验证技能资源
- **THEN** 系统验证：
  - 资源文件存在性：所有在 skill_resources 表中记录的资源文件实际存在
  - 资源类型正确性：文件扩展名与资源类型匹配
  - 资源引用完整性：SKILL.md 中引用的资源都在资源列表中
- **AND** 如果验证失败，系统返回缺失的资源列表

#### Scenario: 增强验证报告
- **WHEN** 管理员请求增强验证
- **THEN** 系统返回详细的验证报告，包含：
  - 基础验证结果（字段格式、命名规范）
  - 结构验证结果（目录、文件）
  - 质量验证结果（描述、内容）
  - 渐进式披露验证结果（长度、组织）
  - 资源验证结果（存在性、引用）
- **AND** 每个验证项包含：状态（通过/警告/失败）、错误信息、修复建议
- **AND** 系统提供总体评分和改进建议
