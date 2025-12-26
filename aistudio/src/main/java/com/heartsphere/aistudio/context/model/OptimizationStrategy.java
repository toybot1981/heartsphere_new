package com.heartsphere.aistudio.context.model;

/**
 * 上下文优化策略枚举
 */
public enum OptimizationStrategy {

    /**
     * 滚动窗口策略
     * 只保留最近的 N 条消息
     */
    ROLLING_WINDOW,

    /**
     * 摘要策略
     * 将旧消息压缩为摘要，保留最近消息
     */
    SUMMARIZATION,

    /**
     * 语义选择策略
     * 选择与当前查询最相关的消息
     */
    SEMANTIC_SELECTION,

    /**
     * 混合策略
     * 结合摘要、最近消息和语义相关消息
     */
    HYBRID,

    /**
     * 重要性策略
     * 基于消息重要性评分选择
     */
    IMPORTANCE_BASED
}
