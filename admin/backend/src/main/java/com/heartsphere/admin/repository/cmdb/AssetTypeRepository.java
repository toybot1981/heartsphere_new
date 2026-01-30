package com.heartsphere.admin.repository.cmdb;

import com.heartsphere.admin.entity.cmdb.AssetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 资产类型Repository
 */
@Repository
public interface AssetTypeRepository extends JpaRepository<AssetType, Long> {
    
    Optional<AssetType> findByCode(String code);
    
    Optional<AssetType> findByName(String name);
}
