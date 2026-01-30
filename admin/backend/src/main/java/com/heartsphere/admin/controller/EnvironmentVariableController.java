package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.EnvironmentVariableDTO;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.service.EnvironmentVariableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 环境变量管理控制器
 */
@RestController
@RequestMapping("/api/admin/devops/environment-variables")
public class EnvironmentVariableController extends BaseAdminController {
    
    @Autowired
    private EnvironmentVariableService envVarService;
    
    /**
     * 获取所有环境变量
     */
    @GetMapping
    public ResponseEntity<List<EnvironmentVariableDTO>> getAllVariables(
        @RequestHeader("Authorization") String token,
        @RequestParam(required = false) String environment
    ) {
        SystemAdmin admin = validateAdminToken(token);
        List<EnvironmentVariableDTO> variables = envVarService.getAllVariables(environment);
        return ResponseEntity.ok(variables);
    }
    
    /**
     * 获取环境变量详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<EnvironmentVariableDTO> getVariable(
        @RequestHeader("Authorization") String token,
        @PathVariable Long id,
        @RequestParam(defaultValue = "false") boolean showValue
    ) {
        SystemAdmin admin = validateAdminToken(token);
        EnvironmentVariableDTO variable = envVarService.getVariable(id, showValue);
        return ResponseEntity.ok(variable);
    }
    
    /**
     * 创建环境变量
     */
    @PostMapping
    public ResponseEntity<EnvironmentVariableDTO> createVariable(
        @RequestHeader("Authorization") String token,
        @RequestBody EnvironmentVariableDTO dto
    ) {
        SystemAdmin admin = validateAdminToken(token);
        EnvironmentVariableDTO created = envVarService.createVariable(dto, admin);
        return ResponseEntity.ok(created);
    }
    
    /**
     * 更新环境变量
     */
    @PutMapping("/{id}")
    public ResponseEntity<EnvironmentVariableDTO> updateVariable(
        @RequestHeader("Authorization") String token,
        @PathVariable Long id,
        @RequestBody EnvironmentVariableDTO dto
    ) {
        SystemAdmin admin = validateAdminToken(token);
        EnvironmentVariableDTO updated = envVarService.updateVariable(id, dto, admin);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * 删除环境变量
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVariable(
        @RequestHeader("Authorization") String token,
        @PathVariable Long id
    ) {
        SystemAdmin admin = validateAdminToken(token);
        envVarService.deleteVariable(id);
        return ResponseEntity.ok().build();
    }
    
    /**
     * 解析环境变量（用于脚本执行）
     */
    @GetMapping("/resolve")
    public ResponseEntity<Map<String, String>> resolveVariables(
        @RequestHeader("Authorization") String token,
        @RequestParam(required = false) String project,
        @RequestParam(required = false) String module,
        @RequestParam(required = false) Long pipelineId,
        @RequestParam(required = false) String environment
    ) {
        SystemAdmin admin = validateAdminToken(token);
        Map<String, String> variables = envVarService.resolveVariables(project, module, pipelineId, environment);
        return ResponseEntity.ok(variables);
    }
}
