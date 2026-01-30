package com.heartsphere.admin.entity.cmdb;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 资产关系实体
 */
@Data
@Entity
@Table(name = "cmdb_asset_relationships", indexes = {
    @Index(name = "idx_source_asset", columnList = "source_asset_id"),
    @Index(name = "idx_target_asset", columnList = "target_asset_id"),
    @Index(name = "idx_relationship_type", columnList = "relationship_type_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_source_target_type", columnNames = {"source_asset_id", "target_asset_id", "relationship_type_id"})
})
public class AssetRelationship {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_asset_id", nullable = false)
    private Asset sourceAsset;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_asset_id", nullable = false)
    private Asset targetAsset;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relationship_type_id", nullable = false)
    private RelationshipType relationshipType;
    
    @Column(name = "properties", columnDefinition = "JSON")
    private String properties; // JSON格式的关系属性
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
