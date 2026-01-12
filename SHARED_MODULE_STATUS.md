# Shared 模块创建状态

**创建日期**: 2025-01-10  
**状态**: 基础结构已完成

---

## ✅ 已完成的 shared 模块

### 1. shared/backend/

#### DTO
- ✅ `ApiResponse<T>` - 统一API响应格式
  - 位置: `shared/backend/src/main/java/com/heartsphere/shared/dto/ApiResponse.java`
  - 状态: 已创建，包含完整的成功/失败响应方法

#### 异常类
- ✅ `BusinessException` - 业务异常基类
  - 位置: `shared/backend/src/main/java/com/heartsphere/shared/exception/BusinessException.java`
  - 状态: 已创建
  
- ✅ `ResourceNotFoundException` - 资源未找到异常
  - 位置: `shared/backend/src/main/java/com/heartsphere/shared/exception/ResourceNotFoundException.java`
  - 状态: 已创建
  
- ✅ `UnauthorizedException` - 未授权异常
  - 位置: `shared/backend/src/main/java/com/heartsphere/shared/exception/UnauthorizedException.java`
  - 状态: 已创建
  
- ✅ `ForbiddenException` - 禁止访问异常
  - 位置: `shared/backend/src/main/java/com/heartsphere/shared/exception/ForbiddenException.java`
  - 状态: 已创建

- ✅ `GlobalExceptionHandler` - 全局异常处理器（基础版本）
  - 位置: `shared/backend/src/main/java/com/heartsphere/shared/exception/GlobalExceptionHandler.java`
  - 状态: 已创建，包含基础异常处理

#### 配置文件
- ✅ `pom.xml` - Maven 配置
  - 状态: 已创建，包含必要的依赖（Spring Boot Web、Validation、Security等）

### 2. shared/frontend/

#### 类型定义
- ✅ `api-types.ts` - API类型定义
  - 位置: `shared/frontend/src/types/api-types.ts`
  - 包含: `ApiResponse<T>`, `PaginatedResponse<T>`, `BaseEntity`, `CreateDTO<T>`, `UpdateDTO<T>`
  - 状态: 已创建

#### 工具函数
- ✅ `tokenStorage.ts` - Token存储工具
  - 位置: `shared/frontend/src/utils/tokenStorage.ts`
  - 包含: 同步和异步版本的 Token 存储/获取/删除方法
  - 状态: 已创建

#### 入口文件
- ✅ `index.ts` - 模块入口
  - 位置: `shared/frontend/src/index.ts`
  - 状态: 已创建，导出所有共享代码

#### 配置文件
- ✅ `package.json` - npm 配置
  - 状态: 已创建，包含基础依赖

### 3. 文档
- ✅ `shared/README.md` - Shared 模块说明文档
  - 状态: 已创建

---

## 🔄 已更新的子项目

### company/backend
- ✅ 已更新 `pom.xml`，添加 shared-backend 依赖
- ✅ 已更新 `CompanyService.java`，使用 `com.heartsphere.shared.exception.BusinessException`
- ✅ 已更新 `CompanyController.java`，使用 `com.heartsphere.shared.dto.ApiResponse`
- ✅ 已删除本地副本 `ApiResponse.java`
- ✅ 已删除本地副本 `BusinessException.java`

### mentis/backend
- ⏳ 待更新：添加 shared-backend 依赖
- ⏳ 待更新：替换本地的 ApiResponse 和 BusinessException

### edu/backend
- ⏳ 待更新：代码开发后，添加 shared-backend 依赖

---

## ⏳ 待完成的工作

### 优先级 1（立即处理）

1. **更新 mentis/backend**
   - [ ] 添加 shared-backend 依赖到 `pom.xml`
   - [ ] 替换本地的 ApiResponse 和 BusinessException 引用
   - [ ] 测试构建

2. **更新各子项目前端**
   - [ ] 配置 npm/yarn workspace 或在各子项目中添加 shared-frontend 依赖
   - [ ] 替换本地的 API 类型定义和 tokenStorage
   - [ ] 测试构建

3. **修复依赖问题**
   - [ ] 确保 shared/backend 的依赖正确（Spring Boot Web、Validation 等）
   - [ ] 确保 shared/frontend 的依赖正确（React 等）
   - [ ] 测试构建

### 优先级 2（本周完成）

1. **提取更多公共代码**
   - [ ] `JwtUtils` - JWT工具类（需要评估是否所有子项目都需要）
   - [ ] `DTOMapper` - DTO映射器（需要评估）
   - [ ] 前端 `request.ts` - API请求函数（需要简化）
   - [ ] 前端 `crudFactory.ts` - CRUD工厂函数

2. **完善 GlobalExceptionHandler**
   - [ ] 添加各子项目特定的异常处理（如果需要）
   - [ ] 添加日志配置
   - [ ] 添加监控指标

3. **测试和验证**
   - [ ] 测试各子项目的构建
   - [ ] 测试各子项目的运行
   - [ ] 验证共享代码的使用

### 优先级 3（后续）

1. **提取 Entity 和 Repository**
   - [ ] 识别共享的实体类
   - [ ] 提取到 shared 模块
   - [ ] 更新各子项目的依赖

2. **提取公共配置**
   - [ ] 数据库配置
   - [ ] 安全配置
   - [ ] 日志配置

3. **提取公共组件（前端）**
   - [ ] 通用 UI 组件（如果 UI 风格统一）
   - [ ] 通用布局组件
   - [ ] 通用表单组件

---

## 📝 使用说明

### 后端使用方式

在各子项目的 `pom.xml` 中添加依赖：

```xml
<dependency>
    <groupId>com.heartsphere</groupId>
    <artifactId>heartsphere-shared-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>
```

然后在代码中使用：

```java
import com.heartsphere.shared.dto.ApiResponse;
import com.heartsphere.shared.exception.BusinessException;
import com.heartsphere.shared.exception.ResourceNotFoundException;

// 使用 ApiResponse
return ResponseEntity.ok(ApiResponse.success(data));

// 使用异常
throw new BusinessException("错误消息");
throw new ResourceNotFoundException("资源不存在");
```

### 前端使用方式

在各子项目的 `package.json` 中添加依赖：

```json
{
  "dependencies": {
    "@heartsphere/shared-frontend": "*"
  }
}
```

或使用 npm/yarn workspace（推荐）：

```json
{
  "workspaces": [
    "shared/frontend",
    "edu/frontend",
    "mentis/frontend",
    "company/frontend"
  ]
}
```

然后在代码中使用：

```typescript
import { ApiResponse, tokenStorage } from '@heartsphere/shared-frontend';

// 使用类型
const response: ApiResponse<User> = await fetch(...);

// 使用 tokenStorage
await tokenStorage.saveToken(token);
const token = await tokenStorage.getToken();
```

---

## 🎯 下一步

1. 更新 mentis/backend 使用 shared 模块
2. 更新各子项目前端使用 shared 模块
3. 测试构建和运行
4. 提取更多公共代码

---

**最后更新**: 2025-01-10
