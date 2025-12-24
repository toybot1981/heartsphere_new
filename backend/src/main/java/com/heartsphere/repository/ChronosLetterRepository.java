package com.heartsphere.repository;

import com.heartsphere.entity.ChronosLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 跨时空信箱（时间信件）Repository
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Repository
public interface ChronosLetterRepository extends JpaRepository<ChronosLetter, String> {
    
    /**
     * 根据用户ID查找所有信件（按时间倒序）
     */
    List<ChronosLetter> findByUser_IdOrderByTimestampDesc(Long userId);
    
    /**
     * 根据用户ID和类型查找信件
     */
    List<ChronosLetter> findByUser_IdAndTypeOrderByTimestampDesc(Long userId, String type);
    
    /**
     * 根据用户ID查找未读信件数量
     */
    @Query("SELECT COUNT(c) FROM ChronosLetter c WHERE c.user.id = :userId AND c.isRead = false")
    Long countUnreadLettersByUserId(@Param("userId") Long userId);
    
    /**
     * 根据用户ID查找未读信件
     */
    List<ChronosLetter> findByUser_IdAndIsReadFalseOrderByTimestampDesc(Long userId);
    
    /**
     * 根据父信件ID查找回复
     */
    List<ChronosLetter> findByParentLetterIdOrderByTimestampAsc(String parentLetterId);
    
    /**
     * 根据ID和用户ID查找信件（确保用户只能访问自己的信件）
     */
    Optional<ChronosLetter> findByIdAndUser_Id(String id, Long userId);
    
    /**
     * 根据类型查找信件（按时间倒序）
     */
    List<ChronosLetter> findByTypeOrderByTimestampDesc(String type);
}

