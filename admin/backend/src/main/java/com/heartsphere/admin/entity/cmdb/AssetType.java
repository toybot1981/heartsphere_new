package com.heartsphere.admin.entity.cmdb;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 资产类型实体
 */
@Data
@Entity
@Table(name = "cmdb_asset_types", indexes = {
    @Index(name = "idx_code", columnList = "code")
})
public class AssetType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;
    
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "icon", length = 200)
    private String icon;
    
    @Column(name = "attributes_schema", columnDefinition = "JSON")
    private String attributesSchema; // JSON格式的属性模式定义
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
