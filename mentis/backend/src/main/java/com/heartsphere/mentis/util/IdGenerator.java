package com.heartsphere.mentis.util;

import java.util.UUID;

/**
 * ID 生成工具类
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class IdGenerator {
    
    /**
     * 生成会话ID
     */
    public static String generateSessionId(Long userId) {
        return "mentis_" + System.currentTimeMillis() + "_" + userId;
    }
    
    /**
     * 生成任务ID
     */
    public static String generateTaskId() {
        return "task_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
    
    /**
     * 生成消息ID
     */
    public static String generateMessageId() {
        return "msg_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
    
    /**
     * 生成执行ID
     */
    public static String generateExecutionId() {
        return "exec_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
    
    /**
     * 生成快照ID
     */
    public static String generateSnapshotId() {
        return "snapshot_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }
}
