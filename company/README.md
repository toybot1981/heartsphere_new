# HeartSphere Company Website

公司官网独立项目。

## 项目结构

```
company/
├── frontend/          # 公司官网前端
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── routes/        # 路由配置
│   │   └── App.tsx        # 应用主组件
│   ├── package.json       # 前端依赖配置
│   ├── vite.config.ts     # Vite 配置
│   └── tsconfig.json      # TypeScript 配置
├── backend/           # 公司官网后端
│   ├── src/main/java/com/heartsphere/company/
│   │   ├── controller/    # 控制器
│   │   ├── service/       # 服务层
│   │   ├── dto/           # 数据传输对象
│   │   └── CompanyApplication.java
│   ├── pom.xml            # Maven 配置
│   └── src/main/resources/application.yml
└── README.md          # 本文件
```

## 技术栈

### 后端
- Spring Boot 3.2.0
- Java 17
- MySQL 8.0+
- Shared Backend Module（共享后端模块）

### 前端
- React 18+
- TypeScript 5.8+
- Vite 5.0+
- React Router 6.20+
- Framer Motion 12.24+
- React Helmet Async 2.0+
- Shared Frontend Module（共享前端模块）

## 依赖关系

- **Shared 模块**：所有项目共享的基础代码（DTO、异常类、工具函数等）
- **端口配置**：
  - 后端：8083
  - 前端：3003

## 构建和运行

### 后端
```bash
cd company/backend
mvn clean install
mvn spring-boot:run
```

### 前端
```bash
cd company/frontend
npm install
npm run dev
```

## 功能特性

- 首页展示
- 产品介绍
- 服务介绍
- 关于我们
- 联系方式（联系表单）
- SEO 优化

## API 路径前缀

- `/api/company/` - 公司官网 API 端点

## 状态

- ✅ 项目结构已创建
- ✅ 依赖配置已更新（使用 shared 模块）
- ✅ 路径问题已修复
- ✅ 基础配置文件已创建
- ⚠️  还有一些小的类型错误（不影响核心功能）

## 下一步

1. 修复剩余的小错误（类型错误、unused variables 等）
2. 完善功能实现
3. 编写单元测试
4. 配置 CI/CD
