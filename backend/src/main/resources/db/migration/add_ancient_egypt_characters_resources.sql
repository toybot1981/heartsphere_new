-- 为古代埃及场景添加角色资源
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < add_ancient_egypt_characters_resources.sql

SET NAMES utf8mb4;

-- ========== 古代埃及角色资源 ==========
-- 拉美西斯二世（法老）
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) VALUES
('拉美西斯二世-头像', 'placeholder://character/ramesses_ii_avatar.jpg', 'character', '拉美西斯二世头像', 'Ancient Egyptian pharaoh, Ramesses II, great pharaoh of Egypt, majestic appearance, pharaonic crown, royal robes, authoritative expression, ancient Egyptian portrait, historical art style, high quality, detailed character design, Ancient Egypt setting, pharaoh portrait, dramatic lighting, Egyptian historical figure', '埃及,法老,拉美西斯,历史', NOW(), NOW()),
('拉美西斯二世-背景', 'placeholder://character/ramesses_ii_background.jpg', 'character', '拉美西斯二世背景', 'Ancient Egyptian palace, pharaonic throne room, hieroglyphs, golden decorations, ancient Egyptian architecture, royal atmosphere, historical art style, high quality, detailed palace interior, Ancient Egypt era, pharaonic court, dramatic palace lighting, Egyptian imperial architecture', '埃及,皇宫,历史', NOW(), NOW()),

-- 克利奥帕特拉（埃及女王）
('克利奥帕特拉-头像', 'placeholder://character/cleopatra_avatar.jpg', 'character', '克利奥帕特拉头像', 'Ancient Egyptian queen, Cleopatra, last pharaoh of Egypt, elegant appearance, royal crown, graceful robes, beautiful expression, ancient Egyptian portrait, historical art style, high quality, detailed character design, Ancient Egypt setting, queen portrait, dramatic lighting, Egyptian historical figure', '埃及,女王,克利奥帕特拉,历史', NOW(), NOW()),
('克利奥帕特拉-背景', 'placeholder://character/cleopatra_background.jpg', 'character', '克利奥帕特拉背景', 'Ancient Egyptian palace, elegant chambers, luxurious decorations, royal atmosphere, ancient Egyptian architecture, queen residence, historical art style, high quality, detailed palace interior, Ancient Egypt era, royal chambers, dramatic palace lighting, Egyptian royal architecture', '埃及,宫殿,历史', NOW(), NOW()),

-- 图坦卡蒙（年轻法老）
('图坦卡蒙-头像', 'placeholder://character/tutankhamun_avatar.jpg', 'character', '图坦卡蒙头像', 'Ancient Egyptian pharaoh, Tutankhamun, young pharaoh of Egypt, youthful appearance, golden mask, royal robes, mysterious expression, ancient Egyptian portrait, historical art style, high quality, detailed character design, Ancient Egypt setting, pharaoh portrait, dramatic lighting, Egyptian historical figure', '埃及,法老,图坦卡蒙,历史', NOW(), NOW()),
('图坦卡蒙-背景', 'placeholder://character/tutankhamun_background.jpg', 'character', '图坦卡蒙背景', 'Ancient Egyptian tomb, burial chamber, golden treasures, hieroglyphs, ancient Egyptian architecture, burial atmosphere, historical art style, high quality, detailed tomb interior, Ancient Egypt era, pharaonic tomb, dramatic tomb lighting, Egyptian burial architecture', '埃及,陵墓,历史', NOW(), NOW()),

-- 祭司（大祭司）
('埃及大祭司-头像', 'placeholder://character/egyptian_high_priest_avatar.jpg', 'character', '埃及大祭司头像', 'Ancient Egyptian high priest, religious leader, wise appearance, ceremonial robes, sacred symbols, solemn expression, ancient Egyptian portrait, historical art style, high quality, detailed character design, Ancient Egypt setting, priest portrait, dramatic lighting, Egyptian religious figure', '埃及,祭司,历史', NOW(), NOW()),
('埃及大祭司-背景', 'placeholder://character/egyptian_high_priest_background.jpg', 'character', '埃及大祭司背景', 'Ancient Egyptian temple, sacred chamber, hieroglyphs, religious artifacts, ancient Egyptian architecture, religious atmosphere, historical art style, high quality, detailed temple interior, Ancient Egypt era, sacred temple, dramatic temple lighting, Egyptian temple architecture', '埃及,神庙,历史', NOW(), NOW()),

-- 建筑师（金字塔建造者）
('埃及建筑师-头像', 'placeholder://character/egyptian_architect_avatar.jpg', 'character', '埃及建筑师头像', 'Ancient Egyptian architect, pyramid builder, skilled appearance, work robes, tools, determined expression, ancient Egyptian portrait, historical art style, high quality, detailed character design, Ancient Egypt setting, architect portrait, dramatic lighting, Egyptian craftsman figure', '埃及,建筑师,历史', NOW(), NOW()),
('埃及建筑师-背景', 'placeholder://character/egyptian_architect_background.jpg', 'character', '埃及建筑师背景', 'Ancient Egyptian pyramid construction site, massive stones, construction tools, desert setting, ancient Egyptian architecture, construction atmosphere, historical art style, high quality, detailed construction site, Ancient Egypt era, pyramid building, dramatic construction lighting, Egyptian construction scene', '埃及,建筑工地,历史', NOW(), NOW()),

-- 学者（书吏）
('埃及书吏-头像', 'placeholder://character/egyptian_scribe_avatar.jpg', 'character', '埃及书吏头像', 'Ancient Egyptian scribe, scholar, intelligent appearance, scholar robes, writing tools, thoughtful expression, ancient Egyptian portrait, historical art style, high quality, detailed character design, Ancient Egypt setting, scribe portrait, soft lighting, Egyptian scholar figure', '埃及,书吏,历史', NOW(), NOW()),
('埃及书吏-背景', 'placeholder://character/egyptian_scribe_background.jpg', 'character', '埃及书吏背景', 'Ancient Egyptian scriptorium, papyrus scrolls, writing materials, hieroglyphs, ancient Egyptian architecture, scholarly atmosphere, historical art style, high quality, detailed scriptorium interior, Ancient Egypt era, writing chamber, soft lighting, Egyptian scholarly architecture', '埃及,书室,历史', NOW(), NOW());

-- 查询插入结果
SELECT id, name, category, tags FROM system_resources WHERE tags LIKE '%埃及%' ORDER BY id DESC LIMIT 12;


