package com.heartsphere.websearch.integration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 节点执行结果
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NodeResult {

    /**
     * 是否成功
     */
    private Boolean success;

    /**
     * 错误消息(失败时)
     */
    private String errorMessage;

    /**
     * 执行后的上下文
     */
    private Map<String, Object> context;

    /**
     * 搜索结果数据
     */
    private Object data;

    /**
     * 创建成功结果
     */
    public static NodeResult success(Object data, Map<String, Object> context) {
        return NodeResult.builder()
                .success(true)
                .data(data)
                .context(context)
                .build();
    }

    /**
     * 创建失败结果
     */
    public static NodeResult error(String errorMessage) {
        return NodeResult.builder()
                .success(false)
                .errorMessage(errorMessage)
                .build();
    }
}
