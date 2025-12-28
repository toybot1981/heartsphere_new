package com.heartsphere.admin.controller;

import com.heartsphere.admin.entity.AIModelConfig;
import com.heartsphere.admin.repository.AIModelConfigRepository;
import com.heartsphere.billing.entity.AIModelPricing;
import com.heartsphere.billing.repository.AIModelPricingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * 计费管理 - 资费配置管理控制器
 */
@RestController
@RequestMapping("/api/admin/billing/pricing")
public class AdminBillingPricingController extends BaseAdminController {

    @Autowired
    private AIModelPricingRepository pricingRepository;

    @Autowired
    private AIModelConfigRepository modelConfigRepository;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

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
        
        // 直接使用AIModelConfig的ID作为modelId
        Long configId = ((Number) request.get("modelId")).longValue();
        
        // 验证模型配置是否存在
        AIModelConfig modelConfig = modelConfigRepository.findById(configId)
                .orElseThrow(() -> new RuntimeException("模型配置不存在，ID: " + configId));
        
        AIModelPricing pricing = new AIModelPricing();
        pricing.setModelId(configId); // 直接使用configId
        
        // 获取定价类型
        String pricingType = (String) request.get("pricingType");
        pricing.setPricingType(pricingType);
        
        // 根据模型类型和定价类型自动设置计费单位
        String unit = determineUnit(modelConfig.getCapability(), pricingType, request);
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
     * 根据模型能力类型和定价类型确定计费单位
     * @param capability 模型能力类型：text, image, audio, video
     * @param pricingType 定价类型：input_token, output_token, image, audio_tts, video_second
     */
    private String determineUnit(String capability, String pricingType, Map<String, Object> request) {
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
        
        // 如果定价类型未指定，根据模型能力类型设置
        if ("image".equals(capability)) {
            return "per_image"; // 图像模型：按张计费
        } else if ("audio".equals(capability)) {
            return "per_minute"; // 音频模型：按分钟计费
        } else if ("video".equals(capability)) {
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
                    // 如果更新了modelId，需要验证模型配置是否存在
                    if (request.containsKey("modelId")) {
                        Long configId = ((Number) request.get("modelId")).longValue();
                        
                        // 验证模型配置是否存在
                        AIModelConfig modelConfig = modelConfigRepository.findById(configId)
                                .orElseThrow(() -> new RuntimeException("模型配置不存在，ID: " + configId));
                        pricing.setModelId(configId);
                        
                        // 如果更新了模型，且没有指定unit，根据新模型类型自动设置
                        if (!request.containsKey("unit")) {
                            String capability = modelConfig.getCapability();
                            String pricingType = pricing.getPricingType();
                            String unit = determineUnit(capability, pricingType, request);
                            pricing.setUnit(unit);
                        }
                    }
                    
                    if (request.containsKey("pricingType")) {
                        String newPricingType = (String) request.get("pricingType");
                        pricing.setPricingType(newPricingType);
                        
                        // 如果更新了定价类型，且没有指定unit，根据新定价类型自动设置
                        if (!request.containsKey("unit")) {
                            Long configId = pricing.getModelId();
                            AIModelConfig modelConfig = modelConfigRepository.findById(configId)
                                    .orElse(null);
                            String capability = modelConfig != null ? modelConfig.getCapability() : null;
                            String unit = determineUnit(capability, newPricingType, request);
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

