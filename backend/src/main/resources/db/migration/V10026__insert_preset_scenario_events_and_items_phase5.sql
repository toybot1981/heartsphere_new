-- 第五阶段：为世界古代历史场景创建预置事件和物品
-- 场景：古代埃及、古希腊、中世纪欧洲、文艺复兴、工业革命

-- 设置字符集
SET NAMES utf8mb4;

-- ========== 古代埃及 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('金字塔建造', 'event_egypt_pyramid', '参与或见证金字塔的建造', NULL, NULL, TRUE, NULL, '埃及,金字塔,建造,历史', 1, TRUE, FALSE),
('法老加冕', 'event_egypt_coronation', '见证法老的加冕仪式', NULL, NULL, TRUE, NULL, '埃及,法老,加冕,仪式', 2, TRUE, FALSE),
('尼罗河', 'event_egypt_nile', '在尼罗河上航行', NULL, NULL, TRUE, NULL, '埃及,尼罗河,航行,生活', 3, TRUE, FALSE),
('木乃伊制作', 'event_egypt_mummy', '参与木乃伊的制作过程', NULL, NULL, TRUE, NULL, '埃及,木乃伊,制作,宗教', 4, TRUE, FALSE),
('象形文字', 'event_egypt_hieroglyph', '学习或使用象形文字', NULL, NULL, TRUE, NULL, '埃及,文字,学习,文化', 5, TRUE, FALSE),
('神庙祭祀', 'event_egypt_temple', '在神庙中参与祭祀活动', NULL, NULL, TRUE, NULL, '埃及,神庙,祭祀,宗教', 6, TRUE, FALSE),
('法老诅咒', 'event_egypt_curse', '遭遇传说中的法老诅咒', NULL, NULL, TRUE, NULL, '埃及,诅咒,危险,神秘', 7, TRUE, FALSE),
('沙漠之旅', 'event_egypt_desert', '穿越广阔的沙漠', NULL, NULL, TRUE, NULL, '埃及,沙漠,旅行,冒险', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('法老权杖', 'item_egypt_scepter', '法老使用的权杖', NULL, NULL, TRUE, NULL, 'collectible', '埃及,权杖,权力,法老', 1, TRUE, FALSE),
('圣甲虫', 'item_egypt_scarab', '象征重生的圣甲虫护身符', NULL, NULL, TRUE, NULL, 'collectible', '埃及,圣甲虫,护身符,宗教', 2, TRUE, FALSE),
('莎草纸', 'item_egypt_papyrus', '用于书写的莎草纸', NULL, NULL, TRUE, NULL, 'tool', '埃及,莎草纸,书写,记录', 3, TRUE, FALSE),
('黄金面具', 'item_egypt_gold_mask', '法老的黄金面具', NULL, NULL, TRUE, NULL, 'collectible', '埃及,面具,黄金,珍贵', 4, TRUE, FALSE),
('金字塔石', 'item_egypt_pyramid_stone', '建造金字塔用的石块', NULL, NULL, TRUE, NULL, 'tool', '埃及,石头,建筑,材料', 5, TRUE, FALSE),
('尼罗河水', 'item_egypt_nile_water', '来自尼罗河的圣水', NULL, NULL, TRUE, NULL, 'consumable', '埃及,水,神圣,生命', 6, TRUE, FALSE),
('木乃伊布', 'item_egypt_linen', '制作木乃伊用的亚麻布', NULL, NULL, TRUE, NULL, 'tool', '埃及,亚麻布,制作,材料', 7, TRUE, FALSE),
('图章戒指', 'item_egypt_seal_ring', '带有图章的戒指', NULL, NULL, TRUE, NULL, 'collectible', '埃及,戒指,图章,身份', 8, TRUE, FALSE);

-- ========== 古希腊 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('奥林匹克', 'event_greece_olympics', '参加奥林匹克运动会', NULL, NULL, TRUE, NULL, '希腊,奥林匹克,运动,竞技', 1, TRUE, FALSE),
('哲学讨论', 'event_greece_philosophy', '参与哲学家的讨论', NULL, NULL, TRUE, NULL, '希腊,哲学,讨论,智慧', 2, TRUE, FALSE),
('神庙参拜', 'event_greece_temple', '在神庙中参拜众神', NULL, NULL, TRUE, NULL, '希腊,神庙,参拜,宗教', 3, TRUE, FALSE),
('特洛伊战争', 'event_greece_troy', '参与或见证特洛伊战争', NULL, NULL, TRUE, NULL, '希腊,战争,特洛伊,史诗', 4, TRUE, FALSE),
('戏剧表演', 'event_greece_theater', '观看或参与戏剧表演', NULL, NULL, TRUE, NULL, '希腊,戏剧,艺术,文化', 5, TRUE, FALSE),
('神谕', 'event_greece_oracle', '寻求神谕的指引', NULL, NULL, TRUE, NULL, '希腊,神谕,预言,神秘', 6, TRUE, FALSE),
('民主辩论', 'event_greece_democracy', '参与民主政治的辩论', NULL, NULL, TRUE, NULL, '希腊,民主,辩论,政治', 7, TRUE, FALSE),
('英雄事迹', 'event_greece_hero', '完成英雄般的壮举', NULL, NULL, TRUE, NULL, '希腊,英雄,壮举,荣耀', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('橄榄枝', 'item_greece_olive_branch', '象征和平的橄榄枝', NULL, NULL, TRUE, NULL, 'collectible', '希腊,橄榄,和平,象征', 1, TRUE, FALSE),
('桂冠', 'item_greece_laurel', '胜利者佩戴的桂冠', NULL, NULL, TRUE, NULL, 'collectible', '希腊,桂冠,胜利,荣誉', 2, TRUE, FALSE),
('双耳瓶', 'item_greece_amphora', '希腊式的双耳陶瓶', NULL, NULL, TRUE, NULL, 'collectible', '希腊,陶瓶,艺术,容器', 3, TRUE, FALSE),
('盾牌', 'item_greece_shield', '战斗用的盾牌', NULL, NULL, TRUE, NULL, 'weapon', '希腊,盾牌,防御,战斗', 4, TRUE, FALSE),
('羊皮纸', 'item_greece_parchment', '用于书写的羊皮纸', NULL, NULL, TRUE, NULL, 'tool', '希腊,羊皮纸,书写,记录', 5, TRUE, FALSE),
('神像', 'item_greece_statue', '神祇的小雕像', NULL, NULL, TRUE, NULL, 'collectible', '希腊,神像,宗教,艺术品', 6, TRUE, FALSE),
('葡萄酒', 'item_greece_wine', '希腊的葡萄酒', NULL, NULL, TRUE, NULL, 'consumable', '希腊,葡萄酒,饮品,文化', 7, TRUE, FALSE),
('硬币', 'item_greece_coin', '希腊的货币', NULL, NULL, TRUE, NULL, 'collectible', '希腊,货币,交易,经济', 8, TRUE, FALSE);

-- ========== 中世纪欧洲 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('骑士受封', 'event_medieval_knighthood', '接受骑士的受封仪式', NULL, NULL, TRUE, NULL, '中世纪,骑士,受封,荣誉', 1, TRUE, FALSE),
('城堡守卫', 'event_medieval_defense', '守卫城堡免受攻击', NULL, NULL, TRUE, NULL, '中世纪,城堡,守卫,战斗', 2, TRUE, FALSE),
('骑士比武', 'event_medieval_tournament', '参加骑士比武大会', NULL, NULL, TRUE, NULL, '中世纪,比武,骑士,竞技', 3, TRUE, FALSE),
('十字军', 'event_medieval_crusade', '参加十字军东征', NULL, NULL, TRUE, NULL, '中世纪,十字军,战争,宗教', 4, TRUE, FALSE),
('黑死病', 'event_medieval_plague', '经历黑死病的肆虐', NULL, NULL, TRUE, NULL, '中世纪,瘟疫,灾难,生存', 5, TRUE, FALSE),
('领主宴会', 'event_medieval_feast', '参加领主办的盛大宴会', NULL, NULL, TRUE, NULL, '中世纪,宴会,领主,社交', 6, TRUE, FALSE),
('修道院', 'event_medieval_monastery', '在修道院中学习', NULL, NULL, TRUE, NULL, '中世纪,修道院,学习,宗教', 7, TRUE, FALSE),
('游吟诗人', 'event_medieval_bard', '遇到游吟诗人听其歌唱', NULL, NULL, TRUE, NULL, '中世纪,游吟,诗人,艺术', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('长剑', 'item_medieval_sword', '骑士使用的长剑', NULL, NULL, TRUE, NULL, 'weapon', '中世纪,武器,剑,骑士', 1, TRUE, FALSE),
('盾牌', 'item_medieval_shield', '刻有纹章的盾牌', NULL, NULL, TRUE, NULL, 'weapon', '中世纪,盾牌,防御,骑士', 2, TRUE, FALSE),
('盔甲', 'item_medieval_armor', '骑士的全身盔甲', NULL, NULL, TRUE, NULL, 'tool', '中世纪,盔甲,防护,装备', 3, TRUE, FALSE),
('纹章', 'item_medieval_crest', '家族的纹章', NULL, NULL, TRUE, NULL, 'collectible', '中世纪,纹章,家族,身份', 4, TRUE, FALSE),
('圣经', 'item_medieval_bible', '手抄本的圣经', NULL, NULL, TRUE, NULL, 'tool', '中世纪,圣经,宗教,书籍', 5, TRUE, FALSE),
('圣水', 'item_medieval_holy_water', '教堂的圣水', NULL, NULL, TRUE, NULL, 'consumable', '中世纪,圣水,宗教,神圣', 6, TRUE, FALSE),
('面包', 'item_medieval_bread', '日常食用的面包', NULL, NULL, TRUE, NULL, 'consumable', '中世纪,面包,食物,日常', 7, TRUE, FALSE),
('蜡烛', 'item_medieval_candle', '照明的蜡烛', NULL, NULL, TRUE, NULL, 'tool', '中世纪,蜡烛,照明,日常', 8, TRUE, FALSE);

-- ========== 文艺复兴 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('艺术创作', 'event_renaissance_art', '参与或见证伟大的艺术创作', NULL, NULL, TRUE, NULL, '文艺复兴,艺术,创作,文化', 1, TRUE, FALSE),
('美第奇家族', 'event_renaissance_medici', '与美第奇家族接触', NULL, NULL, TRUE, NULL, '文艺复兴,美第奇,家族,权力', 2, TRUE, FALSE),
('科学发现', 'event_renaissance_science', '见证重要的科学发现', NULL, NULL, TRUE, NULL, '文艺复兴,科学,发现,知识', 3, TRUE, FALSE),
('文学沙龙', 'event_renaissance_salon', '参加文学和艺术的沙龙', NULL, NULL, TRUE, NULL, '文艺复兴,沙龙,文学,艺术', 4, TRUE, FALSE),
('建筑杰作', 'event_renaissance_architecture', '见证伟大的建筑杰作', NULL, NULL, TRUE, NULL, '文艺复兴,建筑,杰作,艺术', 5, TRUE, FALSE),
('印刷术', 'event_renaissance_printing', '见证印刷术的传播', NULL, NULL, TRUE, NULL, '文艺复兴,印刷,传播,知识', 6, TRUE, FALSE),
('新世界', 'event_renaissance_new_world', '听说新大陆的发现', NULL, NULL, TRUE, NULL, '文艺复兴,新大陆,发现,冒险', 7, TRUE, FALSE),
('人文主义', 'event_renaissance_humanism', '参与人文主义的讨论', NULL, NULL, TRUE, NULL, '文艺复兴,人文主义,思想,文化', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('画作', 'item_renaissance_painting', '著名画家的作品', NULL, NULL, TRUE, NULL, 'collectible', '文艺复兴,绘画,艺术,珍贵', 1, TRUE, FALSE),
('书籍', 'item_renaissance_book', '印刷的书籍', NULL, NULL, TRUE, NULL, 'tool', '文艺复兴,书籍,知识,印刷', 2, TRUE, FALSE),
('羽毛笔', 'item_renaissance_quill', '用于书写的羽毛笔', NULL, NULL, TRUE, NULL, 'tool', '文艺复兴,笔,书写,工具', 3, TRUE, FALSE),
('颜料', 'item_renaissance_paint', '绘画用的颜料', NULL, NULL, TRUE, NULL, 'tool', '文艺复兴,颜料,绘画,材料', 4, TRUE, FALSE),
('雕塑', 'item_renaissance_sculpture', '精美的雕塑作品', NULL, NULL, TRUE, NULL, 'collectible', '文艺复兴,雕塑,艺术,精美', 5, TRUE, FALSE),
('望远镜', 'item_renaissance_telescope', '用于观测的望远镜', NULL, NULL, TRUE, NULL, 'tool', '文艺复兴,望远镜,科学,观测', 6, TRUE, FALSE),
('音乐谱', 'item_renaissance_music', '音乐作品的手稿', NULL, NULL, TRUE, NULL, 'collectible', '文艺复兴,音乐,艺术,手稿', 7, TRUE, FALSE),
('珠宝', 'item_renaissance_jewelry', '精美的珠宝首饰', NULL, NULL, TRUE, NULL, 'collectible', '文艺复兴,珠宝,装饰,珍贵', 8, TRUE, FALSE);

-- ========== 工业革命 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('蒸汽机', 'event_industrial_steam', '见证蒸汽机的发明和使用', NULL, NULL, TRUE, NULL, '工业革命,蒸汽,机器,技术', 1, TRUE, FALSE),
('工厂', 'event_industrial_factory', '在工厂中工作', NULL, NULL, TRUE, NULL, '工业革命,工厂,工作,工业', 2, TRUE, FALSE),
('火车', 'event_industrial_train', '乘坐最早的火车', NULL, NULL, TRUE, NULL, '工业革命,火车,交通,进步', 3, TRUE, FALSE),
('工人运动', 'event_industrial_labor', '参与工人运动', NULL, NULL, TRUE, NULL, '工业革命,工人,运动,权利', 4, TRUE, FALSE),
('煤炭', 'event_industrial_coal', '在煤矿中工作', NULL, NULL, TRUE, NULL, '工业革命,煤矿,工作,危险', 5, TRUE, FALSE),
('城市扩张', 'event_industrial_urban', '见证城市的快速扩张', NULL, NULL, TRUE, NULL, '工业革命,城市,扩张,变化', 6, TRUE, FALSE),
('技术革新', 'event_industrial_innovation', '见证技术的革新', NULL, NULL, TRUE, NULL, '工业革命,技术,革新,进步', 7, TRUE, FALSE),
('社会变革', 'event_industrial_social', '经历社会结构的变革', NULL, NULL, TRUE, NULL, '工业革命,社会,变革,历史', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('蒸汽机', 'item_industrial_steam_engine', '提供动力的蒸汽机', NULL, NULL, TRUE, NULL, 'tool', '工业革命,蒸汽机,动力,机器', 1, TRUE, FALSE),
('煤炭', 'item_industrial_coal', '作为燃料的煤炭', NULL, NULL, TRUE, NULL, 'consumable', '工业革命,煤炭,燃料,能源', 2, TRUE, FALSE),
('扳手', 'item_industrial_wrench', '维修机械用的扳手', NULL, NULL, TRUE, NULL, 'tool', '工业革命,工具,维修,机械', 3, TRUE, FALSE),
('怀表', 'item_industrial_pocket_watch', '精确计时的怀表', NULL, NULL, TRUE, NULL, 'tool', '工业革命,怀表,时间,精确', 4, TRUE, FALSE),
('图纸', 'item_industrial_blueprint', '机械设计的图纸', NULL, NULL, TRUE, NULL, 'tool', '工业革命,图纸,设计,技术', 5, TRUE, FALSE),
('工厂制品', 'item_industrial_product', '工厂生产的产品', NULL, NULL, TRUE, NULL, 'collectible', '工业革命,产品,制造,商品', 6, TRUE, FALSE),
('火车票', 'item_industrial_ticket', '乘坐火车的车票', NULL, NULL, TRUE, NULL, 'key', '工业革命,车票,交通,旅行', 7, TRUE, FALSE),
('工人帽', 'item_industrial_cap', '工人戴的帽子', NULL, NULL, TRUE, NULL, 'tool', '工业革命,帽子,工人,身份', 8, TRUE, FALSE);

