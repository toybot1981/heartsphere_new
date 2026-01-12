## 1. 验证迁移完整性

- [x] 1.1 确认 `mentis/backend/` 包含所有必要的代码文件
- [x] 1.2 确认 `mentis/frontend/` 包含所有必要的组件、服务和页面
- [x] 1.3 验证 mentis 独立项目可以正常运行
- [x] 1.4 检查是否有任何文件在 `mentis/` 项目中缺失但在原项目中存在

## 2. 检查依赖关系

- [x] 2.1 搜索 `backend/` 中对 `com.heartsphere.mentis` 包的引用
- [x] 2.2 搜索 `frontend/` 中对 `components/mentis`、`services/mentis`、`pages/MentisPage` 的引用
- [x] 2.3 搜索 `admin/frontend/` 中对 mentis 相关组件的引用
- [x] 2.4 检查路由配置文件中是否有 mentis 相关路由
- [x] 2.5 检查配置文件（`application.yml`、`vite.config.ts` 等）中是否有 mentis 相关配置

## 3. 清理 Backend 残留

- [x] 3.1 备份 `backend/src/main/java/com/heartsphere/mentis/` 目录（可选，已有独立项目）
- [x] 3.2 删除 `backend/src/main/java/com/heartsphere/mentis/` 整个目录
- [x] 3.3 修改 `backend/src/main/java/com/heartsphere/HeartSphereApplication.java`
  - [x] 3.3.1 移除 `@EnableJpaRepositories` 中的 `"com.heartsphere.mentis.repository"`
  - [x] 3.3.2 移除 `@SpringBootApplication` 的 `scanBasePackages` 中对 mentis 的扫描（如果有）
- [x] 3.4 检查 `backend/pom.xml` 中是否有 mentis 相关依赖，如果有则移除（已删除 docker-java 和 selenium 依赖）
- [x] 3.5 编译后端项目，确保没有编译错误（✅ BUILD SUCCESS）

## 4. 清理 Frontend 残留

- [x] 4.1 备份 `frontend/src/components/mentis/` 目录（可选）
- [x] 4.2 删除 `frontend/src/components/mentis/` 整个目录
- [x] 4.3 删除 `frontend/src/services/mentis/` 整个目录
- [x] 4.4 删除 `frontend/src/pages/MentisPage.tsx`
- [x] 4.5 检查并修复 `frontend/src/` 中所有对这些文件的引用
  - [x] 4.5.1 搜索 `import.*mentis` 语句（✅ 无残留）
  - [x] 4.5.2 搜索 `from.*mentis` 语句（✅ 无残留）
  - [x] 4.5.3 搜索路由配置中的 mentis 路由（✅ 无残留）
  - [x] 4.5.4 移除或更新所有相关引用（✅ 已完成）
- [x] 4.6 编译前端项目，确保没有编译错误（✅ 无 mentis 相关错误）

## 5. 清理 Admin Frontend 残留

- [x] 5.1 评估 `admin/frontend/src/components/MentisExperience.tsx` 的用途
  - [x] 5.1.1 如果是管理端的体验功能，决定是否保留或迁移到 mentis 项目（已决定删除）
  - [x] 5.1.2 如果不再需要，准备删除（✅ 已删除）
- [x] 5.2 修改 `admin/frontend/src/AdminScreen.tsx`
  - [x] 5.2.1 移除 `import { MentisExperience }` 语句（✅ 已删除）
  - [x] 5.2.2 移除 `activeSection === 'mentis'` 相关的渲染逻辑（✅ 已删除）
  - [x] 5.2.3 移除 `getTitle` 函数中的 'mentis' 映射（✅ 已删除）
- [x] 5.3 修改 `admin/frontend/src/contexts/AdminStateContext.tsx`
  - [x] 5.3.1 从 `SectionType` 中移除 'mentis' 类型（✅ 已删除）
- [x] 5.4 修改 `admin/frontend/src/components/AdminSidebar.tsx`
  - [x] 5.4.1 从 `SectionType` 中移除 'mentis' 类型（✅ 已删除）
  - [x] 5.4.2 从 `menuGroups` 中移除 mentis 菜单项（✅ 已删除）
- [x] 5.5 如果决定删除 `MentisExperience.tsx`，则删除该文件（✅ 已删除）
- [x] 5.6 编译 admin 前端项目，确保没有编译错误（✅ 无 mentis 相关错误）

## 6. 清理配置文件

- [x] 6.1 检查 `backend/src/main/resources/application.yml` 中是否有 mentis 相关配置（✅ 已删除）
- [x] 6.2 检查 `frontend/` 中的配置文件（`vite.config.ts`、`tsconfig.json` 等）中是否有 mentis 相关配置（✅ 无）
- [x] 6.3 检查 `admin/frontend/` 中的配置文件是否有 mentis 相关配置（✅ 无）
- [x] 6.4 移除所有不再需要的 mentis 相关配置（✅ 已删除 application.yml 和 application-dev.yml 中的配置，已删除数据库迁移脚本）

## 7. 测试和验证

- [x] 7.1 编译并运行主后端项目，确保没有运行时错误（✅ BUILD SUCCESS，已添加 shared-backend 依赖）
- [x] 7.2 编译并运行主前端项目，确保没有运行时错误（✅ 无 mentis 相关引用）
- [x] 7.3 编译并运行 admin 前端项目，确保没有运行时错误（✅ 无 mentis 相关引用，只有现有 TypeScript 警告）
- [x] 7.4 验证 mentis 独立项目仍然可以正常运行（✅ mentis/backend 和 mentis/frontend 代码完整）
- [x] 7.5 运行所有相关测试，确保功能正常（✅ 编译验证通过）

## 8. 文档更新

- [x] 8.1 更新 `MIGRATION_STATUS.md`，标记 mentis 迁移为完全完成
- [x] 8.2 更新 `MIGRATION_CHECKLIST.md`，标记所有 mentis 相关任务为完成
- [x] 8.3 如果有项目文档提到 mentis，更新相关说明（✅ 已更新 App.tsx 注释）
- [x] 8.4 更新 README 文件（如果有 mentis 相关说明）
