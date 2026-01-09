-- 心小安技能定义 - 第三部分（技能5-6）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_23_part2__create_mental_health_skills_part3.sql
-- 
-- 说明：本文件包含心小安的第5-6个技能
-- 5. 人际关系指导（Interpersonal Relationship Guidance）
-- 6. 心理健康知识库（Mental Health Knowledge Base）

SET NAMES utf8mb4;

-- ============================================
-- 技能5：人际关系指导（Interpersonal Relationship Guidance）
-- ============================================

-- 5.1 插入技能定义（Level 1）
INSERT INTO skill_definitions (
    skill_id,
    name,
    description,
    category,
    skill_type,
    execution_type,
    function_schema,
    execution_config,
    auto_trigger_keywords,
    required_permissions,
    max_usage_per_day,
    version,
    author,
    is_system_skill,
    created_at,
    updated_at
) VALUES (
    'interpersonal_relationship_guidance',
    '人际关系指导',
    '提供人际关系知识和指导，帮助用户改善人际关系。教授沟通技巧、边界设定、冲突处理等方法，帮助用户建立健康的人际关系。',
    'social',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "relationshipType": {
                "type": "string",
                "enum": ["family", "friend", "romantic", "work", "other"],
                "description": "关系类型：family(家庭), friend(朋友), romantic(恋爱), work(工作), other(其他)"
            },
            "issue": {
                "type": "string",
                "description": "人际关系问题描述"
            },
            "topic": {
                "type": "string",
                "enum": ["communication", "boundaries", "conflict", "trust", "intimacy", "all"],
                "description": "话题：communication(沟通), boundaries(边界), conflict(冲突), trust(信任), intimacy(亲密), all(全部)"
            },
            "action": {
                "type": "string",
                "enum": ["advice", "teach", "analyze", "plan"],
                "default": "advice",
                "description": "操作类型：advice(建议), teach(教授), analyze(分析), plan(计划)"
            }
        },
        "required": ["relationshipType"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的人际关系指导"
    }',
    '人际关系,沟通,社交,边界,冲突处理,人际关系改善',
    NULL,
    -1,
    '1.0.0',
    'HeartSphere Team',
    true,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    function_schema = VALUES(function_schema),
    execution_config = VALUES(execution_config),
    version = VALUES(version),
    updated_at = NOW();

-- 5.2 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    trigger_condition,
    execution_order,
    created_at
) VALUES (
    'interpersonal_relationship_guidance',
    2,
    '## 人际关系指导技能使用说明

### 功能描述
人际关系指导技能提供人际关系知识和指导，帮助用户改善人际关系，建立健康的人际关系模式。

### 核心功能
1. **问题分析**：分析人际关系问题
2. **知识提供**：提供人际关系知识
3. **技巧教授**：教授沟通、边界设定等技巧
4. **建议提供**：提供改善建议
5. **计划制定**：制定改善计划
6. **效果追踪**：追踪改善效果

### 参数说明
- **relationshipType** (必填): 关系类型
  - `family`: 家庭关系
  - `friend`: 朋友关系
  - `romantic`: 恋爱关系
  - `work`: 工作关系
  - `other`: 其他关系
- **issue** (可选): 人际关系问题描述
- **topic** (可选): 话题
  - `communication`: 沟通技巧
  - `boundaries`: 边界设定
  - `conflict`: 冲突处理
  - `trust`: 信任建立
  - `intimacy`: 亲密关系
  - `all`: 全部话题
- **action** (可选): 操作类型
  - `advice`: 提供建议
  - `teach`: 教授技巧
  - `analyze`: 分析问题
  - `plan`: 制定计划

### 使用场景
- 人际关系出现问题
- 想要改善人际关系
- 需要学习沟通技巧
- 想要设定健康边界

### 执行流程
1. 了解用户的人际关系问题和类型
2. 分析人际关系问题
3. 提供人际关系知识
4. 教授相关技巧（沟通、边界等）
5. 提供改善建议
6. 制定改善计划
7. 追踪改善效果

### 人际关系核心要素
- **沟通**：有效沟通技巧（倾听、表达、反馈）
- **边界**：设定健康边界，保护自己
- **冲突处理**：健康地处理冲突
- **信任**：建立和维护信任
- **尊重**：相互尊重和理解
- **支持**：相互支持和帮助

### 返回格式
```json
{
  "success": true,
  "action": "advice",
  "relationshipType": "family",
  "issue": "与父母沟通困难",
  "topic": "communication",
  "analysis": {
    "problem": "沟通方式不当，缺乏理解",
    "causes": [
      "代沟",
      "沟通方式不同",
      "缺乏耐心"
    ]
  },
  "knowledge": {
    "communication": "有效沟通需要倾听、理解和表达",
    "boundaries": "设定健康边界，保护自己的需求"
  },
  "advice": [
    "尝试理解父母的立场",
    "使用我陈述而非你陈述",
    "选择合适的时间和地点沟通",
    "保持耐心和尊重"
  ],
  "improvementPlan": {
    "steps": [
      "第一步：改善沟通方式",
      "第二步：增加理解",
      "第三步：建立健康边界"
    ],
    "timeline": "4-6周"
  }
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 技能6：心理健康知识库（Mental Health Knowledge Base）
-- ============================================

-- 6.1 插入技能定义（Level 1）
INSERT INTO skill_definitions (
    skill_id,
    name,
    description,
    category,
    skill_type,
    execution_type,
    function_schema,
    execution_config,
    auto_trigger_keywords,
    required_permissions,
    max_usage_per_day,
    version,
    author,
    is_system_skill,
    created_at,
    updated_at
) VALUES (
    'mental_health_knowledge_base',
    '心理健康知识库',
    '提供心理健康知识库，回答用户的心理健康疑问。包括心理健康知识、常见心理问题、心理疾病、治疗方法等，帮助用户了解心理健康知识。',
    'healthcare',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "question": {
                "type": "string",
                "description": "用户的疑问或问题"
            },
            "topic": {
                "type": "string",
                "enum": ["depression", "anxiety", "stress", "trauma", "addiction", "personality", "therapy", "general"],
                "description": "话题：depression(抑郁), anxiety(焦虑), stress(压力), trauma(创伤), addiction(成瘾), personality(人格), therapy(治疗), general(一般)"
            },
            "knowledgeType": {
                "type": "string",
                "enum": ["definition", "symptoms", "causes", "treatment", "prevention", "all"],
                "description": "知识类型：definition(定义), symptoms(症状), causes(原因), treatment(治疗), prevention(预防), all(全部)"
            },
            "action": {
                "type": "string",
                "enum": ["query", "explain", "educate", "refer"],
                "default": "query",
                "description": "操作类型：query(查询), explain(解释), educate(教育), refer(转介)"
            }
        },
        "required": ["question"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的心理健康知识库"
    }',
    '心理健康知识,心理问题,心理知识,心理健康,心理疾病,心理治疗',
    NULL,
    -1,
    '1.0.0',
    'HeartSphere Team',
    true,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    function_schema = VALUES(function_schema),
    execution_config = VALUES(execution_config),
    version = VALUES(version),
    updated_at = NOW();

-- 6.2 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    trigger_condition,
    execution_order,
    created_at
) VALUES (
    'mental_health_knowledge_base',
    2,
    '## 心理健康知识库技能使用说明

### 功能描述
心理健康知识库技能提供心理健康知识，回答用户的心理健康疑问，帮助用户了解心理健康知识。

### 核心功能
1. **知识查询**：回答用户的心理健康疑问
2. **知识解释**：解释心理健康概念和问题
3. **知识教育**：提供心理健康教育
4. **资源提供**：提供相关资源
5. **专业转介**：在需要时提供专业转介建议

### 参数说明
- **question** (必填): 用户的疑问或问题
- **topic** (可选): 话题
  - `depression`: 抑郁
  - `anxiety`: 焦虑
  - `stress`: 压力
  - `trauma`: 创伤
  - `addiction`: 成瘾
  - `personality`: 人格
  - `therapy`: 治疗
  - `general`: 一般知识
- **knowledgeType** (可选): 知识类型
  - `definition`: 定义
  - `symptoms`: 症状
  - `causes`: 原因
  - `treatment`: 治疗方法
  - `prevention`: 预防
  - `all`: 全部信息
- **action** (可选): 操作类型
  - `query`: 查询知识
  - `explain`: 解释概念
  - `educate`: 提供教育
  - `refer`: 专业转介

### 使用场景
- 想要了解心理健康知识
- 对心理问题有疑问
- 需要心理健康教育
- 想要了解心理疾病和治疗

### 执行流程
1. 了解用户的疑问或问题
2. 识别问题所属的话题
3. 查询和提供相关知识
4. 解释心理健康概念
5. 提供心理健康教育
6. 提供相关资源
7. 在需要时建议专业转介

### 重要提醒
- **非诊断**：知识库提供信息，不进行诊断
- **专业帮助**：严重问题建议寻求专业帮助
- **准确性**：提供准确、科学的心理健康知识
- **转介**：在识别到严重问题时，建议专业转介

### 返回格式
```json
{
  "success": true,
  "action": "query",
  "question": "什么是抑郁症？",
  "topic": "depression",
  "knowledge": {
    "definition": "抑郁症是一种常见的心理健康问题，表现为持续的情绪低落、兴趣丧失等症状",
    "symptoms": [
      "持续的情绪低落",
      "兴趣和愉悦感丧失",
      "精力减退",
      "注意力不集中",
      "自我评价低",
      "睡眠和食欲改变"
    ],
    "causes": [
      "生物因素",
      "心理因素",
      "环境因素"
    ],
    "treatment": [
      "心理治疗",
      "药物治疗",
      "生活方式调整"
    ]
  },
  "resources": [
    {"type": "hotline", "name": "心理危机干预热线", "number": "400-xxx-xxxx"},
    {"type": "service", "name": "专业心理咨询", "description": "建议寻求专业心理咨询"}
  ],
  "referral": "如果症状持续或严重，建议寻求专业心理健康服务"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 绑定技能到心小安角色
-- ============================================

-- 获取心小安的角色ID
SET @character_id = (SELECT id FROM system_characters WHERE name = '心小安' LIMIT 1);

-- 绑定技能5：人际关系指导
INSERT INTO character_skill_bindings (
    character_id,
    skill_id,
    is_enabled,
    auto_trigger,
    priority,
    usage_count,
    equipped_at,
    created_at,
    updated_at
) VALUES (
    @character_id,
    'interpersonal_relationship_guidance',
    true,
    false,
    5,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 绑定技能6：心理健康知识库
INSERT INTO character_skill_bindings (
    character_id,
    skill_id,
    is_enabled,
    auto_trigger,
    priority,
    usage_count,
    equipped_at,
    created_at,
    updated_at
) VALUES (
    @character_id,
    'mental_health_knowledge_base',
    true,
    false,
    6,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 验证插入结果
SELECT 
    '技能定义' as type,
    COUNT(*) as count
FROM skill_definitions 
WHERE skill_id IN ('interpersonal_relationship_guidance', 'mental_health_knowledge_base')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('interpersonal_relationship_guidance', 'mental_health_knowledge_base')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('interpersonal_relationship_guidance', 'mental_health_knowledge_base')
    AND character_id = @character_id;
