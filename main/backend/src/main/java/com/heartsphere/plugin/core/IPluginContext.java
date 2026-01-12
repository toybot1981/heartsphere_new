package com.heartsphere.plugin.core;

import com.heartsphere.plugin.model.PluginEvent;

/**
 * 插件上下文接口
 * 
 * 为插件提供运行环境和系统服务
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface IPluginContext {
    
    /**
     * 获取插件ID
     * 
     * @return 插件ID
     */
    String getPluginId();
    
    /**
     * 获取用户ID
     * 
     * @return 用户ID
     */
    Long getUserId();
    
    /**
     * 获取场景ID（如果插件关联到场景）
     * 
     * @return 场景ID，如果未关联则返回null
     */
    String getSceneId();
    
    /**
     * 获取插件API服务
     * 插件可以通过此服务调用系统API
     * 
     * @return 插件API服务
     */
    IPluginAPI getAPI();
    
    /**
     * 获取事件总线
     * 插件可以通过此服务发布和订阅事件
     * 
     * @return 事件总线
     */
    PluginEventBus getEventBus();
    
    /**
     * 获取存储服务
     * 插件可以通过此服务存储数据
     * 
     * @return 存储服务
     */
    IPluginStorage getStorage();
    
    /**
     * 发布事件
     * 
     * @param event 事件
     */
    void publishEvent(PluginEvent event);
    
    /**
     * 订阅事件
     * 
     * @param eventType 事件类型
     * @param handler 事件处理器
     */
    void subscribeEvent(String eventType, PluginEventHandler handler);
}
