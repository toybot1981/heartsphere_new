-- 超时空信箱详细验证查询
-- 使用方式: mysql -u root -p123456 heartsphere < scripts/verify-chronos-letters-detail.sql

USE heartsphere;

-- 设置字符集
SET NAMES utf8mb4;

-- 1. 查看用户 tongyexin 的详细信息
SELECT 
    '=== 用户信息 ===' as info;
SELECT 
    id,
    username,
    nickname,
    email,
    created_at
FROM users 
WHERE username = 'tongyexin';

-- 2. 查看用户的所有信件（详细信息）
SELECT 
    '=== 用户所有信件 ===' as info;
SELECT 
    cl.id,
    cl.subject,
    cl.type,
    CASE WHEN cl.is_read = 0 THEN '未读' ELSE '已读' END as status,
    cl.sender_name,
    cl.sender_id,
    FROM_UNIXTIME(cl.timestamp/1000) as send_time,
    cl.theme_color,
    cl.parent_letter_id,
    LENGTH(cl.content) as content_length,
    LEFT(cl.content, 200) as content_preview,
    cl.created_at,
    cl.updated_at
FROM chronos_letters cl
WHERE cl.user_id = (SELECT id FROM users WHERE username = 'tongyexin')
ORDER BY cl.timestamp DESC;

-- 3. 统计信息
SELECT 
    '=== 统计信息 ===' as info;
SELECT 
    COUNT(*) as total_letters,
    SUM(CASE WHEN type = 'user_feedback' THEN 1 ELSE 0 END) as user_feedbacks,
    SUM(CASE WHEN type = 'admin_reply' THEN 1 ELSE 0 END) as admin_replies,
    SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count,
    SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count,
    MIN(FROM_UNIXTIME(timestamp/1000)) as earliest_letter,
    MAX(FROM_UNIXTIME(timestamp/1000)) as latest_letter
FROM chronos_letters
WHERE user_id = (SELECT id FROM users WHERE username = 'tongyexin');

-- 4. 查看信件和回复的关联（如果有回复）
SELECT 
    '=== 信件和回复关联 ===' as info;
SELECT 
    parent.id as parent_id,
    parent.subject as parent_subject,
    parent.sender_name as parent_sender,
    FROM_UNIXTIME(parent.timestamp/1000) as parent_time,
    parent.is_read as parent_read,
    reply.id as reply_id,
    reply.subject as reply_subject,
    reply.sender_name as reply_sender,
    FROM_UNIXTIME(reply.timestamp/1000) as reply_time,
    reply.is_read as reply_read
FROM chronos_letters parent
LEFT JOIN chronos_letters reply ON reply.parent_letter_id = parent.id
WHERE parent.user_id = (SELECT id FROM users WHERE username = 'tongyexin')
  AND parent.type = 'user_feedback'
ORDER BY parent.timestamp DESC, reply.timestamp ASC;

-- 5. 查看所有用户反馈（管理员视角）
SELECT 
    '=== 所有用户反馈（管理员视角） ===' as info;
SELECT 
    cl.id,
    cl.subject,
    u.username,
    u.nickname,
    u.email,
    CASE WHEN cl.is_read = 0 THEN '未读' ELSE '已读' END as status,
    FROM_UNIXTIME(cl.timestamp/1000) as send_time,
    LEFT(cl.content, 150) as content_preview
FROM chronos_letters cl
JOIN users u ON cl.user_id = u.id
WHERE cl.type = 'user_feedback'
ORDER BY cl.timestamp DESC
LIMIT 10;

-- 6. 查看最近的用户反馈（最近1小时）
SELECT 
    '=== 最近1小时的用户反馈 ===' as info;
SELECT 
    cl.id,
    cl.subject,
    u.username,
    FROM_UNIXTIME(cl.timestamp/1000) as send_time,
    cl.is_read
FROM chronos_letters cl
JOIN users u ON cl.user_id = u.id
WHERE cl.type = 'user_feedback'
  AND cl.timestamp >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 HOUR)) * 1000
ORDER BY cl.timestamp DESC;
