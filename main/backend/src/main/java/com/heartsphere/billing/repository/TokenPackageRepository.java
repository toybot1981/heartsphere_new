package com.heartsphere.billing.repository;

import com.heartsphere.billing.entity.TokenPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TokenPackageRepository extends JpaRepository<TokenPackage, Long> {
    List<TokenPackage> findByQuotaTypeAndIsActiveTrueOrderBySortOrderAsc(String quotaType);
    
    List<TokenPackage> findByIsActiveTrueOrderBySortOrderAsc();
}

