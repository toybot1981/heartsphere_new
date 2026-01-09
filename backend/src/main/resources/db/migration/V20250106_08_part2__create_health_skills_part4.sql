-- 康小健技能定义 - 第四部分（技能7-8）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_08_part2__create_health_skills_part4.sql
-- 
-- 说明：本文件包含康小健的第7-8个技能
-- 7. 健康风险评估（Health Risk Assessment）
-- 8. 体重管理（Weight Management）

SET NAMES utf8mb4;

-- ============================================
-- 技能7：健康风险评估（Health Risk Assessment）
-- ============================================

-- 7.1 插入技能定义（Level 1）
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
    'health_risk_assessment',
    '健康风险评估',
    '评估用户的健康风险，提供预防建议。通过收集健康数据、生活方式信息，评估用户患某些疾病的风险，提供针对性的预防建议和健康改善方案。',
    'healthcare',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "riskType": {
                "type": "string",
                "enum": ["cardiovascular", "diabetes", "obesity", "hypertension", "cancer", "comprehensive"],
                "description": "风险类型：cardiovascular(心血管), diabetes(糖尿病), obesity(肥胖), hypertension(高血压), cancer(癌症), comprehensive(综合评估)"
            },
            "healthData": {
                "type": "object",
                "properties": {
                    "age": {"type": "integer"},
                    "gender": {"type": "string"},
                    "bmi": {"type": "number"},
                    "bloodPressure": {"type": "string"},
                    "familyHistory": {"type": "array", "items": {"type": "string"}}
                },
                "description": "健康数据"
            },
            "lifestyle": {
                "type": "object",
                "properties": {
                    "smoking": {"type": "boolean"},
                    "alcohol": {"type": "string", "enum": ["none", "occasional", "regular", "heavy"]},
                    "exercise": {"type": "string", "enum": ["none", "light", "moderate", "intense"]},
                    "diet": {"type": "string", "enum": ["poor", "fair", "good", "excellent"]}
                },
                "description": "生活方式"
            },
            "action": {
                "type": "string",
                "enum": ["assess", "prevent", "monitor"],
                "default": "assess",
                "description": "操作类型：assess(评估), prevent(预防), monitor(监测)"
            }
        },
        "required": ["riskType"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的健康风险评估"
    }',
    '健康风险,健康评估,疾病预防,风险评估,健康检查',
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

-- 7.2 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    trigger_condition,
    execution_order,
    created_at
) VALUES (
    'health_risk_assessment',
    2,
    '## 健康风险评估技能使用说明

### 功能描述
健康风险评估技能评估用户的健康风险，提供预防建议，帮助用户了解自己的健康状况，采取预防措施。

### 核心功能
1. **数据收集**：收集用户的健康数据和生活方式信息
2. **风险评估**：评估用户患某些疾病的风险
3. **风险分级**：对风险进行分级（低、中、高）
4. **预防建议**：提供针对性的预防建议
5. **健康改善**：制定健康改善方案
6. **定期监测**：建议定期监测和检查

### 参数说明
- **riskType** (必填): 风险类型
  - `cardiovascular`: 心血管疾病风险
  - `diabetes`: 糖尿病风险
  - `obesity`: 肥胖风险
  - `hypertension`: 高血压风险
  - `cancer`: 癌症风险
  - `comprehensive`: 综合健康风险评估
- **healthData** (可选): 健康数据
  - `age`: 年龄
  - `gender`: 性别
  - `bmi`: 身体质量指数
  - `bloodPressure`: 血压
  - `familyHistory`: 家族病史
- **lifestyle** (可选): 生活方式
  - `smoking`: 是否吸烟
  - `alcohol`: 饮酒情况
  - `exercise`: 运动情况
  - `diet`: 饮食情况
- **action** (可选): 操作类型

### 使用场景
- 想要了解自己的健康风险
- 需要健康风险评估
- 想要采取预防措施
- 需要健康改善建议

### 执行流程
1. 了解用户想要评估的风险类型
2. 收集用户的健康数据和生活方式信息
3. 评估健康风险
4. 对风险进行分级
5. 提供针对性的预防建议
6. 制定健康改善方案
7. 建议定期监测和检查

### 风险分级
- **低风险**：风险较低，保持当前生活方式
- **中风险**：有一定风险，需要改善生活方式
- **高风险**：风险较高，建议咨询专业医生

### 返回格式
```json
{
  "success": true,
  "action": "assess",
  "riskType": "cardiovascular",
  "riskLevel": "medium",
  "riskScore": 65,
  "factors": [
    {"name": "年龄", "impact": "medium"},
    {"name": "缺乏运动", "impact": "high"},
    {"name": "饮食不健康", "impact": "medium"}
  ],
  "preventionAdvice": [
    "增加运动：每周至少150分钟中等强度运动",
    "改善饮食：减少饱和脂肪和盐的摄入",
    "控制体重：维持健康体重",
    "定期检查：每年进行心血管健康检查"
  ],
  "improvementPlan": {
    "exercise": "每周运动3-5次，每次30-45分钟",
    "diet": "增加蔬菜水果，减少加工食品",
    "monitoring": "每3个月检查一次血压和血脂"
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
-- 技能8：体重管理（Weight Management）
-- ============================================

-- 8.1 插入技能定义（Level 1）
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
    'weight_management',
    '体重管理',
    '科学管理体重，实现健康减重或增重目标。根据用户的目标、身体状况和生活方式，制定个性化的体重管理方案，包括饮食、运动和生活习惯的调整。',
    'healthcare',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "goal": {
                "type": "string",
                "enum": ["weight_loss", "weight_gain", "maintenance"],
                "description": "目标：weight_loss(减重), weight_gain(增重), maintenance(维持)"
            },
            "currentWeight": {
                "type": "number",
                "description": "当前体重（kg）"
            },
            "targetWeight": {
                "type": "number",
                "description": "目标体重（kg）"
            },
            "height": {
                "type": "number",
                "description": "身高（cm）"
            },
            "timeframe": {
                "type": "integer",
                "description": "时间期限（周）"
            },
            "action": {
                "type": "string",
                "enum": ["plan", "track", "adjust", "review"],
                "default": "plan",
                "description": "操作类型：plan(制定计划), track(追踪), adjust(调整), review(检查)"
            }
        },
        "required": ["goal", "currentWeight", "targetWeight"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的体重管理"
    }',
    '体重,减重,增重,体重管理,减肥,健康体重',
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

-- 8.2 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    trigger_condition,
    execution_order,
    created_at
) VALUES (
    'weight_management',
    2,
    '## 体重管理技能使用说明

### 功能描述
体重管理技能科学管理体重，帮助用户实现健康减重或增重目标，建立健康的体重管理习惯。

### 核心功能
1. **目标设定**：根据用户需求设定体重目标
2. **计划制定**：制定个性化的体重管理方案
3. **饮食指导**：提供饮食建议和食谱
4. **运动指导**：提供运动建议和计划
5. **进度追踪**：追踪体重变化和进度
6. **计划调整**：根据实际情况调整计划

### 参数说明
- **goal** (必填): 目标
  - `weight_loss`: 减重
  - `weight_gain`: 增重
  - `maintenance`: 维持体重
- **currentWeight** (必填): 当前体重（kg）
- **targetWeight** (必填): 目标体重（kg）
- **height** (可选): 身高（cm）
- **timeframe** (可选): 时间期限（周）
- **action** (可选): 操作类型
  - `plan`: 制定计划
  - `track`: 追踪进度
  - `adjust`: 调整计划
  - `review`: 检查进度

### 使用场景
- 想要减重或增重
- 需要科学的体重管理方案
- 想要追踪体重变化
- 需要调整体重管理计划

### 执行流程
1. 了解用户的体重管理目标
2. 收集用户的当前体重、身高、目标体重等信息
3. 计算BMI和健康体重范围
4. 制定个性化的体重管理方案
5. 提供饮食和运动建议
6. 追踪体重变化和进度
7. 根据实际情况调整计划

### 体重管理原则
- **科学减重**：每周减重0.5-1kg为宜
- **均衡饮食**：保证营养均衡，控制热量
- **适度运动**：结合有氧运动和力量训练
- **长期坚持**：建立长期健康习惯
- **循序渐进**：不要急于求成

### 返回格式
```json
{
  "success": true,
  "action": "plan",
  "goal": "weight_loss",
  "currentWeight": 70,
  "targetWeight": 60,
  "height": 165,
  "bmi": {
    "current": 25.7,
    "target": 22.0,
    "status": "overweight"
  },
  "timeframe": 12,
  "weeklyTarget": 0.83,
  "plan": {
    "diet": {
      "dailyCalories": 1500,
      "meals": [
        {"meal": "breakfast", "calories": 350},
        {"meal": "lunch", "calories": 450},
        {"meal": "dinner", "calories": 400},
        {"meal": "snacks", "calories": 300}
      ]
    },
    "exercise": {
      "weeklyHours": 5,
      "types": ["有氧运动", "力量训练"]
    }
  },
  "tips": [
    "每周减重0.5-1kg为宜",
    "保持营养均衡",
    "结合运动和饮食"
  ]
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 绑定技能到康小健角色
-- ============================================

-- 获取康小健的角色ID
SET @character_id = (SELECT id FROM system_characters WHERE name = '康小健' LIMIT 1);

-- 绑定技能7：健康风险评估
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
    'health_risk_assessment',
    true,
    false,
    7,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 绑定技能8：体重管理
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
    'weight_management',
    true,
    false,
    8,
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
WHERE skill_id IN ('health_risk_assessment', 'weight_management')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('health_risk_assessment', 'weight_management')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('health_risk_assessment', 'weight_management')
    AND character_id = @character_id;
