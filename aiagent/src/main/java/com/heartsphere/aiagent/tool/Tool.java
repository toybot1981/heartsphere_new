package com.heartsphere.aiagent.tool;

import java.util.Map;

/**
 * Tool 接口
 * 定义工具的基本能力
 */
public interface Tool {
    /**
     * 工具名称
     */
    String getName();
    
    /**
     * 工具描述
     */
    String getDescription();
    
    /**
     * 执行工具
     */
    Object execute(Map<String, Object> parameters);
}

