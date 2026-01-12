package com.heartsphere.websearch.service;

import com.heartsphere.websearch.client.TavilyClient;
import com.heartsphere.websearch.config.TavilyConfig;
import com.heartsphere.websearch.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 网页搜索服务
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WebSearchService {

    private final TavilyClient tavilyClient;
    private final TavilyConfig tavilyConfig;

    /**
     * 执行网页搜索
     *
     * @param request 搜索请求
     * @return 搜索响应
     */
    @Cacheable(value = "webSearch", key = "#query", unless = "#skipCache")
    public WebSearchResponse search(String query, WebSearchRequest request, boolean skipCache) {
        long startTime = System.currentTimeMillis();

        log.info("执行网页搜索: query={}, maxResults={}", query, request.getMaxResults());

        try {
            // 构建Tavily请求
            TavilySearchRequest tavilyRequest = buildTavilyRequest(query, request);

            // 调用Tavily API
            TavilySearchResponse tavilyResponse = tavilyClient.search(tavilyRequest);

            // 转换响应
            WebSearchResponse response = convertResponse(tavilyResponse);
            response.setQuery(query);
            response.setResultCount(tavilyResponse.getResults() != null
                    ? tavilyResponse.getResults().size()
                    : 0);
            response.setFromCache(false);
            response.setDuration(System.currentTimeMillis() - startTime);

            log.info("搜索完成: query={}, results={}, duration={}ms",
                    query, response.getResultCount(), response.getDuration());

            return response;

        } catch (Exception e) {
            log.error("搜索失败: query={}", query, e);
            throw new RuntimeException("搜索失败: " + e.getMessage(), e);
        }
    }

    /**
     * 快速搜索(使用默认配置)
     *
     * @param query 搜索查询
     * @return 搜索响应
     */
    public WebSearchResponse quickSearch(String query) {
        WebSearchRequest request = WebSearchRequest.builder()
                .query(query)
                .maxResults(10)
                .searchDepth("basic")
                .includeAnswer(true)
                .build();

        return search(query, request, false);
    }

    /**
     * 高级搜索
     *
     * @param query 搜索查询
     * @param maxResults 最大结果数
     * @param searchDepth 搜索深度
     * @param includeDomains 包含的域名
     * @param excludeDomains 排除的域名
     * @return 搜索响应
     */
    public WebSearchResponse advancedSearch(String query,
                                           Integer maxResults,
                                           String searchDepth,
                                           List<String> includeDomains,
                                           List<String> excludeDomains) {
        WebSearchRequest request = WebSearchRequest.builder()
                .query(query)
                .maxResults(maxResults)
                .searchDepth(searchDepth)
                .includeAnswer(true)
                .includeDomains(includeDomains)
                .excludeDomains(excludeDomains)
                .build();

        return search(query, request, false);
    }

    /**
     * 新闻搜索
     *
     * @param query 搜索查询
     * @param daysRange 时间范围(天)
     * @return 搜索响应
     */
    public WebSearchResponse searchNews(String query, Integer daysRange) {
        WebSearchRequest request = WebSearchRequest.builder()
                .query(query)
                .maxResults(10)
                .searchDepth("basic")
                .topic("news")
                .daysRange(daysRange != null ? daysRange : 7)
                .includeAnswer(true)
                .build();

        return search(query, request, false);
    }

    /**
     * 构建Tavily请求
     */
    private TavilySearchRequest buildTavilyRequest(String query, WebSearchRequest request) {
        return TavilySearchRequest.builder()
                .query(query)
                .maxResults(request.getMaxResults())
                .searchDepth(request.getSearchDepth())
                .includeAnswer(request.getIncludeAnswer())
                .includeRawContent(request.getIncludeRawContent())
                .includeDomains(request.getIncludeDomains())
                .excludeDomains(request.getExcludeDomains())
                .topic(request.getTopic())
                .daysRange(request.getDaysRange())
                .apiKey(tavilyConfig.getApiKey())
                .build();
    }

    /**
     * 转换响应
     */
    private WebSearchResponse convertResponse(TavilySearchResponse tavilyResponse) {
        List<WebSearchResponse.SearchResultItem> results = null;
        if (tavilyResponse.getResults() != null) {
            results = tavilyResponse.getResults().stream()
                    .map(tavilyResult -> WebSearchResponse.SearchResultItem.builder()
                            .title(tavilyResult.getTitle())
                            .url(tavilyResult.getUrl())
                            .content(tavilyResult.getContent())
                            .score(tavilyResult.getScore())
                            .publishedDate(tavilyResult.getPublishedDate())
                            .author(tavilyResult.getAuthor())
                            .rawContent(tavilyResult.getRawContent())
                            .build())
                    .collect(Collectors.toList());
        }

        return WebSearchResponse.builder()
                .answer(tavilyResponse.getAnswer())
                .results(results)
                .build();
    }
}
