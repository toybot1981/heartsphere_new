package com.heartsphere.plugin.repository;

import com.heartsphere.plugin.entity.PluginDataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 插件数据Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface PluginDataRepository extends JpaRepository<PluginDataEntity, Long> {
    
    /**
     * 根据插件ID和用户ID查找
     */
    List<PluginDataEntity> findByPluginIdAndUserId(String pluginId, Long userId);
    
    /**
     * 根据插件ID、用户ID和场景ID查找
     */
    List<PluginDataEntity> findByPluginIdAndUserIdAndSceneId(
        String pluginId, 
        Long userId, 
        String sceneId
    );
    
    /**
     * 根据插件ID、用户ID和数据键查找
     */
    Optional<PluginDataEntity> findByPluginIdAndUserIdAndDataKey(
        String pluginId, 
        Long userId, 
        String dataKey
    );
    
    /**
     * 根据插件ID、用户ID、场景ID和数据键查找
     */
    Optional<PluginDataEntity> findByPluginIdAndUserIdAndSceneIdAndDataKey(
        String pluginId, 
        Long userId, 
        String sceneId, 
        String dataKey
    );
    
    /**
     * 删除插件的所有数据
     */
    void deleteByPluginIdAndUserId(String pluginId, Long userId);
    
    /**
     * 删除场景中插件的数据
     */
    void deleteByPluginIdAndUserIdAndSceneId(String pluginId, Long userId, String sceneId);
}
