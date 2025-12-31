package com.heartsphere.emotion.repository;

import com.heartsphere.emotion.entity.EmotionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 情绪记录Repository
 */
@Repository
public interface EmotionRecordRepository extends JpaRepository<EmotionRecord, Long> {
    
    /**
     * 根据用户ID查询情绪记录
     */
    List<EmotionRecord> findByUserIdOrderByTimestampDesc(Long userId);
    
    /**
     * 根据用户ID和时间范围查询
     */
    @Query("SELECT e FROM EmotionRecord e WHERE e.userId = :userId " +
           "AND e.timestamp >= :startDate AND e.timestamp <= :endDate " +
           "ORDER BY e.timestamp DESC")
    List<EmotionRecord> findByUserIdAndTimeRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    /**
     * 根据用户ID和情绪类型查询
     */
    List<EmotionRecord> findByUserIdAndEmotionTypeOrderByTimestampDesc(
        Long userId, String emotionType
    );
    
    /**
     * 根据用户ID和来源查询
     */
    List<EmotionRecord> findByUserIdAndSourceOrderByTimestampDesc(
        Long userId, String source
    );
    
    /**
     * 获取用户最新的情绪记录
     */
    EmotionRecord findFirstByUserIdOrderByTimestampDesc(Long userId);
    
    /**
     * 统计用户情绪类型数量
     */
    @Query("SELECT e.emotionType, COUNT(e) FROM EmotionRecord e " +
           "WHERE e.userId = :userId AND e.timestamp >= :startDate " +
           "GROUP BY e.emotionType")
    List<Object[]> countByEmotionType(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate
    );
}



