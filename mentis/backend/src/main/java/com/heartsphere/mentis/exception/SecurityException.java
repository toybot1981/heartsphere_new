package com.heartsphere.mentis.exception;

/**
 * 安全异常
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class SecurityException extends MentisException {
    
    public SecurityException(String message) {
        super("SECURITY_ERROR", message);
    }
    
    public SecurityException(String message, Throwable cause) {
        super("SECURITY_ERROR", message, cause);
    }
}
