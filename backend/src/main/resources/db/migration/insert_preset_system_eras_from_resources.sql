-- 根据资源管理中的时代资源，插入预设时代数据
-- 执行方法：mysql -u root -p123456 heartsphere --default-character-set=utf8mb4 < insert_preset_system_eras_from_resources.sql

-- 设置字符集
SET NAMES utf8mb4;

-- 清空现有数据（可选，如果需要重新初始化）
-- DELETE FROM system_eras;

-- 插入预设时代数据（根据system_resources表中category='era'的资源）
INSERT INTO `system_eras` (`name`, `description`, `image_url`, `start_year`, `end_year`, `is_active`, `sort_order`) VALUES

-- ========== 现实时代 ==========
('我的大学', '大学时代，青春校园生活', 'http://localhost:8081/api/images/files/general/2025/12/79209fab-04d2-47f3-a8c9-6700a6533a71.png', 2018, 2022, TRUE, 1),
('我的中学', '中学时代，青涩年华', 'placeholder://era/my_high_school.jpg', 2015, 2018, TRUE, 2),
('我的工作', '职场时代，工作环境', 'placeholder://era/my_workplace.jpg', 2022, NULL, TRUE, 3),
('我的童年', '童年时代，纯真回忆', 'placeholder://era/my_childhood.jpg', 2005, 2015, TRUE, 4),
('我的故乡', '故乡时代，家乡记忆', 'placeholder://era/my_hometown.jpg', NULL, NULL, TRUE, 5),

-- ========== 历史时代 - 中国古代 ==========
('三国时代', '三国争霸时代，英雄辈出', 'http://localhost:8081/api/images/files/general/2025/12/5d9703ae-8a7d-41e5-9d9b-d312364edfc9.png', 220, 280, TRUE, 10),
('秦王朝', '大秦帝国，统一六国', 'placeholder://era/qin_dynasty.jpg', 221, 207, TRUE, 11),
('唐朝盛世', '大唐盛世，文化繁荣', 'placeholder://era/tang_dynasty.jpg', 618, 907, TRUE, 12),
('宋朝文雅', '宋朝文雅时代，诗词盛行', 'placeholder://era/song_dynasty.jpg', 960, 1279, TRUE, 13),
('明朝江湖', '明朝江湖时代，武侠世界', 'placeholder://era/ming_dynasty.jpg', 1368, 1644, TRUE, 14),

-- ========== 虚幻时代 - 未来科幻 ==========
('未来世界', '未来世界，科技发达', 'placeholder://era/future_world.jpg', 2100, NULL, TRUE, 20),
('赛博朋克都市', '赛博朋克都市，霓虹闪烁', 'placeholder://era/cyberpunk_city.jpg', 2077, NULL, TRUE, 21),
('废土世界', '废土世界，末日之后', 'placeholder://era/wasteland.jpg', 2050, NULL, TRUE, 22),

-- ========== 虚幻时代 - 奇幻魔法 ==========
('魔法世界', '魔法世界，奇幻大陆', 'placeholder://era/magic_world.jpg', NULL, NULL, TRUE, 30),
('童话世界', '童话世界，梦幻王国', 'http://localhost:8081/api/images/files/general/2025/12/3870b2e4-0983-42c9-add3-d30612d7d778.png', NULL, NULL, TRUE, 31),
('蒸汽朋克', '蒸汽朋克时代，机械美学', 'placeholder://era/steampunk.jpg', 1850, 1900, TRUE, 32),

-- ========== 历史时代 - 世界古代 ==========
('古代埃及', '古埃及时代，法老王朝', 'placeholder://era/ancient_egypt.jpg', -3100, -30, TRUE, 40),
('古希腊', '古希腊时代，神话传说', 'placeholder://era/ancient_greece.jpg', -800, -146, TRUE, 41),
('中世纪欧洲', '中世纪欧洲，骑士时代', 'placeholder://era/medieval_europe.jpg', 476, 1453, TRUE, 42),
('文艺复兴', '文艺复兴时代，艺术繁荣', 'placeholder://era/renaissance.jpg', 1400, 1600, TRUE, 43),
('工业革命', '工业革命时代，机器轰鸣', 'placeholder://era/industrial_revolution.jpg', 1760, 1840, TRUE, 44);

-- 查询插入结果
SELECT id, name, description, is_active, sort_order FROM system_eras ORDER BY sort_order, id;

