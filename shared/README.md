# HeartSphere Shared Module

共享代码库，包含所有子项目（client、edu、mentis、company、admin）共用的代码。

> **注意**：shared 模块必须最先完成，因为其他所有项目都依赖它。

## 目录结构

```
shared/
├── backend/              # 共享后端模块
│   └── src/main/java/com/heartsphere/shared/
│       ├── dto/          # 公共 DTO（ApiResponse 等）
│       ├── exception/    # 公共异常类（BusinessException 等）
│       ├── util/         # 公共工具类（待提取）
│       └── config/       # 公共配置类（待提取）
├── frontend/             # 共享前端模块
│   └── src/
│       ├── types/        # 公共类型定义（ApiResponse 等）
│       ├── utils/        # 公共工具函数（tokenStorage 等）
│       ├── components/   # 公共组件（待提取）
│       └── services/     # 公共 API 服务（待提取）
└── config/               # 共享配置
    ├── database/         # 数据库配置（待创建）
    ├── env/              # 环境变量配置（待创建）
    └── docs/             # 共享文档（待创建）
```

## 已提取的共享代码

### 后端（shared-backend）

#### DTO
- ✅ `ApiResponse<T>` - 统一API响应格式

#### 异常类
- ✅ `BusinessException` - 业务异常基类
- ✅ `ResourceNotFoundException` - 资源未找到异常
- ✅ `UnauthorizedException` - 未授权异常
- ✅ `ForbiddenException` - 禁止访问异常
- ✅ `GlobalExceptionHandler` - 全局异常处理器（基础版本）

### 前端（shared-frontend）

#### 类型定义
- ✅ `ApiResponse<T>` - API响应类型
- ✅ `PaginatedResponse<T>` - 分页响应类型
- ✅ `BaseEntity` - 基础实体类型
- ✅ `CreateDTO<T>`、`UpdateDTO<T>` - DTO类型

#### 工具函数
- ✅ `tokenStorage` - Token存储工具

## 待提取的共享代码

### 后端
- [ ] `JwtUtils` - JWT工具类
- [ ] `DTOMapper` - DTO映射器
- [ ] 数据库实体类（Entity）- 需要识别哪些是共享的
- [ ] 公共配置类（Config）- 需要识别哪些是共享的

### 前端
- [ ] `request.ts` - API请求函数（需要简化）
- [ ] `crudFactory.ts` - CRUD工厂函数
- [ ] 公共组件（Button、Input等）- 如果UI风格统一
- [ ] 类型定义（Character、Era等）- 需要识别哪些是共享的

## 使用方式

### 后端（Maven 多模块项目）

在各子项目的 `pom.xml` 中添加依赖：

```xml
<dependency>
    <groupId>com.heartsphere</groupId>
    <artifactId>heartsphere-shared-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>
```

### 前端（npm/yarn workspace）

在各子项目的 `package.json` 中添加依赖：

```json
{
  "dependencies": {
    "@heartsphere/shared-frontend": "*"
  }
}
```

或在根目录的 `package.json` 中配置 workspace：

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

## 版本管理

shared 模块使用语义化版本管理（Semantic Versioning）：
- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

## 状态

### ✅ 已完成
- 基础 DTO（ApiResponse）
- 基础异常类（BusinessException 及其子类）
- 全局异常处理器（GlobalExceptionHandler）
- 前端类型定义（ApiResponse、PaginatedResponse 等）
- 前端工具函数（tokenStorage）
- 后端和前端的基础构建配置

### ⏳ 进行中
- 评估共享工具类（JwtUtils 等）
- 完善文档和使用示例

### 📋 下一步
1. 评估和提取更多共享代码（如果有必要）
2. 完善单元测试
3. 更新各子项目的依赖配置
4. 测试构建和运行
