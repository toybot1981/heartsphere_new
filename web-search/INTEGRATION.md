# Web Search Service 集成指南

## 集成到现有系统

### 1. 添加 Maven 依赖

在需要使用搜索服务的模块中添加依赖:

```xml
<dependency>
    <groupId>com.heartsphere</groupId>
    <artifactId>web-search</artifactId>
    <version>1.0.0</version>
</dependency>
```

### 2. 配置服务地址

在 `application.yml` 中配置:

```yaml
web-search:
  base-url: http://localhost:8086/api
  timeout: 5000
```

### 3. 创建服务客户端

```java
@Service
public class WebSearchClientService {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    @Value("${web-search.base-url}")
    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public WebSearchResponse search(String query) {
        String url = baseUrl + "/search/quick?query=" + URLEncoder.encode(query);
        ApiResponse<WebSearchResponse> response = restTemplate.getForObject(url,
            new ParameterizedTypeReference<ApiResponse<WebSearchResponse>>() {});
        return response.getData();
    }
}
```

## 集成到 Graph 引擎

### 方式一: 直接调用 WebSearchNode

```java
@Service
public class GraphExecutionService {

    @Autowired
    private WebSearchNode webSearchNode;

    public void executeGraphWithSearch() {
        // 创建搜索配置
        WebSearchNodeConfig searchConfig = WebSearchNodeConfig.builder()
            .queryTemplate("{{user_input}}")
            .maxResults(5)
            .includeAnswer(true)
            .promptTemplate("""
                基于以下搜索结果回答用户问题:

                {{search_results}}

                用户问题: {{user_input}}
                """)
            .build();

        // 准备执行上下文
        Map<String, Object> context = new HashMap<>();
        context.put("user_input", "什么是人工智能?");

        // 执行搜索节点
        NodeResult searchResult = webSearchNode.execute(searchConfig, context);

        if (searchResult.getSuccess()) {
            // 获取增强的prompt
            String enhancedPrompt = (String) context.get("enhancedPrompt");

            // 继续执行AI对话
            String aiResponse = aiService.generateText(enhancedPrompt);
        }
    }
}
```

### 方式二: 在 Graph 定义中配置

在 Graph JSON 定义中添加 WebSearch 节点:

```json
{
  "nodes": [
    {
      "id": "search_1",
      "type": "web_search",
      "config": {
        "queryTemplate": "{{user_message}}",
        "maxResults": 5,
        "includeAnswer": true,
        "promptTemplate": "基于搜索结果: {{search_results}}\n回答: {{user_message}}"
      }
    },
    {
      "id": "dialogue_1",
      "type": "dialogue",
      "config": {
        "promptTemplate": "{{enhancedPrompt}}",
        "characterId": "char_001"
      }
    }
  ],
  "edges": [
    {
      "from": "search_1",
      "to": "dialogue_1"
    }
  ]
}
```

### 方式三: 通过 HTTP API 调用

```java
@Service
public class RemoteGraphSearchService {

    private final RestTemplate restTemplate;
    private final String searchServiceUrl;

    public WebSearchResponse searchForGraph(String query) {
        // 调用远程搜索服务
        String url = searchServiceUrl + "/search/advanced";

        WebSearchRequest request = WebSearchRequest.builder()
            .query(query)
            .maxResults(5)
            .includeAnswer(true)
            .build();

        ResponseEntity<ApiResponse<WebSearchResponse>> response =
            restTemplate.postForEntity(url, request,
                new ParameterizedTypeReference<ApiResponse<WebSearchResponse>>() {});

        return response.getBody().getData();
    }
}
```

## 使用场景示例

### 场景1: 角色对话增强

当用户询问实时信息时,自动进行网页搜索:

```java
public class EnhancedDialogueNode extends BaseNode {

    @Autowired
    private WebSearchNode webSearchNode;

    @Override
    public NodeResult execute(ExecutionContext context) {
        String userMessage = context.getUserMessage();

        // 检测是否需要搜索
        if (needsRealtimeInfo(userMessage)) {
            // 执行搜索
            WebSearchNodeConfig config = WebSearchNodeConfig.builder()
                .queryTemplate(userMessage)
                .maxResults(3)
                .promptTemplate("""
                    你是{{character_name}},一个具有丰富知识的角色。
                    请基于以下搜索结果,用你的口吻回答用户的问题:

                    搜索结果:
                    {{search_results}}

                    用户问题: {{user_message}}
                    """)
                .build();

            NodeResult searchResult = webSearchNode.execute(config, context);

            if (!searchResult.getSuccess() && !config.getContinueOnError()) {
                return NodeResult.error("搜索失败");
            }
        }

        // 继续执行常规对话
        return executeDialogue(context);
    }

    private boolean needsRealtimeInfo(String message) {
        // 检测关键词
        String[] keywords = {"最新", "新闻", "现在", "今天", "当前"};
        return Arrays.stream(keywords).anyMatch(message::contains);
    }
}
```

### 场景2: 剧情创作辅助

为剧本创作收集历史资料:

```java
@Service
public class ScriptResearchService {

    @Autowired
    private WebSearchNode webSearchNode;

    public List<ResearchMaterial> researchForScript(String era, String event) {
        WebSearchNodeConfig config = WebSearchNodeConfig.builder()
            .queryTemplate(era + " " + event + " 历史背景")
            .maxResults(10)
            .searchDepth("advanced")
            .includeAnswer(false)
            .build();

        Map<String, Object> context = new HashMap<>();
        NodeResult result = webSearchNode.execute(config, context);

        if (result.getSuccess()) {
            List<SearchResultItem> results =
                (List<SearchResultItem>) context.get("searchResults");
            return convertToResearchMaterials(results);
        }

        return Collections.emptyList();
    }
}
```

### 场景3: 教育场景知识检索

```java
@Service
public class EducationKnowledgeService {

    @Autowired
    private WebSearchNode webSearchNode;

    public KnowledgeCard searchKnowledge(String topic) {
        WebSearchNodeConfig config = WebSearchNodeConfig.builder()
            .queryTemplate(topic)
            .maxResults(5)
            .includeDomains(Arrays.asList("wikipedia.org", "britannica.com"))
            .promptTemplate("""
                为学生提供关于{{search_query}}的知识卡片:

                1. 核心概念
                2. 重要事实
                3. 相关链接

                基于以下搜索结果:
                {{search_results}}
                """)
            .build();

        Map<String, Object> context = new HashMap<>();
        NodeResult result = webSearchNode.execute(config, context);

        if (result.getSuccess()) {
            String answer = (String) context.get("searchAnswer");
            return parseKnowledgeCard(answer);
        }

        return null;
    }
}
```

## 配置最佳实践

### 1. 缓存策略

```java
// 对于相同查询,利用缓存避免重复调用
WebSearchNodeConfig config = WebSearchNodeConfig.builder()
    .queryTemplate(query)
    .skipCache(false)  // 启用缓存
    .build();
```

### 2. 域名过滤

```java
// 只搜索可信来源
WebSearchNodeConfig config = WebSearchNodeConfig.builder()
    .includeDomains(Arrays.asList(
        "wikipedia.org",
        "github.com",
        "stackoverflow.com"
    ))
    .build();
```

### 3. 错误处理

```java
WebSearchNodeConfig config = WebSearchNodeConfig.builder()
    .continueOnError(true)  // 搜索失败时继续执行
    .build();

NodeResult result = webSearchNode.execute(config, context);
if (!result.getSuccess()) {
    // 使用备用方案
    return fallbackDialogue(context);
}
```

## 性能优化

### 1. 异步搜索

```java
@Async
public CompletableFuture<WebSearchResponse> searchAsync(String query) {
    return CompletableFuture.completedFuture(webSearchService.quickSearch(query));
}
```

### 2. 批量搜索

```java
public Map<String, WebSearchResponse> batchSearch(List<String> queries) {
    return queries.parallelStream()
        .collect(Collectors.toMap(
            query -> query,
            webSearchService::quickSearch
        ));
}
```

### 3. 结果缓存

```java
// 在应用层缓存热门查询
@Cacheable(value = "hotQueries", key = "#query")
public WebSearchResponse searchHotQuery(String query) {
    return webSearchService.quickSearch(query);
}
```

## 监控和日志

### 添加监控指标

```java
@Service
public class MonitoredWebSearchService {

    private final MeterRegistry meterRegistry;

    public WebSearchResponse searchWithMetrics(String query) {
        Timer.Sample sample = Timer.start(meterRegistry);

        try {
            WebSearchResponse response = webSearchService.quickSearch(query);

            // 记录成功指标
            meterRegistry.counter("web.search.success").increment();

            return response;
        } catch (Exception e) {
            // 记录失败指标
            meterRegistry.counter("web.search.error").increment();
            throw e;
        } finally {
            sample.stop(meterRegistry.timer("web.search.duration"));
        }
    }
}
```

### 结构化日志

```java
@Slf4j
@Service
public class LoggingWebSearchService {

    public WebSearchResponse searchWithLogging(String query) {
        log.info("开始搜索: query={}", query);

        WebSearchResponse response = webSearchService.quickSearch(query);

        log.info("搜索完成: query={}, resultCount={}, fromCache={}, duration={}ms",
            query,
            response.getResultCount(),
            response.getFromCache(),
            response.getDuration()
        );

        return response;
    }
}
```

## 安全考虑

### 1. API Key 保护

```yaml
# 不要在代码中硬编码API Key
tavily:
  api-key: ${TAVILY_API_KEY}  # 使用环境变量
```

### 2. 输入验证

```java
public void validateQuery(String query) {
    if (query == null || query.isBlank()) {
        throw new IllegalArgumentException("查询不能为空");
    }

    if (query.length() > 500) {
        throw new IllegalArgumentException("查询长度不能超过500字符");
    }

    // 检查敏感词
    if (containsSensitiveWords(query)) {
        throw new SecurityException("查询包含敏感内容");
    }
}
```

### 3. 访问控制

```java
@Service
public class SecureWebSearchService {

    @PreAuthorize("hasRole('USER')")
    public WebSearchResponse search(String query, Long userId) {
        // 检查用户配额
        if (!checkUserQuota(userId)) {
            throw new QuotaExceededException("搜索配额已用完");
        }

        return webSearchService.search(query, ...);
    }
}
```
