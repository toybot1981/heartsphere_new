package com.heartsphere.aiagent.exception;

/**
 * AI服务异常
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class AIServiceException extends RuntimeException {
    
    private final String provider;
    private final String model;
    private final String errorCode;
    
    public AIServiceException(String message) {
        super(message);
        this.provider = null;
        this.model = null;
        this.errorCode = "AI_SERVICE_ERROR";
    }
    
    public AIServiceException(String message, Throwable cause) {
        super(message, cause);
        this.provider = null;
        this.model = null;
        this.errorCode = "AI_SERVICE_ERROR";
    }
    
    public AIServiceException(String message, String provider, String model) {
        super(message);
        this.provider = provider;
        this.model = model;
        this.errorCode = "AI_SERVICE_ERROR";
    }
    
    public String getProvider() {
        return provider;
    }
    
    public String getModel() {
        return model;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}

