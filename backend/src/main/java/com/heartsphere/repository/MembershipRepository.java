package com.heartsphere.repository;

import com.heartsphere.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.List;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {
    Optional<Membership> findByUserId(Long userId);
    
    /**
     * 使用悲观锁查询会员信息（用于并发安全的配额扣减）
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM Membership m WHERE m.userId = :userId")
    Optional<Membership> findByUserIdForUpdate(@Param("userId") Long userId);
    
    List<Membership> findByStatus(String status);
    List<Membership> findByAutoRenewTrueAndNextRenewalDateLessThan(java.time.LocalDateTime date);
}

