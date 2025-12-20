-- 为蒸汽朋克场景添加角色资源
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < add_steampunk_characters_resources.sql

SET NAMES utf8mb4;

-- ========== 蒸汽朋克角色资源 ==========
-- 蒸汽机械师（工程师）
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) VALUES
('蒸汽机械师-头像', 'placeholder://character/steampunk_mechanic_avatar.jpg', 'character', '蒸汽机械师头像', 'Steampunk mechanic, engineer, skilled appearance, Victorian-style work clothes, goggles, mechanical tools, focused expression, steampunk portrait, futuristic art style, high quality, detailed character design, steampunk setting, mechanic portrait, dramatic lighting, steampunk figure', '蒸汽朋克,机械师,虚幻', NOW(), NOW()),
('蒸汽机械师-背景', 'placeholder://character/steampunk_mechanic_background.jpg', 'character', '蒸汽机械师背景', 'Steampunk workshop, steam engines, gears, mechanical devices, Victorian industrial atmosphere, engineering setting, steampunk architecture, futuristic art style, high quality, detailed workshop, steampunk era, mechanical workshop, dramatic steam lighting, steampunk technical architecture', '蒸汽朋克,工坊,虚幻', NOW(), NOW()),

-- 蒸汽发明家（发明家）
('蒸汽发明家-头像', 'placeholder://character/steampunk_inventor_avatar.jpg', 'character', '蒸汽发明家头像', 'Steampunk inventor, innovator, creative appearance, Victorian inventor clothes, goggles, inventive expression, steampunk portrait, futuristic art style, high quality, detailed character design, steampunk setting, inventor portrait, dramatic lighting, steampunk figure', '蒸汽朋克,发明家,虚幻', NOW(), NOW()),
('蒸汽发明家-背景', 'placeholder://character/steampunk_inventor_background.jpg', 'character', '蒸汽发明家背景', 'Steampunk inventor laboratory, inventions, prototypes, steam-powered devices, creative atmosphere, innovation setting, steampunk architecture, futuristic art style, high quality, detailed laboratory, steampunk era, inventor lab, dramatic steam lighting, steampunk creative architecture', '蒸汽朋克,实验室,虚幻', NOW(), NOW()),

-- 蒸汽贵族（贵族）
('蒸汽贵族-头像', 'placeholder://character/steampunk_noble_avatar.jpg', 'character', '蒸汽贵族头像', 'Steampunk noble, aristocrat, elegant appearance, Victorian fine clothes, sophisticated expression, steampunk portrait, futuristic art style, high quality, detailed character design, steampunk setting, noble portrait, dramatic lighting, steampunk figure', '蒸汽朋克,贵族,虚幻', NOW(), NOW()),
('蒸汽贵族-背景', 'placeholder://character/steampunk_noble_background.jpg', 'character', '蒸汽贵族背景', 'Steampunk mansion, Victorian palace, luxurious interior, aristocratic atmosphere, noble setting, steampunk architecture, futuristic art style, high quality, detailed mansion, steampunk era, noble residence, dramatic steam lighting, steampunk aristocratic architecture', '蒸汽朋克,豪宅,虚幻', NOW(), NOW()),

-- 蒸汽冒险家（冒险者）
('蒸汽冒险家-头像', 'placeholder://character/steampunk_adventurer_avatar.jpg', 'character', '蒸汽冒险家头像', 'Steampunk adventurer, explorer, adventurous appearance, Victorian explorer clothes, goggles, adventurous expression, steampunk portrait, futuristic art style, high quality, detailed character design, steampunk setting, adventurer portrait, dramatic lighting, steampunk figure', '蒸汽朋克,冒险家,虚幻', NOW(), NOW()),
('蒸汽冒险家-背景', 'placeholder://character/steampunk_adventurer_background.jpg', 'character', '蒸汽冒险家背景', 'Steampunk airship, flying machine, adventure scene, exploration atmosphere, adventure setting, steampunk architecture, futuristic art style, high quality, detailed airship, steampunk era, flying vessel, dramatic steam lighting, steampunk adventure architecture', '蒸汽朋克,飞艇,虚幻', NOW(), NOW()),

-- 蒸汽学者（学者）
('蒸汽学者-头像', 'placeholder://character/steampunk_scholar_avatar.jpg', 'character', '蒸汽学者头像', 'Steampunk scholar, academic, intellectual appearance, Victorian scholar clothes, glasses, thoughtful expression, steampunk portrait, futuristic art style, high quality, detailed character design, steampunk setting, scholar portrait, dramatic lighting, steampunk figure', '蒸汽朋克,学者,虚幻', NOW(), NOW()),
('蒸汽学者-背景', 'placeholder://character/steampunk_scholar_background.jpg', 'character', '蒸汽学者背景', 'Steampunk library, books, steam-powered devices, scholarly atmosphere, academic setting, steampunk architecture, futuristic art style, high quality, detailed library, steampunk era, academic space, dramatic steam lighting, steampunk academic architecture', '蒸汽朋克,图书馆,虚幻', NOW(), NOW()),

-- 蒸汽工匠（工匠）
('蒸汽工匠-头像', 'placeholder://character/steampunk_artisan_avatar.jpg', 'character', '蒸汽工匠头像', 'Steampunk artisan, craftsman, skilled appearance, Victorian artisan clothes, tools, focused expression, steampunk portrait, futuristic art style, high quality, detailed character design, steampunk setting, artisan portrait, dramatic lighting, steampunk figure', '蒸汽朋克,工匠,虚幻', NOW(), NOW()),
('蒸汽工匠-背景', 'placeholder://character/steampunk_artisan_background.jpg', 'character', '蒸汽工匠背景', 'Steampunk workshop, craft tools, mechanical creations, artisan atmosphere, craft setting, steampunk architecture, futuristic art style, high quality, detailed workshop, steampunk era, craft space, dramatic steam lighting, steampunk craft architecture', '蒸汽朋克,工坊,虚幻', NOW(), NOW());

-- 查询插入结果
SELECT id, name, category, tags FROM system_resources WHERE tags LIKE '%蒸汽朋克%' ORDER BY id DESC LIMIT 12;


