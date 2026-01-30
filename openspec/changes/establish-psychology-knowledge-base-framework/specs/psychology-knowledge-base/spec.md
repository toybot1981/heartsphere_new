# Spec: Psychology Knowledge Base

## ADDED Requirements

### Requirement: 知识库数据模型

系统 SHALL 提供知识库数据模型，支持心理学知识的结构化存储和管理。

#### Scenario: 创建知识条目
- **Given**: 管理员想要添加一条新的心理学知识
- **When**: 调用创建知识条目API，提供标题、内容、分类、来源等信息
- **Then**: 系统创建知识条目并保存到数据库，返回创建的知识条目ID

#### Scenario: 查询知识条目
- **Given**: 用户想要查询特定分类的知识条目
- **When**: 调用查询API，指定分类ID和分页参数
- **Then**: 系统返回该分类下的知识条目列表，支持分页

#### Scenario: 更新知识条目
- **Given**: 管理员想要更新已有知识条目的内容
- **When**: 调用更新API，提供知识条目ID和新的内容
- **Then**: 系统更新知识条目，更新版本号和时间戳

### Requirement: 知识分类体系

系统 SHALL 提供知识分类体系，支持知识的分类管理和层级分类。

#### Scenario: 获取所有分类
- **Given**: 用户想要查看所有可用的知识分类
- **When**: 调用获取分类列表API
- **Then**: 系统返回所有分类，包括分类名称、代码、描述等信息

#### Scenario: 按分类查询知识
- **Given**: 用户想要查看特定分类下的知识条目
- **When**: 调用查询API，指定分类代码（如THERAPY_THEORY）
- **Then**: 系统返回该分类下的所有知识条目

#### Scenario: 层级分类支持
- **Given**: 系统定义了层级分类（如：疗法理论 > CBT理论）
- **When**: 查询父分类时
- **Then**: 系统可以返回子分类的知识条目（可选）

### Requirement: 知识来源管理

系统 SHALL 支持知识来源的管理，记录知识的来源信息。

#### Scenario: 添加知识来源
- **Given**: 管理员想要添加一个新的知识来源（如网站、书籍）
- **When**: 调用添加来源API，提供来源名称、URL、类型、可信度等信息
- **Then**: 系统创建来源记录并保存

#### Scenario: 查询知识来源
- **Given**: 用户想要查看知识的来源信息
- **When**: 查看知识条目详情
- **Then**: 系统显示该知识的来源信息，包括来源名称、URL、可信度等级

#### Scenario: 按来源筛选知识
- **Given**: 用户想要查看来自特定来源的知识条目
- **When**: 调用查询API，指定来源ID
- **Then**: 系统返回该来源下的所有知识条目

### Requirement: 知识标签系统

系统 SHALL 支持知识标签系统，支持多标签标注和标签查询。

#### Scenario: 为知识添加标签
- **Given**: 管理员创建或更新知识条目
- **When**: 提供标签列表（如：["cbt", "anxiety", "beginner"]）
- **Then**: 系统保存标签关联关系，更新标签使用次数

#### Scenario: 按标签查询知识
- **Given**: 用户想要查看包含特定标签的知识条目
- **When**: 调用查询API，指定标签名称
- **Then**: 系统返回包含该标签的所有知识条目

#### Scenario: 获取热门标签
- **Given**: 用户想要查看最常用的标签
- **When**: 调用获取热门标签API
- **Then**: 系统返回使用次数最多的标签列表

### Requirement: 知识搜索功能

系统 SHALL 提供知识搜索功能，支持关键词搜索和组合筛选。

#### Scenario: 关键词搜索
- **Given**: 用户想要搜索包含特定关键词的知识
- **When**: 调用搜索API，提供关键词
- **Then**: 系统在标题和内容中搜索，返回匹配的知识条目

#### Scenario: 组合筛选搜索
- **Given**: 用户想要搜索特定分类、特定标签的知识
- **When**: 调用搜索API，提供分类、标签、关键词等筛选条件
- **Then**: 系统返回同时满足所有条件的知识条目

#### Scenario: 分页和排序
- **Given**: 搜索结果较多
- **When**: 调用搜索API，提供分页参数（page, size）和排序参数
- **Then**: 系统返回分页结果，按指定字段排序

### Requirement: 资源采集框架

系统 SHALL 提供资源采集框架接口，支持多种采集方式的扩展。

#### Scenario: 定义采集接口
- **Given**: 系统需要支持资源采集功能
- **When**: 定义ResourceCollectorService接口
- **Then**: 接口包含资源采集、验证、任务状态查询等方法

#### Scenario: 资源验证
- **Given**: 管理员想要验证资源是否可用
- **When**: 调用资源验证API，提供资源URL
- **Then**: 系统验证资源可访问性，返回验证结果

#### Scenario: 采集任务管理
- **Given**: 系统执行批量资源采集
- **When**: 创建采集任务
- **Then**: 系统返回任务ID，支持查询任务状态和结果

### Requirement: 批量导入功能

系统 SHALL 支持批量导入知识条目，支持CSV和JSON格式。

#### Scenario: CSV格式导入
- **Given**: 管理员准备了CSV格式的知识数据
- **When**: 调用批量导入API，上传CSV文件
- **Then**: 系统解析CSV文件，验证数据格式，批量创建知识条目，返回导入结果

#### Scenario: JSON格式导入
- **Given**: 管理员准备了JSON格式的知识数据
- **When**: 调用批量导入API，上传JSON文件
- **Then**: 系统解析JSON文件，验证数据格式，批量创建知识条目，返回导入结果

#### Scenario: 导入错误处理
- **Given**: 导入文件中包含格式错误或无效数据
- **When**: 调用批量导入API
- **Then**: 系统跳过错误数据，记录错误信息，返回成功和失败的统计信息

### Requirement: 资源清单文档

系统 SHALL 提供心理学资源清单文档，包含经典网站和资源信息。

#### Scenario: 资源清单整理
- **Given**: 需要建立心理知识库资源清单
- **When**: 搜集和整理经典心理学、心理治疗网站
- **Then**: 创建资源清单文档，包含至少20个资源，每个资源包含名称、URL、类型、可信度、描述等信息

#### Scenario: 资源分类标注
- **Given**: 资源清单包含多种类型的资源
- **When**: 整理资源时
- **Then**: 为每个资源标注类型（网站、书籍、期刊、API等）和适用分类

#### Scenario: 资源可信度评级
- **Given**: 不同资源具有不同的权威性
- **When**: 整理资源时
- **Then**: 为每个资源标注可信度等级（HIGH, MEDIUM, LOW），优先使用高可信度资源

## MODIFIED Requirements

### Requirement: 扩展KnowledgeBaseService

系统 SHALL 修改现有的KnowledgeBaseService，集成新的知识库数据模型。

#### Scenario: 使用数据库存储知识
- **Given**: 系统已有KnowledgeBaseService，当前使用AI生成内容
- **When**: 调用生成知识库方法时
- **Then**: 系统首先查询数据库，如果存在则返回数据库内容，否则使用AI生成并保存到数据库

#### Scenario: 知识库检索增强
- **Given**: 系统已有searchKnowledgeBase方法
- **When**: 调用检索方法时
- **Then**: 系统从数据库查询，支持分类、标签、关键词等多维度检索
