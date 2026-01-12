-- 学小知技能定义 - 第四部分（技能7-8）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_14_part2__create_learning_skills_part4.sql
-- 
-- 说明：本文件包含学小知的第7-8个技能
-- 7. 知识复习提醒（Knowledge Review Reminder）
-- 8. 学习资源推荐（Learning Resource Recommendation）

SET NAMES utf8mb4;

-- ============================================
-- 技能7：知识复习提醒（Knowledge Review Reminder）
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
    'knowledge_review_reminder',
    '知识复习提醒',
    '基于艾宾浩斯遗忘曲线，在最佳时间提醒用户复习已学知识。帮助用户科学安排复习时间，提高记忆保持率，巩固学习效果。',
    'life',
    'PASSIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "knowledge": {
                "type": "string",
                "description": "需要复习的知识点"
            },
            "learnedDate": {
                "type": "string",
                "format": "date",
                "description": "学习日期（ISO格式：YYYY-MM-DD）"
            },
            "reviewSchedule": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "reviewDate": {"type": "string", "format": "date"},
                        "reviewType": {"type": "string", "enum": ["first", "second", "third", "fourth", "fifth"]}
                    }
                },
                "description": "复习计划"
            },
            "action": {
                "type": "string",
                "enum": ["schedule", "remind", "review", "update"],
                "default": "schedule",
                "description": "操作类型：schedule(安排), remind(提醒), review(复习), update(更新)"
            }
        },
        "required": ["knowledge", "learnedDate"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的知识复习提醒"
    }',
    '复习,遗忘曲线,知识复习,记忆保持,复习提醒,学习巩固',
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
    'knowledge_review_reminder',
    2,
    '## 知识复习提醒技能使用说明

### 功能描述
知识复习提醒技能基于艾宾浩斯遗忘曲线，在最佳时间提醒用户复习已学知识，帮助用户科学安排复习时间，提高记忆保持率。

### 核心功能
1. **复习计划**：根据遗忘曲线制定复习计划
2. **时间提醒**：在最佳时间提醒用户复习
3. **复习执行**：引导用户进行复习
4. **效果评估**：评估复习效果
5. **计划调整**：根据复习效果调整计划
6. **长期追踪**：长期追踪知识掌握情况

### 参数说明
- **knowledge** (必填): 需要复习的知识点
- **learnedDate** (必填): 学习日期（ISO格式）
- **reviewSchedule** (可选): 复习计划
- **action** (可选): 操作类型
  - `schedule`: 安排复习计划
  - `remind`: 提醒复习
  - `review`: 进行复习
  - `update`: 更新计划

### 使用场景
- 想要科学安排复习时间
- 需要复习提醒
- 想要提高记忆保持率
- 需要巩固学习效果

### 执行流程
1. 记录用户学习的新知识
2. 根据艾宾浩斯遗忘曲线制定复习计划
3. 在最佳时间提醒用户复习
4. 引导用户进行复习
5. 评估复习效果
6. 根据效果调整复习计划
7. 长期追踪知识掌握情况

### 艾宾浩斯遗忘曲线
- **第1次复习**：学习后1天
- **第2次复习**：学习后3天
- **第3次复习**：学习后7天
- **第4次复习**：学习后15天
- **第5次复习**：学习后30天

### 返回格式
```json
{
  "success": true,
  "action": "schedule",
  "knowledge": "Python函数",
  "learnedDate": "2025-01-01",
  "reviewSchedule": [
    {"reviewDate": "2025-01-02", "reviewType": "first", "daysAfter": 1},
    {"reviewDate": "2025-01-04", "reviewType": "second", "daysAfter": 3},
    {"reviewDate": "2025-01-08", "reviewType": "third", "daysAfter": 7},
    {"reviewDate": "2025-01-16", "reviewType": "fourth", "daysAfter": 15},
    {"reviewDate": "2025-01-31", "reviewType": "fifth", "daysAfter": 30}
  ],
  "nextReview": {
    "date": "2025-01-02",
    "type": "first",
    "reminder": "明天记得复习Python函数"
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
-- 技能8：学习资源推荐（Learning Resource Recommendation）
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
    'learning_resource_recommendation',
    '学习资源推荐',
    '根据用户的学习目标和水平，推荐合适的学习资源。包括书籍、课程、视频、文章、工具等，帮助用户找到最适合的学习材料。',
    'life',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "learningGoal": {
                "type": "string",
                "description": "学习目标"
            },
            "currentLevel": {
                "type": "string",
                "enum": ["beginner", "intermediate", "advanced"],
                "description": "当前水平：beginner(初级), intermediate(中级), advanced(高级)"
            },
            "resourceType": {
                "type": "string",
                "enum": ["book", "course", "video", "article", "tool", "all"],
                "description": "资源类型：book(书籍), course(课程), video(视频), article(文章), tool(工具), all(全部)"
            },
            "preferences": {
                "type": "array",
                "items": {
                    "type": "string"
                },
                "description": "偏好（如：中文、免费、实践性强等）"
            },
            "action": {
                "type": "string",
                "enum": ["recommend", "search", "filter", "evaluate"],
                "default": "recommend",
                "description": "操作类型：recommend(推荐), search(搜索), filter(筛选), evaluate(评价)"
            }
        },
        "required": ["learningGoal"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的学习资源推荐"
    }',
    '学习资源,书籍推荐,课程推荐,学习材料,学习资料,资源推荐',
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
    'learning_resource_recommendation',
    2,
    '## 学习资源推荐技能使用说明

### 功能描述
学习资源推荐技能根据用户的学习目标和水平，推荐合适的学习资源，帮助用户找到最适合的学习材料。

### 核心功能
1. **需求分析**：分析用户的学习需求和目标
2. **水平评估**：评估用户的当前水平
3. **资源推荐**：推荐合适的学习资源
4. **资源筛选**：根据偏好筛选资源
5. **资源评价**：评价资源的质量和适用性
6. **学习路径**：提供学习路径建议

### 参数说明
- **learningGoal** (必填): 学习目标
- **currentLevel** (可选): 当前水平
- **resourceType** (可选): 资源类型
  - `book`: 书籍
  - `course`: 课程
  - `video`: 视频
  - `article`: 文章
  - `tool`: 工具
  - `all`: 全部类型
- **preferences** (可选): 偏好数组
- **action** (可选): 操作类型
  - `recommend`: 推荐资源
  - `search`: 搜索资源
  - `filter`: 筛选资源
  - `evaluate`: 评价资源

### 使用场景
- 想要学习新知识但不知道从哪里开始
- 需要找到合适的学习资源
- 想要根据水平选择资源
- 需要学习路径指导

### 执行流程
1. 了解用户的学习目标和需求
2. 评估用户的当前水平
3. 根据目标和水平推荐合适的学习资源
4. 根据用户偏好筛选资源
5. 评价资源的质量和适用性
6. 提供学习路径建议
7. 帮助用户选择最适合的资源

### 资源类型
- **书籍**：系统性强，适合深入学习
- **课程**：结构化学习，有指导
- **视频**：直观易懂，适合入门
- **文章**：快速了解，适合补充
- **工具**：实践性强，适合应用

### 返回格式
```json
{
  "success": true,
  "action": "recommend",
  "learningGoal": "学习Python编程",
  "currentLevel": "beginner",
  "recommendedResources": [
    {
      "type": "book",
      "name": "Python编程：从入门到实践",
      "level": "beginner",
      "description": "适合初学者的Python入门书籍",
      "rating": 4.8,
      "language": "中文"
    },
    {
      "type": "course",
      "name": "Python基础课程",
      "level": "beginner",
      "description": "系统学习Python基础",
      "rating": 4.6,
      "platform": "在线平台",
      "price": "免费"
    },
    {
      "type": "video",
      "name": "Python入门视频教程",
      "level": "beginner",
      "description": "视频讲解，直观易懂",
      "rating": 4.7,
      "duration": "10小时"
    }
  ],
  "learningPath": [
    "第一步：阅读入门书籍，了解基础概念",
    "第二步：观看视频教程，加深理解",
    "第三步：完成课程练习，巩固知识",
    "第四步：做项目实践，应用所学"
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
-- 绑定技能到学小知角色
-- ============================================

-- 获取学小知的角色ID
SET @character_id = (SELECT id FROM system_characters WHERE name = '学小知' LIMIT 1);

-- 绑定技能7：知识复习提醒
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
    'knowledge_review_reminder',
    true,
    true,
    7,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 绑定技能8：学习资源推荐
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
    'learning_resource_recommendation',
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
WHERE skill_id IN ('knowledge_review_reminder', 'learning_resource_recommendation')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('knowledge_review_reminder', 'learning_resource_recommendation')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('knowledge_review_reminder', 'learning_resource_recommendation')
    AND character_id = @character_id;
