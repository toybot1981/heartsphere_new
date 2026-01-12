package com.heartsphere.plugin.plugins.photoalbum.repository;

import com.heartsphere.plugin.plugins.photoalbum.entity.PhotoAlbum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 相册 Repository
 */
@Repository
public interface PhotoAlbumRepository extends JpaRepository<PhotoAlbum, Long> {
    
    /**
     * 根据用户ID和插件实例ID查询相册列表
     */
    List<PhotoAlbum> findByUserIdAndPluginInstanceIdAndIsDeletedFalse(Long userId, Long pluginInstanceId);
    
    /**
     * 根据用户ID查询相册列表
     */
    List<PhotoAlbum> findByUserIdAndIsDeletedFalse(Long userId);
    
    /**
     * 根据ID和用户ID查询相册
     */
    PhotoAlbum findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);
}
