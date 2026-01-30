package com.heartsphere.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.dto.*;
import com.heartsphere.admin.entity.*;
import com.heartsphere.admin.repository.*;
import com.heartsphere.shared.exception.ResourceNotFoundException;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 部署流程管理服务
 */
@Service
public class DeploymentPipelineService {
    
    private static final Logger logger = LoggerFactory.getLogger(DeploymentPipelineService.class);
    
    @Autowired
    private DeploymentPipelineRepository pipelineRepository;
    
    @Autowired
    private PipelineStepRepository stepRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private EntityManager entityManager;
    
    /**
     * 获取所有流程模板
     */
    @Transactional(readOnly = true)
    public List<DeploymentPipelineDTO> getAllPipelines() {
        try {
            // 使用 JOIN FETCH 立即加载 steps，避免 LazyInitializationException
            List<DeploymentPipeline> pipelines = pipelineRepository.findAllWithSteps();
            // 在事务内触发 steps 加载，确保所有延迟加载的集合都已初始化
            // 同时访问 steps 的每个元素，确保集合完全初始化
            pipelines.forEach(p -> {
                if (p.getSteps() != null) {
                    int size = p.getSteps().size(); // 触发延迟加载
                    // 访问每个步骤，确保集合完全初始化
                    p.getSteps().forEach(step -> {
                        step.getId(); // 触发步骤的延迟加载属性
                    });
                    logger.info("Pipeline {} has {} steps", p.getId(), size);
                } else {
                    logger.warn("Pipeline {} has null steps", p.getId());
                }
            });
            return pipelines.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("获取流程模板列表失败", e);
            // 如果表不存在，返回空列表而不是抛出异常
            if (e.getMessage() != null && e.getMessage().contains("doesn't exist")) {
                logger.warn("数据库表不存在，返回空列表。请执行 SQL 脚本创建表: sql/create_pipeline_tables.sql");
                return new java.util.ArrayList<>();
            }
            throw e;
        }
    }
    
    /**
     * 根据环境获取流程模板
     */
    @Transactional(readOnly = true)
    public List<DeploymentPipelineDTO> getPipelinesByEnvironment(String environment) {
        try {
            // 使用 JOIN FETCH 立即加载 steps，避免 LazyInitializationException
            List<DeploymentPipeline> pipelines = pipelineRepository.findByEnvironmentWithSteps(environment);
            // 在事务内触发 steps 加载，确保所有延迟加载的集合都已初始化
            pipelines.forEach(p -> {
                if (p.getSteps() != null) {
                    int size = p.getSteps().size(); // 触发延迟加载
                    // 访问每个步骤，确保集合完全初始化
                    p.getSteps().forEach(step -> {
                        step.getId(); // 触发步骤的延迟加载属性
                    });
                    logger.info("Pipeline {} has {} steps", p.getId(), size);
                } else {
                    logger.warn("Pipeline {} has null steps", p.getId());
                }
            });
            return pipelines.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("根据环境获取流程模板失败", e);
            // 如果表不存在，返回空列表而不是抛出异常
            if (e.getMessage() != null && e.getMessage().contains("doesn't exist")) {
                logger.warn("数据库表不存在，返回空列表。请执行 SQL 脚本创建表: sql/create_pipeline_tables.sql");
                return new java.util.ArrayList<>();
            }
            throw e;
        }
    }
    
    /**
     * 根据项目获取流程模板
     */
    @Transactional(readOnly = true)
    public List<DeploymentPipelineDTO> getPipelinesByProject(String project) {
        try {
            // 使用 JOIN FETCH 立即加载 steps，避免 LazyInitializationException
            List<DeploymentPipeline> pipelines = pipelineRepository.findByProjectWithSteps(project);
            // 在事务内触发 steps 加载，确保所有延迟加载的集合都已初始化
            pipelines.forEach(p -> {
                if (p.getSteps() != null) {
                    int size = p.getSteps().size(); // 触发延迟加载
                    // 访问每个步骤，确保集合完全初始化
                    p.getSteps().forEach(step -> {
                        step.getId(); // 触发步骤的延迟加载属性
                    });
                    logger.info("Pipeline {} has {} steps", p.getId(), size);
                } else {
                    logger.warn("Pipeline {} has null steps", p.getId());
                }
            });
            return pipelines.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("根据项目获取流程模板失败: {}", project, e);
            // 如果表不存在，返回空列表而不是抛出异常
            if (e.getMessage() != null && e.getMessage().contains("doesn't exist")) {
                logger.warn("数据库表不存在，返回空列表。请执行 SQL 脚本创建表: sql/create_pipeline_tables.sql");
                return new java.util.ArrayList<>();
            }
            throw e;
        }
    }
    
    /**
     * 根据项目和环境获取流程模板
     */
    @Transactional(readOnly = true)
    public List<DeploymentPipelineDTO> getPipelinesByProjectAndEnvironment(String project, String environment) {
        try {
            // 使用 JOIN FETCH 立即加载 steps，避免 LazyInitializationException
            List<DeploymentPipeline> pipelines = pipelineRepository.findByProjectAndEnvironmentWithSteps(project, environment);
            // 在事务内触发 steps 加载，确保所有延迟加载的集合都已初始化
            pipelines.forEach(p -> {
                if (p.getSteps() != null) {
                    int size = p.getSteps().size(); // 触发延迟加载
                    // 访问每个步骤，确保集合完全初始化
                    p.getSteps().forEach(step -> {
                        step.getId(); // 触发步骤的延迟加载属性
                    });
                    logger.info("Pipeline {} has {} steps", p.getId(), size);
                } else {
                    logger.warn("Pipeline {} has null steps", p.getId());
                }
            });
            return pipelines.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("根据项目和环境获取流程模板失败: project={}, environment={}", project, environment, e);
            // 如果表不存在，返回空列表而不是抛出异常
            if (e.getMessage() != null && e.getMessage().contains("doesn't exist")) {
                logger.warn("数据库表不存在，返回空列表。请执行 SQL 脚本创建表: sql/create_pipeline_tables.sql");
                return new java.util.ArrayList<>();
            }
            throw e;
        }
    }
    
    /**
     * 获取流程模板详情
     */
    @Transactional(readOnly = true)
    public DeploymentPipelineDTO getPipeline(Long pipelineId) {
        try {
            // 使用 JOIN FETCH 立即加载 steps，避免 LazyInitializationException
            DeploymentPipeline pipeline = pipelineRepository.findByIdWithSteps(pipelineId)
                    .orElseThrow(() -> new com.heartsphere.shared.exception.ResourceNotFoundException("流程模板不存在: " + pipelineId));
            // 在事务内触发 steps 加载，确保所有延迟加载的集合都已初始化
            if (pipeline.getSteps() != null) {
                int size = pipeline.getSteps().size(); // 触发延迟加载
                // 访问每个步骤，确保集合完全初始化
                pipeline.getSteps().forEach(step -> {
                    step.getId(); // 触发步骤的延迟加载属性
                });
                logger.info("Pipeline {} has {} steps", pipelineId, size);
            } else {
                logger.warn("Pipeline {} has null steps", pipelineId);
            }
            return toDTO(pipeline);
        } catch (Exception e) {
            logger.error("获取流程模板详情失败: {}", pipelineId, e);
            // 如果表不存在，抛出更友好的错误
            if (e.getMessage() != null && e.getMessage().contains("doesn't exist")) {
                throw new RuntimeException("数据库表不存在，请执行 SQL 脚本创建表: sql/create_pipeline_tables.sql");
            }
            throw e;
        }
    }
    
    /**
     * 创建流程模板
     */
    @Transactional
    public DeploymentPipelineDTO createPipeline(DeploymentPipelineDTO dto, SystemAdmin admin) {
        DeploymentPipeline pipeline = new DeploymentPipeline();
        pipeline.setName(dto.getName());
        pipeline.setDescription(dto.getDescription());
        pipeline.setEnvironment(dto.getEnvironment());
        pipeline.setIsTemplate(dto.getIsTemplate() != null ? dto.getIsTemplate() : true);
        pipeline.setCreatedBy(admin);
        
        DeploymentPipeline savedPipeline = pipelineRepository.save(pipeline);
        final Long pipelineId = savedPipeline.getId();
        
        // 保存步骤
        if (dto.getSteps() != null && !dto.getSteps().isEmpty()) {
            for (PipelineStepDTO stepDTO : dto.getSteps()) {
                PipelineStep step = new PipelineStep();
                step.setPipeline(savedPipeline);
                step.setName(stepDTO.getName());
                step.setScriptId(stepDTO.getScriptId());
                step.setOrder(stepDTO.getOrder());
                step.setParallel(stepDTO.getParallel() != null ? stepDTO.getParallel() : false);
                step.setRequired(stepDTO.getRequired() != null ? stepDTO.getRequired() : true);
                step.setCondition(stepDTO.getCondition());
                
                // 序列化依赖和参数
                if (stepDTO.getDependsOn() != null) {
                    try {
                        step.setDependsOn(objectMapper.writeValueAsString(stepDTO.getDependsOn()));
                    } catch (Exception e) {
                        logger.warn("Failed to serialize dependsOn", e);
                    }
                }
                
                if (stepDTO.getParameters() != null) {
                    try {
                        step.setParameters(objectMapper.writeValueAsString(stepDTO.getParameters()));
                    } catch (Exception e) {
                        logger.warn("Failed to serialize parameters", e);
                    }
                }
                
                stepRepository.save(step);
            }
            // 刷新步骤仓库以确保步骤已保存到数据库
            stepRepository.flush();
        }
        
        // 刷新所有更改到数据库
        pipelineRepository.flush();
        stepRepository.flush();
        
        // 清除 EntityManager 缓存，确保重新查询时获取最新数据
        entityManager.clear();
        
        // 重新加载以获取关联的步骤（使用新的查询绕过 Hibernate 一级缓存）
        DeploymentPipeline pipelineWithSteps = pipelineRepository.findByIdWithSteps(pipelineId)
                .orElseThrow(() -> new ResourceNotFoundException("流程模板不存在: " + pipelineId));
        
        // 确保步骤已加载
        if (pipelineWithSteps.getSteps() != null) {
            int size = pipelineWithSteps.getSteps().size();
            logger.info("Pipeline {} loaded with {} steps", pipelineId, size);
        } else {
            logger.warn("Pipeline {} loaded with null steps", pipelineId);
        }
        
        return toDTO(pipelineWithSteps);
    }
    
    /**
     * 更新流程模板
     */
    @Transactional
    public DeploymentPipelineDTO updatePipeline(Long pipelineId, DeploymentPipelineDTO dto, SystemAdmin admin) {
        DeploymentPipeline pipeline = pipelineRepository.findById(pipelineId)
                    .orElseThrow(() -> new ResourceNotFoundException("流程模板不存在: " + pipelineId));
        
        pipeline.setName(dto.getName());
        pipeline.setDescription(dto.getDescription());
        pipeline.setEnvironment(dto.getEnvironment());
        pipeline.setProject(dto.getProject() != null ? dto.getProject() : "");
        pipeline.setIsTemplate(dto.getIsTemplate() != null ? dto.getIsTemplate() : true);
        
        // 删除旧步骤
        stepRepository.deleteByPipelineId(pipelineId);
        
        // 保存新步骤
        if (dto.getSteps() != null) {
            for (PipelineStepDTO stepDTO : dto.getSteps()) {
                PipelineStep step = new PipelineStep();
                step.setPipeline(pipeline);
                step.setName(stepDTO.getName());
                step.setScriptId(stepDTO.getScriptId());
                step.setOrder(stepDTO.getOrder());
                step.setParallel(stepDTO.getParallel() != null ? stepDTO.getParallel() : false);
                step.setRequired(stepDTO.getRequired() != null ? stepDTO.getRequired() : true);
                step.setCondition(stepDTO.getCondition());
                
                if (stepDTO.getDependsOn() != null) {
                    try {
                        step.setDependsOn(objectMapper.writeValueAsString(stepDTO.getDependsOn()));
                    } catch (Exception e) {
                        logger.warn("Failed to serialize dependsOn", e);
                    }
                }
                
                if (stepDTO.getParameters() != null) {
                    try {
                        step.setParameters(objectMapper.writeValueAsString(stepDTO.getParameters()));
                    } catch (Exception e) {
                        logger.warn("Failed to serialize parameters", e);
                    }
                }
                
                stepRepository.save(step);
            }
        }
        
        pipeline = pipelineRepository.save(pipeline);
        pipeline = pipelineRepository.findById(pipeline.getId()).orElse(pipeline);
        return toDTO(pipeline);
    }
    
    /**
     * 删除流程模板
     */
    @Transactional
    public void deletePipeline(Long pipelineId) {
        if (!pipelineRepository.existsById(pipelineId)) {
            throw new RuntimeException("流程模板不存在: " + pipelineId);
        }
        stepRepository.deleteByPipelineId(pipelineId);
        pipelineRepository.deleteById(pipelineId);
    }
    
    /**
     * 获取流程实体（供执行引擎使用）
     */
    @Transactional(readOnly = true)
    public DeploymentPipeline getPipelineEntity(Long pipelineId) {
        // 使用 JOIN FETCH 立即加载 steps，避免 LazyInitializationException
        return pipelineRepository.findByIdWithSteps(pipelineId)
                    .orElseThrow(() -> new ResourceNotFoundException("流程模板不存在: " + pipelineId));
    }
    
    /**
     * 转换为DTO
     */
    private DeploymentPipelineDTO toDTO(DeploymentPipeline pipeline) {
        DeploymentPipelineDTO dto = new DeploymentPipelineDTO();
        dto.setId(pipeline.getId());
        dto.setName(pipeline.getName());
        dto.setDescription(pipeline.getDescription());
        dto.setEnvironment(pipeline.getEnvironment());
        dto.setProject(pipeline.getProject()); // 添加 project 字段
        dto.setIsTemplate(pipeline.getIsTemplate());
        dto.setCreatedById(pipeline.getCreatedBy() != null ? pipeline.getCreatedBy().getId() : null);
        dto.setCreatedByUsername(pipeline.getCreatedBy() != null ? pipeline.getCreatedBy().getUsername() : null);
        dto.setCreatedAt(pipeline.getCreatedAt());
        dto.setUpdatedAt(pipeline.getUpdatedAt());
        
        // 转换步骤
        if (pipeline.getSteps() != null && !pipeline.getSteps().isEmpty()) {
            dto.setSteps(pipeline.getSteps().stream()
                    .map(this::stepToDTO)
                    .collect(Collectors.toList()));
        } else {
            // 确保 steps 字段不为 null（返回空列表）
            dto.setSteps(java.util.Collections.emptyList());
        }
        
        return dto;
    }
    
    /**
     * 步骤转换为DTO
     */
    private PipelineStepDTO stepToDTO(PipelineStep step) {
        PipelineStepDTO dto = new PipelineStepDTO();
        dto.setId(step.getId());
        dto.setPipelineId(step.getPipeline() != null ? step.getPipeline().getId() : null);
        dto.setName(step.getName());
        dto.setScriptId(step.getScriptId());
        dto.setOrder(step.getOrder());
        dto.setParallel(step.getParallel());
        dto.setRequired(step.getRequired());
        dto.setCondition(step.getCondition());
        
        // 反序列化依赖
        if (step.getDependsOn() != null) {
            try {
                List<Integer> dependsOn = objectMapper.readValue(step.getDependsOn(), 
                        new TypeReference<List<Integer>>() {});
                dto.setDependsOn(dependsOn);
            } catch (Exception e) {
                logger.warn("Failed to deserialize dependsOn", e);
            }
        }
        
        // 反序列化参数
        if (step.getParameters() != null) {
            try {
                Map<String, Object> parameters = objectMapper.readValue(step.getParameters(), 
                        new TypeReference<Map<String, Object>>() {});
                dto.setParameters(parameters);
            } catch (Exception e) {
                logger.warn("Failed to deserialize parameters", e);
            }
        }
        
        return dto;
    }
}
