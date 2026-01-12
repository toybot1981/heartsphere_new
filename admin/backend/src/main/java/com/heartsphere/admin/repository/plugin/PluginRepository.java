package com.heartsphere.admin.repository.plugin;

import com.heartsphere.admin.entity.plugin.Plugin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 插件Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface PluginRepository extends JpaRepository<Plugin, Long> {
    
    /**
     * 根据插件ID查找
     */
    Optional<Plugin> findByPluginId(String pluginId);
    
    /**
     * 根据状态查找
     */
    List<Plugin> findByStatus(String status);
    
    /**
     * 根据分类查找
     */
    List<Plugin> findByCategory(String category);
    
    /**
     * 根据是否为系统插件查找
     */
    List<Plugin> findByIsSystemPlugin(Boolean isSystemPlugin);
    
    /**
     * 搜索插件（按名称或描述）
     */
    @Query("SELECT p FROM Plugin p WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "p.name LIKE %:keyword% OR p.description LIKE %:keyword%) AND " +
           "(:category IS NULL OR :category = '' OR p.category = :category) AND " +
           "(:status IS NULL OR :status = '' OR p.status = :status) AND " +
           "(:publishStatus IS NULL OR :publishStatus = '' OR p.publishStatus = :publishStatus)")
    Page<Plugin> searchPlugins(
        @Param("keyword") String keyword,
        @Param("category") String category,
        @Param("status") String status,
        @Param("publishStatus") String publishStatus,
        Pageable pageable
    );
    
    /**
     * 检查插件ID是否存在
     */
    boolean existsByPluginId(String pluginId);
}
