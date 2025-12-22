package com.heartsphere.aiagent.adapter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 模型适配器管理器
 * 管理所有模型适配器实例
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class ModelAdapterManager {
    
    private final Map<String, ModelAdapter> adapters = new HashMap<>();
    
    // 提供商别名映射（用于兼容不同的命名）
    private static final Map<String, String> PROVIDER_ALIASES = Map.of(
        "qwen", "dashscope",      // qwen 是 dashscope 的别名
        "alibaba", "dashscope"    // alibaba 也是 dashscope 的别名
    );
    
    /**
     * 构造函数，自动注入所有适配器
     */
    public ModelAdapterManager(List<ModelAdapter> adapterList) {
        for (ModelAdapter adapter : adapterList) {
            String providerType = adapter.getProviderType();
            adapters.put(providerType, adapter);
            log.info("注册模型适配器: provider={}", providerType);
        }
        log.info("共注册 {} 个模型适配器", adapters.size());
    }
    
    /**
     * 获取适配器
     * @param provider 提供商名称（支持别名）
     * @return 适配器实例
     * @throws IllegalArgumentException 如果提供商不支持
     */
    public ModelAdapter getAdapter(String provider) {
        if (provider == null || provider.isEmpty()) {
            throw new IllegalArgumentException("提供商名称不能为空");
        }
        
        // 先尝试直接查找
        ModelAdapter adapter = adapters.get(provider);
        
        // 如果找不到，尝试通过别名查找
        if (adapter == null && PROVIDER_ALIASES.containsKey(provider)) {
            String actualProvider = PROVIDER_ALIASES.get(provider);
            adapter = adapters.get(actualProvider);
            log.debug("通过别名映射找到适配器: {} -> {}", provider, actualProvider);
        }
        
        if (adapter == null) {
            throw new IllegalArgumentException("不支持的提供商: " + provider);
        }
        
        return adapter;
    }
    
    /**
     * 获取所有可用的提供商列表
     * @param capability 能力类型：text, image, audio, video
     * @return 提供商列表
     */
    public List<String> getAvailableProviders(String capability) {
        return adapters.values().stream()
            .filter(adapter -> supportsCapability(adapter, capability))
            .map(ModelAdapter::getProviderType)
            .collect(Collectors.toList());
    }
    
    /**
     * 检查适配器是否支持指定能力
     */
    private boolean supportsCapability(ModelAdapter adapter, String capability) {
        switch (capability.toLowerCase()) {
            case "text":
                return adapter.supportsTextGeneration();
            case "image":
                return adapter.supportsImageGeneration();
            case "audio":
                return adapter.supportsTextToSpeech() || adapter.supportsSpeechToText();
            case "video":
                return adapter.supportsVideoGeneration();
            default:
                return false;
        }
    }
    
    /**
     * 获取所有已注册的适配器
     */
    public Map<String, ModelAdapter> getAllAdapters() {
        return new HashMap<>(adapters);
    }
}
