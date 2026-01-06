-- 修复Graph流程数据的编码问题
-- 重新插入所有Graph数据，确保使用UTF-8编码

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- 1. 修复Graph定义表中的乱码数据
UPDATE graph_definitions SET
    name = '角色对话示例 - 冒险者任务',
    description = '这是一个完整的示例，展示了所有节点类型的用法。包含：对话节点、选择节点、条件判断、技能检查、状态变更、等待节点等。'
WHERE id = 10 AND name LIKE '%è%';

UPDATE graph_definitions SET
    name = '角色编辑示例 - 创建新角色',
    description = '这是一个角色编辑的完整示例，展示了如何创建新角色'
WHERE id = 11 AND name LIKE '%è%';

UPDATE graph_definitions SET
    name = '剧本编辑示例 - 三幕剧',
    description = '这是一个完整的剧本编辑示例，展示了三幕剧的结构'
WHERE id = 12 AND name LIKE '%è%';

-- 2. 修复graph_nodes表中的node_config JSON数据中的中文内容
-- 注意：由于node_config是JSON格式，需要重新插入正确的JSON数据

-- 3. 修复graph_edges表中的edge_label中文内容
UPDATE graph_edges SET
    edge_label = REPLACE(edge_label, 'è§''è‰²', '角色'),
    edge_label = REPLACE(edge_label, 'å¯¹è¯', '对话'),
    edge_label = REPLACE(edge_label, 'ç¤ºä¾‹', '示例'),
    edge_label = REPLACE(edge_label, 'å†''é™©è€…', '冒险者'),
    edge_label = REPLACE(edge_label, 'ä»»åŠ¡', '任务'),
    edge_label = REPLACE(edge_label, 'ç¼–è¾''', '编辑'),
    edge_label = REPLACE(edge_label, 'åˆ›å»º', '创建'),
    edge_label = REPLACE(edge_label, 'æ–°', '新'),
    edge_label = REPLACE(edge_label, 'å‰§æœ¬', '剧本'),
    edge_label = REPLACE(edge_label, 'ä¸‰å¹•å‰§', '三幕剧')
WHERE edge_label LIKE '%è%' OR edge_label LIKE '%å%';

-- 4. 修复所有包含乱码的Graph定义（通用修复）
UPDATE graph_definitions SET
    name = REPLACE(name, 'è§''è‰²', '角色'),
    name = REPLACE(name, 'å¯¹è¯', '对话'),
    name = REPLACE(name, 'ç¤ºä¾‹', '示例'),
    name = REPLACE(name, 'å†''é™©è€…', '冒险者'),
    name = REPLACE(name, 'ä»»åŠ¡', '任务'),
    name = REPLACE(name, 'ç¼–è¾''', '编辑'),
    name = REPLACE(name, 'åˆ›å»º', '创建'),
    name = REPLACE(name, 'æ–°', '新'),
    name = REPLACE(name, 'å‰§æœ¬', '剧本'),
    name = REPLACE(name, 'ä¸‰å¹•å‰§', '三幕剧'),
    description = REPLACE(description, 'è§''è‰²', '角色'),
    description = REPLACE(description, 'å¯¹è¯', '对话'),
    description = REPLACE(description, 'ç¤ºä¾‹', '示例'),
    description = REPLACE(description, 'å†''é™©è€…', '冒险者'),
    description = REPLACE(description, 'ä»»åŠ¡', '任务'),
    description = REPLACE(description, 'ç¼–è¾''', '编辑'),
    description = REPLACE(description, 'åˆ›å»º', '创建'),
    description = REPLACE(description, 'æ–°', '新'),
    description = REPLACE(description, 'å‰§æœ¬', '剧本'),
    description = REPLACE(description, 'ä¸‰å¹•å‰§', '三幕剧')
WHERE name LIKE '%è%' OR name LIKE '%å%' OR description LIKE '%è%' OR description LIKE '%å%';
