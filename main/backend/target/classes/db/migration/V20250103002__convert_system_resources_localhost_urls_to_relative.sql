-- 将 system_resources 表中的 localhost 图片URL转换为相对路径
-- 执行时间：2025-01-03
-- 说明：将包含 localhost:8081/api/images/files/ 的URL转换为相对路径

-- 更新 system_resources 表
UPDATE system_resources
SET url = REPLACE(
    REPLACE(
        REPLACE(url, 'http://localhost:8081/api/images/files/', ''),
        'https://localhost:8081/api/images/files/', ''
    ),
    'http://localhost:8080/api/images/files/', ''
)
WHERE url LIKE '%localhost%api/images/files/%';

-- 注意：此脚本只处理 localhost URL，外部URL（如 picsum.photos）保持不变
