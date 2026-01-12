package com.heartsphere.mentis.exception;

/**
 * Mentis 基础异常类
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class MentisException extends RuntimeException {
    
    private String errorCode;
    
    public MentisException(String message) {
        super(message);
    }
    
    public MentisException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public MentisException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public MentisException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}
