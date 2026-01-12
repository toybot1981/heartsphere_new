-- 将模型配置中的 qwen 提供商统一改为 dashscope
-- 执行日期: 2025-12-25

-- 将 ai_model_config 表中所有 provider = 'qwen' 的记录改为 'dashscope'
-- 注意：模型配置中的provider字段存储为大写形式
UPDATE ai_model_config 
SET provider = 'DASHSCOPE' 
WHERE provider = 'qwen' OR provider = 'QWEN';

-- 将路由策略配置中的 qwen 改为 dashscope（如果存在JSON配置）
-- 注意：表名可能是 ai_routing_strategy，需要根据实际表结构调整
UPDATE ai_routing_strategy 
SET config_json = REPLACE(config_json, '"qwen"', '"dashscope"')
WHERE config_json LIKE '%"qwen"%';

UPDATE ai_routing_strategy 
SET config_json = REPLACE(config_json, '"QWEN"', '"dashscope"')
WHERE config_json LIKE '%"QWEN"%';

