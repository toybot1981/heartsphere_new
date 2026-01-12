package com.heartsphere.mentis.exception;

/**
 * 执行异常
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class ExecutionException extends MentisException {
    
    public ExecutionException(String message) {
        super("EXECUTION_ERROR", message);
    }
    
    public ExecutionException(String message, Throwable cause) {
        super("EXECUTION_ERROR", message, cause);
    }
}
