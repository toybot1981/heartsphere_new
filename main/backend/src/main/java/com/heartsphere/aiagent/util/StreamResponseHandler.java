package com.heartsphere.aiagent.util;

/**
 * 流式响应处理器接口
 * 用于处理流式AI响应
 * 
 * @param <T> 响应类型
 * @author HeartSphere
 * @version 1.0
 */
@FunctionalInterface
public interface StreamResponseHandler<T> {
    
    /**
     * 处理流式响应块
     * @param response 响应数据
     * @param done 是否完成
     */
    void handle(T response, boolean done);
}

