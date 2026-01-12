package com.heartsphere.mentis.security;

/**
 * Mentis 安全服务接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface MentisSecurityService {
    
    /**
     * 验证用户是否有权限访问会话
     * 
     * @param userId 用户ID
     * @param sessionId 会话ID
     * @return 是否有权限
     */
    boolean hasSessionAccess(Long userId, String sessionId);
    
    /**
     * 验证用户是否有权限执行任务
     * 
     * @param userId 用户ID
     * @param taskId 任务ID
     * @return 是否有权限
     */
    boolean hasTaskExecutePermission(Long userId, String taskId);
    
    /**
     * 验证用户是否有权限管理虚拟机
     * 
     * @param userId 用户ID
     * @param sessionId 会话ID
     * @return 是否有权限
     */
    boolean hasVmManagementPermission(Long userId, String sessionId);
    
    /**
     * 记录安全操作
     * 
     * @param userId 用户ID
     * @param action 操作类型
     * @param resource 资源标识
     * @param result 操作结果
     */
    void recordSecurityOperation(Long userId, String action, String resource, boolean result);
}
