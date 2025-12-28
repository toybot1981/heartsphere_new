-- 第四阶段：为奇幻魔法场景创建预置事件和物品
-- 场景：魔法世界、童话世界、蒸汽朋克

-- 设置字符集
SET NAMES utf8mb4;

-- ========== 魔法世界 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('魔法觉醒', 'event_magic_awakening', '发现自己的魔法天赋', NULL, NULL, TRUE, NULL, '魔法,觉醒,天赋,奇幻', 1, TRUE, FALSE),
('魔法学院', 'event_magic_academy', '进入魔法学院学习', NULL, NULL, TRUE, NULL, '魔法,学院,学习,奇幻', 2, TRUE, FALSE),
('召唤仪式', 'event_magic_summon', '进行魔法召唤仪式', NULL, NULL, TRUE, NULL, '魔法,召唤,仪式,奇幻', 3, TRUE, FALSE),
('魔法对决', 'event_magic_duel', '与其他魔法师进行对决', NULL, NULL, TRUE, NULL, '魔法,对决,战斗,奇幻', 4, TRUE, FALSE),
('遇见精灵', 'event_magic_elf', '遇见神秘的精灵族', NULL, NULL, TRUE, NULL, '魔法,精灵,相遇,奇幻', 5, TRUE, FALSE),
('禁咒', 'event_magic_forbidden', '接触或被禁用的魔法', NULL, NULL, TRUE, NULL, '魔法,禁咒,危险,奇幻', 6, TRUE, FALSE),
('魔法书', 'event_magic_spellbook', '发现古老的魔法书', NULL, NULL, TRUE, NULL, '魔法,书籍,知识,奇幻', 7, TRUE, FALSE),
('魔法契约', 'event_magic_pact', '与魔法生物签订契约', NULL, NULL, TRUE, NULL, '魔法,契约,约定,奇幻', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('魔法杖', 'item_magic_staff', '释放魔法的法杖', NULL, NULL, TRUE, NULL, 'weapon', '魔法,法杖,武器,奇幻', 1, TRUE, FALSE),
('魔法书', 'item_magic_spellbook', '记载魔法的书籍', NULL, NULL, TRUE, NULL, 'tool', '魔法,书籍,知识,奇幻', 2, TRUE, FALSE),
('魔法水晶', 'item_magic_crystal', '储存魔力的水晶', NULL, NULL, TRUE, NULL, 'tool', '魔法,水晶,能量,奇幻', 3, TRUE, FALSE),
('治疗药水', 'item_magic_healing_potion', '具有治疗效果的药水', NULL, NULL, TRUE, NULL, 'consumable', '魔法,药水,治疗,奇幻', 4, TRUE, FALSE),
('魔法戒指', 'item_magic_ring', '增强魔法能力的戒指', NULL, NULL, TRUE, NULL, 'tool', '魔法,戒指,增强,奇幻', 5, TRUE, FALSE),
('魔法符文', 'item_magic_rune', '具有魔法力量的符文', NULL, NULL, TRUE, NULL, 'tool', '魔法,符文,力量,奇幻', 6, TRUE, FALSE),
('魔法卷轴', 'item_magic_scroll', '记载魔法的卷轴', NULL, NULL, TRUE, NULL, 'tool', '魔法,卷轴,法术,奇幻', 7, TRUE, FALSE),
('魔力宝石', 'item_magic_gem', '蕴含魔力的宝石', NULL, NULL, TRUE, NULL, 'collectible', '魔法,宝石,珍贵,奇幻', 8, TRUE, FALSE);

-- ========== 童话世界 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('遇见小精灵', 'event_fairy_tale_fairy', '遇见可爱的小精灵', NULL, NULL, TRUE, NULL, '童话,精灵,相遇,梦幻', 1, TRUE, FALSE),
('魔法森林', 'event_fairy_tale_forest', '进入神奇的魔法森林', NULL, NULL, TRUE, NULL, '童话,森林,魔法,冒险', 2, TRUE, FALSE),
('会说话的动物', 'event_fairy_tale_talking_animal', '遇到会说话的动物', NULL, NULL, TRUE, NULL, '童话,动物,神奇,梦幻', 3, TRUE, FALSE),
('愿望实现', 'event_fairy_tale_wish', '通过魔法实现愿望', NULL, NULL, TRUE, NULL, '童话,愿望,魔法,梦想', 4, TRUE, FALSE),
('公主与王子', 'event_fairy_tale_prince', '遇见公主或王子', NULL, NULL, TRUE, NULL, '童话,公主,王子,浪漫', 5, TRUE, FALSE),
('邪恶巫婆', 'event_fairy_tale_witch', '遇到邪恶的巫婆', NULL, NULL, TRUE, NULL, '童话,巫婆,危险,挑战', 6, TRUE, FALSE),
('魔法城堡', 'event_fairy_tale_castle', '发现美丽的魔法城堡', NULL, NULL, TRUE, NULL, '童话,城堡,美丽,梦幻', 7, TRUE, FALSE),
('幸福结局', 'event_fairy_tale_happy_ending', '故事迎来幸福结局', NULL, NULL, TRUE, NULL, '童话,结局,幸福,圆满', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('魔法棒', 'item_fairy_tale_wand', '可以实现愿望的魔法棒', NULL, NULL, TRUE, NULL, 'tool', '童话,魔法棒,愿望,梦幻', 1, TRUE, FALSE),
('水晶鞋', 'item_fairy_tale_glass_slipper', '美丽的水晶鞋', NULL, NULL, TRUE, NULL, 'collectible', '童话,水晶鞋,美丽,浪漫', 2, TRUE, FALSE),
('苹果', 'item_fairy_tale_apple', '神奇的苹果（可能有魔法）', NULL, NULL, TRUE, NULL, 'consumable', '童话,苹果,神奇,危险', 3, TRUE, FALSE),
('玫瑰花', 'item_fairy_tale_rose', '代表爱情的玫瑰花', NULL, NULL, TRUE, NULL, 'collectible', '童话,玫瑰,爱情,浪漫', 4, TRUE, FALSE),
('魔法镜', 'item_fairy_tale_mirror', '可以回答问题的魔法镜', NULL, NULL, TRUE, NULL, 'tool', '童话,镜子,魔法,神奇', 5, TRUE, FALSE),
('金钥匙', 'item_fairy_tale_golden_key', '可以打开任何门的金钥匙', NULL, NULL, TRUE, NULL, 'key', '童话,钥匙,金色,神奇', 6, TRUE, FALSE),
('音乐盒', 'item_fairy_tale_music_box', '会播放美妙音乐的音乐盒', NULL, NULL, TRUE, NULL, 'collectible', '童话,音乐盒,美妙,梦幻', 7, TRUE, FALSE),
('许愿星', 'item_fairy_tale_wish_star', '可以实现愿望的星星', NULL, NULL, TRUE, NULL, 'collectible', '童话,星星,愿望,梦幻', 8, TRUE, FALSE);

-- ========== 蒸汽朋克 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('蒸汽机启动', 'event_steampunk_steam', '启动巨大的蒸汽机', NULL, NULL, TRUE, NULL, '蒸汽朋克,蒸汽,机械,工业', 1, TRUE, FALSE),
('飞艇旅行', 'event_steampunk_airship', '乘坐飞艇进行空中旅行', NULL, NULL, TRUE, NULL, '蒸汽朋克,飞艇,旅行,冒险', 2, TRUE, FALSE),
('机械改造', 'event_steampunk_modification', '进行机械身体的改造', NULL, NULL, TRUE, NULL, '蒸汽朋克,机械,改造,技术', 3, TRUE, FALSE),
('齿轮装置', 'event_steampunk_gear', '操作复杂的齿轮装置', NULL, NULL, TRUE, NULL, '蒸汽朋克,齿轮,机械,技术', 4, TRUE, FALSE),
('钟表工坊', 'event_steampunk_workshop', '在钟表工坊中工作', NULL, NULL, TRUE, NULL, '蒸汽朋克,工坊,制作,技术', 5, TRUE, FALSE),
('蒸汽列车', 'event_steampunk_train', '乘坐蒸汽驱动的列车', NULL, NULL, TRUE, NULL, '蒸汽朋克,列车,旅行,工业', 6, TRUE, FALSE),
('发条装置', 'event_steampunk_clockwork', '遇到发条驱动的装置', NULL, NULL, TRUE, NULL, '蒸汽朋克,发条,机械,奇妙', 7, TRUE, FALSE),
('工业革命', 'event_steampunk_revolution', '见证工业革命带来的变化', NULL, NULL, TRUE, NULL, '蒸汽朋克,工业,革命,变化', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('蒸汽枪', 'item_steampunk_steam_gun', '使用蒸汽驱动的枪械', NULL, NULL, TRUE, NULL, 'weapon', '蒸汽朋克,武器,蒸汽,机械', 1, TRUE, FALSE),
('怀表', 'item_steampunk_pocket_watch', '精美的怀表', NULL, NULL, TRUE, NULL, 'tool', '蒸汽朋克,怀表,时间,精致', 2, TRUE, FALSE),
('齿轮', 'item_steampunk_gear', '机械装置中的齿轮', NULL, NULL, TRUE, NULL, 'tool', '蒸汽朋克,齿轮,机械,零件', 3, TRUE, FALSE),
('蒸汽核心', 'item_steampunk_steam_core', '为机械提供动力的蒸汽核心', NULL, NULL, TRUE, NULL, 'tool', '蒸汽朋克,核心,动力,能量', 4, TRUE, FALSE),
('发条钥匙', 'item_steampunk_wind_key', '为发条装置上弦的钥匙', NULL, NULL, TRUE, NULL, 'key', '蒸汽朋克,钥匙,发条,机械', 5, TRUE, FALSE),
('护目镜', 'item_steampunk_goggles', '保护眼睛的护目镜', NULL, NULL, TRUE, NULL, 'tool', '蒸汽朋克,护目镜,保护,装备', 6, TRUE, FALSE),
('铜管', 'item_steampunk_copper_pipe', '用于传输蒸汽的铜管', NULL, NULL, TRUE, NULL, 'tool', '蒸汽朋克,铜管,传输,材料', 7, TRUE, FALSE),
('机械零件', 'item_steampunk_part', '各种机械装置的零件', NULL, NULL, TRUE, NULL, 'tool', '蒸汽朋克,零件,机械,制作', 8, TRUE, FALSE);

