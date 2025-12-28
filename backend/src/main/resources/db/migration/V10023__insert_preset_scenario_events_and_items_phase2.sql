-- 第二阶段：为中国古代历史场景创建预置事件和物品
-- 场景：三国时代、秦王朝、唐朝盛世、宋朝文雅、明朝江湖

-- 设置字符集
SET NAMES utf8mb4;

-- ========== 三国时代 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('三顾茅庐', 'event_three_kingdoms_visit', '三次拜访，诚心邀请贤才', NULL, NULL, TRUE, NULL, '三国,拜访,诚心,招贤', 1, TRUE, FALSE),
('赤壁之战', 'event_three_kingdoms_chibi', '参与或见证赤壁大战', NULL, NULL, TRUE, NULL, '三国,战争,赤壁,历史', 2, TRUE, FALSE),
('桃园结义', 'event_three_kingdoms_oath', '结拜为兄弟，誓言同生共死', NULL, NULL, TRUE, NULL, '三国,结义,兄弟,义气', 3, TRUE, FALSE),
('单骑救主', 'event_three_kingdoms_rescue', '单枪匹马救出主公', NULL, NULL, TRUE, NULL, '三国,忠诚,救主,勇敢', 4, TRUE, FALSE),
('草船借箭', 'event_three_kingdoms_arrows', '巧用计谋借得箭矢', NULL, NULL, TRUE, NULL, '三国,计谋,智慧,策略', 5, TRUE, FALSE),
('七擒孟获', 'event_three_kingdoms_capture', '七次擒获，感化敌人', NULL, NULL, TRUE, NULL, '三国,用兵,感化,仁德', 6, TRUE, FALSE),
('空城计', 'event_three_kingdoms_empty_city', '使用空城计吓退敌军', NULL, NULL, TRUE, NULL, '三国,计谋,智慧,胆识', 7, TRUE, FALSE),
('败走麦城', 'event_three_kingdoms_defeat', '遭遇失败，被迫撤退', NULL, NULL, TRUE, NULL, '三国,失败,挫折,教训', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('青龙偃月刀', 'item_three_kingdoms_green_dragon', '关羽的青龙偃月刀，重八十二斤', NULL, NULL, TRUE, NULL, 'weapon', '三国,武器,关羽', 1, TRUE, FALSE),
('丈八蛇矛', 'item_three_kingdoms_snake_spear', '张飞的丈八蛇矛', NULL, NULL, TRUE, NULL, 'weapon', '三国,武器,张飞', 2, TRUE, FALSE),
('赤兔马', 'item_three_kingdoms_red_hare', '日行千里的赤兔马', NULL, NULL, TRUE, NULL, 'tool', '三国,坐骑,宝马', 3, TRUE, FALSE),
('羽扇', 'item_three_kingdoms_feather_fan', '诸葛亮的羽扇', NULL, NULL, TRUE, NULL, 'tool', '三国,物品,诸葛亮', 4, TRUE, FALSE),
('兵符', 'item_three_kingdoms_army_token', '调动军队的兵符', NULL, NULL, TRUE, NULL, 'key', '三国,兵符,权力', 5, TRUE, FALSE),
('玉玺', 'item_three_kingdoms_seal', '传国玉玺', NULL, NULL, TRUE, NULL, 'collectible', '三国,玉玺,皇权', 6, TRUE, FALSE),
('箭矢', 'item_three_kingdoms_arrow', '作战用的箭矢', NULL, NULL, TRUE, NULL, 'weapon', '三国,武器,消耗', 7, TRUE, FALSE),
('书信', 'item_three_kingdoms_letter', '传递军情的密信', NULL, NULL, TRUE, NULL, 'tool', '三国,信件,情报', 8, TRUE, FALSE);

-- ========== 秦王朝 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('统一六国', 'event_qin_unify', '见证或参与统一六国的历史时刻', NULL, NULL, TRUE, NULL, '秦朝,统一,历史,成就', 1, TRUE, FALSE),
('焚书坑儒', 'event_qin_burning', '经历焚书坑儒事件', NULL, NULL, TRUE, NULL, '秦朝,文化,专制,历史', 2, TRUE, FALSE),
('修建长城', 'event_qin_great_wall', '参与修建万里长城', NULL, NULL, TRUE, NULL, '秦朝,长城,工程,历史', 3, TRUE, FALSE),
('沙丘之变', 'event_qin_sand_dune', '经历沙丘之变，宫廷斗争', NULL, NULL, TRUE, NULL, '秦朝,宫廷,斗争,政治', 4, TRUE, FALSE),
('始皇巡游', 'event_qin_tour', '跟随始皇帝巡游天下', NULL, NULL, TRUE, NULL, '秦朝,巡游,皇帝,威严', 5, TRUE, FALSE),
('兵马俑', 'event_qin_terracotta', '见证兵马俑的建造', NULL, NULL, TRUE, NULL, '秦朝,兵马俑,艺术,历史', 6, TRUE, FALSE),
('苛政', 'event_qin_harsh_rule', '经历严苛的法律和统治', NULL, NULL, TRUE, NULL, '秦朝,法律,统治,压迫', 7, TRUE, FALSE),
('起义', 'event_qin_rebellion', '参与或见证农民起义', NULL, NULL, TRUE, NULL, '秦朝,起义,反抗,历史', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('秦剑', 'item_qin_sword', '秦军使用的青铜剑', NULL, NULL, TRUE, NULL, 'weapon', '秦朝,武器,青铜', 1, TRUE, FALSE),
('兵符', 'item_qin_army_token', '调动军队的虎符', NULL, NULL, TRUE, NULL, 'key', '秦朝,兵符,权力', 2, TRUE, FALSE),
('竹简', 'item_qin_bamboo', '记录文字的竹简', NULL, NULL, TRUE, NULL, 'tool', '秦朝,文字,记录', 3, TRUE, FALSE),
('秦半两', 'item_qin_coin', '秦朝的统一货币', NULL, NULL, TRUE, NULL, 'collectible', '秦朝,货币,统一', 4, TRUE, FALSE),
('诏书', 'item_qin_edict', '皇帝颁布的诏书', NULL, NULL, TRUE, NULL, 'key', '秦朝,诏书,命令', 5, TRUE, FALSE),
('和氏璧', 'item_qin_jade', '传世美玉和氏璧', NULL, NULL, TRUE, NULL, 'collectible', '秦朝,美玉,宝物', 6, TRUE, FALSE),
('弓弩', 'item_qin_crossbow', '秦军的强弩', NULL, NULL, TRUE, NULL, 'weapon', '秦朝,武器,远程', 7, TRUE, FALSE),
('秦砖', 'item_qin_brick', '修建长城用的秦砖', NULL, NULL, TRUE, NULL, 'tool', '秦朝,建筑,材料', 8, TRUE, FALSE);

-- ========== 唐朝盛世 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('科举考试', 'event_tang_imperial_exam', '参加科举考试，追求功名', NULL, NULL, TRUE, NULL, '唐朝,科举,考试,功名', 1, TRUE, FALSE),
('长安夜市', 'event_tang_night_market', '在繁华的长安夜市游览', NULL, NULL, TRUE, NULL, '唐朝,长安,夜市,繁华', 2, TRUE, FALSE),
('诗歌会', 'event_tang_poetry', '参加文人墨客的诗歌会', NULL, NULL, TRUE, NULL, '唐朝,诗歌,文化,文雅', 3, TRUE, FALSE),
('丝绸之路', 'event_tang_silk_road', '沿着丝绸之路旅行', NULL, NULL, TRUE, NULL, '唐朝,丝绸之路,贸易,文化交流', 4, TRUE, FALSE),
('宫廷宴会', 'event_tang_palace_feast', '参加宫廷举办的盛大宴会', NULL, NULL, TRUE, NULL, '唐朝,宫廷,宴会,荣耀', 5, TRUE, FALSE),
('玄奘西行', 'event_tang_journey_west', '跟随或见证玄奘西行取经', NULL, NULL, TRUE, NULL, '唐朝,取经,佛教,冒险', 6, TRUE, FALSE),
('安史之乱', 'event_tang_rebellion', '经历安史之乱，动荡时期', NULL, NULL, TRUE, NULL, '唐朝,战乱,动荡,历史', 7, TRUE, FALSE),
('游园赏花', 'event_tang_flower_viewing', '在园林中赏花游玩', NULL, NULL, TRUE, NULL, '唐朝,园林,赏花,雅致', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('唐诗', 'item_tang_poetry', '著名诗人的诗集', NULL, NULL, TRUE, NULL, 'collectible', '唐朝,诗歌,文学', 1, TRUE, FALSE),
('丝绸', 'item_tang_silk', '精美的丝绸', NULL, NULL, TRUE, NULL, 'collectible', '唐朝,丝绸,贸易', 2, TRUE, FALSE),
('陶瓷', 'item_tang_ceramic', '精美的陶瓷制品', NULL, NULL, TRUE, NULL, 'collectible', '唐朝,陶瓷,艺术', 3, TRUE, FALSE),
('官印', 'item_tang_seal', '官员的印章', NULL, NULL, TRUE, NULL, 'key', '唐朝,官印,身份', 4, TRUE, FALSE),
('茶叶', 'item_tang_tea', '上好的茶叶', NULL, NULL, TRUE, NULL, 'consumable', '唐朝,茶叶,饮品', 5, TRUE, FALSE),
('扇子', 'item_tang_fan', '文人雅士用的折扇', NULL, NULL, TRUE, NULL, 'tool', '唐朝,扇子,文雅', 6, TRUE, FALSE),
('玉佩', 'item_tang_jade', '精美的玉佩', NULL, NULL, TRUE, NULL, 'collectible', '唐朝,玉佩,饰品', 7, TRUE, FALSE),
('文房四宝', 'item_tang_stationery', '笔墨纸砚', NULL, NULL, TRUE, NULL, 'tool', '唐朝,文具,书写', 8, TRUE, FALSE);

-- ========== 宋朝文雅 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('词会', 'event_song_ci_meeting', '参加词人的聚会，交流词作', NULL, NULL, TRUE, NULL, '宋朝,词会,文学,文雅', 1, TRUE, FALSE),
('品茶论道', 'event_song_tea_ceremony', '参加品茶会，论道谈天', NULL, NULL, TRUE, NULL, '宋朝,品茶,雅集,文雅', 2, TRUE, FALSE),
('书院求学', 'event_song_academy', '在书院中求学读书', NULL, NULL, TRUE, NULL, '宋朝,书院,学习,文化', 3, TRUE, FALSE),
('花朝节', 'event_song_flower_festival', '参加花朝节庆典', NULL, NULL, TRUE, NULL, '宋朝,节日,庆典,文雅', 4, TRUE, FALSE),
('夜市游逛', 'event_song_night_market', '在繁华的夜市中游逛', NULL, NULL, TRUE, NULL, '宋朝,夜市,繁华,生活', 5, TRUE, FALSE),
('书画欣赏', 'event_song_art_appreciation', '欣赏名家的书画作品', NULL, NULL, TRUE, NULL, '宋朝,书画,艺术,文雅', 6, TRUE, FALSE),
('靖康之耻', 'event_song_jingkang', '经历靖康之耻，国破家亡', NULL, NULL, TRUE, NULL, '宋朝,国难,耻辱,历史', 7, TRUE, FALSE),
('江南游', 'event_song_jiangnan', '在江南水乡游玩', NULL, NULL, TRUE, NULL, '宋朝,江南,风景,文雅', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('宋词', 'item_song_ci', '著名词人的词集', NULL, NULL, TRUE, NULL, 'collectible', '宋朝,词,文学', 1, TRUE, FALSE),
('茶具', 'item_song_tea_set', '精美的茶具', NULL, NULL, TRUE, NULL, 'tool', '宋朝,茶具,品茶', 2, TRUE, FALSE),
('字画', 'item_song_painting', '名家的字画作品', NULL, NULL, TRUE, NULL, 'collectible', '宋朝,字画,艺术', 3, TRUE, FALSE),
('瓷器', 'item_song_porcelain', '精美的瓷器', NULL, NULL, TRUE, NULL, 'collectible', '宋朝,瓷器,艺术', 4, TRUE, FALSE),
('扇子', 'item_song_fan', '文人用的折扇', NULL, NULL, TRUE, NULL, 'tool', '宋朝,扇子,文雅', 5, TRUE, FALSE),
('文房用品', 'item_song_stationery', '精致的文房用品', NULL, NULL, TRUE, NULL, 'tool', '宋朝,文具,书写', 6, TRUE, FALSE),
('茶叶', 'item_song_tea', '上好的茶叶', NULL, NULL, TRUE, NULL, 'consumable', '宋朝,茶叶,饮品', 7, TRUE, FALSE),
('官帽', 'item_song_official_hat', '官员的帽子', NULL, NULL, TRUE, NULL, 'tool', '宋朝,官帽,身份', 8, TRUE, FALSE);

-- ========== 明朝江湖 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('江湖相遇', 'event_ming_jianghu_meet', '在江湖中遇到其他武林人士', NULL, NULL, TRUE, NULL, '明朝,江湖,相遇,武侠', 1, TRUE, FALSE),
('比武论剑', 'event_ming_duel', '参加比武论剑大会', NULL, NULL, TRUE, NULL, '明朝,比武,剑术,武侠', 2, TRUE, FALSE),
('秘籍现世', 'event_ming_secret_book', '发现武林秘籍', NULL, NULL, TRUE, NULL, '明朝,秘籍,武功,武侠', 3, TRUE, FALSE),
('行侠仗义', 'event_ming_heroism', '行侠仗义，帮助弱小', NULL, NULL, TRUE, NULL, '明朝,侠义,正义,武侠', 4, TRUE, FALSE),
('门派恩怨', 'event_ming_sect_conflict', '卷入门派之间的恩怨', NULL, NULL, TRUE, NULL, '明朝,门派,恩怨,武侠', 5, TRUE, FALSE),
('宝藏传说', 'event_ming_treasure', '追寻传说中的宝藏', NULL, NULL, TRUE, NULL, '明朝,宝藏,冒险,武侠', 6, TRUE, FALSE),
('锦衣卫', 'event_ming_jinyiwei', '遭遇锦衣卫的追捕', NULL, NULL, TRUE, NULL, '明朝,锦衣卫,危险,武侠', 7, TRUE, FALSE),
('江湖告急', 'event_ming_urgent', '接到江湖告急的求助', NULL, NULL, TRUE, NULL, '明朝,求助,义气,武侠', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('长剑', 'item_ming_sword', '武林人士使用的长剑', NULL, NULL, TRUE, NULL, 'weapon', '明朝,武器,剑,武侠', 1, TRUE, FALSE),
('武功秘籍', 'item_ming_secret_book', '记载高深武功的秘籍', NULL, NULL, TRUE, NULL, 'tool', '明朝,秘籍,武功,武侠', 2, TRUE, FALSE),
('令牌', 'item_ming_token', '江湖门派的令牌', NULL, NULL, TRUE, NULL, 'key', '明朝,令牌,身份,武侠', 3, TRUE, FALSE),
('暗器', 'item_ming_dart', '用于防身的暗器', NULL, NULL, TRUE, NULL, 'weapon', '明朝,武器,暗器,武侠', 4, TRUE, FALSE),
('解药', 'item_ming_antidote', '解各种毒的解药', NULL, NULL, TRUE, NULL, 'consumable', '明朝,药品,解毒,武侠', 5, TRUE, FALSE),
('银两', 'item_ming_silver', '江湖通用的银两', NULL, NULL, TRUE, NULL, 'collectible', '明朝,货币,交易,武侠', 6, TRUE, FALSE),
('地图', 'item_ming_map', '江湖路线图或藏宝图', NULL, NULL, TRUE, NULL, 'tool', '明朝,地图,导航,武侠', 7, TRUE, FALSE),
('玉佩信物', 'item_ming_jade_token', '作为信物的玉佩', NULL, NULL, TRUE, NULL, 'collectible', '明朝,信物,玉佩,武侠', 8, TRUE, FALSE);

