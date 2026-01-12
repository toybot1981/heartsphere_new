-- 暖小阳技能定义 - 第二部分（技能3-4）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_25_part2__create_emotional_companion_skills_part2.sql
-- 
-- 说明：本文件包含暖小阳的第3-4个技能
-- 3. 兴趣分享（Interest Sharing）
-- 4. 生活故事分享（Life Story Sharing）

SET NAMES utf8mb4;

-- ============================================
-- 技能3：兴趣分享（Interest Sharing）
-- ============================================

-- 3.1 插入技能定义（Level 1）
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
    'interest_sharing',
    '兴趣分享',
    '分享和讨论共同的兴趣爱好，推荐有趣内容。了解用户的兴趣爱好，分享相关内容，推荐有趣的活动、资源等，创造共同话题。',
    'social',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "interest": {
                "type": "string",
                "description": "兴趣爱好"
            },
            "interestType": {
                "type": "string",
                "enum": ["hobby", "music", "movie", "book", "sport", "travel", "food", "other"],
                "description": "兴趣类型：hobby(爱好), music(音乐), movie(电影), book(书籍), sport(运动), travel(旅行), food(美食), other(其他)"
            },
            "action": {
                "type": "string",
                "enum": ["share", "discuss", "recommend", "explore"],
                "default": "share",
                "description": "操作类型：share(分享), discuss(讨论), recommend(推荐), explore(探索)"
            }
        },
        "required": ["interest"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的兴趣分享"
    }',
    '兴趣,爱好,分享,推荐,共同话题,兴趣爱好',
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

-- 3.2 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    trigger_condition,
    execution_order,
    created_at
) VALUES (
    'interest_sharing',
    2,
    '## 兴趣分享技能使用说明

### 功能描述
兴趣分享技能帮助用户分享和讨论兴趣爱好，推荐有趣内容，创造共同话题，增强情感连接。

### 核心功能
1. **兴趣了解**：了解用户的兴趣爱好
2. **内容分享**：分享相关的兴趣内容
3. **话题讨论**：讨论共同的兴趣爱好
4. **内容推荐**：推荐有趣的活动、资源等
5. **兴趣探索**：探索新的兴趣爱好
6. **共同话题**：创造共同话题

### 参数说明
- **interest** (必填): 兴趣爱好
- **interestType** (可选): 兴趣类型
  - `hobby`: 爱好
  - `music`: 音乐
  - `movie`: 电影
  - `book`: 书籍
  - `sport`: 运动
  - `travel`: 旅行
  - `food`: 美食
  - `other`: 其他
- **action** (可选): 操作类型
  - `share`: 分享兴趣
  - `discuss`: 讨论兴趣
  - `recommend`: 推荐内容
  - `explore`: 探索新兴趣

### 使用场景
- 想要分享兴趣爱好
- 需要有人讨论兴趣
- 想要发现新的兴趣
- 需要推荐有趣内容

### 执行流程
1. 了解用户的兴趣爱好
2. 分享相关的兴趣内容
3. 讨论共同的兴趣爱好
4. 推荐有趣的活动、资源等
5. 探索新的兴趣爱好
6. 创造共同话题

### 返回格式
```json
{
  "success": true,
  "action": "share",
  "interest": "摄影",
  "interestType": "hobby",
  "sharing": "我也很喜欢摄影！你最喜欢拍什么类型的照片？",
  "discussion": "摄影是很好的记录生活的方式，可以捕捉美好的瞬间",
  "recommendations": [
    {"type": "book", "name": "摄影构图技巧", "description": "学习摄影构图的好书"},
    {"type": "activity", "name": "参加摄影展", "description": "可以欣赏和学习"}
  ],
  "commonTopics": ["摄影技巧", "拍摄地点", "后期处理"]
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 技能4：生活故事分享（Life Story Sharing）
-- ============================================

-- 4.1 插入技能定义（Level 1）
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
    'life_story_sharing',
    '生活故事分享',
    '分享生活中的故事和经历，创造共同回忆。倾听用户的生活故事，分享相关的故事，创造情感连接，建立深厚的友谊。',
    'social',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "story": {
                "type": "string",
                "description": "用户分享的故事"
            },
            "storyType": {
                "type": "string",
                "enum": ["childhood", "school", "work", "travel", "relationship", "achievement", "other"],
                "description": "故事类型：childhood(童年), school(学校), work(工作), travel(旅行), relationship(关系), achievement(成就), other(其他)"
            },
            "action": {
                "type": "string",
                "enum": ["share", "listen", "respond", "relate"],
                "default": "share",
                "description": "操作类型：share(分享), listen(倾听), respond(回应), relate(关联)"
            }
        },
        "required": ["story"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的生活故事分享"
    }',
    '故事,回忆,分享,经历,生活故事,共同回忆',
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

-- 4.2 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    trigger_condition,
    execution_order,
    created_at
) VALUES (
    'life_story_sharing',
    2,
    '## 生活故事分享技能使用说明

### 功能描述
生活故事分享技能帮助用户分享生活中的故事和经历，创造共同回忆，建立深厚的情感连接。

### 核心功能
1. **故事倾听**：认真倾听用户的生活故事
2. **故事回应**：给予积极的回应和理解
3. **故事分享**：分享相关的故事
4. **情感共鸣**：产生情感共鸣
5. **回忆创造**：创造共同回忆
6. **关系建立**：建立深厚的友谊

### 参数说明
- **story** (必填): 用户分享的故事
- **storyType** (可选): 故事类型
  - `childhood`: 童年故事
  - `school`: 学校故事
  - `work`: 工作故事
  - `travel`: 旅行故事
  - `relationship`: 关系故事
  - `achievement`: 成就故事
  - `other`: 其他故事
- **action** (可选): 操作类型
  - `share`: 分享故事
  - `listen`: 倾听故事
  - `respond`: 回应故事
  - `relate`: 关联故事

### 使用场景
- 想要分享生活故事
- 需要有人倾听
- 想要创造共同回忆
- 需要情感连接

### 执行流程
1. 认真倾听用户的生活故事
2. 给予积极的回应和理解
3. 分享相关的故事
4. 产生情感共鸣
5. 创造共同回忆
6. 建立深厚的友谊

### 返回格式
```json
{
  "success": true,
  "action": "respond",
  "storyType": "childhood",
  "response": "这个故事真有趣！能感受到你童年的快乐",
  "relate": "我也有类似的经历，小时候也喜欢...",
  "emotion": "warm",
  "connection": "这些回忆真的很珍贵，感谢你分享给我",
  "followUp": "你还想分享其他故事吗？"
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

-- 绑定技能3：兴趣分享
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
    'interest_sharing',
    true,
    false,
    3,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 绑定技能4：生活故事分享
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
    'life_story_sharing',
    true,
    false,
    4,
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
WHERE skill_id IN ('interest_sharing', 'life_story_sharing')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('interest_sharing', 'life_story_sharing')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('interest_sharing', 'life_story_sharing')
    AND character_id = @character_id;
