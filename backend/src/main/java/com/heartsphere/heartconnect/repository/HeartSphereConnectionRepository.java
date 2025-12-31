package com.heartsphere.heartconnect.repository;

import com.heartsphere.heartconnect.entity.HeartSphereConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 连接记录Repository
 */
@Repository
public interface HeartSphereConnectionRepository extends JpaRepository<HeartSphereConnection, Long>, JpaSpecificationExecutor<HeartSphereConnection> {
    
    /**
     * 根据共享配置ID查找所有连接
     */
    List<HeartSphereConnection> findByShareConfigId(Long shareConfigId);
    
    /**
     * 根据访问者ID查找所有连接
     */
    List<HeartSphereConnection> findByVisitorId(Long visitorId);
    
    /**
     * 根据共享配置ID和访问者ID查找活跃连接
     */
    Optional<HeartSphereConnection> findByShareConfigIdAndVisitorIdAndConnectionStatus(
            Long shareConfigId,
            Long visitorId,
            HeartSphereConnection.ConnectionStatus connectionStatus
    );
    
    /**
     * 根据连接状态查找
     */
    List<HeartSphereConnection> findByConnectionStatus(HeartSphereConnection.ConnectionStatus connectionStatus);
    
    /**
     * 统计活跃连接数量
     */
    long countByShareConfigIdAndConnectionStatus(
            Long shareConfigId,
            HeartSphereConnection.ConnectionStatus connectionStatus
    );
}

