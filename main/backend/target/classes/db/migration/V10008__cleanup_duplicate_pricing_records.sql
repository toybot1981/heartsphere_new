-- 清理重复的定价配置记录
-- 执行日期: 2025-12-26
-- 
-- 对于同一个 model_id 和 pricing_type，如果存在多条激活状态的记录，
-- 保留最新的一条（按 effective_date DESC, id DESC），停用其他记录

-- ============================================================================
-- 第一步：识别重复记录并显示
-- ============================================================================

SELECT 
    'Duplicate pricing records summary' as report_type,
    model_id,
    pricing_type,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(id ORDER BY effective_date DESC, id DESC) as all_ids,
    SUBSTRING_INDEX(GROUP_CONCAT(id ORDER BY effective_date DESC, id DESC), ',', 1) as keep_id
FROM ai_model_pricing
WHERE is_active = 1 
  AND effective_date <= NOW()
  AND (expiry_date IS NULL OR expiry_date > NOW())
GROUP BY model_id, pricing_type
HAVING COUNT(*) > 1;

-- ============================================================================
-- 第二步：停用重复的记录（保留最新的一条）
-- ============================================================================

-- 更新重复记录：设置 is_active = 0
-- 使用子查询找出需要保留的记录ID（每个 model_id + pricing_type 组合中，按 effective_date DESC, id DESC 排序后的第一条）
UPDATE ai_model_pricing amp
INNER JOIN (
    SELECT 
        model_id,
        pricing_type,
        CAST(SUBSTRING_INDEX(GROUP_CONCAT(id ORDER BY effective_date DESC, id DESC), ',', 1) AS UNSIGNED) as keep_id
    FROM ai_model_pricing
    WHERE is_active = 1 
      AND effective_date <= NOW()
      AND (expiry_date IS NULL OR expiry_date > NOW())
    GROUP BY model_id, pricing_type
    HAVING COUNT(*) > 1
) duplicates ON amp.model_id = duplicates.model_id 
    AND amp.pricing_type = duplicates.pricing_type
SET amp.is_active = 0
WHERE amp.id != duplicates.keep_id
  AND amp.is_active = 1
  AND amp.effective_date <= NOW()
  AND (amp.expiry_date IS NULL OR amp.expiry_date > NOW());

-- ============================================================================
-- 第四步：验证清理结果
-- ============================================================================

-- 检查是否还有重复的激活记录
SELECT 
    'Remaining duplicates after cleanup' as report_type,
    model_id,
    pricing_type,
    COUNT(*) as remaining_count
FROM ai_model_pricing
WHERE is_active = 1 
  AND effective_date <= NOW()
  AND (expiry_date IS NULL OR expiry_date > NOW())
GROUP BY model_id, pricing_type
HAVING COUNT(*) > 1;

-- 显示停用的记录
SELECT 
    'Deactivated records' as report_type,
    COUNT(*) as deactivated_count
FROM ai_model_pricing
WHERE is_active = 0
  AND id IN (
    SELECT id FROM ai_model_pricing
    WHERE is_active = 0
      AND effective_date <= NOW()
      AND (expiry_date IS NULL OR expiry_date > NOW())
  );

-- ============================================================================
-- 第五步：显示每个 model_id + pricing_type 保留的记录
-- ============================================================================

SELECT 
    'Kept records' as report_type,
    amp.id,
    amp.model_id,
    amc.model_name,
    amp.pricing_type,
    amp.unit_price,
    amp.effective_date,
    amp.is_active
FROM ai_model_pricing amp
INNER JOIN ai_model_config amc ON amp.model_id = amc.id
WHERE amp.is_active = 1
  AND amp.effective_date <= NOW()
  AND (amp.expiry_date IS NULL OR amp.expiry_date > NOW())
  AND (amp.model_id, amp.pricing_type) IN (
    SELECT model_id, pricing_type
    FROM (
        SELECT 
            model_id,
            pricing_type,
            COUNT(*) as cnt
        FROM ai_model_pricing
        WHERE is_active = 1 
          AND effective_date <= NOW()
          AND (expiry_date IS NULL OR expiry_date > NOW())
        GROUP BY model_id, pricing_type
        HAVING COUNT(*) = 1
    ) single
  )
ORDER BY amp.model_id, amp.pricing_type;

