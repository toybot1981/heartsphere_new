package com.heartsphere.aistudio.repository;

import com.heartsphere.aistudio.entity.AgentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Agent 数据访问层
 */
@Repository
public interface AgentRepository extends JpaRepository<AgentEntity, Long> {
    
    Optional<AgentEntity> findByAgentId(String agentId);
    
    boolean existsByAgentId(String agentId);
    
    void deleteByAgentId(String agentId);
}

