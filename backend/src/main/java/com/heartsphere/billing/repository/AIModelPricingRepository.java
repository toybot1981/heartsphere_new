package com.heartsphere.billing.repository;

import com.heartsphere.billing.entity.AIModelPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AIModelPricingRepository extends JpaRepository<AIModelPricing, Long> {
    @Query("SELECT p FROM AIModelPricing p WHERE p.modelId = :modelId " +
           "AND p.pricingType = :pricingType " +
           "AND p.isActive = true " +
           "AND p.effectiveDate <= :now " +
           "AND (p.expiryDate IS NULL OR p.expiryDate > :now) " +
           "ORDER BY p.effectiveDate DESC")
    Optional<AIModelPricing> findActivePricing(
        @Param("modelId") Long modelId,
        @Param("pricingType") String pricingType,
        @Param("now") LocalDateTime now
    );
    
    List<AIModelPricing> findByModelId(Long modelId);
    
    List<AIModelPricing> findByModelIdAndPricingType(Long modelId, String pricingType);
}

