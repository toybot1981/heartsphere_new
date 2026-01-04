-- 插入示例 Skill 定义
-- 展示如何结合 Claude Skill 规范定义心域角色技能

SET @sword_skill_id = 'combat_sword_mastery';
SET @fireball_skill_id = 'magic_fireball';
SET @heal_skill_id = 'magic_heal';

-- 1. 战斗技能 - 剑术精通
INSERT INTO skill_definitions (
    skill_id, name, description, category, skill_type, max_level, base_value
) VALUES (
    @sword_skill_id,
    '剑术精通',
    '提高角色的近战攻击能力和剑类武器的使用熟练度。每级增加 2% 的近战攻击力。',
    'combat',
    'PASSIVE',
    100,
    0
);

-- Level 1 指令（元数据）
INSERT INTO skill_instructions (skill_id, instruction_level, instruction_text, execution_order)
VALUES (
    @sword_skill_id,
    1,
    '技能名称：剑术精通\n技能类型：被动技能\n技能分类：战斗技能\n最大等级：100',
    1
);

-- Level 2 指令（详细效果）
INSERT INTO skill_instructions (skill_id, instruction_level, instruction_text, trigger_condition, execution_order)
VALUES (
    @sword_skill_id,
    2,
    '## 技能效果\n- 每级增加 2% 的近战攻击力\n- 每10级解锁新的剑技\n- 等级50以上可以使用高级剑术\n- 等级70以上解锁终极技能',
    '{"trigger": "skill_activated", "minLevel": 1}',
    2
);

-- Level 3 指令（高级效果）
INSERT INTO skill_instructions (skill_id, instruction_level, instruction_text, trigger_condition, execution_order)
VALUES (
    @sword_skill_id,
    3,
    '## 高级效果（等级50+）\n- 解锁"二连斩"技能\n- 攻击速度提升 15%\n- 可以格挡敌人的攻击\n- 减少受到的物理伤害 10%',
    '{"trigger": "skill_level_up", "level": 50}',
    3
);

-- Level 3 资源 - 伤害计算模板
INSERT INTO skill_resources (skill_id, resource_type, resource_name, resource_content, resource_order)
VALUES (
    @sword_skill_id,
    'template',
    'damage_calculation',
    '{"formula": "baseDamage * (1 + skillLevel * 0.02)", "maxLevel": 100, "description": "根据技能等级计算攻击力加成"}',
    1
);

-- Level 3 资源 - 解锁等级配置
INSERT INTO skill_resources (skill_id, resource_type, resource_name, resource_content, resource_order)
VALUES (
    @sword_skill_id,
    'config',
    'unlock_levels',
    '{"unlockLevels": [10, 20, 30, 40, 50, 70, 100], "descriptions": {"10": "解锁基础剑技", "50": "解锁高级剑术", "70": "解锁终极技能"}}',
    2
);

-- Level 3 资源 - 计算脚本示例
INSERT INTO skill_resources (skill_id, resource_type, resource_name, resource_content, resource_order)
VALUES (
    @sword_skill_id,
    'example',
    'usage_example',
    '当角色使用剑类武器攻击时，根据剑术精通等级计算最终伤害值。例如：基础伤害100，技能等级50，最终伤害 = 100 * (1 + 50 * 0.02) = 200。',
    3
);

-- 2. 魔法技能 - 火球术
INSERT INTO skill_definitions (
    skill_id, name, description, category, skill_type, max_level, base_value
) VALUES (
    @fireball_skill_id,
    '火球术',
    '发射火球对敌人造成火焰伤害。基础伤害：50 + (等级 * 2)，可以点燃目标造成持续伤害。',
    'magic',
    'ACTIVE',
    100,
    0
);

-- Level 1 指令
INSERT INTO skill_instructions (skill_id, instruction_level, instruction_text, execution_order)
VALUES (
    @fireball_skill_id,
    1,
    '技能名称：火球术\n技能类型：主动技能\n技能分类：魔法技能\n消耗：MP 20\n冷却时间：3秒',
    1
);

-- Level 2 指令
INSERT INTO skill_instructions (skill_id, instruction_level, instruction_text, trigger_condition, execution_order)
VALUES (
    @fireball_skill_id,
    2,
    '## 技能效果\n- 基础伤害：50 + (等级 * 2)\n- 攻击范围：单个目标\n- 冷却时间：3秒\n- 可以点燃目标，造成持续伤害（每秒 5 点，持续 3 秒）',
    '{"trigger": "skill_activated", "minLevel": 1}',
    2
);

-- Level 3 指令（高级效果）
INSERT INTO skill_instructions (skill_id, instruction_level, instruction_text, trigger_condition, execution_order)
VALUES (
    @fireball_skill_id,
    3,
    '## 高级效果（等级70+）\n- 解锁"爆裂火球"，可以攻击多个目标\n- 伤害提升 50%\n- 冷却时间减少到 2秒\n- 点燃效果增强（每秒 10 点，持续 5 秒）',
    '{"trigger": "skill_level_up", "level": 70}',
    3
);

-- Level 3 资源 - 伤害计算模板
INSERT INTO skill_resources (skill_id, resource_type, resource_name, resource_content, resource_order)
VALUES (
    @fireball_skill_id,
    'template',
    'damage_calculation',
    '{"formula": "50 + (skillLevel * 2)", "burnDamage": 5, "burnDuration": 3, "advancedFormula": "(50 + skillLevel * 2) * 1.5"}',
    1
);

-- 3. 魔法技能 - 治疗术
INSERT INTO skill_definitions (
    skill_id, name, description, category, skill_type, max_level, base_value
) VALUES (
    @heal_skill_id,
    '治疗术',
    '恢复目标的生命值。基础治疗量：30 + (等级 * 1.5)，可以治疗自己和队友。',
    'magic',
    'ACTIVE',
    100,
    0
);

-- Level 1 指令
INSERT INTO skill_instructions (skill_id, instruction_level, instruction_text, execution_order)
VALUES (
    @heal_skill_id,
    1,
    '技能名称：治疗术\n技能类型：主动技能\n技能分类：魔法技能\n消耗：MP 15\n冷却时间：2秒',
    1
);

-- Level 2 指令
INSERT INTO skill_instructions (skill_id, instruction_level, instruction_text, trigger_condition, execution_order)
VALUES (
    @heal_skill_id,
    2,
    '## 技能效果\n- 基础治疗量：30 + (等级 * 1.5)\n- 治疗范围：单个目标（自己或队友）\n- 冷却时间：2秒\n- 可以移除负面状态（等级50+）',
    '{"trigger": "skill_activated", "minLevel": 1}',
    2
);

-- Level 3 资源 - 治疗量计算模板
INSERT INTO skill_resources (skill_id, resource_type, resource_name, resource_content, resource_order)
VALUES (
    @heal_skill_id,
    'template',
    'heal_calculation',
    '{"formula": "30 + (skillLevel * 1.5)", "canRemoveDebuff": true, "minLevelForDebuff": 50}',
    1
);

-- 4. 技能树关系（示例）
-- 剑术精通是基础战斗技能，解锁其他高级剑技的前置条件
INSERT INTO skill_tree (parent_skill_id, child_skill_id, unlock_level, prerequisite_skill_id, required_level)
VALUES (
    @sword_skill_id,
    'combat_sword_ultimate',  -- 假设的终极技能
    70,
    @sword_skill_id,
    70
);
