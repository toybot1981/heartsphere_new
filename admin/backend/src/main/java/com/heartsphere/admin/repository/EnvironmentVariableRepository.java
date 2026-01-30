package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.EnvironmentVariable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 环境变量仓库
 */
@Repository
public interface EnvironmentVariableRepository extends JpaRepository<EnvironmentVariable, Long> {
    
    /**
     * 根据名称和作用域查找
     */
    @Query("SELECT e FROM EnvironmentVariable e WHERE e.name = :name AND e.scope = :scope " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:module IS NULL OR e.module = :module) " +
           "AND (:pipelineId IS NULL OR e.pipelineId = :pipelineId)")
    Optional<EnvironmentVariable> findByNameAndScope(
        @Param("name") String name,
        @Param("scope") EnvironmentVariable.Scope scope,
        @Param("project") String project,
        @Param("module") String module,
        @Param("pipelineId") Long pipelineId
    );
    
    /**
     * 根据作用域查找所有变量
     */
    @Query("SELECT e FROM EnvironmentVariable e WHERE e.scope = :scope " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:module IS NULL OR e.module = :module) " +
           "AND (:pipelineId IS NULL OR e.pipelineId = :pipelineId) " +
           "AND (:environment IS NULL OR e.environment = :environment)")
    List<EnvironmentVariable> findByScope(
        @Param("scope") EnvironmentVariable.Scope scope,
        @Param("project") String project,
        @Param("module") String module,
        @Param("pipelineId") Long pipelineId,
        @Param("environment") String environment
    );
    
    /**
     * 查找全局变量
     */
    List<EnvironmentVariable> findByScopeAndEnvironment(
        EnvironmentVariable.Scope scope,
        String environment
    );
    
    /**
     * 查找项目级变量
     */
    List<EnvironmentVariable> findByScopeAndProjectAndEnvironment(
        EnvironmentVariable.Scope scope,
        String project,
        String environment
    );
    
    /**
     * 查找模块级变量
     */
    List<EnvironmentVariable> findByScopeAndProjectAndModuleAndEnvironment(
        EnvironmentVariable.Scope scope,
        String project,
        String module,
        String environment
    );
    
    /**
     * 查找流程级变量
     */
    List<EnvironmentVariable> findByScopeAndPipelineIdAndEnvironment(
        EnvironmentVariable.Scope scope,
        Long pipelineId,
        String environment
    );
    
    /**
     * 检查变量名是否存在（用于冲突检测）
     */
    boolean existsByName(String name);
}
