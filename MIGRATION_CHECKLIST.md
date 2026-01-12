# 子项目代码迁移清单

本文档列出了需要迁移到各个子项目的代码文件。

## 📋 迁移概览

- [ ] **edu/** - 教育版
- [ ] **mentis/** - Mentis 超级智能体
- [ ] **company/** - 公司官网

---

## 📚 edu/ 教育版

### Frontend 需要迁移的文件

#### 从 `frontend-edu/` 迁移
- [ ] `frontend-edu/src/` → `edu/frontend/src/`
- [ ] `frontend-edu/package.json` → `edu/frontend/package.json`
- [ ] `frontend-edu/vite.config.ts` → `edu/frontend/vite.config.ts`
- [ ] `frontend-edu/tsconfig.json` → `edu/frontend/tsconfig.json`
- [ ] `frontend-edu/tailwind.config.js` → `edu/frontend/tailwind.config.js`
- [ ] `frontend-edu/index.html` → `edu/frontend/index.html`
- [ ] `frontend-edu/public/` → `edu/frontend/public/`

#### 从 `admin-edu/` 迁移（如果需要）
- [ ] `admin-edu/src/` → `edu/frontend/admin/` 或独立为 `edu/admin-frontend/`
- [ ] `admin-edu/package.json` → （根据实际情况决定）
- [ ] 其他配置文件

### Backend 需要迁移的文件

- [ ] 待识别教育版相关的后端代码

---

## 🤖 mentis/ Mentis 超级智能体

### Frontend 需要迁移的文件

#### 从 `frontend/src/components/mentis/` 迁移
- [x] `frontend/src/components/mentis/MentisChatWindow.tsx` → `mentis/frontend/src/components/MentisChatWindow.tsx` ✅
- [x] `frontend/src/components/mentis/MentisMainPage.tsx` → `mentis/frontend/src/components/MentisMainPage.tsx` ✅
- [x] `frontend/src/components/mentis/SessionListPage.tsx` → `mentis/frontend/src/components/SessionListPage.tsx` ✅
- [x] `frontend/src/components/mentis/TaskList.tsx` → `mentis/frontend/src/components/TaskList.tsx` ✅
- [x] `frontend/src/components/mentis/VmScreenViewer.tsx` → `mentis/frontend/src/components/VmScreenViewer.tsx` ✅

#### 从 `frontend/src/pages/` 迁移
- [x] `frontend/src/pages/MentisPage.tsx` → `mentis/frontend/src/pages/MentisPage.tsx` ✅

#### 从 `frontend/src/services/mentis/` 迁移
- [x] `frontend/src/services/mentis/mentisApi.ts` → `mentis/frontend/src/services/mentisApi.ts` ✅

#### 从 `frontend/admin/components/` 迁移
- [x] `frontend/admin/components/MentisExperience.tsx` → 已删除（不再需要，mentis 已完全独立） ✅

### Backend 需要迁移的文件

#### 从 `backend/src/main/java/com/heartsphere/mentis/` 迁移
- [x] `backend/src/main/java/com/heartsphere/mentis/agent/` → `mentis/backend/src/main/java/com/heartsphere/mentis/agent/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/alert/` → `mentis/backend/src/main/java/com/heartsphere/mentis/alert/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/audit/` → `mentis/backend/src/main/java/com/heartsphere/mentis/audit/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/config/` → `mentis/backend/src/main/java/com/heartsphere/mentis/config/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/controller/` → `mentis/backend/src/main/java/com/heartsphere/mentis/controller/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/dto/` → `mentis/backend/src/main/java/com/heartsphere/mentis/dto/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/entity/` → `mentis/backend/src/main/java/com/heartsphere/mentis/entity/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/exception/` → `mentis/backend/src/main/java/com/heartsphere/mentis/exception/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/executor/` → `mentis/backend/src/main/java/com/heartsphere/mentis/executor/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/monitor/` → `mentis/backend/src/main/java/com/heartsphere/mentis/monitor/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/repository/` → `mentis/backend/src/main/java/com/heartsphere/mentis/repository/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/security/` → `mentis/backend/src/main/java/com/heartsphere/mentis/security/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/service/` → `mentis/backend/src/main/java/com/heartsphere/mentis/service/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/util/` → `mentis/backend/src/main/java/com/heartsphere/mentis/util/` ✅
- [x] `backend/src/main/java/com/heartsphere/mentis/vm/` → `mentis/backend/src/main/java/com/heartsphere/mentis/vm/` ✅

### 清理工作（已完成）
- [x] 删除 `backend/src/main/java/com/heartsphere/mentis/` 目录 ✅
- [x] 删除 `frontend/src/components/mentis/` 目录 ✅
- [x] 删除 `frontend/src/services/mentis/` 目录 ✅
- [x] 删除 `frontend/src/pages/MentisPage.tsx` ✅
- [x] 删除 `admin/frontend/src/components/MentisExperience.tsx` ✅
- [x] 删除 `frontend/admin/components/MentisExperience.tsx` ✅
- [x] 移除 `backend/src/main/java/com/heartsphere/HeartSphereApplication.java` 中的 mentis 扫描配置 ✅
- [x] 移除 `backend/pom.xml` 中的 mentis 相关依赖（docker-java、selenium） ✅
- [x] 移除配置文件中的 mentis 配置 ✅
- [x] 移除数据库迁移脚本中的 mentis 表创建脚本 ✅
- [x] 移除提示词模板中的 mentis 专用模板 ✅

#### 配置文件
- [ ] `backend/src/main/resources/application.yml` 中的 mentis 配置 → `mentis/backend/src/main/resources/application.yml`
- [ ] 数据库迁移脚本（如果有 mentis 相关的）→ `mentis/backend/src/main/resources/db/migration/`

---

## 🏢 company/ 公司官网

### Frontend 需要迁移的文件

#### 从 `frontend/components/company/` 迁移
- [ ] `frontend/components/company/HeroSection.tsx` → `company/frontend/src/components/HeroSection.tsx`
- [ ] `frontend/components/company/Footer.tsx` → `company/frontend/src/components/Footer.tsx`
- [ ] `frontend/components/company/ProductHighlights.tsx` → `company/frontend/src/components/ProductHighlights.tsx`
- [ ] `frontend/components/company/ProductScreenshots.tsx` → `company/frontend/src/components/ProductScreenshots.tsx`
- [ ] `frontend/components/company/ContactForm.tsx` → `company/frontend/src/components/ContactForm.tsx`
- [ ] `frontend/components/company/PhilosophyPreview.tsx` → `company/frontend/src/components/PhilosophyPreview.tsx`
- [ ] `frontend/components/company/Navigation.tsx` → `company/frontend/src/components/Navigation.tsx`
- [ ] `frontend/components/company/Layout.tsx` → `company/frontend/src/components/Layout.tsx`
- [ ] 其他 company 组件 → `company/frontend/src/components/`

#### 从 `frontend/pages/company/` 迁移
- [ ] `frontend/pages/company/HomePage.tsx` → `company/frontend/src/pages/HomePage.tsx`
- [ ] `frontend/pages/company/AboutPage.tsx` → `company/frontend/src/pages/AboutPage.tsx`
- [ ] `frontend/pages/company/ProductPage.tsx` → `company/frontend/src/pages/ProductPage.tsx`
- [ ] `frontend/pages/company/ServicesPage.tsx` → `company/frontend/src/pages/ServicesPage.tsx`
- [ ] `frontend/pages/company/ContactPage.tsx` → `company/frontend/src/pages/ContactPage.tsx`

#### 从 `frontend/routes/` 迁移
- [ ] `frontend/routes/company.tsx` → `company/frontend/src/routes/company.tsx` 或整合到 `company/frontend/src/App.tsx`

#### 测试文件
- [ ] `frontend/src/__tests__/company/` → `company/frontend/src/__tests__/`

### Backend 需要迁移的文件

#### 从 `backend/src/main/java/com/heartsphere/controller/` 迁移
- [ ] 联系表单相关的 Controller（待识别）
- [ ] `ContactFormDTO.java` → `company/backend/src/main/java/com/heartsphere/company/dto/ContactFormDTO.java`

#### 从 `backend/src/main/java/com/heartsphere/dto/` 迁移
- [ ] `ContactFormDTO.java` → `company/backend/src/main/java/com/heartsphere/company/dto/ContactFormDTO.java`

---

## 📝 迁移注意事项

### 1. 依赖关系
- 迁移后需要更新 import 路径
- 需要识别和提取共享依赖到 `shared/` 目录
- 需要更新 `package.json` 和 `pom.xml` 中的依赖

### 2. 配置文件
- 需要创建独立的配置文件
- 需要更新构建配置（vite.config.ts, tsconfig.json 等）
- 需要更新部署配置

### 3. API 路径
- Mentis: `/api/mentis/...`
- Company: `/api/company/...`
- Edu: `/api/edu/...`

### 4. 路由
- 需要更新前端路由配置
- 需要确保路由路径正确

### 5. 测试
- 迁移后需要运行测试确保功能正常
- 需要更新测试路径和配置

---

## 🚀 迁移顺序建议

1. **Mentis** - 后端代码结构最完整，先迁移 Mentis
2. **Company** - 前端代码相对独立，易于迁移
3. **Edu** - 需要先识别所有相关代码

---

## ✅ 迁移完成后检查清单

### 每个子项目完成后
- [ ] 代码已迁移到正确位置
- [ ] 所有 import 路径已更新
- [ ] 配置文件已创建和更新
- [ ] 依赖已更新
- [ ] 测试已通过
- [ ] 构建成功
- [ ] 功能验证通过
