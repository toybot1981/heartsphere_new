package com.heartsphere.billing.repository;

import com.heartsphere.billing.entity.UserTokenQuota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserTokenQuotaRepository extends JpaRepository<UserTokenQuota, Long> {
    Optional<UserTokenQuota> findByUserId(Long userId);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT q FROM UserTokenQuota q WHERE q.userId = :userId")
    Optional<UserTokenQuota> findByUserIdForUpdate(@Param("userId") Long userId);
    
    @Modifying
    @Query("UPDATE UserTokenQuota q SET q.lastResetDate = :resetDate WHERE q.userId = :userId")
    void updateLastResetDate(@Param("userId") Long userId, @Param("resetDate") LocalDate resetDate);
    
    @Query("SELECT q FROM UserTokenQuota q WHERE q.lastResetDate IS NULL OR q.lastResetDate < :targetDate")
    List<UserTokenQuota> findQuotasNeedingReset(@Param("targetDate") LocalDate targetDate);
}

