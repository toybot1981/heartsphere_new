package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.AIModelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIModelConfigRepository extends JpaRepository<AIModelConfig, Long> {
    List<AIModelConfig> findByCapabilityAndIsActiveTrueOrderByPriorityAsc(String capability);
    List<AIModelConfig> findByProviderAndCapabilityAndIsActiveTrue(String provider, String capability);
    Optional<AIModelConfig> findByProviderAndModelNameAndCapability(String provider, String modelName, String capability);
    List<AIModelConfig> findByIsDefaultTrueAndCapabilityAndIsActiveTrue(String capability);
    List<AIModelConfig> findAllByIsActiveTrueOrderByCapabilityAscPriorityAsc();
}


