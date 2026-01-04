-- 迁移用户场景相关表的图片URL到新路径结构
-- 执行时间：2025-01-03
-- 说明：
-- 1. 将包含 localhost:8081/api/images/files/ 或 /api/images/files/ 的URL转换为相对路径
-- 2. 用户资源的路径格式：userId/category/year/month/filename
-- 3. 外部URL（如 picsum.photos, placeholder://）保持不变
-- 注意：user_scenario_items 和 user_scenario_events 表可能有 scenario_id，需要关联查找 user_id

-- ============================================
-- 注意：user_scenario_items 和 user_scenario_events 表
-- 目前这些表中没有需要迁移的数据，或者这些表的结构中
-- 没有直接关联user_id的字段。
-- 如果将来需要迁移这些表，需要先确认如何获取user_id。
-- ============================================

-- user_scenario_items 表 - icon_url
-- 先移除URL前缀（如果有）
UPDATE user_scenario_items
SET icon_url = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(icon_url, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE icon_url IS NOT NULL
  AND (icon_url LIKE '%localhost%api/images/files/%' 
   OR icon_url LIKE '%/api/images/files/%'
   OR icon_url LIKE '%/images/files/%')
  AND icon_url NOT LIKE 'http://picsum%'
  AND icon_url NOT LIKE 'https://picsum%'
  AND icon_url NOT LIKE 'placeholder://%';

-- user_scenario_events 表 - icon_url
-- 先移除URL前缀（如果有）
UPDATE user_scenario_events
SET icon_url = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(icon_url, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE icon_url IS NOT NULL
  AND (icon_url LIKE '%localhost%api/images/files/%' 
   OR icon_url LIKE '%/api/images/files/%'
   OR icon_url LIKE '%/images/files/%')
  AND icon_url NOT LIKE 'http://picsum%'
  AND icon_url NOT LIKE 'https://picsum%'
  AND icon_url NOT LIKE 'placeholder://%';

-- 注意：如果需要为这些表的路径添加userId前缀，
-- 需要先确认如何通过scenario_id或其他字段关联到user_id

-- ============================================
-- 注意：
-- 1. 此脚本处理用户场景相关表的图片URL
-- 2. 这些表通过 scenario_id 关联 user_scenarios 表来获取 user_id
-- 3. 用户资源的路径格式应该是：userId/category/year/month/filename
-- 4. 外部URL（如 https://picsum.photos/..., placeholder://...）保持不变
