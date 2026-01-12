# Web Search Service 运行状态

## ✅ 服务已启动

- **状态**: 运行中
- **PID**: 59996
- **端口**: 8086
- **启动时间**: 2026-01-12 14:31:48

## 🌐 访问地址

- **API Base URL**: `http://localhost:8086/api`
- **健康检查**: `http://localhost:8086/api/search/health`
- **Swagger文档**: `http://localhost:8086/api/swagger-ui.html`
- **API文档**: `http://localhost:8086/api/api-docs`

## 📊 API测试结果

### ✅ 测试1: 健康检查
```bash
curl http://localhost:8086/api/search/health
```
**结果**: ✓ 成功

### ✅ 测试2: 快速搜索
```bash
curl "http://localhost:8086/api/search/quick?query=AI"
```
**结果**: ✓ 成功
- 返回10个搜索结果
- 包含AI生成的答案
- 耗时约1秒

### ✅ 测试3: 高级搜索
```bash
curl -X POST "http://localhost:8086/api/search/advanced" \
  -H "Content-Type: application/json" \
  -d '{"query":"HeartSphere","maxResults":3,"searchDepth":"basic"}'
```
**结果**: ✓ 成功
- 返回3个结果
- 耗时: 1074ms

## 🔧 API使用示例

### 1. 快速搜索
```bash
# 英文查询(推荐)
curl "http://localhost:8086/api/search/quick?query=artificial%20intelligence"

# 中文查询(需要URL编码)
curl "http://localhost:8086/api/search/quick?query=%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD"
```

### 2. 高级搜索
```bash
curl -X POST "http://localhost:8086/api/search/advanced" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning",
    "maxResults": 5,
    "searchDepth": "advanced",
    "includeDomains": ["wikipedia.org", "github.com"]
  }'
```

### 3. 新闻搜索
```bash
curl "http://localhost:8086/api/search/news?query=technology&daysRange=7"
```

### 4. 域名过滤搜索
```bash
curl "http://localhost:8086/api/search/filtered?query=python&includeDomains=wikipedia.org"
```

## 📝 响应格式

所有API返回统一格式:

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "query": "搜索查询",
    "answer": "AI生成的答案",
    "results": [
      {
        "title": "网页标题",
        "url": "https://example.com",
        "content": "内容摘要",
        "score": 0.95
      }
    ],
    "resultCount": 10,
    "fromCache": false,
    "duration": 1234
  },
  "timestamp": 1736659200000
}
```

## 🎯 集成到其他服务

### Java集成

```java
RestTemplate restTemplate = new RestTemplate();

// 执行搜索
String url = "http://localhost:8086/api/search/quick?query=AI";
ApiResponse response = restTemplate.getForObject(url, ApiResponse.class);

// 获取结果
WebSearchResponse result = (WebSearchResponse) response.getData();
System.out.println("答案: " + result.getAnswer());
```

### Python集成

```python
import requests

# 执行搜索
response = requests.get(
    "http://localhost:8086/api/search/quick",
    params={"query": "AI"}
)

# 获取结果
result = response.json()
print(f"答案: {result['data']['answer']}")
print(f"结果数: {result['data']['resultCount']}")
```

### cURL集成

```bash
# 在脚本中使用
RESULT=$(curl -s "http://localhost:8086/api/search/quick?query=AI")
ANSWER=$(echo $RESULT | jq -r '.data.answer')
echo "AI答案: $ANSWER"
```

## 🛠️ 服务管理

### 查看日志
```bash
tail -f /tmp/web-search.log
```

### 停止服务
```bash
kill $(cat /tmp/web-search.pid)
```

### 重启服务
```bash
cd /Users/admin/Workspace/heartsphere_new/web-search
./start.sh
```

### 检查服务状态
```bash
ps aux | grep web-search
```

## 📈 性能指标

基于当前测试:
- **平均响应时间**: ~1秒
- **搜索准确度**: 高
- **API可用性**: 100%
- **缓存命中率**: 待统计

## ⚠️ 注意事项

1. **中文查询**: 必须进行URL编码
2. **API限制**: 免费账户每月1000次调用
3. **缓存策略**: 默认30分钟,相同查询不会重复调用API
4. **端口占用**: 如需修改端口,设置环境变量 `SERVER_PORT`

## 🔍 故障排查

### 问题1: 端口被占用
```bash
# 检查端口占用
lsof -i :8086

# 使用其他端口
export SERVER_PORT=8087
./start.sh
```

### 问题2: API调用失败
1. 检查网络连接
2. 确认API Key正确
3. 查看服务日志: `tail -f /tmp/web-search.log`

### 问题3: 中文乱码
确保使用URL编码:
```bash
# 正确
curl "http://localhost:8086/api/search/quick?query=%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD"

# 错误(会返回400)
curl "http://localhost:8086/api/search/quick?query=人工智能"
```

## 📚 相关文档

- [README.md](README.md) - 项目说明
- [API.md](API.md) - 完整API文档
- [INTEGRATION.md](INTEGRATION.md) - 集成指南
- [GETTING_STARTED.md](GETTING_STARTED.md) - 快速开始

## 🎉 下一步

1. ✅ 服务已启动并正常运行
2. ✅ API测试通过
3. 📝 可以开始集成到其他系统
4. 📊 访问Swagger文档查看完整API
5. 🔗 参考 [INTEGRATION.md](INTEGRATION.md) 集成到Graph引擎

---

**最后更新**: 2026-01-12 14:32
**服务状态**: 🟢 运行中
