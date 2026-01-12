package com.heartsphere.plugin.repository;

import com.heartsphere.plugin.entity.ScenePlugin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 场景插件Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface ScenePluginRepository extends JpaRepository<ScenePlugin, Long> {
    
    /**
     * 根据场景ID查找
     */
    List<ScenePlugin> findBySceneId(String sceneId);
    
    /**
     * 根据场景ID和可见性查找
     */
    List<ScenePlugin> findBySceneIdAndIsVisible(String sceneId, Boolean isVisible);
    
    /**
     * 根据用户ID查找
     */
    List<ScenePlugin> findByUserId(Long userId);
    
    /**
     * 根据场景ID和插件ID查找
     */
    Optional<ScenePlugin> findBySceneIdAndPluginId(String sceneId, String pluginId);
    
    /**
     * 根据场景ID和用户ID查找
     */
    List<ScenePlugin> findBySceneIdAndUserId(String sceneId, Long userId);
    
    /**
     * 根据场景ID、插件ID和用户ID查找
     */
    Optional<ScenePlugin> findBySceneIdAndPluginIdAndUserId(String sceneId, String pluginId, Long userId);
    
    /**
     * 删除场景中的所有插件
     */
    void deleteBySceneId(String sceneId);
    
    /**
     * 统计场景中的插件数量
     */
    @Query("SELECT COUNT(sp) FROM ScenePlugin sp WHERE sp.sceneId = :sceneId")
    long countBySceneId(@Param("sceneId") String sceneId);
}
