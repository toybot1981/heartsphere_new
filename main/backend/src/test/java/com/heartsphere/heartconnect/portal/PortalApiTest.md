# 传送门API测试指南

## 前提条件

1. **启用传送门功能**
   - 在 `application.yml` 中设置：`heartconnect.portal.enabled=true`
   - 或通过环境变量：`PORTAL_ENABLED=true`

2. **数据库迁移**
   - 确保 Flyway 已执行迁移脚本 `V20260107__create_portal_tables.sql`
   - 检查数据库中是否存在以下表：
     - `portal_config`
     - `portal_permission`
     - `portal_teleportation_log`

3. **用户认证**
   - 需要先登录获取 JWT token
   - 测试时需要提供 `Authorization: Bearer <token>` 头

## API端点列表

### 1. 创建传送门
**POST** `/api/portal`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sceneId": 1,
  "portalName": "测试传送门",
  "portalType": "stargate",
  "targetShareCode": "HS-XXXXXX",
  "positionX": 0.0,
  "positionY": 0.0,
  "positionZ": 0.0,
  "size": 3.0,
  "permissionType": "public",
  "description": "这是一个测试传送门"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "传送门创建成功",
  "data": {
    "id": 1,
    "userId": 1,
    "sceneId": 1,
    "portalName": "测试传送门",
    "portalType": "stargate",
    "targetHeartsphereId": 2,
    "targetShareCode": "HS-XXXXXX",
    "positionX": 0.0,
    "positionY": 0.0,
    "positionZ": 0.0,
    "size": 3.0,
    "permissionType": "public",
    "description": "这是一个测试传送门",
    "isActive": true,
    "createdAt": 1704614400000,
    "updatedAt": 1704614400000
  }
}
```

### 2. 获取场景传送门列表
**GET** `/api/portal/scene/{sceneId}?onlyActive=true`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "portalName": "测试传送门",
      ...
    }
  ]
}
```

### 3. 获取传送门详情
**GET** `/api/portal/{portalId}`

### 4. 获取传送门预览
**GET** `/api/portal/{portalId}/preview`

### 5. 更新传送门
**PUT** `/api/portal/{portalId}`

**Request Body:**
```json
{
  "portalName": "更新后的传送门名称",
  "size": 4.0,
  "isActive": true
}
```

### 6. 删除传送门
**DELETE** `/api/portal/{portalId}`

### 7. 执行传送
**POST** `/api/portal/{portalId}/teleport`

**Request Body:**
```json
{
  "skipAnimation": false
}
```

**Response:**
```json
{
  "code": 200,
  "message": "传送成功",
  "data": {
    "success": true,
    "targetHeartsphereId": 2,
    "targetShareCode": "HS-XXXXXX",
    "durationMs": 150
  }
}
```

### 8. 请求传送权限（占位）
**POST** `/api/portal/{portalId}/request`

### 9. 发送传送门邀请（占位）
**POST** `/api/portal/{portalId}/invite`

## 使用curl测试

### 创建传送门
```bash
curl -X POST http://localhost:8081/api/portal \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sceneId": 1,
    "portalName": "测试传送门",
    "portalType": "stargate",
    "targetShareCode": "HS-XXXXXX",
    "permissionType": "public"
  }'
```

### 获取场景传送门列表
```bash
curl -X GET "http://localhost:8081/api/portal/scene/1?onlyActive=true" \
  -H "Authorization: Bearer <your-token>"
```

### 获取传送门预览
```bash
curl -X GET "http://localhost:8081/api/portal/1/preview" \
  -H "Authorization: Bearer <your-token>"
```

### 执行传送
```bash
curl -X POST "http://localhost:8081/api/portal/1/teleport" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"skipAnimation": false}'
```

## 错误场景测试

### 1. 功能未启用
设置 `heartconnect.portal.enabled=false`，所有API应返回：
```json
{
  "code": 500,
  "message": "传送门功能未启用"
}
```

### 2. 未登录
不提供 Authorization 头，应返回 401 错误

### 3. 无权限
尝试修改或删除他人的传送门，应返回权限错误

### 4. 无效的共享码
使用无效的 `targetShareCode`，应返回目标心域不存在错误

### 5. 传送到自己的心域
`targetHeartsphereId` 等于当前用户ID，应返回错误

## 测试检查清单

- [ ] 功能开关测试（启用/禁用）
- [ ] 创建传送门（各种类型：stargate, wormhole, quantum）
- [ ] 更新传送门
- [ ] 删除传送门
- [ ] 获取场景传送门列表
- [ ] 获取传送门详情
- [ ] 获取传送门预览
- [ ] 执行传送（公开权限）
- [ ] 权限验证（审批/邀请）
- [ ] 错误处理测试

## 注意事项

1. 确保目标心域存在且有有效的共享码
2. 测试权限时需要先建立连接或授予权限
3. 传送门类型必须是：`stargate`、`wormhole` 或 `quantum`
4. 权限类型必须是：`public`、`approval` 或 `invite`
