-- 更新 Notion 回调地址配置
-- 回调地址: https://athetoid-sacrosciatic-karson.ngrok-free.dev/api/notes/notion/callback

UPDATE system_config 
SET config_value = 'https://athetoid-sacrosciatic-karson.ngrok-free.dev/api/notes/notion/callback',
    updated_at = NOW()
WHERE config_key = 'notion_redirect_uri';

-- 如果不存在则插入
INSERT INTO system_config (config_key, config_value, description, created_at, updated_at)
VALUES ('notion_redirect_uri', 'https://athetoid-sacrosciatic-karson.ngrok-free.dev/api/notes/notion/callback', 'Notion OAuth 回调地址', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    config_value = 'https://athetoid-sacrosciatic-karson.ngrok-free.dev/api/notes/notion/callback',
    updated_at = NOW();

-- 查看更新结果
SELECT config_key, config_value, description, updated_at 
FROM system_config 
WHERE config_key = 'notion_redirect_uri';
