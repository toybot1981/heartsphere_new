-- 为古希腊场景添加角色资源
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < add_ancient_greece_characters_resources.sql

SET NAMES utf8mb4;

-- ========== 古希腊角色资源 ==========
-- 苏格拉底（哲学家）
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) VALUES
('苏格拉底-头像', 'placeholder://character/socrates_avatar.jpg', 'character', '苏格拉底头像', 'Ancient Greek philosopher, Socrates, wise sage, thoughtful appearance, simple robes, wise expression, ancient Greek portrait, historical art style, high quality, detailed character design, Ancient Greece setting, philosopher portrait, soft lighting, Greek historical figure', '希腊,哲学家,苏格拉底,历史', NOW(), NOW()),
('苏格拉底-背景', 'placeholder://character/socrates_background.jpg', 'character', '苏格拉底背景', 'Ancient Greek agora, marketplace, philosophical discussion, marble columns, classical architecture, intellectual atmosphere, ancient Greek setting, historical art style, high quality, detailed agora, Ancient Greece era, public square, soft Mediterranean lighting, Greek classical architecture', '希腊,广场,历史', NOW(), NOW()),

-- 柏拉图（哲学家）
('柏拉图-头像', 'placeholder://character/plato_avatar.jpg', 'character', '柏拉图头像', 'Ancient Greek philosopher, Plato, student of Socrates, scholarly appearance, elegant robes, intellectual expression, ancient Greek portrait, historical art style, high quality, detailed character design, Ancient Greece setting, philosopher portrait, soft lighting, Greek historical figure', '希腊,哲学家,柏拉图,历史', NOW(), NOW()),
('柏拉图-背景', 'placeholder://character/plato_background.jpg', 'character', '柏拉图背景', 'Ancient Greek Academy, Platonic school, library, scrolls, philosophical setting, ancient Greek architecture, scholarly atmosphere, historical art style, high quality, detailed academy, Ancient Greece era, academy interior, soft lighting, Greek academic architecture', '希腊,学院,历史', NOW(), NOW()),

-- 亚里士多德（哲学家）
('亚里士多德-头像', 'placeholder://character/aristotle_avatar.jpg', 'character', '亚里士多德头像', 'Ancient Greek philosopher, Aristotle, student of Plato, scholarly appearance, academic robes, thoughtful expression, ancient Greek portrait, historical art style, high quality, detailed character design, Ancient Greece setting, philosopher portrait, soft lighting, Greek historical figure', '希腊,哲学家,亚里士多德,历史', NOW(), NOW()),
('亚里士多德-背景', 'placeholder://character/aristotle_background.jpg', 'character', '亚里士多德背景', 'Ancient Greek Lyceum, peripatetic school, walking paths, scholarly setting, ancient Greek architecture, academic atmosphere, historical art style, high quality, detailed lyceum, Ancient Greece era, school grounds, soft natural lighting, Greek academic architecture', '希腊,学园,历史', NOW(), NOW()),

-- 亚历山大大帝（军事家）
('亚历山大大帝-头像', 'placeholder://character/alexander_avatar.jpg', 'character', '亚历山大大帝头像', 'Ancient Greek king, Alexander the Great, military conqueror, heroic appearance, royal armor, determined expression, ancient Greek portrait, historical art style, high quality, detailed character design, Ancient Greece setting, warrior king portrait, dramatic lighting, Greek historical figure', '希腊,国王,亚历山大,历史', NOW(), NOW()),
('亚历山大大帝-背景', 'placeholder://character/alexander_background.jpg', 'character', '亚历山大大帝背景', 'Ancient Greek battlefield, military camp, conquest scene, ancient Greek warfare, military atmosphere, heroic setting, historical art style, high quality, detailed battlefield, Ancient Greece era, military camp, dramatic battle lighting, Greek military scene', '希腊,战场,历史', NOW(), NOW()),

-- 荷马（诗人）
('荷马-头像', 'placeholder://character/homer_avatar.jpg', 'character', '荷马头像', 'Ancient Greek poet, Homer, epic poet, blind bard, poetic appearance, simple robes, inspired expression, ancient Greek portrait, historical art style, high quality, detailed character design, Ancient Greece setting, poet portrait, soft lighting, Greek historical figure', '希腊,诗人,荷马,历史', NOW(), NOW()),
('荷马-背景', 'placeholder://character/homer_background.jpg', 'character', '荷马背景', 'Ancient Greek gathering, storytelling scene, audience, epic performance, poetic atmosphere, ancient Greek setting, cultural atmosphere, historical art style, high quality, detailed gathering, Ancient Greece era, storytelling circle, warm firelight, Greek cultural scene', '希腊,集会,历史', NOW(), NOW()),

-- 阿基米德（科学家）
('阿基米德-头像', 'placeholder://character/archimedes_avatar.jpg', 'character', '阿基米德头像', 'Ancient Greek mathematician, Archimedes, scientist, scholarly appearance, scholar robes, focused expression, ancient Greek portrait, historical art style, high quality, detailed character design, Ancient Greece setting, scientist portrait, soft lighting, Greek historical figure', '希腊,科学家,阿基米德,历史', NOW(), NOW()),
('阿基米德-背景', 'placeholder://character/archimedes_background.jpg', 'character', '阿基米德背景', 'Ancient Greek workshop, geometric diagrams, scientific instruments, mathematical setting, ancient Greek architecture, scientific atmosphere, historical art style, high quality, detailed workshop, Ancient Greece era, laboratory, soft workshop lighting, Greek scientific architecture', '希腊,工作室,历史', NOW(), NOW());

-- 查询插入结果
SELECT id, name, category, tags FROM system_resources WHERE tags LIKE '%希腊%' ORDER BY id DESC LIMIT 12;


