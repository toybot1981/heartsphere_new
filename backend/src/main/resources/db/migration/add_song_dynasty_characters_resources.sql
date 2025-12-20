-- 为宋朝文雅场景添加角色资源
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < add_song_dynasty_characters_resources.sql

SET NAMES utf8mb4;

-- ========== 宋朝文雅角色资源 ==========
-- 苏轼（苏东坡）
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) VALUES
('苏轼-头像', 'placeholder://character/su_shi_avatar.jpg', 'character', '苏轼头像', 'Ancient Chinese poet, Su Shi (Su Dongpo), Song Dynasty literary master, scholarly appearance, elegant robes, refined expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Song Dynasty setting, scholar portrait, soft lighting, Chinese historical figure', '宋朝,诗人,苏轼,历史', NOW(), NOW()),
('苏轼-背景', 'placeholder://character/su_shi_background.jpg', 'character', '苏轼背景', 'Song Dynasty garden, elegant pavilion, ancient Chinese courtyard, literary atmosphere, scholarly setting, ancient Chinese garden, historical art style, high quality, detailed garden interior, Song Dynasty era, scholar residence, soft garden lighting, Chinese garden architecture', '宋朝,园林,历史', NOW(), NOW()),

-- 李清照（易安居士）
('李清照-头像', 'placeholder://character/li_qingzhao_avatar.jpg', 'character', '李清照头像', 'Ancient Chinese poetess, Li Qingzhao, Song Dynasty female literary master, elegant appearance, graceful robes, melancholic expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Song Dynasty setting, female scholar portrait, soft lighting, Chinese historical figure', '宋朝,词人,李清照,历史', NOW(), NOW()),
('李清照-背景', 'placeholder://character/li_qingzhao_background.jpg', 'character', '李清照背景', 'Song Dynasty boudoir, elegant study room, ancient Chinese interior, literary atmosphere, feminine setting, ancient Chinese study, historical art style, high quality, detailed study interior, Song Dynasty era, female scholar residence, soft lighting, Chinese interior architecture', '宋朝,闺房,历史', NOW(), NOW()),

-- 辛弃疾（稼轩）
('辛弃疾-头像', 'placeholder://character/xin_qiji_avatar.jpg', 'character', '辛弃疾头像', 'Ancient Chinese poet and general, Xin Qiji, Song Dynasty patriotic hero, heroic appearance, military robes, determined expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Song Dynasty setting, warrior poet portrait, dramatic lighting, Chinese historical figure', '宋朝,词人,辛弃疾,历史', NOW(), NOW()),
('辛弃疾-背景', 'placeholder://character/xin_qiji_background.jpg', 'character', '辛弃疾背景', 'Song Dynasty military camp, battlefield, ancient Chinese frontier, patriotic atmosphere, military setting, ancient Chinese military camp, historical art style, high quality, detailed military setting, Song Dynasty era, northern frontier, dramatic military lighting, Chinese military architecture', '宋朝,军营,历史', NOW(), NOW()),

-- 王安石（临川先生）
('王安石-头像', 'placeholder://character/wang_anshi_avatar.jpg', 'character', '王安石头像', 'Ancient Chinese statesman and poet, Wang Anshi, Song Dynasty reformer, scholarly appearance, official robes, thoughtful expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Song Dynasty setting, statesman portrait, soft lighting, Chinese historical figure', '宋朝,政治家,王安石,历史', NOW(), NOW()),
('王安石-背景', 'placeholder://character/wang_anshi_background.jpg', 'character', '王安石背景', 'Song Dynasty government office, official documents, ancient Chinese court, administrative atmosphere, political setting, ancient Chinese office, historical art style, high quality, detailed office interior, Song Dynasty era, government building, soft office lighting, Chinese administrative architecture', '宋朝,官府,历史', NOW(), NOW()),

-- 欧阳修（六一居士）
('欧阳修-头像', 'placeholder://character/ouyang_xiu_avatar.jpg', 'character', '欧阳修头像', 'Ancient Chinese scholar and historian, Ouyang Xiu, Song Dynasty literary master, scholarly appearance, elegant robes, wise expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Song Dynasty setting, scholar portrait, soft lighting, Chinese historical figure', '宋朝,学者,欧阳修,历史', NOW(), NOW()),
('欧阳修-背景', 'placeholder://character/ouyang_xiu_background.jpg', 'character', '欧阳修背景', 'Song Dynasty library, books and scrolls, ancient Chinese study, scholarly atmosphere, academic setting, ancient Chinese library, historical art style, high quality, detailed library interior, Song Dynasty era, scholar study, soft library lighting, Chinese academic architecture', '宋朝,书斋,历史', NOW(), NOW()),

-- 陆游（放翁）
('陆游-头像', 'placeholder://character/lu_you_avatar.jpg', 'character', '陆游头像', 'Ancient Chinese poet, Lu You, Song Dynasty patriotic poet, determined appearance, scholar robes, patriotic expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Song Dynasty setting, patriotic poet portrait, dramatic lighting, Chinese historical figure', '宋朝,诗人,陆游,历史', NOW(), NOW()),
('陆游-背景', 'placeholder://character/lu_you_background.jpg', 'character', '陆游背景', 'Song Dynasty countryside, thatched cottage, ancient Chinese rural scene, pastoral atmosphere, rural setting, ancient Chinese countryside, historical art style, high quality, detailed countryside, Song Dynasty era, rural residence, soft natural lighting, Chinese rural architecture', '宋朝,田园,历史', NOW(), NOW());

-- 查询插入结果
SELECT id, name, category, tags FROM system_resources WHERE tags LIKE '%宋朝%' ORDER BY id DESC LIMIT 12;


