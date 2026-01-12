package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    List<SubscriptionPlan> findByIsActiveTrueOrderBySortOrderAsc();
    List<SubscriptionPlan> findByTypeAndIsActiveTrueOrderBySortOrderAsc(String type);
    List<SubscriptionPlan> findByBillingCycleAndIsActiveTrueOrderBySortOrderAsc(String billingCycle);
}

