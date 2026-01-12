# Web Search Service 快速开始

## 📋 前提条件

- Java 17 或更高版本
- Maven 3.6+
- 网络连接(用于访问Tavily API)

## 🚀 启动服务

### 方式一:使用启动脚本(推荐)

```bash
cd web-search
./start.sh
```

启动脚本会自动:
1. 检查Java环境
2. 首次运行时编译项目
3. 配置API Key
4. 启动服务

### 方式二:手动启动

```bash
cd web-search/backend

# 编译项目
mvn clean package -DskipTests

# 启动服务
java -jar target/web-search-1.0.0.jar
```

### 方式三:使用Maven插件

```bash
cd web-search/backend
mvn spring-boot:run
```

## ✅ 验证服务

### 1. 健康检查

```bash
curl http://localhost:8086/api/search/health
```

预期响应:
```json
{
  "code": 200,
  "message": "成功",
  "data": "Web Search Service is running"
}
```

### 2. 测试搜索

```bash
curl "http://localhost:8086/api/search/quick?query=人工智能"
```

### 3. 使用测试脚本

```bash
cd web-search
./test-api.sh
```

## 📖 查看API文档

服务启动后,访问Swagger UI:

```
http://localhost:8086/api/swagger-ui.html
```

## 🔧 配置

### 环境变量

```bash
# Tavily API Key(已配置默认值)
export TAVILY_API_KEY=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

# 服务端口(可选,默认8086)
export SERVER_PORT=8086

# Redis配置(可选,用于分布式缓存)
export REDIS_HOST=localhost
export REDIS_PORT=6379
```

### application.yml

编辑 `backend/src/main/resources/application.yml`:

```yaml
tavily:
  api-key: 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
  timeout: 30000
  max-retries: 3

search:
  default-max-results: 10
  cache-enabled: true
```

## 📝 使用示例

### cURL

```bash
# 快速搜索
curl "http://localhost:8086/api/search/quick?query=HeartSphere"

# 高级搜索
curl -X POST "http://localhost:8086/api/search/advanced" \
  -H "Content-Type: application/json" \
  -d '{"query":"AI最新进展","maxResults":5}'

# 新闻搜索
curl "http://localhost:8086/api/search/news?query=科技&daysRange=7"
```

### Python

```python
import requests

# 快速搜索
response = requests.get(
    "http://localhost:8086/api/search/quick",
    params={"query": "人工智能"}
)
result = response.json()
print(result['data']['answer'])
```

### Java

```java
RestTemplate restTemplate = new RestTemplate();

// 快速搜索
String url = "http://localhost:8086/api/search/quick?query=AI";
ApiResponse response = restTemplate.getForObject(url, ApiResponse.class);
WebSearchResponse result = (WebSearchResponse) response.getData();
```

## 🐳 Docker部署

```bash
cd web-search

# 启动服务(包含Redis)
docker-compose up -d

# 查看日志
docker-compose logs -f web-search

# 停止服务
docker-compose down
```

## 🔍 监控

### 健康检查端点

```bash
# 服务健康状态
curl http://localhost:8086/api/actuator/health

# 指标
curl http://localhost:8086/api/actuator/metrics
```

### 缓存统计

```bash
# 查看缓存统计
curl http://localhost:8086/api/cache/stats

# 清除所有缓存
curl -X DELETE http://localhost:8086/api/cache/all
```

## ⚠️ 常见问题

### 端口被占用

如果8086端口被占用,修改端口:

```bash
export SERVER_PORT=8087
./start.sh
```

### API调用失败

1. 检查网络连接
2. 确认API Key正确
3. 查看服务日志

### 查看日志

服务启动后,日志会输出到控制台,包括:
- 请求日志
- 搜索耗时
- 错误信息

## 📚 下一步

- 阅读 [README.md](README.md) 了解详细功能
- 查看 [API.md](API.md) 了解完整API文档
- 参考 [INTEGRATION.md](INTEGRATION.md) 集成到你的项目

## 🆘 获取帮助

如有问题,请查看:
1. 服务日志输出
2. Swagger API文档
3. GitHub Issues
