package com.heartsphere.repository;

import com.heartsphere.entity.UserMainStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserMainStoryRepository extends JpaRepository<UserMainStory, Long> {
    /**
     * 根据场景ID查找用户主线剧情（使用关联对象的ID）
     */
    @Query("SELECT ums FROM UserMainStory ums WHERE ums.era.id = :eraId")
    List<UserMainStory> findByEraId(@Param("eraId") Long eraId);

    /**
     * 根据用户ID和场景ID查找用户主线剧情
     */
    @Query("SELECT ums FROM UserMainStory ums WHERE ums.user.id = :userId AND ums.era.id = :eraId AND ums.isDeleted = false")
    Optional<UserMainStory> findByUserIdAndEraIdAndIsDeletedFalse(@Param("userId") Long userId, @Param("eraId") Long eraId);

    /**
     * 根据用户ID查找所有主线剧情
     */
    @Query("SELECT ums FROM UserMainStory ums WHERE ums.user.id = :userId AND ums.isDeleted = false")
    List<UserMainStory> findByUserIdAndIsDeletedFalse(@Param("userId") Long userId);

    /**
     * 根据场景ID查找所有未删除的主线剧情
     */
    @Query("SELECT ums FROM UserMainStory ums WHERE ums.era.id = :eraId AND ums.isDeleted = false")
    List<UserMainStory> findByEraIdAndIsDeletedFalse(@Param("eraId") Long eraId);
}

