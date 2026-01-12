package com.heartsphere.mentis.executor.computeruse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * 命令安全验证器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class CommandSecurityValidator {
    
    // 危险命令黑名单
    private static final Set<String> DANGEROUS_COMMANDS = new HashSet<>(Arrays.asList(
        "rm -rf /", "rm -rf /*", "format", "fdisk", "mkfs", "dd if=",
        "sudo rm", "sudo format", "chmod 777", "chown root",
        "mkfs.ext", "mkfs.ntfs", "dd if=/dev/zero",
        "shutdown", "reboot", "halt", "poweroff"
    ));
    
    // 需要特殊权限的命令
    private static final Set<String> PRIVILEGED_COMMANDS = new HashSet<>(Arrays.asList(
        "sudo", "su", "chmod", "chown", "mount", "umount"
    ));
    
    /**
     * 验证命令是否安全
     * 
     * @param command 命令
     * @return 验证结果
     */
    public ValidationResult validate(String command) {
        if (command == null || command.trim().isEmpty()) {
            return ValidationResult.unsafe("命令不能为空");
        }
        
        String commandLower = command.toLowerCase().trim();
        
        // 检查危险命令
        for (String dangerous : DANGEROUS_COMMANDS) {
            if (commandLower.contains(dangerous.toLowerCase())) {
                log.warn("检测到危险命令: {}", command);
                return ValidationResult.unsafe("命令包含危险操作: " + dangerous);
            }
        }
        
        // 检查特权命令
        for (String privileged : PRIVILEGED_COMMANDS) {
            if (commandLower.startsWith(privileged.toLowerCase()) || 
                commandLower.contains(" " + privileged.toLowerCase() + " ")) {
                log.warn("检测到需要特权的命令: {}", command);
                return ValidationResult.unsafe("命令需要特殊权限: " + privileged);
            }
        }
        
        return ValidationResult.safe();
    }
    
    /**
     * 验证结果
     */
    public static class ValidationResult {
        private boolean safe;
        private String reason;
        
        private ValidationResult(boolean safe, String reason) {
            this.safe = safe;
            this.reason = reason;
        }
        
        public static ValidationResult safe() {
            return new ValidationResult(true, null);
        }
        
        public static ValidationResult unsafe(String reason) {
            return new ValidationResult(false, reason);
        }
        
        public boolean isSafe() {
            return safe;
        }
        
        public String getReason() {
            return reason;
        }
    }
}
