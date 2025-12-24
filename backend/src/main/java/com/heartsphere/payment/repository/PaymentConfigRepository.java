package com.heartsphere.payment.repository;

import com.heartsphere.payment.entity.PaymentConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 支付配置Repository
 */
@Repository
public interface PaymentConfigRepository extends JpaRepository<PaymentConfig, Long> {
    /**
     * 根据支付类型查找配置
     */
    Optional<PaymentConfig> findByPaymentType(String paymentType);

    /**
     * 根据支付类型和启用状态查找配置
     */
    Optional<PaymentConfig> findByPaymentTypeAndIsEnabledTrue(String paymentType);
}

