-- 更新所有资源的提示词，使其更贴近中国元素
-- 对于明显的外国IP（如童话公主、精灵、古埃及、古希腊等）保持原样

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- 1. 更新头像（Avatar）提示词 - 现代角色改为中国特点
-- ============================================

-- 温柔可爱的女孩 - 中国女孩特点
UPDATE system_resources 
SET prompt = 'A gentle and cute Chinese girl portrait, soft Asian features, warm smile, natural lighting, realistic style, high quality, detailed facial features, peaceful expression, modern Chinese clothing, studio portrait photography, Chinese beauty standards'
WHERE id = 113;

-- 阳光开朗的男孩 - 中国男孩特点
UPDATE system_resources 
SET prompt = 'A sunny and cheerful Chinese boy portrait, bright smile, energetic expression, natural outdoor lighting, realistic style, high quality, detailed facial features, modern casual Chinese clothing, vibrant colors, portrait photography, Asian features'
WHERE id = 114;

-- 成熟优雅的女性 - 中国女性特点
UPDATE system_resources 
SET prompt = 'A mature and elegant Chinese woman portrait, professional appearance, confident expression, soft studio lighting, realistic style, high quality, detailed facial features, business attire, sophisticated look, portrait photography, Chinese professional woman'
WHERE id = 115;

-- 商务男士 - 中国男士特点
UPDATE system_resources 
SET prompt = 'A professional Chinese business man portrait, formal attire, confident expression, professional lighting, realistic style, high quality, detailed facial features, suit and tie, serious expression, corporate portrait photography, Asian businessman'
WHERE id = 116;

-- 文艺青年 - 中国文艺青年特点
UPDATE system_resources 
SET prompt = 'An artistic Chinese youth portrait, creative style, thoughtful expression, soft natural lighting, realistic style, high quality, detailed facial features, casual artistic clothing, bohemian style, artistic portrait photography, Chinese artistic youth'
WHERE id = 117;

-- 瑜伽老师 - 中国瑜伽老师特点
UPDATE system_resources 
SET prompt = 'A Chinese yoga teacher portrait, peaceful style, serene expression, natural lighting, zen atmosphere, realistic style, high quality, detailed facial features, yoga clothing, calm expression, wellness portrait photography, Asian yoga instructor'
WHERE id = 131;

-- 咖啡师 - 中国咖啡师特点
UPDATE system_resources 
SET prompt = 'A Chinese barista portrait, professional style, focused expression, warm cafe lighting, cozy atmosphere, realistic style, high quality, detailed facial features, cafe uniform, friendly expression, professional portrait photography, Asian barista'
WHERE id = 132;

-- 旅行者 - 中国旅行者特点
UPDATE system_resources 
SET prompt = 'A Chinese traveler portrait, adventurous style, free-spirited expression, natural outdoor lighting, travel atmosphere, realistic style, high quality, detailed facial features, travel clothing, wanderlust expression, travel photography, Asian backpacker'
WHERE id = 133;

-- ============================================
-- 2. 更新角色（Character）提示词 - 现代角色改为中国特点
-- ============================================

-- 大学室友 - 中国大学生特点
UPDATE system_resources 
SET prompt = 'A Chinese university roommate character, college student, friendly appearance, casual clothing, youthful atmosphere, realistic style, high quality, detailed character design, modern Chinese campus setting, contemporary portrait, warm lighting, Chinese college life, Asian student'
WHERE id = 154;

-- 大学教授 - 中国教授特点
UPDATE system_resources 
SET prompt = 'A Chinese university professor character, scholarly appearance, professional attire, intellectual atmosphere, realistic style, high quality, detailed character design, Chinese academic setting, professional portrait, natural lighting, Chinese educational environment, Asian professor'
WHERE id = 155;

-- 高中同桌 - 中国高中生特点
UPDATE system_resources 
SET prompt = 'A Chinese high school desk mate character, teenager, Chinese school uniform, innocent expression, youthful atmosphere, realistic style, high quality, detailed character design, Chinese school setting, teenage portrait, bright lighting, Chinese school life, Asian student'
WHERE id = 156;

-- 职场同事 - 中国职场人士特点
UPDATE system_resources 
SET prompt = 'A Chinese workplace colleague character, professional appearance, business attire, friendly expression, professional atmosphere, realistic style, high quality, detailed character design, Chinese office setting, professional portrait, office lighting, Chinese work environment, Asian professional'
WHERE id = 157;

-- 童年伙伴 - 中国儿童特点
UPDATE system_resources 
SET prompt = 'A Chinese childhood friend character, child, playful appearance, casual clothing, innocent atmosphere, realistic style, high quality, detailed character design, Chinese childhood setting, nostalgic portrait, warm lighting, Chinese childhood memories, Asian child'
WHERE id = 158;

-- ============================================
-- 3. 更新时代场景（Era）提示词 - 添加中国元素
-- ============================================

-- 大学校园 - 中国大学校园特点
UPDATE system_resources 
SET prompt = 'A Chinese university campus scene, modern Chinese architecture, students walking, green lawns, academic atmosphere, realistic style, high quality, detailed Chinese architecture, vibrant Chinese campus life, educational environment, contemporary photography, warm daylight, Chinese university setting'
WHERE id = 134;

-- 高中场景 - 中国高中特点
UPDATE system_resources 
SET prompt = 'A Chinese high school scene, Chinese school building, students in Chinese school uniform, playground, youthful atmosphere, realistic style, high quality, detailed Chinese school environment, Chinese teenage life, educational setting, contemporary photography, bright daylight, Chinese high school'
WHERE id = 135;

-- 现代办公室 - 中国办公室特点
UPDATE system_resources 
SET prompt = 'A modern Chinese office workplace, professional environment, business setting, contemporary Chinese architecture, work atmosphere, realistic style, high quality, detailed Chinese office interior, professional setting, Chinese corporate environment, modern photography, office lighting, Chinese workplace'
WHERE id = 136;

-- 童年场景 - 中国童年特点
UPDATE system_resources 
SET prompt = 'A Chinese childhood scene, Chinese playground, toys, children playing, nostalgic atmosphere, realistic style, high quality, detailed Chinese childhood environment, innocent memories, playful setting, nostalgic photography, warm golden hour, Chinese childhood'
WHERE id = 137;

-- 家乡场景 - 中国家乡特点
UPDATE system_resources 
SET prompt = 'A Chinese hometown scene, traditional Chinese architecture, local Chinese streets, hometown atmosphere, nostalgic feeling, realistic style, high quality, detailed Chinese hometown environment, familiar places, Chinese local culture, nostalgic photography, warm lighting, Chinese hometown'
WHERE id = 138;

-- 未来世界 - 添加中国元素（但保持科幻感）
UPDATE system_resources 
SET prompt = 'A future Chinese world scene, futuristic Chinese city, advanced technology, flying vehicles, sci-fi atmosphere, sci-fi art style, high quality, detailed futuristic Chinese architecture, high-tech environment, science fiction art, neon lighting, futuristic vision, Chinese sci-fi city'
WHERE id = 144;

-- 赛博朋克城市 - 添加中国元素
UPDATE system_resources 
SET prompt = 'A Chinese cyberpunk city scene, neon-lit Chinese streets, futuristic Chinese buildings, cyberpunk atmosphere, dark urban setting, cyberpunk art style, high quality, detailed cyberpunk Chinese architecture, neon colors, sci-fi art, dramatic neon lighting, dystopian future, Chinese cyberpunk city'
WHERE id = 145;

-- ============================================
-- 4. 更新通用场景（General）提示词 - 添加中国元素
-- ============================================

-- 现代城市 - 中国城市特点
UPDATE system_resources 
SET prompt = 'A modern Chinese city scene, Chinese skyscrapers, urban atmosphere, contemporary Chinese architecture, city setting, realistic style, high quality, detailed Chinese urban landscape, modern Chinese architecture, city lighting, Chinese urban life, Chinese metropolitan scene'
WHERE id = 208;

-- 城市夜景 - 中国城市夜景特点
UPDATE system_resources 
SET prompt = 'A Chinese city night scene, Chinese urban lights, night atmosphere, Chinese city setting, urban beauty, realistic style, high quality, detailed Chinese city landscape, night city, neon lighting, Chinese urban nightlife, Chinese metropolitan night'
WHERE id = 218;

-- 雨夜街道 - 中国街道特点
UPDATE system_resources 
SET prompt = 'A Chinese rainy night street scene, wet Chinese streets, atmospheric mood, Chinese urban setting, poetic atmosphere, realistic style, high quality, detailed Chinese street landscape, rainy environment, dramatic lighting, poetic moment, Chinese urban atmosphere'
WHERE id = 220;

-- 咖啡时光 - 中国咖啡文化
UPDATE system_resources 
SET prompt = 'A Chinese coffee time scene, Chinese coffee cup, cozy atmosphere, Chinese cafe setting, relaxation concept, realistic style, high quality, detailed Chinese cafe composition, cozy environment, warm lighting, relaxing moment, Chinese cafe scene'
WHERE id = 215;

-- 音乐旋律 - 添加中国音乐元素
UPDATE system_resources 
SET prompt = 'A Chinese music melody concept, traditional and modern Chinese musical instruments, artistic atmosphere, Chinese music setting, art concept, abstract art style, high quality, detailed Chinese musical composition, artistic environment, dramatic lighting, Chinese musical beauty, artistic scene'
WHERE id = 216;

-- ============================================
-- 5. 更新日记场景（Journal）提示词 - 添加中国元素
-- ============================================

-- 早晨日记 - 中国早晨特点
UPDATE system_resources 
SET prompt = 'A Chinese morning journal scene, sunrise, peaceful Chinese morning atmosphere, journal book, pen, soft morning light, realistic style, high quality, detailed Chinese journal setting, Chinese morning routine, warm lighting, new day beginning, peaceful moment, Chinese lifestyle'
WHERE id = 184;

-- 夜晚反思日记 - 中国夜晚特点
UPDATE system_resources 
SET prompt = 'A Chinese night reflection journal scene, moonlit night, quiet atmosphere, journal book, candlelight, peaceful Chinese evening, realistic style, high quality, detailed Chinese journal setting, Chinese evening routine, soft candlelight, daily reflection, quiet moment, Chinese lifestyle'
WHERE id = 185;

-- 工作记录日记 - 中国职场特点
UPDATE system_resources 
SET prompt = 'A Chinese work record journal scene, Chinese office setting, professional atmosphere, journal book, work notes, Chinese business environment, realistic style, high quality, detailed Chinese journal setting, Chinese workplace, office lighting, work documentation, professional record, Chinese work culture'
WHERE id = 186;

-- 学习笔记日记 - 中国学习特点
UPDATE system_resources 
SET prompt = 'A Chinese study notes journal scene, Chinese study room, academic atmosphere, journal book, study materials, Chinese educational setting, realistic style, high quality, detailed Chinese journal setting, Chinese learning environment, natural lighting, study documentation, knowledge accumulation, Chinese education'
WHERE id = 187;

-- ============================================
-- 注意：以下资源保持原样（外国IP或特殊设定）
-- ============================================
-- ID 118-120: 中国古代角色（已是中国元素，保持原样）
-- ID 121-122: 魔法少女、精灵王子（外国IP，保持原样）
-- ID 123-124: 赛博朋克、机甲战士（科幻设定，保持原样）
-- ID 125-127: 日本动漫风格（外国IP，保持原样）
-- ID 128-129: 神秘面具、童话公主（外国IP，保持原样）
-- ID 130: 摇滚明星（保持原样）
-- ID 159-167: 中国历史人物（已是中国元素，保持原样）
-- ID 168-175: 科幻、奇幻角色（保持原样）
-- ID 226-235: 童话角色（外国IP，保持原样）
-- ID 139-143: 中国历史时代（已是中国元素，保持原样）
-- ID 146-153: 外国历史时代（外国IP，保持原样）
-- ID 225: 童话世界（外国IP，保持原样）
-- ID 204-207, 209-214, 217, 219, 221-224: 通用场景（部分已更新，部分保持原样）

