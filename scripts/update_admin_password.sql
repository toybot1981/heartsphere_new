-- 更新远程数据库管理员密码
-- 使用方法: 
-- 1. 先使用在线工具生成 BCrypt 密码: https://www.bcrypt-generator.com/
--    输入密码: Tyx@19811009
-- 2. 将生成的 BCrypt hash 替换下面的 <BCRYPT_HASH>
-- 3. 执行: mysql -h rm-bp1bg7xxnka508amyvo.mysql.rds.aliyuncs.com -u heartsphere -p heartsphere < update_admin_password.sql

USE heartsphere;

-- 检查管理员是否存在
SELECT COUNT(*) as admin_count FROM system_admin WHERE username = 'admin';

-- 如果不存在，创建管理员
INSERT INTO system_admin (username, password, email, role, is_active, created_at, updated_at)
SELECT 'admin', '<BCRYPT_HASH>', 'admin@heartsphere.com', 'SUPER_ADMIN', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM system_admin WHERE username = 'admin');

-- 如果存在，更新密码
UPDATE system_admin 
SET password = '<BCRYPT_HASH>', updated_at = NOW()
WHERE username = 'admin';

-- 验证更新
SELECT id, username, email, role, is_active, updated_at 
FROM system_admin 
WHERE username = 'admin';
