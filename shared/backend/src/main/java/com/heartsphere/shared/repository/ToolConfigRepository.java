package com.heartsphere.shared.repository;

import com.heartsphere.shared.entity.ToolConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 工具配置 Repository
 */
@Repository
public interface ToolConfigRepository extends JpaRepository<ToolConfig, Long> {
    
    /**
     * 根据工具名称查找配置
     */
    Optional<ToolConfig> findByToolName(String toolName);
    
    /**
     * 根据分类查找所有启用的配置
     */
    List<ToolConfig> findByCategoryAndIsActiveTrue(String category);
    
    /**
     * 查找所有启用的配置
     */
    List<ToolConfig> findByIsActiveTrue();
    
    /**
     * 检查工具配置是否存在
     */
    boolean existsByToolName(String toolName);
}
