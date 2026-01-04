-- 插入示例 Graph：剧本编辑流程
-- 这是一个实用的案例，展示剧本创建、场景管理、对话配置、剧情分支等完整流程

SET @graph_id = NULL;

-- 1. 创建 Graph 定义
INSERT INTO graph_definitions (name, description, graph_type, start_node_id, is_active, version, created_by)
VALUES (
    '剧本编辑示例 - 三幕剧',
    '这是一个完整的剧本编辑示例，展示了剧本创建流程。包含：剧本信息设置、场景创建、角色对话配置、剧情分支、场景切换、剧本保存等步骤。',
    'SCRIPT',
    'start_script_1',
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
    'start_script_1',
    'start',
    '{"name": "开始创建剧本", "description": "剧本编辑流程开始"}',
    100.0,
    50.0,
    1
);

-- Dialogue 节点 - 欢迎信息
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_1',
    'dialogue',
    '{"content": "欢迎使用剧本编辑器！让我们开始创建你的剧本吧。", "speaker": "系统", "description": "欢迎信息"}',
    100.0,
    200.0,
    2
);

-- Dialogue 节点 - 剧本基本信息提示
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_2',
    'dialogue',
    '{"content": "首先，请输入剧本的基本信息：名称、类型、简介等。", "speaker": "系统", "description": "提示输入剧本基本信息"}',
    100.0,
    350.0,
    3
);

-- Wait 节点 - 等待输入剧本信息
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'wait_script_1',
    'wait',
    '{"waitType": "USER_INPUT", "waitCondition": "scriptBasicInfo", "timeout": 60000, "description": "等待用户输入剧本基本信息"}',
    100.0,
    500.0,
    4
);

-- State Change 节点 - 保存剧本基本信息
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_script_1',
    'state_change',
    '{"changes": {"scriptName": "{{scriptName}}", "scriptType": "{{scriptType}}", "scriptDescription": "{{scriptDescription}}", "scriptGenre": "{{scriptGenre}}"}, "description": "保存剧本基本信息"}',
    100.0,
    650.0,
    5
);

-- Dialogue 节点 - 场景创建提示
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_3',
    'dialogue',
    '{"content": "现在让我们创建剧本的第一幕场景。", "speaker": "系统", "description": "提示创建场景"}',
    100.0,
    800.0,
    6
);

-- Dialogue 节点 - 第一幕场景介绍
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_4',
    'dialogue',
    '{"content": "第一幕：故事的开始。主角在一个神秘的小镇上醒来，发现自己失去了记忆。", "speaker": "旁白", "description": "第一幕场景介绍"}',
    100.0,
    950.0,
    7
);

-- State Change 节点 - 创建第一幕场景
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_script_2',
    'state_change',
    '{"changes": {"scenes": [{"sceneId": "scene_1", "sceneName": "第一幕：失忆", "sceneOrder": 1, "sceneDescription": "主角在小镇上醒来"}], "currentScene": "scene_1"}, "description": "创建第一幕场景"}',
    100.0,
    1100.0,
    8
);

-- Dialogue 节点 - 第一幕对话开始
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_5',
    'dialogue',
    '{"content": "你醒来了。头很痛，周围的一切都很陌生。一位老人向你走来...", "speaker": "旁白", "description": "第一幕对话开始"}',
    100.0,
    1250.0,
    9
);

-- Dialogue 节点 - 老人对话
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_6',
    'dialogue',
    '{"content": "年轻人，你终于醒了。这里是遗忘小镇，你已经昏迷三天了。", "speaker": "老人-张伯", "description": "老人对话"}',
    100.0,
    1400.0,
    10
);

-- Choice 节点 - 玩家回应选择
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'choice_script_1',
    'choice',
    '{"prompt": "你如何回应？", "options": [{"id": "ask_who", "text": "我是谁？这里是哪里？", "effects": {"trust": 5}}, {"id": "ask_what", "text": "发生了什么？我为什么在这里？", "effects": {"trust": 3}}, {"id": "say_thanks", "text": "谢谢你救了我", "effects": {"trust": 10, "favorability": 5}}], "description": "玩家回应选择"}',
    100.0,
    1550.0,
    11
);

-- Dialogue 节点 - 不同选择的回应
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_7',
    'dialogue',
    '{"content": "根据你的选择，老人给出了不同的回应...", "speaker": "系统", "description": "选择后的对话"}',
    100.0,
    1700.0,
    12
);

-- Condition 节点 - 判断选择
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'condition_script_1',
    'condition',
    '{"condition": "userChoice == \"say_thanks\"", "description": "判断是否选择了感谢"}',
    100.0,
    1850.0,
    13
);

-- Dialogue 节点 - 感谢选择的特殊对话
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_8',
    'dialogue',
    '{"content": "张伯：不用谢，孩子。你看起来很困惑，让我告诉你一些关于这个小镇的事情吧。", "speaker": "老人-张伯", "description": "感谢后的特殊对话"}',
    50.0,
    2000.0,
    14
);

-- Dialogue 节点 - 其他选择的对话
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_9',
    'dialogue',
    '{"content": "张伯：我知道你有很多疑问，但现在最重要的是恢复你的记忆。", "speaker": "老人-张伯", "description": "其他选择的对话"}',
    250.0,
    2000.0,
    15
);

-- State Change 节点 - 更新角色关系
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_script_3',
    'state_change',
    '{"changes": {"characterRelations": {"old_man": "{{trust}}", "favorability": "{{favorability}}"}, "storyProgress": "act1_complete"}, "description": "更新角色关系"}',
    100.0,
    2150.0,
    16
);

-- Dialogue 节点 - 第一幕结束
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_10',
    'dialogue',
    '{"content": "第一幕结束。主角决定在小镇上寻找线索，恢复自己的记忆...", "speaker": "旁白", "description": "第一幕结束"}',
    100.0,
    2300.0,
    17
);

-- Dialogue 节点 - 第二幕场景介绍
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_11',
    'dialogue',
    '{"content": "第二幕：探索与发现。主角在小镇中探索，发现了一些神秘的线索。", "speaker": "旁白", "description": "第二幕场景介绍"}',
    100.0,
    2450.0,
    18
);

-- State Change 节点 - 创建第二幕场景
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_script_4',
    'state_change',
    '{"changes": {"scenes": [{"sceneId": "scene_2", "sceneName": "第二幕：探索", "sceneOrder": 2, "sceneDescription": "主角在小镇中探索"}], "currentScene": "scene_2"}, "description": "创建第二幕场景"}',
    100.0,
    2600.0,
    19
);

-- Skill Check 节点 - 探索技能检查
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'skill_check_script_1',
    'skill_check',
    '{"skill": "exploration", "difficulty": 12, "successEffects": {"cluesFound": 1, "progress": 20}, "failureEffects": {"progress": 10}, "description": "探索技能检查"}',
    100.0,
    2750.0,
    20
);

-- Condition 节点 - 判断探索结果
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'condition_script_2',
    'condition',
    '{"condition": "skillCheckResult == true", "description": "判断探索是否成功"}',
    100.0,
    2900.0,
    21
);

-- Dialogue 节点 - 探索成功
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_12',
    'dialogue',
    '{"content": "你发现了一张旧照片，照片上的人看起来和你很像...", "speaker": "旁白", "description": "探索成功"}',
    50.0,
    3050.0,
    22
);

-- Dialogue 节点 - 探索失败
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_13',
    'dialogue',
    '{"content": "你在小镇中转了很久，但没有发现什么特别的东西...", "speaker": "旁白", "description": "探索失败"}',
    250.0,
    3050.0,
    23
);

-- State Change 节点 - 更新剧情进度
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_script_5',
    'state_change',
    '{"changes": {"storyProgress": "act2_complete", "items": [{"id": "old_photo", "name": "旧照片", "count": 1}]}, "description": "更新剧情进度"}',
    100.0,
    3200.0,
    24
);

-- Dialogue 节点 - 第二幕结束
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_14',
    'dialogue',
    '{"content": "第二幕结束。主角决定去找张伯，询问关于照片的事情...", "speaker": "旁白", "description": "第二幕结束"}',
    100.0,
    3350.0,
    25
);

-- Dialogue 节点 - 第三幕场景介绍
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_15',
    'dialogue',
    '{"content": "第三幕：真相与选择。主角找到了关键线索，面临重要的选择。", "speaker": "旁白", "description": "第三幕场景介绍"}',
    100.0,
    3500.0,
    26
);

-- State Change 节点 - 创建第三幕场景
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_script_6',
    'state_change',
    '{"changes": {"scenes": [{"sceneId": "scene_3", "sceneName": "第三幕：真相", "sceneOrder": 3, "sceneDescription": "主角找到真相"}], "currentScene": "scene_3"}, "description": "创建第三幕场景"}',
    100.0,
    3650.0,
    27
);

-- Dialogue 节点 - 真相揭示
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_16',
    'dialogue',
    '{"content": "张伯告诉你：你是这个小镇的守护者，但你的记忆被封印了。现在你需要做出选择...", "speaker": "老人-张伯", "description": "真相揭示"}',
    100.0,
    3800.0,
    28
);

-- Choice 节点 - 最终选择
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'choice_script_2',
    'choice',
    '{"prompt": "你的选择将决定故事的结局：", "options": [{"id": "accept_duty", "text": "接受守护者的职责", "effects": {"ending": "heroic"}}, {"id": "reject_duty", "text": "拒绝，找回普通的生活", "effects": {"ending": "peaceful"}}, {"id": "seek_truth", "text": "寻求更多的真相", "effects": {"ending": "mysterious"}}], "description": "最终选择"}',
    100.0,
    3950.0,
    29
);

-- Condition 节点 - 判断结局类型
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'condition_script_3',
    'condition',
    '{"condition": "userChoice == \"accept_duty\"", "description": "判断是否接受职责"}',
    100.0,
    4100.0,
    30
);

-- Dialogue 节点 - 英雄结局
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_17',
    'dialogue',
    '{"content": "你选择了接受守护者的职责。你恢复了记忆，成为了小镇的守护者，保护着这个神秘的地方。", "speaker": "旁白", "description": "英雄结局"}',
    50.0,
    4250.0,
    31
);

-- Dialogue 节点 - 和平结局
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_18',
    'dialogue',
    '{"content": "你选择了找回普通的生活。你离开了小镇，开始了新的生活，但偶尔还会想起那个神秘的地方。", "speaker": "旁白", "description": "和平结局"}',
    150.0,
    4250.0,
    32
);

-- Dialogue 节点 - 神秘结局
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_19',
    'dialogue',
    '{"content": "你选择了寻求更多的真相。你踏上了探索之旅，发现了更多关于这个世界的秘密...", "speaker": "旁白", "description": "神秘结局"}',
    250.0,
    4250.0,
    33
);

-- State Change 节点 - 保存结局
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_script_7',
    'state_change',
    '{"changes": {"storyProgress": "complete", "ending": "{{ending}}", "scriptCompleted": true}, "description": "保存结局"}',
    100.0,
    4400.0,
    34
);

-- Dialogue 节点 - 剧本完成提示
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_20',
    'dialogue',
    '{"content": "剧本编辑完成！你可以保存剧本并发布。", "speaker": "系统", "description": "剧本完成提示"}',
    100.0,
    4550.0,
    35
);

-- Choice 节点 - 保存或继续编辑
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'choice_script_3',
    'choice',
    '{"prompt": "选择下一步操作：", "options": [{"id": "save", "text": "保存剧本", "effects": {}}, {"id": "publish", "text": "保存并发布", "effects": {}}, {"id": "continue_edit", "text": "继续编辑", "effects": {}}], "description": "保存或继续编辑"}',
    100.0,
    4700.0,
    36
);

-- Condition 节点 - 判断操作类型
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'condition_script_4',
    'condition',
    '{"condition": "userChoice == \"save\" || userChoice == \"publish\"", "description": "判断是否保存"}',
    100.0,
    4850.0,
    37
);

-- State Change 节点 - 保存剧本到数据库
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'state_change_script_8',
    'state_change',
    '{"changes": {"scriptSaved": true, "scriptId": "{{generatedScriptId}}", "savedAt": "{{currentTimestamp}}", "published": "{{userChoice == \\\"publish\\\"}}"}, "description": "保存剧本到数据库"}',
    100.0,
    5000.0,
    38
);

-- Dialogue 节点 - 保存成功
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_21',
    'dialogue',
    '{"content": "剧本已保存成功！", "speaker": "系统", "description": "保存成功提示"}',
    100.0,
    5150.0,
    39
);

-- End 节点 - 保存完成
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'end_script_1',
    'end',
    '{"result": "剧本保存完成", "description": "剧本编辑流程成功结束"}',
    100.0,
    5300.0,
    40
);

-- End 节点 - 继续编辑
INSERT INTO graph_nodes (graph_id, node_id, node_type, node_config, position_x, position_y, sort_order)
VALUES (
    @graph_id,
    'end_script_2',
    'end',
    '{"result": "继续编辑", "description": "返回编辑模式"}',
    300.0,
    4850.0,
    41
);

-- 3. 创建连线（连接节点，形成完整的流程）

-- Start -> Dialogue 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'start_script_1',
    'dialogue_script_1',
    'default',
    '',
    1
);

-- Dialogue 1 -> Dialogue 2
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_1',
    'dialogue_script_2',
    'default',
    '',
    2
);

-- Dialogue 2 -> Wait 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_2',
    'wait_script_1',
    'default',
    '',
    3
);

-- Wait 1 -> State Change 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'wait_script_1',
    'state_change_script_1',
    'default',
    '',
    4
);

-- State Change 1 -> Dialogue 3
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'state_change_script_1',
    'dialogue_script_3',
    'default',
    '',
    5
);

-- Dialogue 3 -> Dialogue 4
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_3',
    'dialogue_script_4',
    'default',
    '',
    6
);

-- Dialogue 4 -> State Change 2
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_4',
    'state_change_script_2',
    'default',
    '',
    7
);

-- State Change 2 -> Dialogue 5
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'state_change_script_2',
    'dialogue_script_5',
    'default',
    '',
    8
);

-- Dialogue 5 -> Dialogue 6
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_5',
    'dialogue_script_6',
    'default',
    '',
    9
);

-- Dialogue 6 -> Choice 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_6',
    'choice_script_1',
    'default',
    '',
    10
);

-- Choice 1 -> Dialogue 7
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_script_1',
    'dialogue_script_7',
    'condition',
    '',
    '{"choiceId": "ask_who"}',
    11
);

INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_script_1',
    'dialogue_script_7',
    'condition',
    '',
    '{"choiceId": "ask_what"}',
    12
);

INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_script_1',
    'dialogue_script_7',
    'condition',
    '',
    '{"choiceId": "say_thanks"}',
    13
);

-- Dialogue 7 -> Condition 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_7',
    'condition_script_1',
    'default',
    '',
    14
);

-- Condition 1 -> Dialogue 8 (true分支)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'condition_script_1',
    'dialogue_script_8',
    'condition',
    '是',
    '{"condition": "true"}',
    15
);

-- Condition 1 -> Dialogue 9 (false分支)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'condition_script_1',
    'dialogue_script_9',
    'condition',
    '否',
    '{"condition": "false"}',
    16
);

-- Dialogue 8 -> State Change 3
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_8',
    'state_change_script_3',
    'default',
    '',
    17
);

-- Dialogue 9 -> State Change 3
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_9',
    'state_change_script_3',
    'default',
    '',
    18
);

-- State Change 3 -> Dialogue 10
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'state_change_script_3',
    'dialogue_script_10',
    'default',
    '',
    19
);

-- Dialogue 10 -> Dialogue 11
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_10',
    'dialogue_script_11',
    'default',
    '',
    20
);

-- Dialogue 11 -> State Change 4
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_11',
    'state_change_script_4',
    'default',
    '',
    21
);

-- State Change 4 -> Skill Check 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'state_change_script_4',
    'skill_check_script_1',
    'default',
    '',
    22
);

-- Skill Check 1 -> Condition 2
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'skill_check_script_1',
    'condition_script_2',
    'default',
    '',
    23
);

-- Condition 2 -> Dialogue 12 (true分支)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'condition_script_2',
    'dialogue_script_12',
    'condition',
    '成功',
    '{"condition": "true"}',
    24
);

-- Condition 2 -> Dialogue 13 (false分支)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'condition_script_2',
    'dialogue_script_13',
    'condition',
    '失败',
    '{"condition": "false"}',
    25
);

-- Dialogue 12 -> State Change 5
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_12',
    'state_change_script_5',
    'default',
    '',
    26
);

-- Dialogue 13 -> State Change 5
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_13',
    'state_change_script_5',
    'default',
    '',
    27
);

-- State Change 5 -> Dialogue 14
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'state_change_script_5',
    'dialogue_script_14',
    'default',
    '',
    28
);

-- Dialogue 14 -> Dialogue 15
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_14',
    'dialogue_script_15',
    'default',
    '',
    29
);

-- Dialogue 15 -> State Change 6
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_15',
    'state_change_script_6',
    'default',
    '',
    30
);

-- State Change 6 -> Dialogue 16
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'state_change_script_6',
    'dialogue_script_16',
    'default',
    '',
    31
);

-- Dialogue 16 -> Choice 2
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_16',
    'choice_script_2',
    'default',
    '',
    32
);

-- Choice 2 -> Condition 3
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_script_2',
    'condition_script_3',
    'condition',
    '',
    '{"choiceId": "accept_duty"}',
    33
);

INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_script_2',
    'dialogue_script_18',
    'condition',
    '',
    '{"choiceId": "reject_duty"}',
    34
);

INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_script_2',
    'dialogue_script_19',
    'condition',
    '',
    '{"choiceId": "seek_truth"}',
    35
);

-- Condition 3 -> Dialogue 17 (true分支)
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'condition_script_3',
    'dialogue_script_17',
    'condition',
    '是',
    '{"condition": "true"}',
    36
);

-- Dialogue 17 -> State Change 7
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_17',
    'state_change_script_7',
    'default',
    '',
    37
);

-- Dialogue 18 -> State Change 7
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_18',
    'state_change_script_7',
    'default',
    '',
    38
);

-- Dialogue 19 -> State Change 7
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_19',
    'state_change_script_7',
    'default',
    '',
    39
);

-- State Change 7 -> Dialogue 20
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'state_change_script_7',
    'dialogue_script_20',
    'default',
    '',
    40
);

-- Dialogue 20 -> Choice 3
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_20',
    'choice_script_3',
    'default',
    '',
    41
);

-- Choice 3 -> Condition 4
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_script_3',
    'condition_script_4',
    'condition',
    '',
    '{"choiceId": "save"}',
    42
);

INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_script_3',
    'condition_script_4',
    'condition',
    '',
    '{"choiceId": "publish"}',
    43
);

INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'choice_script_3',
    'end_script_2',
    'condition',
    '',
    '{"choiceId": "continue_edit"}',
    44
);

-- Condition 4 -> State Change 8
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, condition_config, sort_order)
VALUES (
    @graph_id,
    'condition_script_4',
    'state_change_script_8',
    'condition',
    '是',
    '{"condition": "true"}',
    45
);

-- State Change 8 -> Dialogue 21
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'state_change_script_8',
    'dialogue_script_21',
    'default',
    '',
    46
);

-- Dialogue 21 -> End 1
INSERT INTO graph_edges (graph_id, source_node_id, target_node_id, edge_type, edge_label, sort_order)
VALUES (
    @graph_id,
    'dialogue_script_21',
    'end_script_1',
    'default',
    '',
    47
);
