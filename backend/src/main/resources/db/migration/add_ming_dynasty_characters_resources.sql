-- 为明朝江湖场景添加角色资源
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < add_ming_dynasty_characters_resources.sql

SET NAMES utf8mb4;

-- ========== 明朝江湖角色资源 ==========
-- 朱元璋（明太祖）
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) VALUES
('朱元璋-头像', 'placeholder://character/zhu_yuanzhang_avatar.jpg', 'character', '朱元璋头像', 'Ancient Chinese emperor, Zhu Yuanzhang (Ming Taizu), Ming Dynasty founder, majestic appearance, imperial robes, determined expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Ming Dynasty setting, imperial portrait, dramatic lighting, Chinese historical figure', '明朝,皇帝,朱元璋,历史', NOW(), NOW()),
('朱元璋-背景', 'placeholder://character/zhu_yuanzhang_background.jpg', 'character', '朱元璋背景', 'Ming Dynasty imperial palace, majestic throne room, ancient Chinese architecture, imperial atmosphere, golden decorations, ancient Chinese palace setting, historical art style, high quality, detailed palace interior, Ming Dynasty era, imperial court, dramatic palace lighting, Chinese imperial architecture', '明朝,皇宫,历史', NOW(), NOW()),

-- 王阳明（阳明先生）
('王阳明-头像', 'placeholder://character/wang_yangming_avatar.jpg', 'character', '王阳明天头', 'Ancient Chinese philosopher and general, Wang Yangming, Ming Dynasty Neo-Confucian scholar, scholarly appearance, official robes, wise expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Ming Dynasty setting, philosopher portrait, soft lighting, Chinese historical figure', '明朝,哲学家,王阳明,历史', NOW(), NOW()),
('王阳明-背景', 'placeholder://character/wang_yangming_background.jpg', 'character', '王阳明背景', 'Ming Dynasty study, books and scrolls, ancient Chinese academy, scholarly atmosphere, philosophical setting, ancient Chinese study, historical art style, high quality, detailed study interior, Ming Dynasty era, philosopher study, soft lighting, Chinese academic architecture', '明朝,书院,历史', NOW(), NOW()),

-- 戚继光（抗倭名将）
('戚继光-头像', 'placeholder://character/qi_jiguang_avatar.jpg', 'character', '戚继光头像', 'Ancient Chinese general, Qi Jiguang, Ming Dynasty anti-pirate hero, heroic appearance, military armor, brave expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Ming Dynasty setting, military portrait, dramatic lighting, Chinese historical figure', '明朝,将军,戚继光,历史', NOW(), NOW()),
('戚继光-背景', 'placeholder://character/qi_jiguang_background.jpg', 'character', '戚继光背景', 'Ming Dynasty coastal defense, military camp, ancient Chinese fortress, military atmosphere, battlefield setting, ancient Chinese military camp, historical art style, high quality, detailed military setting, Ming Dynasty era, coastal defense, dramatic military lighting, Chinese military architecture', '明朝,军营,历史', NOW(), NOW()),

-- 海瑞（海青天）
('海瑞-头像', 'placeholder://character/hai_rui_avatar.jpg', 'character', '海瑞头像', 'Ancient Chinese official, Hai Rui, Ming Dynasty honest official, upright appearance, official robes, stern expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Ming Dynasty setting, official portrait, dramatic lighting, Chinese historical figure', '明朝,清官,海瑞,历史', NOW(), NOW()),
('海瑞-背景', 'placeholder://character/hai_rui_background.jpg', 'character', '海瑞背景', 'Ming Dynasty government office, simple furniture, ancient Chinese court, administrative atmosphere, honest official setting, ancient Chinese office, historical art style, high quality, detailed office interior, Ming Dynasty era, government building, soft office lighting, Chinese administrative architecture', '明朝,官府,历史', NOW(), NOW()),

-- 唐伯虎（风流才子）
('唐伯虎-头像', 'placeholder://character/tang_bohu_avatar.jpg', 'character', '唐伯虎头像', 'Ancient Chinese painter and poet, Tang Bohu, Ming Dynasty talented scholar, elegant appearance, scholar robes, free-spirited expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Ming Dynasty setting, artist portrait, soft lighting, Chinese historical figure', '明朝,才子,唐伯虎,历史', NOW(), NOW()),
('唐伯虎-背景', 'placeholder://character/tang_bohu_background.jpg', 'character', '唐伯虎背景', 'Ming Dynasty art studio, paintings and calligraphy, ancient Chinese studio, artistic atmosphere, creative setting, ancient Chinese studio, historical art style, high quality, detailed studio interior, Ming Dynasty era, artist studio, soft studio lighting, Chinese artistic architecture', '明朝,画室,历史', NOW(), NOW()),

-- 郑和（三宝太监）
('郑和-头像', 'placeholder://character/zheng_he_avatar.jpg', 'character', '郑和头像', 'Ancient Chinese explorer, Zheng He, Ming Dynasty admiral, explorer appearance, official robes, determined expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Ming Dynasty setting, explorer portrait, dramatic lighting, Chinese historical figure', '明朝,航海家,郑和,历史', NOW(), NOW()),
('郑和-背景', 'placeholder://character/zheng_he_background.jpg', 'character', '郑和背景', 'Ming Dynasty ship, ocean voyage, ancient Chinese ship, maritime atmosphere, exploration setting, ancient Chinese ship, historical art style, high quality, detailed ship interior, Ming Dynasty era, ocean voyage, dramatic maritime lighting, Chinese maritime architecture', '明朝,宝船,历史', NOW(), NOW()),

-- 张居正（改革家）
('张居正-头像', 'placeholder://character/zhang_juzheng_avatar.jpg', 'character', '张居正头像', 'Ancient Chinese statesman, Zhang Juzheng, Ming Dynasty reformer, scholarly appearance, official robes, thoughtful expression, ancient Chinese portrait, historical art style, high quality, detailed character design, Ming Dynasty setting, statesman portrait, soft lighting, Chinese historical figure', '明朝,改革家,张居正,历史', NOW(), NOW()),
('张居正-背景', 'placeholder://character/zhang_juzheng_background.jpg', 'character', '张居正背景', 'Ming Dynasty government office, official documents, ancient Chinese court, administrative atmosphere, political setting, ancient Chinese office, historical art style, high quality, detailed office interior, Ming Dynasty era, government building, soft office lighting, Chinese administrative architecture', '明朝,官府,历史', NOW(), NOW());

-- 查询插入结果
SELECT id, name, category, tags FROM system_resources WHERE tags LIKE '%明朝%' ORDER BY id DESC LIMIT 14;





