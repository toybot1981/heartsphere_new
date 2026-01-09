package com.heartsphere.plugin.core;

import com.heartsphere.plugin.exception.PluginException;
import com.heartsphere.plugin.model.PluginConfig;
import com.heartsphere.plugin.model.PluginData;
import com.heartsphere.plugin.model.PluginMetadata;
import com.heartsphere.plugin.model.PluginStatus;

/**
 * 插件标准接口
 * 
 * 所有插件必须实现此接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface IPlugin {
    
    /**
     * 获取插件元数据
     * 
     * @return 插件元数据
     */
    PluginMetadata getMetadata();
    
    /**
     * 初始化插件
     * 
     * @param context 插件上下文，提供插件运行环境
     * @param config 插件配置
     * @throws PluginException 如果初始化失败
     */
    void initialize(IPluginContext context, PluginConfig config) throws PluginException;
    
    /**
     * 激活插件
     * 
     * @throws PluginException 如果激活失败
     */
    void activate() throws PluginException;
    
    /**
     * 停用插件
     * 
     * @throws PluginException 如果停用失败
     */
    void deactivate() throws PluginException;
    
    /**
     * 销毁插件
     * 释放插件占用的资源
     * 
     * @throws PluginException 如果销毁失败
     */
    void destroy() throws PluginException;
    
    /**
     * 获取插件配置
     * 
     * @return 插件配置
     */
    PluginConfig getConfig();
    
    /**
     * 更新插件配置
     * 
     * @param config 新的配置
     * @throws PluginException 如果更新失败
     */
    void updateConfig(PluginConfig config) throws PluginException;
    
    /**
     * 导出插件数据
     * 用于备份或迁移
     * 
     * @return 插件数据
     * @throws PluginException 如果导出失败
     */
    PluginData exportData() throws PluginException;
    
    /**
     * 导入插件数据
     * 用于恢复或迁移
     * 
     * @param data 插件数据
     * @throws PluginException 如果导入失败
     */
    void importData(PluginData data) throws PluginException;
    
    /**
     * 获取插件状态
     * 
     * @return 插件状态
     */
    PluginStatus getStatus();
}
