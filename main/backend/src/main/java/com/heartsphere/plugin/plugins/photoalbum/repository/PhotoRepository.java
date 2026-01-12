package com.heartsphere.plugin.plugins.photoalbum.repository;

import com.heartsphere.plugin.plugins.photoalbum.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 照片 Repository
 */
@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    
    /**
     * 根据相册ID查询照片列表
     */
    List<Photo> findByAlbumIdAndIsDeletedFalseOrderBySortOrderAsc(Long albumId);
    
    /**
     * 根据相册ID和用户ID查询照片列表
     */
    List<Photo> findByAlbumIdAndUserIdAndIsDeletedFalseOrderBySortOrderAsc(Long albumId, Long userId);
    
    /**
     * 根据ID和用户ID查询照片
     */
    Photo findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);
    
    /**
     * 统计相册中的照片数量
     */
    long countByAlbumIdAndIsDeletedFalse(Long albumId);
}
