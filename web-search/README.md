# HeartSphere Web Search Service

基于 Tavily API 的网页搜索服务,为 HeartSphere 系统提供外部网页搜索能力。

## 📋 功能特性

- ✅ **网页搜索**: 基于 Tavily API 的强大搜索能力
- ✅ **AI 答案生成**: 自动生成搜索结果的 AI 摘要
- ✅ **智能缓存**: 支持 Caffeine 本地缓存和 Redis 分布式缓存
- ✅ **Graph 集成**: 提供节点接口,可集成到现有 Graph 执行引擎
- ✅ **多种搜索模式**: 支持普通搜索、新闻搜索、域名过滤搜索
- ✅ **API 文档**: 集成 Swagger/OpenAPI 自动生成文档

## 🚀 快速开始

### 1. 环境要求

- Java 17+
- Maven 3.6+
- Redis (可选,用于分布式缓存)

### 2. 获取 Tavily API Key

访问 [Tavily官网](https://tavily.com) 注册并获取 API Key。

免费额度: 1000次/月

### 3. 配置

在 `application.yml` 中配置:

```yaml
tavily:
  api-key: tvly-dev-xxxxx  # 替换为你的API Key
```

或通过环境变量:

```bash
export TAVILY_API_KEY=tvly-dev-xxxxx
```

### 4. 启动服务

```bash
cd web-search/backend
mvn clean install
mvn spring-boot:run
```

服务启动后访问: http://localhost:8086/api

### 5. 查看 API 文档

打开浏览器访问: http://localhost:8086/api/swagger-ui.html

## 📖 API 使用示例

### 快速搜索

```bash
curl -X GET "http://localhost:8086/api/search/quick?query=HeartSphere%20AI"
```

响应示例:

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "query": "HeartSphere AI",
    "answer": "HeartSphere AI 是一个...",
    "results": [
      {
        "title": "网页标题",
        "url": "https://example.com",
        "content": "网页内容摘要",
        "score": 0.95
      }
    ],
    "resultCount": 10,
    "fromCache": false,
    "duration": 1234
  },
  "timestamp": 1234567890123
}
```

### 高级搜索

```bash
curl -X POST "http://localhost:8086/api/search/advanced" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "人工智能最新进展",
    "maxResults": 5,
    "searchDepth": "advanced",
    "includeDomains": ["wikipedia.org", "github.com"],
    "excludeDomains": ["ads.com"]
  }'
```

### 新闻搜索

```bash
curl -X GET "http://localhost:8086/api/search/news?query=AI&daysRange=7"
```

## 🔌 Graph 集成

### 配置 WebSearch 节点

在 Graph 定义中添加 WebSearch 节点:

```json
{
  "type": "web_search",
  "id": "search_1",
  "config": {
    "queryTemplate": "{{user_message}}",
    "maxResults": 5,
    "searchDepth": "basic",
    "includeAnswer": true,
    "promptTemplate": "基于以下搜索结果回答用户问题:\n{{search_results}}\n\n问题: {{user_message}}"
  }
}
```

### 在代码中使用

```java
@Autowired
private WebSearchNode webSearchNode;

public void executeGraph() {
    WebSearchNodeConfig config = WebSearchNodeConfig.builder()
        .queryTemplate("{{user_message}}")
        .maxResults(5)
        .includeAnswer(true)
        .promptTemplate("基于搜索结果: {{search_results}}\n回答: {{user_message}}")
        .build();

    Map<String, Object> context = new HashMap<>();
    context.put("user_message", "什么是人工智能?");

    NodeResult result = webSearchNode.execute(config, context);

    if (result.getSuccess()) {
        String enhancedPrompt = (String) context.get("enhancedPrompt");
        // 继续执行AI对话...
    }
}
```

### 节点配置参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| queryTemplate | String | - | 查询模板,支持 `{{variable}}` 占位符 |
| maxResults | Integer | 5 | 最大结果数 |
| searchDepth | String | basic | 搜索深度: basic/advanced |
| includeAnswer | Boolean | true | 是否包含AI答案 |
| skipCache | Boolean | false | 是否跳过缓存 |
| promptTemplate | String | - | Prompt模板 |
| continueOnError | Boolean | false | 失败时是否继续 |
| outputVariable | String | searchResults | 输出变量名 |

## ⚙️ 配置说明

### application.yml

```yaml
server:
  port: 8086

tavily:
  api-key: ${TAVILY_API_KEY}
  base-url: https://api.tavily.com
  timeout: 30000
  max-retries: 3

search:
  default-max-results: 10
  default-search-depth: basic
  cache-enabled: true
  cache-ttl-minutes: 30
```

### 缓存配置

支持两种缓存:

1. **Caffeine 本地缓存** (默认)
   - 最大容量: 1000条
   - 过期时间: 30分钟

2. **Redis 分布式缓存** (可选)
   ```yaml
   spring:
     redis:
       host: localhost
       port: 6379
   ```

## 🔍 缓存管理

### 清除指定缓存

```bash
curl -X DELETE "http://localhost:8086/api/cache/{query}"
```

### 清除所有缓存

```bash
curl -X DELETE "http://localhost:8086/api/cache/all"
```

### 查看缓存统计

```bash
curl -X GET "http://localhost:8086/api/cache/stats"
```

## 📊 监控和健康检查

### 健康检查

```bash
curl -X GET "http://localhost:8086/api/search/health"
```

### Actuator 端点

- 健康状态: http://localhost:8086/api/actuator/health
- 指标: http://localhost:8086/api/actuator/metrics
- Prometheus: http://localhost:8086/api/actuator/prometheus

## 🏗️ 项目结构

```
web-search/
├── backend/
│   ├── src/main/java/com/heartsphere/websearch/
│   │   ├── WebSearchApplication.java      # 启动类
│   │   ├── config/                        # 配置类
│   │   │   ├── TavilyConfig.java
│   │   │   └── CacheConfig.java
│   │   ├── controller/                    # 控制器
│   │   │   ├── WebSearchController.java
│   │   │   └── CacheController.java
│   │   ├── service/                       # 服务层
│   │   │   ├── WebSearchService.java
│   │   │   └── CacheService.java
│   │   ├── client/                        # API客户端
│   │   │   └── TavilyClient.java
│   │   ├── dto/                           # 数据传输对象
│   │   │   ├── WebSearchRequest.java
│   │   │   ├── WebSearchResponse.java
│   │   │   ├── ApiResponse.java
│   │   │   └── TavilySearch*.java
│   │   └── integration/                   # Graph集成
│   │       ├── WebSearchNode.java
│   │       ├── WebSearchNodeConfig.java
│   │       └── NodeResult.java
│   └── src/main/resources/
│       └── application.yml
├── frontend/                              # 前端(待开发)
└── README.md
```

## 🔐 安全建议

1. **API Key 保护**
   - 不要将 API Key 提交到代码仓库
   - 使用环境变量或密钥管理服务

2. **访问控制**
   - 添加认证和授权机制
   - 限制 API 调用频率

3. **数据过滤**
   - 验证输入参数
   - 过滤敏感域名

## 🚀 部署

### Docker 部署

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/web-search-1.0.0.jar app.jar
EXPOSE 8086
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  web-search:
    build: ./backend
    ports:
      - "8086:8086"
    environment:
      - TAVILY_API_KEY=${TAVILY_API_KEY}
      - REDIS_HOST=redis
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## 📝 开发计划

- [ ] 添加搜索历史记录
- [ ] 支持多轮对话上下文搜索
- [ ] 实现搜索结果重排序
- [ ] 添加前端管理界面
- [ ] 支持更多搜索引擎

## 📄 许可证

Copyright © 2025 HeartSphere

## 📞 联系方式

- 项目主页: [HeartSphere](https://heartsphere.com)
- 问题反馈: [GitHub Issues](https://github.com/heartsphere/web-search/issues)
