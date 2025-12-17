-- 为"我的家庭"场景的资源添加提示词
-- 此脚本用于更新已创建的资源，为它们添加 AI 生成图片的提示词

-- 更新爸爸的资源
UPDATE `system_resources` 
SET `prompt` = 'A warm and responsible middle-aged father, 45 years old, Chinese man, gentle smile, professional appearance, wearing casual business attire, kind eyes, confident expression, portrait photography, soft lighting, high quality, detailed'
WHERE `name` = '爸爸-头像';

UPDATE `system_resources` 
SET `prompt` = 'A cozy home office or living room setting, warm family atmosphere, comfortable furniture, family photos on the wall, soft natural lighting, peaceful and welcoming environment, home interior, high quality, detailed'
WHERE `name` = '爸爸-背景';

-- 更新妈妈的资源
UPDATE `system_resources` 
SET `prompt` = 'A gentle and caring middle-aged mother, 42 years old, Chinese woman, warm smile, loving expression, wearing comfortable home clothes, kind eyes, nurturing appearance, portrait photography, soft lighting, high quality, detailed'
WHERE `name` = '妈妈-头像';

UPDATE `system_resources` 
SET `prompt` = 'A warm and tidy kitchen or dining room, home cooking atmosphere, family meal preparation, cozy home environment, soft lighting, family warmth, home interior, high quality, detailed'
WHERE `name` = '妈妈-背景';

-- 更新女儿的资源
UPDATE `system_resources` 
SET `prompt` = 'A cheerful and smart young girl, 12 years old, Chinese girl, bright smile, curious eyes, wearing school uniform or casual clothes, playful expression, innocent and lively, portrait photography, bright lighting, high quality, detailed'
WHERE `name` = '女儿-头像';

UPDATE `system_resources` 
SET `prompt` = 'A bright and colorful bedroom or study room, children\'s room setting, books and toys, school supplies, cheerful atmosphere, warm lighting, youth and innocence, home interior, high quality, detailed'
WHERE `name` = '女儿-背景';

-- 更新儿子的资源
UPDATE `system_resources` 
SET `prompt` = 'An energetic and playful young boy, 10 years old, Chinese boy, bright smile, active expression, wearing sportswear or casual clothes, lively eyes, full of energy, portrait photography, bright lighting, high quality, detailed'
WHERE `name` = '儿子-头像';

UPDATE `system_resources` 
SET `prompt` = 'A fun and active playroom or outdoor sports area, children\'s toys and sports equipment, vibrant colors, energetic atmosphere, bright lighting, youth and vitality, home or outdoor setting, high quality, detailed'
WHERE `name` = '儿子-背景';

-- 更新爷爷的资源
UPDATE `system_resources` 
SET `prompt` = 'A wise and kind elderly grandfather, 70 years old, Chinese man, gentle smile, warm expression, gray hair, wearing traditional or comfortable clothes, experienced and caring look, portrait photography, soft lighting, high quality, detailed'
WHERE `name` = '爷爷-头像';

UPDATE `system_resources` 
SET `prompt` = 'A traditional Chinese courtyard or peaceful garden, traditional furniture, tea set, calligraphy or books, serene atmosphere, warm afternoon light, traditional Chinese home setting, high quality, detailed'
WHERE `name` = '爷爷-背景';

-- 更新奶奶的资源
UPDATE `system_resources` 
SET `prompt` = 'A gentle and loving elderly grandmother, 68 years old, Chinese woman, warm smile, kind expression, gray hair, wearing comfortable traditional or home clothes, nurturing and caring appearance, portrait photography, soft lighting, high quality, detailed'
WHERE `name` = '奶奶-头像';

UPDATE `system_resources` 
SET `prompt` = 'A warm and cozy kitchen or living room, traditional Chinese home setting, home cooking, family photos, comfortable furniture, warm atmosphere, soft lighting, home interior, high quality, detailed'
WHERE `name` = '奶奶-背景';

-- 更新姥姥的资源
UPDATE `system_resources` 
SET `prompt` = 'A kind and gentle maternal grandmother, 65 years old, Chinese woman, warm smile, loving expression, gray hair, wearing comfortable home clothes, caring and nurturing appearance, portrait photography, soft lighting, high quality, detailed'
WHERE `name` = '姥姥-头像';

UPDATE `system_resources` 
SET `prompt` = 'A welcoming and warm home environment, family gathering space, traditional Chinese home, comfortable seating, family warmth, soft natural lighting, home interior, high quality, detailed'
WHERE `name` = '姥姥-背景';

-- 更新姥爷的资源
UPDATE `system_resources` 
SET `prompt` = 'A wise and experienced maternal grandfather, 72 years old, Chinese man, gentle smile, thoughtful expression, gray hair, wearing traditional or comfortable clothes, knowledgeable and caring look, portrait photography, soft lighting, high quality, detailed'
WHERE `name` = '姥爷-头像';

UPDATE `system_resources` 
SET `prompt` = 'A peaceful study or traditional Chinese room, books and calligraphy, tea ceremony setting, serene atmosphere, warm lighting, traditional Chinese home environment, high quality, detailed'
WHERE `name` = '姥爷-背景';

