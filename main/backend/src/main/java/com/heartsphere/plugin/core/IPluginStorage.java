package com.heartsphere.plugin.core;

import java.util.Map;

/**
 * 插件存储服务接口
 * 
 * 为插件提供数据存储服务
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface IPluginStorage {
    
    /**
     * 保存数据
     * 
     * @param key 数据键
     * @param value 数据值
     */
    void save(String key, Object value);
    
    /**
     * 获取数据
     * 
     * @param key 数据键
     * @return 数据值，如果不存在返回null
     */
    Object get(String key);
    
    /**
     * 获取所有数据
     * 
     * @return 所有数据的Map
     */
    Map<String, Object> getAll();
    
    /**
     * 删除数据
     * 
     * @param key 数据键
     */
    void delete(String key);
    
    /**
     * 清空所有数据
     */
    void clear();
    
    /**
     * 检查数据是否存在
     * 
     * @param key 数据键
     * @return 如果存在返回true，否则返回false
     */
    boolean exists(String key);
}
