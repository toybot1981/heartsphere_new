package com.heartsphere.billing.repository;

import com.heartsphere.billing.entity.OverageCharge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 超量付费记录Repository
 */
@Repository
public interface OverageChargeRepository extends JpaRepository<OverageCharge, Long> {
    
    /**
     * 根据用户ID和状态查询超量付费记录
     */
    Page<OverageCharge> findByUserIdAndStatusOrderByCreatedAtDesc(
            Long userId, String status, Pageable pageable);
    
    /**
     * 根据订单ID查询超量付费记录
     */
    Optional<OverageCharge> findByOrderId(Long orderId);
    
    /**
     * 根据用户ID查询所有超量付费记录
     */
    List<OverageCharge> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * 根据会员ID查询超量付费记录
     */
    List<OverageCharge> findByMembershipIdOrderByCreatedAtDesc(Long membershipId);
    
    /**
     * 根据用户ID和时间范围查询超量付费记录
     */
    @Query("SELECT o FROM OverageCharge o WHERE o.userId = :userId " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate " +
           "ORDER BY o.createdAt DESC")
    List<OverageCharge> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    /**
     * 统计用户指定时间范围内的超量付费总金额
     */
    @Query("SELECT SUM(o.totalAmount) FROM OverageCharge o WHERE o.userId = :userId " +
           "AND o.status = 'paid' " +
           "AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    java.math.BigDecimal sumTotalAmountByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    /**
     * 查询待支付的超量付费记录
     */
    List<OverageCharge> findByStatusOrderByCreatedAtAsc(String status);
}
