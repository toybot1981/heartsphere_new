package com.heartsphere.admin.controller;

import com.heartsphere.admin.entity.AIModelConfig;
import com.heartsphere.admin.repository.AIModelConfigRepository;
import com.heartsphere.billing.entity.AIModel;
import com.heartsphere.billing.entity.AIModelPricing;
import com.heartsphere.billing.repository.AIModelPricingRepository;
import com.heartsphere.billing.repository.AIModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 计费管理 - 资费配置管理控制器
 */
@RestController
@RequestMapping("/api/admin/billing/pricing")
public class AdminBillingPricingController extends BaseAdminController {

    @Autowired
    private AIModelPricingRepository pricingRepository;

    @Autowired
    private AIModelRepository modelRepository;

    @Autowired
    private AIModelConfigRepository modelConfigRepository;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;
    
    /**
     * 根据AIModelConfig的ID找到对应的AIModel的ID
     * 先尝试直接使用ID，如果不是AIModel的ID，则通过provider和modelName匹配
     */
    private Long findAIModelIdByConfigId(Long configId) {
        // 先尝试直接使用configId作为modelId（如果前端传递的就是AIModel的ID）
        Optional<AIModel> directModel = modelRepository.findById(configId);
        if (directModel.isPresent()) {
            return configId;
        }
        
        // 如果不是，则通过AIModelConfig查找对应的AIModel
        Optional<AIModelConfig> config = modelConfigRepository.findById(configId);
        if (config.isEmpty()) {
            throw new RuntimeException("模型配置不存在，ID: " + configId);
        }
        
        AIModelConfig modelConfig = config.get();
        String providerName = modelConfig.getProvider(); // doubao, gemini, openai等
        String modelName = modelConfig.getModelName(); // doubao-seedream-4.5等
        
        // 查找所有模型，通过provider name和model name/code匹配
        List<AIModel> allModels = modelRepository.findAll();
        for (AIModel model : allModels) {
            // 获取provider的name
            String modelProviderName = null;
            if (model.getProvider() != null) {
                // AIProvider的name字段
                modelProviderName = model.getProvider().getName();
            }
            
            // 匹配provider和model name/code
            if (providerName.equals(modelProviderName) && 
                (modelName.equals(model.getModelCode()) || modelName.equals(model.getModelName()))) {
                return model.getId();
            }
        }
        
        throw new RuntimeException("找不到对应的计费模型。配置ID: " + configId + 
            ", provider: " + providerName + ", modelName: " + modelName + 
            "。请确保该模型已在计费系统中注册。");
    }

    @GetMapping
    public ResponseEntity<List<AIModelPricing>> getAllPricing(
            @RequestParam(required = false) Long modelId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        if (modelId != null) {
            return ResponseEntity.ok(pricingRepository.findByModelId(modelId));
        }
        return ResponseEntity.ok(pricingRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AIModelPricing> getPricingById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return pricingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPricing(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        // 将AIModelConfig的ID转换为AIModel的ID
        Long configId = ((Number) request.get("modelId")).longValue();
        Long modelId = findAIModelIdByConfigId(configId);
        
        // 验证模型是否存在
        AIModel model = modelRepository.findById(modelId)
                .orElseThrow(() -> new RuntimeException("模型不存在，ID: " + modelId));
        
        AIModelPricing pricing = new AIModelPricing();
        pricing.setModelId(modelId);
        
        // 获取定价类型
        String pricingType = (String) request.get("pricingType");
        pricing.setPricingType(pricingType);
        
        // 根据模型类型和定价类型自动设置计费单位
        String unit = determineUnit(model.getModelType(), pricingType, request);
        pricing.setUnit(unit);
        
        Object unitPriceObj = request.get("unitPrice");
        if (unitPriceObj instanceof Number) {
            pricing.setUnitPrice(new BigDecimal(unitPriceObj.toString()));
        }
        
        if (request.containsKey("minChargeUnit")) {
            Object minChargeUnitObj = request.get("minChargeUnit");
            if (minChargeUnitObj instanceof Number) {
                pricing.setMinChargeUnit(new BigDecimal(minChargeUnitObj.toString()));
            }
        }
        
        if (request.containsKey("effectiveDate")) {
            String effectiveDateStr = (String) request.get("effectiveDate");
            pricing.setEffectiveDate(LocalDateTime.parse(effectiveDateStr, DATE_TIME_FORMATTER));
        } else {
            pricing.setEffectiveDate(LocalDateTime.now());
        }
        
        if (request.containsKey("expiryDate") && request.get("expiryDate") != null) {
            String expiryDateStr = (String) request.get("expiryDate");
            pricing.setExpiryDate(LocalDateTime.parse(expiryDateStr, DATE_TIME_FORMATTER));
        }
        
        if (request.containsKey("isActive")) {
            pricing.setIsActive((Boolean) request.get("isActive"));
        } else {
            pricing.setIsActive(true);
        }
        
        return ResponseEntity.ok(pricingRepository.save(pricing));
    }
    
    /**
     * 根据模型类型和定价类型确定计费单位
     */
    private String determineUnit(String modelType, String pricingType, Map<String, Object> request) {
        // 如果请求中已经指定了单位，优先使用
        if (request.containsKey("unit") && request.get("unit") != null) {
            String specifiedUnit = (String) request.get("unit");
            if (!specifiedUnit.trim().isEmpty()) {
                return specifiedUnit;
            }
        }
        
        // 根据定价类型自动设置（优先级最高）
        if ("image".equals(pricingType) || "image_generation".equals(pricingType)) {
            return "per_image"; // 图像生成：按张计费
        } else if ("audio_tts".equals(pricingType) || "audio_stt".equals(pricingType)) {
            return "per_minute"; // 音频TTS/STT：按分钟计费
        } else if ("video_generation".equals(pricingType)) {
            return "per_second"; // 视频生成：按秒计费
        } else if ("input_token".equals(pricingType) || "output_token".equals(pricingType)) {
            return "per_1k_tokens"; // 输入/输出token：每1K tokens
        }
        
        // 如果定价类型未指定，根据模型类型设置
        if ("image".equals(modelType)) {
            return "per_image"; // 图像模型：按张计费
        } else if ("audio".equals(modelType)) {
            return "per_minute"; // 音频模型：按分钟计费
        } else if ("video".equals(modelType)) {
            return "per_second"; // 视频模型：按秒计费
        }
        
        // 默认：每1K tokens（文本模型）
        return "per_1k_tokens";
    }

    @PutMapping("/{id}")
    public ResponseEntity<AIModelPricing> updatePricing(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        return pricingRepository.findById(id)
                .map(pricing -> {
                    // 如果更新了modelId，需要验证模型是否存在
                    if (request.containsKey("modelId")) {
                        // 将AIModelConfig的ID转换为AIModel的ID
                        Long configId = ((Number) request.get("modelId")).longValue();
                        Long newModelId = findAIModelIdByConfigId(configId);
                        
                        AIModel model = modelRepository.findById(newModelId)
                                .orElseThrow(() -> new RuntimeException("模型不存在，ID: " + newModelId));
                        pricing.setModelId(newModelId);
                        
                        // 如果更新了模型，且没有指定unit，根据新模型类型自动设置
                        if (!request.containsKey("unit")) {
                            String modelType = model.getModelType();
                            String pricingType = pricing.getPricingType();
                            String unit = determineUnit(modelType, pricingType, request);
                            pricing.setUnit(unit);
                        }
                    }
                    
                    if (request.containsKey("pricingType")) {
                        String newPricingType = (String) request.get("pricingType");
                        pricing.setPricingType(newPricingType);
                        
                        // 如果更新了定价类型，且没有指定unit，根据新定价类型自动设置
                        if (!request.containsKey("unit")) {
                            Long modelId = pricing.getModelId();
                            AIModel model = modelRepository.findById(modelId)
                                    .orElse(null);
                            String modelType = model != null ? model.getModelType() : null;
                            String unit = determineUnit(modelType, newPricingType, request);
                            pricing.setUnit(unit);
                        }
                    }
                    
                    if (request.containsKey("unitPrice")) {
                        Object unitPriceObj = request.get("unitPrice");
                        if (unitPriceObj instanceof Number) {
                            pricing.setUnitPrice(new BigDecimal(unitPriceObj.toString()));
                        }
                    }
                    
                    if (request.containsKey("unit")) {
                        pricing.setUnit((String) request.get("unit"));
                    }
                    
                    if (request.containsKey("minChargeUnit")) {
                        Object minChargeUnitObj = request.get("minChargeUnit");
                        if (minChargeUnitObj instanceof Number) {
                            pricing.setMinChargeUnit(new BigDecimal(minChargeUnitObj.toString()));
                        }
                    }
                    
                    if (request.containsKey("effectiveDate")) {
                        String effectiveDateStr = (String) request.get("effectiveDate");
                        pricing.setEffectiveDate(LocalDateTime.parse(effectiveDateStr, DATE_TIME_FORMATTER));
                    }
                    
                    if (request.containsKey("expiryDate")) {
                        Object expiryDateObj = request.get("expiryDate");
                        if (expiryDateObj == null) {
                            pricing.setExpiryDate(null);
                        } else {
                            String expiryDateStr = expiryDateObj.toString();
                            pricing.setExpiryDate(LocalDateTime.parse(expiryDateStr, DATE_TIME_FORMATTER));
                        }
                    }
                    
                    if (request.containsKey("isActive")) {
                        pricing.setIsActive((Boolean) request.get("isActive"));
                    }
                    
                    return ResponseEntity.ok(pricingRepository.save(pricing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePricing(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        if (pricingRepository.existsById(id)) {
            pricingRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

