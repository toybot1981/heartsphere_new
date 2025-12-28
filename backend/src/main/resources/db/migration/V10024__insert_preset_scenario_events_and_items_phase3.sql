-- 第三阶段：为未来科幻场景创建预置事件和物品
-- 场景：未来世界、赛博朋克都市、废土世界

-- 设置字符集
SET NAMES utf8mb4;

-- ========== 未来世界 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('太空探索', 'event_future_space_exploration', '参与太空探索任务', NULL, NULL, TRUE, NULL, '未来,太空,探索,科幻', 1, TRUE, FALSE),
('AI觉醒', 'event_future_ai_awakening', '见证人工智能的觉醒', NULL, NULL, TRUE, NULL, '未来,AI,觉醒,科幻', 2, TRUE, FALSE),
('虚拟现实', 'event_future_vr', '进入虚拟现实世界', NULL, NULL, TRUE, NULL, '未来,VR,虚拟,科幻', 3, TRUE, FALSE),
('时间旅行', 'event_future_time_travel', '进行时间旅行', NULL, NULL, TRUE, NULL, '未来,时间旅行,冒险,科幻', 4, TRUE, FALSE),
('基因改造', 'event_future_gene_modification', '接受基因改造', NULL, NULL, TRUE, NULL, '未来,基因,改造,科幻', 5, TRUE, FALSE),
('外星接触', 'event_future_alien_contact', '与外星文明接触', NULL, NULL, TRUE, NULL, '未来,外星,接触,科幻', 6, TRUE, FALSE),
('反重力城市', 'event_future_anti_gravity', '在反重力城市中生活', NULL, NULL, TRUE, NULL, '未来,反重力,城市,科幻', 7, TRUE, FALSE),
('量子通信', 'event_future_quantum', '使用量子通信技术', NULL, NULL, TRUE, NULL, '未来,量子,通信,科幻', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('能量武器', 'item_future_energy_weapon', '使用能量束的武器', NULL, NULL, TRUE, NULL, 'weapon', '未来,武器,能量,科幻', 1, TRUE, FALSE),
('全息投影仪', 'item_future_hologram', '可以投射全息影像的设备', NULL, NULL, TRUE, NULL, 'tool', '未来,全息,投影,科幻', 2, TRUE, FALSE),
('智能芯片', 'item_future_ai_chip', '植入式的AI智能芯片', NULL, NULL, TRUE, NULL, 'tool', '未来,AI,芯片,科幻', 3, TRUE, FALSE),
('能量块', 'item_future_energy_cell', '提供能量的能量块', NULL, NULL, TRUE, NULL, 'consumable', '未来,能量,消耗,科幻', 4, TRUE, FALSE),
('量子通讯器', 'item_future_quantum_comm', '量子通讯设备', NULL, NULL, TRUE, NULL, 'tool', '未来,量子,通讯,科幻', 5, TRUE, FALSE),
('反重力靴', 'item_future_gravity_boots', '可以抵抗重力的靴子', NULL, NULL, TRUE, NULL, 'tool', '未来,反重力,装备,科幻', 6, TRUE, FALSE),
('记忆卡', 'item_future_memory_card', '存储记忆的数据卡', NULL, NULL, TRUE, NULL, 'tool', '未来,记忆,存储,科幻', 7, TRUE, FALSE),
('纳米修复剂', 'item_future_nano_repair', '纳米级别的修复药剂', NULL, NULL, TRUE, NULL, 'consumable', '未来,纳米,修复,科幻', 8, TRUE, FALSE);

-- ========== 赛博朋克都市 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('霓虹街头', 'event_cyberpunk_neon_street', '在霓虹闪烁的街头行走', NULL, NULL, TRUE, NULL, '赛博朋克,霓虹,街头,未来', 1, TRUE, FALSE),
('义体改造', 'event_cyberpunk_cyberware', '进行义体改造手术', NULL, NULL, TRUE, NULL, '赛博朋克,义体,改造,科技', 2, TRUE, FALSE),
('黑客入侵', 'event_cyberpunk_hack', '执行黑客入侵任务', NULL, NULL, TRUE, NULL, '赛博朋克,黑客,入侵,危险', 3, TRUE, FALSE),
('公司冲突', 'event_cyberpunk_corporate', '与大型企业发生冲突', NULL, NULL, TRUE, NULL, '赛博朋克,公司,冲突,权力', 4, TRUE, FALSE),
('夜店狂欢', 'event_cyberpunk_nightclub', '在夜店中狂欢', NULL, NULL, TRUE, NULL, '赛博朋克,夜店,狂欢,放纵', 5, TRUE, FALSE),
('数据交易', 'event_cyberpunk_data_deal', '进行数据交易', NULL, NULL, TRUE, NULL, '赛博朋克,数据,交易,信息', 6, TRUE, FALSE),
('义体故障', 'event_cyberpunk_malfunction', '义体出现故障', NULL, NULL, TRUE, NULL, '赛博朋克,故障,危险,技术', 7, TRUE, FALSE),
('地下网络', 'event_cyberpunk_underground', '探索地下网络世界', NULL, NULL, TRUE, NULL, '赛博朋克,地下,网络,隐秘', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('义眼', 'item_cyberpunk_cyber_eye', '可以增强视力的义眼', NULL, NULL, TRUE, NULL, 'tool', '赛博朋克,义体,眼睛,增强', 1, TRUE, FALSE),
('神经接口', 'item_cyberpunk_neural_link', '连接神经系统的接口', NULL, NULL, TRUE, NULL, 'tool', '赛博朋克,神经,接口,连接', 2, TRUE, FALSE),
('能量武器', 'item_cyberpunk_energy_gun', '使用能量的枪械', NULL, NULL, TRUE, NULL, 'weapon', '赛博朋克,武器,能量,未来', 3, TRUE, FALSE),
('数据芯片', 'item_cyberpunk_data_chip', '存储数据的芯片', NULL, NULL, TRUE, NULL, 'tool', '赛博朋克,数据,芯片,信息', 4, TRUE, FALSE),
('强化剂', 'item_cyberpunk_booster', '临时增强能力的药物', NULL, NULL, TRUE, NULL, 'consumable', '赛博朋克,药物,增强,消耗', 5, TRUE, FALSE),
('黑客工具', 'item_cyberpunk_hack_tool', '用于网络入侵的工具', NULL, NULL, TRUE, NULL, 'tool', '赛博朋克,黑客,工具,技术', 6, TRUE, FALSE),
('信用点', 'item_cyberpunk_credits', '未来世界的货币', NULL, NULL, TRUE, NULL, 'collectible', '赛博朋克,货币,信用,交易', 7, TRUE, FALSE),
('义体升级', 'item_cyberpunk_upgrade', '义体升级组件', NULL, NULL, TRUE, NULL, 'tool', '赛博朋克,义体,升级,增强', 8, TRUE, FALSE);

-- ========== 废土世界 ==========
-- 事件
INSERT INTO `scenario_events` (`name`, `event_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('废墟探索', 'event_wasteland_explore', '在废墟中探索寻找资源', NULL, NULL, TRUE, NULL, '废土,探索,废墟,生存', 1, TRUE, FALSE),
('遭遇掠夺者', 'event_wasteland_raiders', '遭遇危险的掠夺者', NULL, NULL, TRUE, NULL, '废土,掠夺者,危险,战斗', 2, TRUE, FALSE),
('找到避难所', 'event_wasteland_shelter', '找到安全的避难所', NULL, NULL, TRUE, NULL, '废土,避难所,安全,生存', 3, TRUE, FALSE),
('辐射区', 'event_wasteland_radiation', '进入危险的辐射区域', NULL, NULL, TRUE, NULL, '废土,辐射,危险,生存', 4, TRUE, FALSE),
('贸易站', 'event_wasteland_trade', '在贸易站进行交易', NULL, NULL, TRUE, NULL, '废土,贸易,交易,生存', 5, TRUE, FALSE),
('变异生物', 'event_wasteland_mutant', '遭遇变异的生物', NULL, NULL, TRUE, NULL, '废土,变异,生物,危险', 6, TRUE, FALSE),
('找到水源', 'event_wasteland_water', '找到珍贵的水源', NULL, NULL, TRUE, NULL, '废土,水源,珍贵,生存', 7, TRUE, FALSE),
('末日回忆', 'event_wasteland_memory', '回忆起末日前的世界', NULL, NULL, TRUE, NULL, '废土,回忆,过去,情感', 8, TRUE, FALSE);

-- 物品
INSERT INTO `scenario_items` (`name`, `item_id`, `description`, `era_id`, `user_id`, `is_system`, `icon_url`, `item_type`, `tags`, `sort_order`, `is_active`, `is_deleted`) VALUES
('防辐射服', 'item_wasteland_rad_suit', '防护辐射的服装', NULL, NULL, TRUE, NULL, 'tool', '废土,防护,辐射,生存', 1, TRUE, FALSE),
('武器', 'item_wasteland_weapon', '自制的武器', NULL, NULL, TRUE, NULL, 'weapon', '废土,武器,自制,战斗', 2, TRUE, FALSE),
('净化水', 'item_wasteland_clean_water', '净化过的饮用水', NULL, NULL, TRUE, NULL, 'consumable', '废土,水源,珍贵,生存', 3, TRUE, FALSE),
('罐头', 'item_wasteland_can', '保存完好的罐头食物', NULL, NULL, TRUE, NULL, 'consumable', '废土,食物,罐头,生存', 4, TRUE, FALSE),
('废料', 'item_wasteland_scrap', '可用于制作物品的废料', NULL, NULL, TRUE, NULL, 'tool', '废土,废料,材料,制作', 5, TRUE, FALSE),
('地图', 'item_wasteland_map', '标注危险区域的地图', NULL, NULL, TRUE, NULL, 'tool', '废土,地图,导航,生存', 6, TRUE, FALSE),
('医疗包', 'item_wasteland_medkit', '简单的医疗用品', NULL, NULL, TRUE, NULL, 'consumable', '废土,医疗,治疗,生存', 7, TRUE, FALSE),
('汽油', 'item_wasteland_gas', '珍贵的汽油燃料', NULL, NULL, TRUE, NULL, 'consumable', '废土,燃料,珍贵,移动', 8, TRUE, FALSE);

