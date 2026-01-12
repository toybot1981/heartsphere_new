package com.heartsphere.heartconnect.storage;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 临时数据存储
 * 用于存储共享模式下的临时数据（对话、记忆、情绪等）
 * 数据存储在内存中，会话结束后自动清理
 */
@Component
public class TemporaryDataStorage {
    
    // 存储结构：key(shareConfigId:visitorId) -> dataType -> dataList
    private final Map<String, Map<String, List<Object>>> storage = new ConcurrentHashMap<>();
    
    /**
     * 保存临时数据
     * 
     * @param shareConfigId 共享配置ID
     * @param visitorId 访问者ID
     * @param dataType 数据类型（dialogue, memory, emotion等）
     * @param data 数据对象
     */
    public void save(String shareConfigId, String visitorId, String dataType, Object data) {
        String key = shareConfigId + ":" + visitorId;
        Map<String, List<Object>> visitorData = storage.computeIfAbsent(key, k -> new ConcurrentHashMap<>());
        List<Object> dataList = visitorData.computeIfAbsent(dataType, k -> new ArrayList<Object>());
        dataList.add(data);
    }
    
    /**
     * 获取临时数据列表
     * 
     * @param shareConfigId 共享配置ID
     * @param visitorId 访问者ID
     * @param dataType 数据类型
     * @return 数据列表
     */
    @SuppressWarnings("unchecked")
    public <T> List<T> get(String shareConfigId, String visitorId, String dataType, Class<T> clazz) {
        String key = shareConfigId + ":" + visitorId;
        Map<String, List<Object>> visitorData = storage.get(key);
        if (visitorData == null) {
            return Collections.emptyList();
        }
        
        List<Object> dataList = visitorData.get(dataType);
        if (dataList == null) {
            return Collections.emptyList();
        }
        
        List<T> result = new ArrayList<>();
        for (Object obj : dataList) {
            if (clazz.isInstance(obj)) {
                result.add(clazz.cast(obj));
            }
        }
        return result;
    }
    
    /**
     * 清除访问者的所有临时数据
     * 
     * @param shareConfigId 共享配置ID
     * @param visitorId 访问者ID
     */
    public void clear(String shareConfigId, String visitorId) {
        String key = shareConfigId + ":" + visitorId;
        storage.remove(key);
    }
    
    /**
     * 清除共享配置的所有临时数据
     * 
     * @param shareConfigId 共享配置ID
     */
    public void clearByShareConfig(String shareConfigId) {
        storage.entrySet().removeIf(entry -> entry.getKey().startsWith(shareConfigId + ":"));
    }
    
    /**
     * 获取数据统计
     * 
     * @param shareConfigId 共享配置ID
     * @param visitorId 访问者ID
     * @return 数据统计Map
     */
    public Map<String, Integer> getStatistics(String shareConfigId, String visitorId) {
        String key = shareConfigId + ":" + visitorId;
        Map<String, List<Object>> visitorData = storage.get(key);
        if (visitorData == null) {
            return Collections.emptyMap();
        }
        
        Map<String, Integer> stats = new HashMap<>();
        visitorData.forEach((dataType, dataList) -> {
            stats.put(dataType, dataList != null ? dataList.size() : 0);
        });
        return stats;
    }
}

