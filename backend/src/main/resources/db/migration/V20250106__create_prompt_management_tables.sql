-- 提示词管理系统数据库表

-- 业务分类表
CREATE TABLE IF NOT EXISTS prompt_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(100) UNIQUE NOT NULL COMMENT '分类代码',
    name VARCHAR(200) NOT NULL COMMENT '分类名称',
    description TEXT COMMENT '分类描述',
    parent_id BIGINT COMMENT '父分类ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent (parent_id),
    INDEX idx_active (is_active)
) COMMENT '业务分类表';

-- 提示词模板表
CREATE TABLE IF NOT EXISTS prompt_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL COMMENT '模板名称',
    category_code VARCHAR(100) NOT NULL COMMENT '业务分类代码',
    description TEXT COMMENT '模板描述',
    system_prompt TEXT COMMENT '系统提示词模板',
    user_prompt TEXT COMMENT '用户提示词模板',
    variables JSON COMMENT '变量定义（JSON格式）',
    example_data JSON COMMENT '示例数据（用于预览）',
    version INT DEFAULT 1 COMMENT '版本号',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category_code),
    INDEX idx_name (name),
    INDEX idx_active (is_active),
    FOREIGN KEY (category_code) REFERENCES prompt_categories(code) ON DELETE RESTRICT
) COMMENT '提示词模板表';

-- 模板变量表
CREATE TABLE IF NOT EXISTS prompt_variables (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    template_id BIGINT NOT NULL COMMENT '模板ID',
    variable_name VARCHAR(100) NOT NULL COMMENT '变量名',
    variable_type VARCHAR(50) NOT NULL COMMENT '变量类型（string/number/boolean/array/object）',
    description TEXT COMMENT '变量描述',
    default_value TEXT COMMENT '默认值',
    is_required BOOLEAN DEFAULT FALSE COMMENT '是否必填',
    validation_rule JSON COMMENT '验证规则（JSON格式）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES prompt_templates(id) ON DELETE CASCADE,
    INDEX idx_template (template_id),
    UNIQUE KEY uk_template_variable (template_id, variable_name)
) COMMENT '模板变量表';

-- 模板版本表
CREATE TABLE IF NOT EXISTS prompt_versions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    template_id BIGINT NOT NULL COMMENT '模板ID',
    version INT NOT NULL COMMENT '版本号',
    system_prompt TEXT COMMENT '系统提示词',
    user_prompt TEXT COMMENT '用户提示词',
    variables JSON COMMENT '变量定义',
    change_log TEXT COMMENT '变更日志',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES prompt_templates(id) ON DELETE CASCADE,
    UNIQUE KEY uk_template_version (template_id, version),
    INDEX idx_template (template_id)
) COMMENT '模板版本表';

-- 插入默认分类
INSERT INTO prompt_categories (code, name, description, sort_order) VALUES
('character', '角色生成', '角色创建相关的提示词模板', 1),
('emotion', '情绪分析', '情绪分析相关的提示词模板', 2),
('memory', '记忆提取', '记忆提取相关的提示词模板', 3),
('intent', '意图识别', '意图识别相关的提示词模板', 4),
('response', '响应生成', '响应生成相关的提示词模板', 5),
('other', '其他', '其他业务场景的提示词模板', 99)
ON DUPLICATE KEY UPDATE name=VALUES(name);
