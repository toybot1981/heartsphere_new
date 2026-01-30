package com.heartsphere.shared.sse;

/**
 * 流式处理处理器接口
 * 用于处理流式数据并发送SSE事件
 * 
 * @param <T> 数据类型
 * @author HeartSphere
 * @version 1.0
 */
@FunctionalInterface
public interface StreamHandler<T> {
    
    /**
     * 处理流式数据
     * 
     * @param data 数据块
     * @param done 是否完成
     */
    void handle(T data, boolean done);
}
