-- 第四阶段：为奇幻魔法场景的物品创建资源记录（包含AI图片生成提示词）
-- 场景：魔法世界、童话世界、蒸汽朋克

SET NAMES utf8mb4;

-- ========== 魔法世界 - 物品资源 ==========
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_by_admin_id`, `created_at`, `updated_at`) VALUES
('法杖（物品）', 'placeholder://item/item_magic_wand.jpg', 'item', '魔法师使用的法杖', 'Magic wand, wizard staff, enchanted staff, fantasy magic item, realistic style, high quality, detailed wand, ornate magical staff, fantasy wand design with magical glow', '魔法,法杖,物品', NULL, NOW(), NOW()),
('魔法书（物品）', 'placeholder://item/item_magic_spellbook.jpg', 'item', '记载魔法咒语的魔法书', 'Spellbook, magic tome, enchanted book, fantasy spell book, realistic style, high quality, detailed book, ancient magical tome, fantasy book with magical aura', '魔法,书籍,物品', NULL, NOW(), NOW()),
('魔法水晶（物品）', 'placeholder://item/item_magic_crystal.jpg', 'item', '储存魔法的水晶', 'Magic crystal, mana crystal, enchanted gemstone, fantasy crystal, realistic style, high quality, detailed crystal, glowing magical crystal, fantasy gemstone with magical energy', '魔法,水晶,物品', NULL, NOW(), NOW()),
('治疗药剂（物品）', 'placeholder://item/item_magic_healing_potion.jpg', 'item', '恢复生命值的药剂', 'Healing potion, health potion, magical medicine, fantasy potion bottle, realistic style, high quality, detailed potion, glowing liquid, fantasy potion with magical properties', '魔法,药品,物品', NULL, NOW(), NOW()),
('魔法戒指（物品）', 'placeholder://item/item_magic_ring.jpg', 'item', '增强魔法能力的戒指', 'Magic ring, enchanted ring, magical jewelry, fantasy ring, realistic style, high quality, detailed ring, ornate magical ring, fantasy jewelry with magical glow', '魔法,戒指,物品', NULL, NOW(), NOW()),
('传送卷轴（物品）', 'placeholder://item/item_magic_scroll.jpg', 'item', '可进行传送的魔法卷轴', 'Teleport scroll, magic scroll, enchanted scroll, fantasy scroll, realistic style, high quality, detailed scroll, ancient magical parchment, fantasy scroll with magical runes', '魔法,卷轴,物品', NULL, NOW(), NOW()),
('元素宝石（物品）', 'placeholder://item/item_magic_elemental_gem.jpg', 'item', '蕴含元素力量的宝石', 'Elemental gem, magical gemstone, enchanted gem, fantasy gem, realistic style, high quality, detailed gem, glowing elemental crystal, fantasy gem with elemental energy', '魔法,宝石,物品', NULL, NOW(), NOW()),
('魔法护符（物品）', 'placeholder://item/item_magic_amulet.jpg', 'item', '提供防护的魔法护符', 'Magic amulet, protective amulet, enchanted talisman, fantasy amulet, realistic style, high quality, detailed amulet, ornate magical talisman, fantasy amulet with protective magic', '魔法,护符,物品', NULL, NOW(), NOW());

-- ========== 童话世界 - 物品资源 ==========
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_by_admin_id`, `created_at`, `updated_at`) VALUES
('魔法苹果（物品）', 'placeholder://item/item_fairytale_apple.jpg', 'item', '神奇的魔法苹果', 'Magic apple, enchanted apple, fairy tale apple, glowing apple, realistic style, high quality, detailed apple, magical fruit, fairy tale item with magical glow', '童话,苹果,物品', NULL, NOW(), NOW()),
('水晶鞋（物品）', 'placeholder://item/item_fairytale_glass_slipper.jpg', 'item', '灰姑娘的水晶鞋', 'Glass slipper, crystal shoe, Cinderella shoe, fairy tale shoe, realistic style, high quality, detailed shoe, elegant glass shoe, fairy tale footwear with sparkle', '童话,鞋子,物品', NULL, NOW(), NOW()),
('魔法镜子（物品）', 'placeholder://item/item_fairytale_magic_mirror.jpg', 'item', '会说话的魔法镜', 'Magic mirror, talking mirror, enchanted mirror, fairy tale mirror, realistic style, high quality, detailed mirror, ornate magical mirror, fairy tale mirror with magical aura', '童话,镜子,物品', NULL, NOW(), NOW()),
('许愿星（物品）', 'placeholder://item/item_fairytale_wishing_star.jpg', 'item', '可以实现愿望的星星', 'Wishing star, magical star, fairy tale star, glowing star, realistic style, high quality, detailed star, twinkling magical star, fairy tale item with magical sparkle', '童话,星星,物品', NULL, NOW(), NOW()),
('魔法豆（物品）', 'placeholder://item/item_fairytale_magic_bean.jpg', 'item', '会生长的魔法豆', 'Magic bean, enchanted bean, fairy tale bean, growing bean, realistic style, high quality, detailed bean, glowing magical bean, fairy tale item with magical properties', '童话,豆子,物品', NULL, NOW(), NOW()),
('玫瑰花（物品）', 'placeholder://item/item_fairytale_rose.jpg', 'item', '永不凋零的玫瑰花', 'Enchanted rose, magic rose, fairy tale rose, eternal rose, realistic style, high quality, detailed rose, beautiful magical rose, fairy tale flower with magical glow', '童话,玫瑰,物品', NULL, NOW(), NOW()),
('小精灵翅膀（物品）', 'placeholder://item/item_fairytale_fairy_wings.jpg', 'item', '小精灵的翅膀', 'Fairy wings, magical wings, enchanted wings, fairy tale wings, realistic style, high quality, detailed wings, delicate magical wings, fairy tale wings with sparkle', '童话,翅膀,物品', NULL, NOW(), NOW()),
('魔法棒（物品）', 'placeholder://item/item_fairytale_magic_wand.jpg', 'item', '仙女教母的魔法棒', 'Fairy wand, magic wand, enchanted wand, fairy tale wand, realistic style, high quality, detailed wand, sparkly magical wand, fairy tale wand with magical sparkle', '童话,魔法棒,物品', NULL, NOW(), NOW());

-- ========== 蒸汽朋克 - 物品资源 ==========
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_by_admin_id`, `created_at`, `updated_at`) VALUES
('蒸汽引擎（物品）', 'placeholder://item/item_steampunk_engine.jpg', 'item', '驱动机械的蒸汽引擎', 'Steam engine, mechanical engine, steampunk machinery, brass and copper engine, realistic style, high quality, detailed engine, ornate steam-powered engine, steampunk engine with gears and pipes', '蒸汽朋克,引擎,物品', NULL, NOW(), NOW()),
('齿轮（物品）', 'placeholder://item/item_steampunk_gear.jpg', 'item', '机械装置的齿轮', 'Mechanical gear, brass gear, steampunk gear, intricate gear mechanism, realistic style, high quality, detailed gear, ornate brass gear, steampunk mechanical component', '蒸汽朋克,齿轮,物品', NULL, NOW(), NOW()),
('蒸汽枪（物品）', 'placeholder://item/item_steampunk_gun.jpg', 'item', '使用蒸汽动力的武器', 'Steam gun, steam-powered weapon, steampunk firearm, brass steam gun, realistic style, high quality, detailed gun, ornate steam weapon, steampunk gun with pipes and valves', '蒸汽朋克,武器,物品', NULL, NOW(), NOW()),
('怀表（物品）', 'placeholder://item/item_steampunk_pocket_watch.jpg', 'item', '精美的机械怀表', 'Pocket watch, mechanical watch, steampunk timepiece, brass pocket watch, realistic style, high quality, detailed watch, ornate mechanical watch, steampunk timepiece with gears visible', '蒸汽朋克,怀表,物品', NULL, NOW(), NOW()),
('飞行器（物品）', 'placeholder://item/item_steampunk_airship.jpg', 'item', '蒸汽动力的飞行器', 'Airship, steam-powered aircraft, steampunk flying machine, brass airship, realistic style, high quality, detailed airship, ornate flying vehicle, steampunk aircraft with steam pipes', '蒸汽朋克,飞行器,物品', NULL, NOW(), NOW()),
('机械手臂（物品）', 'placeholder://item/item_steampunk_mechanical_arm.jpg', 'item', '蒸汽驱动的机械手臂', 'Mechanical arm, steam-powered prosthesis, steampunk bionic arm, brass mechanical arm, realistic style, high quality, detailed arm, ornate mechanical prosthesis, steampunk arm with gears and pipes', '蒸汽朋克,义体,物品', NULL, NOW(), NOW()),
('蒸汽阀门（物品）', 'placeholder://item/item_steampunk_valve.jpg', 'item', '控制蒸汽的阀门', 'Steam valve, brass valve, steampunk valve, mechanical valve, realistic style, high quality, detailed valve, ornate brass valve, steampunk mechanical valve with intricate design', '蒸汽朋克,阀门,物品', NULL, NOW(), NOW()),
('铜制管道（物品）', 'placeholder://item/item_steampunk_pipe.jpg', 'item', '输送蒸汽的管道', 'Brass pipe, copper pipe, steampunk pipe, steam conduit, realistic style, high quality, detailed pipe, ornate metal pipe, steampunk pipe with mechanical connections', '蒸汽朋克,管道,物品', NULL, NOW(), NOW());

