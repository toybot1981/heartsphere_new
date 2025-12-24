package com.heartsphere.aiagent.service;

import com.heartsphere.admin.dto.AIModelConfigDTO;
import com.heartsphere.admin.dto.AIRoutingStrategyDTO;
import com.heartsphere.admin.service.AIModelConfigService;
import com.heartsphere.admin.service.AIRoutingStrategyService;
import com.heartsphere.aiagent.dto.request.TextGenerationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 统一接入模式路由服务
 * 根据管理后台配置的模型和路由策略进行路由
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UnifiedModelRoutingService {
    
    private final AIModelConfigService modelConfigService;
    private final AIRoutingStrategyService routingStrategyService;
    
    /**
     * 根据能力类型和路由策略选择模型配置
     * @param capability 能力类型：text, image, audio, video
     * @return 模型配置，包含provider、model、apiKey、baseUrl等信息
     */
    public AIModelConfigDTO selectModel(String capability) {
        // 获取路由策略
        AIRoutingStrategyDTO strategy = routingStrategyService.getStrategyByCapability(capability);
        
        if (strategy == null || !strategy.getIsActive()) {
            // 如果没有配置策略，使用默认模型
            return getDefaultModel(capability);
        }
        
        String strategyType = strategy.getStrategyType();
        
        switch (strategyType) {
            case "single":
                // 单一模式：使用默认模型
                return getDefaultModel(capability);
                
            case "fallback":
                // 容错模式：返回降级链中的第一个模型（按优先级）
                return getFallbackModel(capability, strategy);
                
            case "economy":
                // 经济模式：选择最便宜的模型
                return getEconomyModel(capability, strategy);
                
            default:
                log.warn("未知的路由策略类型: {}, 使用默认模型", strategyType);
                return getDefaultModel(capability);
        }
    }
    
    /**
     * 获取默认模型（包含完整API key）
     */
    private AIModelConfigDTO getDefaultModel(String capability) {
        List<AIModelConfigDTO> models = modelConfigService.getModelConfigsByCapability(capability);
        AIModelConfigDTO defaultModel = models.stream()
                .filter(AIModelConfigDTO::getIsDefault)
                .filter(AIModelConfigDTO::getIsActive)
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                    String.format("未找到%s能力的默认模型配置，请在管理后台配置", capability)
                ));
        
        // 获取完整API key
        if (defaultModel.getId() != null) {
            com.heartsphere.admin.entity.AIModelConfig config = 
                modelConfigService.getModelConfigWithApiKey(defaultModel.getId());
            return modelConfigService.toDTOWithApiKey(config);
        }
        return defaultModel;
    }
    
    /**
     * 获取容错模式的模型（降级链中的第一个）
     */
    private AIModelConfigDTO getFallbackModel(String capability, AIRoutingStrategyDTO strategy) {
        if (strategy.getFallbackChain() == null || strategy.getFallbackChain().isEmpty()) {
            log.warn("容错模式未配置降级链，使用默认模型");
            return getDefaultModel(capability);
        }
        
        // 按优先级排序，获取第一个
        AIRoutingStrategyDTO.FallbackConfig firstConfig = strategy.getFallbackChain().stream()
                .sorted((a, b) -> Integer.compare(a.getPriority(), b.getPriority()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("降级链配置错误"));
        
        // 查找对应的模型配置（包含完整API key）
        try {
            com.heartsphere.admin.entity.AIModelConfig config = 
                modelConfigService.getModelConfigWithApiKey(
                    firstConfig.getProvider(), 
                    firstConfig.getModel(), 
                    capability
                );
            return modelConfigService.toDTOWithApiKey(config);
        } catch (Exception e) {
            throw new RuntimeException(
                String.format("未找到模型配置: provider=%s, model=%s, capability=%s",
                        firstConfig.getProvider(), firstConfig.getModel(), capability), e
            );
        }
    }
    
    /**
     * 获取经济模式的模型（最便宜的）
     */
    private AIModelConfigDTO getEconomyModel(String capability, AIRoutingStrategyDTO strategy) {
        List<AIModelConfigDTO> models = modelConfigService.getModelConfigsByCapability(capability);
        
        // 过滤已配置API-key的模型（注意：DTO中的API key是隐藏的，需要通过ID获取完整配置）
        // 这里先获取所有活跃的模型，然后通过ID获取完整配置来检查API key
        List<AIModelConfigDTO> activeModels = models.stream()
                .filter(AIModelConfigDTO::getIsActive)
                .collect(Collectors.toList());
        
        if (activeModels.isEmpty()) {
            throw new RuntimeException(
                String.format("未找到%s能力的可用模型配置", capability)
            );
        }
        
        // 如果有优先提供商配置，优先选择该提供商的模型
        if (strategy.getEconomyConfig() != null && 
            strategy.getEconomyConfig().getPreferredProvider() != null) {
            String preferredProvider = strategy.getEconomyConfig().getPreferredProvider();
            activeModels = activeModels.stream()
                    .filter(m -> m.getProvider().equals(preferredProvider))
                    .collect(Collectors.toList());
        }
        
        // 如果有最大成本限制，过滤超出限制的模型
        if (strategy.getEconomyConfig() != null && 
            strategy.getEconomyConfig().getMaxCostPerToken() != null) {
            double maxCost = strategy.getEconomyConfig().getMaxCostPerToken();
            activeModels = activeModels.stream()
                    .filter(m -> m.getCostPerToken() == null || m.getCostPerToken() <= maxCost)
                    .collect(Collectors.toList());
        }
        
        if (activeModels.isEmpty()) {
            throw new RuntimeException("未找到符合条件的经济模型");
        }
        
        // 选择成本最低的模型，并获取完整API key
        AIModelConfigDTO selectedModel = activeModels.stream()
                .min((a, b) -> {
                    double costA = a.getCostPerToken() != null ? a.getCostPerToken() : Double.MAX_VALUE;
                    double costB = b.getCostPerToken() != null ? b.getCostPerToken() : Double.MAX_VALUE;
                    return Double.compare(costA, costB);
                })
                .orElseThrow(() -> new RuntimeException("未找到可用的经济模型"));
        
        // 获取完整API key
        if (selectedModel.getId() != null) {
            com.heartsphere.admin.entity.AIModelConfig config = 
                modelConfigService.getModelConfigWithApiKey(selectedModel.getId());
            // 检查API key是否存在
            if (config.getApiKey() == null || config.getApiKey().trim().isEmpty()) {
                throw new RuntimeException(
                    String.format("模型 %s 未配置API key", selectedModel.getModelName())
                );
            }
            return modelConfigService.toDTOWithApiKey(config);
        }
        
        return selectedModel;
    }
    
    /**
     * 应用模型配置到请求中
     * 设置provider、model、apiKey、baseUrl等
     */
    public void applyModelConfig(TextGenerationRequest request, AIModelConfigDTO modelConfig) {
        request.setProvider(modelConfig.getProvider());
        request.setModel(modelConfig.getModelName());
        // 注意：这里需要将API key传递给适配器
        // 由于适配器可能从配置中读取，这里可能需要通过其他方式传递
        // 暂时先设置provider和model，API key的传递需要适配器支持
    }
}

