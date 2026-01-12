package com.heartsphere.admin.repository.billing;

import com.heartsphere.admin.entity.billing.AIProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AIProviderRepository extends JpaRepository<AIProvider, Long> {
    Optional<AIProvider> findByName(String name);
    boolean existsByName(String name);
}

