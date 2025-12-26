package com.heartsphere.aistudio.adapter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 模型适配器工厂
 * 根据提供商类型返回对应的适配器
 */
@Component
public class ModelAdapterFactory {
    
    private final Map<String, ModelAdapter> adapters;
    
    @Autowired
    public ModelAdapterFactory(List<ModelAdapter> adapterList) {
        this.adapters = adapterList.stream()
            .collect(Collectors.toMap(
                ModelAdapter::getProviderType,
                Function.identity()
            ));
    }
    
    /**
     * 获取适配器
     */
    public ModelAdapter getAdapter(String providerType) {
        ModelAdapter adapter = adapters.get(providerType);
        if (adapter == null) {
            throw new IllegalArgumentException("不支持的模型提供商: " + providerType);
        }
        return adapter;
    }
    
    /**
     * 获取默认适配器
     */
    public ModelAdapter getDefaultAdapter() {
        // 优先使用阿里云
        return adapters.getOrDefault("alibaba", 
            adapters.values().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("没有可用的模型适配器")));
    }
}
