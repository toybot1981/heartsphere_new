-- 移除传送门权限限制并清理场景中的传送门配置
-- 根据新的设计，传送门不再需要权限检查，也不再在场景中配置

-- 1. 删除所有场景中的传送门配置（因为传送门现在通过共享心域页面的"传送"按钮使用）
-- 注意：这里只删除与场景关联的传送门，保留用户创建的独立传送门（如果有）
DELETE FROM portal_config WHERE scene_id IS NOT NULL;

-- 2. 删除所有传送门权限记录（不再需要）
DELETE FROM portal_permission;

-- 3. 将所有剩余传送门的权限类型设置为 PUBLIC（虽然不再检查，但保持数据一致性）
UPDATE portal_config SET permission_type = 'public' WHERE permission_type IS NOT NULL;

-- 4. 激活所有传送门（移除权限限制后，所有传送门都应该可用）
UPDATE portal_config SET is_active = true WHERE is_active = false;
