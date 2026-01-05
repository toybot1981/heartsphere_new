-- 超时空信箱数据库验证查询脚本
-- 使用方式: mysql -u root -p123456 heartsphere < scripts/verify-chronos-letters.sql

USE heartsphere;

-- 1. 查看用户 tongyexin 的所有信件
SELECT 
    cl.id,
    cl.subject,
    cl.type,
    cl.is_read,
    cl.sender_name,
    cl.sender_id,
    FROM_UNIXTIME(cl.timestamp/1000) as send_time,
    u.username,
    u.nickname,
    LEFT(cl.content, 100) as content_preview,
    cl.parent_letter_id,
    cl.created_at,
    cl.updated_at
FROM chronos_letters cl
JOIN users u ON cl.user_id = u.id
WHERE u.username = 'tongyexin'
ORDER BY cl.timestamp DESC;

-- 2. 统计用户 tongyexin 的信件
SELECT 
    u.username,
    COUNT(*) as total_letters,
    SUM(CASE WHEN cl.type = 'user_feedback' THEN 1 ELSE 0 END) as user_feedbacks,
    SUM(CASE WHEN cl.type = 'admin_reply' THEN 1 ELSE 0 END) as admin_replies,
    SUM(CASE WHEN cl.is_read = 0 THEN 1 ELSE 0 END) as unread_count,
    SUM(CASE WHEN cl.is_read = 1 THEN 1 ELSE 0 END) as read_count
FROM chronos_letters cl
JOIN users u ON cl.user_id = u.id
WHERE u.username = 'tongyexin'
GROUP BY u.id, u.username;

-- 3. 查看所有用户反馈（管理员视角）
SELECT 
    cl.id,
    cl.subject,
    cl.type,
    cl.is_read,
    u.username,
    u.nickname,
    u.email,
    FROM_UNIXTIME(cl.timestamp/1000) as send_time,
    LEFT(cl.content, 150) as content_preview
FROM chronos_letters cl
JOIN users u ON cl.user_id = u.id
WHERE cl.type = 'user_feedback'
ORDER BY cl.timestamp DESC
LIMIT 20;

-- 4. 查看信件和回复的关联关系
SELECT 
    parent.id as parent_id,
    parent.subject as parent_subject,
    parent.sender_name as parent_sender,
    FROM_UNIXTIME(parent.timestamp/1000) as parent_time,
    reply.id as reply_id,
    reply.subject as reply_subject,
    reply.sender_name as reply_sender,
    FROM_UNIXTIME(reply.timestamp/1000) as reply_time
FROM chronos_letters parent
LEFT JOIN chronos_letters reply ON reply.parent_letter_id = parent.id
WHERE parent.type = 'user_feedback'
ORDER BY parent.timestamp DESC, reply.timestamp ASC
LIMIT 20;

-- 5. 查看最近的用户反馈（最近24小时）
SELECT 
    cl.id,
    cl.subject,
    u.username,
    u.nickname,
    FROM_UNIXTIME(cl.timestamp/1000) as send_time,
    cl.is_read,
    LEFT(cl.content, 100) as content_preview
FROM chronos_letters cl
JOIN users u ON cl.user_id = u.id
WHERE cl.type = 'user_feedback'
  AND cl.timestamp >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 24 HOUR)) * 1000
ORDER BY cl.timestamp DESC;
