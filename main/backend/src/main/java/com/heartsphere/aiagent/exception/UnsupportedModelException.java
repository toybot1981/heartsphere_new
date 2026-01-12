package com.heartsphere.aiagent.exception;

/**
 * 不支持的模型异常
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class UnsupportedModelException extends RuntimeException {
    
    private final String provider;
    private final String model;
    
    public UnsupportedModelException(String message) {
        super(message);
        this.provider = null;
        this.model = null;
    }
    
    public UnsupportedModelException(String message, String provider, String model) {
        super(message);
        this.provider = provider;
        this.model = model;
    }
    
    public String getProvider() {
        return provider;
    }
    
    public String getModel() {
        return model;
    }
}
