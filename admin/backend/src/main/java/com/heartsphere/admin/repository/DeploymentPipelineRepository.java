package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.DeploymentPipeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 部署流程模板Repository
 */
@Repository
public interface DeploymentPipelineRepository extends JpaRepository<DeploymentPipeline, Long> {
    
    /**
     * 根据环境查询流程模板
     */
    List<DeploymentPipeline> findByEnvironment(String environment);
    
    /**
     * 根据环境查询流程模板（立即加载 steps 和 createdBy）
     */
    @Query("SELECT DISTINCT p FROM DeploymentPipeline p " +
           "LEFT JOIN FETCH p.steps " +
           "LEFT JOIN FETCH p.createdBy " +
           "WHERE p.environment = :environment")
    List<DeploymentPipeline> findByEnvironmentWithSteps(@Param("environment") String environment);
    
    /**
     * 查询所有流程模板（立即加载 steps 和 createdBy）
     */
    @Query("SELECT DISTINCT p FROM DeploymentPipeline p " +
           "LEFT JOIN FETCH p.steps " +
           "LEFT JOIN FETCH p.createdBy")
    List<DeploymentPipeline> findAllWithSteps();
    
    /**
     * 根据ID查询流程模板（立即加载 steps 和 createdBy）
     */
    @Query("SELECT DISTINCT p FROM DeploymentPipeline p " +
           "LEFT JOIN FETCH p.steps " +
           "LEFT JOIN FETCH p.createdBy " +
           "WHERE p.id = :id")
    Optional<DeploymentPipeline> findByIdWithSteps(@Param("id") Long id);
    
    /**
     * 查询所有模板
     */
    List<DeploymentPipeline> findByIsTemplateTrue();
    
    /**
     * 根据创建者查询流程模板
     */
    List<DeploymentPipeline> findByCreatedById(Long createdById);
    
    /**
     * 根据项目查询流程模板（立即加载 steps 和 createdBy）
     */
    @Query("SELECT DISTINCT p FROM DeploymentPipeline p " +
           "LEFT JOIN FETCH p.steps " +
           "LEFT JOIN FETCH p.createdBy " +
           "WHERE p.project = :project OR p.project = '' OR p.project IS NULL")
    List<DeploymentPipeline> findByProjectWithSteps(@Param("project") String project);
    
    /**
     * 根据项目和环境查询流程模板（立即加载 steps 和 createdBy）
     */
    @Query("SELECT DISTINCT p FROM DeploymentPipeline p " +
           "LEFT JOIN FETCH p.steps " +
           "LEFT JOIN FETCH p.createdBy " +
           "WHERE (p.project = :project OR p.project = '' OR p.project IS NULL) " +
           "AND p.environment = :environment")
    List<DeploymentPipeline> findByProjectAndEnvironmentWithSteps(
            @Param("project") String project,
            @Param("environment") String environment);
}
