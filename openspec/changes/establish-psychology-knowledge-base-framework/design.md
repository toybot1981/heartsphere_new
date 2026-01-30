# Design: 心理知识库框架设计

## 架构设计

### 1. 数据模型设计

#### 1.1 核心实体

**PsychologyKnowledge（心理学知识条目）**
- `id` (BIGINT, PK) - 主键
- `title` (VARCHAR) - 知识标题
- `content` (TEXT) - 知识内容（支持Markdown）
- `summary` (VARCHAR) - 知识摘要
- `category_id` (BIGINT, FK) - 分类ID
- `source_id` (BIGINT, FK) - 来源ID
- `tags` (JSON) - 标签列表（JSON数组）
- `metadata` (JSON) - 扩展元数据（作者、发布时间、版本等）
- `status` (ENUM) - 状态（DRAFT, PUBLISHED, ARCHIVED）
- `version` (INT) - 版本号
- `created_at` (TIMESTAMP) - 创建时间
- `updated_at` (TIMESTAMP) - 更新时间
- `created_by` (BIGINT) - 创建者ID（可选，支持管理员管理）

**KnowledgeCategory（知识分类）**
- `id` (BIGINT, PK) - 主键
- `name` (VARCHAR) - 分类名称
- `code` (VARCHAR, UNIQUE) - 分类代码（如：THERAPY_THEORY）
- `description` (TEXT) - 分类描述
- `parent_id` (BIGINT, FK, NULL) - 父分类ID（支持层级分类）
- `sort_order` (INT) - 排序顺序
- `created_at` (TIMESTAMP) - 创建时间

**KnowledgeSource（知识来源）**
- `id` (BIGINT, PK) - 主键
- `name` (VARCHAR) - 来源名称
- `url` (VARCHAR) - 来源URL
- `type` (ENUM) - 来源类型（WEBSITE, BOOK, JOURNAL, API, MANUAL）
- `credibility_level` (ENUM) - 可信度等级（HIGH, MEDIUM, LOW）
- `description` (TEXT) - 来源描述
- `metadata` (JSON) - 扩展信息（作者、机构、许可证等）
- `created_at` (TIMESTAMP) - 创建时间

**KnowledgeTag（知识标签）**
- `id` (BIGINT, PK) - 主键
- `name` (VARCHAR, UNIQUE) - 标签名称
- `category` (VARCHAR) - 标签分类（如：therapy, technique, disorder）
- `description` (TEXT) - 标签描述
- `usage_count` (INT) - 使用次数
- `created_at` (TIMESTAMP) - 创建时间

**KnowledgeTagRelation（知识-标签关联表）**
- `knowledge_id` (BIGINT, FK) - 知识ID
- `tag_id` (BIGINT, FK) - 标签ID
- 复合主键：`(knowledge_id, tag_id)`

#### 1.2 关系设计

```
PsychologyKnowledge (1) ──→ (N) KnowledgeCategory
PsychologyKnowledge (1) ──→ (1) KnowledgeSource
PsychologyKnowledge (N) ──→ (N) KnowledgeTag (通过 KnowledgeTagRelation)
KnowledgeCategory (1) ──→ (N) KnowledgeCategory (自关联，支持层级)
```

#### 1.3 索引设计

- `psychology_knowledge.category_id` - 分类查询索引
- `psychology_knowledge.source_id` - 来源查询索引
- `psychology_knowledge.status` - 状态查询索引
- `psychology_knowledge.title` - 标题全文搜索索引（后续）
- `knowledge_tag.name` - 标签名称唯一索引
- `knowledge_tag_relation(knowledge_id, tag_id)` - 关联表复合索引

### 2. 知识分类体系

#### 2.1 一级分类

1. **疗法理论（THERAPY_THEORY）**
   - CBT理论、DBT理论、ACT理论、心理动力学理论、人本主义理论等

2. **干预技术（INTERVENTION_TECHNIQUE）**
   - 认知重构、行为激活、正念练习、暴露疗法等

3. **临床案例（CLINICAL_CASE）**
   - 真实案例、模拟案例、案例研究等

4. **心理学概念（PSYCHOLOGY_CONCEPT）**
   - 认知扭曲、情绪调节、应对策略、防御机制等

5. **研究证据（RESEARCH_EVIDENCE）**
   - 研究论文、元分析、临床试验结果等

6. **专业术语（PROFESSIONAL_TERM）**
   - 专业术语定义、解释、应用场景等

#### 2.2 标签系统

标签分为多个类别：
- **疗法标签**: cbt, dbt, act, psychodynamic, humanistic
- **技术标签**: cognitive-restructuring, behavioral-activation, mindfulness
- **问题标签**: anxiety, depression, trauma, relationship
- **人群标签**: adult, adolescent, child, elderly
- **难度标签**: beginner, intermediate, advanced

### 3. 资源采集框架

#### 3.1 采集方式

1. **网页爬取（Web Scraping）**
   - 使用 Jsoup 或 Selenium 爬取公开网页
   - 遵守 robots.txt 和版权要求
   - 支持结构化数据提取

2. **API集成（API Integration）**
   - 集成第三方API（如PubMed API、学术数据库API）
   - 支持OAuth认证和API密钥管理

3. **手动导入（Manual Import）**
   - 支持CSV、JSON格式批量导入
   - 支持Markdown文件导入
   - 提供导入模板和验证

4. **AI生成增强（AI Generation）**
   - 基于已有内容使用AI生成扩展内容
   - 支持内容验证和人工审核

#### 3.2 采集流程

```
资源发现 → 资源验证 → 内容提取 → 数据清洗 → 分类标注 → 质量审核 → 入库存储
```

#### 3.3 服务接口设计

**ResourceCollectorService**
```java
public interface ResourceCollectorService {
    // 采集单个资源
    CollectResult collectResource(ResourceConfig config);
    
    // 批量采集资源
    List<CollectResult> collectResources(List<ResourceConfig> configs);
    
    // 验证资源可用性
    boolean validateResource(ResourceConfig config);
    
    // 获取采集任务状态
    CollectTaskStatus getTaskStatus(String taskId);
}
```

### 4. API设计

#### 4.1 知识库管理API

**知识条目管理**
- `POST /api/psychology/knowledge` - 创建知识条目
- `GET /api/psychology/knowledge/{id}` - 获取知识条目
- `PUT /api/psychology/knowledge/{id}` - 更新知识条目
- `DELETE /api/psychology/knowledge/{id}` - 删除知识条目
- `GET /api/psychology/knowledge` - 列表查询（支持分页、筛选、排序）

**知识分类管理**
- `GET /api/psychology/knowledge/categories` - 获取所有分类
- `GET /api/psychology/knowledge/categories/{id}` - 获取分类详情
- `POST /api/psychology/knowledge/categories` - 创建分类（管理员）
- `PUT /api/psychology/knowledge/categories/{id}` - 更新分类（管理员）

**知识来源管理**
- `GET /api/psychology/knowledge/sources` - 获取所有来源
- `POST /api/psychology/knowledge/sources` - 添加来源（管理员）
- `PUT /api/psychology/knowledge/sources/{id}` - 更新来源（管理员）

**知识标签管理**
- `GET /api/psychology/knowledge/tags` - 获取所有标签
- `POST /api/psychology/knowledge/tags` - 创建标签
- `GET /api/psychology/knowledge/tags/popular` - 获取热门标签

**知识搜索**
- `GET /api/psychology/knowledge/search` - 搜索知识（关键词、分类、标签）

**批量导入**
- `POST /api/psychology/knowledge/import` - 批量导入知识（CSV/JSON）

### 5. 资源清单结构

资源清单文档包含以下信息：

```yaml
resources:
  - name: "American Psychological Association (APA)"
    url: "https://www.apa.org"
    type: "WEBSITE"
    credibility: "HIGH"
    description: "美国心理学会官方网站"
    categories: ["RESEARCH_EVIDENCE", "PROFESSIONAL_TERM"]
    tags: ["academic", "authoritative"]
    
  - name: "Psychology Today"
    url: "https://www.psychologytoday.com"
    type: "WEBSITE"
    credibility: "MEDIUM"
    description: "心理学专业媒体网站"
    categories: ["PSYCHOLOGY_CONCEPT", "CLINICAL_CASE"]
    tags: ["popular", "accessible"]
```

## 技术选型

### 后端技术
- **数据访问**: Spring Data JPA
- **数据库迁移**: Flyway
- **JSON处理**: Jackson（支持JSON字段）
- **网页爬取**: Jsoup（轻量级，适合简单爬取）
- **API文档**: SpringDoc OpenAPI

### 数据存储
- **主数据库**: MySQL 8.0+（结构化数据）
- **JSON字段**: 使用MySQL的JSON类型存储扩展信息
- **全文搜索**: 后续可集成Elasticsearch（当前阶段使用LIKE查询）

## 扩展性考虑

1. **多语言支持**: 数据模型支持多语言内容（通过metadata字段）
2. **版本控制**: 支持知识条目的版本管理和历史记录
3. **审核工作流**: 支持知识条目的审核和发布流程
4. **全文搜索**: 预留全文搜索接口，后续可集成Elasticsearch
5. **AI增强**: 支持AI生成内容的自动标注和验证
