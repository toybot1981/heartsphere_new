package com.heartsphere.admin.repository.cmdb;

import com.heartsphere.admin.entity.cmdb.Asset;
import com.heartsphere.admin.entity.cmdb.AssetRelationship;
import com.heartsphere.admin.entity.cmdb.RelationshipType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 资产关系Repository
 */
@Repository
public interface AssetRelationshipRepository extends JpaRepository<AssetRelationship, Long> {
    
    List<AssetRelationship> findBySourceAssetAndIsActiveTrue(Asset sourceAsset);
    
    List<AssetRelationship> findByTargetAssetAndIsActiveTrue(Asset targetAsset);
    
    List<AssetRelationship> findBySourceAssetOrTargetAssetAndIsActiveTrue(Asset sourceAsset, Asset targetAsset);
    
    List<AssetRelationship> findByRelationshipTypeAndIsActiveTrue(RelationshipType relationshipType);
    
    @Query("SELECT ar FROM AssetRelationship ar WHERE " +
           "ar.isActive = true AND " +
           "(ar.sourceAsset = :asset OR ar.targetAsset = :asset)")
    List<AssetRelationship> findAllRelationshipsForAsset(@Param("asset") Asset asset);
    
    @Query("SELECT ar FROM AssetRelationship ar WHERE " +
           "ar.isActive = true AND " +
           "ar.sourceAsset = :sourceAsset AND " +
           "ar.relationshipType = :relationshipType")
    List<AssetRelationship> findBySourceAssetAndRelationshipType(
            @Param("sourceAsset") Asset sourceAsset,
            @Param("relationshipType") RelationshipType relationshipType);
}
