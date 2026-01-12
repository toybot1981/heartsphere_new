package com.heartsphere.admin.repository.plugin;

import com.heartsphere.admin.entity.plugin.UserPlugin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 用户插件Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface UserPluginRepository extends JpaRepository<UserPlugin, Long> {
    
    /**
     * 根据用户ID查找
     */
    List<UserPlugin> findByUserId(Long userId);
    
    /**
     * 根据用户ID和状态查找
     */
    List<UserPlugin> findByUserIdAndStatus(Long userId, String status);
    
    /**
     * 根据用户ID和插件ID查找
     */
    Optional<UserPlugin> findByUserIdAndPluginId(Long userId, String pluginId);
    
    /**
     * 检查用户是否已安装插件
     */
    boolean existsByUserIdAndPluginId(Long userId, String pluginId);
    
    /**
     * 统计用户已安装的插件数量
     */
    @Query("SELECT COUNT(up) FROM UserPlugin up WHERE up.userId = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    /**
     * 统计插件被安装的次数
     */
    @Query("SELECT COUNT(up) FROM UserPlugin up WHERE up.pluginId = :pluginId")
    long countByPluginId(@Param("pluginId") String pluginId);
}
