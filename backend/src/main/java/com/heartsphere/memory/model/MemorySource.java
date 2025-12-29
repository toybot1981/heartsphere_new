package com.heartsphere.memory.model;

/**
 * 记忆来源枚举
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
public enum MemorySource {
    /**
     * 对话
     */
    CONVERSATION,
    
    /**
     * 用户输入
     */
    USER_INPUT,
    
    /**
     * 系统检测
     */
    SYSTEM_DETECTED,
    
    /**
     * 手动创建
     */
    MANUAL_CREATE,
    
    /**
     * 外部同步
     */
    EXTERNAL_SYNC
}

