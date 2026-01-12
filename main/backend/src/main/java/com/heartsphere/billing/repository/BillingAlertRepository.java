package com.heartsphere.billing.repository;

import com.heartsphere.billing.entity.BillingAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillingAlertRepository extends JpaRepository<BillingAlert, Long> {
    List<BillingAlert> findByProviderIdAndIsResolvedOrderByCreatedAtDesc(Long providerId, Boolean isResolved);
    List<BillingAlert> findByIsResolvedOrderByCreatedAtDesc(Boolean isResolved);
    Page<BillingAlert> findByIsResolvedOrderByCreatedAtDesc(Boolean isResolved, Pageable pageable);
}

