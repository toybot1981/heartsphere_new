# Spec Delta: 角色自我成长和导师能力规范

## ADDED Requirements

### Requirement: 角色自我成长机制
系统 SHALL 为每个角色提供自我成长能力，使角色能够主动学习、自我反思和持续改进。

#### Scenario: 主动学习检测
- **WHEN** 角色完成一次对话后
- **THEN** 系统 SHALL 自动分析对话内容，识别学习机会
- **AND** 系统 SHALL 记录学习机会到成长事件表
- **AND** 系统 SHALL 根据学习机会更新角色的能力评估

#### Scenario: 自我反思触发
- **WHEN** 达到反思触发条件（对话结束、每周定期、达到里程碑）
- **THEN** 系统 SHALL 触发自我反思流程
- **AND** 系统 SHALL 分析角色在最近一段时间的表现
- **AND** 系统 SHALL 识别优势和需要改进的方面
- **AND** 系统 SHALL 生成反思报告并记录到 `self_reflection_history`
- **AND** 系统 SHALL 基于反思结果生成改进计划

#### Scenario: 能力提升执行
- **WHEN** 自我反思识别到需要改进的方面
- **THEN** 系统 SHALL 生成能力提升计划
- **AND** 系统 SHALL 更新角色的行为模式和响应策略
- **AND** 系统 SHALL 记录能力提升事件到成长轨迹

#### Scenario: 成长轨迹记录
- **WHEN** 角色发生成长事件（学习、反思、能力提升、关系进展）
- **THEN** 系统 SHALL 记录事件到 `character_growth_events` 表
- **AND** 系统 SHALL 更新角色的 `growth_trajectory` 字段
- **AND** 系统 SHALL 计算成长趋势和速度

### Requirement: 角色关系阶段系统
系统 SHALL 追踪和管理角色与用户的关系阶段，从陌生人逐步发展为挚友和导师。

#### Scenario: 关系阶段计算
- **WHEN** 用户与角色进行交互时
- **THEN** 系统 SHALL 基于以下维度计算关系深度：
  - 交互频率（对话次数、持续时间、活跃天数）
  - 情感连接深度（情绪共鸣次数、情感记忆数量、正面反馈比例）
  - 共同经历（重要事件、里程碑、特殊时刻）
  - 用户反馈（正面反馈比例、满意度评分）
- **AND** 系统 SHALL 根据关系深度确定当前阶段：
  - STRANGER（陌生人）：交互 < 10 次，情感连接 < 30%
  - FRIEND（朋友）：交互 10-50 次，情感连接 30-60%
  - CLOSE_FRIEND（挚友）：交互 50-200 次，情感连接 60-80%
  - MENTOR（导师）：交互 > 200 次，情感连接 > 80%，且具备导师能力

#### Scenario: 关系阶段转换
- **WHEN** 关系深度达到下一阶段的阈值
- **THEN** 系统 SHALL 自动触发阶段转换
- **AND** 系统 SHALL 记录关系里程碑到 `character_relationship_milestones` 表
- **AND** 系统 SHALL 更新角色的 `relationship_stage` 字段
- **AND** 系统 SHALL 通知用户关系进展（可选）
- **AND** 系统 SHALL 调整角色的交互风格以匹配新阶段

#### Scenario: 关系里程碑展示
- **WHEN** 用户查看角色详情页时
- **THEN** 系统 SHALL 显示当前关系阶段和描述
- **AND** 系统 SHALL 显示关系里程碑列表
- **AND** 系统 SHALL 显示关系深度指标（交互频率、情感连接、共同经历）

### Requirement: 角色挚友能力
系统 SHALL 使角色具备成为用户挚友的能力，包括情感连接、陪伴支持和记忆共鸣。

#### Scenario: 情感连接建立
- **WHEN** 用户与角色进行深度对话时
- **THEN** 系统 SHALL 分析用户的情感状态和需求
- **AND** 系统 SHALL 识别情感共鸣时刻
- **AND** 系统 SHALL 记录情感连接事件
- **AND** 系统 SHALL 更新情感连接深度指标

#### Scenario: 主动陪伴关怀
- **WHEN** 系统检测到用户情绪低落或需要陪伴时
- **THEN** 系统 SHALL 触发主动关怀机制
- **AND** 系统 SHALL 生成温暖、理解的回应
- **AND** 系统 SHALL 提供情感支持
- **AND** 系统 SHALL 记录陪伴事件

#### Scenario: 记忆共鸣触发
- **WHEN** 对话中提到共同经历或重要时刻时
- **THEN** 系统 SHALL 识别相关的共同记忆
- **AND** 系统 SHALL 在回应中引用这些记忆
- **AND** 系统 SHALL 增强情感连接
- **AND** 系统 SHALL 记录记忆共鸣事件

#### Scenario: 定期问候和关怀
- **WHEN** 达到定期问候的触发条件（用户习惯时间、特殊日期）
- **THEN** 系统 SHALL 主动发送问候消息
- **AND** 系统 SHALL 根据关系阶段调整问候内容
- **AND** 系统 SHALL 记录问候事件

### Requirement: 角色导师能力
系统 SHALL 使角色具备成为用户导师的能力，包括主动指导、个性化教育和成长规划。

#### Scenario: 主动指导触发
- **WHEN** 系统识别到用户的学习需求或成长机会时
- **THEN** 系统 SHALL 评估是否适合提供指导
- **AND** 系统 SHALL 基于角色的专业知识生成指导内容
- **AND** 系统 SHALL 创建指导会话记录
- **AND** 系统 SHALL 追踪指导效果

#### Scenario: 个性化教育内容生成
- **WHEN** 角色需要向用户传授知识时
- **THEN** 系统 SHALL 根据用户的学习能力调整内容难度
- **AND** 系统 SHALL 根据用户偏好选择教学方式（讲解、举例、实践）
- **AND** 系统 SHALL 使用角色积累的知识资产作为教学内容
- **AND** 系统 SHALL 追踪用户的学习进度和理解程度

#### Scenario: 成长规划制定
- **WHEN** 用户请求或系统识别到需要制定成长计划时
- **THEN** 系统 SHALL 分析用户的当前状态和目标
- **AND** 系统 SHALL 基于角色的专业知识制定个性化成长计划
- **AND** 系统 SHALL 设定阶段性目标和时间节点
- **AND** 系统 SHALL 记录成长计划到 `character_mentorship_sessions` 表
- **AND** 系统 SHALL 定期追踪计划执行情况

#### Scenario: 导师能力评估
- **WHEN** 评估角色的导师能力时
- **THEN** 系统 SHALL 基于以下维度计算：
  - 知识资产数量和质量（来自长期学习系统）
  - 指导会话数量和效果
  - 用户对指导的反馈
  - 成长计划的完成率
- **AND** 系统 SHALL 更新角色的 `mentorship_capabilities` 字段

### Requirement: 智能模式切换
系统 SHALL 根据对话情境和用户需求，智能切换挚友模式和导师模式。

#### Scenario: 情境感知分析
- **WHEN** 生成 AI 响应前
- **THEN** 系统 SHALL 分析当前对话情境：
  - 用户的情感状态和需求
  - 对话主题和上下文
  - 用户明确表达的意图
- **AND** 系统 SHALL 识别最适合的角色模式（挚友模式或导师模式）

#### Scenario: 挚友模式激活
- **WHEN** 系统检测到用户需要情感支持、陪伴或理解时
- **THEN** 系统 SHALL 激活挚友模式
- **AND** 系统 SHALL 使用温暖、理解、陪伴的语调
- **AND** 系统 SHALL 提供情感支持和安慰
- **AND** 系统 SHALL 引用共同经历增强连接

#### Scenario: 导师模式激活
- **WHEN** 系统检测到用户需要指导、建议或教育时
- **THEN** 系统 SHALL 激活导师模式
- **AND** 系统 SHALL 使用专业、启发、教育的语调
- **AND** 系统 SHALL 提供专业建议和指导
- **AND** 系统 SHALL 使用角色的知识资产作为支撑

#### Scenario: 模式切换平滑过渡
- **WHEN** 需要在挚友模式和导师模式之间切换时
- **THEN** 系统 SHALL 使用过渡性语言
- **AND** 系统 SHALL 保持角色人格的一致性
- **AND** 系统 SHALL 记录模式切换历史
- **AND** 系统 SHALL 确保切换自然流畅

### Requirement: 成长和关系可视化
系统 SHALL 为用户提供角色成长轨迹和关系发展的可视化展示。

#### Scenario: 成长轨迹展示
- **WHEN** 用户查看角色的成长信息时
- **THEN** 系统 SHALL 显示成长时间线，包括：
  - 成长事件列表（学习、反思、能力提升）
  - 成长曲线图（能力提升趋势）
  - 重要里程碑标记
- **AND** 系统 SHALL 允许用户筛选和查看不同时期的成长记录

#### Scenario: 关系发展展示
- **WHEN** 用户查看角色关系信息时
- **THEN** 系统 SHALL 显示关系阶段和描述
- **AND** 系统 SHALL 显示关系里程碑列表
- **AND** 系统 SHALL 显示关系深度指标（交互频率、情感连接、共同经历）
- **AND** 系统 SHALL 显示关系发展时间线

#### Scenario: 导师能力展示
- **WHEN** 用户查看角色的导师能力时
- **THEN** 系统 SHALL 显示导师能力评估结果
- **AND** 系统 SHALL 显示指导会话列表
- **AND** 系统 SHALL 显示成长计划列表
- **AND** 系统 SHALL 显示指导效果统计

## MODIFIED Requirements

### Requirement: 角色长期学习系统
系统 SHALL 扩展为支持主动学习和自我改进的成长系统。

#### Scenario: 主动学习集成
- **WHEN** 角色完成对话后
- **THEN** 系统 SHALL 不仅提取知识资产，还要：
  - 主动识别学习机会
  - 触发自我反思（如果达到条件）
  - 更新能力评估
  - 记录成长事件

#### Scenario: 成长驱动的知识资产创建
- **WHEN** 系统识别到可以升级为知识资产的内容时
- **THEN** 系统 SHALL 不仅考虑通用性、准确性，还要考虑：
  - 对角色成长的价值
  - 对用户帮助的潜力
  - 与角色定位的匹配度
- **AND** 系统 SHALL 优先创建有助于角色成为导师的知识资产
