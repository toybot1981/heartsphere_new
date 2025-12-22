-- 为中世纪欧洲场景添加角色资源
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < add_medieval_europe_characters_resources.sql

SET NAMES utf8mb4;

-- ========== 中世纪欧洲角色资源 ==========
-- 骑士（圆桌骑士）
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) VALUES
('中世纪骑士-头像', 'placeholder://character/medieval_knight_avatar.jpg', 'character', '中世纪骑士头像', 'Medieval European knight, armored warrior, chivalric hero, heroic appearance, plate armor, brave expression, medieval portrait, historical art style, high quality, detailed character design, Medieval Europe setting, knight portrait, dramatic lighting, European historical figure', '中世纪,骑士,历史', NOW(), NOW()),
('中世纪骑士-背景', 'placeholder://character/medieval_knight_background.jpg', 'character', '中世纪骑士背景', 'Medieval European castle, battlements, fortress, chivalric atmosphere, military setting, medieval architecture, historical art style, high quality, detailed castle, Medieval Europe era, fortress interior, dramatic castle lighting, European medieval architecture', '中世纪,城堡,历史', NOW(), NOW()),

-- 修道士（修士）
('中世纪修士-头像', 'placeholder://character/medieval_monk_avatar.jpg', 'character', '中世纪修士头像', 'Medieval European monk, religious scholar, pious appearance, monastic robes, peaceful expression, medieval portrait, historical art style, high quality, detailed character design, Medieval Europe setting, monk portrait, soft lighting, European historical figure', '中世纪,修士,历史', NOW(), NOW()),
('中世纪修士-背景', 'placeholder://character/medieval_monk_background.jpg', 'character', '中世纪修士背景', 'Medieval European monastery, scriptorium, library, books, religious atmosphere, scholarly setting, medieval architecture, historical art style, high quality, detailed monastery, Medieval Europe era, monastic library, soft candlelight, European monastic architecture', '中世纪,修道院,历史', NOW(), NOW()),

-- 贵族（领主）
('中世纪领主-头像', 'placeholder://character/medieval_lord_avatar.jpg', 'character', '中世纪领主头像', 'Medieval European lord, nobleman, aristocratic appearance, fine robes, authoritative expression, medieval portrait, historical art style, high quality, detailed character design, Medieval Europe setting, lord portrait, dramatic lighting, European historical figure', '中世纪,领主,历史', NOW(), NOW()),
('中世纪领主-背景', 'placeholder://character/medieval_lord_background.jpg', 'character', '中世纪领主背景', 'Medieval European manor, great hall, noble residence, aristocratic atmosphere, luxurious setting, medieval architecture, historical art style, high quality, detailed manor, Medieval Europe era, lord residence, warm firelight, European noble architecture', '中世纪,庄园,历史', NOW(), NOW()),

-- 商人（行会商人）
('中世纪商人-头像', 'placeholder://character/medieval_merchant_avatar.jpg', 'character', '中世纪商人头像', 'Medieval European merchant, tradesman, business appearance, merchant robes, shrewd expression, medieval portrait, historical art style, high quality, detailed character design, Medieval Europe setting, merchant portrait, soft lighting, European historical figure', '中世纪,商人,历史', NOW(), NOW()),
('中世纪商人-背景', 'placeholder://character/medieval_merchant_background.jpg', 'character', '中世纪商人背景', 'Medieval European market, trading post, goods, commercial atmosphere, business setting, medieval architecture, historical art style, high quality, detailed market, Medieval Europe era, trading area, bright market lighting, European commercial architecture', '中世纪,市场,历史', NOW(), NOW()),

-- 吟游诗人（诗人）
('中世纪吟游诗人-头像', 'placeholder://character/medieval_bard_avatar.jpg', 'character', '中世纪吟游诗人头像', 'Medieval European bard, troubadour, artistic appearance, colorful robes, expressive expression, medieval portrait, historical art style, high quality, detailed character design, Medieval Europe setting, bard portrait, soft lighting, European historical figure', '中世纪,诗人,历史', NOW(), NOW()),
('中世纪吟游诗人-背景', 'placeholder://character/medieval_bard_background.jpg', 'character', '中世纪吟游诗人背景', 'Medieval European tavern, performance space, audience, entertainment atmosphere, cultural setting, medieval architecture, historical art style, high quality, detailed tavern, Medieval Europe era, performance hall, warm tavern lighting, European cultural architecture', '中世纪,酒馆,历史', NOW(), NOW()),

-- 铁匠（工匠）
('中世纪铁匠-头像', 'placeholder://character/medieval_blacksmith_avatar.jpg', 'character', '中世纪铁匠头像', 'Medieval European blacksmith, craftsman, skilled appearance, work clothes, determined expression, medieval portrait, historical art style, high quality, detailed character design, Medieval Europe setting, blacksmith portrait, dramatic lighting, European historical figure', '中世纪,铁匠,历史', NOW(), NOW()),
('中世纪铁匠-背景', 'placeholder://character/medieval_blacksmith_background.jpg', 'character', '中世纪铁匠背景', 'Medieval European forge, workshop, tools, anvil, craft atmosphere, working setting, medieval architecture, historical art style, high quality, detailed forge, Medieval Europe era, workshop interior, dramatic forge fire, European craft architecture', '中世纪,铁匠铺,历史', NOW(), NOW());

-- 查询插入结果
SELECT id, name, category, tags FROM system_resources WHERE tags LIKE '%中世纪%' ORDER BY id DESC LIMIT 12;





