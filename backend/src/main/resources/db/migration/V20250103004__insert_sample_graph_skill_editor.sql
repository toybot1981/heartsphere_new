-- 插入示例 Graph：角色技能编辑系统
-- 这是一个实用的案例，展示如何通过 Graph 流程编辑器来编辑和管理角色技能

SET @graph_id = NULL;

-- 1. 创建 Graph 定义
INSERT INTO graph_definitions (name, description, graph_type, start_node_id, is_active, version, created_by)
VALUES (
    '角色技能编辑系统',
    '这是一个完整的角色技能编辑示例，展示了如何通过 Graph 流程编辑器来查看、修改、验证角色的各项技能。包含：技能查看、直接设置、增加/减少、技能验证等功能。',
    'SCRIPT',
    'start_skill_1',
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
    'start_skill_1',
    'start',
    '{"name": "开始技能编辑", "description": "技能编辑流程开始"}',
    100.0,
    50.0,
    1
);

-- Dialogue 节点 - 欢迎信息
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_skill_1',
    'dialogue',
    '{"content": "欢迎进入角色技能管理系统！", "speaker": "系统", "description": "欢迎信息"}',
    100.0,
    200.0,
    2
);

-- Dialogue 节点 - 显示当前技能
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_skill_2',
    'dialogue',
    '{"content": "当前技能值：\\n力量：{{strength}}\\n智力：{{intelligence}}\\n敏捷：{{agility}}\\n体质：{{vitality}}", "speaker": "系统", "description": "显示当前技能值"}',
    100.0,
    350.0,
    3
);

-- Choice 节点 - 主菜单选择
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'choice_skill_1',
    'choice',
    '{"prompt": "请选择操作：", "options": [{"id": "view", "text": "查看技能", "nextNodeId": "dialogue_skill_2"}, {"id": "edit", "text": "编辑技能", "nextNodeId": "choice_skill_2"}, {"id": "train", "text": "技能训练", "nextNodeId": "choice_skill_3"}, {"id": "validate", "text": "技能验证", "nextNodeId": "skill_check_1"}, {"id": "reset", "text": "重置技能", "nextNodeId": "choice_reset"}, {"id": "exit", "text": "退出", "nextNodeId": "end_skill_1"}], "description": "主菜单选择"}',
    100.0,
    500.0,
    4
);

-- Choice 节点 - 选择要编辑的技能
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'choice_skill_2',
    'choice',
    '{"prompt": "选择要编辑的技能：", "options": [{"id": "edit_strength", "text": "编辑力量", "nextNodeId": "choice_edit_method"}, {"id": "edit_intelligence", "text": "编辑智力", "nextNodeId": "choice_edit_method"}, {"id": "edit_agility", "text": "编辑敏捷", "nextNodeId": "choice_edit_method"}, {"id": "edit_vitality", "text": "编辑体质", "nextNodeId": "choice_edit_method"}, {"id": "back", "text": "返回主菜单", "nextNodeId": "choice_skill_1"}], "description": "选择要编辑的技能"}',
    100.0,
    650.0,
    5
);

-- Choice 节点 - 选择编辑方式
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'choice_edit_method',
    'choice',
    '{"prompt": "选择编辑方式：", "options": [{"id": "set", "text": "直接设置值", "nextNodeId": "wait_set_value"}, {"id": "add", "text": "增加值", "nextNodeId": "wait_add_value"}, {"id": "subtract", "text": "减少值", "nextNodeId": "wait_subtract_value"}, {"id": "back", "text": "返回", "nextNodeId": "choice_skill_2"}], "description": "选择编辑方式"}',
    100.0,
    800.0,
    6
);

-- Wait 节点 - 等待输入设置值
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'wait_set_value',
    'wait',
    '{"waitType": "USER_INPUT", "waitCondition": "skillValue", "timeout": 60000, "description": "等待输入技能值"}',
    100.0,
    950.0,
    7
);

-- State Change 节点 - 设置技能值（SET）
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_set',
    'state_change',
    '{"changes": [{"type": "SKILL", "target": "{{selectedSkill}}", "operation": "SET", "value": "{{skillValue}}"}], "description": "设置技能值"}',
    100.0,
    1100.0,
    8
);

-- Wait 节点 - 等待输入增加值
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'wait_add_value',
    'wait',
    '{"waitType": "USER_INPUT", "waitCondition": "addValue", "timeout": 60000, "description": "等待输入增加值"}',
    300.0,
    950.0,
    9
);

-- State Change 节点 - 增加技能值（ADD）
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_add',
    'state_change',
    '{"changes": [{"type": "SKILL", "target": "{{selectedSkill}}", "operation": "ADD", "value": "{{addValue}}"}], "description": "增加技能值"}',
    300.0,
    1100.0,
    10
);

-- Wait 节点 - 等待输入减少值
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'wait_subtract_value',
    'wait',
    '{"waitType": "USER_INPUT", "waitCondition": "subtractValue", "timeout": 60000, "description": "等待输入减少值"}',
    500.0,
    950.0,
    11
);

-- State Change 节点 - 减少技能值（SUBTRACT）
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_subtract',
    'state_change',
    '{"changes": [{"type": "SKILL", "target": "{{selectedSkill}}", "operation": "SUBTRACT", "value": "{{subtractValue}}"}], "description": "减少技能值"}',
    500.0,
    1100.0,
    12
);

-- Dialogue 节点 - 修改成功提示
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_skill_3',
    'dialogue',
    '{"content": "技能修改成功！", "speaker": "系统", "description": "修改成功提示"}',
    100.0,
    1250.0,
    13
);

-- Choice 节点 - 技能训练选择
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'choice_skill_3',
    'choice',
    '{"prompt": "选择训练类型：", "options": [{"id": "train_strength", "text": "力量训练（力量+5）", "nextNodeId": "state_change_train_strength", "effects": {"skillChange": {"strength": 5}}}, {"id": "train_intelligence", "text": "智力训练（智力+5）", "nextNodeId": "state_change_train_intelligence", "effects": {"skillChange": {"intelligence": 5}}}, {"id": "train_agility", "text": "敏捷训练（敏捷+5）", "nextNodeId": "state_change_train_agility", "effects": {"skillChange": {"agility": 5}}}, {"id": "train_vitality", "text": "体质训练（体质+5）", "nextNodeId": "state_change_train_vitality", "effects": {"skillChange": {"vitality": 5}}}, {"id": "back", "text": "返回主菜单", "nextNodeId": "choice_skill_1"}], "description": "技能训练选择"}',
    100.0,
    650.0,
    14
);

-- State Change 节点 - 力量训练
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_train_strength',
    'state_change',
    '{"changes": [{"type": "SKILL", "target": "strength", "operation": "ADD", "value": 5}], "description": "力量训练"}',
    50.0,
    1400.0,
    15
);

-- State Change 节点 - 智力训练
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_train_intelligence',
    'state_change',
    '{"changes": [{"type": "SKILL", "target": "intelligence", "operation": "ADD", "value": 5}], "description": "智力训练"}',
    150.0,
    1400.0,
    16
);

-- State Change 节点 - 敏捷训练
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_train_agility',
    'state_change',
    '{"changes": [{"type": "SKILL", "target": "agility", "operation": "ADD", "value": 5}], "description": "敏捷训练"}',
    250.0,
    1400.0,
    17
);

-- State Change 节点 - 体质训练
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_train_vitality',
    'state_change',
    '{"changes": [{"type": "SKILL", "target": "vitality", "operation": "ADD", "value": 5}], "description": "体质训练"}',
    350.0,
    1400.0,
    18
);

-- Dialogue 节点 - 训练结果
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_skill_4',
    'dialogue',
    '{"content": "训练完成！你的技能得到了提升。", "speaker": "系统", "description": "训练结果"}',
    100.0,
    1550.0,
    19
);

-- Skill Check 节点 - 验证力量技能
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'skill_check_1',
    'skill_check',
    '{"skillId": "strength", "operator": ">=", "requiredValue": 50, "successNodeId": "dialogue_skill_high", "failureNodeId": "dialogue_skill_low", "description": "验证力量技能"}',
    100.0,
    800.0,
    20
);

-- Dialogue 节点 - 技能足够高
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_skill_high',
    'dialogue',
    '{"content": "你的力量技能足够高（>=50），可以解锁高级功能！", "speaker": "系统", "description": "技能足够高"}',
    50.0,
    950.0,
    21
);

-- Dialogue 节点 - 技能不够
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_skill_low',
    'dialogue',
    '{"content": "你的力量技能还不够高（<50），需要继续训练。", "speaker": "系统", "description": "技能不够"}',
    250.0,
    950.0,
    22
);

-- Choice 节点 - 确认重置
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'choice_reset',
    'choice',
    '{"prompt": "确认重置所有技能为初始值（20）？", "options": [{"id": "confirm", "text": "确认重置", "nextNodeId": "state_change_reset"}, {"id": "cancel", "text": "取消", "nextNodeId": "choice_skill_1"}], "description": "确认重置"}',
    100.0,
    650.0,
    23
);

-- State Change 节点 - 重置所有技能
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_reset',
    'state_change',
    '{"changes": [{"type": "SKILL", "target": "strength", "operation": "SET", "value": 20}, {"type": "SKILL", "target": "intelligence", "operation": "SET", "value": 20}, {"type": "SKILL", "target": "agility", "operation": "SET", "value": 20}, {"type": "SKILL", "target": "vitality", "operation": "SET", "value": 20}], "description": "重置所有技能"}',
    100.0,
    800.0,
    24
);

-- Dialogue 节点 - 重置成功
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_skill_5',
    'dialogue',
    '{"content": "所有技能已重置为初始值（20）。", "speaker": "系统", "description": "重置成功"}',
    100.0,
    950.0,
    25
);

-- End 节点 - 退出
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'end_skill_1',
    'end',
    '{"result": "退出技能编辑系统", "description": "技能编辑流程结束"}',
    100.0,
    500.0,
    26
);

-- 3. 创建连线（连接节点，形成完整的流程）

-- Start -> Dialogue 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'start_skill_1', 'dialogue_skill_1', 'default', '', 1);

-- Dialogue 1 -> Dialogue 2
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'dialogue_skill_1', 'dialogue_skill_2', 'default', '', 2);

-- Dialogue 2 -> Choice 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'dialogue_skill_2', 'choice_skill_1', 'default', '', 3);

-- Choice 1 -> Dialogue 2 (查看技能)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_1', 'dialogue_skill_2', 'condition', '查看', '{"choiceId": "view"}', 4);

-- Choice 1 -> Choice 2 (编辑技能)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_1', 'choice_skill_2', 'condition', '编辑', '{"choiceId": "edit"}', 5);

-- Choice 1 -> Choice 3 (技能训练)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_1', 'choice_skill_3', 'condition', '训练', '{"choiceId": "train"}', 6);

-- Choice 1 -> Skill Check 1 (技能验证)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_1', 'skill_check_1', 'condition', '验证', '{"choiceId": "validate"}', 7);

-- Choice 1 -> Choice Reset (重置技能)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_1', 'choice_reset', 'condition', '重置', '{"choiceId": "reset"}', 8);

-- Choice 1 -> End (退出)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_1', 'end_skill_1', 'condition', '退出', '{"choiceId": "exit"}', 9);

-- Choice 2 -> Choice Edit Method
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_2', 'choice_edit_method', 'condition', '', '{"choiceId": "edit_strength"}', 10);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_2', 'choice_edit_method', 'condition', '', '{"choiceId": "edit_intelligence"}', 11);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_2', 'choice_edit_method', 'condition', '', '{"choiceId": "edit_agility"}', 12);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_2', 'choice_edit_method', 'condition', '', '{"choiceId": "edit_vitality"}', 13);

-- Choice Edit Method -> Wait Nodes
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_edit_method', 'wait_set_value', 'condition', '设置', '{"choiceId": "set"}', 14);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_edit_method', 'wait_add_value', 'condition', '增加', '{"choiceId": "add"}', 15);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_edit_method', 'wait_subtract_value', 'condition', '减少', '{"choiceId": "subtract"}', 16);

-- Wait -> State Change
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'wait_set_value', 'state_change_set', 'default', '', 17);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'wait_add_value', 'state_change_add', 'default', '', 18);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'wait_subtract_value', 'state_change_subtract', 'default', '', 19);

-- State Change -> Dialogue 3
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'state_change_set', 'dialogue_skill_3', 'default', '', 20);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'state_change_add', 'dialogue_skill_3', 'default', '', 21);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'state_change_subtract', 'dialogue_skill_3', 'default', '', 22);

-- Dialogue 3 -> Choice 1 (返回主菜单)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'dialogue_skill_3', 'choice_skill_1', 'default', '', 23);

-- Choice 3 -> State Change Train
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_3', 'state_change_train_strength', 'condition', '', '{"choiceId": "train_strength"}', 24);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_3', 'state_change_train_intelligence', 'condition', '', '{"choiceId": "train_intelligence"}', 25);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_3', 'state_change_train_agility', 'condition', '', '{"choiceId": "train_agility"}', 26);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_skill_3', 'state_change_train_vitality', 'condition', '', '{"choiceId": "train_vitality"}', 27);

-- State Change Train -> Dialogue 4
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'state_change_train_strength', 'dialogue_skill_4', 'default', '', 28);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'state_change_train_intelligence', 'dialogue_skill_4', 'default', '', 29);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'state_change_train_agility', 'dialogue_skill_4', 'default', '', 30);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'state_change_train_vitality', 'dialogue_skill_4', 'default', '', 31);

-- Dialogue 4 -> Choice 1 (返回主菜单)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'dialogue_skill_4', 'choice_skill_1', 'default', '', 32);

-- Skill Check -> Dialogue High/Low
-- (由 SkillCheckNode 自动路由，无需手动创建)

-- Dialogue High/Low -> Choice 1 (返回主菜单)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'dialogue_skill_high', 'choice_skill_1', 'default', '', 33);
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'dialogue_skill_low', 'choice_skill_1', 'default', '', 34);

-- Choice Reset -> State Change Reset
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (@graph_id, 'choice_reset', 'state_change_reset', 'condition', '确认', '{"choiceId": "confirm"}', 35);

-- State Change Reset -> Dialogue 5
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'state_change_reset', 'dialogue_skill_5', 'default', '', 36);

-- Dialogue 5 -> Choice 1 (返回主菜单)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (@graph_id, 'dialogue_skill_5', 'choice_skill_1', 'default', '', 37);
