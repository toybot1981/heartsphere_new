package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.AIModelConfigDTO;
import com.heartsphere.admin.dto.AIRoutingStrategyDTO;
import com.heartsphere.admin.service.AIModelConfigService;
import com.heartsphere.admin.service.AIRoutingStrategyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 管理员AI配置管理控制器
 * 只管理统一接入模式下的模型配置和路由策略
 */
@RestController
@RequestMapping("/api/admin/system/ai-config")
@CrossOrigin(origins = "*")
public class AdminAIConfigController extends BaseAdminController {
    
    @Autowired
    private AIModelConfigService modelConfigService;
    
    @Autowired
    private AIRoutingStrategyService routingStrategyService;
    
    // ========== 模型配置管理 ==========
    
    /**
     * 获取所有模型配置
     */
    @GetMapping("/models")
    public ResponseEntity<List<AIModelConfigDTO>> getAllModelConfigs(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(modelConfigService.getAllModelConfigs());
    }
    
    /**
     * 根据能力类型获取模型配置
     */
    @GetMapping("/models/{capability}")
    public ResponseEntity<List<AIModelConfigDTO>> getModelConfigsByCapability(
            @PathVariable String capability,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(modelConfigService.getModelConfigsByCapability(capability));
    }
    
    /**
     * 根据提供商和能力类型获取模型配置
     */
    @GetMapping("/models/{capability}/{provider}")
    public ResponseEntity<List<AIModelConfigDTO>> getModelConfigsByProviderAndCapability(
            @PathVariable String capability,
            @PathVariable String provider,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(modelConfigService.getModelConfigsByProviderAndCapability(provider, capability));
    }
    
    /**
     * 根据ID获取模型配置
     */
    @GetMapping("/models/id/{id}")
    public ResponseEntity<AIModelConfigDTO> getModelConfigById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(modelConfigService.getModelConfigById(id));
    }
    
    /**
     * 创建模型配置
     */
    @PostMapping("/models")
    public ResponseEntity<AIModelConfigDTO> createModelConfig(
            @RequestBody AIModelConfigDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(modelConfigService.createModelConfig(dto));
    }
    
    /**
     * 更新模型配置
     */
    @PutMapping("/models/{id}")
    public ResponseEntity<AIModelConfigDTO> updateModelConfig(
            @PathVariable Long id,
            @RequestBody AIModelConfigDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(modelConfigService.updateModelConfig(id, dto));
    }
    
    /**
     * 删除模型配置
     */
    @DeleteMapping("/models/{id}")
    public ResponseEntity<Void> deleteModelConfig(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        modelConfigService.deleteModelConfig(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * 设置模型为默认模型
     */
    @PutMapping("/models/{id}/set-default")
    public ResponseEntity<AIModelConfigDTO> setDefaultModel(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(modelConfigService.setDefaultModel(id));
    }
    
    // ========== 路由策略管理 ==========
    
    /**
     * 获取所有路由策略
     */
    @GetMapping("/routing-strategies")
    public ResponseEntity<List<AIRoutingStrategyDTO>> getAllStrategies(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(routingStrategyService.getAllStrategies());
    }
    
    /**
     * 根据能力类型获取路由策略
     */
    @GetMapping("/routing-strategies/{capability}")
    public ResponseEntity<AIRoutingStrategyDTO> getStrategyByCapability(
            @PathVariable String capability,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(routingStrategyService.getStrategyByCapability(capability));
    }
    
    /**
     * 创建或更新路由策略
     */
    @PostMapping("/routing-strategies")
    public ResponseEntity<AIRoutingStrategyDTO> saveStrategy(
            @RequestBody AIRoutingStrategyDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(routingStrategyService.saveStrategy(dto));
    }
    
    /**
     * 更新路由策略
     */
    @PutMapping("/routing-strategies/{id}")
    public ResponseEntity<AIRoutingStrategyDTO> updateStrategy(
            @PathVariable Long id,
            @RequestBody AIRoutingStrategyDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        // 使用saveStrategy方法，它会自动判断是创建还是更新
        return ResponseEntity.ok(routingStrategyService.saveStrategy(dto));
    }
    
    /**
     * 删除路由策略
     */
    @DeleteMapping("/routing-strategies/{id}")
    public ResponseEntity<Void> deleteStrategy(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        routingStrategyService.deleteStrategy(id);
        return ResponseEntity.noContent().build();
    }
}

