package com.heartsphere.memory.model;

/**
 * 记忆重要性枚举
 * 
 * @author HeartSphere
 * @date 2025-12-28
 */
public enum MemoryImportance {
    /**
     * 核心记忆（永久保留）
     */
    CORE,
    
    /**
     * 重要记忆（长期保留）
     */
    IMPORTANT,
    
    /**
     * 普通记忆（定期衰减）
     */
    NORMAL,
    
    /**
     * 临时记忆（短期保留）
     */
    TEMPORARY
}

