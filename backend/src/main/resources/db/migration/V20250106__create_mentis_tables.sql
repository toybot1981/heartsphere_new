-- Mentis 超级智能体模块数据库表创建脚本
-- 创建日期：2025-01-06
-- 描述：创建 Mentis 模块所需的所有数据库表

-- 1. 创建 mentis_sessions 表（会话表）
CREATE TABLE IF NOT EXISTS mentis_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(200) NOT NULL UNIQUE COMMENT '会话唯一标识',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    title VARCHAR(500) COMMENT '会话标题',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '会话状态：ACTIVE, PAUSED, COMPLETED, ARCHIVED',
    vm_status VARCHAR(20) NOT NULL DEFAULT 'IDLE' COMMENT '虚拟机状态：IDLE, RUNNING, ERROR',
    vm_image_id VARCHAR(200) COMMENT '虚拟机镜像ID或标识',
    vm_config TEXT COMMENT '虚拟机配置信息（JSON格式）',
    context TEXT COMMENT '会话上下文信息（JSON格式）',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    last_active_at DATETIME COMMENT '最后活跃时间',
    INDEX idx_user_id (user_id),
    INDEX idx_session_id (session_id),
    INDEX idx_status (status),
    INDEX idx_user_status (user_id, status),
    INDEX idx_last_active_at (last_active_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mentis会话表';

-- 2. 创建 mentis_tasks 表（任务表）
CREATE TABLE IF NOT EXISTS mentis_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id VARCHAR(200) NOT NULL UNIQUE COMMENT '任务唯一标识',
    session_id BIGINT NOT NULL COMMENT '会话ID',
    task_type VARCHAR(50) NOT NULL COMMENT '任务类型：COMMAND, SCRIPT, INTERACTIVE, COMPUTER_USE',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '任务状态：PENDING, RUNNING, COMPLETED, FAILED, CANCELLED',
    description TEXT NOT NULL COMMENT '任务描述/指令',
    command TEXT COMMENT '执行的命令或脚本',
    parameters TEXT COMMENT '任务参数（JSON格式）',
    result TEXT COMMENT '任务结果（JSON格式）',
    error_message TEXT COMMENT '错误信息',
    started_at DATETIME COMMENT '执行开始时间',
    completed_at DATETIME COMMENT '执行结束时间',
    duration BIGINT COMMENT '执行耗时（毫秒）',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (session_id) REFERENCES mentis_sessions(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_session_id (session_id),
    INDEX idx_status (status),
    INDEX idx_task_type (task_type),
    INDEX idx_session_status (session_id, status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mentis任务表';

-- 3. 创建 mentis_messages 表（消息表）
CREATE TABLE IF NOT EXISTS mentis_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_id VARCHAR(200) NOT NULL UNIQUE COMMENT '消息唯一标识',
    session_id BIGINT NOT NULL COMMENT '会话ID',
    role VARCHAR(20) NOT NULL COMMENT '消息角色：USER, MENTIS, SYSTEM',
    content TEXT NOT NULL COMMENT '消息内容',
    message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT' COMMENT '消息类型：TEXT, COMMAND, RESULT, ERROR, ACTION',
    task_id VARCHAR(100) COMMENT '关联的任务ID（如果消息与任务相关）',
    metadata TEXT COMMENT '元数据（JSON格式）',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (session_id) REFERENCES mentis_sessions(id) ON DELETE CASCADE,
    INDEX idx_message_id (message_id),
    INDEX idx_session_id (session_id),
    INDEX idx_role (role),
    INDEX idx_message_type (message_type),
    INDEX idx_task_id (task_id),
    INDEX idx_session_created (session_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mentis消息表';

-- 4. 创建 mentis_vm_states 表（虚拟机状态表）
CREATE TABLE IF NOT EXISTS mentis_vm_states (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL COMMENT '会话ID',
    vm_id VARCHAR(200) NOT NULL COMMENT '虚拟机标识',
    state_type VARCHAR(50) NOT NULL COMMENT '状态类型：SNAPSHOT, CHECKPOINT, SCREENSHOT',
    state_data TEXT COMMENT '状态数据（JSON格式，包含屏幕截图、文件系统状态等）',
    screenshot_url VARCHAR(500) COMMENT '屏幕截图URL或路径',
    description VARCHAR(1000) COMMENT '状态描述',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (session_id) REFERENCES mentis_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_vm_id (vm_id),
    INDEX idx_state_type (state_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mentis虚拟机状态表';
