package com.heartsphere.admin.repository.cmdb;

import com.heartsphere.admin.entity.cmdb.Asset;
import com.heartsphere.admin.entity.cmdb.AssetHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 资产历史Repository
 */
@Repository
public interface AssetHistoryRepository extends JpaRepository<AssetHistory, Long> {
    
    List<AssetHistory> findByAssetOrderByTimestampDesc(Asset asset);
    
    Page<AssetHistory> findByAssetOrderByTimestampDesc(Asset asset, Pageable pageable);
    
    @Query("SELECT h FROM AssetHistory h WHERE h.asset = :asset AND " +
           "h.timestamp >= :startTime AND h.timestamp <= :endTime " +
           "ORDER BY h.timestamp DESC")
    List<AssetHistory> findByAssetAndTimeRange(
            @Param("asset") Asset asset,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT h FROM AssetHistory h WHERE h.action = :action AND " +
           "h.timestamp >= :startTime AND h.timestamp <= :endTime " +
           "ORDER BY h.timestamp DESC")
    List<AssetHistory> findByActionAndTimeRange(
            @Param("action") AssetHistory.ActionType action,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
