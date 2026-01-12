-- 教育版数字人角色表
-- 创建时间: 2026-01-10
-- 版本: V20260110
-- 说明: 创建教育版数字人角色表

CREATE TABLE IF NOT EXISTS edu_characters (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  name VARCHAR(100) NOT NULL COMMENT '角色名称',
  avatar_url VARCHAR(500) COMMENT '头像URL',
  background_url VARCHAR(500) COMMENT '背景图片URL',
  description TEXT COMMENT '角色描述',
  bio TEXT COMMENT '角色简介（教育背景、特长等）',
  
  -- 教育相关属性
  character_type ENUM('teaching_assistant', 'learning_companion', 'counseling', 'homework_helper', 'subject_explainer') NOT NULL COMMENT '角色类型：教学助手、学习伙伴、心理辅导、作业辅导、学科讲解',
  age_group_suitability JSON COMMENT '适用年龄段：["primary_6_12", "secondary_13_18"] 或单个值',
  subject_tags JSON COMMENT '学科标签：["math", "chinese", "english", "science", "physics", "chemistry", "biology", "history", "geography"]',
  teaching_specialty TEXT COMMENT '教学特长描述',
  difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate' COMMENT '难度等级',
  language_style ENUM('formal', 'casual', 'friendly') DEFAULT 'friendly' COMMENT '语言风格',
  personality_traits JSON COMMENT '性格特质：["patient", "encouraging", "friendly", "strict", "humorous"]',
  
  -- 系统指令和配置（参考主系统 Character）
  first_message TEXT COMMENT '首次对话消息',
  system_instruction TEXT COMMENT '系统指令（用于 AI 对话）',
  voice_name VARCHAR(50) COMMENT '语音名称',
  theme_color VARCHAR(50) COMMENT '主题颜色',
  color_accent VARCHAR(50) COMMENT '强调色',
  
  -- 关联关系
  student_id BIGINT COMMENT '创建者学生ID（如果是学生创建的）',
  teacher_id BIGINT COMMENT '创建者教师ID（如果是教师创建的）',
  
  -- 使用统计（非规范化字段，用于快速查询）
  total_interactions INT DEFAULT 0 COMMENT '总互动次数',
  unique_students INT DEFAULT 0 COMMENT '互动过的学生数量',
  average_rating DECIMAL(3, 2) DEFAULT 0.0 COMMENT '平均评分（1-5星）',
  
  -- 元数据
  is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否已删除',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at DATETIME COMMENT '删除时间',
  
  -- 索引
  INDEX idx_character_type (character_type),
  INDEX idx_student_id (student_id),
  INDEX idx_teacher_id (teacher_id),
  INDEX idx_is_enabled (is_enabled),
  INDEX idx_is_deleted (is_deleted),
  INDEX idx_created_at (created_at),
  FULLTEXT INDEX idx_name_description (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教育版数字人角色表';
