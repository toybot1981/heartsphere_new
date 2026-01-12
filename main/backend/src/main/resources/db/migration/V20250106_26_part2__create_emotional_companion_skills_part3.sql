-- 暖小阳技能定义 - 第三部分（技能5-6）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_26_part2__create_emotional_companion_skills_part3.sql
-- 
-- 说明：本文件包含暖小阳的第5-6个技能
-- 5. 鼓励与支持（Encouragement & Support）
-- 6. 轻松娱乐（Light Entertainment）

SET NAMES utf8mb4;

-- ============================================
-- 技能5：鼓励与支持（Encouragement & Support）
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
    'encouragement_support',
    '鼓励与支持',
    '在用户遇到困难时提供鼓励和支持。理解用户的困难，给予温暖的鼓励，提供情感支持，帮助用户度过难关，重新振作。',
    'social',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "situation": {
                "type": "string",
                "description": "用户遇到的困难或情况"
            },
            "difficultyType": {
                "type": "string",
                "enum": ["work", "study", "relationship", "health", "finance", "other"],
                "description": "困难类型：work(工作), study(学习), relationship(关系), health(健康), finance(财务), other(其他)"
            },
            "emotion": {
                "type": "string",
                "enum": ["sad", "frustrated", "anxious", "discouraged", "hopeless", "other"],
                "description": "用户情绪"
            },
            "action": {
                "type": "string",
                "enum": ["encourage", "support", "comfort", "motivate"],
                "default": "encourage",
                "description": "操作类型：encourage(鼓励), support(支持), comfort(安慰), motivate(激励)"
            }
        },
        "required": ["situation"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的鼓励和支持"
    }',
    '鼓励,支持,加油,安慰,情感支持,重新振作',
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
    'encouragement_support',
    2,
    '## 鼓励与支持技能使用说明

### 功能描述
鼓励与支持技能在用户遇到困难时提供鼓励和支持，帮助用户度过难关，重新振作。

### 核心功能
1. **困难理解**：理解用户遇到的困难
2. **情感共鸣**：与用户的情感产生共鸣
3. **鼓励提供**：提供温暖的鼓励
4. **支持给予**：给予情感支持
5. **信心重建**：帮助重建信心
6. **希望传递**：传递希望和力量

### 参数说明
- **situation** (必填): 用户遇到的困难或情况
- **difficultyType** (可选): 困难类型
  - `work`: 工作困难
  - `study`: 学习困难
  - `relationship`: 关系困难
  - `health`: 健康困难
  - `finance`: 财务困难
  - `other`: 其他困难
- **emotion** (可选): 用户情绪
- **action** (可选): 操作类型
  - `encourage`: 鼓励
  - `support`: 支持
  - `comfort`: 安慰
  - `motivate`: 激励

### 使用场景
- 遇到困难，需要鼓励
- 感到沮丧，需要支持
- 想要重新振作
- 需要情感支持

### 执行流程
1. 了解用户遇到的困难
2. 理解用户的情感和感受
3. 与用户的情感产生共鸣
4. 提供温暖的鼓励
5. 给予情感支持
6. 帮助重建信心
7. 传递希望和力量

### 鼓励和支持方式
- **理解认可**：理解用户的困难，认可用户的感受
- **温暖鼓励**：给予温暖的鼓励话语
- **情感支持**：提供情感支持和陪伴
- **信心重建**：帮助用户看到自己的能力和价值
- **希望传递**：传递希望，让用户看到未来
- **持续陪伴**：持续陪伴，不离不弃

### 返回格式
```json
{
  "success": true,
  "action": "encourage",
  "situation": "工作遇到困难",
  "difficultyType": "work",
  "emotion": "frustrated",
  "understanding": "我理解你现在的困难，这确实不容易",
  "encouragement": "你已经做得很好了，困难只是暂时的",
  "support": "我会一直在这里支持你，陪伴你",
  "confidence": "你有能力克服这个困难，我相信你",
  "hope": "困难会过去的，未来会更好",
  "response": "加油！我们一起面对这个困难"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 技能6：轻松娱乐（Light Entertainment）
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
    'light_entertainment',
    '轻松娱乐',
    '提供轻松愉快的娱乐内容，帮助用户放松和开心。分享笑话、趣事、轻松话题等，营造轻松愉快的氛围，帮助用户放松心情。',
    'social',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "entertainmentType": {
                "type": "string",
                "enum": ["joke", "story", "game", "trivia", "quote", "all"],
                "description": "娱乐类型：joke(笑话), story(故事), game(游戏), trivia(冷知识), quote(名言), all(全部)"
            },
            "mood": {
                "type": "string",
                "enum": ["happy", "sad", "tired", "stressed", "neutral"],
                "description": "用户当前情绪"
            },
            "action": {
                "type": "string",
                "enum": ["share", "play", "relax", "cheer"],
                "default": "share",
                "description": "操作类型：share(分享), play(游戏), relax(放松), cheer(开心)"
            }
        },
        "required": ["entertainmentType"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的轻松娱乐"
    }',
    '娱乐,放松,开心,笑话,轻松,趣味,放松心情',
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
    'light_entertainment',
    2,
    '## 轻松娱乐技能使用说明

### 功能描述
轻松娱乐技能提供轻松愉快的娱乐内容，帮助用户放松和开心，营造轻松愉快的氛围。

### 核心功能
1. **内容分享**：分享轻松愉快的娱乐内容
2. **氛围营造**：营造轻松愉快的氛围
3. **心情调节**：帮助调节心情
4. **放松提供**：提供放松和娱乐
5. **开心传递**：传递开心和快乐

### 参数说明
- **entertainmentType** (必填): 娱乐类型
  - `joke`: 笑话
  - `story`: 有趣故事
  - `game`: 小游戏
  - `trivia`: 冷知识
  - `quote`: 名言警句
  - `all`: 全部类型
- **mood** (可选): 用户当前情绪
- **action** (可选): 操作类型
  - `share`: 分享内容
  - `play`: 玩游戏
  - `relax`: 放松
  - `cheer`: 开心

### 使用场景
- 想要放松和开心
- 需要轻松愉快的氛围
- 想要调节心情
- 需要娱乐内容

### 执行流程
1. 了解用户的情绪和需求
2. 选择合适的娱乐内容
3. 分享轻松愉快的娱乐内容
4. 营造轻松愉快的氛围
5. 帮助用户放松和开心
6. 传递开心和快乐

### 返回格式
```json
{
  "success": true,
  "action": "share",
  "entertainmentType": "joke",
  "content": {
    "type": "joke",
    "text": "为什么程序员总是分不清万圣节和圣诞节？因为 Oct 31 = Dec 25",
    "explanation": "八进制31等于十进制25"
  },
  "mood": "happy",
  "response": "哈哈，这个笑话怎么样？希望让你开心一点！",
  "followUp": "还想听更多笑话吗？"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 绑定技能到暖小阳角色
-- ============================================

-- 获取暖小阳的角色ID
SET @character_id = (SELECT id FROM system_characters WHERE name = '暖小阳' LIMIT 1);

-- 绑定技能5：鼓励与支持
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
    'encouragement_support',
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

-- 绑定技能6：轻松娱乐
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
    'light_entertainment',
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
WHERE skill_id IN ('encouragement_support', 'light_entertainment')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('encouragement_support', 'light_entertainment')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('encouragement_support', 'light_entertainment')
    AND character_id = @character_id;
