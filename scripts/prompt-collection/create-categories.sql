-- 创建提示词分类体系
-- 执行前请确保已连接到正确的数据库

-- 一级分类（项目模块）
INSERT INTO prompt_categories (code, name, description, parent_id, sort_order, is_active, created_at, updated_at)
VALUES
  ('main', '主项目', '主项目相关提示词', NULL, 1, true, NOW(), NOW()),
  ('mentis', 'Mentis项目', 'Mentis项目相关提示词', NULL, 2, true, NOW(), NOW()),
  ('admin', '管理后台', '管理后台相关提示词', NULL, 3, true, NOW(), NOW()),
  ('shared', '共享', '共享提示词', NULL, 4, true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 获取一级分类ID（假设已存在）
SET @main_id = (SELECT id FROM prompt_categories WHERE code = 'main');
SET @mentis_id = (SELECT id FROM prompt_categories WHERE code = 'mentis');
SET @admin_id = (SELECT id FROM prompt_categories WHERE code = 'admin');
SET @shared_id = (SELECT id FROM prompt_categories WHERE code = 'shared');

-- 二级分类（功能模块）- Main项目
INSERT INTO prompt_categories (code, name, description, parent_id, sort_order, is_active, created_at, updated_at)
VALUES
  ('main-emotion-analysis', '情感分析', '主项目的情感分析相关提示词', @main_id, 1, true, NOW(), NOW()),
  ('main-letter-generation', '信件生成', '主项目的信件生成相关提示词', @main_id, 2, true, NOW(), NOW()),
  ('main-ai-service', 'AI服务', '主项目的AI服务相关提示词', @main_id, 3, true, NOW(), NOW()),
  ('main-skill-execution', '技能执行', '主项目的技能执行相关提示词', @main_id, 4, true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 二级分类（功能模块）- Mentis项目
INSERT INTO prompt_categories (code, name, description, parent_id, sort_order, is_active, created_at, updated_at)
VALUES
  ('mentis-intent-recognition', '意图识别', 'Mentis项目的意图识别相关提示词', @mentis_id, 1, true, NOW(), NOW()),
  ('mentis-task-decomposition', '任务分解', 'Mentis项目的任务分解相关提示词', @mentis_id, 2, true, NOW(), NOW()),
  ('mentis-response-generation', '响应生成', 'Mentis项目的响应生成相关提示词', @mentis_id, 3, true, NOW(), NOW()),
  ('mentis-multi-agent', '多智能体', 'Mentis项目的多智能体协作相关提示词', @mentis_id, 4, true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
