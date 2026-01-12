package com.heartsphere.admin.service;

/**
 * Mentis 同步服务
 * 负责通知 Mentis 后端重新加载配置
 */
public interface MentisSyncService {
    
    /**
     * 通知 Mentis 后端重新加载配置
     */
    void notifyMentisReload();
}
