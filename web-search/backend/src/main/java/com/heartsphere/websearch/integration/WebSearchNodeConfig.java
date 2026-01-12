package com.heartsphere.websearch.integration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 网页搜索节点配置
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSearchNodeConfig {

    /**
     * 查询模板(支持上下文变量替换)
     * 例如: "{{user_message}}" 或 "{{character_name}} 的历史背景"
     */
    private String queryTemplate;

    /**
     * 最大结果数
     */
    @Builder.Default
    private Integer maxResults = 5;

    /**
     * 搜索深度: basic, advanced
     */
    @Builder.Default
    private String searchDepth = "basic";

    /**
     * 是否包含AI答案
     */
    @Builder.Default
    private Boolean includeAnswer = true;

    /**
     * 是否跳过缓存
     */
    @Builder.Default
    private Boolean skipCache = false;

    /**
     * 包含的域名模板
     */
    private String includeDomainsTemplate;

    /**
     * 排除的域名模板
     */
    private String excludeDomainsTemplate;

    /**
     * Prompt模板
     * 变量: {{search_query}}, {{search_answer}}, {{search_results}}, {{search_result_count}}
     * 以及任意上下文变量: {{user_message}}, {{character_name}} 等
     */
    private String promptTemplate;

    /**
     * 搜索失败时是否继续执行
     */
    @Builder.Default
    private Boolean continueOnError = false;

    /**
     * 搜索结果的输出变量名(默认searchResults)
     */
    @Builder.Default
    private String outputVariable = "searchResults";
}
