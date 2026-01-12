# Web Search Service API 文档

## 基础信息

- **Base URL**: `http://localhost:8086/api`
- **Content-Type**: `application/json`

## 接口列表

### 1. 快速搜索

**接口**: `GET /search/quick`

**描述**: 使用默认配置执行快速搜索

**请求参数**:

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| query | String | 是 | 搜索查询 | HeartSphere AI |

**请求示例**:

```bash
curl -X GET "http://localhost:8086/api/search/quick?query=HeartSphere%20AI"
```

**响应示例**:

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "query": "HeartSphere AI",
    "answer": "HeartSphere AI 是一个创新的AI交互平台...",
    "results": [
      {
        "title": "HeartSphere - AI驱动的互动平台",
        "url": "https://example.com/heartsphere",
        "content": "HeartSphere提供先进的AI对话能力...",
        "score": 0.95,
        "publishedDate": "2025-01-10"
      }
    ],
    "resultCount": 10,
    "fromCache": false,
    "duration": 1234
  },
  "timestamp": 1736659200000
}
```

### 2. 高级搜索

**接口**: `POST /search/advanced`

**描述**: 使用自定义配置执行高级搜索

**请求体**:

```json
{
  "query": "人工智能最新进展",
  "maxResults": 10,
  "searchDepth": "basic",
  "includeAnswer": true,
  "includeRawContent": false,
  "includeDomains": ["wikipedia.org", "github.com"],
  "excludeDomains": ["ads.com"],
  "topic": "general",
  "daysRange": 7,
  "skipCache": false
}
```

**请求参数说明**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| query | String | 是 | - | 搜索查询 |
| maxResults | Integer | 否 | 10 | 最大结果数(1-100) |
| searchDepth | String | 否 | basic | 搜索深度: basic/advanced |
| includeAnswer | Boolean | 否 | true | 是否包含AI答案 |
| includeRawContent | Boolean | 否 | false | 是否包含原始内容 |
| includeDomains | List | 否 | - | 包含的域名列表 |
| excludeDomains | List | 否 | - | 排除的域名列表 |
| topic | String | 否 | general | 主题: general/news |
| daysRange | Integer | 否 | - | 时间范围(天) |
| skipCache | Boolean | 否 | false | 是否跳过缓存 |

**请求示例**:

```bash
curl -X POST "http://localhost:8086/api/search/advanced" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "人工智能最新进展",
    "maxResults": 5,
    "searchDepth": "advanced"
  }'
```

### 3. 新闻搜索

**接口**: `GET /search/news`

**描述**: 搜索新闻内容

**请求参数**:

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| query | String | 是 | - | 搜索查询 |
| daysRange | Integer | 否 | 7 | 时间范围(天) |

**请求示例**:

```bash
curl -X GET "http://localhost:8086/api/search/news?query=AI&daysRange=7"
```

### 4. 域名过滤搜索

**接口**: `GET /search/filtered`

**描述**: 按域名过滤搜索结果

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| query | String | 是 | 搜索查询 |
| includeDomains | List | 否 | 包含的域名列表 |
| excludeDomains | List | 否 | 排除的域名列表 |

**请求示例**:

```bash
curl -X GET "http://localhost:8086/api/search/filtered?query=python&includeDomains=wikipedia.org,github.com"
```

### 5. 健康检查

**接口**: `GET /search/health`

**描述**: 检查服务健康状态

**请求示例**:

```bash
curl -X GET "http://localhost:8086/api/search/health"
```

**响应示例**:

```json
{
  "code": 200,
  "message": "成功",
  "data": "Web Search Service is running",
  "timestamp": 1736659200000
}
```

## 缓存管理

### 1. 清除指定缓存

**接口**: `DELETE /cache/{query}`

**描述**: 清除指定查询的缓存

**请求示例**:

```bash
curl -X DELETE "http://localhost:8086/api/cache/人工智能"
```

### 2. 清除所有缓存

**接口**: `DELETE /cache/all`

**描述**: 清除所有搜索缓存

**请求示例**:

```bash
curl -X DELETE "http://localhost:8086/api/cache/all"
```

### 3. 获取缓存统计

**接口**: `GET /cache/stats`

**描述**: 获取缓存统计信息

**请求示例**:

```bash
curl -X GET "http://localhost:8086/api/cache/stats"
```

**响应示例**:

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "cachedQueries": 42,
    "lastAccessTime": 1736659200000
  },
  "timestamp": 1736659200000
}
```

## Graph 集成接口

### 使用示例

```java
// 配置搜索节点
WebSearchNodeConfig config = WebSearchNodeConfig.builder()
    .queryTemplate("{{user_message}}")
    .maxResults(5)
    .includeAnswer(true)
    .promptTemplate("基于以下搜索结果回答:\n{{search_results}}\n\n问题:{{user_message}}")
    .build();

// 准备上下文
Map<String, Object> context = new HashMap<>();
context.put("user_message", "什么是人工智能?");

// 执行搜索
NodeResult result = webSearchNode.execute(config, context);

// 使用结果
if (result.getSuccess()) {
    String enhancedPrompt = (String) context.get("enhancedPrompt");
    List<SearchResultItem> results = (List<SearchResultItem>) context.get("searchResults");
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |

## 通用响应格式

所有接口返回统一的响应格式:

```json
{
  "code": 200,
  "message": "成功",
  "data": {},
  "timestamp": 1736659200000
}
```

## 限制说明

1. **请求频率**: 受 Tavily API 限制,免费账户每月1000次
2. **查询长度**: 建议不超过500字符
3. **结果数量**: 单次最多返回100条结果
4. **缓存时间**: 默认30分钟

## 最佳实践

1. **使用高级搜索**: 精确控制搜索参数,减少不必要的结果
2. **合理使用缓存**: 相同查询30分钟内不会重复调用API
3. **域名过滤**: 使用 includeDomains/excludeDomains 提高结果质量
4. **搜索深度**: basic适合一般搜索,advanced适合深度研究
5. **主题选择**: 新闻搜索使用 topic=news
