package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.EnvironmentVariableDTO;
import com.heartsphere.admin.dto.EnvironmentVariableTemplateDTO;
import com.heartsphere.admin.entity.EnvironmentVariable;
import com.heartsphere.admin.entity.EnvironmentVariableTemplate;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.repository.EnvironmentVariableRepository;
import com.heartsphere.admin.repository.EnvironmentVariableTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 环境变量服务
 */
@Service
public class EnvironmentVariableService {
    
    private static final Logger logger = LoggerFactory.getLogger(EnvironmentVariableService.class);
    
    @Autowired
    private EnvironmentVariableRepository envVarRepository;
    
    @Autowired
    private EnvironmentVariableTemplateRepository templateRepository;
    
    /**
     * 创建环境变量
     */
    @Transactional
    public EnvironmentVariableDTO createVariable(EnvironmentVariableDTO dto, SystemAdmin admin) {
        // 验证变量名
        validateVariableName(dto.getName());
        
        EnvironmentVariable variable = new EnvironmentVariable();
        variable.setName(dto.getName());
        variable.setValue(dto.getValue());
        variable.setScope(dto.getScope());
        variable.setProject(dto.getProject());
        variable.setModule(dto.getModule());
        variable.setPipelineId(dto.getPipelineId());
        variable.setEnvironment(dto.getEnvironment());
        variable.setSensitive(dto.getSensitive() != null ? dto.getSensitive() : false);
        variable.setDescription(dto.getDescription());
        variable.setValidationRule(dto.getValidationRule());
        variable.setCreatedBy(admin.getUsername());
        
        variable = envVarRepository.save(variable);
        return toDTO(variable, false);
    }
    
    /**
     * 更新环境变量
     */
    @Transactional
    public EnvironmentVariableDTO updateVariable(Long id, EnvironmentVariableDTO dto, SystemAdmin admin) {
        EnvironmentVariable variable = envVarRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("环境变量不存在"));
        
        variable.setValue(dto.getValue());
        variable.setEnvironment(dto.getEnvironment());
        variable.setSensitive(dto.getSensitive() != null ? dto.getSensitive() : false);
        variable.setDescription(dto.getDescription());
        variable.setValidationRule(dto.getValidationRule());
        
        variable = envVarRepository.save(variable);
        return toDTO(variable, false);
    }
    
    /**
     * 删除环境变量
     */
    @Transactional
    public void deleteVariable(Long id) {
        envVarRepository.deleteById(id);
    }
    
    /**
     * 获取环境变量（按作用域解析）
     */
    public Map<String, String> resolveVariables(String project, String module, Long pipelineId, String environment) {
        Map<String, String> variables = new LinkedHashMap<>();
        
        // 按优先级顺序解析：GLOBAL -> PROJECT -> MODULE -> PIPELINE
        // 1. 全局变量
        List<EnvironmentVariable> globalVars = envVarRepository.findByScopeAndEnvironment(
            EnvironmentVariable.Scope.GLOBAL, environment);
        globalVars.forEach(v -> variables.put(v.getName(), v.getValue()));
        
        // 2. 项目级变量
        if (project != null && !project.isEmpty()) {
            List<EnvironmentVariable> projectVars = envVarRepository.findByScopeAndProjectAndEnvironment(
                EnvironmentVariable.Scope.PROJECT, project, environment);
            projectVars.forEach(v -> variables.put(v.getName(), v.getValue()));
        }
        
        // 3. 模块级变量
        if (module != null && !module.isEmpty()) {
            List<EnvironmentVariable> moduleVars = envVarRepository.findByScopeAndProjectAndModuleAndEnvironment(
                EnvironmentVariable.Scope.MODULE, project, module, environment);
            moduleVars.forEach(v -> variables.put(v.getName(), v.getValue()));
        }
        
        // 4. 流程级变量（最高优先级）
        if (pipelineId != null) {
            List<EnvironmentVariable> pipelineVars = envVarRepository.findByScopeAndPipelineIdAndEnvironment(
                EnvironmentVariable.Scope.PIPELINE, pipelineId, environment);
            pipelineVars.forEach(v -> variables.put(v.getName(), v.getValue()));
        }
        
        return variables;
    }
    
    /**
     * 验证变量名
     */
    private void validateVariableName(String name) {
        if (name == null || name.isEmpty()) {
            throw new RuntimeException("变量名不能为空");
        }
        
        // 检查命名规范：HS_ 前缀，UPPER_SNAKE_CASE
        if (!name.matches("^HS_[A-Z][A-Z0-9_]*$")) {
            throw new RuntimeException("变量名必须符合命名规范：HS_ 前缀，UPPER_SNAKE_CASE（如：HS_DB_PASSWORD）");
        }
        
        // 检查系统保留变量
        String[] reservedVars = {"PATH", "HOME", "USER", "PWD", "SHELL", "JAVA_HOME", "MAVEN_HOME"};
        for (String reserved : reservedVars) {
            if (name.equals(reserved)) {
                throw new RuntimeException("变量名不能使用系统保留变量: " + reserved);
            }
        }
    }
    
    /**
     * 转换为 DTO
     */
    private EnvironmentVariableDTO toDTO(EnvironmentVariable variable, boolean showValue) {
        EnvironmentVariableDTO dto = new EnvironmentVariableDTO();
        dto.setId(variable.getId());
        dto.setName(variable.getName());
        dto.setValue(showValue || !variable.getSensitive() ? variable.getValue() : "****");
        dto.setScope(variable.getScope());
        dto.setProject(variable.getProject());
        dto.setModule(variable.getModule());
        dto.setPipelineId(variable.getPipelineId());
        dto.setEnvironment(variable.getEnvironment());
        dto.setSensitive(variable.getSensitive());
        dto.setDescription(variable.getDescription());
        dto.setValidationRule(variable.getValidationRule());
        dto.setCreatedAt(variable.getCreatedAt());
        dto.setUpdatedAt(variable.getUpdatedAt());
        dto.setCreatedBy(variable.getCreatedBy());
        dto.setShowValue(showValue);
        return dto;
    }
    
    /**
     * 获取所有变量
     */
    public List<EnvironmentVariableDTO> getAllVariables(String environment) {
        return envVarRepository.findAll().stream()
            .filter(v -> environment == null || environment.equals(v.getEnvironment()))
            .map(v -> toDTO(v, false))
            .collect(Collectors.toList());
    }
    
    /**
     * 获取变量详情
     */
    public EnvironmentVariableDTO getVariable(Long id, boolean showValue) {
        EnvironmentVariable variable = envVarRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("环境变量不存在"));
        return toDTO(variable, showValue);
    }
}
