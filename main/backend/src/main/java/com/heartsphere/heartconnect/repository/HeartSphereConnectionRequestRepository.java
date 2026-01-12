package com.heartsphere.heartconnect.repository;

import com.heartsphere.heartconnect.entity.HeartSphereConnectionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 连接请求Repository
 */
@Repository
public interface HeartSphereConnectionRequestRepository extends JpaRepository<HeartSphereConnectionRequest, Long>, JpaSpecificationExecutor<HeartSphereConnectionRequest> {
    
    /**
     * 根据共享配置ID查找所有请求
     */
    List<HeartSphereConnectionRequest> findByShareConfigId(Long shareConfigId);
    
    /**
     * 根据请求者ID查找所有请求
     */
    List<HeartSphereConnectionRequest> findByRequesterId(Long requesterId);
    
    /**
     * 根据共享配置ID和请求状态查找
     */
    List<HeartSphereConnectionRequest> findByShareConfigIdAndRequestStatus(
            Long shareConfigId,
            HeartSphereConnectionRequest.RequestStatus requestStatus
    );
    
    /**
     * 根据共享配置ID和请求者ID查找
     */
    Optional<HeartSphereConnectionRequest> findByShareConfigIdAndRequesterId(
            Long shareConfigId,
            Long requesterId
    );
    
    /**
     * 统计待审批的请求数量
     */
    long countByShareConfigIdAndRequestStatus(
            Long shareConfigId,
            HeartSphereConnectionRequest.RequestStatus requestStatus
    );
    
    /**
     * 根据请求状态查找
     */
    List<HeartSphereConnectionRequest> findByRequestStatus(HeartSphereConnectionRequest.RequestStatus requestStatus);
}

