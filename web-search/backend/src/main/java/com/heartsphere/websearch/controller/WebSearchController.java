package com.heartsphere.websearch.controller;

import com.heartsphere.websearch.dto.ApiResponse;
import com.heartsphere.websearch.dto.WebSearchRequest;
import com.heartsphere.websearch.dto.WebSearchResponse;
import com.heartsphere.websearch.service.WebSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 网页搜索Controller
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@Tag(name = "网页搜索", description = "基于Tavily API的网页搜索接口")
public class WebSearchController {

    private final WebSearchService webSearchService;

    /**
     * 快速搜索
     *
     * @param query 搜索查询
     * @return 搜索结果
     */
    @GetMapping("/quick")
    @Operation(summary = "快速搜索", description = "使用默认配置执行快速搜索")
    public ApiResponse<WebSearchResponse> quickSearch(
            @Parameter(description = "搜索查询", required = true, example = "HeartSphere AI")
            @RequestParam String query) {

        log.info("快速搜索请求: query={}", query);
        WebSearchResponse response = webSearchService.quickSearch(query);
        return ApiResponse.success(response);
    }

    /**
     * 高级搜索
     *
     * @param request 搜索请求
     * @return 搜索结果
     */
    @PostMapping("/advanced")
    @Operation(summary = "高级搜索", description = "使用自定义配置执行高级搜索")
    public ApiResponse<WebSearchResponse> advancedSearch(
            @Parameter(description = "搜索请求", required = true)
            @Valid @RequestBody WebSearchRequest request) {

        log.info("高级搜索请求: query={}, maxResults={}, searchDepth={}",
                request.getQuery(), request.getMaxResults(), request.getSearchDepth());

        WebSearchResponse response = webSearchService.search(
                request.getQuery(),
                request,
                request.getSkipCache()
        );

        return ApiResponse.success(response);
    }

    /**
     * 新闻搜索
     *
     * @param query 搜索查询
     * @param daysRange 时间范围(天)
     * @return 搜索结果
     */
    @GetMapping("/news")
    @Operation(summary = "新闻搜索", description = "搜索新闻内容")
    public ApiResponse<WebSearchResponse> searchNews(
            @Parameter(description = "搜索查询", required = true, example = "AI最新进展")
            @RequestParam String query,

            @Parameter(description = "时间范围(天)", example = "7")
            @RequestParam(required = false, defaultValue = "7") Integer daysRange) {

        log.info("新闻搜索请求: query={}, daysRange={}", query, daysRange);
        WebSearchResponse response = webSearchService.searchNews(query, daysRange);
        return ApiResponse.success(response);
    }

    /**
     * 域名过滤搜索
     *
     * @param query 搜索查询
     * @param includeDomains 包含的域名
     * @param excludeDomains 排除的域名
     * @return 搜索结果
     */
    @GetMapping("/filtered")
    @Operation(summary = "域名过滤搜索", description = "按域名过滤搜索结果")
    public ApiResponse<WebSearchResponse> filteredSearch(
            @Parameter(description = "搜索查询", required = true)
            @RequestParam String query,

            @Parameter(description = "包含的域名列表", example = "[\"wikipedia.org\", \"github.com\"]")
            @RequestParam(required = false) List<String> includeDomains,

            @Parameter(description = "排除的域名列表", example = "[\"ads.com\"]")
            @RequestParam(required = false) List<String> excludeDomains) {

        log.info("域名过滤搜索请求: query={}, include={}, exclude={}",
                query, includeDomains, excludeDomains);

        WebSearchResponse response = webSearchService.advancedSearch(
                query,
                10,
                "basic",
                includeDomains,
                excludeDomains
        );

        return ApiResponse.success(response);
    }

    /**
     * 健康检查
     *
     * @return 健康状态
     */
    @GetMapping("/health")
    @Operation(summary = "健康检查", description = "检查服务健康状态")
    public ApiResponse<String> health() {
        return ApiResponse.success("Web Search Service is running");
    }
}
