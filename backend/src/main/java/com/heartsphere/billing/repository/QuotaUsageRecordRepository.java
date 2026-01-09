package com.heartsphere.billing.repository;

import com.heartsphere.billing.entity.QuotaUsageRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 配额使用记录Repository
 */
@Repository
public interface QuotaUsageRecordRepository extends JpaRepository<QuotaUsageRecord, Long> {
    
    /**
     * 根据用户ID和配额类型查询使用记录
     */
    Page<QuotaUsageRecord> findByUserIdAndQuotaTypeOrderByCreatedAtDesc(
            Long userId, String quotaType, Pageable pageable);
    
    /**
     * 根据会员ID和配额类型查询使用记录
     */
    List<QuotaUsageRecord> findByMembershipIdAndQuotaTypeOrderByCreatedAtDesc(
            Long membershipId, String quotaType);
    
    /**
     * 根据用户ID和时间范围查询使用记录
     */
    @Query("SELECT r FROM QuotaUsageRecord r WHERE r.userId = :userId " +
           "AND r.createdAt >= :startDate AND r.createdAt <= :endDate " +
           "ORDER BY r.createdAt DESC")
    List<QuotaUsageRecord> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    /**
     * 根据会员ID和时间范围查询使用记录
     */
    @Query("SELECT r FROM QuotaUsageRecord r WHERE r.membershipId = :membershipId " +
           "AND r.createdAt >= :startDate AND r.createdAt <= :endDate " +
           "ORDER BY r.createdAt DESC")
    List<QuotaUsageRecord> findByMembershipIdAndDateRange(
            @Param("membershipId") Long membershipId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    /**
     * 统计用户指定时间范围内的使用总量
     */
    @Query("SELECT SUM(r.amountUsed) FROM QuotaUsageRecord r WHERE r.userId = :userId " +
           "AND r.quotaType = :quotaType " +
           "AND r.createdAt >= :startDate AND r.createdAt <= :endDate")
    Long sumAmountUsedByUserIdAndQuotaTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("quotaType") String quotaType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    /**
     * 根据关联记录查询使用记录
     */
    List<QuotaUsageRecord> findByRelatedRecordIdAndRelatedRecordType(
            Long relatedRecordId, String relatedRecordType);
}
