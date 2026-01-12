package com.heartsphere.admin.controller;

// TODO: PaymentConfig 模块尚未迁移到独立结构，暂时注释掉
// import com.heartsphere.payment.dto.PaymentConfigDTO;
// import com.heartsphere.payment.entity.PaymentConfig;
// import com.heartsphere.payment.service.PaymentConfigService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 管理员支付配置控制器
 * 
 * @deprecated 此 Controller 依赖于尚未迁移的 payment 模块，暂时禁用
 * TODO: 迁移 payment 模块到独立结构或共享模块后启用
 */
@RestController
@RequestMapping("/api/admin/payment/config")
@RequiredArgsConstructor
@Deprecated
public class AdminPaymentConfigController extends BaseAdminController {

    // TODO: 迁移 payment 模块后取消注释
    // private final PaymentConfigService paymentConfigService;

    /**
     * 获取所有支付配置
     * TODO: 迁移 payment 模块后启用
     */
    /*
    @GetMapping
    public ResponseEntity<List<PaymentConfigDTO>> getAllConfigs(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        List<PaymentConfig> configs = paymentConfigService.getAllConfigs();
        List<PaymentConfigDTO> dtos = configs.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    */
    
    @GetMapping
    public ResponseEntity<Map<String, String>> getAllConfigs(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(Map.of("message", "PaymentConfig 模块尚未迁移，此功能暂时不可用"));
    }

    /**
     * 根据支付类型获取配置
     * TODO: 迁移 payment 模块后启用
     */
    /*
    @GetMapping("/{paymentType}")
    public ResponseEntity<PaymentConfigDTO> getConfigByType(
            @PathVariable String paymentType,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        PaymentConfig config = paymentConfigService.getConfigByType(paymentType)
                .orElseThrow(() -> new RuntimeException("支付配置不存在: " + paymentType));
        return ResponseEntity.ok(toDTO(config));
    }
    */
    
    @GetMapping("/{paymentType}")
    public ResponseEntity<Map<String, String>> getConfigByType(
            @PathVariable String paymentType,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(Map.of("message", "PaymentConfig 模块尚未迁移，此功能暂时不可用"));
    }

    /**
     * 创建或更新支付配置
     * TODO: 迁移 payment 模块后启用
     */
    /*
    @PostMapping
    public ResponseEntity<PaymentConfigDTO> saveConfig(
            @RequestBody PaymentConfigRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);

        PaymentConfig config = new PaymentConfig();
        config.setPaymentType(request.getPaymentType());
        config.setAppId(request.getAppId());
        
        // 根据支付类型设置不同的参数
        if ("alipay".equals(request.getPaymentType())) {
            config.setMerchantPrivateKey(request.getMerchantPrivateKey());
            config.setAlipayPublicKey(request.getAlipayPublicKey());
            config.setGatewayUrl(request.getGatewayUrl());
            config.setSignType(request.getSignType() != null ? request.getSignType() : "RSA2");
            config.setCharset(request.getCharset() != null ? request.getCharset() : "UTF-8");
            config.setFormat(request.getFormat() != null ? request.getFormat() : "JSON");
            config.setReturnUrl(request.getReturnUrl());
        } else if ("wechat".equals(request.getPaymentType())) {
            config.setWechatMchId(request.getWechatMchId());
            config.setWechatApiKey(request.getWechatApiKey());
            config.setWechatApiV3Key(request.getWechatApiV3Key());
            config.setWechatCertSerialNo(request.getWechatCertSerialNo());
            config.setWechatPrivateKey(request.getWechatPrivateKey());
        }
        
        config.setNotifyUrl(request.getNotifyUrl());
        config.setIsEnabled(request.getIsEnabled() != null ? request.getIsEnabled() : false);
        config.setIsSandbox(request.getIsSandbox() != null ? request.getIsSandbox() : true);
        config.setDescription(request.getDescription());

        PaymentConfig saved = paymentConfigService.saveConfig(config);
        return ResponseEntity.ok(toDTO(saved));
    }
    */
    
    @PostMapping
    public ResponseEntity<Map<String, String>> saveConfig(
            @RequestBody PaymentConfigRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(Map.of("message", "PaymentConfig 模块尚未迁移，此功能暂时不可用"));
    }

    /**
     * 更新支付配置
     * TODO: 迁移 payment 模块后启用
     */
    /*
    @PutMapping("/{id}")
    public ResponseEntity<PaymentConfigDTO> updateConfig(
            @PathVariable Long id,
            @RequestBody PaymentConfigRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);

        PaymentConfig config = paymentConfigService.getAllConfigs().stream()
                .filter(c -> c.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("支付配置不存在: " + id));

        if (request.getAppId() != null) config.setAppId(request.getAppId());
        
        // 根据支付类型更新不同的参数
        if ("alipay".equals(config.getPaymentType())) {
            if (request.getMerchantPrivateKey() != null) config.setMerchantPrivateKey(request.getMerchantPrivateKey());
            if (request.getAlipayPublicKey() != null) config.setAlipayPublicKey(request.getAlipayPublicKey());
            if (request.getGatewayUrl() != null) config.setGatewayUrl(request.getGatewayUrl());
            if (request.getSignType() != null) config.setSignType(request.getSignType());
            if (request.getCharset() != null) config.setCharset(request.getCharset());
            if (request.getFormat() != null) config.setFormat(request.getFormat());
            if (request.getReturnUrl() != null) config.setReturnUrl(request.getReturnUrl());
        } else if ("wechat".equals(config.getPaymentType())) {
            if (request.getWechatMchId() != null) config.setWechatMchId(request.getWechatMchId());
            if (request.getWechatApiKey() != null) config.setWechatApiKey(request.getWechatApiKey());
            if (request.getWechatApiV3Key() != null) config.setWechatApiV3Key(request.getWechatApiV3Key());
            if (request.getWechatCertSerialNo() != null) config.setWechatCertSerialNo(request.getWechatCertSerialNo());
            if (request.getWechatPrivateKey() != null) config.setWechatPrivateKey(request.getWechatPrivateKey());
        }
        
        if (request.getNotifyUrl() != null) config.setNotifyUrl(request.getNotifyUrl());
        if (request.getIsEnabled() != null) config.setIsEnabled(request.getIsEnabled());
        if (request.getIsSandbox() != null) config.setIsSandbox(request.getIsSandbox());
        if (request.getDescription() != null) config.setDescription(request.getDescription());

        PaymentConfig saved = paymentConfigService.saveConfig(config);
        return ResponseEntity.ok(toDTO(saved));
    }
    */
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateConfig(
            @PathVariable Long id,
            @RequestBody PaymentConfigRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(Map.of("message", "PaymentConfig 模块尚未迁移，此功能暂时不可用"));
    }

    /**
     * 删除支付配置
     * TODO: 迁移 payment 模块后启用
     */
    /*
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteConfig(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        paymentConfigService.deleteConfig(id);
        return ResponseEntity.ok(Map.of("message", "支付配置已删除"));
    }
    */
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteConfig(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(Map.of("message", "PaymentConfig 模块尚未迁移，此功能暂时不可用"));
    }

    /**
     * 启用/禁用支付配置
     * TODO: 迁移 payment 模块后启用
     */
    /*
    @PutMapping("/{id}/toggle")
    public ResponseEntity<PaymentConfigDTO> toggleConfig(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);

        PaymentConfig config = paymentConfigService.getAllConfigs().stream()
                .filter(c -> c.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("支付配置不存在: " + id));

        config.setIsEnabled(!config.getIsEnabled());
        PaymentConfig saved = paymentConfigService.saveConfig(config);
        return ResponseEntity.ok(toDTO(saved));
    }
    */
    
    @PutMapping("/{id}/toggle")
    public ResponseEntity<Map<String, String>> toggleConfig(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(Map.of("message", "PaymentConfig 模块尚未迁移，此功能暂时不可用"));
    }

    /**
     * 转换为DTO（不包含敏感信息）
     * TODO: 迁移 payment 模块后启用
     */
    /*
    private PaymentConfigDTO toDTO(PaymentConfig config) {
        PaymentConfigDTO dto = new PaymentConfigDTO();
        dto.setId(config.getId());
        dto.setPaymentType(config.getPaymentType());
        dto.setAppId(config.getAppId());
        dto.setGatewayUrl(config.getGatewayUrl());
        dto.setSignType(config.getSignType());
        dto.setCharset(config.getCharset());
        dto.setFormat(config.getFormat());
        dto.setNotifyUrl(config.getNotifyUrl());
        dto.setReturnUrl(config.getReturnUrl());
        dto.setIsEnabled(config.getIsEnabled());
        dto.setIsSandbox(config.getIsSandbox());
        dto.setDescription(config.getDescription());
        // 微信支付相关字段
        dto.setWechatMchId(config.getWechatMchId());
        dto.setWechatCertSerialNo(config.getWechatCertSerialNo());
        return dto;
    }
    */

    @Data
    public static class PaymentConfigRequest {
        private String paymentType;
        private String appId;
        private String merchantPrivateKey;
        private String alipayPublicKey;
        // 微信支付相关字段
        private String wechatMchId;
        private String wechatApiKey;
        private String wechatApiV3Key;
        private String wechatCertSerialNo;
        private String wechatPrivateKey;
        // 支付宝相关字段
        private String gatewayUrl;
        private String signType;
        private String charset;
        private String format;
        private String notifyUrl;
        private String returnUrl;
        private Boolean isEnabled;
        private Boolean isSandbox;
        private String description;
    }
}

