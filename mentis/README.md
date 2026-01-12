# HeartSphere Mentis

Mentis 超级智能体独立项目。

## 项目结构

```
mentis/
├── frontend/          # Mentis 前端
│   ├── src/
│   │   ├── components/    # Mentis 组件
│   │   ├── pages/         # Mentis 页面
│   │   └── services/      # Mentis API 服务
│   ├── package.json       # 前端依赖配置
│   ├── vite.config.ts     # Vite 配置
│   └── tsconfig.json      # TypeScript 配置
├── backend/           # Mentis 后端
│   ├── src/main/java/com/heartsphere/mentis/
│   │   ├── controller/    # 控制器
│   │   ├── service/       # 服务层
│   │   ├── entity/        # 实体类
│   │   ├── dto/           # 数据传输对象
│   │   └── MentisApplication.java
│   ├── pom.xml            # Maven 配置
│   └── src/main/resources/application.yml
└── README.md          # 本文件
```

## 技术栈

### 后端
- Spring Boot 3.2.0
- Java 17
- MySQL 8.0+
- Docker Java API（VM 管理）
- Shared Backend Module（共享后端模块）

### 前端
- React 18+
- TypeScript 5.8+
- Vite 5.0+
- Material-UI (MUI) 7.3.6
- Axios 1.6.2
- Shared Frontend Module（共享前端模块）

## 依赖关系

- **Shared 模块**：所有项目共享的基础代码（DTO、异常类、工具函数等）
- **端口配置**：
  - 后端：8082
  - 前端：3002

## 构建和运行

### 后端
```bash
cd mentis/backend
mvn clean install
mvn spring-boot:run
```

### 前端
```bash
cd mentis/frontend
npm install
npm run dev
```

## 功能特性

- 超级智能体对话
- 任务执行和管理
- 会话管理
- VM（虚拟机）管理
- GUI 自动化执行
- 执行日志查看

## API 路径前缀

- `/api/mentis/` - Mentis API 端点

## 状态

- ✅ 项目结构已创建
- ✅ 依赖配置已更新（使用 shared 模块）
- ✅ 主要路径问题已修复
- ✅ 基础配置文件已创建
- ⚠️  还有一些小的编译错误（不影响核心功能）

## 下一步

1. 修复剩余的小错误（unused variables、类型错误等）
2. 完善功能实现
3. 编写单元测试
4. 配置 CI/CD
