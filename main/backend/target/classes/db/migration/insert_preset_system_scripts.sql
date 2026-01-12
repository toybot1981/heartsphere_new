-- 根据预设的时代和角色，插入预设剧本数据
-- 执行方法：mysql -u root -p123456 heartsphere --default-character-set=utf8mb4 < insert_preset_system_scripts.sql

-- 设置字符集
SET NAMES utf8mb4;

-- 清空现有数据（可选，如果需要重新初始化）
-- DELETE FROM system_scripts;

-- 插入预设剧本数据
INSERT INTO `system_scripts` (`title`, `description`, `content`, `scene_count`, `system_era_id`, `character_ids`, `tags`, `is_active`, `sort_order`) VALUES

-- 剧本1：大学青春故事 - 我的大学时代
('大学青春物语', 
'一个关于大学校园生活的青春故事，讲述大学室友和导师之间的温馨互动，以及青春成长的点滴回忆。',
'{"startNodeId": "start", "nodes": {"start": {"id": "start", "text": "欢迎来到大学校园！你是一名刚入学的新生，在宿舍里遇到了你的室友。", "backgroundHint": "大学宿舍，阳光透过窗户洒进来", "options": [{"text": "和室友打招呼", "nextNodeId": "roommate_meet"}, {"text": "整理行李", "nextNodeId": "unpack"}]}, "roommate_meet": {"id": "roommate_meet", "text": "你的室友热情地和你打招呼，你们开始聊起了大学生活。", "backgroundHint": "宿舍内，两个年轻人正在交谈", "options": [{"text": "询问学习建议", "nextNodeId": "ask_professor"}, {"text": "一起探索校园", "nextNodeId": "explore"}]}, "ask_professor": {"id": "ask_professor", "text": "你找到了大学导师，他给了你很多学习上的建议和指导。", "backgroundHint": "教师办公室，导师正在指导学生", "options": [{"text": "继续学习", "nextNodeId": "study"}, {"text": "结束", "nextNodeId": "end"}]}}}',
3,
(SELECT id FROM system_eras WHERE name = '我的大学' LIMIT 1),
JSON_ARRAY((SELECT id FROM system_characters WHERE name = '大学室友' LIMIT 1), (SELECT id FROM system_characters WHERE name = '大学导师' LIMIT 1)),
'大学,青春,校园,成长',
TRUE,
1),

-- 剧本2：三国英雄传 - 三国时代
('三国英雄传', 
'一个关于三国时代英雄豪杰的故事，讲述刘备、关羽、诸葛亮等历史人物的传奇经历和英雄事迹。',
'{"startNodeId": "start", "nodes": {"start": {"id": "start", "text": "东汉末年，天下大乱。你是一名有志青年，听闻刘备仁德之名，决定投奔。", "backgroundHint": "三国时期的军营，战旗飘扬", "options": [{"text": "拜见刘备", "nextNodeId": "meet_liubei"}, {"text": "寻找关羽", "nextNodeId": "meet_guanyu"}]}, "meet_liubei": {"id": "meet_liubei", "text": "你见到了刘备，他热情地接待了你，并讲述了匡扶汉室的理想。", "backgroundHint": "军营大帐，刘备正在与众人商议", "options": [{"text": "请求见诸葛亮", "nextNodeId": "meet_zhuge"}, {"text": "结束", "nextNodeId": "end"}]}, "meet_zhuge": {"id": "meet_zhuge", "text": "你见到了卧龙诸葛亮，他展现出了超凡的智慧和谋略，让你深感敬佩。", "backgroundHint": "草庐，诸葛亮正在研究地图", "options": [{"text": "继续故事", "nextNodeId": "battle"}, {"text": "结束", "nextNodeId": "end"}]}, "battle": {"id": "battle", "text": "在诸葛亮的谋划下，你们参与了一场重要的战役，展现了英雄本色。", "backgroundHint": "战场，战马奔腾，刀光剑影", "options": [{"text": "结束", "nextNodeId": "end"}]}}}',
4,
(SELECT id FROM system_eras WHERE name = '三国时代' LIMIT 1),
JSON_ARRAY((SELECT id FROM system_characters WHERE name = '刘备' LIMIT 1), (SELECT id FROM system_characters WHERE name = '关羽' LIMIT 1), (SELECT id FROM system_characters WHERE name = '诸葛亮' LIMIT 1)),
'三国,历史,英雄,战争',
TRUE,
2),

-- 剧本3：童话王国冒险 - 童话世界
('童话王国冒险', 
'一个充满魔法和冒险的童话故事，讲述童话公主、王子、魔法师等角色在童话世界中的奇妙冒险。',
'{"startNodeId": "start", "nodes": {"start": {"id": "start", "text": "你来到了一个充满魔法的童话王国，这里住着美丽的公主和勇敢的王子。", "backgroundHint": "童话城堡，彩虹和魔法光芒", "options": [{"text": "拜访童话公主", "nextNodeId": "meet_princess"}, {"text": "寻找童话王子", "nextNodeId": "meet_prince"}]}, "meet_princess": {"id": "meet_princess", "text": "你见到了美丽的童话公主，她善良温柔，邀请你参加王国的舞会。", "backgroundHint": "华丽的宫殿，公主正在等待", "options": [{"text": "接受邀请", "nextNodeId": "ball"}, {"text": "寻找魔法师", "nextNodeId": "meet_wizard"}]}, "meet_prince": {"id": "meet_prince", "text": "你遇到了勇敢的童话王子，他正在寻找能够帮助王国解决危机的勇士。", "backgroundHint": "城堡外，王子骑着白马", "options": [{"text": "帮助王子", "nextNodeId": "adventure"}, {"text": "结束", "nextNodeId": "end"}]}, "meet_wizard": {"id": "meet_wizard", "text": "你找到了神秘的童话魔法师，他拥有强大的魔法力量，愿意传授你一些魔法知识。", "backgroundHint": "魔法塔，魔法师正在研究魔法书", "options": [{"text": "学习魔法", "nextNodeId": "learn_magic"}, {"text": "结束", "nextNodeId": "end"}]}, "ball": {"id": "ball", "text": "在舞会上，你与公主共舞，度过了一个美妙的夜晚。", "backgroundHint": "华丽的舞厅，音乐和灯光", "options": [{"text": "结束", "nextNodeId": "end"}]}, "adventure": {"id": "adventure", "text": "你和王子一起踏上了冒险之旅，克服了重重困难，最终拯救了王国。", "backgroundHint": "冒险路上，各种奇幻场景", "options": [{"text": "结束", "nextNodeId": "end"}]}, "learn_magic": {"id": "learn_magic", "text": "你学会了基础的魔法，能够使用一些简单的魔法技能。", "backgroundHint": "魔法教室，魔法光芒闪烁", "options": [{"text": "结束", "nextNodeId": "end"}]}}}',
7,
(SELECT id FROM system_eras WHERE name = '童话世界' LIMIT 1),
JSON_ARRAY((SELECT id FROM system_characters WHERE name = '童话公主' LIMIT 1), (SELECT id FROM system_characters WHERE name = '童话王子' LIMIT 1), (SELECT id FROM system_characters WHERE name = '童话魔法师' LIMIT 1)),
'童话,魔法,冒险,浪漫',
TRUE,
3),

-- 剧本4：魔法世界探索 - 魔法世界
('魔法世界探索', 
'一个关于魔法世界的奇幻冒险故事，讲述魔法师、精灵、龙骑士等角色在魔法大陆上的探索和冒险。',
'{"startNodeId": "start", "nodes": {"start": {"id": "start", "text": "你来到了一个充满魔法的世界，这里有着强大的魔法师和神秘的魔法生物。", "backgroundHint": "魔法森林，魔法光芒和神秘生物", "options": [{"text": "寻找魔法师", "nextNodeId": "meet_mage"}, {"text": "探索魔法森林", "nextNodeId": "explore_forest"}]}, "meet_mage": {"id": "meet_mage", "text": "你遇到了一位强大的魔法师，他能够掌控各种元素力量，愿意指导你学习魔法。", "backgroundHint": "魔法塔，魔法师正在施展魔法", "options": [{"text": "学习元素魔法", "nextNodeId": "learn_element"}, {"text": "寻找精灵", "nextNodeId": "meet_elf"}]}, "meet_elf": {"id": "meet_elf", "text": "你遇到了优雅的精灵弓箭手，她箭术精湛，愿意与你一起探索魔法世界。", "backgroundHint": "精灵森林，精灵正在练习射箭", "options": [{"text": "一起冒险", "nextNodeId": "adventure_together"}, {"text": "结束", "nextNodeId": "end"}]}, "learn_element": {"id": "learn_element", "text": "你学会了基础的元素魔法，能够操控火、水、风、土等元素。", "backgroundHint": "魔法训练场，各种元素在飞舞", "options": [{"text": "继续探索", "nextNodeId": "dragon_knight"}, {"text": "结束", "nextNodeId": "end"}]}, "dragon_knight": {"id": "dragon_knight", "text": "你遇到了传说中的龙骑士，他能够驾驭强大的巨龙，是魔法世界的守护者。", "backgroundHint": "高山之巅，龙骑士和巨龙", "options": [{"text": "结束", "nextNodeId": "end"}]}, "explore_forest": {"id": "explore_forest", "text": "你在魔法森林中探索，发现了许多神秘的魔法植物和生物。", "backgroundHint": "神秘的魔法森林，各种奇幻生物", "options": [{"text": "继续探索", "nextNodeId": "meet_mage"}, {"text": "结束", "nextNodeId": "end"}]}, "adventure_together": {"id": "adventure_together", "text": "你和精灵一起踏上了冒险之旅，在魔法世界中探索未知的秘密。", "backgroundHint": "冒险路上，各种魔法场景", "options": [{"text": "结束", "nextNodeId": "end"}]}}}',
7,
(SELECT id FROM system_eras WHERE name = '魔法世界' LIMIT 1),
JSON_ARRAY((SELECT id FROM system_characters WHERE name = '魔法师' LIMIT 1), (SELECT id FROM system_characters WHERE name = '精灵弓箭手' LIMIT 1), (SELECT id FROM system_characters WHERE name = '龙骑士' LIMIT 1)),
'魔法,奇幻,冒险,探索',
TRUE,
4),

-- 剧本5：未来科技之旅 - 未来世界
('未来科技之旅', 
'一个关于未来世界的科幻冒险故事，讲述未来战士、AI助手、太空探索者等角色在未来科技世界中的探索和冒险。',
'{"startNodeId": "start", "nodes": {"start": {"id": "start", "text": "你来到了2100年的未来世界，这里科技高度发达，有着先进的AI技术和太空探索能力。", "backgroundHint": "未来都市，高科技建筑和飞行器", "options": [{"text": "寻找未来战士", "nextNodeId": "meet_warrior"}, {"text": "与AI助手交流", "nextNodeId": "meet_ai"}]}, "meet_warrior": {"id": "meet_warrior", "text": "你遇到了装备精良的未来战士，他拥有最先进的科技武器，正在执行重要任务。", "backgroundHint": "未来战场，高科技装备和武器", "options": [{"text": "加入任务", "nextNodeId": "mission"}, {"text": "探索太空", "nextNodeId": "space"}]}, "meet_ai": {"id": "meet_ai", "text": "你遇到了智能AI助手，它拥有强大的计算能力和学习能力，能够帮助你解决各种问题。", "backgroundHint": "高科技实验室，AI全息投影", "options": [{"text": "请求帮助", "nextNodeId": "ai_help"}, {"text": "探索太空", "nextNodeId": "space"}]}, "mission": {"id": "mission", "text": "你和未来战士一起执行任务，使用高科技装备完成了艰巨的挑战。", "backgroundHint": "任务现场，各种高科技设备", "options": [{"text": "继续探索", "nextNodeId": "space"}, {"text": "结束", "nextNodeId": "end"}]}, "ai_help": {"id": "ai_help", "text": "AI助手为你提供了大量有用的信息和建议，帮助你更好地适应未来世界。", "backgroundHint": "AI控制中心，数据流和全息界面", "options": [{"text": "探索太空", "nextNodeId": "space"}, {"text": "结束", "nextNodeId": "end"}]}, "space": {"id": "space", "text": "你遇到了太空探索者，他正准备进行一次星际旅行，探索未知的宇宙。", "backgroundHint": "太空站，星空和宇宙飞船", "options": [{"text": "加入探索", "nextNodeId": "explore_space"}, {"text": "结束", "nextNodeId": "end"}]}, "explore_space": {"id": "explore_space", "text": "你和太空探索者一起踏上了星际之旅，在浩瀚的宇宙中探索未知的星球和文明。", "backgroundHint": "宇宙空间，各种星球和星云", "options": [{"text": "结束", "nextNodeId": "end"}]}}}',
7,
(SELECT id FROM system_eras WHERE name = '未来世界' LIMIT 1),
JSON_ARRAY((SELECT id FROM system_characters WHERE name = '未来战士' LIMIT 1), (SELECT id FROM system_characters WHERE name = 'AI助手' LIMIT 1), (SELECT id FROM system_characters WHERE name = '太空探索者' LIMIT 1)),
'未来,科幻,科技,探索',
TRUE,
5);

-- 查询插入结果
SELECT ss.id, ss.title, ss.description, se.name as era_name, ss.scene_count, ss.tags, ss.is_active, ss.sort_order 
FROM system_scripts ss 
LEFT JOIN system_eras se ON ss.system_era_id = se.id 
ORDER BY ss.sort_order, ss.id;



