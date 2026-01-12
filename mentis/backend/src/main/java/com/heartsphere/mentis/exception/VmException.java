package com.heartsphere.mentis.exception;

/**
 * 虚拟机异常
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class VmException extends MentisException {
    
    public VmException(String message) {
        super("VM_ERROR", message);
    }
    
    public VmException(String message, Throwable cause) {
        super("VM_ERROR", message, cause);
    }
}
