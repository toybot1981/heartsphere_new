-- ============================================================
-- 删除所有普通注册用户及其关联数据
-- 执行前请务必备份数据库！
-- ============================================================
-- 
-- 使用说明：
-- 1. 本地数据库：mysql -u root -p123456 heartsphere < delete_all_regular_users.sql
-- 2. 远程数据库：mysql -h <host> -u <user> -p <database> < delete_all_regular_users.sql
-- 
-- 注意：
-- - 此脚本会删除users表中的所有用户（普通注册用户）
-- - system_admin表中的管理员不会被删除
-- - 由于外键约束设置了ON DELETE CASCADE，删除用户时会自动删除关联数据
-- - 但为了安全起见，我们仍然显式删除一些没有外键约束的表中的数据
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- ============================================================
-- 第一步：显示将要删除的用户数量（用于确认）
-- ============================================================
SELECT 
    COUNT(*) as total_users_to_delete,
    'users表中的所有普通注册用户' as description
FROM users;

-- ============================================================
-- 第二步：删除没有外键约束的表中的数据
-- ============================================================

-- 删除情绪记录（没有外键约束）
DELETE FROM emotion_records WHERE user_id IN (SELECT id FROM users);

-- ============================================================
-- 第三步：由于大部分表都有ON DELETE CASCADE外键约束，
-- 直接删除users表中的记录会自动删除关联数据
-- 但为了确保完整性，我们按依赖顺序显式删除
-- ============================================================

-- 删除用户相关的所有子表数据（按依赖顺序）

-- 1. 删除用户Token配额相关
DELETE FROM token_quota_transaction WHERE user_id IN (SELECT id FROM users);
DELETE FROM ai_usage_records WHERE user_id IN (SELECT id FROM users);
DELETE FROM user_token_quota WHERE user_id IN (SELECT id FROM users);

-- 2. 删除会员相关
DELETE FROM point_transactions WHERE user_id IN (SELECT id FROM users);
DELETE FROM payment_orders WHERE user_id IN (SELECT id FROM users);
DELETE FROM memberships WHERE user_id IN (SELECT id FROM users);

-- 3. 删除心域共享相关
DELETE FROM heartsphere_connection WHERE visitor_id IN (SELECT id FROM users);
DELETE FROM heartsphere_connection_request WHERE requester_id IN (SELECT id FROM users);
DELETE FROM warm_message WHERE visitor_id IN (SELECT id FROM users);
DELETE FROM experience_summary WHERE visitor_id IN (SELECT id FROM users);
DELETE FROM heartsphere_share_config WHERE user_id IN (SELECT id FROM users);

-- 4. 删除体验模式相关（如果有表的话，需要检查）
-- DELETE FROM experience_mode_visitor_actions WHERE visitor_id IN (SELECT id FROM users);
-- DELETE FROM experience_mode_visits WHERE visitor_id IN (SELECT id FROM users);

-- 5. 删除心域连接相关
DELETE FROM access_history WHERE user_id IN (SELECT id FROM users);
DELETE FROM user_favorites WHERE user_id IN (SELECT id FROM users);

-- 6. 删除信箱相关
-- 注意：mailbox_conversation_messages通过conversation_id关联mailbox_conversations
-- 需要先删除mailbox_conversation_messages，再删除mailbox_conversations
DELETE FROM mailbox_conversation_messages WHERE conversation_id IN (
    SELECT id FROM mailbox_conversations 
    WHERE participant1_id IN (SELECT id FROM users) OR participant2_id IN (SELECT id FROM users)
);
DELETE FROM mailbox_messages WHERE receiver_id IN (SELECT id FROM users);
DELETE FROM mailbox_conversations WHERE participant1_id IN (SELECT id FROM users) OR participant2_id IN (SELECT id FROM users);
DELETE FROM mailbox_notification_settings WHERE user_id IN (SELECT id FROM users);

-- 7. 删除对话日志
DELETE FROM conversation_logs WHERE user_id IN (SELECT id FROM users);

-- 8. 删除跨时空信箱
DELETE FROM chronos_letters WHERE user_id IN (SELECT id FROM users);
DELETE FROM mails WHERE user_id IN (SELECT id FROM users);

-- 9. 删除用户场景相关
-- 注意：user_scenario_events和user_scenario_items通过script_id关联scripts表
-- 需要先删除这些，再删除scripts
DELETE FROM user_scenario_events WHERE script_id IN (SELECT id FROM scripts WHERE user_id IN (SELECT id FROM users));
DELETE FROM user_scenario_items WHERE script_id IN (SELECT id FROM scripts WHERE user_id IN (SELECT id FROM users));
-- 删除用户创建的剧本
DELETE FROM scripts WHERE user_id IN (SELECT id FROM users);

-- 10. 删除用户创建的剧本事件和物品（scenario_events和scenario_items表）
DELETE FROM scenario_events WHERE user_id IN (SELECT id FROM users);
DELETE FROM scenario_items WHERE user_id IN (SELECT id FROM users);

-- 11. 删除用户主线剧情
DELETE FROM user_main_stories WHERE user_id IN (SELECT id FROM users);

-- 12. 删除用户AI配置
DELETE FROM user_ai_config WHERE user_id IN (SELECT id FROM users);

-- 13. 删除用户创建的世界、时代、角色（这些表有外键约束，但为了确保，我们显式删除）
-- 注意：characters表通过world_id关联worlds，worlds表通过user_id关联users
-- 所以需要先删除characters，再删除eras，最后删除worlds
DELETE FROM characters WHERE world_id IN (SELECT id FROM worlds WHERE user_id IN (SELECT id FROM users));
DELETE FROM eras WHERE world_id IN (SELECT id FROM worlds WHERE user_id IN (SELECT id FROM users));
DELETE FROM worlds WHERE user_id IN (SELECT id FROM users);

-- ============================================================
-- 第四步：最后删除users表中的所有用户
-- ============================================================
DELETE FROM users;

-- ============================================================
-- 第五步：显示删除结果
-- ============================================================
SELECT 
    '删除完成' as status,
    'users表中的所有普通注册用户及其关联数据已删除' as message,
    'system_admin表中的管理员数据未受影响' as note;

-- 恢复设置
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- ============================================================
-- 脚本执行完成
-- ============================================================
