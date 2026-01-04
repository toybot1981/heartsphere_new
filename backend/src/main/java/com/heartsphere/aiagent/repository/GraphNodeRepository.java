package com.heartsphere.aiagent.repository;

import com.heartsphere.aiagent.entity.GraphNodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Graph节点Repository
 */
@Repository
public interface GraphNodeRepository extends JpaRepository<GraphNodeEntity, Long> {
    
    /**
     * 根据Graph ID查找所有节点
     */
    List<GraphNodeEntity> findByGraphId(Long graphId);
    
    /**
     * 根据Graph ID和节点ID查找节点
     */
    Optional<GraphNodeEntity> findByGraphIdAndNodeId(Long graphId, String nodeId);
    
    /**
     * 删除Graph的所有节点
     */
    void deleteByGraphId(Long graphId);
}
