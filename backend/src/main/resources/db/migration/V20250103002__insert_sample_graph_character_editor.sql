-- 插入示例 Graph：角色编辑流程
-- 这是一个实用的案例，展示角色创建、属性设置、技能配置等完整流程

SET @graph_id = NULL;

-- 1. 创建 Graph 定义
INSERT INTO graph_definitions (name, description, graph_type, start_node_id, is_active, version, created_by)
VALUES (
    '角色编辑示例 - 创建新角色',
    '这是一个角色编辑的完整示例，展示了角色创建流程。包含：角色信息输入、属性设置、技能配置、外观定制、确认保存等步骤。',
    'SCRIPT',
    'start_char_1',
    true,
    1,
    NULL
);

-- 获取刚插入的 Graph ID
SET @graph_id = LAST_INSERT_ID();

-- 2. 创建节点（按流程顺序，位置合理分布）

-- Start 节点
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'start_char_1',
    'start',
    '{"name": "开始创建角色", "description": "角色创建流程开始"}',
    100.0,
    50.0,
    1
);

-- Dialogue 节点 - 欢迎信息
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_1',
    'dialogue',
    '{"content": "欢迎来到角色创建系统！让我们开始创建你的角色吧。", "speaker": "系统", "description": "欢迎信息"}',
    100.0,
    200.0,
    2
);

-- Dialogue 节点 - 角色名称输入提示
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_2',
    'dialogue',
    '{"content": "首先，请输入你的角色名称。", "speaker": "系统", "description": "提示输入角色名称"}',
    100.0,
    350.0,
    3
);

-- Wait 节点 - 等待用户输入角色名称
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'wait_char_1',
    'wait',
    '{"waitType": "USER_INPUT", "waitCondition": "characterName", "timeout": 60000, "description": "等待用户输入角色名称"}',
    100.0,
    500.0,
    4
);

-- Condition 节点 - 验证角色名称
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'condition_char_1',
    'condition',
    '{"condition": "characterName != null && characterName.length() >= 2 && characterName.length() <= 20", "description": "验证角色名称是否有效"}',
    100.0,
    650.0,
    5
);

-- Dialogue 节点 - 名称验证失败
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_3',
    'dialogue',
    '{"content": "角色名称无效，请重新输入（2-20个字符）。", "speaker": "系统", "description": "名称验证失败提示"}',
    300.0,
    650.0,
    6
);

-- Dialogue 节点 - 选择角色职业
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_4',
    'dialogue',
    '{"content": "很好！现在请选择你的角色职业。", "speaker": "系统", "description": "提示选择职业"}',
    100.0,
    800.0,
    7
);

-- Choice 节点 - 职业选择
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'choice_char_1',
    'choice',
    '{"prompt": "选择你的职业：", "options": [{"id": "warrior", "text": "战士 - 高生命值，近战攻击", "effects": {"baseHealth": 100, "baseAttack": 15, "baseDefense": 10}}, {"id": "mage", "text": "法师 - 高魔法值，远程攻击", "effects": {"baseHealth": 60, "baseMana": 100, "baseAttack": 20, "baseDefense": 5}}, {"id": "rogue", "text": "盗贼 - 高敏捷，暴击伤害", "effects": {"baseHealth": 70, "baseAgility": 20, "baseAttack": 18, "baseDefense": 8}}, {"id": "priest", "text": "牧师 - 治疗能力，辅助技能", "effects": {"baseHealth": 80, "baseMana": 80, "baseHealing": 15, "baseDefense": 7}}], "description": "职业选择"}',
    100.0,
    950.0,
    8
);

-- State Change 节点 - 应用职业属性
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_char_1',
    'state_change',
    '{"changes": {"characterClass": "{{selectedClass}}", "baseAttributes": "{{classAttributes}}"}, "description": "应用职业属性"}',
    100.0,
    1100.0,
    9
);

-- Dialogue 节点 - 技能配置提示
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_5',
    'dialogue',
    '{"content": "现在让我们配置你的初始技能点。", "speaker": "系统", "description": "技能配置提示"}',
    100.0,
    1250.0,
    10
);

-- Skill Check 节点 - 技能点分配
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'skill_check_char_1',
    'skill_check',
    '{"skill": "skillPoints", "difficulty": 10, "availablePoints": 20, "skills": ["strength", "intelligence", "agility", "vitality"], "successEffects": {"skillPointsAllocated": true}, "failureEffects": {}, "description": "分配技能点"}',
    100.0,
    1400.0,
    11
);

-- State Change 节点 - 保存技能点分配
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_char_2',
    'state_change',
    '{"changes": {"skills": "{{allocatedSkills}}", "skillPointsUsed": "{{skillPointsUsed}}"}, "description": "保存技能点分配"}',
    100.0,
    1550.0,
    12
);

-- Dialogue 节点 - 外观定制提示
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_6',
    'dialogue',
    '{"content": "最后，让我们定制你的角色外观。", "speaker": "系统", "description": "外观定制提示"}',
    100.0,
    1700.0,
    13
);

-- Choice 节点 - 外观选择
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'choice_char_2',
    'choice',
    '{"prompt": "选择角色外观风格：", "options": [{"id": "classic", "text": "经典风格", "effects": {"appearanceStyle": "classic"}}, {"id": "modern", "text": "现代风格", "effects": {"appearanceStyle": "modern"}}, {"id": "fantasy", "text": "奇幻风格", "effects": {"appearanceStyle": "fantasy"}}, {"id": "random", "text": "随机生成", "effects": {"appearanceStyle": "random"}}], "description": "外观选择"}',
    100.0,
    1850.0,
    14
);

-- State Change 节点 - 应用外观
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_char_3',
    'state_change',
    '{"changes": {"appearance": "{{selectedAppearance}}", "avatarUrl": "{{generatedAvatarUrl}}"}, "description": "应用外观设置"}',
    100.0,
    2000.0,
    15
);

-- Dialogue 节点 - 确认信息
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_7',
    'dialogue',
    '{"content": "角色信息已配置完成！请确认是否保存。", "speaker": "系统", "description": "确认保存提示"}',
    100.0,
    2150.0,
    16
);

-- Choice 节点 - 确认保存
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'choice_char_3',
    'choice',
    '{"prompt": "确认保存角色？", "options": [{"id": "confirm", "text": "确认保存", "effects": {}}, {"id": "cancel", "text": "取消，重新编辑", "effects": {}}, {"id": "preview", "text": "预览角色信息", "effects": {}}], "description": "确认保存"}',
    100.0,
    2300.0,
    17
);

-- Condition 节点 - 判断用户选择
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'condition_char_2',
    'condition',
    '{"condition": "userChoice == \"confirm\"", "description": "判断是否确认保存"}',
    100.0,
    2450.0,
    18
);

-- State Change 节点 - 保存角色到数据库
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_char_4',
    'state_change',
    '{"changes": {"characterCreated": true, "characterId": "{{generatedCharacterId}}", "createdAt": "{{currentTimestamp}}"}, "description": "保存角色到数据库"}',
    100.0,
    2600.0,
    19
);

-- Dialogue 节点 - 保存成功
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_8',
    'dialogue',
    '{"content": "角色创建成功！欢迎来到游戏世界！", "speaker": "系统", "description": "创建成功提示"}',
    100.0,
    2750.0,
    20
);

-- Dialogue 节点 - 预览角色信息
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_9',
    'dialogue',
    '{"content": "角色名称：{{characterName}}\\n职业：{{characterClass}}\\n属性：{{characterAttributes}}\\n技能：{{characterSkills}}\\n外观：{{appearanceStyle}}", "speaker": "系统", "description": "显示角色预览信息"}',
    300.0,
    2450.0,
    21
);

-- Dialogue 节点 - 取消保存
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_10',
    'dialogue',
    '{"content": "已取消保存，你可以重新编辑角色信息。", "speaker": "系统", "description": "取消保存提示"}',
    300.0,
    2300.0,
    22
);

-- End 节点 - 创建成功
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'end_char_1',
    'end',
    '{"result": "角色创建成功", "description": "角色创建流程成功结束"}',
    100.0,
    2900.0,
    23
);

-- End 节点 - 取消创建
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'end_char_2',
    'end',
    '{"result": "角色创建已取消", "description": "用户取消创建流程"}',
    300.0,
    2450.0,
    24
);

-- 3. 创建连线（连接节点，形成完整的流程）

-- Start -> Dialogue 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'start_char_1',
    'dialogue_char_1',
    'default',
    '',
    1
);

-- Dialogue 1 -> Dialogue 2
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_1',
    'dialogue_char_2',
    'default',
    '',
    2
);

-- Dialogue 2 -> Wait 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_2',
    'wait_char_1',
    'default',
    '',
    3
);

-- Wait 1 -> Condition 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'wait_char_1',
    'condition_char_1',
    'default',
    '',
    4
);

-- Condition 1 -> Dialogue 3 (false分支 - 名称无效)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'condition_char_1',
    'dialogue_char_3',
    'condition',
    '无效',
    '{"condition": "false"}',
    5
);

-- Condition 1 -> Dialogue 4 (true分支 - 名称有效)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'condition_char_1',
    'dialogue_char_4',
    'condition',
    '有效',
    '{"condition": "true"}',
    6
);

-- Dialogue 3 -> Wait 1 (重新输入)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_3',
    'wait_char_1',
    'default',
    '',
    7
);

-- Dialogue 4 -> Choice 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_4',
    'choice_char_1',
    'default',
    '',
    8
);

-- Choice 1 -> State Change 1 (所有职业选择都到这里)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_char_1',
    'state_change_char_1',
    'condition',
    '战士',
    '{"choiceId": "warrior"}',
    9
);

INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_char_1',
    'state_change_char_1',
    'condition',
    '法师',
    '{"choiceId": "mage"}',
    10
);

INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_char_1',
    'state_change_char_1',
    'condition',
    '盗贼',
    '{"choiceId": "rogue"}',
    11
);

INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_char_1',
    'state_change_char_1',
    'condition',
    '牧师',
    '{"choiceId": "priest"}',
    12
);

-- State Change 1 -> Dialogue 5
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'state_change_char_1',
    'dialogue_char_5',
    'default',
    '',
    13
);

-- Dialogue 5 -> Skill Check 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_5',
    'skill_check_char_1',
    'default',
    '',
    14
);

-- Skill Check 1 -> State Change 2
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'skill_check_char_1',
    'state_change_char_2',
    'default',
    '',
    15
);

-- State Change 2 -> Dialogue 6
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'state_change_char_2',
    'dialogue_char_6',
    'default',
    '',
    16
);

-- Dialogue 6 -> Choice 2
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_6',
    'choice_char_2',
    'default',
    '',
    17
);

-- Choice 2 -> State Change 3 (所有外观选择都到这里)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_char_2',
    'state_change_char_3',
    'condition',
    '经典',
    '{"choiceId": "classic"}',
    18
);

INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_char_2',
    'state_change_char_3',
    'condition',
    '现代',
    '{"choiceId": "modern"}',
    19
);

INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_char_2',
    'state_change_char_3',
    'condition',
    '奇幻',
    '{"choiceId": "fantasy"}',
    20
);

INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_char_2',
    'state_change_char_3',
    'condition',
    '随机',
    '{"choiceId": "random"}',
    21
);

-- State Change 3 -> Dialogue 7
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'state_change_char_3',
    'dialogue_char_7',
    'default',
    '',
    22
);

-- Dialogue 7 -> Choice 3
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_7',
    'choice_char_3',
    'default',
    '',
    23
);

-- Choice 3 -> Condition 2 (确认保存)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_char_3',
    'condition_char_2',
    'condition',
    '确认',
    '{"choiceId": "confirm"}',
    24
);

-- Choice 3 -> Dialogue 9 (预览)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_char_3',
    'dialogue_char_9',
    'condition',
    '预览',
    '{"choiceId": "preview"}',
    25
);

-- Choice 3 -> Dialogue 10 (取消)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_char_3',
    'dialogue_char_10',
    'condition',
    '取消',
    '{"choiceId": "cancel"}',
    26
);

-- Condition 2 -> State Change 4 (true分支 - 确认保存)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'condition_char_2',
    'state_change_char_4',
    'condition',
    '是',
    '{"condition": "true"}',
    27
);

-- State Change 4 -> Dialogue 8
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'state_change_char_4',
    'dialogue_char_8',
    'default',
    '',
    28
);

-- Dialogue 8 -> End 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_8',
    'end_char_1',
    'default',
    '',
    29
);

-- Dialogue 9 -> Choice 3 (预览后返回)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_9',
    'choice_char_3',
    'default',
    '',
    30
);

-- Dialogue 10 -> End 2
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_char_10',
    'end_char_2',
    'default',
    '',
    31
);
