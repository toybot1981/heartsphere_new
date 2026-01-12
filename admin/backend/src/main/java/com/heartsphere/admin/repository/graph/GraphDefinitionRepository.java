package com.heartsphere.admin.repository.graph;

import com.heartsphere.admin.entity.graph.GraphDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Graph定义Repository
 */
@Repository
public interface GraphDefinitionRepository extends JpaRepository<GraphDefinition, Long> {
    
    /**
     * 查找所有启用的Graph定义
     */
    List<GraphDefinition> findByIsActiveTrue();
    
    /**
     * 根据名称查找Graph定义
     */
    Optional<GraphDefinition> findByName(String name);
    
    /**
     * 根据类型查找Graph定义
     */
    List<GraphDefinition> findByGraphType(String graphType);
}
