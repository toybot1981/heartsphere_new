package com.heartsphere.mentis.audit;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 审计日志服务接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface AuditLogService {
    
    /**
     * 记录操作日志
     * 
     * @param userId 用户ID
     * @param action 操作类型
     * @param resourceType 资源类型
     * @param resourceId 资源ID
     * @param details 详细信息
     * @param result 操作结果
     */
    void logOperation(Long userId, String action, String resourceType, 
                     String resourceId, String details, boolean result);
    
    /**
     * 查询操作日志
     * 
     * @param userId 用户ID（可选）
     * @param action 操作类型（可选）
     * @param startTime 开始时间（可选）
     * @param endTime 结束时间（可选）
     * @return 日志列表
     */
    List<AuditLog> queryLogs(Long userId, String action, 
                             LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 查询敏感操作日志
     * 
     * @param userId 用户ID（可选）
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 敏感操作日志列表
     */
    List<AuditLog> querySensitiveLogs(Long userId, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 审计日志实体
     */
    class AuditLog {
        private Long id;
        private Long userId;
        private String action;
        private String resourceType;
        private String resourceId;
        private String details;
        private boolean success;
        private String ipAddress;
        private LocalDateTime timestamp;
        private boolean sensitive; // 是否为敏感操作
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getResourceType() { return resourceType; }
        public void setResourceType(String resourceType) { this.resourceType = resourceType; }
        public String getResourceId() { return resourceId; }
        public void setResourceId(String resourceId) { this.resourceId = resourceId; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        public boolean isSensitive() { return sensitive; }
        public void setSensitive(boolean sensitive) { this.sensitive = sensitive; }
    }
}
