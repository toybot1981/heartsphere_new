package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.AIModelConfigDTO;
import com.heartsphere.admin.service.AIModelConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 计费管理 - 模型管理控制器（已废弃，重定向到模型配置服务）
 * 注意：此控制器现在返回 ai_model_config 的数据，而不是 ai_models
 * 
 * @deprecated 请使用 /api/admin/ai-config/models 接口
 */
@RestController
@RequestMapping("/api/admin/billing/models")
@Deprecated
public class AdminBillingModelController extends BaseAdminController {

    @Autowired
    private AIModelConfigService modelConfigService;

    /**
     * 获取所有模型（从 ai_model_config 获取）
     */
    @GetMapping
    public ResponseEntity<List<AIModelConfigDTO>> getAllModels(
            @RequestParam(required = false) String provider,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        List<AIModelConfigDTO> models = modelConfigService.getAllModelConfigs();
        
        // 如果指定了provider，进行过滤
        if (provider != null && !provider.isEmpty()) {
            String providerUpper = provider.toUpperCase();
            models = models.stream()
                    .filter(model -> model.getProvider().equalsIgnoreCase(providerUpper))
                    .toList();
        }
        
        return ResponseEntity.ok(models);
    }

    /**
     * 根据ID获取模型（从 ai_model_config 获取）
     */
    @GetMapping("/{id}")
    public ResponseEntity<AIModelConfigDTO> getModelById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        AIModelConfigDTO modelConfig = modelConfigService.getModelConfigById(id);
        if (modelConfig != null) {
            return ResponseEntity.ok(modelConfig);
        }
        return ResponseEntity.notFound().build();
    }
}

