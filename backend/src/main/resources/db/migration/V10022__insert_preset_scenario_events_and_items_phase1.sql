-- 第一阶段：为现实时代场景创建预置事件和物品
-- 场景：我的大学、我的中学、我的工作、我的童年、我的故乡

-- 设置字符集
SET NAMES utf8mb4;

-- 注意：由于 scenario_events 和 scenario_items 表使用 era_id 引用 eras 表（用户场景），
-- 而系统场景是 system_eras 表，这里我们创建系统预设的事件和物品（is_system = true, era_id = NULL）
-- 这些预设的事件和物品可以在用户选择对应系统场景时使用

-- ========== 我的大学场景 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('上课迟到', 'event_university_late_to_class', '早上第一节课迟到了，被老师点名', NULL, NULL, TRUE, NULL, '大学,学习,迟到,课堂', 1, TRUE, FALSE),
('图书馆偶遇', 'event_university_library_encounter', '在图书馆偶然遇到了同学/老师', NULL, NULL, TRUE, NULL, '大学,学习,图书馆,社交', 2, TRUE, FALSE),
('社团活动', 'event_university_club_activity', '参加了有趣的社团活动', NULL, NULL, TRUE, NULL, '大学,社团,活动,社交', 3, TRUE, FALSE),
('考试前夕', 'event_university_before_exam', '考试前夜在宿舍/图书馆复习', NULL, NULL, TRUE, NULL, '大学,考试,学习,压力', 4, TRUE, FALSE),
('食堂偶遇', 'event_university_canteen_meet', '在食堂排队时遇到了熟悉的人', NULL, NULL, TRUE, NULL, '大学,食堂,偶遇,社交', 5, TRUE, FALSE),
('宿舍聊天', 'event_university_dorm_chat', '晚上在宿舍和室友聊天', NULL, NULL, TRUE, NULL, '大学,宿舍,聊天,友情', 6, TRUE, FALSE),
('选课成功', 'event_university_course_selection', '成功选上了心仪的选修课', NULL, NULL, TRUE, NULL, '大学,选课,学习,成就', 7, TRUE, FALSE),
('毕业论文', 'event_university_thesis', '开始准备毕业论文', NULL, NULL, TRUE, NULL, '大学,论文,毕业,学习', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('学生证', 'item_university_student_id', '大学学生证，可以用于图书馆、食堂等场所', NULL, NULL, TRUE, NULL, 'key', '大学,证件,必需', 1, TRUE, FALSE),
('课本', 'item_university_textbook', '专业课本，课堂上需要的教材', NULL, NULL, TRUE, NULL, 'tool', '大学,学习,教材', 2, TRUE, FALSE),
('笔记本', 'item_university_notebook', '课堂笔记，记录了重要的知识点', NULL, NULL, TRUE, NULL, 'tool', '大学,学习,笔记', 3, TRUE, FALSE),
('校园卡', 'item_university_campus_card', '校园一卡通，可以充值消费', NULL, NULL, TRUE, NULL, 'key', '大学,卡片,生活', 4, TRUE, FALSE),
('社团徽章', 'item_university_club_badge', '参加社团获得的徽章', NULL, NULL, TRUE, NULL, 'collectible', '大学,社团,纪念', 5, TRUE, FALSE),
('奖学金证书', 'item_university_scholarship', '获得的奖学金证书', NULL, NULL, TRUE, NULL, 'collectible', '大学,成就,荣誉', 6, TRUE, FALSE),
('实验报告', 'item_university_lab_report', '完成的实验报告', NULL, NULL, TRUE, NULL, 'tool', '大学,实验,作业', 7, TRUE, FALSE),
('毕业设计', 'item_university_graduation_project', '毕业设计作品', NULL, NULL, TRUE, NULL, 'collectible', '大学,毕业,作品', 8, TRUE, FALSE);

-- ========== 我的中学场景 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('课堂提问', 'event_high_school_class_question', '老师点名回答问题', NULL, NULL, TRUE, NULL, '中学,课堂,提问,学习', 1, TRUE, FALSE),
('课间聊天', 'event_high_school_recess_chat', '课间和同学聊天', NULL, NULL, TRUE, NULL, '中学,课间,聊天,友谊', 2, TRUE, FALSE),
('考试焦虑', 'event_high_school_exam_anxiety', '考试前的紧张和焦虑', NULL, NULL, TRUE, NULL, '中学,考试,压力,情绪', 3, TRUE, FALSE),
('体育课', 'event_high_school_pe_class', '体育课上运动', NULL, NULL, TRUE, NULL, '中学,体育,运动,健康', 4, TRUE, FALSE),
('放学回家', 'event_high_school_after_school', '放学后回家的路上', NULL, NULL, TRUE, NULL, '中学,放学,回家,日常', 5, TRUE, FALSE),
('作业完成', 'event_high_school_homework_done', '完成了当天的作业', NULL, NULL, TRUE, NULL, '中学,作业,学习,成就', 6, TRUE, FALSE),
('班级活动', 'event_high_school_class_activity', '参加班级组织的活动', NULL, NULL, TRUE, NULL, '中学,班级,活动,集体', 7, TRUE, FALSE),
('青春烦恼', 'event_high_school_youth_trouble', '青春期的烦恼和困惑', NULL, NULL, TRUE, NULL, '中学,青春,烦恼,成长', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('校服', 'item_high_school_uniform', '中学校服，每天都要穿', NULL, NULL, TRUE, NULL, 'tool', '中学,校服,必需', 1, TRUE, FALSE),
('作业本', 'item_high_school_homework', '写作业的本子', NULL, NULL, TRUE, NULL, 'tool', '中学,作业,学习', 2, TRUE, FALSE),
('试卷', 'item_high_school_test_paper', '考试试卷', NULL, NULL, TRUE, NULL, 'tool', '中学,考试,成绩', 3, TRUE, FALSE),
('学生证', 'item_high_school_student_id', '中学学生证', NULL, NULL, TRUE, NULL, 'key', '中学,证件,必需', 4, TRUE, FALSE),
('奖状', 'item_high_school_certificate', '获得的奖状', NULL, NULL, TRUE, NULL, 'collectible', '中学,荣誉,成就', 5, TRUE, FALSE),
('同学录', 'item_high_school_autograph_book', '毕业时的同学录', NULL, NULL, TRUE, NULL, 'collectible', '中学,毕业,友谊', 6, TRUE, FALSE),
('运动鞋', 'item_high_school_sneakers', '体育课用的运动鞋', NULL, NULL, TRUE, NULL, 'tool', '中学,体育,运动', 7, TRUE, FALSE),
('书包', 'item_high_school_backpack', '每天背的书包', NULL, NULL, TRUE, NULL, 'tool', '中学,书包,必需', 8, TRUE, FALSE);

-- ========== 我的工作场景 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('工作会议', 'event_work_meeting', '参加工作会议，讨论项目进展', NULL, NULL, TRUE, NULL, '工作,会议,项目,职场', 1, TRUE, FALSE),
('加班', 'event_work_overtime', '需要加班完成工作任务', NULL, NULL, TRUE, NULL, '工作,加班,压力,职场', 2, TRUE, FALSE),
('同事聚餐', 'event_work_colleague_dinner', '和同事一起聚餐', NULL, NULL, TRUE, NULL, '工作,聚餐,社交,职场', 3, TRUE, FALSE),
('项目成功', 'event_work_project_success', '项目成功完成，获得认可', NULL, NULL, TRUE, NULL, '工作,成功,成就,职场', 4, TRUE, FALSE),
('职场冲突', 'event_work_conflict', '工作中遇到意见分歧', NULL, NULL, TRUE, NULL, '工作,冲突,压力,职场', 5, TRUE, FALSE),
('晋升机会', 'event_work_promotion', '获得晋升或加薪的机会', NULL, NULL, TRUE, NULL, '工作,晋升,机会,职场', 6, TRUE, FALSE),
('培训学习', 'event_work_training', '参加公司组织的培训', NULL, NULL, TRUE, NULL, '工作,培训,学习,职场', 7, TRUE, FALSE),
('工作压力', 'event_work_stress', '工作压力大，感到疲惫', NULL, NULL, TRUE, NULL, '工作,压力,疲惫,职场', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('工牌', 'item_work_badge', '公司工牌，进出办公室需要', NULL, NULL, TRUE, NULL, 'key', '工作,证件,必需', 1, TRUE, FALSE),
('笔记本电脑', 'item_work_laptop', '工作用的笔记本电脑', NULL, NULL, TRUE, NULL, 'tool', '工作,电脑,工具', 2, TRUE, FALSE),
('名片', 'item_work_business_card', '商务名片', NULL, NULL, TRUE, NULL, 'tool', '工作,商务,社交', 3, TRUE, FALSE),
('项目文档', 'item_work_project_document', '项目相关的文档资料', NULL, NULL, TRUE, NULL, 'tool', '工作,文档,项目', 4, TRUE, FALSE),
('咖啡杯', 'item_work_coffee_cup', '办公室的咖啡杯', NULL, NULL, TRUE, NULL, 'consumable', '工作,咖啡,日常', 5, TRUE, FALSE),
('年终奖', 'item_work_bonus', '获得的年终奖金', NULL, NULL, TRUE, NULL, 'collectible', '工作,奖励,成就', 6, TRUE, FALSE),
('工作证', 'item_work_employee_id', '员工工作证', NULL, NULL, TRUE, NULL, 'key', '工作,证件,身份', 7, TRUE, FALSE),
('会议记录', 'item_work_meeting_notes', '工作会议的记录', NULL, NULL, TRUE, NULL, 'tool', '工作,会议,记录', 8, TRUE, FALSE);

-- ========== 我的童年场景 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('游戏时间', 'event_childhood_play', '和小伙伴一起玩耍', NULL, NULL, TRUE, NULL, '童年,游戏,玩耍,快乐', 1, TRUE, FALSE),
('上学第一天', 'event_childhood_first_day', '第一天去学校', NULL, NULL, TRUE, NULL, '童年,上学,第一次,成长', 2, TRUE, FALSE),
('收到礼物', 'event_childhood_gift', '收到了喜欢的礼物', NULL, NULL, TRUE, NULL, '童年,礼物,快乐,惊喜', 3, TRUE, FALSE),
('做错事', 'event_childhood_mistake', '做错了事情，被大人批评', NULL, NULL, TRUE, NULL, '童年,错误,批评,成长', 4, TRUE, FALSE),
('过生日', 'event_childhood_birthday', '过生日，收到祝福和礼物', NULL, NULL, TRUE, NULL, '童年,生日,庆祝,快乐', 5, TRUE, FALSE),
('探索新地方', 'event_childhood_explore', '探索新的地方，充满好奇', NULL, NULL, TRUE, NULL, '童年,探索,好奇,冒险', 6, TRUE, FALSE),
('和小伙伴吵架', 'event_childhood_quarrel', '和小伙伴发生争执', NULL, NULL, TRUE, NULL, '童年,吵架,友谊,矛盾', 7, TRUE, FALSE),
('学会新技能', 'event_childhood_learn', '学会了新的技能或知识', NULL, NULL, TRUE, NULL, '童年,学习,成长,成就', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('玩具', 'item_childhood_toy', '喜欢的玩具', NULL, NULL, TRUE, NULL, 'collectible', '童年,玩具,快乐', 1, TRUE, FALSE),
('糖果', 'item_childhood_candy', '好吃的糖果', NULL, NULL, TRUE, NULL, 'consumable', '童年,糖果,零食', 2, TRUE, FALSE),
('作业本', 'item_childhood_homework', '写作业的本子', NULL, NULL, TRUE, NULL, 'tool', '童年,作业,学习', 3, TRUE, FALSE),
('小红花', 'item_childhood_star', '老师奖励的小红花或星星', NULL, NULL, TRUE, NULL, 'collectible', '童年,奖励,荣誉', 4, TRUE, FALSE),
('书包', 'item_childhood_backpack', '小书包', NULL, NULL, TRUE, NULL, 'tool', '童年,书包,必需', 5, TRUE, FALSE),
('彩色笔', 'item_childhood_crayons', '画画用的彩色笔', NULL, NULL, TRUE, NULL, 'tool', '童年,画画,创作', 6, TRUE, FALSE),
('零食', 'item_childhood_snack', '各种小零食', NULL, NULL, TRUE, NULL, 'consumable', '童年,零食,快乐', 7, TRUE, FALSE),
('照片', 'item_childhood_photo', '童年的照片', NULL, NULL, TRUE, NULL, 'collectible', '童年,照片,回忆', 8, TRUE, FALSE);

-- ========== 我的故乡场景 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('回到故乡', 'event_hometown_return', '回到久别的故乡', NULL, NULL, TRUE, NULL, '故乡,回家,情感,回忆', 1, TRUE, FALSE),
('遇见老友', 'event_hometown_old_friend', '在故乡遇到了老朋友', NULL, NULL, TRUE, NULL, '故乡,朋友,回忆,友情', 2, TRUE, FALSE),
('故地重游', 'event_hometown_revisit', '重游小时候常去的地方', NULL, NULL, TRUE, NULL, '故乡,回忆,怀旧,情感', 3, TRUE, FALSE),
('家乡美食', 'event_hometown_food', '品尝家乡的特色美食', NULL, NULL, TRUE, NULL, '故乡,美食,味道,回忆', 4, TRUE, FALSE),
('变化', 'event_hometown_change', '发现故乡的变化', NULL, NULL, TRUE, NULL, '故乡,变化,时光,感慨', 5, TRUE, FALSE),
('童年回忆', 'event_hometown_memory', '回忆起童年的往事', NULL, NULL, TRUE, NULL, '故乡,回忆,童年,情感', 6, TRUE, FALSE),
('乡亲聊天', 'event_hometown_chat', '和乡亲们聊天', NULL, NULL, TRUE, NULL, '故乡,聊天,人情,温暖', 7, TRUE, FALSE),
('离开故乡', 'event_hometown_departure', '再次离开故乡', NULL, NULL, TRUE, NULL, '故乡,离别,不舍,情感', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('家乡特产', 'item_hometown_specialty', '家乡的特产', NULL, NULL, TRUE, NULL, 'consumable', '故乡,特产,味道', 1, TRUE, FALSE),
('老照片', 'item_hometown_old_photo', '故乡的老照片', NULL, NULL, TRUE, NULL, 'collectible', '故乡,照片,回忆', 2, TRUE, FALSE),
('门钥匙', 'item_hometown_key', '故乡家里的门钥匙', NULL, NULL, TRUE, NULL, 'key', '故乡,钥匙,家', 3, TRUE, FALSE),
('纪念品', 'item_hometown_souvenir', '从故乡带走的纪念品', NULL, NULL, TRUE, NULL, 'collectible', '故乡,纪念,回忆', 4, TRUE, FALSE),
('家乡地图', 'item_hometown_map', '故乡的地图', NULL, NULL, TRUE, NULL, 'tool', '故乡,地图,导航', 5, TRUE, FALSE),
('旧物', 'item_hometown_old_item', '故乡的旧物件', NULL, NULL, TRUE, NULL, 'collectible', '故乡,旧物,回忆', 6, TRUE, FALSE),
('信件', 'item_hometown_letter', '来自故乡的信件', NULL, NULL, TRUE, NULL, 'collectible', '故乡,信件,思念', 7, TRUE, FALSE),
('家乡味道', 'item_hometown_taste', '家乡的味道（可以是食品或香料）', NULL, NULL, TRUE, NULL, 'consumable', '故乡,味道,回忆', 8, TRUE, FALSE);

