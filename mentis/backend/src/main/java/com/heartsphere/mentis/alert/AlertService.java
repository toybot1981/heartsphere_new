package com.heartsphere.mentis.alert;

import java.util.List;
import java.util.Map;

/**
 * 告警服务接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface AlertService {
    
    /**
     * 发送告警
     * 
     * @param alertType 告警类型
     * @param level 告警级别（INFO, WARNING, ERROR, CRITICAL）
     * @param message 告警消息
     * @param details 详细信息
     */
    void sendAlert(String alertType, String level, String message, String details);
    
    /**
     * 检查并触发告警
     * 
     * @param metrics 指标数据
     */
    void checkAndTriggerAlerts(Map<String, Object> metrics);
    
    /**
     * 获取告警列表
     * 
     * @param level 告警级别（可选）
     * @param startTime 开始时间（可选）
     * @return 告警列表
     */
    List<Alert> getAlerts(String level, Long startTime);
    
    /**
     * 告警实体
     */
    class Alert {
        private Long id;
        private String alertType;
        private String level; // INFO, WARNING, ERROR, CRITICAL
        private String message;
        private String details;
        private Long timestamp;
        private boolean resolved;
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getAlertType() { return alertType; }
        public void setAlertType(String alertType) { this.alertType = alertType; }
        public String getLevel() { return level; }
        public void setLevel(String level) { this.level = level; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        public Long getTimestamp() { return timestamp; }
        public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
        public boolean isResolved() { return resolved; }
        public void setResolved(boolean resolved) { this.resolved = resolved; }
    }
}
