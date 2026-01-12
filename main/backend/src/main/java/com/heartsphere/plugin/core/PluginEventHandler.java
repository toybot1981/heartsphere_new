package com.heartsphere.plugin.core;

import com.heartsphere.plugin.model.PluginEvent;

/**
 * 插件事件处理器接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
@FunctionalInterface
public interface PluginEventHandler {
    
    /**
     * 处理事件
     * 
     * @param event 事件
     */
    void handle(PluginEvent event);
}
