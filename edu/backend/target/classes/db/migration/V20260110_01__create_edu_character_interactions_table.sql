-- 教育版数字人互动记录表
-- 创建时间: 2026-01-10
-- 版本: V20260110_01
-- 说明: 创建教育版数字人互动记录表

CREATE TABLE IF NOT EXISTS edu_character_interactions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  student_id BIGINT NOT NULL COMMENT '学生ID',
  character_id BIGINT NOT NULL COMMENT '数字人角色ID',
  
  -- 互动信息
  interaction_type ENUM('teaching_dialogue', 'homework_help', 'counseling', 'knowledge_explanation', 'practice_exercise') NOT NULL COMMENT '互动类型：教学对话、作业辅导、心理疏导、知识讲解、练习训练',
  conversation_content TEXT COMMENT '对话内容（JSON格式，包含消息列表）',
  learning_topics JSON COMMENT '学习知识点：["topic1", "topic2"]',
  comprehension_level ENUM('not_understood', 'partially_understood', 'well_understood', 'mastered') COMMENT '理解程度',
  
  -- 评价和反馈
  student_rating INT COMMENT '学生评分（1-5星）',
  student_feedback TEXT COMMENT '学生反馈',
  
  -- 时间统计
  start_time DATETIME NOT NULL COMMENT '互动开始时间',
  end_time DATETIME COMMENT '互动结束时间',
  duration_minutes INT COMMENT '互动时长（分钟）',
  
  -- 元数据
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  -- 索引
  INDEX idx_student_id (student_id),
  INDEX idx_character_id (character_id),
  INDEX idx_interaction_type (interaction_type),
  INDEX idx_start_time (start_time),
  INDEX idx_student_character (student_id, character_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教育版数字人互动记录表';
