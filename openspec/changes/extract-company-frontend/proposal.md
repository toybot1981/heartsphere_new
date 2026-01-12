# Change: 将 Company 相关前端页面从主项目完全迁移

## Why

当前主项目（`heartsphere_new`）中仍然包含 company 相关的前端代码，但这些代码应该已经迁移到独立的 `company/` 子项目中。主项目中残留的 company 代码导致：

1. **代码冗余**：同样的代码存在于主项目和子项目中，增加了维护成本
2. **路由冲突**：主项目的 `App.tsx` 中仍然处理 `/company` 路径，与子项目的路由可能产生冲突
3. **依赖混乱**：主项目和子项目都依赖 company 相关组件，增加了耦合度
4. **部署混淆**：不清楚应该使用主项目还是子项目的 company 代码

为了确保代码清晰、维护简单、架构明确，需要将主项目中所有 company 相关的前端代码完全移除。

## What Changes

### REMOVED（从主项目移除）

**前端代码：**
- `frontend/pages/company/` - 5个页面组件（HomePage, AboutPage, ProductPage, ServicesPage, ContactPage）
- `frontend/components/company/` - 17个组件（Layout, Navigation, Footer, HeroSection, ContactForm, 等）
- `frontend/routes/company.tsx` - 路由配置
- `frontend/src/__tests__/company/` - 测试文件（3个测试文件）

**前端集成：**
- `frontend/App.tsx` 中的 `CompanyRoutes` 懒加载和路由处理逻辑
- `frontend/App.tsx` 中对 `/company` 路径的处理

**后端代码（可选，建议一并移除）：**
- `backend/src/main/java/com/heartsphere/controller/CompanyController.java`
- `backend/src/main/java/com/heartsphere/service/CompanyService.java`
- `backend/src/main/java/com/heartsphere/dto/ContactFormDTO.java`
- `backend/src/main/java/com/heartsphere/config/WebSecurityConfig.java` 中 `/api/company/contact` 的配置

**依赖清理：**
- 检查并移除主项目中不再需要的 company 相关依赖（如果有）

### VERIFIED（验证子项目完整性）

**确保 `company/` 子项目包含所有必要代码：**
- ✅ `company/frontend/src/pages/` - 5个页面组件已存在
- ✅ `company/frontend/src/components/` - 17个组件已存在
- ✅ `company/frontend/src/routes/` - 路由配置已存在
- ✅ `company/frontend/src/App.tsx` - 应用主组件已存在，使用 React Router
- ✅ `company/backend/` - 后端代码已存在

### MODIFIED（修改配置）

**不需要修改任何配置文件**，因为移除的是不需要的代码，不涉及功能变更。

## Impact

### Affected Specs
- **无现有规范需要修改**（此变更属于代码清理和架构优化，不涉及功能规范变更）

### Affected Code
- **前端文件：**
  - `frontend/App.tsx` - 移除 CompanyRoutes 导入和路由处理
  - `frontend/pages/company/` - **删除整个目录**
  - `frontend/components/company/` - **删除整个目录**
  - `frontend/routes/company.tsx` - **删除文件**
  - `frontend/src/__tests__/company/` - **删除整个目录**

- **后端文件（可选）：**
  - `backend/src/main/java/com/heartsphere/controller/CompanyController.java` - **删除**
  - `backend/src/main/java/com/heartsphere/service/CompanyService.java` - **删除**
  - `backend/src/main/java/com/heartsphere/dto/ContactFormDTO.java` - **删除**
  - `backend/src/main/java/com/heartsphere/config/WebSecurityConfig.java` - 移除 `/api/company/contact` 配置

### Breaking Changes
- **BREAKING**: 主项目将不再提供 `/company` 路由
- **BREAKING**: 主项目将不再包含 company 相关的任何前端代码
- **BREAKING**: 访问 `/company` 路径将返回 404（除非配置了反向代理）

### Migration Guide
1. **部署说明**：确保 `company/` 子项目已正确部署在独立的端口（如 3003）
2. **反向代理配置**：如果需要在主域名下访问 company 网站，需要在 Nginx 等反向代理中配置：
   ```
   location /company {
       proxy_pass http://localhost:3003;
   }
   ```
3. **API 端点**：如果 company 网站需要调用后端 API，确保 `company/backend` 服务正常运行在端口 8083，或者通过反向代理转发请求

### Testing
- **验证主项目功能**：确保移除 company 代码后，主项目的其他功能不受影响
- **验证子项目功能**：确保 `company/` 子项目的所有页面和功能正常
- **路由测试**：访问主项目的 `/company` 路径应返回 404 或正确的错误页面
- **构建测试**：确保主项目可以正常构建和运行
