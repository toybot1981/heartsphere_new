package com.heartsphere.heartconnect.portal.service;

import com.heartsphere.heartconnect.dto.ShareConfigDTO;

/**
 * 共享配置查询服务接口
 * 用于传送门模块查询现有共享配置，实现接口隔离
 */
public interface ShareConfigQueryService {
    
    /**
     * 根据共享码获取共享配置
     */
    ShareConfigDTO getShareConfigByCode(String shareCode);
    
    /**
     * 检查用户是否已连接到指定的共享配置
     */
    boolean isUserConnected(Long userId, Long shareConfigId);
    
    /**
     * 检查用户是否有权限访问指定的共享配置
     */
    boolean canUserAccess(Long userId, String shareCode);
}
