package com.heartsphere.billing.repository;

import com.heartsphere.billing.entity.ResourcePoolRecharge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourcePoolRechargeRepository extends JpaRepository<ResourcePoolRecharge, Long> {
    List<ResourcePoolRecharge> findByProviderIdOrderByCreatedAtDesc(Long providerId);
    Page<ResourcePoolRecharge> findByProviderIdOrderByCreatedAtDesc(Long providerId, Pageable pageable);
}

