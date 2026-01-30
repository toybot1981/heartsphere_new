-- ============================================================
-- 技能执行记录表
-- 用于追踪技能的评估、应用、执行全生命周期
-- ============================================================

CREATE TABLE IF NOT EXISTS skill_execution_records (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT,
    skill_id BIGINT,
    user_id BIGINT,
    role_id BIGINT,
    
    -- 评估阶段信息
    evaluation_context JSON COMMENT '评估上下文快照',
    evaluation_timestamp TIMESTAMP COMMENT '评估时间',
    keyword_matches JSON COMMENT '匹配的关键词列表',
    semantic_score INT COMMENT '语义相似度得分 (0-100)',
    context_score INT COMMENT '上下文得分 (0-100)',
    memory_score INT COMMENT '内存触发得分 (0-100)',
    composite_score INT COMMENT '综合得分 (0-100)',
    decision VARCHAR(50) COMMENT '决策结果: APPLIED/REJECTED',
    rejection_reason VARCHAR(255) COMMENT '拒绝原因',
    
    -- 应用阶段信息
    execution_parameters JSON COMMENT '技能执行参数',
    execution_status VARCHAR(50) COMMENT '执行状态: PENDING/EXECUTING/COMPLETED/FAILED',
    execution_timestamp TIMESTAMP COMMENT '执行开始时间',
    execution_duration_ms INT COMMENT '执行耗时(毫秒)',
    
    -- 结果阶段信息
    execution_result JSON COMMENT '执行结果详情',
    error_message TEXT COMMENT '错误信息',
    resource_usage JSON COMMENT '资源使用情况',
    
    -- 关联信息
    related_memory_ids JSON COMMENT '相关内存ID列表',
    related_conversation_turn_id BIGINT COMMENT '相关对话轮次ID',
    
    -- 时间戳
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    -- 索引
    KEY idx_conversation_created (conversation_id, created_at),
    KEY idx_skill_created (skill_id, created_at),
    KEY idx_user_created (user_id, created_at),
    KEY idx_decision (decision),
    KEY idx_execution_status (execution_status),
    KEY idx_composite_score (composite_score)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='技能执行记录表 - 追踪技能的完整生命周期';

-- ============================================================
-- 技能统计视图（便于快速查询）
-- ============================================================

CREATE OR REPLACE VIEW v_skill_execution_summary AS
SELECT 
    skill_id,
    COUNT(*) as total_count,
    SUM(CASE WHEN decision = 'APPLIED' THEN 1 ELSE 0 END) as applied_count,
    SUM(CASE WHEN execution_status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
    SUM(CASE WHEN execution_status = 'FAILED' THEN 1 ELSE 0 END) as failed_count,
    AVG(composite_score) as avg_score,
    AVG(execution_duration_ms) as avg_duration_ms,
    DATE(created_at) as stat_date
FROM skill_execution_records
GROUP BY skill_id, DATE(created_at);

-- ============================================================
-- 创建表注释
-- ============================================================

ALTER TABLE skill_execution_records 
COMMENT='技能执行记录表 - 记录技能的评估、决策、执行、结果全过程';
