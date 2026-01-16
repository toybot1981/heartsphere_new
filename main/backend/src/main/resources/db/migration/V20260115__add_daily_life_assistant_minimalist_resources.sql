-- 为日常生活助手场景和6个角色添加极简主义风格资源
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20260115__add_daily_life_assistant_minimalist_resources.sql
-- 
-- 说明：本文件为"日常生活助手"场景和6个角色添加极简主义风格的图片资源
-- 资源风格：极简主义 - 简洁线条、干净配色、现代感、功能性优先

SET NAMES utf8mb4;

-- ========== 1. 时代表资源 (Era) ==========
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) 
SELECT 
  '日常生活助手',
  'placeholder://era/daily_life_assistant.jpg',
  'era',
  '日常生活助手场景 - 极简主义风格，简洁现代的设计，体现生活助手的专业性和亲和力',
  'Minimalist design, daily life assistant scene, clean modern workspace, simple geometric shapes, soft pastel colors, white background, professional yet warm atmosphere, functional layout, minimal decoration, modern minimalist style, clean lines, spacious feel, contemporary design, light color palette, subtle shadows, high quality, 4k resolution',
  '日常生活助手,极简主义,现代,生活助手',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `system_resources` 
  WHERE `name` = '日常生活助手' AND `category` = 'era'
);

-- ========== 2. 角色头像和背景资源 (Character) ==========

-- 2.1 时小光 - 时间管理导师
-- 头像
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) 
SELECT 
  '时小光-头像',
  'placeholder://character/shixiaoguang_avatar.jpg',
  'character',
  '时小光头像 - 极简主义风格，时间管理导师，简洁友好，体现效率和专业性',
  'Minimalist character portrait, time management mentor, friendly and professional expression, clean simple design, soft neutral colors, minimal facial features, geometric style, modern minimalist art, white or light gray background, simple lines, professional appearance, calm expression, efficiency-focused, contemporary design, high quality, 4k resolution',
  '时小光,时间管理,极简主义,头像,生活助手',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `system_resources` 
  WHERE `name` = '时小光-头像' AND `category` = 'character'
);

-- 背景：效率工作室
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) 
SELECT 
  '效率工作室-背景',
  'placeholder://character/efficiency_studio_background.jpg',
  'character',
  '效率工作室背景 - 极简主义风格，简洁有序的现代化办公空间，体现时间管理的专业性',
  'Minimalist efficiency studio interior, clean modern office space, simple geometric furniture, white and light gray color scheme, minimal decoration, organized workspace, clock or time management tools visible, clean lines, spacious feel, professional atmosphere, contemporary minimalist design, soft natural lighting, high quality, 4k resolution, functional layout',
  '效率工作室,极简主义,办公空间,背景,时小光',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `system_resources` 
  WHERE `name` = '效率工作室-背景' AND `category` = 'character'
);

-- 2.2 康小健 - 健康生活顾问
-- 头像
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) 
SELECT 
  '康小健-头像',
  'placeholder://character/kangxiaojian_avatar.jpg',
  'character',
  '康小健头像 - 极简主义风格，健康生活顾问，温暖活力，体现健康和活力',
  'Minimalist character portrait, health life consultant, warm and energetic expression, clean simple design, soft green and white colors, minimal facial features, geometric style, modern minimalist art, light background, simple lines, healthy vibrant appearance, friendly smile, wellness-focused, contemporary design, high quality, 4k resolution',
  '康小健,健康生活,极简主义,头像,生活助手',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `system_resources` 
  WHERE `name` = '康小健-头像' AND `category` = 'character'
);

-- 背景：健康生活馆
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) 
SELECT 
  '健康生活馆-背景',
  'placeholder://character/wellness_center_background.jpg',
  'character',
  '健康生活馆背景 - 极简主义风格，明亮清新的健康生活空间，体现活力和健康',
  'Minimalist wellness center interior, bright clean health space, simple modern design, light green and white color scheme, minimal decoration, exercise area and consultation space, clean lines, spacious feel, fresh healthy atmosphere, contemporary minimalist design, natural lighting, plants visible, high quality, 4k resolution, functional wellness layout',
  '健康生活馆,极简主义,健康空间,背景,康小健',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `system_resources` 
  WHERE `name` = '健康生活馆-背景' AND `category` = 'character'
);

-- 2.3 学小知 - 学习成长导师
-- 头像
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) 
SELECT 
  '学小知-头像',
  'placeholder://character/xuexiaozhi_avatar.jpg',
  'character',
  '学小知头像 - 极简主义风格，学习成长导师，充满好奇心，体现知识和智慧',
  'Minimalist character portrait, learning growth mentor, curious and intelligent expression, clean simple design, soft blue and white colors, minimal facial features, geometric style, modern minimalist art, light background, simple lines, scholarly appearance, thoughtful expression, knowledge-focused, contemporary design, high quality, 4k resolution',
  '学小知,学习成长,极简主义,头像,生活助手',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `system_resources` 
  WHERE `name` = '学小知-头像' AND `category` = 'character'
);

-- 背景：智慧书房
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) 
SELECT 
  '智慧书房-背景',
  'placeholder://character/wisdom_study_background.jpg',
  'character',
  '智慧书房背景 - 极简主义风格，充满书香的现代化学习空间，体现学习和探索',
  'Minimalist study room interior, modern learning space, simple bookshelf and desk, soft blue and white color scheme, minimal decoration, books and learning materials visible, clean lines, spacious feel, scholarly atmosphere, contemporary minimalist design, natural lighting, knowledge-focused layout, high quality, 4k resolution, functional study space',
  '智慧书房,极简主义,学习空间,背景,学小知',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `system_resources` 
  WHERE `name` = '智慧书房-背景' AND `category` = 'character'
);

-- 2.4 心小暖 - 情绪陪伴师
-- 头像
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) 
SELECT 
  '心小暖-头像',
  'placeholder://character/xinxiaonuan_avatar.jpg',
  'character',
  '心小暖头像 - 极简主义风格，情绪陪伴师，温暖共情，体现关怀和理解',
  'Minimalist character portrait, emotional companion, warm and empathetic expression, clean simple design, soft pink and beige colors, minimal facial features, geometric style, modern minimalist art, light warm background, simple lines, caring appearance, gentle smile, compassion-focused, contemporary design, high quality, 4k resolution',
  '心小暖,情绪陪伴,极简主义,头像,生活助手',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `system_resources` 
  WHERE `name` = '心小暖-头像' AND `category` = 'character'
);

-- 背景：温暖小屋
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) 
SELECT 
  '温暖小屋-背景',
  'placeholder://character/cozy_corner_background.jpg',
  'character',
  '温暖小屋背景 - 极简主义风格，温馨舒适的小空间，体现安全感和治愈感',
  'Minimalist cozy corner interior, warm comfortable small space, simple soft furniture, soft beige and cream color scheme, minimal decoration, soft lighting, clean lines, intimate feel, safe relaxing atmosphere, contemporary minimalist design, warm natural lighting, plants visible, high quality, 4k resolution, cozy minimalist layout',
  '温暖小屋,极简主义,温馨空间,背景,心小暖',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `system_resources` 
  WHERE `name` = '温暖小屋-背景' AND `category` = 'character'
);

-- 2.5 心小安 - 心理健康守护者
-- 头像
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) 
SELECT 
  '心小安-头像',
  'placeholder://character/xinxiaoan_avatar.jpg',
  'character',
  '心小安头像 - 极简主义风格，心理健康守护者，专业温和，体现专业性和安全感',
  'Minimalist character portrait, mental health guardian, professional and gentle expression, clean simple design, soft purple and white colors, minimal facial features, geometric style, modern minimalist art, light background, simple lines, professional appearance, calm reassuring expression, wellness-focused, contemporary design, high quality, 4k resolution',
  '心小安,心理健康,极简主义,头像,生活助手',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `system_resources` 
  WHERE `name` = '心小安-头像' AND `category` = 'character'
);

-- 背景：心理健康中心
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) 
SELECT 
  '心理健康中心-背景',
  'placeholder://character/mental_wellness_center_background.jpg',
  'character',
  '心理健康中心背景 - 极简主义风格，专业而温馨的心理健康空间，体现专业和支持',
  'Minimalist mental wellness center interior, professional yet warm health space, simple modern design, soft purple and white color scheme, minimal decoration, knowledge wall and assessment area visible, clean lines, spacious feel, supportive atmosphere, contemporary minimalist design, soft lighting, calming layout, high quality, 4k resolution, functional wellness space',
  '心理健康中心,极简主义,健康空间,背景,心小安',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `system_resources` 
  WHERE `name` = '心理健康中心-背景' AND `category` = 'character'
);

-- 2.6 暖小阳 - 情感陪伴伙伴
-- 头像
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) 
SELECT 
  '暖小阳-头像',
  'placeholder://character/nuanxiaoyang_avatar.jpg',
  'character',
  '暖小阳头像 - 极简主义风格，情感陪伴伙伴，活泼开朗，体现活力和正能量',
  'Minimalist character portrait, emotional companion partner, cheerful and lively expression, clean simple design, soft yellow and orange colors, minimal facial features, geometric style, modern minimalist art, light sunny background, simple lines, energetic appearance, bright smile, positivity-focused, contemporary design, high quality, 4k resolution',
  '暖小阳,情感陪伴,极简主义,头像,生活助手',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `system_resources` 
  WHERE `name` = '暖小阳-头像' AND `category` = 'character'
);

-- 背景：阳光客厅
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) 
SELECT 
  '阳光客厅-背景',
  'placeholder://character/sunny_living_room_background.jpg',
  'character',
  '阳光客厅背景 - 极简主义风格，温馨舒适的客厅，体现轻松和家的温暖',
  'Minimalist sunny living room interior, warm comfortable home space, simple modern furniture, soft yellow and cream color scheme, minimal decoration, sofa and coffee table visible, clean lines, homey feel, relaxed natural atmosphere, contemporary minimalist design, bright natural lighting, plants and photo wall visible, high quality, 4k resolution, cozy home layout',
  '阳光客厅,极简主义,客厅空间,背景,暖小阳',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM `system_resources` 
  WHERE `name` = '阳光客厅-背景' AND `category` = 'character'
);

-- ========== 3. 更新 system_eras 表的 image_url ==========
UPDATE `system_eras` 
SET `image_url` = 'placeholder://era/daily_life_assistant.jpg'
WHERE `name` = '日常生活助手' 
  AND (`image_url` IS NULL OR `image_url` = 'placeholder://era/daily_life_assistant.jpg' OR `image_url` LIKE '%placeholder%');

-- ========== 4. 更新 system_characters 表的 avatar_url 和 background_url ==========

-- 4.1 时小光
UPDATE `system_characters`
SET 
  `avatar_url` = 'placeholder://character/shixiaoguang_avatar.jpg',
  `background_url` = 'placeholder://character/efficiency_studio_background.jpg'
WHERE `name` = '时小光' 
  AND `system_era_id` = (SELECT id FROM `system_eras` WHERE `name` = '日常生活助手' LIMIT 1);

-- 4.2 康小健
UPDATE `system_characters`
SET 
  `avatar_url` = 'placeholder://character/kangxiaojian_avatar.jpg',
  `background_url` = 'placeholder://character/wellness_center_background.jpg'
WHERE `name` = '康小健' 
  AND `system_era_id` = (SELECT id FROM `system_eras` WHERE `name` = '日常生活助手' LIMIT 1);

-- 4.3 学小知
UPDATE `system_characters`
SET 
  `avatar_url` = 'placeholder://character/xuexiaozhi_avatar.jpg',
  `background_url` = 'placeholder://character/wisdom_study_background.jpg'
WHERE `name` = '学小知' 
  AND `system_era_id` = (SELECT id FROM `system_eras` WHERE `name` = '日常生活助手' LIMIT 1);

-- 4.4 心小暖
UPDATE `system_characters`
SET 
  `avatar_url` = 'placeholder://character/xinxiaonuan_avatar.jpg',
  `background_url` = 'placeholder://character/cozy_corner_background.jpg'
WHERE `name` = '心小暖' 
  AND `system_era_id` = (SELECT id FROM `system_eras` WHERE `name` = '日常生活助手' LIMIT 1);

-- 4.5 心小安
UPDATE `system_characters`
SET 
  `avatar_url` = 'placeholder://character/xinxiaoan_avatar.jpg',
  `background_url` = 'placeholder://character/mental_wellness_center_background.jpg'
WHERE `name` = '心小安' 
  AND `system_era_id` = (SELECT id FROM `system_eras` WHERE `name` = '日常生活助手' LIMIT 1);

-- 4.6 暖小阳
UPDATE `system_characters`
SET 
  `avatar_url` = 'placeholder://character/nuanxiaoyang_avatar.jpg',
  `background_url` = 'placeholder://character/sunny_living_room_background.jpg'
WHERE `name` = '暖小阳' 
  AND `system_era_id` = (SELECT id FROM `system_eras` WHERE `name` = '日常生活助手' LIMIT 1);

-- ========== 5. 验证插入结果 ==========
-- 查询插入的资源
SELECT 
  id, name, url, category, description, tags, created_at
FROM `system_resources`
WHERE name IN (
  '日常生活助手',
  '时小光-头像', '效率工作室-背景',
  '康小健-头像', '健康生活馆-背景',
  '学小知-头像', '智慧书房-背景',
  '心小暖-头像', '温暖小屋-背景',
  '心小安-头像', '心理健康中心-背景',
  '暖小阳-头像', '阳光客厅-背景'
)
ORDER BY category, name;

-- 查询更新的角色URL
SELECT 
  id, name, avatar_url, background_url
FROM `system_characters`
WHERE `system_era_id` = (SELECT id FROM `system_eras` WHERE `name` = '日常生活助手' LIMIT 1)
ORDER BY sort_order;
