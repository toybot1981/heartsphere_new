# 记忆系统API测试说明

## 测试概述

本目录包含记忆系统相关的完整测试套件，包括单元测试和集成测试。

## 测试文件列表

### 1. 单元测试

#### MySQLLongMemoryServiceTest.java
- **位置**: `service/impl/MySQLLongMemoryServiceTest.java`
- **类型**: 单元测试（使用Mockito Mock）
- **覆盖内容**:
  - 用户事实（UserFact）的保存、获取、搜索
  - 用户偏好（UserPreference）的保存、获取
  - 记忆检索（retrieveRelevantMemories, retrieveMemoriesByContext）
  - 扩展方法（saveMemory, saveMemories, getMemoryById, deleteMemory）

#### MySQLShortMemoryServiceTest.java
- **位置**: `service/impl/MySQLShortMemoryServiceTest.java`
- **类型**: 单元测试（使用Mockito Mock）
- **覆盖内容**:
  - 消息管理（保存、获取、时间范围查询）
  - 会话管理（创建、获取、用户会话列表）
  - 工作记忆（保存、获取、删除、全部获取）
- **注意**: 部分方法需要根据实际服务实现进行调整

### 2. 集成测试

#### MemoryControllerIntegrationTest.java
- **位置**: `controller/MemoryControllerIntegrationTest.java`
- **类型**: 集成测试（使用真实数据库）
- **测试账号**: 
  - tongyexin / 123456
  - ty1 / Tyx@1234
  - heartsphere / Tyx@1234
- **覆盖内容**:
  - `POST /api/memory/v1/users/{userId}/memories` - 保存单个记忆
  - `POST /api/memory/v1/users/{userId}/memories/batch` - 批量保存记忆
  - `GET /api/memory/v1/users/{userId}/memories/search` - 搜索记忆
  - 权限验证（访问其他用户数据的403错误）
  - 空查询搜索
  - 完整字段验证
  - 多账号测试

#### MemoryAPIIntegrationTest.java
- **位置**: `integration/MemoryAPIIntegrationTest.java`
- **类型**: 完整集成测试（使用真实数据库）
- **测试账号**: 同上
- **覆盖内容**:
  - 完整的记忆生命周期（保存 -> 搜索 -> 数据库验证）
  - 批量保存不同类型的记忆（PERSONAL_INFO, PREFERENCE, EMOTIONAL_EXPERIENCE, HABIT）
  - 按重要性搜索记忆（CORE, IMPORTANT, NORMAL）
  - 所有测试账号的验证
  - 完整字段验证（包括metadata、structuredData、tags等）

## 运行测试

### 前置条件

1. **数据库连接**: 确保MySQL数据库运行并可访问
2. **测试账号**: 确保以下测试账号存在：
   - 用户名: `tongyexin`，密码: `123456`
   - 用户名: `ty1`，密码: `Tyx@1234`
   - 用户名: `heartsphere`，密码: `Tyx@1234`

### 运行所有记忆系统测试

```bash
cd backend
mvn test -Dtest="com.heartsphere.memory.**.*Test"
```

### 运行特定测试类

```bash
# 运行集成测试
mvn test -Dtest=MemoryControllerIntegrationTest

# 运行完整API集成测试
mvn test -Dtest=MemoryAPIIntegrationTest

# 运行单元测试
mvn test -Dtest=MySQLLongMemoryServiceTest
mvn test -Dtest=MySQLShortMemoryServiceTest
```

### 运行单个测试方法

```bash
mvn test -Dtest=MemoryControllerIntegrationTest#testSaveMemory
```

## 测试特点

### 1. 真实数据库验证
所有集成测试都使用真实的MySQL数据库，测试后会验证数据库中的数据：
- 使用 `userMemoryRepository.findById()` 验证数据已保存
- 使用 `userMemoryRepository.countByUserId()` 验证记录数量
- 使用 `userMemoryRepository.countByUserIdAndType()` 验证类型统计
- 使用 `userMemoryRepository.countByUserIdAndImportance()` 验证重要性统计

### 2. 测试账号验证
测试会使用三个不同的测试账号进行验证，确保：
- 每个账号都能正常登录
- 每个账号的记忆数据隔离（不会互相访问）
- 权限验证正确（403错误）

### 3. 完整字段验证
测试会验证记忆的所有字段：
- 基本字段：type, importance, content, source, sourceId
- 扩展字段：confidence, tags, metadata, structuredData
- 时间字段：createdAt, lastAccessedAt
- 统计字段：accessCount

### 4. 事务管理
所有集成测试都使用 `@Transactional` 注解，确保：
- 测试数据在测试后自动回滚
- 不会污染数据库
- 测试之间相互独立

## 测试覆盖的API端点

### POST /api/memory/v1/users/{userId}/memories
- ✅ 保存单个记忆
- ✅ 验证所有字段
- ✅ 权限验证（403错误）
- ✅ 数据库验证

### POST /api/memory/v1/users/{userId}/memories/batch
- ✅ 批量保存记忆
- ✅ 不同类型记忆
- ✅ 数据库验证（记录数量、类型统计）

### GET /api/memory/v1/users/{userId}/memories/search
- ✅ 关键词搜索
- ✅ 空查询搜索
- ✅ 搜索结果验证
- ✅ 数据库验证

## 测试数据清理

所有集成测试在 `@BeforeEach` 方法中都会：
1. 登录测试账号获取用户ID
2. 清理该用户的测试记忆数据（`userMemoryRepository.findByUserIdOrderByCreatedAtDesc(userId).forEach(repository::delete)`）

测试使用 `@Transactional` 确保测试后自动回滚，不会残留测试数据。

## 注意事项

1. **数据库连接**: 测试需要真实的MySQL数据库连接，确保 `application-test.properties` 或 `application-test.yml` 配置正确
2. **测试账号**: 确保测试账号存在且密码正确
3. **并发测试**: 如果多个测试同时运行，可能会产生数据冲突，建议使用 `@Transactional` 隔离
4. **性能**: 集成测试比单元测试慢，因为它们需要真实的数据库操作

## 扩展测试

如果需要添加新的测试：

1. **单元测试**: 在 `service/impl/` 目录下创建对应的测试类，使用Mockito Mock依赖
2. **集成测试**: 在 `controller/` 或 `integration/` 目录下创建测试类，继承 `BaseControllerTest` 或使用 `@SpringBootTest`
3. **测试数据**: 使用 `@BeforeEach` 准备测试数据，使用 `@AfterEach` 清理（或使用 `@Transactional` 自动回滚）
