-- 为秦王朝场景添加角色资源
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < add_qin_dynasty_characters_resources.sql

SET NAMES utf8mb4;

-- ========== 秦王朝角色资源 ==========
-- 秦始皇（嬴政）
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) VALUES
('秦始皇-头像', 'placeholder://character/qin_shihuang_avatar.jpg', 'character', '秦始皇头像', 'Ancient Chinese emperor, Qin Shi Huang, first emperor of China, majestic appearance, imperial robes, crown, authoritative expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Qin Dynasty setting, imperial portrait, dramatic lighting, Chinese historical figure', '秦朝,皇帝,秦始皇,历史', NOW(), NOW()),
('秦始皇-背景', 'placeholder://character/qin_shihuang_background.jpg', 'character', '秦始皇背景', 'Qin Dynasty imperial palace, majestic throne room, ancient Chinese architecture, imperial atmosphere, golden decorations, ancient Chinese palace setting, historical art style, high quality, detailed palace interior, Qin Dynasty era, imperial court, dramatic palace lighting, Chinese imperial architecture', '秦朝,皇宫,历史', NOW(), NOW()),

-- 李斯（丞相）
('李斯-头像', 'placeholder://character/li_si_avatar.jpg', 'character', '李斯头像', 'Ancient Chinese chancellor, Li Si, Qin Dynasty prime minister, scholarly appearance, official robes, intelligent expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Qin Dynasty setting, official portrait, soft lighting, Chinese historical figure', '秦朝,丞相,李斯,历史', NOW(), NOW()),
('李斯-背景', 'placeholder://character/li_si_background.jpg', 'character', '李斯背景', 'Qin Dynasty government office, official documents, ancient Chinese writing, administrative atmosphere, scholarly setting, ancient Chinese office, historical art style, high quality, detailed office interior, Qin Dynasty era, government building, soft office lighting, Chinese administrative architecture', '秦朝,官府,历史', NOW(), NOW()),

-- 蒙恬（大将军）
('蒙恬-头像', 'placeholder://character/meng_tian_avatar.jpg', 'character', '蒙恬头像', 'Ancient Chinese general, Meng Tian, Qin Dynasty military commander, warrior appearance, military armor, brave expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Qin Dynasty setting, military portrait, dramatic lighting, Chinese historical figure', '秦朝,将军,蒙恬,历史', NOW(), NOW()),
('蒙恬-背景', 'placeholder://character/meng_tian_background.jpg', 'character', '蒙恬背景', 'Qin Dynasty military camp, Great Wall construction, ancient Chinese fortress, military atmosphere, battlefield setting, ancient Chinese military camp, historical art style, high quality, detailed military setting, Qin Dynasty era, northern frontier, dramatic military lighting, Chinese military architecture', '秦朝,军营,历史', NOW(), NOW()),

-- 赵高（宦官）
('赵高-头像', 'placeholder://character/zhao_gao_avatar.jpg', 'character', '赵高头像', 'Ancient Chinese eunuch, Zhao Gao, Qin Dynasty court official, cunning appearance, court robes, shrewd expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Qin Dynasty setting, court official portrait, dramatic lighting, Chinese historical figure', '秦朝,宦官,赵高,历史', NOW(), NOW()),
('赵高-背景', 'placeholder://character/zhao_gao_background.jpg', 'character', '赵高背景', 'Qin Dynasty imperial court, inner palace, court intrigue atmosphere, political setting, ancient Chinese palace interior, historical art style, high quality, detailed court interior, Qin Dynasty era, inner palace, dramatic court lighting, Chinese palace architecture', '秦朝,内宫,历史', NOW(), NOW()),

-- 扶苏（公子）
('扶苏-头像', 'placeholder://character/fu_su_avatar.jpg', 'character', '扶苏头像', 'Ancient Chinese prince, Fu Su, Qin Dynasty crown prince, noble appearance, prince robes, gentle expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Qin Dynasty setting, prince portrait, soft lighting, Chinese historical figure', '秦朝,公子,扶苏,历史', NOW(), NOW()),
('扶苏-背景', 'placeholder://character/fu_su_background.jpg', 'character', '扶苏背景', 'Qin Dynasty prince residence, elegant garden, ancient Chinese courtyard, peaceful atmosphere, scholarly setting, ancient Chinese garden, historical art style, high quality, detailed garden interior, Qin Dynasty era, prince mansion, soft garden lighting, Chinese garden architecture', '秦朝,府邸,历史', NOW(), NOW()),

-- 王翦（将军）
('王翦-头像', 'placeholder://character/wang_jian_avatar.jpg', 'character', '王翦头像', 'Ancient Chinese general, Wang Jian, Qin Dynasty military commander, veteran warrior appearance, military armor, experienced expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Qin Dynasty setting, military portrait, dramatic lighting, Chinese historical figure', '秦朝,将军,王翦,历史', NOW(), NOW()),
('王翦-背景', 'placeholder://character/wang_jian_background.jpg', 'character', '王翦背景', 'Qin Dynasty battlefield, ancient Chinese warfare, military camp, battle atmosphere, strategic setting, ancient Chinese battlefield, historical art style, high quality, detailed battlefield, Qin Dynasty era, war scene, dramatic battle lighting, Chinese military scene', '秦朝,战场,历史', NOW(), NOW());

-- 查询插入结果
SELECT id, name, category, tags FROM system_resources WHERE tags LIKE '%秦朝%' ORDER BY id DESC LIMIT 10;

