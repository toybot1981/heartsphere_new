package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.AIRoutingStrategy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIRoutingStrategyRepository extends JpaRepository<AIRoutingStrategy, Long> {
    Optional<AIRoutingStrategy> findByCapabilityAndIsActiveTrue(String capability);
    List<AIRoutingStrategy> findAllByIsActiveTrue();
}


