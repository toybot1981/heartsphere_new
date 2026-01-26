package com.heartsphere.websearch.integration;

import com.heartsphere.websearch.dto.WebSearchRequest;
import com.heartsphere.websearch.dto.WebSearchResponse;
import com.heartsphere.websearch.service.WebSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 网页搜索Graph节点
 * 用于集成到现有Graph执行引擎
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSearchNode {

    private final WebSearchService webSearchService;

    /**
     * 执行网页搜索节点
     *
     * @param config 节点配置
     * @param context 执行上下文
     * @return 执行结果
     */
    public NodeResult execute(WebSearchNodeConfig config, Map<String, Object> context) {
        log.info("执行网页搜索节点: queryTemplate={}", config.getQueryTemplate());

        try {
            // 1. 从上下文获取变量并构建查询
            String query = evaluateTemplate(config.getQueryTemplate(), context);
            log.info("解析后的查询: query={}", query);

            // 2. 执行搜索
            WebSearchRequest searchRequest = buildSearchRequest(config, context);
            WebSearchResponse searchResponse = webSearchService.search(
                    query,
                    searchRequest,
                    config.getSkipCache()
            );

            // 3. 将结果注入上下文
            context.put("searchResults", searchResponse.getResults());
            context.put("searchAnswer", searchResponse.getAnswer());
            context.put("searchQuery", searchResponse.getQuery());
            context.put("searchResultCount", searchResponse.getResultCount());

            // 4. 构建增强的prompt(如果配置了)
            if (config.getPromptTemplate() != null) {
                String enhancedPrompt = buildPrompt(config, searchResponse, context);
                context.put("enhancedPrompt", enhancedPrompt);
            }

            log.info("网页搜索节点执行成功: query={}, resultCount={}",
                    query, searchResponse.getResultCount());

            return NodeResult.success(searchResponse, context);

        } catch (Exception e) {
            log.error("网页搜索节点执行失败", e);
            return NodeResult.error("搜索失败: " + e.getMessage());
        }
    }

    /**
     * 构建搜索请求
     */
    private WebSearchRequest buildSearchRequest(WebSearchNodeConfig config,
                                                Map<String, Object> context) {
        WebSearchRequest.WebSearchRequestBuilder builder = WebSearchRequest.builder()
                .maxResults(config.getMaxResults())
                .searchDepth(config.getSearchDepth())
                .includeAnswer(config.getIncludeAnswer())
                .skipCache(config.getSkipCache());

        // 从上下文动态获取域名过滤
        if (config.getIncludeDomainsTemplate() != null) {
            // 这里可以实现模板解析,暂时简化
            // builder.includeDomains(parseList(config.getIncludeDomainsTemplate(), context));
        }

        if (config.getExcludeDomainsTemplate() != null) {
            // builder.excludeDomains(parseList(config.getExcludeDomainsTemplate(), context));
        }

        return builder.build();
    }

    /**
     * 构建增强的prompt
     */
    private String buildPrompt(WebSearchNodeConfig config,
                              WebSearchResponse searchResponse,
                              Map<String, Object> context) {
        String prompt = config.getPromptTemplate();

        // 替换搜索相关变量
        prompt = prompt.replace("{{search_query}}", searchResponse.getQuery());
        prompt = prompt.replace("{{search_answer}}",
                searchResponse.getAnswer() != null ? searchResponse.getAnswer() : "");
        prompt = prompt.replace("{{search_result_count}}",
                String.valueOf(searchResponse.getResultCount()));

        // 替换搜索结果
        if (searchResponse.getResults() != null && !searchResponse.getResults().isEmpty()) {
            StringBuilder resultsText = new StringBuilder();
            for (int i = 0; i < searchResponse.getResults().size() && i < config.getMaxResults(); i++) {
                WebSearchResponse.SearchResultItem result = searchResponse.getResults().get(i);
                resultsText.append(String.format(
                        "\n[%d] 标题: %s\n链接: %s\n内容: %s\n",
                        i + 1, result.getTitle(), result.getUrl(), result.getContent()
                ));
            }
            prompt = prompt.replace("{{search_results}}", resultsText.toString());
        } else {
            prompt = prompt.replace("{{search_results}}", "(无搜索结果)");
        }

        // 替换上下文变量
        for (Map.Entry<String, Object> entry : context.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            if (prompt.contains(placeholder)) {
                String value = entry.getValue() != null ? entry.getValue().toString() : "";
                prompt = prompt.replace(placeholder, value);
            }
        }

        return prompt;
    }

    /**
     * 评估模板(简化版,实际应使用模板引擎)
     */
    private String evaluateTemplate(String template, Map<String, Object> context) {
        String result = template;

        // 替换上下文变量
        for (Map.Entry<String, Object> entry : context.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            if (result.contains(placeholder)) {
                String value = entry.getValue() != null ? entry.getValue().toString() : "";
                result = result.replace(placeholder, value);
            }
        }

        return result;
    }
}
