-- 为文艺复兴场景添加角色资源
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < add_renaissance_characters_resources.sql

SET NAMES utf8mb4;

-- ========== 文艺复兴角色资源 ==========
-- 达芬奇（艺术家）
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) VALUES
('达芬奇-头像', 'placeholder://character/leonardo_avatar.jpg', 'character', '达芬奇头像', 'Renaissance artist, Leonardo da Vinci, polymath genius, artistic appearance, elegant robes, thoughtful expression, Renaissance portrait, historical art style, high quality, detailed character design, Renaissance setting, artist portrait, soft lighting, European historical figure', '文艺复兴,艺术家,达芬奇,历史', NOW(), NOW()),
('达芬奇-背景', 'placeholder://character/leonardo_background.jpg', 'character', '达芬奇背景', 'Renaissance art studio, paintings, sketches, scientific diagrams, artistic atmosphere, creative setting, Renaissance architecture, historical art style, high quality, detailed studio, Renaissance era, artist workshop, soft studio lighting, European artistic architecture', '文艺复兴,画室,历史', NOW(), NOW()),

-- 米开朗基罗（雕塑家）
('米开朗基罗-头像', 'placeholder://character/michelangelo_avatar.jpg', 'character', '米开朗基罗头像', 'Renaissance sculptor, Michelangelo, master artist, strong appearance, work clothes, determined expression, Renaissance portrait, historical art style, high quality, detailed character design, Renaissance setting, sculptor portrait, dramatic lighting, European historical figure', '文艺复兴,雕塑家,米开朗基罗,历史', NOW(), NOW()),
('米开朗基罗-背景', 'placeholder://character/michelangelo_background.jpg', 'character', '米开朗基罗背景', 'Renaissance sculpture studio, marble blocks, chisels, works in progress, artistic atmosphere, creative setting, Renaissance architecture, historical art style, high quality, detailed studio, Renaissance era, sculpture workshop, dramatic studio lighting, European artistic architecture', '文艺复兴,雕塑室,历史', NOW(), NOW()),

-- 拉斐尔（画家）
('拉斐尔-头像', 'placeholder://character/raphael_avatar.jpg', 'character', '拉斐尔头像', 'Renaissance painter, Raphael, master painter, elegant appearance, fine robes, refined expression, Renaissance portrait, historical art style, high quality, detailed character design, Renaissance setting, painter portrait, soft lighting, European historical figure', '文艺复兴,画家,拉斐尔,历史', NOW(), NOW()),
('拉斐尔-背景', 'placeholder://character/raphael_background.jpg', 'character', '拉斐尔背景', 'Renaissance art studio, paintings on easels, brushes, colors, artistic atmosphere, creative setting, Renaissance architecture, historical art style, high quality, detailed studio, Renaissance era, painter workshop, soft studio lighting, European artistic architecture', '文艺复兴,画室,历史', NOW(), NOW()),

-- 但丁（诗人）
('但丁-头像', 'placeholder://character/dante_avatar.jpg', 'character', '但丁头像', 'Renaissance poet, Dante Alighieri, literary master, thoughtful appearance, scholar robes, poetic expression, Renaissance portrait, historical art style, high quality, detailed character design, Renaissance setting, poet portrait, soft lighting, European historical figure', '文艺复兴,诗人,但丁,历史', NOW(), NOW()),
('但丁-背景', 'placeholder://character/dante_background.jpg', 'character', '但丁背景', 'Renaissance study, books, manuscripts, writing desk, literary atmosphere, scholarly setting, Renaissance architecture, historical art style, high quality, detailed study, Renaissance era, writer study, soft candlelight, European literary architecture', '文艺复兴,书房,历史', NOW(), NOW()),

-- 伽利略（科学家）
('伽利略-头像', 'placeholder://character/galileo_avatar.jpg', 'character', '伽利略头像', 'Renaissance scientist, Galileo Galilei, astronomer, scholarly appearance, academic robes, focused expression, Renaissance portrait, historical art style, high quality, detailed character design, Renaissance setting, scientist portrait, soft lighting, European historical figure', '文艺复兴,科学家,伽利略,历史', NOW(), NOW()),
('伽利略-背景', 'placeholder://character/galileo_background.jpg', 'character', '伽利略背景', 'Renaissance observatory, telescope, astronomical instruments, scientific setting, scholarly atmosphere, Renaissance architecture, historical art style, high quality, detailed observatory, Renaissance era, scientific laboratory, soft candlelight, European scientific architecture', '文艺复兴,观测台,历史', NOW(), NOW()),

-- 美第奇（贵族赞助人）
('美第奇-头像', 'placeholder://character/medici_avatar.jpg', 'character', '美第奇头像', 'Renaissance patron, Medici family, noble patron of arts, aristocratic appearance, luxurious robes, refined expression, Renaissance portrait, historical art style, high quality, detailed character design, Renaissance setting, patron portrait, dramatic lighting, European historical figure', '文艺复兴,贵族,美第奇,历史', NOW(), NOW()),
('美第奇-背景', 'placeholder://character/medici_background.jpg', 'character', '美第奇背景', 'Renaissance palace, art collection, luxurious interior, aristocratic atmosphere, noble setting, Renaissance architecture, historical art style, high quality, detailed palace, Renaissance era, noble residence, warm firelight, European noble architecture', '文艺复兴,宫殿,历史', NOW(), NOW());

-- 查询插入结果
SELECT id, name, category, tags FROM system_resources WHERE tags LIKE '%文艺复兴%' ORDER BY id DESC LIMIT 12;





