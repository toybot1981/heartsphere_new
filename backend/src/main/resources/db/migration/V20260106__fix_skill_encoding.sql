-- 修复技能数据编码问题
-- 重新插入所有预置技能，确保使用UTF-8编码

-- 1. 修复测试技能
UPDATE skill_definitions SET
    name = '测试技能',
    description = '这是一个简单的测试技能，用于验证技能系统的基本功能。可以接收用户输入并返回处理结果。'
WHERE skill_id = 'test-skill';

-- 2. 修复CBT认知重构技能
UPDATE skill_definitions SET
    name = 'CBT认知重构',
    description = '认知行为疗法核心技能 - 帮助识别、评估和重构负面思维模式，包括自动思维识别、认知扭曲检测、证据评估和思维重构'
WHERE skill_id = 'cbt-cognitive-restructuring';

-- 3. 修复CBT行为激活技能
UPDATE skill_definitions SET
    name = 'CBT行为激活',
    description = '认知行为疗法核心技能 - 通过增加积极活动来改善情绪，包括活动监控、活动计划、活动执行和效果评估'
WHERE skill_id = 'cbt-behavioral-activation';

-- 4. 修复危机干预技能（如果存在）
UPDATE skill_definitions SET
    name = '危机干预',
    description = '危机干预工具 - 评估风险、制定干预方案、提供应急指导'
WHERE skill_id = 'crisis-intervention';

-- 5. 修复技能指令中的中文内容
UPDATE skill_instructions SET
    instruction_text = REPLACE(instruction_text, 'æµ‹è¯•', '测试'),
    instruction_text = REPLACE(instruction_text, 'æŠ€èƒ½', '技能'),
    instruction_text = REPLACE(instruction_text, 'è®¤çŸ¥', '认知'),
    instruction_text = REPLACE(instruction_text, 'è¡Œä¸°', '行为'),
    instruction_text = REPLACE(instruction_text, 'æ¿€æ´»', '激活'),
    instruction_text = REPLACE(instruction_text, 'é æž„', '重构')
WHERE instruction_text LIKE '%æ%' OR instruction_text LIKE '%è%' OR instruction_text LIKE '%é%';

-- 6. 修复技能资源中的中文内容
UPDATE skill_resources SET
    resource_name = REPLACE(resource_name, 'æµ‹è¯•', '测试'),
    resource_name = REPLACE(resource_name, 'æŠ€èƒ½', '技能'),
    resource_content = REPLACE(resource_content, 'æµ‹è¯•', '测试'),
    resource_content = REPLACE(resource_content, 'æŠ€èƒ½', '技能')
WHERE resource_name LIKE '%æ%' OR resource_content LIKE '%æ%';
