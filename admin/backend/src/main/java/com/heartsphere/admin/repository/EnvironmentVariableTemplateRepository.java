package com.heartsphere.admin.repository;

import com.heartsphere.admin.entity.EnvironmentVariableTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 环境变量模板仓库
 */
@Repository
public interface EnvironmentVariableTemplateRepository extends JpaRepository<EnvironmentVariableTemplate, Long> {
    
    /**
     * 根据环境查找模板
     */
    List<EnvironmentVariableTemplate> findByEnvironment(String environment);
    
    /**
     * 根据作用域和环境查找模板
     */
    List<EnvironmentVariableTemplate> findByScopeAndEnvironment(
        EnvironmentVariableTemplate.Scope scope,
        String environment
    );
    
    /**
     * 查找项目级模板
     */
    List<EnvironmentVariableTemplate> findByScopeAndProjectAndEnvironment(
        EnvironmentVariableTemplate.Scope scope,
        String project,
        String environment
    );
    
    /**
     * 查找模块级模板
     */
    List<EnvironmentVariableTemplate> findByScopeAndProjectAndModuleAndEnvironment(
        EnvironmentVariableTemplate.Scope scope,
        String project,
        String module,
        String environment
    );
    
    /**
     * 查找默认模板
     */
    Optional<EnvironmentVariableTemplate> findByIsDefaultTrueAndEnvironment(String environment);
    
    /**
     * 根据名称查找
     */
    Optional<EnvironmentVariableTemplate> findByName(String name);
}
