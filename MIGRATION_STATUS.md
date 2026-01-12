# 子项目代码迁移状态

**创建日期**: 2025-01-10  
**最后更新**: 2025-01-10

---

## 📊 迁移概览

| 子项目 | Frontend 状态 | Backend 状态 | 配置文件状态 | 完成度 |
|--------|--------------|--------------|-------------|--------|
| **edu** | ✅ 已迁移 | ⚠️ 待开发 | ⚠️ 部分完成 | 60% |
| **mentis** | ✅ 已迁移 | ✅ 已迁移 | ✅ 已完成 | ✅ 100% |
| **company** | ✅ 已迁移 | ✅ 已迁移 | ✅ 已完成 | 80% |

---

## 📚 edu/ 教育版

### Frontend
- ✅ **已迁移**: `frontend-edu/` → `edu/frontend/`
  - 所有源文件已迁移
  - package.json、vite.config.ts 等配置文件已存在
  - node_modules 已存在

### Backend
- ⚠️ **待开发**: 需要创建教育版后端代码结构
  - 已创建 `pom.xml` 基础配置
  - 需要识别和迁移教育版相关的后端代码

### 下一步
1. 识别教育版相关的后端代码（待识别）
2. 迁移或创建教育版后端代码
3. 更新依赖配置
4. 测试功能完整性

---

## 🤖 mentis/ Mentis 超级智能体

### Frontend
- ✅ **已迁移**: 
  - `frontend/src/components/mentis/` → `mentis/frontend/src/components/`
  - `frontend/src/services/mentis/` → `mentis/frontend/src/services/`
  - `frontend/src/pages/MentisPage.tsx` → `mentis/frontend/src/pages/`
  - 已创建 `package.json` 基础配置
  - ✅ 前端项目配置已完成（vite.config.ts、tsconfig.json、App.tsx 等）

### Backend
- ✅ **已迁移**: 
  - `backend/src/main/java/com/heartsphere/mentis/` → `mentis/backend/src/main/java/com/heartsphere/mentis/`
  - 所有包结构已完整迁移（98 个 Java 文件）
  - 已创建 `pom.xml` 基础配置
  - ✅ 已创建 `application.yml` 配置文件
  - ✅ 已创建 Spring Boot 主类（MentisApplication.java）
  - ✅ API 路径前缀已更新为 `/api/mentis/`
  - ✅ 已处理依赖关系（shared 模块、JWT、Security 等）

### 清理工作
- ✅ **已完成**: 从原有项目中删除所有 mentis 残留内容
  - ✅ 删除 `backend/src/main/java/com/heartsphere/mentis/` 目录
  - ✅ 删除 `frontend/src/components/mentis/` 目录
  - ✅ 删除 `frontend/src/services/mentis/` 目录
  - ✅ 删除 `frontend/src/pages/MentisPage.tsx`
  - ✅ 删除 `admin/frontend/src/components/MentisExperience.tsx`
  - ✅ 删除 `frontend/admin/components/MentisExperience.tsx`
  - ✅ 移除所有配置文件中的 mentis 相关配置
  - ✅ 移除数据库迁移脚本中的 mentis 表创建脚本
  - ✅ 移除提示词模板中的 mentis 专用模板
  - ✅ 移除所有相关引用和菜单项

### 状态
- ✅ **迁移完成度**: 100%
- ✅ **清理完成度**: 100%
- ✅ **功能独立性**: 完全独立（端口 3002 前端，8082 后端）

---

## 🏢 company/ 公司官网

### Frontend
- ✅ **已迁移**:
  - `frontend/components/company/` → `company/frontend/src/components/`
  - `frontend/pages/company/` → `company/frontend/src/pages/`
  - `frontend/routes/company.tsx` → `company/frontend/src/routes/`
  - 已创建 `package.json` 基础配置

- ⚠️ **待完成**:
  - 需要创建 `vite.config.ts`、`tsconfig.json` 等配置文件
  - 需要创建 `index.html`、`App.tsx` 等入口文件
  - 需要修复 import 路径
  - 需要整合路由配置

### Backend
- ✅ **已迁移**:
  - `backend/src/main/java/com/heartsphere/controller/CompanyController.java` → `company/backend/src/main/java/com/heartsphere/company/controller/`
  - `backend/src/main/java/com/heartsphere/service/CompanyService.java` → `company/backend/src/main/java/com/heartsphere/company/service/`
  - `backend/src/main/java/com/heartsphere/dto/ContactFormDTO.java` → `company/backend/src/main/java/com/heartsphere/company/dto/`
  - `backend/src/main/java/com/heartsphere/dto/ApiResponse.java` → `company/backend/src/main/java/com/heartsphere/company/dto/`
  - 已创建 `pom.xml` 基础配置
  - 已修复包名

- ⚠️ **待完成**:
  - 需要创建 `application.yml` 配置文件
  - 需要创建 Spring Boot 主类（Application.java）
  - 需要处理依赖关系：
    - EmailService（目前依赖 SystemConfigService，需要处理）
    - BusinessException（需要复制或引用 shared 模块）
  - 需要创建异常类（BusinessException）
  - 需要更新 API 路径前缀为 `/api/company/`（已经正确）

### 下一步
1. 完善前端项目配置
2. 完善后端项目配置
3. 处理依赖关系（EmailService、BusinessException）
4. 创建异常类
5. 测试功能完整性

---

## 📋 待处理的共享依赖

以下依赖需要在后续步骤中处理，可能需要提取到 `shared/` 模块：

### 后端共享依赖
- ✅ `ApiResponse` - 已复制到各子项目（后续应提取到 shared）
- ⚠️ `BusinessException` - 需要提取到 shared
- ⚠️ `EmailService` - 可能需要提取到 shared 或各子项目独立实现
- ⚠️ 数据库实体类（Entity）- 待识别
- ⚠️ JWT 工具类 - 待识别
- ⚠️ 其他工具类 - 待识别

### 前端共享依赖
- ⚠️ API 请求工具（request.ts）- 待提取到 shared
- ⚠️ Token 存储（tokenStorage.ts）- 待提取到 shared
- ⚠️ 类型定义（TypeScript types）- 待提取到 shared
- ⚠️ 公共组件 - 待识别

---

## 🔧 配置文件待创建清单

### 前端配置文件

#### mentis/frontend/
- [ ] `vite.config.ts`
- [ ] `tsconfig.json`
- [ ] `tsconfig.node.json`
- [ ] `tailwind.config.js`（如果需要）
- [ ] `index.html`
- [ ] `src/App.tsx`
- [ ] `src/main.tsx`
- [ ] `src/vite-env.d.ts`

#### company/frontend/
- [ ] `vite.config.ts`
- [ ] `tsconfig.json`
- [ ] `tsconfig.node.json`
- [ ] `tailwind.config.js`（如果需要）
- [ ] `index.html`
- [ ] `src/App.tsx`
- [ ] `src/main.tsx`
- [ ] `src/vite-env.d.ts`

### 后端配置文件

#### mentis/backend/
- [ ] `src/main/resources/application.yml`
- [ ] `src/main/java/com/heartsphere/mentis/MentisApplication.java`
- [ ] `src/main/resources/db/migration/`（如果需要）

#### company/backend/
- [ ] `src/main/resources/application.yml`
- [ ] `src/main/java/com/heartsphere/company/CompanyApplication.java`
- [ ] `src/main/java/com/heartsphere/company/exception/BusinessException.java`
- [ ] `src/main/java/com/heartsphere/company/service/EmailService.java`（或处理依赖）

#### edu/backend/
- [ ] `src/main/resources/application.yml`
- [ ] `src/main/java/com/heartsphere/edu/EduApplication.java`
- [ ] 识别和创建教育版相关的后端代码

---

## 📝 代码修复待处理

### import 路径修复

#### mentis/frontend/
- [ ] 修复 `MentisPage.tsx` 中的 import 路径
  - `../components/mentis/MentisMainPage` → `./components/MentisMainPage`
  - `../services/mentis/mentisApi` → `./services/mentisApi`
- [ ] 修复所有组件中的 import 路径
- [ ] 修复 API 调用路径

#### company/frontend/
- [ ] 修复组件中的 import 路径
- [ ] 修复路由配置

### 依赖处理

#### company/backend/
- [ ] 处理 `CompanyService` 对 `EmailService` 的依赖
  - 选项 1: 复制 EmailService 到 company 项目
  - 选项 2: 提取到 shared 模块
  - 选项 3: 简化实现，移除邮件功能（临时）
- [ ] 创建或复制 `BusinessException` 类
- [ ] 处理其他依赖关系

#### mentis/backend/
- [ ] 处理对主系统其他模块的依赖
- [ ] 更新数据库配置
- [ ] 处理 Flyway 迁移脚本

---

## ✅ 已完成的工作

1. ✅ 创建了三个子项目的目录结构
2. ✅ 迁移了 edu 前端代码
3. ✅ 迁移了 mentis 前端和后端代码
4. ✅ 迁移了 company 前端和后端代码
5. ✅ 创建了基础的 pom.xml 和 package.json
6. ✅ 修复了部分包名
7. ✅ 创建了迁移清单和状态文档

---

## 🎯 下一步优先级

### 优先级 1（立即处理）
1. 完善各子项目的基础配置文件
2. 处理 company/backend 的依赖问题（EmailService、BusinessException）
3. 修复 import 路径

### 优先级 2（本周完成）
1. 创建 shared 模块结构
2. 提取公共代码到 shared
3. 更新各子项目的依赖配置

### 优先级 3（后续）
1. 完善各子项目的构建和部署配置
2. 建立 CI/CD 流程
3. 完善测试覆盖

---

## 📚 相关文档

- [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) - 详细迁移清单
- [edu/README.md](./edu/README.md) - 教育版项目说明
- [mentis/README.md](./mentis/README.md) - Mentis 项目说明
- [company/README.md](./company/README.md) - 公司官网项目说明
