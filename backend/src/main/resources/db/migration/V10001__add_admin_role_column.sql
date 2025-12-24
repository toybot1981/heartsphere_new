-- 添加管理员角色字段
-- 如果字段已存在，此语句会失败，但Flyway会跳过已执行的迁移
ALTER TABLE system_admin 
ADD COLUMN role VARCHAR(20) DEFAULT 'ADMIN' 
AFTER email;

-- 如果role字段已存在但为NULL，设置默认值
UPDATE system_admin 
SET role = 'ADMIN' 
WHERE role IS NULL;

-- 将默认admin账号设置为超级管理员
UPDATE system_admin 
SET role = 'SUPER_ADMIN' 
WHERE username = 'admin';

-- 确保role字段不能为NULL（在设置完默认值后）
ALTER TABLE system_admin 
MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'ADMIN';

