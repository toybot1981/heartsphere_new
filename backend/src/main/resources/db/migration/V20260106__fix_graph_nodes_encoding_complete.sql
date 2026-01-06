-- 修复Graph节点中的node_config JSON数据编码问题
-- 基于原始SQL文件中的正确内容，重新更新所有节点的node_config

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- ============================================
-- Graph ID = 11: 角色编辑示例 - 创建新角色
-- ============================================

UPDATE graph_nodes SET
    node_config = '{"name": "开始创建角色", "description": "角色创建流程开始"}'
WHERE graph_id = 11 AND node_id = 'start_char_1';

UPDATE graph_nodes SET
    node_config = '{"content": "欢迎来到角色创建系统！让我们开始创建你的角色吧。", "speaker": "系统", "description": "欢迎信息"}'
WHERE graph_id = 11 AND node_id = 'dialogue_char_1';

UPDATE graph_nodes SET
    node_config = '{"content": "首先，请输入你的角色名称。", "speaker": "系统", "description": "提示输入角色名称"}'
WHERE graph_id = 11 AND node_id = 'dialogue_char_2';

UPDATE graph_nodes SET
    node_config = '{"waitType": "USER_INPUT", "waitCondition": "characterName", "timeout": 60000, "description": "等待用户输入角色名称"}'
WHERE graph_id = 11 AND node_id = 'wait_char_1';

UPDATE graph_nodes SET
    node_config = '{"condition": "characterName != null && characterName.length() >= 2 && characterName.length() <= 20", "description": "验证角色名称是否有效"}'
WHERE graph_id = 11 AND node_id = 'condition_char_1';

UPDATE graph_nodes SET
    node_config = '{"content": "角色名称无效，请重新输入（2-20个字符）。", "speaker": "系统", "description": "名称验证失败提示"}'
WHERE graph_id = 11 AND node_id = 'dialogue_char_3';

UPDATE graph_nodes SET
    node_config = '{"content": "很好！现在请选择你的角色职业。", "speaker": "系统", "description": "提示选择职业"}'
WHERE graph_id = 11 AND node_id = 'dialogue_char_4';

UPDATE graph_nodes SET
    node_config = '{"prompt": "选择你的职业：", "options": [{"id": "warrior", "text": "战士 - 高生命值，近战攻击", "effects": {"baseHealth": 100, "baseAttack": 15, "baseDefense": 10}}, {"id": "mage", "text": "法师 - 高魔法值，远程攻击", "effects": {"baseHealth": 60, "baseMana": 100, "baseAttack": 20, "baseDefense": 5}}, {"id": "rogue", "text": "盗贼 - 高敏捷，暴击伤害", "effects": {"baseHealth": 70, "baseAgility": 20, "baseAttack": 18, "baseDefense": 8}}, {"id": "priest", "text": "牧师 - 治疗能力，辅助技能", "effects": {"baseHealth": 80, "baseMana": 80, "baseHealing": 15, "baseDefense": 7}}], "description": "职业选择"}'
WHERE graph_id = 11 AND node_id = 'choice_char_1';

UPDATE graph_nodes SET
    node_config = '{"changes": {"characterClass": "{{selectedClass}}", "baseAttributes": "{{classAttributes}}"}, "description": "应用职业属性"}'
WHERE graph_id = 11 AND node_id = 'state_change_char_1';

UPDATE graph_nodes SET
    node_config = '{"content": "现在让我们配置你的初始技能点。", "speaker": "系统", "description": "技能配置提示"}'
WHERE graph_id = 11 AND node_id = 'dialogue_char_5';

UPDATE graph_nodes SET
    node_config = '{"skill": "skillPoints", "difficulty": 10, "availablePoints": 20, "skills": ["strength", "intelligence", "agility", "vitality"], "successEffects": {"skillPointsAllocated": true}, "failureEffects": {}, "description": "分配技能点"}'
WHERE graph_id = 11 AND node_id = 'skill_check_char_1';

UPDATE graph_nodes SET
    node_config = '{"changes": {"skills": "{{allocatedSkills}}", "skillPointsUsed": "{{skillPointsUsed}}"}, "description": "保存技能点分配"}'
WHERE graph_id = 11 AND node_id = 'state_change_char_2';

UPDATE graph_nodes SET
    node_config = '{"content": "最后，让我们定制你的角色外观。", "speaker": "系统", "description": "外观定制提示"}'
WHERE graph_id = 11 AND node_id = 'dialogue_char_6';

UPDATE graph_nodes SET
    node_config = '{"prompt": "选择角色外观风格：", "options": [{"id": "classic", "text": "经典风格", "effects": {"appearanceStyle": "classic"}}, {"id": "modern", "text": "现代风格", "effects": {"appearanceStyle": "modern"}}, {"id": "fantasy", "text": "奇幻风格", "effects": {"appearanceStyle": "fantasy"}}, {"id": "random", "text": "随机生成", "effects": {"appearanceStyle": "random"}}], "description": "外观选择"}'
WHERE graph_id = 11 AND node_id = 'choice_char_2';

UPDATE graph_nodes SET
    node_config = '{"changes": {"appearance": "{{selectedAppearance}}", "avatarUrl": "{{generatedAvatarUrl}}"}, "description": "应用外观设置"}'
WHERE graph_id = 11 AND node_id = 'state_change_char_3';

UPDATE graph_nodes SET
    node_config = '{"content": "角色信息已配置完成！请确认是否保存。", "speaker": "系统", "description": "确认保存提示"}'
WHERE graph_id = 11 AND node_id = 'dialogue_char_7';

UPDATE graph_nodes SET
    node_config = '{"prompt": "确认保存角色？", "options": [{"id": "confirm", "text": "确认保存", "effects": {}}, {"id": "cancel", "text": "取消，重新编辑", "effects": {}}, {"id": "preview", "text": "预览角色信息", "effects": {}}], "description": "确认保存"}'
WHERE graph_id = 11 AND node_id = 'choice_char_3';

UPDATE graph_nodes SET
    node_config = '{"condition": "userChoice == \"confirm\"", "description": "判断是否确认保存"}'
WHERE graph_id = 11 AND node_id = 'condition_char_2';

UPDATE graph_nodes SET
    node_config = '{"changes": {"characterCreated": true, "characterId": "{{generatedCharacterId}}", "createdAt": "{{currentTimestamp}}"}, "description": "保存角色到数据库"}'
WHERE graph_id = 11 AND node_id = 'state_change_char_4';

UPDATE graph_nodes SET
    node_config = '{"content": "角色创建成功！欢迎来到游戏世界！", "speaker": "系统", "description": "创建成功提示"}'
WHERE graph_id = 11 AND node_id = 'dialogue_char_8';

UPDATE graph_nodes SET
    node_config = '{"content": "角色名称：{{characterName}}\\n职业：{{characterClass}}\\n属性：{{characterAttributes}}\\n技能：{{characterSkills}}\\n外观：{{appearanceStyle}}", "speaker": "系统", "description": "显示角色预览信息"}'
WHERE graph_id = 11 AND node_id = 'dialogue_char_9';

UPDATE graph_nodes SET
    node_config = '{"content": "已取消保存，你可以重新编辑角色信息。", "speaker": "系统", "description": "取消保存提示"}'
WHERE graph_id = 11 AND node_id = 'dialogue_char_10';

UPDATE graph_nodes SET
    node_config = '{"result": "角色创建成功", "description": "角色创建流程成功结束"}'
WHERE graph_id = 11 AND node_id = 'end_char_1';

UPDATE graph_nodes SET
    node_config = '{"result": "角色创建已取消", "description": "用户取消创建流程"}'
WHERE graph_id = 11 AND node_id = 'end_char_2';

-- ============================================
-- Graph ID = 12: 剧本编辑示例 - 三幕剧
-- ============================================

UPDATE graph_nodes SET
    node_config = '{"name": "开始创建剧本", "description": "剧本编辑流程开始"}'
WHERE graph_id = 12 AND node_id = 'start_script_1';

UPDATE graph_nodes SET
    node_config = '{"content": "欢迎使用剧本编辑器！让我们开始创建你的剧本吧。", "speaker": "系统", "description": "欢迎信息"}'
WHERE graph_id = 12 AND node_id = 'dialogue_script_1';

UPDATE graph_nodes SET
    node_config = '{"content": "首先，请输入剧本的基本信息：名称、类型、简介等。", "speaker": "系统", "description": "提示输入剧本基本信息"}'
WHERE graph_id = 12 AND node_id = 'dialogue_script_2';

UPDATE graph_nodes SET
    node_config = '{"waitType": "USER_INPUT", "waitCondition": "scriptBasicInfo", "timeout": 60000, "description": "等待用户输入剧本基本信息"}'
WHERE graph_id = 12 AND node_id = 'wait_script_1';

UPDATE graph_nodes SET
    node_config = '{"changes": {"scriptName": "{{scriptName}}", "scriptType": "{{scriptType}}", "scriptDescription": "{{scriptDescription}}", "scriptGenre": "{{scriptGenre}}"}, "description": "保存剧本基本信息"}'
WHERE graph_id = 12 AND node_id = 'state_change_script_1';

UPDATE graph_nodes SET
    node_config = '{"content": "现在让我们创建剧本的第一幕场景。", "speaker": "系统", "description": "提示创建场景"}'
WHERE graph_id = 12 AND node_id = 'dialogue_script_3';

UPDATE graph_nodes SET
    node_config = '{"content": "第一幕：故事的开始。主角在一个神秘的小镇上醒来，发现自己失去了记忆。", "speaker": "旁白", "description": "第一幕场景介绍"}'
WHERE graph_id = 12 AND node_id = 'dialogue_script_4';

UPDATE graph_nodes SET
    node_config = '{"changes": {"scenes": [{"sceneId": "scene_1", "sceneName": "第一幕：失忆", "sceneOrder": 1, "sceneDescription": "主角在小镇上醒来"}], "currentScene": "scene_1"}, "description": "创建第一幕场景"}'
WHERE graph_id = 12 AND node_id = 'state_change_script_2';

UPDATE graph_nodes SET
    node_config = '{"content": "你醒来了。头很痛，周围的一切都很陌生。一位老人向你走来...", "speaker": "旁白", "description": "第一幕对话开始"}'
WHERE graph_id = 12 AND node_id = 'dialogue_script_5';

UPDATE graph_nodes SET
    node_config = '{"content": "年轻人，你终于醒了。这里是遗忘小镇，你已经昏迷三天了。", "speaker": "老人-张伯", "description": "老人对话"}'
WHERE graph_id = 12 AND node_id = 'dialogue_script_6';

UPDATE graph_nodes SET
    node_config = '{"prompt": "你如何回应？", "options": [{"id": "ask_who", "text": "我是谁？这里是哪里？", "effects": {"trust": 5}}, {"id": "ask_what", "text": "发生了什么？我为什么在这里？", "effects": {"trust": 3}}, {"id": "say_thanks", "text": "谢谢你救了我", "effects": {"trust": 10, "favorability": 5}}], "description": "玩家回应选择"}'
WHERE graph_id = 12 AND node_id = 'choice_script_1';

UPDATE graph_nodes SET
    node_config = '{"content": "根据你的选择，老人给出了不同的回应...", "speaker": "系统", "description": "选择后的对话"}'
WHERE graph_id = 12 AND node_id = 'dialogue_script_7';

UPDATE graph_nodes SET
    node_config = '{"condition": "userChoice == \"say_thanks\"", "description": "判断是否选择了感谢"}'
WHERE graph_id = 12 AND node_id = 'condition_script_1';

UPDATE graph_nodes SET
    node_config = '{"content": "张伯：不用谢，孩子。你看起来很困惑，让我告诉你一些关于这个小镇的事情吧。", "speaker": "老人-张伯", "description": "感谢后的特殊对话"}'
WHERE graph_id = 12 AND node_id = 'dialogue_script_8';

UPDATE graph_nodes SET
    node_config = '{"content": "张伯：我知道你有很多疑问，但现在最重要的是恢复你的记忆。", "speaker": "老人-张伯", "description": "其他选择的对话"}'
WHERE graph_id = 12 AND node_id = 'dialogue_script_9';

UPDATE graph_nodes SET
    node_config = '{"changes": {"characterRelations": {"old_man": "{{trust}}", "favorability": "{{favorability}}"}, "storyProgress": "act1_complete"}, "description": "更新角色关系"}'
WHERE graph_id = 12 AND node_id = 'state_change_script_3';

UPDATE graph_nodes SET
    node_config = '{"content": "第一幕结束。主角决定在小镇上寻找线索，恢复自己的记忆...", "speaker": "旁白", "description": "第一幕结束"}'
WHERE graph_id = 12 AND node_id = 'dialogue_script_10';

UPDATE graph_nodes SET
    node_config = '{"content": "第二幕：探索与发现。主角在小镇中探索，发现了一些神秘的线索。", "speaker": "旁白", "description": "第二幕场景介绍"}'
WHERE graph_id = 12 AND node_id = 'dialogue_script_11';

UPDATE graph_nodes SET
    node_config = '{"changes": {"scenes": [{"sceneId": "scene_2", "sceneName": "第二幕：探索", "sceneOrder": 2, "sceneDescription": "主角在小镇中探索"}], "currentScene": "scene_2"}, "description": "创建第二幕场景"}'
WHERE graph_id = 12 AND node_id = 'state_change_script_4';

UPDATE graph_nodes SET
    node_config = '{"skill": "exploration", "difficulty": 12, "successEffects": {"cluesFound": 1, "progress": 20}, "failureEffects": {"progress": 10}, "description": "探索技能检查"}'
WHERE graph_id = 12 AND node_id = 'skill_check_script_1';

UPDATE graph_nodes SET
    node_config = '{"condition": "skillCheckResult == true", "description": "判断探索是否成功"}'
WHERE graph_id = 12 AND node_id = 'condition_script_2';

UPDATE graph_nodes SET
    node_config = '{"content": "你发现了一张旧照片，照片上的人看起来和你很像...", "speaker": "旁白", "description": "探索成功"}'
WHERE graph_id = 12 AND node_id = 'dialogue_script_12';

UPDATE graph_nodes SET
    node_config = '{"content": "你在小镇中转了很久，但没有发现什么特别的东西...", "speaker": "旁白", "description": "探索失败"}'
WHERE graph_id = 12 AND node_id = 'dialogue_script_13';

-- ============================================
-- Graph ID = 13: 角色技能编辑系统
-- ============================================

UPDATE graph_nodes SET
    node_config = '{"name": "开始技能编辑", "description": "技能编辑流程开始"}'
WHERE graph_id = 13 AND node_id = 'start_skill_1';

UPDATE graph_nodes SET
    node_config = '{"content": "欢迎进入角色技能管理系统！", "speaker": "系统", "description": "欢迎信息"}'
WHERE graph_id = 13 AND node_id = 'dialogue_skill_1';

UPDATE graph_nodes SET
    node_config = '{"content": "当前技能值：\\n力量：{{strength}}\\n智力：{{intelligence}}\\n敏捷：{{agility}}\\n体质：{{vitality}}", "speaker": "系统", "description": "显示当前技能值"}'
WHERE graph_id = 13 AND node_id = 'dialogue_skill_2';

UPDATE graph_nodes SET
    node_config = '{"prompt": "请选择操作：", "options": [{"id": "view", "text": "查看技能", "nextNodeId": "dialogue_skill_2"}, {"id": "edit", "text": "编辑技能", "nextNodeId": "choice_skill_2"}, {"id": "train", "text": "技能训练", "nextNodeId": "choice_skill_3"}, {"id": "validate", "text": "技能验证", "nextNodeId": "skill_check_1"}, {"id": "reset", "text": "重置技能", "nextNodeId": "choice_reset"}, {"id": "exit", "text": "退出", "nextNodeId": "end_skill_1"}], "description": "主菜单选择"}'
WHERE graph_id = 13 AND node_id = 'choice_skill_1';

UPDATE graph_nodes SET
    node_config = '{"prompt": "选择要编辑的技能：", "options": [{"id": "edit_strength", "text": "编辑力量", "nextNodeId": "choice_edit_method"}, {"id": "edit_intelligence", "text": "编辑智力", "nextNodeId": "choice_edit_method"}, {"id": "edit_agility", "text": "编辑敏捷", "nextNodeId": "choice_edit_method"}, {"id": "edit_vitality", "text": "编辑体质", "nextNodeId": "choice_edit_method"}, {"id": "back", "text": "返回主菜单", "nextNodeId": "choice_skill_1"}], "description": "选择要编辑的技能"}'
WHERE graph_id = 13 AND node_id = 'choice_skill_2';

UPDATE graph_nodes SET
    node_config = '{"prompt": "选择编辑方式：", "options": [{"id": "set", "text": "直接设置值", "nextNodeId": "wait_set_value"}, {"id": "add", "text": "增加值", "nextNodeId": "wait_add_value"}, {"id": "subtract", "text": "减少值", "nextNodeId": "wait_subtract_value"}, {"id": "back", "text": "返回", "nextNodeId": "choice_skill_2"}], "description": "选择编辑方式"}'
WHERE graph_id = 13 AND node_id = 'choice_edit_method';

UPDATE graph_nodes SET
    node_config = '{"waitType": "USER_INPUT", "waitCondition": "skillValue", "timeout": 60000, "description": "等待输入技能值"}'
WHERE graph_id = 13 AND node_id = 'wait_set_value';

UPDATE graph_nodes SET
    node_config = '{"changes": [{"type": "SKILL", "target": "{{selectedSkill}}", "operation": "SET", "value": "{{skillValue}}"}], "description": "设置技能值"}'
WHERE graph_id = 13 AND node_id = 'state_change_set';

UPDATE graph_nodes SET
    node_config = '{"waitType": "USER_INPUT", "waitCondition": "addValue", "timeout": 60000, "description": "等待输入增加值"}'
WHERE graph_id = 13 AND node_id = 'wait_add_value';

UPDATE graph_nodes SET
    node_config = '{"changes": [{"type": "SKILL", "target": "{{selectedSkill}}", "operation": "ADD", "value": "{{addValue}}"}], "description": "增加技能值"}'
WHERE graph_id = 13 AND node_id = 'state_change_add';

UPDATE graph_nodes SET
    node_config = '{"waitType": "USER_INPUT", "waitCondition": "subtractValue", "timeout": 60000, "description": "等待输入减少值"}'
WHERE graph_id = 13 AND node_id = 'wait_subtract_value';

UPDATE graph_nodes SET
    node_config = '{"changes": [{"type": "SKILL", "target": "{{selectedSkill}}", "operation": "SUBTRACT", "value": "{{subtractValue}}"}], "description": "减少技能值"}'
WHERE graph_id = 13 AND node_id = 'state_change_subtract';

UPDATE graph_nodes SET
    node_config = '{"content": "技能修改成功！", "speaker": "系统", "description": "修改成功提示"}'
WHERE graph_id = 13 AND node_id = 'dialogue_skill_3';

UPDATE graph_nodes SET
    node_config = '{"prompt": "选择训练类型：", "options": [{"id": "train_strength", "text": "力量训练（力量+5）", "nextNodeId": "state_change_train_strength", "effects": {"skillChange": {"strength": 5}}}, {"id": "train_intelligence", "text": "智力训练（智力+5）", "nextNodeId": "state_change_train_intelligence", "effects": {"skillChange": {"intelligence": 5}}}, {"id": "train_agility", "text": "敏捷训练（敏捷+5）", "nextNodeId": "state_change_train_agility", "effects": {"skillChange": {"agility": 5}}}, {"id": "train_vitality", "text": "体质训练（体质+5）", "nextNodeId": "state_change_train_vitality", "effects": {"skillChange": {"vitality": 5}}}, {"id": "back", "text": "返回主菜单", "nextNodeId": "choice_skill_1"}], "description": "技能训练选择"}'
WHERE graph_id = 13 AND node_id = 'choice_skill_3';

UPDATE graph_nodes SET
    node_config = '{"changes": [{"type": "SKILL", "target": "strength", "operation": "ADD", "value": 5}], "description": "力量训练"}'
WHERE graph_id = 13 AND node_id = 'state_change_train_strength';

UPDATE graph_nodes SET
    node_config = '{"changes": [{"type": "SKILL", "target": "intelligence", "operation": "ADD", "value": 5}], "description": "智力训练"}'
WHERE graph_id = 13 AND node_id = 'state_change_train_intelligence';

UPDATE graph_nodes SET
    node_config = '{"changes": [{"type": "SKILL", "target": "agility", "operation": "ADD", "value": 5}], "description": "敏捷训练"}'
WHERE graph_id = 13 AND node_id = 'state_change_train_agility';

UPDATE graph_nodes SET
    node_config = '{"changes": [{"type": "SKILL", "target": "vitality", "operation": "ADD", "value": 5}], "description": "体质训练"}'
WHERE graph_id = 13 AND node_id = 'state_change_train_vitality';

UPDATE graph_nodes SET
    node_config = '{"content": "训练完成！你的技能得到了提升。", "speaker": "系统", "description": "训练结果"}'
WHERE graph_id = 13 AND node_id = 'dialogue_skill_4';

UPDATE graph_nodes SET
    node_config = '{"skillId": "strength", "operator": ">=", "requiredValue": 50, "successNodeId": "dialogue_skill_high", "failureNodeId": "dialogue_skill_low", "description": "验证力量技能"}'
WHERE graph_id = 13 AND node_id = 'skill_check_1';

UPDATE graph_nodes SET
    node_config = '{"content": "你的力量技能足够高（>=50），可以解锁高级功能！", "speaker": "系统", "description": "技能足够高"}'
WHERE graph_id = 13 AND node_id = 'dialogue_skill_high';

UPDATE graph_nodes SET
    node_config = '{"content": "你的力量技能还不够高（<50），需要继续训练。", "speaker": "系统", "description": "技能不够"}'
WHERE graph_id = 13 AND node_id = 'dialogue_skill_low';

UPDATE graph_nodes SET
    node_config = '{"prompt": "确认重置所有技能为初始值（20）？", "options": [{"id": "confirm", "text": "确认重置", "nextNodeId": "state_change_reset"}, {"id": "cancel", "text": "取消", "nextNodeId": "choice_skill_1"}], "description": "确认重置"}'
WHERE graph_id = 13 AND node_id = 'choice_reset';

-- 通用修复：使用REPLACE函数修复剩余的乱码
UPDATE graph_nodes SET
    node_config = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        node_config,
        'å¼€å§‹', '开始'),
        'ä»»åŠ¡', '任务'),
        'å†''é™©è€…', '冒险者'),
        'ä½ å¥½', '你好'),
        'æœ‰ä¸€ä¸ª', '有一个'),
        'å±é™©', '危险'),
        'éœ€è¦''', '需要'),
        'åŽ»å®Œæˆ', '去完成'),
        'æ''é•¿', '村长'),
        'çŽ©å®¶', '玩家'),
        'ä»‹ç»''', '介绍'),
        'å¥½äº†', '太好了'),
        'è¿›å…¥', '进入'),
        'æ£·æž—', '森林'),
        'æ·±å¤„', '深处'),
        'æ‰¾åˆ°', '找到'),
        'ç¥žç§˜', '神秘'),
        'å®æ¯Œ', '宝藏'),
        'æŽ¢ç´¢', '探索'),
        'æŠ€èƒ½', '技能'),
        'æ£€æŸ¥', '检查'),
        'æˆ''åŠŸ', '成功'),
        'å¤±è´¥', '失败'),
        'è§''è‰²', '角色'),
        'åˆ›å»º', '创建'),
        'ç³»ç»Ÿ', '系统'),
        'æ¬¢è¿Ž', '欢迎'),
        'è®¾ç½®', '设置'),
        'å‰§æœ¬', '剧本'),
        'ç¼–è¾''', '编辑'),
        'ä¸‰å¹•å‰§', '三幕剧')
WHERE node_config LIKE '%å%' OR node_config LIKE '%è%';
