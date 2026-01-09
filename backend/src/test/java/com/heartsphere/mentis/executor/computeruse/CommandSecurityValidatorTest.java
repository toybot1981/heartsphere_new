package com.heartsphere.mentis.executor.computeruse;

import com.heartsphere.mentis.executor.computeruse.CommandSecurityValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

/**
 * CommandSecurityValidator 单元测试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
class CommandSecurityValidatorTest {
    
    @InjectMocks
    private CommandSecurityValidator validator = new CommandSecurityValidator();
    
    @BeforeEach
    void setUp() {
        // CommandSecurityValidator 不再依赖 MentisConfig
    }
    
    @Test
    void testValidateSafeCommand() {
        // Given
        String safeCommand = "ls -la";
        
        // When
        CommandSecurityValidator.ValidationResult result = validator.validate(safeCommand);
        
        // Then
        assertNotNull(result);
        assertTrue(result.isSafe());
        assertNull(result.getReason());
    }
    
    @Test
    void testValidateDangerousCommand_rm_rf() {
        // Given
        String dangerousCommand = "rm -rf /";
        
        // When
        CommandSecurityValidator.ValidationResult result = validator.validate(dangerousCommand);
        
        // Then
        assertNotNull(result);
        assertFalse(result.isSafe());
        assertNotNull(result.getReason());
        assertTrue(result.getReason().contains("危险操作") || result.getReason().contains("rm -rf"));
    }
    
    @Test
    void testValidateDangerousCommand_format() {
        // Given
        String dangerousCommand = "format C:";
        
        // When
        CommandSecurityValidator.ValidationResult result = validator.validate(dangerousCommand);
        
        // Then
        assertNotNull(result);
        assertFalse(result.isSafe());
        assertNotNull(result.getReason());
    }
    
    @Test
    void testValidateEmptyCommand() {
        // Given
        String emptyCommand = "";
        
        // When
        CommandSecurityValidator.ValidationResult result = validator.validate(emptyCommand);
        
        // Then
        assertNotNull(result);
        assertFalse(result.isSafe());
        assertNotNull(result.getReason());
        assertTrue(result.getReason().contains("不能为空"));
    }
    
    @Test
    void testValidateNullCommand() {
        // Given
        String nullCommand = null;
        
        // When
        CommandSecurityValidator.ValidationResult result = validator.validate(nullCommand);
        
        // Then
        assertNotNull(result);
        assertFalse(result.isSafe());
        assertNotNull(result.getReason());
    }
    
    @Test
    void testValidatePrivilegedCommand_sudo() {
        // Given
        String privilegedCommand = "sudo rm file.txt";
        
        // When
        CommandSecurityValidator.ValidationResult result = validator.validate(privilegedCommand);
        
        // Then
        assertNotNull(result);
        assertFalse(result.isSafe());
        assertNotNull(result.getReason());
        assertTrue(result.getReason().contains("sudo") || result.getReason().contains("特权"));
    }
    
    @Test
    void testValidateSafeCommand_complex() {
        // Given
        String safeCommand = "python3 script.py --help";
        
        // When
        CommandSecurityValidator.ValidationResult result = validator.validate(safeCommand);
        
        // Then
        assertNotNull(result);
        assertTrue(result.isSafe());
    }
}
