# Agent Mind 管理模块快速开始指南

## 前置条件

1. **数据库准备**
   - 确保 MySQL 数据库已安装并运行
   - 确保 `heartsphere_agent_mind` 数据库已创建
   - 确保数据库表已创建（`agent_identity`, `agent_state_history`）

2. **环境配置**
   - Java 17+
   - Node.js 16+
   - Maven 3.6+
   - Admin 后端和前端已配置

## 快速启动

### 1. 配置数据库连接

编辑 `admin/backend/src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    agent-mind:
      url: jdbc:mysql://localhost:3306/heartsphere_agent_mind?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai
      username: root
      password: your_password
```

### 2. 启动 Admin 后端

```bash
cd admin/backend
mvn spring-boot:run
```

后端将在 `http://localhost:8085` 启动

### 3. 启动 Admin 前端

```bash
cd admin/frontend
npm install
npm run dev
```

前端将在 `http://localhost:3005` 启动

### 4. 访问管理界面

1. 打开浏览器访问 `http://localhost:3005`
2. 使用管理员账号登录
3. 在侧边栏找到"系统配置" → "Agent Mind 管理"
4. 点击进入管理页面

## 功能验证

### 验证身份认知管理

1. 进入"身份认知管理"标签页
2. 查看智能体列表
3. 点击"查看详情"查看身份认知信息
4. 测试搜索功能

### 验证状态监控

1. 在身份认知列表中选择一个角色
2. 切换到"状态监控"标签页
3. 查看当前状态、统计和历史记录

### 验证能力管理

1. 在身份认知列表中选择一个角色
2. 切换到"能力管理"标签页
3. 查看能力列表和能力边界

## API 测试

### 使用 curl 测试 API

#### 获取身份认知列表
```bash
curl -X GET "http://localhost:8085/api/admin/agent-mind/identities?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 获取单个身份认知
```bash
curl -X GET "http://localhost:8085/api/admin/agent-mind/identities/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 获取状态历史
```bash
curl -X GET "http://localhost:8085/api/admin/agent-mind/states/1/history?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 获取能力列表
```bash
curl -X GET "http://localhost:8085/api/admin/agent-mind/capabilities/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 使用 Swagger UI 测试

1. 访问 `http://localhost:8085/swagger-ui.html`
2. 找到 "Agent Mind Management" 标签
3. 展开各个 API 端点
4. 点击 "Try it out" 进行测试

## 常见问题排查

### 问题 1: 无法连接到数据库

**症状**: 启动时出现数据库连接错误

**解决方案**:
1. 检查数据库是否运行: `mysql -u root -p`
2. 检查数据库是否存在: `SHOW DATABASES;`
3. 检查配置文件中的连接信息
4. 检查防火墙设置

### 问题 2: 前端页面无法访问

**症状**: 404 错误或页面空白

**解决方案**:
1. 检查前端是否正常启动
2. 检查路由配置是否正确
3. 检查浏览器控制台是否有错误
4. 清除浏览器缓存

### 问题 3: API 返回 401 未授权

**症状**: API 调用返回 401 错误

**解决方案**:
1. 检查是否已登录
2. 检查 Token 是否有效
3. 检查 Token 是否在请求头中正确传递
4. 重新登录获取新 Token

### 问题 4: 数据为空

**症状**: 列表显示为空

**解决方案**:
1. 检查 Agent Mind 数据库是否有数据
2. 检查数据源配置是否正确
3. 检查 Repository 是否正确使用数据源
4. 查看后端日志是否有错误

## 开发调试

### 后端调试

1. **启用调试日志**
   在 `application.yml` 中设置：
   ```yaml
   logging:
     level:
       com.heartsphere.admin.service.agentmind: DEBUG
   ```

2. **查看 SQL 查询**
   在 `application.yml` 中设置：
   ```yaml
   spring:
     jpa:
       show-sql: true
   ```

### 前端调试

1. **打开浏览器开发者工具**
   - F12 或右键 → 检查
   - 查看 Console 标签页
   - 查看 Network 标签页

2. **检查 API 请求**
   - 查看请求 URL 是否正确
   - 查看请求参数是否正确
   - 查看响应数据格式

## 下一步

完成快速开始后，可以：

1. **阅读使用指南**
   - 查看 `USAGE_GUIDE.md` 了解详细功能

2. **查看实施总结**
   - 查看 `IMPLEMENTATION_SUMMARY.md` 了解技术细节

3. **开始使用**
   - 开始管理智能体的身份认知
   - 监控智能体的状态
   - 配置智能体的能力

## 获取帮助

如有问题，可以：
1. 查看项目文档
2. 查看代码注释
3. 联系开发团队
