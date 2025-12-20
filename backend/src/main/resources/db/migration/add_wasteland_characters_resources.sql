-- 为废土世界场景添加角色资源
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < add_wasteland_characters_resources.sql

SET NAMES utf8mb4;

-- ========== 废土世界角色资源 ==========
-- 废土幸存者（生存者）
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) VALUES
('废土幸存者-头像', 'placeholder://character/wasteland_survivor_avatar.jpg', 'character', '废土幸存者头像', 'Post-apocalyptic wasteland survivor, rugged appearance, worn clothes, determined expression, survival gear, post-apocalyptic portrait, futuristic art style, high quality, detailed character design, wasteland setting, survivor portrait, dramatic lighting, post-apocalyptic figure', '废土,幸存者,虚幻', NOW(), NOW()),
('废土幸存者-背景', 'placeholder://character/wasteland_survivor_background.jpg', 'character', '废土幸存者背景', 'Post-apocalyptic wasteland, ruins, desolate landscape, survival camp, post-apocalyptic atmosphere, wasteland setting, futuristic art style, high quality, detailed wasteland, post-apocalyptic era, survival environment, dramatic wasteland lighting, post-apocalyptic scene', '废土,废墟,虚幻', NOW(), NOW()),

-- 废土游商（商人）
('废土游商-头像', 'placeholder://character/wasteland_merchant_avatar.jpg', 'character', '废土游商头像', 'Post-apocalyptic wasteland merchant, trader, resourceful appearance, merchant clothes, shrewd expression, post-apocalyptic portrait, futuristic art style, high quality, detailed character design, wasteland setting, merchant portrait, dramatic lighting, post-apocalyptic figure', '废土,商人,虚幻', NOW(), NOW()),
('废土游商-背景', 'placeholder://character/wasteland_merchant_background.jpg', 'character', '废土游商背景', 'Post-apocalyptic trading post, makeshift market, goods, commercial atmosphere, wasteland setting, futuristic art style, high quality, detailed trading post, post-apocalyptic era, commercial space, dramatic wasteland lighting, post-apocalyptic market', '废土,市场,虚幻', NOW(), NOW()),

-- 废土拾荒者（拾荒者）
('废土拾荒者-头像', 'placeholder://character/wasteland_scavenger_avatar.jpg', 'character', '废土拾荒者头像', 'Post-apocalyptic wasteland scavenger, scavenger, resourceful appearance, scavenger gear, focused expression, post-apocalyptic portrait, futuristic art style, high quality, detailed character design, wasteland setting, scavenger portrait, dramatic lighting, post-apocalyptic figure', '废土,拾荒者,虚幻', NOW(), NOW()),
('废土拾荒者-背景', 'placeholder://character/wasteland_scavenger_background.jpg', 'character', '废土拾荒者背景', 'Post-apocalyptic ruins, scavenging site, abandoned buildings, wasteland atmosphere, scavenging setting, futuristic art style, high quality, detailed ruins, post-apocalyptic era, abandoned area, dramatic wasteland lighting, post-apocalyptic ruins', '废土,废墟,虚幻', NOW(), NOW()),

-- 废土战士（战士）
('废土战士-头像', 'placeholder://character/wasteland_warrior_avatar.jpg', 'character', '废土战士头像', 'Post-apocalyptic wasteland warrior, fighter, combat appearance, armor, weapon, brave expression, post-apocalyptic portrait, futuristic art style, high quality, detailed character design, wasteland setting, warrior portrait, dramatic lighting, post-apocalyptic figure', '废土,战士,虚幻', NOW(), NOW()),
('废土战士-背景', 'placeholder://character/wasteland_warrior_background.jpg', 'character', '废土战士背景', 'Post-apocalyptic battlefield, conflict zone, wasteland combat, military atmosphere, combat setting, futuristic art style, high quality, detailed battlefield, post-apocalyptic era, war zone, dramatic wasteland lighting, post-apocalyptic combat', '废土,战场,虚幻', NOW(), NOW()),

-- 废土医生（医生）
('废土医生-头像', 'placeholder://character/wasteland_doctor_avatar.jpg', 'character', '废土医生头像', 'Post-apocalyptic wasteland doctor, medic, medical appearance, medical gear, caring expression, post-apocalyptic portrait, futuristic art style, high quality, detailed character design, wasteland setting, doctor portrait, dramatic lighting, post-apocalyptic figure', '废土,医生,虚幻', NOW(), NOW()),
('废土医生-背景', 'placeholder://character/wasteland_doctor_background.jpg', 'character', '废土医生背景', 'Post-apocalyptic medical tent, makeshift clinic, medical supplies, medical atmosphere, medical setting, futuristic art style, high quality, detailed medical tent, post-apocalyptic era, clinic space, dramatic wasteland lighting, post-apocalyptic medical', '废土,诊所,虚幻', NOW(), NOW()),

-- 废土领袖（领导者）
('废土领袖-头像', 'placeholder://character/wasteland_leader_avatar.jpg', 'character', '废土领袖头像', 'Post-apocalyptic wasteland leader, commander, authoritative appearance, leader gear, strong expression, post-apocalyptic portrait, futuristic art style, high quality, detailed character design, wasteland setting, leader portrait, dramatic lighting, post-apocalyptic figure', '废土,领袖,虚幻', NOW(), NOW()),
('废土领袖-背景', 'placeholder://character/wasteland_leader_background.jpg', 'character', '废土领袖背景', 'Post-apocalyptic settlement, community center, leadership atmosphere, community setting, futuristic art style, high quality, detailed settlement, post-apocalyptic era, community space, dramatic wasteland lighting, post-apocalyptic community', '废土,定居点,虚幻', NOW(), NOW());

-- 查询插入结果
SELECT id, name, category, tags FROM system_resources WHERE tags LIKE '%废土%' ORDER BY id DESC LIMIT 12;


