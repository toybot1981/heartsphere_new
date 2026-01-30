package com.heartsphere.admin.repository.cmdb;

import com.heartsphere.admin.entity.cmdb.Asset;
import com.heartsphere.admin.entity.cmdb.AssetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 资产Repository
 */
@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    
    Page<Asset> findByTypeAndIsDeletedFalse(AssetType type, Pageable pageable);
    
    Page<Asset> findByStatusAndIsDeletedFalse(Asset.AssetStatus status, Pageable pageable);
    
    Page<Asset> findByOwnerIdAndIsDeletedFalse(Long ownerId, Pageable pageable);
    
    @Query("SELECT a FROM Asset a WHERE a.isDeleted = false AND " +
           "(:name IS NULL OR a.name LIKE %:name%) AND " +
           "(:typeId IS NULL OR a.type.id = :typeId) AND " +
           "(:status IS NULL OR a.status = :status)")
    Page<Asset> searchAssets(@Param("name") String name,
                             @Param("typeId") Long typeId,
                             @Param("status") Asset.AssetStatus status,
                             Pageable pageable);
    
    List<Asset> findByIsDeletedFalse();
    
    @Query("SELECT a FROM Asset a WHERE a.isDeleted = false ORDER BY a.createdAt DESC")
    List<Asset> findAllActive();
}
