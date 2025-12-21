# 用户资料服务模块说明

## 模块结构

用户资料服务采用分层架构，包含以下模块：

### 1. Controller层
**文件**: `com.heartsphere.controller.UserProfileController`
- 处理HTTP请求
- 参数验证
- 调用Service层
- 返回统一格式的响应

### 2. Service层
**文件**: `com.heartsphere.service.UserProfileService`
- 业务逻辑处理
- 数据统计计算
- 数据库操作封装

### 3. DTO层
**文件**: 
- `com.heartsphere.dto.UpdateUserProfileRequest` - 更新资料请求DTO
- `com.heartsphere.dto.UserProfileStatisticsDTO` - 统计数据DTO
- `com.heartsphere.dto.UserDTO` - 用户信息DTO（已存在）

### 4. Repository层
使用现有的Repository：
- `UserRepository` - 用户数据访问
- `CharacterRepository` - 角色数据访问
- `JournalEntryRepository` - 日记数据访问
- `EraRepository` - 场景数据访问
- `ScriptRepository` - 剧本数据访问

## API接口

### 基础路径
```
/api/user/profile
```

### 1. 获取用户资料
**接口**: `GET /api/user/profile`
**认证**: 需要Bearer Token
**响应**: 
```json
{
  "success": true,
  "message": "获取用户资料成功",
  "data": {
    "id": 1,
    "username": "user123",
    "email": "user@example.com",
    "nickname": "用户昵称",
    "avatar": "avatar_url",
    "wechatOpenid": "openid123",
    "isEnabled": true,
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
}
```

### 2. 更新用户资料
**接口**: `PUT /api/user/profile`
**认证**: 需要Bearer Token
**请求体**:
```json
{
  "nickname": "新昵称",
  "avatar": "新头像URL"
}
```
**说明**: nickname和avatar都是可选的，只传需要更新的字段

### 3. 更新昵称
**接口**: `PUT /api/user/profile/nickname`
**认证**: 需要Bearer Token
**请求体**:
```json
{
  "nickname": "新昵称"
}
```

### 4. 更新头像
**接口**: `PUT /api/user/profile/avatar`
**认证**: 需要Bearer Token
**请求体**:
```json
{
  "avatar": "新头像URL"
}
```

### 5. 获取用户统计数据
**接口**: `GET /api/user/profile/statistics`
**认证**: 需要Bearer Token
**响应**:
```json
{
  "success": true,
  "message": "获取统计数据成功",
  "data": {
    "scenesCount": 5,
    "charactersCount": 10,
    "totalMessages": 100,
    "activeDays": 30,
    "journalEntriesCount": 20,
    "customCharactersCount": 10,
    "customScenesCount": 5,
    "customScriptsCount": 3,
    "totalMails": 15,
    "unreadMails": 2
  }
}
```

## 统计数据说明

### 心域探索统计
- `scenesCount`: 用户拥有的场景数（通过Era查询）
- `charactersCount`: 用户创建的自定义角色数
- `totalMessages`: 总对话消息数（当前返回0，后续可扩展）
- `activeDays`: 活跃天数（从注册时间到现在）

### 内容创作统计
- `journalEntriesCount`: 日记条目数
- `customCharactersCount`: 自定义角色数（同charactersCount）
- `customScenesCount`: 自定义场景数（同scenesCount）
- `customScriptsCount`: 用户创建的剧本数

### 社交互动统计
- `totalMails`: 时光信件总数（当前返回0，后续可扩展）
- `unreadMails`: 未读信件数（当前返回0，后续可扩展）

## 代码特点

1. **独立服务模块**: 所有用户资料相关的功能都集中在独立的Service和Controller中
2. **统一的异常处理**: 使用统一的异常处理机制
3. **参数验证**: 使用Jakarta Validation进行参数验证
4. **事务管理**: 使用@Transactional确保数据一致性
5. **日志记录**: 使用SLF4J记录日志
6. **RESTful设计**: 遵循RESTful API设计规范

## 使用示例

### 前端调用示例

```typescript
import { userProfileApi } from './services/api';

// 获取用户资料
const profile = await userProfileApi.getProfile(token);

// 更新昵称
await userProfileApi.updateNickname(token, '新昵称');

// 更新头像
await userProfileApi.updateAvatar(token, 'https://example.com/avatar.jpg');

// 获取统计数据
const statistics = await userProfileApi.getStatistics(token);
```

## 扩展建议

1. **消息统计**: 可以添加消息记录表来统计totalMessages
2. **信件统计**: 可以集成现有的信件系统来统计totalMails和unreadMails
3. **访问记录**: 可以添加场景访问记录表来更准确地统计scenesCount
4. **缓存优化**: 对于统计数据，可以考虑添加缓存以提高性能
5. **分页查询**: 如果数据量大，可以考虑添加分页查询功能

