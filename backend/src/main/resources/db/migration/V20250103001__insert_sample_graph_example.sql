-- 插入示例 Graph：角色对话流程（包含所有节点类型）
-- 这是一个实用的案例，展示了如何在流程中使用各种节点类型

-- 注意：这个迁移脚本使用变量来存储 graph_id，确保所有节点和边都关联到正确的 Graph

SET @graph_id = NULL;

-- 1. 创建 Graph 定义
INSERT INTO graph_definitions (name, description, graph_type, start_node_id, is_active, version, created_by)
VALUES (
    '角色对话示例 - 冒险者任务',
    '这是一个完整的示例，展示了所有节点类型的用法。包含：对话节点、选择节点、条件判断、技能检查、状态变更、等待节点等。',
    'SCRIPT',
    'start_1',
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
    'start_1',
    'start',
    '{"name": "开始任务", "description": "冒险者任务开始"}',
    100.0,
    50.0,
    1
);

-- Dialogue 节点 - 初始对话
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_1',
    'dialogue',
    '{"content": "你好，冒险者！有一个危险的任务需要你去完成。", "speaker": "NPC-村长", "description": "NPC向玩家介绍任务"}',
    100.0,
    200.0,
    2
);

-- Choice 节点 - 玩家选择
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'choice_1',
    'choice',
    '{"prompt": "你选择如何回应？", "options": [{"id": "accept", "text": "接受任务", "effects": {"reputation": 10}}, {"id": "decline", "text": "拒绝任务", "effects": {"reputation": -5}}, {"id": "ask_more", "text": "询问更多信息", "effects": {}}], "description": "玩家选择是否接受任务"}',
    100.0,
    350.0,
    3
);

-- Condition 节点 - 判断玩家选择
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'condition_1',
    'condition',
    '{"condition": "userChoice == \"accept\"", "description": "判断玩家是否接受任务"}',
    100.0,
    500.0,
    4
);

-- Dialogue 节点 - 接受任务后的对话
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_2',
    'dialogue',
    '{"content": "太好了！这个任务需要你进入森林深处，找到神秘的宝藏。", "speaker": "NPC-村长", "description": "任务详情"}',
    100.0,
    650.0,
    5
);

-- Skill Check 节点 - 技能检查
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'skill_check_1',
    'skill_check',
    '{"skill": "exploration", "difficulty": 15, "successEffects": {"experience": 50}, "failureEffects": {"health": -10}, "description": "探索技能检查"}',
    100.0,
    800.0,
    6
);

-- State Change 节点 - 修改角色状态
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_1',
    'state_change',
    '{"changes": {"items": [{"id": "map", "name": "藏宝图", "count": 1}], "variables": {"inForest": true}}, "description": "获得藏宝图"}',
    100.0,
    950.0,
    7
);

-- Wait 节点 - 等待玩家操作
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'wait_1',
    'wait',
    '{"waitType": "USER_INPUT", "waitCondition": "playerReady", "timeout": 30000, "description": "等待玩家准备"}',
    100.0,
    1100.0,
    8
);

-- Dialogue 节点 - 拒绝任务后的对话
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_3',
    'dialogue',
    '{"content": "好吧，如果你改变主意，随时可以来找我。", "speaker": "NPC-村长", "description": "玩家拒绝任务"}',
    300.0,
    650.0,
    9
);

-- Dialogue 节点 - 询问更多信息
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_4',
    'dialogue',
    '{"content": "任务很危险，但奖励丰厚。你需要探索森林，打败怪物，找到宝藏。", "speaker": "NPC-村长", "description": "提供更多信息"}',
    300.0,
    350.0,
    10
);

-- Condition 节点 - 判断技能检查结果
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'condition_2',
    'condition',
    '{"condition": "skillCheckResult == true", "description": "判断技能检查是否成功"}',
    100.0,
    1250.0,
    11
);

-- Dialogue 节点 - 技能检查成功
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_5',
    'dialogue',
    '{"content": "你成功找到了宝藏的位置！", "speaker": "系统", "description": "探索成功"}',
    50.0,
    1400.0,
    12
);

-- Dialogue 节点 - 技能检查失败
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_6',
    'dialogue',
    '{"content": "你在森林中迷路了，还受到了伤害...", "speaker": "系统", "description": "探索失败"}',
    250.0,
    1400.0,
    13
);

-- End 节点 - 成功结局
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'end_1',
    'end',
    '{"result": "任务完成", "description": "成功完成任务的结局"}',
    50.0,
    1550.0,
    14
);

-- End 节点 - 失败结局
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'end_2',
    'end',
    '{"result": "任务失败", "description": "任务失败的结局"}',
    250.0,
    1550.0,
    15
);

-- End 节点 - 拒绝任务结局
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'end_3',
    'end',
    '{"result": "任务已拒绝", "description": "拒绝任务的结局"}',
    300.0,
    800.0,
    16
);

-- 3. 创建连线（连接节点，形成完整的流程）

-- Start -> Dialogue 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'start_1',
    'dialogue_1',
    'default',
    '',
    1
);

-- Dialogue 1 -> Choice 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_1',
    'choice_1',
    'default',
    '',
    2
);

-- Choice 1 -> Condition 1 (接受任务)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_1',
    'condition_1',
    'condition',
    '接受',
    '{"choiceId": "accept"}',
    3
);

-- Choice 1 -> Dialogue 4 (询问更多)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_1',
    'dialogue_4',
    'condition',
    '询问',
    '{"choiceId": "ask_more"}',
    4
);

-- Choice 1 -> Dialogue 3 (拒绝任务)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_1',
    'dialogue_3',
    'condition',
    '拒绝',
    '{"choiceId": "decline"}',
    5
);

-- Condition 1 -> Dialogue 2 (true分支 - 接受任务)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'condition_1',
    'dialogue_2',
    'condition',
    '是',
    '{"condition": "true"}',
    6
);

-- Dialogue 4 -> Condition 1 (回到判断)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_4',
    'condition_1',
    'default',
    '',
    7
);

-- Dialogue 2 -> Skill Check 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_2',
    'skill_check_1',
    'default',
    '',
    8
);

-- Skill Check 1 -> State Change 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'skill_check_1',
    'state_change_1',
    'default',
    '',
    9
);

-- State Change 1 -> Wait 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'state_change_1',
    'wait_1',
    'default',
    '',
    10
);

-- Wait 1 -> Condition 2
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'wait_1',
    'condition_2',
    'default',
    '',
    11
);

-- Condition 2 -> Dialogue 5 (true分支 - 成功)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'condition_2',
    'dialogue_5',
    'condition',
    '成功',
    '{"condition": "true"}',
    12
);

-- Condition 2 -> Dialogue 6 (false分支 - 失败)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'condition_2',
    'dialogue_6',
    'condition',
    '失败',
    '{"condition": "false"}',
    13
);

-- Dialogue 5 -> End 1 (成功结局)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_5',
    'end_1',
    'default',
    '',
    14
);

-- Dialogue 6 -> End 2 (失败结局)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_6',
    'end_2',
    'default',
    '',
    15
);

-- Dialogue 3 -> End 3 (拒绝任务结局)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_3',
    'end_3',
    'default',
    '',
    16
);
