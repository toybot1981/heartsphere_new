package com.heartsphere.admin.repository.cmdb;

import com.heartsphere.admin.entity.cmdb.Asset;
import com.heartsphere.admin.entity.cmdb.AssetAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 资产审计日志Repository
 */
@Repository
public interface AssetAuditLogRepository extends JpaRepository<AssetAuditLog, Long> {
    
    Page<AssetAuditLog> findByAssetOrderByCreatedAtDesc(Asset asset, Pageable pageable);
    
    @Query("SELECT l FROM AssetAuditLog l WHERE " +
           "(:assetId IS NULL OR l.asset.id = :assetId) AND " +
           "(:operation IS NULL OR l.operation = :operation) AND " +
           "(:operatorId IS NULL OR l.operatorId = :operatorId) AND " +
           "l.createdAt >= :startTime AND l.createdAt <= :endTime " +
           "ORDER BY l.createdAt DESC")
    Page<AssetAuditLog> searchAuditLogs(
            @Param("assetId") Long assetId,
            @Param("operation") String operation,
            @Param("operatorId") Long operatorId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable);
    
    @Query("SELECT l FROM AssetAuditLog l WHERE l.createdAt >= :startTime AND l.createdAt <= :endTime " +
           "ORDER BY l.createdAt DESC")
    List<AssetAuditLog> findByTimeRange(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
