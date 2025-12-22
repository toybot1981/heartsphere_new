-- 为工业革命场景添加角色资源
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < add_industrial_revolution_characters_resources.sql

SET NAMES utf8mb4;

-- ========== 工业革命角色资源 ==========
-- 工厂主（资本家）
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_at`, `updated_at`) VALUES
('工厂主-头像', 'placeholder://character/factory_owner_avatar.jpg', 'character', '工厂主头像', 'Industrial Revolution factory owner, capitalist, business appearance, fine clothes, determined expression, 19th century portrait, historical art style, high quality, detailed character design, Industrial Revolution setting, businessman portrait, dramatic lighting, European historical figure', '工业革命,工厂主,历史', NOW(), NOW()),
('工厂主-背景', 'placeholder://character/factory_owner_background.jpg', 'character', '工厂主背景', 'Industrial Revolution factory, machinery, industrial setting, business atmosphere, manufacturing environment, 19th century architecture, historical art style, high quality, detailed factory, Industrial Revolution era, industrial interior, dramatic industrial lighting, European industrial architecture', '工业革命,工厂,历史', NOW(), NOW()),

-- 工程师（机械工程师）
('工程师-头像', 'placeholder://character/engineer_avatar.jpg', 'character', '工程师头像', 'Industrial Revolution engineer, mechanical engineer, skilled appearance, work clothes, focused expression, 19th century portrait, historical art style, high quality, detailed character design, Industrial Revolution setting, engineer portrait, dramatic lighting, European historical figure', '工业革命,工程师,历史', NOW(), NOW()),
('工程师-背景', 'placeholder://character/engineer_background.jpg', 'character', '工程师背景', 'Industrial Revolution workshop, mechanical designs, tools, engineering atmosphere, technical setting, 19th century architecture, historical art style, high quality, detailed workshop, Industrial Revolution era, engineering office, dramatic workshop lighting, European technical architecture', '工业革命,工坊,历史', NOW(), NOW()),

-- 工人（工厂工人）
('工人-头像', 'placeholder://character/factory_worker_avatar.jpg', 'character', '工人头像', 'Industrial Revolution factory worker, laborer, working class appearance, work clothes, determined expression, 19th century portrait, historical art style, high quality, detailed character design, Industrial Revolution setting, worker portrait, dramatic lighting, European historical figure', '工业革命,工人,历史', NOW(), NOW()),
('工人-背景', 'placeholder://character/factory_worker_background.jpg', 'character', '工人背景', 'Industrial Revolution factory floor, machinery, working environment, industrial atmosphere, labor setting, 19th century architecture, historical art style, high quality, detailed factory floor, Industrial Revolution era, workshop interior, dramatic industrial lighting, European industrial architecture', '工业革命,车间,历史', NOW(), NOW()),

-- 发明家（创新者）
('发明家-头像', 'placeholder://character/inventor_avatar.jpg', 'character', '发明家头像', 'Industrial Revolution inventor, innovator, creative appearance, inventor clothes, innovative expression, 19th century portrait, historical art style, high quality, detailed character design, Industrial Revolution setting, inventor portrait, dramatic lighting, European historical figure', '工业革命,发明家,历史', NOW(), NOW()),
('发明家-背景', 'placeholder://character/inventor_background.jpg', 'character', '发明家背景', 'Industrial Revolution inventor workshop, inventions, prototypes, creative atmosphere, innovation setting, 19th century architecture, historical art style, high quality, detailed inventor workshop, Industrial Revolution era, laboratory, dramatic workshop lighting, European creative architecture', '工业革命,发明室,历史', NOW(), NOW()),

-- 工会领袖（工人代表）
('工会领袖-头像', 'placeholder://character/union_leader_avatar.jpg', 'character', '工会领袖头像', 'Industrial Revolution union leader, labor organizer, determined appearance, worker clothes, strong expression, 19th century portrait, historical art style, high quality, detailed character design, Industrial Revolution setting, leader portrait, dramatic lighting, European historical figure', '工业革命,工会,历史', NOW(), NOW()),
('工会领袖-背景', 'placeholder://character/union_leader_background.jpg', 'character', '工会领袖背景', 'Industrial Revolution meeting hall, workers gathering, union atmosphere, organizational setting, 19th century architecture, historical art style, high quality, detailed meeting hall, Industrial Revolution era, union hall, dramatic meeting lighting, European organizational architecture', '工业革命,工会,历史', NOW(), NOW()),

-- 商人（贸易商）
('贸易商-头像', 'placeholder://character/merchant_avatar.jpg', 'character', '贸易商头像', 'Industrial Revolution merchant, trader, business appearance, merchant clothes, shrewd expression, 19th century portrait, historical art style, high quality, detailed character design, Industrial Revolution setting, merchant portrait, dramatic lighting, European historical figure', '工业革命,商人,历史', NOW(), NOW()),
('贸易商-背景', 'placeholder://character/merchant_background.jpg', 'character', '贸易商背景', 'Industrial Revolution trading post, goods, commercial atmosphere, business setting, 19th century architecture, historical art style, high quality, detailed trading post, Industrial Revolution era, commercial space, dramatic market lighting, European commercial architecture', '工业革命,贸易站,历史', NOW(), NOW());

-- 查询插入结果
SELECT id, name, category, tags FROM system_resources WHERE tags LIKE '%工业革命%' ORDER BY id DESC LIMIT 12;





