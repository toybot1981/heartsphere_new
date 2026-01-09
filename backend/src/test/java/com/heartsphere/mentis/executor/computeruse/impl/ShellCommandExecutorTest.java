package com.heartsphere.mentis.executor.computeruse.impl;

import com.heartsphere.mentis.executor.computeruse.CommandExecutor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ShellCommandExecutor 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class ShellCommandExecutorTest {
    
    @InjectMocks
    private ShellCommandExecutor commandExecutor;
    
    private String testSessionId;
    
    @BeforeEach
    void setUp() {
        testSessionId = "mentis_test_session_123";
    }
    
    @Test
    void testIsCommandSafe() {
        // Given
        String safeCommand = "ls -la";
        
        // When
        boolean result = commandExecutor.isCommandSafe(safeCommand);
        
        // Then
        assertTrue(result);
    }
    
    @Test
    void testIsCommandSafe_Dangerous() {
        // Given
        String dangerousCommand = "rm -rf /";
        
        // When
        boolean result = commandExecutor.isCommandSafe(dangerousCommand);
        
        // Then
        assertFalse(result);
    }
    
    @Test
    void testIsCommandSafe_Empty() {
        // Given
        String emptyCommand = "";
        
        // When
        boolean result = commandExecutor.isCommandSafe(emptyCommand);
        
        // Then
        assertFalse(result);
    }
    
    @Test
    void testIsCommandSafe_Null() {
        // Given
        String nullCommand = null;
        
        // When
        boolean result = commandExecutor.isCommandSafe(nullCommand);
        
        // Then
        assertFalse(result);
    }
    
    @Test
    void testExecuteCommand_UnsafeCommand() {
        // Given
        String dangerousCommand = "rm -rf /";
        int timeout = 10;
        
        // When
        CommandExecutor.CommandResult result = commandExecutor.execute(testSessionId, dangerousCommand, timeout);
        
        // Then
        assertNotNull(result);
        assertEquals(-1, result.getExitCode());
        assertNotNull(result.getStderr());
        assertTrue(result.getStderr().contains("安全策略") || result.getStderr().contains("阻止"));
    }
}
