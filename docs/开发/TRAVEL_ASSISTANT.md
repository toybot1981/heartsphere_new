# 旅游出行助手 Agent 功能说明

## 功能概览

### 1. 航班查询与预订
- **查询航班**: 支持单程和往返航班查询
- **预订机票**: 支持多乘客预订
- **航班信息**: 包含航班号、航空公司、机型、时间、价格等

### 2. 酒店查询与预订
- **查询酒店**: 支持按城市、日期、人数、星级筛选
- **预订酒店**: 支持在线预订
- **酒店信息**: 包含位置、价格、评分、设施等

### 3. 出行建议
- **景点推荐**: 根据目的地推荐热门景点
- **美食推荐**: 推荐当地特色餐厅
- **行程安排**: 自动生成多日行程计划
- **交通建议**: 提供机场、地铁、出租车信息
- **天气建议**: 提供天气信息和出行建议
- **预算建议**: 根据预算等级提供消费建议

### 4. 行程管理
- **创建行程**: 记录完整的旅行计划
- **查看行程**: 查看所有历史行程
- **更新行程**: 修改行程信息
- **删除行程**: 删除不需要的行程

### 5. 航班提醒
- **自动提醒**: 系统每小时检查即将起飞的航班（24小时内）
- **提醒通知**: 自动发送航班提醒（可集成短信、邮件、推送等）

## API 端点

### 航班相关
- `POST /api/travel/flights/search` - 查询航班
- `POST /api/travel/flights/book` - 预订机票

### 酒店相关
- `POST /api/travel/hotels/search` - 查询酒店
- `POST /api/travel/hotels/book` - 预订酒店

### 出行建议
- `POST /api/travel/advice` - 获取出行建议

### 行程管理
- `POST /api/travel/itinerary/create` - 创建行程
- `GET /api/travel/itinerary/list?userId={userId}` - 获取用户行程列表
- `GET /api/travel/itinerary/{travelId}` - 获取行程详情
- `PUT /api/travel/itinerary/{travelId}` - 更新行程
- `DELETE /api/travel/itinerary/{travelId}` - 删除行程

### 航班提醒
- `GET /api/travel/reminders/upcoming` - 获取即将起飞的航班

## 已创建的工具

1. **search_flights** - 航班查询工具
2. **search_hotels** - 酒店查询工具
3. **get_travel_advice** - 出行建议工具
4. **book_flight** - 机票预订工具
5. **book_hotel** - 酒店预订工具

## 已创建的 Agent

- **travel-assistant-agent** - 旅游出行助手
  - 类型: TEXT
  - 模型: qwen-max
  - 工具: 5个旅游相关工具

## 数据库结构

行程数据存储在 `travels` 表中，包含以下字段：
- `id`: 主键
- `travelId`: 唯一标识
- `userId`: 用户 ID
- `destination`: 目的地
- `startDate`: 出发日期
- `endDate`: 返回日期
- `flightNumber`: 航班号
- `flightDepartureTime`: 航班起飞时间
- `hotelId`: 酒店 ID
- `hotelName`: 酒店名称
- `itinerary`: 行程安排（JSON）
- `notes`: 备注
- `flightReminderSent`: 提醒是否已发送

## 使用示例

### 查询航班
```bash
curl -X POST http://localhost:8082/api/travel/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "北京",
    "destination": "上海",
    "date": "2024-12-25",
    "returnDate": "2024-12-28"
  }'
```

### 查询酒店
```bash
curl -X POST http://localhost:8082/api/travel/hotels/search \
  -H "Content-Type: application/json" \
  -d '{
    "city": "北京",
    "checkIn": "2024-12-25",
    "checkOut": "2024-12-28",
    "guests": 2,
    "stars": 4
  }'
```

### 获取出行建议
```bash
curl -X POST http://localhost:8082/api/travel/advice \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "北京",
    "duration": 3,
    "interests": "景点",
    "budget": "中等"
  }'
```

### 创建行程
```bash
curl -X POST http://localhost:8082/api/travel/itinerary/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "destination": "北京",
    "startDate": "2024-12-25T08:00:00",
    "endDate": "2024-12-28T20:00:00",
    "flightNumber": "CA1234",
    "flightDepartureTime": "2024-12-25T10:00:00",
    "hotelId": "H1000",
    "hotelName": "希尔顿酒店",
    "itinerary": "{\"day1\":\"景点游览\"}",
    "notes": "注意天气变化"
  }'
```

## 前端界面

访问地址: http://localhost:8082/travel-assistant.html

界面功能:
- ✅ 航班查询与预订
- ✅ 酒店查询与预订
- ✅ 出行建议获取
- ✅ 行程管理
- ✅ 航班提醒查看

## 定时任务

系统每小时自动检查即将起飞的航班（未来24小时内），并发送提醒。

## 未来扩展（MCP 集成）

当前实现使用模拟数据，未来可以通过 MCP 形式集成：
1. **真实航班数据 API** - 通过 MCP 调用航空公司或第三方 API
2. **真实酒店数据 API** - 通过 MCP 调用酒店预订平台 API
3. **支付网关** - 通过 MCP 集成支付功能
4. **通知服务** - 通过 MCP 集成短信、邮件、推送通知
5. **地图服务** - 通过 MCP 集成地图和导航功能

## 注意事项

1. 当前使用模拟数据，实际预订功能需要集成真实的预订 API
2. 航班提醒功能需要配置通知服务（短信、邮件等）
3. 定时任务需要确保 Spring Scheduling 已启用
4. 建议在生产环境中添加用户认证和权限控制








