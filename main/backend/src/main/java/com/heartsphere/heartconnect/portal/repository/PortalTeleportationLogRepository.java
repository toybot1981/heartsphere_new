package com.heartsphere.heartconnect.portal.repository;

import com.heartsphere.heartconnect.portal.entity.PortalTeleportationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 传送门传送记录Repository
 */
@Repository
public interface PortalTeleportationLogRepository extends JpaRepository<PortalTeleportationLog, Long> {
    
    /**
     * 根据传送门ID查询传送记录
     */
    List<PortalTeleportationLog> findByPortalIdOrderByTeleportedAtDesc(Long portalId);
    
    /**
     * 根据访问者ID查询传送记录
     */
    List<PortalTeleportationLog> findByVisitorIdOrderByTeleportedAtDesc(Long visitorId);
    
    /**
     * 根据传送门ID和访问者ID查询传送记录
     */
    List<PortalTeleportationLog> findByPortalIdAndVisitorIdOrderByTeleportedAtDesc(Long portalId, Long visitorId);
    
    /**
     * 统计传送门的传送次数
     */
    @Query("SELECT COUNT(l) FROM PortalTeleportationLog l WHERE l.portalId = :portalId AND l.status = 'SUCCESS'")
    long countSuccessfulTeleportationsByPortalId(@Param("portalId") Long portalId);
    
    /**
     * 统计用户在指定时间范围内的传送次数
     */
    @Query("SELECT COUNT(l) FROM PortalTeleportationLog l WHERE l.visitorId = :visitorId AND l.teleportedAt >= :startTime AND l.status = 'SUCCESS'")
    long countTeleportationsByVisitorIdAndTimeRange(@Param("visitorId") Long visitorId, @Param("startTime") LocalDateTime startTime);
    
    /**
     * 查询指定时间范围内的传送记录
     */
    @Query("SELECT l FROM PortalTeleportationLog l WHERE l.teleportedAt >= :startTime AND l.teleportedAt <= :endTime ORDER BY l.teleportedAt DESC")
    List<PortalTeleportationLog> findByTimeRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}
