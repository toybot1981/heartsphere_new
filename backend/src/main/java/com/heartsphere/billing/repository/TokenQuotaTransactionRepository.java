package com.heartsphere.billing.repository;

import com.heartsphere.billing.entity.TokenQuotaTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TokenQuotaTransactionRepository extends JpaRepository<TokenQuotaTransaction, Long> {
    Page<TokenQuotaTransaction> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<TokenQuotaTransaction> findByUserIdAndTransactionTypeOrderByCreatedAtDesc(
        Long userId, String transactionType
    );
    
    @Query("SELECT t FROM TokenQuotaTransaction t WHERE t.userId = :userId " +
           "AND t.createdAt >= :startDate AND t.createdAt <= :endDate " +
           "ORDER BY t.createdAt DESC")
    List<TokenQuotaTransaction> findByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}

