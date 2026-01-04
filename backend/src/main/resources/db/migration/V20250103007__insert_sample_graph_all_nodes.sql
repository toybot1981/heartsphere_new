-- 创建一个包含所有节点类型的示例Graph
-- 用于演示和测试所有节点类型的功能

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

SET @graph_id = NULL;

-- 插入Graph定义
INSERT INTO graph_definitions (name, description, graph_type, start_node_id, is_active, version, created_by, created_at, updated_at)
VALUES (
    '所有节点类型示例',
    '这是一个包含所有节点类型的示例Graph，用于演示和测试',
    'SCRIPT',
    'start_1',
    true,
    1,
    NULL,
    NOW(),
    NOW()
);

SET @graph_id = LAST_INSERT_ID();

-- 插入所有类型的节点
-- 1. Start节点
INSERT INTO graph_nodes (graph_id, node_id, node_type, position_x, position_y, node_config, created_at, updated_at)
VALUES (@graph_id, 'start_1', 'start', 100, 100, '{}', NOW(), NOW());

-- 2. Dialogue节点
INSERT INTO graph_nodes (graph_id, node_id, node_type, position_x, position_y, node_config, created_at, updated_at)
VALUES (@graph_id, 'dialogue_1', 'dialogue', 300, 100, 
    JSON_OBJECT('content', '欢迎来到心域！这是一个对话节点示例。', 'dialogueType', 'DIALOGUE'), 
    NOW(), NOW());

-- 3. Choice节点
INSERT INTO graph_nodes (graph_id, node_id, node_type, position_x, position_y, node_config, created_at, updated_at)
VALUES (@graph_id, 'choice_1', 'choice', 500, 100, 
    JSON_OBJECT('prompt', '请选择你的行动：', 'options', JSON_ARRAY(
        JSON_OBJECT('text', '选项A：继续前进', 'nextNodeId', 'condition_1', 'effects', JSON_ARRAY()),
        JSON_OBJECT('text', '选项B：返回', 'nextNodeId', 'skill_check_1', 'effects', JSON_ARRAY())
    )), 
    NOW(), NOW());

-- 4. Condition节点
INSERT INTO graph_nodes (graph_id, node_id, node_type, position_x, position_y, node_config, created_at, updated_at)
VALUES (@graph_id, 'condition_1', 'condition', 700, 100, 
    JSON_OBJECT('conditionType', 'VARIABLE', 'variableName', 'playerLevel', 'operator', 'GREATER_THAN', 'value', 10), 
    NOW(), NOW());

-- 5. SkillCheck节点
INSERT INTO graph_nodes (graph_id, node_id, node_type, position_x, position_y, node_config, created_at, updated_at)
VALUES (@graph_id, 'skill_check_1', 'skill_check', 900, 100, 
    JSON_OBJECT('skillId', 'strength', 'minValue', 50, 'checkType', 'GREATER_THAN_OR_EQUAL'), 
    NOW(), NOW());

-- 6. StateChange节点
INSERT INTO graph_nodes (graph_id, node_id, node_type, position_x, position_y, node_config, created_at, updated_at)
VALUES (@graph_id, 'state_change_1', 'state_change', 1100, 100, 
    JSON_OBJECT('changes', JSON_ARRAY(
        JSON_OBJECT('type', 'SKILL', 'skillId', 'strength', 'operation', 'ADD', 'value', 5),
        JSON_OBJECT('type', 'VARIABLE', 'variableName', 'playerLevel', 'operation', 'SET', 'value', 15)
    )), 
    NOW(), NOW());

-- 7. Wait节点
INSERT INTO graph_nodes (graph_id, node_id, node_type, position_x, position_y, node_config, created_at, updated_at)
VALUES (@graph_id, 'wait_1', 'wait', 300, 300, 
    JSON_OBJECT('waitType', 'USER_INPUT', 'waitCondition', 'input_received', 'timeout', 30000, 'nextNodeId', 'end_1'), 
    NOW(), NOW());

-- 8. End节点
INSERT INTO graph_nodes (graph_id, node_id, node_type, position_x, position_y, node_config, created_at, updated_at)
VALUES (@graph_id, 'end_1', 'end', 500, 300, 
    JSON_OBJECT('result', '流程结束', 'endType', 'NORMAL'), 
    NOW(), NOW());

-- 插入边（连接节点）
-- Start -> Dialogue
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, created_at, updated_at)
VALUES (@graph_id, 'start_1', 'dialogue_1', 'default', '', '{}', NOW(), NOW());

-- Dialogue -> Choice
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, created_at, updated_at)
VALUES (@graph_id, 'dialogue_1', 'choice_1', 'default', '', '{}', NOW(), NOW());

-- Choice -> Condition (选项A)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, created_at, updated_at)
VALUES (@graph_id, 'choice_1', 'condition_1', 'default', '选项A', '{}', NOW(), NOW());

-- Choice -> SkillCheck (选项B)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, created_at, updated_at)
VALUES (@graph_id, 'choice_1', 'skill_check_1', 'default', '选项B', '{}', NOW(), NOW());

-- Condition -> StateChange (true分支)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, created_at, updated_at)
VALUES (@graph_id, 'condition_1', 'state_change_1', 'true', '条件满足', '{}', NOW(), NOW());

-- Condition -> Wait (false分支)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, created_at, updated_at)
VALUES (@graph_id, 'condition_1', 'wait_1', 'false', '条件不满足', '{}', NOW(), NOW());

-- SkillCheck -> StateChange (成功)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, created_at, updated_at)
VALUES (@graph_id, 'skill_check_1', 'state_change_1', 'true', '技能检查成功', '{}', NOW(), NOW());

-- SkillCheck -> Wait (失败)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, created_at, updated_at)
VALUES (@graph_id, 'skill_check_1', 'wait_1', 'false', '技能检查失败', '{}', NOW(), NOW());

-- StateChange -> End
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, created_at, updated_at)
VALUES (@graph_id, 'state_change_1', 'end_1', 'default', '', '{}', NOW(), NOW());

-- Wait -> End
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, created_at, updated_at)
VALUES (@graph_id, 'wait_1', 'end_1', 'default', '', '{}', NOW(), NOW());
