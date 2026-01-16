-- 修复传送门类型和权限类型字段
-- 将 portal_type 和 permission_type 从 ENUM 改为 VARCHAR，以支持转换器进行大小写转换
-- 创建时间: 2026-01-13

-- 修改 portal_config 表的 portal_type 字段
ALTER TABLE portal_config 
MODIFY COLUMN portal_type VARCHAR(20) NOT NULL DEFAULT 'stargate' 
COMMENT '传送门类型：stargate-星门，wormhole-虫洞，quantum-量子';

-- 修改 portal_config 表的 permission_type 字段
ALTER TABLE portal_config 
MODIFY COLUMN permission_type VARCHAR(20) NOT NULL DEFAULT 'approval' 
COMMENT '权限类型：public-公开，approval-需要审批，invite-邀请制';
