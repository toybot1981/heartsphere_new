package com.heartsphere.mentis.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * IdGenerator 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
class IdGeneratorTest {
    
    @Test
    void testGenerateSessionId() {
        // When
        String sessionId1 = IdGenerator.generateSessionId(1L);
        String sessionId2 = IdGenerator.generateSessionId(2L);
        
        // Then
        assertNotNull(sessionId1);
        assertNotNull(sessionId2);
        assertTrue(sessionId1.startsWith("mentis_"));
        assertTrue(sessionId1.contains("_1"));
        assertNotEquals(sessionId1, sessionId2);
    }
    
    @Test
    void testGenerateTaskId() {
        // When
        String taskId1 = IdGenerator.generateTaskId();
        String taskId2 = IdGenerator.generateTaskId();
        
        // Then
        assertNotNull(taskId1);
        assertNotNull(taskId2);
        assertTrue(taskId1.startsWith("task_"));
        assertNotEquals(taskId1, taskId2);
    }
    
    @Test
    void testGenerateMessageId() {
        // When
        String messageId1 = IdGenerator.generateMessageId();
        String messageId2 = IdGenerator.generateMessageId();
        
        // Then
        assertNotNull(messageId1);
        assertNotNull(messageId2);
        assertTrue(messageId1.startsWith("msg_"));
        assertNotEquals(messageId1, messageId2);
    }
    
    @Test
    void testGenerateExecutionId() {
        // When
        String execId1 = IdGenerator.generateExecutionId();
        String execId2 = IdGenerator.generateExecutionId();
        
        // Then
        assertNotNull(execId1);
        assertNotNull(execId2);
        assertTrue(execId1.startsWith("exec_"));
        assertNotEquals(execId1, execId2);
    }
    
    @Test
    void testGenerateSnapshotId() {
        // When
        String snapshotId1 = IdGenerator.generateSnapshotId();
        String snapshotId2 = IdGenerator.generateSnapshotId();
        
        // Then
        assertNotNull(snapshotId1);
        assertNotNull(snapshotId2);
        assertTrue(snapshotId1.startsWith("snapshot_"));
        assertNotEquals(snapshotId1, snapshotId2);
    }
    
    @Test
    void testIdUniqueness() {
        // When - 生成多个ID
        String sessionId = IdGenerator.generateSessionId(1L);
        String taskId = IdGenerator.generateTaskId();
        String messageId = IdGenerator.generateMessageId();
        String execId = IdGenerator.generateExecutionId();
        String snapshotId = IdGenerator.generateSnapshotId();
        
        // Then - 所有ID应该唯一
        assertNotEquals(sessionId, taskId);
        assertNotEquals(taskId, messageId);
        assertNotEquals(messageId, execId);
        assertNotEquals(execId, snapshotId);
    }
}
