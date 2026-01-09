package com.heartsphere.plugin.exception;

/**
 * 插件异常
 * 
 * 插件相关的所有异常都继承此类
 * 
 * @author HeartSphere
 * @version 1.0
 */
public class PluginException extends Exception {
    
    private static final long serialVersionUID = 1L;
    
    public PluginException(String message) {
        super(message);
    }
    
    public PluginException(String message, Throwable cause) {
        super(message, cause);
    }
}
