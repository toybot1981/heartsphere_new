# Edu 系统测试指南

本文档说明如何测试 HeartSphere Edu 系统的各个功能模块。

## 📋 测试概览

### 测试类型

- **功能测试**: 验证所有功能是否正常工作
- **性能测试**: 测试 API 响应时间和系统性能
- **安全测试**: 验证安全漏洞和权限控制
- **集成测试**: 测试前后端集成
- **端到端测试**: 测试完整用户流程

## 🔧 测试环境准备

### 前置要求

- **Java**: JDK 17 或更高版本
- **Node.js**: 18.0 或更高版本
- **MySQL**: 8.0 或更高版本（测试数据库）
- **Maven**: 3.8 或更高版本
- **Postman / curl**: 用于 API 测试（可选）
- **浏览器**: Chrome / Firefox / Safari（用于前端测试）

### 数据库准备

1. 创建测试数据库：
```sql
CREATE DATABASE heartsphere_edu_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 配置测试环境变量：
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=heartsphere_edu_test
export DB_USER=root
export DB_PASSWORD=your_password
export SPRING_PROFILES_ACTIVE=test
```

## 🧪 功能测试

### 1. 后端功能测试

#### 1.1 启动后端服务

```bash
cd edu/backend
mvn spring-boot:run
```

服务将在 `http://localhost:8084` 启动。

#### 1.2 验证服务运行

访问健康检查端点（如果配置了 Actuator）：
```bash
curl http://localhost:8084/actuator/health
```

访问 Swagger UI：
```
http://localhost:8084/swagger-ui.html
```

#### 1.3 测试数字人角色管理 API

**创建角色**:
```bash
curl -X POST http://localhost:8084/api/edu/characters \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "数学老师",
    "characterType": "TEACHING_ASSISTANT",
    "description": "专业的数学教学助手",
    "avatarUrl": "https://example.com/avatar.png",
    "ageGroupSuitability": ["ELEMENTARY", "MIDDLE"],
    "subjectTags": ["数学"],
    "difficultyLevel": "INTERMEDIATE",
    "languageStyle": "FRIENDLY",
    "personality": ["耐心", "专业"],
    "specialFeatures": ["解题步骤详细", "互动式教学"]
  }'
```

**获取角色列表**:
```bash
curl -X GET "http://localhost:8084/api/edu/characters?page=0&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**获取角色详情**:
```bash
curl -X GET http://localhost:8084/api/edu/characters/{id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**更新角色**:
```bash
curl -X PUT http://localhost:8084/api/edu/characters/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "数学老师（更新）",
    "description": "更新后的描述"
  }'
```

**删除角色**:
```bash
curl -X DELETE http://localhost:8084/api/edu/characters/{id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**获取推荐角色**:
```bash
curl -X GET "http://localhost:8084/api/edu/characters/recommendations?studentId=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**获取角色统计**:
```bash
curl -X GET http://localhost:8084/api/edu/characters/{id}/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 1.4 测试互动记录管理 API

**记录互动**:
```bash
curl -X POST http://localhost:8084/api/edu/character-interactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "characterId": 1,
    "studentId": 1,
    "interactionType": "TEACHING_DIALOGUE",
    "content": "今天学习了二次方程",
    "durationMinutes": 30,
    "comprehensionLevel": "GOOD",
    "learningTopics": ["二次方程", "配方法"],
    "studentFeedback": "讲解很清晰"
  }'
```

**获取互动历史**:
```bash
curl -X GET "http://localhost:8084/api/edu/character-interactions?studentId=1&page=0&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**获取互动详情**:
```bash
curl -X GET http://localhost:8084/api/edu/character-interactions/{id} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**获取学生互动历史**:
```bash
curl -X GET http://localhost:8084/api/edu/character-interactions/students/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. 前端功能测试

#### 2.1 启动前端服务

```bash
cd edu/frontend
npm install
npm run dev
```

前端将在 `http://localhost:3000` 启动（或其他端口，见终端输出）。

#### 2.2 测试数字人角色列表页面

1. 访问 `/characters` 页面
2. 验证角色列表是否正确显示
3. 测试分页功能
4. 测试筛选功能（类型、年龄段、学科等）
5. 测试搜索功能

#### 2.3 测试数字人角色详情页面

1. 点击角色卡片进入详情页
2. 验证角色信息是否正确显示
3. 验证统计信息是否正确显示
4. 验证互动历史是否正确显示
5. 验证学习进度图表是否正确显示

#### 2.4 测试数字人推荐功能

1. 访问学生仪表板 `/dashboard`
2. 验证推荐角色是否正确显示
3. 测试点击推荐角色进入详情页
4. 验证推荐逻辑是否合理

#### 2.5 测试学习进度页面

1. 访问个人资料页面 `/profile`
2. 切换到"学习进度"标签
3. 验证学习统计是否正确显示
4. 验证互动历史列表是否正确显示
5. 测试筛选和排序功能

### 3. 集成测试

#### 3.1 前后端集成测试

1. **角色创建流程**:
   - 在前端填写角色信息
   - 提交创建请求
   - 验证后端是否成功创建
   - 验证前端是否成功显示新角色

2. **角色查询流程**:
   - 在前端触发角色列表查询
   - 验证后端是否正确返回数据
   - 验证前端是否正确显示数据

3. **互动记录流程**:
   - 在前端触发互动记录
   - 验证后端是否成功保存
   - 验证前端是否成功显示记录

#### 3.2 用户认证集成测试

1. **登录流程**:
   - 用户登录
   - 验证 token 是否正确存储
   - 验证 API 请求是否携带 token
   - 验证后端是否正确验证 token

2. **权限控制测试**:
   - 测试未登录用户访问受保护页面
   - 测试无效 token 访问 API
   - 测试过期 token 访问 API

## ⚡ 性能测试

### 1. API 响应时间测试

使用工具测试 API 响应时间（如 Apache Bench, wrk, 或 Postman）：

```bash
# 使用 Apache Bench 测试
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8084/api/edu/characters?page=0&size=10
```

**性能指标**:
- 平均响应时间 < 200ms
- 95% 响应时间 < 500ms
- 99% 响应时间 < 1000ms

### 2. 数据库性能测试

测试数据库查询性能：

```sql
-- 测试角色列表查询
EXPLAIN SELECT * FROM edu_characters WHERE age_group_suitability LIKE '%ELEMENTARY%';

-- 测试互动历史查询
EXPLAIN SELECT * FROM edu_character_interactions 
WHERE student_id = 1 
ORDER BY created_at DESC 
LIMIT 10;
```

### 3. 前端性能测试

使用浏览器开发者工具测试前端性能：

1. **页面加载时间**:
   - 打开 Chrome DevTools
   - 切换到 Performance 标签
   - 记录页面加载
   - 分析加载时间

2. **资源大小**:
   - 切换到 Network 标签
   - 刷新页面
   - 检查资源大小和加载时间

**性能指标**:
- 首屏加载时间 < 2s
- 资源总大小 < 1MB（gzip 后）
- JavaScript 执行时间 < 500ms

## 🔐 安全测试

### 1. SQL 注入测试

测试输入验证和参数化查询：

```bash
# 测试 SQL 注入（应该被拒绝）
curl -X GET "http://localhost:8084/api/edu/characters?name=' OR '1'='1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. XSS 攻击测试

测试前端输入验证和输出转义：

1. 在角色名称中输入 `<script>alert('XSS')</script>`
2. 验证前端是否正确转义
3. 验证后端是否正确验证

### 3. 权限控制测试

1. **未授权访问测试**:
```bash
# 不带 token 访问 API（应该返回 401）
curl -X GET http://localhost:8084/api/edu/characters
```

2. **无效 token 测试**:
```bash
# 使用无效 token 访问 API（应该返回 401）
curl -X GET http://localhost:8084/api/edu/characters \
  -H "Authorization: Bearer invalid_token"
```

3. **过期 token 测试**:
```bash
# 使用过期 token 访问 API（应该返回 401）
curl -X GET http://localhost:8084/api/edu/characters \
  -H "Authorization: Bearer expired_token"
```

### 4. CORS 测试

测试跨域访问控制：

```bash
# 测试 CORS（从不同域名访问）
curl -X GET http://localhost:8084/api/edu/characters \
  -H "Origin: http://example.com" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v
```

## 📊 测试报告

### 测试清单

- [ ] 后端 API 功能测试（11个端点）
- [ ] 前端页面功能测试（4个页面）
- [ ] 前后端集成测试
- [ ] 用户认证集成测试
- [ ] API 性能测试
- [ ] 数据库性能测试
- [ ] 前端性能测试
- [ ] SQL 注入测试
- [ ] XSS 攻击测试
- [ ] 权限控制测试
- [ ] CORS 测试

### 测试结果记录

记录测试结果，包括：
- 测试用例名称
- 测试结果（通过/失败）
- 测试时间
- 错误信息（如果有）
- 截图或日志（如果有）

## 🐛 问题报告

如果发现问题，请记录：

1. **问题描述**: 详细描述问题
2. **复现步骤**: 如何复现问题
3. **预期行为**: 预期应该发生什么
4. **实际行为**: 实际发生了什么
5. **环境信息**: 操作系统、浏览器、版本等
6. **日志信息**: 相关日志或错误信息
7. **截图**: 如果有截图

## 📚 相关文档

- [README](./README.md)
- [后端部署文档](./backend/DEPLOYMENT.md)
- [前端部署文档](./frontend/DEPLOYMENT.md)
- [API 文档](http://localhost:8084/swagger-ui.html)（开发环境）

---

**最后更新：2026-01-10**
