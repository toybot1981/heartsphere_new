package com.heartsphere.plugin.model;

/**
 * 插件状态枚举
 * 
 * @author HeartSphere
 * @version 1.0
 */
public enum PluginStatus {
    /**
     * 未安装
     */
    UNINSTALLED,
    
    /**
     * 已安装
     */
    INSTALLED,
    
    /**
     * 已初始化
     */
    INITIALIZED,
    
    /**
     * 已激活
     */
    ACTIVATED,
    
    /**
     * 已停用
     */
    DEACTIVATED,
    
    /**
     * 已销毁
     */
    DESTROYED
}
