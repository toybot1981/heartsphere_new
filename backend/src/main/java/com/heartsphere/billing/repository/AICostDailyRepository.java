package com.heartsphere.billing.repository;

import com.heartsphere.billing.entity.AICostDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AICostDailyRepository extends JpaRepository<AICostDaily, Long>, JpaSpecificationExecutor<AICostDaily> {
    Optional<AICostDaily> findByStatDateAndProviderIdAndModelIdAndUsageType(
        LocalDate statDate, Long providerId, Long modelId, String usageType
    );
    
    @Query("SELECT c FROM AICostDaily c WHERE c.statDate >= :startDate AND c.statDate <= :endDate " +
           "ORDER BY c.statDate DESC")
    List<AICostDaily> findByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}

