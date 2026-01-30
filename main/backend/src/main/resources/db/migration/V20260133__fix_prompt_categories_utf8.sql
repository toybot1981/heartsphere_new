-- 修复 prompt_categories 中早期迁移写入的乱码（统一为 UTF-8）
-- 原因：V20250106 插入的 character/emotion/memory/intent/response/other 可能曾以错误编码入库
SET NAMES utf8mb4;

UPDATE prompt_categories SET name = '角色生成', description = '角色创建相关的提示词模板', updated_at = NOW() WHERE code = 'character';
UPDATE prompt_categories SET name = '情绪分析', description = '情绪分析相关的提示词模板', updated_at = NOW() WHERE code = 'emotion';
UPDATE prompt_categories SET name = '记忆提取', description = '记忆提取相关的提示词模板', updated_at = NOW() WHERE code = 'memory';
UPDATE prompt_categories SET name = '意图识别', description = '意图识别相关的提示词模板', updated_at = NOW() WHERE code = 'intent';
UPDATE prompt_categories SET name = '响应生成', description = '响应生成相关的提示词模板', updated_at = NOW() WHERE code = 'response';
UPDATE prompt_categories SET name = '其他', description = '其他业务场景的提示词模板', updated_at = NOW() WHERE code = 'other';
