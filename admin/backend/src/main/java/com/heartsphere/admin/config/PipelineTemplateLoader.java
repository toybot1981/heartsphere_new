package com.heartsphere.admin.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.heartsphere.admin.dto.DeploymentPipelineDTO;
import com.heartsphere.admin.dto.PipelineStepDTO;
import com.heartsphere.admin.entity.DeploymentPipeline;
import com.heartsphere.admin.entity.PipelineStep;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.DeploymentPipelineRepository;
import com.heartsphere.admin.repository.PipelineStepRepository;
import com.heartsphere.admin.repository.SystemAdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.*;

/**
 * 流程模板加载器
 * 从YAML配置文件加载预定义流程模板并初始化到数据库
 */
@Component
public class PipelineTemplateLoader {
    
    private static final Logger logger = LoggerFactory.getLogger(PipelineTemplateLoader.class);
    
    @Autowired
    private DeploymentPipelineRepository pipelineRepository;
    
    @Autowired
    private PipelineStepRepository stepRepository;
    
    @Autowired
    private SystemAdminRepository adminRepository;
    
    private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());
    
    @PostConstruct
    public void loadTemplates() {
        try {
            // 检查数据库表是否存在
            try {
                pipelineRepository.count();
            } catch (Exception e) {
                if (e.getMessage() != null && e.getMessage().contains("doesn't exist")) {
                    logger.warn("数据库表不存在，跳过流程模板加载。请执行 SQL 脚本创建表: sql/create_pipeline_tables.sql");
                    return;
                }
                throw e;
            }
            
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath:pipelines/*.yml");
            
            // 获取系统管理员（用于创建模板）
            SystemAdmin systemAdmin = adminRepository.findByUsername("admin")
                    .orElse(adminRepository.findAll().stream().findFirst().orElse(null));
            
            if (systemAdmin == null) {
                logger.warn("No system admin found, skipping pipeline template loading");
                return;
            }
            
            for (Resource resource : resources) {
                try {
                    loadTemplate(resource, systemAdmin);
                } catch (Exception e) {
                    logger.error("Failed to load pipeline template: {}", resource.getFilename(), e);
                }
            }
            
            logger.info("Loaded {} pipeline templates", resources.length);
        } catch (Exception e) {
            logger.error("Failed to load pipeline templates", e);
        }
    }
    
    private void loadTemplate(Resource resource, SystemAdmin admin) throws Exception {
        InputStream inputStream = resource.getInputStream();
        Map<String, Object> config = yamlMapper.readValue(inputStream, Map.class);
        
        String name = (String) config.get("name");
        String description = (String) config.get("description");
        String environment = (String) config.get("environment");
        String project = (String) config.get("project"); // 获取项目字段，如果不存在则为 null
        
        // 检查是否已存在同名模板
        List<DeploymentPipeline> existing = Collections.emptyList();
        try {
            existing = pipelineRepository.findAll().stream()
                    .filter(p -> p.getName().equals(name) && p.getIsTemplate())
                    .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            logger.warn("Failed to query existing pipeline templates during loading: {}", e.getMessage());
            // 如果查询失败，假设不存在，继续尝试创建
        }
        
        if (!existing.isEmpty()) {
            logger.info("Pipeline template '{}' already exists, skipping", name);
            return;
        }
        
        // 创建流程模板
        DeploymentPipeline pipeline = new DeploymentPipeline();
        pipeline.setName(name);
        pipeline.setDescription(description);
        pipeline.setEnvironment(environment);
        pipeline.setProject(project != null ? project : ""); // 如果未指定项目，设置为空字符串（通用）
        pipeline.setIsTemplate(true);
        pipeline.setCreatedBy(admin);
        pipeline = pipelineRepository.save(pipeline);
        
        // 创建步骤
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> stepsList = (List<Map<String, Object>>) config.get("steps");
        
        if (stepsList != null) {
            for (Map<String, Object> stepMap : stepsList) {
                PipelineStep step = new PipelineStep();
                step.setPipeline(pipeline);
                step.setName((String) stepMap.get("name"));
                step.setScriptId((String) stepMap.get("scriptId"));
                step.setOrder(((Number) stepMap.get("order")).intValue());
                step.setRequired(stepMap.get("required") != null ? 
                        (Boolean) stepMap.get("required") : true);
                step.setParallel(stepMap.get("parallel") != null ? 
                        (Boolean) stepMap.get("parallel") : false);
                step.setCondition((String) stepMap.get("condition"));
                
                // 处理依赖
                if (stepMap.get("dependsOn") != null) {
                    @SuppressWarnings("unchecked")
                    List<Integer> dependsOn = (List<Integer>) stepMap.get("dependsOn");
                    step.setDependsOn(yamlMapper.writeValueAsString(dependsOn));
                }
                
                // 处理参数
                if (stepMap.get("parameters") != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> parameters = (Map<String, Object>) stepMap.get("parameters");
                    step.setParameters(yamlMapper.writeValueAsString(parameters));
                }
                
                stepRepository.save(step);
            }
        }
        
        logger.info("Loaded pipeline template: {}", name);
    }
}
