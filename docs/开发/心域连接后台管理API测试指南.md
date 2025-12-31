# 心域连接后台管理 API 测试指南

## 概述

本文档提供了心域连接后台管理模块的 API 测试指南，包括测试脚本和使用说明。

## 前置条件

1. 后端服务运行在 `http://localhost:8081`
2. 已创建管理员账号并获取管理员 Token
3. 安装必要的测试工具（curl、Postman 或类似工具）

## 获取管理员 Token

```bash
# 登录获取 Token
curl -X POST http://localhost:8081/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "your_password"
  }'
```

响应示例：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "username": "admin"
    }
  }
}
```

## API 测试

### 1. 共享配置管理

#### 1.1 获取共享配置列表
```bash
curl -X GET "http://localhost:8081/api/admin/heartsphere-connection/share-configs?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 1.2 获取共享配置详情
```bash
curl -X GET "http://localhost:8081/api/admin/heartsphere-connection/share-configs/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 1.3 禁用共享配置
```bash
curl -X POST "http://localhost:8081/api/admin/heartsphere-connection/share-configs/1/disable" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "测试禁用"
  }'
```

#### 1.4 启用共享配置
```bash
curl -X POST "http://localhost:8081/api/admin/heartsphere-connection/share-configs/1/enable" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 1.5 删除共享配置
```bash
curl -X DELETE "http://localhost:8081/api/admin/heartsphere-connection/share-configs/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "测试删除"
  }'
```

### 2. 连接请求管理

#### 2.1 获取连接请求列表
```bash
curl -X GET "http://localhost:8081/api/admin/heartsphere-connection/connection-requests?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 2.2 审核通过连接请求
```bash
curl -X POST "http://localhost:8081/api/admin/heartsphere-connection/connection-requests/1/approve" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "adminNote": "管理员审核通过"
  }'
```

#### 2.3 拒绝连接请求
```bash
curl -X POST "http://localhost:8081/api/admin/heartsphere-connection/connection-requests/1/reject" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "不符合要求"
  }'
```

### 3. 访问记录管理

#### 3.1 获取访问记录列表
```bash
curl -X GET "http://localhost:8081/api/admin/heartsphere-connection/access-records?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3.2 获取访问记录详情
```bash
curl -X GET "http://localhost:8081/api/admin/heartsphere-connection/access-records/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. 留言管理

#### 4.1 获取留言列表
```bash
curl -X GET "http://localhost:8081/api/admin/heartsphere-connection/warm-messages?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4.2 删除留言
```bash
curl -X DELETE "http://localhost:8081/api/admin/heartsphere-connection/warm-messages/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "管理员删除"
  }'
```

### 5. 数据统计

#### 5.1 获取统计数据概览
```bash
curl -X GET "http://localhost:8081/api/admin/heartsphere-connection/statistics/overview" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5.2 获取趋势数据
```bash
curl -X GET "http://localhost:8081/api/admin/heartsphere-connection/statistics/trends?period=daily&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. 异常处理

#### 6.1 获取异常列表
```bash
curl -X GET "http://localhost:8081/api/admin/heartsphere-connection/exceptions?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 6.2 处理异常
```bash
curl -X POST "http://localhost:8081/api/admin/heartsphere-connection/exceptions/1/handle" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "handleResult": "已处理",
    "adminNote": "管理员处理"
  }'
```

### 7. 投诉管理

#### 7.1 获取投诉列表
```bash
curl -X GET "http://localhost:8081/api/admin/heartsphere-connection/complaints?page=0&size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 7.2 处理投诉
```bash
curl -X POST "http://localhost:8081/api/admin/heartsphere-connection/complaints/1/handle" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "handleResult": "已处理",
    "adminNote": "管理员处理"
  }'
```

## 测试脚本

### Node.js 测试脚本示例

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:8081/api';
let adminToken = '';

// 登录获取 Token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/admin/login`, {
      username: 'admin',
      password: 'your_password'
    });
    adminToken = response.data.data.token;
    console.log('登录成功，Token:', adminToken.substring(0, 20) + '...');
    return adminToken;
  } catch (error) {
    console.error('登录失败:', error.response?.data || error.message);
    throw error;
  }
}

// 测试获取共享配置列表
async function testGetShareConfigs() {
  try {
    const response = await axios.get(
      `${BASE_URL}/admin/heartsphere-connection/share-configs?page=0&size=20`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    console.log('获取共享配置列表成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取共享配置列表失败:', error.response?.data || error.message);
    throw error;
  }
}

// 运行测试
async function runTests() {
  try {
    await login();
    await testGetShareConfigs();
    console.log('所有测试通过！');
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

runTests();
```

## 常见错误处理

### 401 未授权
- 检查 Token 是否有效
- 重新登录获取新 Token

### 403 权限不足
- 检查管理员角色是否有相应权限
- 联系系统管理员分配权限

### 404 资源不存在
- 检查资源 ID 是否正确
- 确认资源是否已被删除

### 500 服务器错误
- 检查后端服务日志
- 确认数据库连接正常

## 测试检查清单

- [ ] 共享配置管理功能正常
- [ ] 连接请求管理功能正常
- [ ] 访问记录管理功能正常
- [ ] 留言管理功能正常
- [ ] 数据统计功能正常
- [ ] 异常处理功能正常
- [ ] 投诉管理功能正常
- [ ] 错误处理正确
- [ ] 权限验证正确
- [ ] 分页功能正常

## 性能测试

### 压力测试
使用 Apache Bench 或类似工具进行压力测试：

```bash
# 测试获取共享配置列表接口
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8081/api/admin/heartsphere-connection/share-configs?page=0&size=20"
```

## 注意事项

1. 测试前确保数据库中有测试数据
2. 测试删除操作时注意数据恢复
3. 测试时使用测试环境，避免影响生产数据
4. 定期更新测试脚本以适应 API 变更


