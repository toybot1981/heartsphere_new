# HeartSphere Education Edition (Edu)

HeartSphere 教育版独立客户端，包含前端和后端服务。

## 📁 项目结构

```
edu/
├── backend/          # Edu 后端服务（Spring Boot）
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/heartsphere/edu/
│   │   │   │   ├── controller/      # REST API 控制器
│   │   │   │   ├── service/         # 业务服务层
│   │   │   │   ├── repository/      # 数据访问层
│   │   │   │   ├── entity/          # 实体类
│   │   │   │   ├── dto/             # 数据传输对象
│   │   │   │   ├── config/          # 配置类
│   │   │   │   └── ...
│   │   │   └── resources/
│   │   │       ├── application.yml  # 应用配置
│   │   │       └── db/migration/    # Flyway 数据库迁移脚本
│   │   └── test/                    # 测试代码
│   └── pom.xml                      # Maven 依赖配置
└── frontend/         # Edu 前端服务（React + TypeScript + Vite）
    ├── src/
    │   ├── components/              # React 组件
    │   │   └── digitalHuman/        # 数字人相关组件
    │   ├── pages/                   # 页面组件
    │   ├── services/                # API 服务
    │   ├── types/                   # TypeScript 类型定义
    │   ├── utils/                   # 工具函数
    │   └── hooks/                   # React Hooks
    ├── package.json                 # npm 依赖配置
    └── vite.config.ts               # Vite 配置
```

## 🚀 快速开始

### 前置要求

- **Java**: JDK 17 或更高版本
- **Node.js**: 18.0 或更高版本
- **MySQL**: 8.0 或更高版本
- **Maven**: 3.8 或更高版本（用于后端构建）

### 数据库准备

1. 创建数据库：
```sql
CREATE DATABASE heartsphere_edu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 配置数据库连接（见后端配置部分）

### 后端启动

1. 进入后端目录：
```bash
cd edu/backend
```

2. 配置数据库连接（可选，使用环境变量或修改 `src/main/resources/application.yml`）：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/heartsphere_edu?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
```

3. 构建项目：
```bash
mvn clean install
```

4. 运行应用：
```bash
mvn spring-boot:run
```

或者运行 JAR 文件：
```bash
java -jar target/heartsphere-edu-service-0.0.1-SNAPSHOT.jar
```

5. 后端服务将在 `http://localhost:8084` 启动

6. 访问 API 文档（Swagger UI）：
```
http://localhost:8084/swagger-ui.html
```

### 前端启动

1. 进入前端目录：
```bash
cd edu/frontend
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量（可选，创建 `.env` 文件）：
```env
VITE_EDU_API_BASE_URL=http://localhost:8084/api/edu
```

4. 启动开发服务器：
```bash
npm run dev
```

5. 前端服务将在 `http://localhost:3000` 启动（或其他端口，见终端输出）

6. 构建生产版本：
```bash
npm run build
```

## 📊 数据库迁移

后端使用 Flyway 进行数据库版本管理。数据库迁移脚本位于 `edu/backend/src/main/resources/db/migration/`。

迁移脚本会在应用启动时自动执行。

### 迁移脚本列表

- `V20260110__create_edu_characters_table.sql` - 创建数字人角色表
- `V20260110_01__create_edu_character_interactions_table.sql` - 创建互动记录表

## 📖 API 文档

启动后端服务后，可以通过以下地址访问 API 文档：

- **Swagger UI**: http://localhost:8084/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8084/v3/api-docs
- **OpenAPI YAML**: http://localhost:8084/v3/api-docs.yaml

## 🔧 配置说明

### 后端配置

主要配置文件：`edu/backend/src/main/resources/application.yml`

关键配置项：
- `server.port`: 服务端口（默认 8084）
- `spring.datasource.*`: 数据库连接配置
- `spring.jpa.*`: JPA 配置
- `edu.*`: 教育版特定配置

### 前端配置

主要配置文件：`edu/frontend/vite.config.ts`

环境变量（可选）：
- `VITE_EDU_API_BASE_URL`: API 基础 URL（默认：http://localhost:8084/api/edu）

## 📚 功能特性

### 数字人角色管理
- 创建、查询、更新、删除数字人角色
- 角色推荐算法
- 角色统计信息

### 互动记录管理
- 记录学生与数字人的互动
- 查询互动历史（支持筛选、分页）
- 学习进度统计

### 前端功能
- 数字人角色列表和详情展示
- 数字人推荐功能
- 互动历史展示
- 学习进度可视化
- 用户认证集成

## 🧪 测试

### 后端测试

运行单元测试：
```bash
cd edu/backend
mvn test
```

### 前端测试

运行类型检查：
```bash
cd edu/frontend
npm run check:types
```

运行 lint：
```bash
npm run lint
```

## 📦 构建

### 后端构建

```bash
cd edu/backend
mvn clean package
```

构建产物：`target/heartsphere-edu-service-0.0.1-SNAPSHOT.jar`

### 前端构建

```bash
cd edu/frontend
npm run build
```

构建产物：`dist/` 目录

## 🔐 认证

前端使用 JWT token 进行认证。token 存储在 localStorage 中（key: `auth_token`）。

前端认证工具：
- `src/utils/auth.ts` - 认证工具函数
- `src/hooks/useAuth.ts` - 认证 React Hooks

## 🛠️ 技术栈

### 后端
- Spring Boot 3.2.0
- Spring Data JPA
- MySQL 8.0+
- Flyway（数据库迁移）
- SpringDoc OpenAPI（Swagger）
- Shared Backend Module（共享模块）

### 前端
- React 18.2.0
- TypeScript 5.8.2
- Vite 5.0.0
- Tailwind CSS 3.3.6
- React Router 6.20.0
- Shared Frontend Module（共享模块）

## 📖 API 端点

### 数字人角色管理（7个端点）
- POST /api/edu/characters - 创建角色
- GET /api/edu/characters - 获取列表
- GET /api/edu/characters/{id} - 获取详情
- GET /api/edu/characters/recommendations - 推荐角色
- GET /api/edu/characters/{id}/statistics - 统计信息
- PUT /api/edu/characters/{id} - 更新角色
- DELETE /api/edu/characters/{id} - 删除角色

### 互动记录管理（4个端点）
- POST /api/edu/character-interactions - 记录互动
- GET /api/edu/character-interactions - 获取历史
- GET /api/edu/character-interactions/{id} - 获取详情
- GET /api/edu/character-interactions/students/{studentId} - 学生互动历史

详细 API 文档请访问 Swagger UI。

## 🐛 故障排除

### 后端启动失败

1. **数据库连接失败**
   - 检查数据库是否运行
   - 检查数据库连接配置（用户名、密码、URL）
   - 检查数据库是否已创建

2. **端口被占用**
   - 修改 `application.yml` 中的 `server.port`
   - 或关闭占用端口的进程

3. **依赖缺失**
   - 运行 `mvn clean install` 重新构建
   - 检查 `pom.xml` 依赖是否正确

### 前端启动失败

1. **依赖安装失败**
   - 删除 `node_modules` 和 `package-lock.json`
   - 重新运行 `npm install`

2. **API 连接失败**
   - 检查后端服务是否运行
   - 检查 `VITE_EDU_API_BASE_URL` 环境变量配置

3. **构建失败**
   - 运行 `npm run check:types` 检查类型错误
   - 运行 `npm run lint` 检查代码规范

## 📝 开发指南

### 添加新的 API 端点

1. 在 `controller/` 目录创建或更新 Controller
2. 在 `service/` 目录实现业务逻辑
3. 在 `dto/` 目录创建请求/响应 DTO
4. 更新 Swagger 注解（可选）

### 添加新的前端组件

1. 在 `components/` 目录创建组件
2. 在 `types/` 目录定义 TypeScript 类型
3. 在 `services/api/` 目录添加 API 服务
4. 在页面中使用组件

## 📚 相关文档

- [项目设计文档](../openspec/changes/separate-edu-version/design.md)
- [API 设计文档](../openspec/changes/separate-edu-version/PHASE3_DESIGN.md)
- [项目状态报告](../openspec/changes/separate-edu-version/PROJECT_STATUS_REPORT.md)
- [任务列表](../openspec/changes/separate-edu-version/tasks.md)

## 📄 许可证

本项目遵循 Apache 2.0 许可证。

## 👥 贡献

如有问题或建议，请联系 HeartSphere 团队。

---

**最后更新：2026-01-10**
