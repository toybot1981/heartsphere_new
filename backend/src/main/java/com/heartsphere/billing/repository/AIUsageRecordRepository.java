package com.heartsphere.billing.repository;

import com.heartsphere.billing.entity.AIUsageRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AIUsageRecordRepository extends JpaRepository<AIUsageRecord, Long>, JpaSpecificationExecutor<AIUsageRecord> {
    Page<AIUsageRecord> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    @Query("SELECT r FROM AIUsageRecord r WHERE r.userId = :userId " +
           "AND r.createdAt >= :startDate AND r.createdAt <= :endDate " +
           "ORDER BY r.createdAt DESC")
    List<AIUsageRecord> findByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT SUM(r.totalTokens) FROM AIUsageRecord r WHERE r.userId = :userId " +
           "AND r.createdAt >= :startDate AND r.createdAt <= :endDate")
    Long sumTotalTokensByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT SUM(r.costAmount) FROM AIUsageRecord r WHERE r.providerId = :providerId " +
           "AND r.createdAt >= :startDate AND r.createdAt <= :endDate")
    java.math.BigDecimal sumCostByProviderAndDateRange(
        @Param("providerId") Long providerId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}

