# Change: Build Mental Health Support System

## Why

心域系统的远大目标是关注青少年以及成人等不同人群的心理健康，为那些饱受心理疾病或问题影响的人提供支持，让他们能够共享自己"微博的力量"（即个体的微小力量汇聚成强大的支持网络）。

当前系统虽然已有心小安（心理健康守护者）和心小暖（情绪陪伴师）等角色，以及心理导师系统，但缺乏：
1. **专门的心理健康场景**：没有专门为心理健康支持设计的场景环境
2. **专业化的多角色协同**：缺乏具备专业心理治疗知识和技能的专业角色协同工作
3. **心理疗愈知识库**：没有系统化的心理治疗、疗愈相关的专业知识库（RAG）支持

通过构建专门的心理健康支持系统，可以实现：
1. **专业化场景**：创建专门的心理健康支持场景，提供安全、私密、专业的支持环境
2. **多角色协同**：多个具备不同专业背景的心理健康角色（如认知行为治疗师、人本主义治疗师、危机干预专家等）协同工作，为不同需求的用户提供综合支持
3. **知识库支持**：构建心理疗愈相关的专业知识库，通过RAG技术为角色提供专业、准确的心理健康知识支持
4. **分人群支持**：针对青少年和成人的不同心理特点和需求，提供差异化的支持方案

## What Changes

- **新增（场景）**: 心理健康支持场景
  - 创建专门的心理健康支持场景，提供安全、私密的环境
  - 支持青少年和成人两种模式，针对不同人群提供差异化体验
  - 场景包含专业的心理健康支持环境和氛围设计

- **新增（角色）**: 专业化心理健康角色
  - 创建多个具备专业心理治疗知识和技能的角色
  - 每个角色具备特定的治疗流派专长（如CBT、DBT、ACT、心理动力学、人本主义等）
  - 角色具备危机识别、风险评估、专业干预等核心能力
  - 支持多角色协同工作，共同为用户提供综合支持

- **新增（知识库）**: 心理疗愈知识库（RAG）
  - 构建心理治疗、心理疗愈相关的专业知识库
  - 支持向量化存储和语义检索（RAG）
  - 知识库内容涵盖：心理治疗理论、干预技术、案例库、量表工具、危机处理流程等
  - 为心理健康角色提供实时、准确的专业知识支持

- **新增（协作）**: 心理健康多角色协同机制
  - 基于现有的多智能体协作框架，实现心理健康角色的协同工作
  - 支持角色间的专业咨询、转介、会诊等协作模式
  - 实现智能任务路由，根据用户需求自动选择合适的角色组合

## Impact

- **Affected specs**: 
  - 新增 `mental-health-scenario` capability（心理健康场景）
  - 新增 `mental-health-agents` capability（心理健康角色）
  - 新增 `mental-health-knowledge-base` capability（心理健康知识库）
  - 可能扩展现有的 `multi-agent-collaboration` capability（多智能体协作）

- **Affected code**:
  - **场景层**:
    - `main/backend/src/main/java/com/heartsphere/scene/` - 可能需要扩展场景系统以支持心理健康场景
    - `main/frontend/src/components/scene/MentalHealthScene/` - 心理健康场景前端组件（新建）
  
  - **角色层**:
    - `main/backend/src/main/java/com/heartsphere/character/mentalhealth/` - 心理健康角色实现（新建）
      - 多个专业心理健康角色（CBT治疗师、DBT治疗师、危机干预专家等）
      - 角色技能定义和实现
    - `main/backend/src/main/java/com/heartsphere/character/multiagent/mentalhealth/` - 心理健康角色多智能体协作（新建）
      - `MentalHealthOrchestrator.java` - 心理健康角色编排服务
      - `MentalHealthRouter.java` - 心理健康角色路由策略
  
  - **知识库层**:
    - `main/backend/src/main/java/com/heartsphere/knowledge/mentalhealth/` - 心理健康知识库服务（新建）
      - `MentalHealthKnowledgeBaseService.java` - 知识库服务接口
      - `MentalHealthRAGService.java` - RAG检索服务
      - 知识库数据存储和向量化
  
  - **API层**:
    - `main/backend/src/main/java/com/heartsphere/api/mentalhealth/` - 心理健康支持API（新建）
    - `main/frontend/src/services/api/mentalHealth/` - 前端API服务（新建）

- **Breaking changes**: 无（新增功能，不影响现有功能）

- **架构说明**:
  - **复用现有基础设施**：基于现有的多智能体协作框架（`multiagent`）和场景系统
  - **专业化扩展**：在通用框架基础上，针对心理健康领域进行专业化扩展
  - **知识库集成**：利用现有的向量检索和RAG能力（Context Engine v3），构建心理健康专业知识库
  - **分人群设计**：场景和角色设计考虑青少年和成人的不同需求
