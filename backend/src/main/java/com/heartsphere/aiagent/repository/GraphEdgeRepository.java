package com.heartsphere.aiagent.repository;

import com.heartsphere.aiagent.entity.GraphEdgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Graph边Repository
 */
@Repository
public interface GraphEdgeRepository extends JpaRepository<GraphEdgeEntity, Long> {
    
    /**
     * 根据Graph ID查找所有边
     */
    List<GraphEdgeEntity> findByGraphId(Long graphId);
    
    /**
     * 根据源节点ID查找所有边
     */
    List<GraphEdgeEntity> findByGraphIdAndSourceNodeId(Long graphId, String sourceNodeId);
    
    /**
     * 根据目标节点ID查找所有边
     */
    List<GraphEdgeEntity> findByGraphIdAndTargetNodeId(Long graphId, String targetNodeId);
    
    /**
     * 删除Graph的所有边
     */
    void deleteByGraphId(Long graphId);
}
