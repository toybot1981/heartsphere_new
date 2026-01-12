-- 更新系统预设物品和事件的 system_era_id 字段
-- 根据 item_id 和 event_id 的命名规则关联到对应的系统场景

SET NAMES utf8mb4;

-- 更新系统预设物品的 system_era_id
UPDATE scenario_items SET system_era_id = 23 WHERE is_system=1 AND item_id LIKE 'item_university%';
UPDATE scenario_items SET system_era_id = 24 WHERE is_system=1 AND item_id LIKE 'item_high_school%';
UPDATE scenario_items SET system_era_id = 25 WHERE is_system=1 AND item_id LIKE 'item_work%';
UPDATE scenario_items SET system_era_id = 26 WHERE is_system=1 AND item_id LIKE 'item_childhood%';
UPDATE scenario_items SET system_era_id = 27 WHERE is_system=1 AND item_id LIKE 'item_hometown%';
UPDATE scenario_items SET system_era_id = 28 WHERE is_system=1 AND item_id LIKE 'item_three_kingdoms%';
UPDATE scenario_items SET system_era_id = 29 WHERE is_system=1 AND item_id LIKE 'item_qin%';
UPDATE scenario_items SET system_era_id = 30 WHERE is_system=1 AND item_id LIKE 'item_tang%';
UPDATE scenario_items SET system_era_id = 31 WHERE is_system=1 AND item_id LIKE 'item_song%';
UPDATE scenario_items SET system_era_id = 32 WHERE is_system=1 AND item_id LIKE 'item_ming%';
UPDATE scenario_items SET system_era_id = 33 WHERE is_system=1 AND item_id LIKE 'item_future%';
-- 注意：如果system_eras表中没有"赛博朋克都市"场景，这些更新会保持为NULL
UPDATE scenario_items SET system_era_id = (SELECT id FROM system_eras WHERE name LIKE '%赛博%' OR name LIKE '%朋克%' LIMIT 1) WHERE is_system=1 AND item_id LIKE 'item_cyberpunk%';
UPDATE scenario_items SET system_era_id = 37 WHERE is_system=1 AND (item_id LIKE '%fairy_tale%' OR item_id LIKE '%fairytale%');
UPDATE scenario_items SET system_era_id = 35 WHERE is_system=1 AND item_id LIKE 'item_wasteland%';
UPDATE scenario_items SET system_era_id = 36 WHERE is_system=1 AND item_id LIKE 'item_magic%';
UPDATE scenario_items SET system_era_id = 37 WHERE is_system=1 AND item_id LIKE 'item_fairytale%';
UPDATE scenario_items SET system_era_id = 38 WHERE is_system=1 AND item_id LIKE 'item_steampunk%';
UPDATE scenario_items SET system_era_id = 39 WHERE is_system=1 AND item_id LIKE 'item_egypt%';
UPDATE scenario_items SET system_era_id = 40 WHERE is_system=1 AND item_id LIKE 'item_greece%';
UPDATE scenario_items SET system_era_id = 41 WHERE is_system=1 AND item_id LIKE 'item_medieval%';
UPDATE scenario_items SET system_era_id = 42 WHERE is_system=1 AND item_id LIKE 'item_renaissance%';
UPDATE scenario_items SET system_era_id = 43 WHERE is_system=1 AND item_id LIKE 'item_industrial%';

-- 更新系统预设事件的 system_era_id
UPDATE scenario_events SET system_era_id = 23 WHERE is_system=1 AND event_id LIKE 'event_university%';
UPDATE scenario_events SET system_era_id = 24 WHERE is_system=1 AND event_id LIKE 'event_high_school%';
UPDATE scenario_events SET system_era_id = 25 WHERE is_system=1 AND event_id LIKE 'event_work%';
UPDATE scenario_events SET system_era_id = 26 WHERE is_system=1 AND event_id LIKE 'event_childhood%';
UPDATE scenario_events SET system_era_id = 27 WHERE is_system=1 AND event_id LIKE 'event_hometown%';
UPDATE scenario_events SET system_era_id = 28 WHERE is_system=1 AND event_id LIKE 'event_three_kingdoms%';
UPDATE scenario_events SET system_era_id = 29 WHERE is_system=1 AND event_id LIKE 'event_qin%';
UPDATE scenario_events SET system_era_id = 30 WHERE is_system=1 AND event_id LIKE 'event_tang%';
UPDATE scenario_events SET system_era_id = 31 WHERE is_system=1 AND event_id LIKE 'event_song%';
UPDATE scenario_events SET system_era_id = 32 WHERE is_system=1 AND event_id LIKE 'event_ming%';
UPDATE scenario_events SET system_era_id = 33 WHERE is_system=1 AND event_id LIKE 'event_future%';
-- 注意：如果system_eras表中没有"赛博朋克都市"场景，这些更新会保持为NULL
UPDATE scenario_events SET system_era_id = (SELECT id FROM system_eras WHERE name LIKE '%赛博%' OR name LIKE '%朋克%' LIMIT 1) WHERE is_system=1 AND event_id LIKE 'event_cyberpunk%';
UPDATE scenario_events SET system_era_id = 37 WHERE is_system=1 AND (event_id LIKE '%fairy_tale%' OR event_id LIKE '%fairytale%');
UPDATE scenario_events SET system_era_id = 35 WHERE is_system=1 AND event_id LIKE 'event_wasteland%';
UPDATE scenario_events SET system_era_id = 36 WHERE is_system=1 AND event_id LIKE 'event_magic%';
UPDATE scenario_events SET system_era_id = 37 WHERE is_system=1 AND event_id LIKE 'event_fairytale%';
UPDATE scenario_events SET system_era_id = 38 WHERE is_system=1 AND event_id LIKE 'event_steampunk%';
UPDATE scenario_events SET system_era_id = 39 WHERE is_system=1 AND event_id LIKE 'event_egypt%';
UPDATE scenario_events SET system_era_id = 40 WHERE is_system=1 AND event_id LIKE 'event_greece%';
UPDATE scenario_events SET system_era_id = 41 WHERE is_system=1 AND event_id LIKE 'event_medieval%';
UPDATE scenario_events SET system_era_id = 42 WHERE is_system=1 AND event_id LIKE 'event_renaissance%';
UPDATE scenario_events SET system_era_id = 43 WHERE is_system=1 AND event_id LIKE 'event_industrial%';

