package com.heartsphere.repository;

import com.heartsphere.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByOrderNo(String orderNo);
    Optional<PaymentOrder> findByTransactionId(String transactionId);
    List<PaymentOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<PaymentOrder> findByStatus(String status);
}

