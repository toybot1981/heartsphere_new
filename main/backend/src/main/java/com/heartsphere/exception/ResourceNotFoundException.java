package com.heartsphere.exception;

/**
 * 资源未找到异常
 */
public class ResourceNotFoundException extends BusinessException {
    public ResourceNotFoundException(String message) {
        super(404, message);
    }
    
    public ResourceNotFoundException(String resource, Long id) {
        super(404, resource + " not found with id: " + id);
    }
}




