package com.heartsphere.admin.repository.billing;

import com.heartsphere.admin.entity.billing.ProviderResourcePool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProviderResourcePoolRepository extends JpaRepository<ProviderResourcePool, Long> {
    Optional<ProviderResourcePool> findByProviderId(Long providerId);
}

