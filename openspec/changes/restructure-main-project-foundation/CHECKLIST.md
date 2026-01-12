# 迁移后检查清单

**生成日期**: 2026-01-11  
**用途**: 迁移完成后的验证和测试清单

---

## ✅ 已完成项目

### 目录迁移
- [x] frontend/ → main/frontend/
- [x] backend/ → main/backend/
- [x] 验证旧目录已移除

### 脚本更新
- [x] scripts/start-frontend.sh
- [x] scripts/start-backend.sh
- [x] scripts/test-plugin-management.sh
- [x] scripts/verify_test_skill.sh
- [x] scripts/test-heartconnect-admin.sh
- [x] deploy/deploy-backend-prod.sh
- [x] deploy/deploy-frontend-prod.sh
- [x] deploy/deploy-backend-dev.sh
- [x] deploy/deploy-frontend-dev.sh
- [x] deploy/start-backend-prod.sh

### 文档更新
- [x] openspec/project.md
- [x] docs/00-总览/文档整理说明.md
- [x] docs/demo/FILE_LOCATIONS.md
- [x] docs/15-其他/软件著作权/源代码说明文档.md
- [x] docs/15-其他/软件著作权/源代码清单.md
- [x] docs/14-部署运维/前端重新部署指南.md
- [x] docs/14-部署运维/React-ForwardRef错误修复方案.md

---

## 🔍 建议的验证步骤

### 1. 构建验证
- [ ] 后端构建: `cd main/backend && mvn clean install`
- [ ] 前端构建: `cd main/frontend && npm install && npm run build`
- [ ] 检查构建错误和警告

### 2. 启动验证
- [ ] 使用脚本启动后端: `./scripts/start-backend.sh`
- [ ] 使用脚本启动前端: `./scripts/start-frontend.sh`
- [ ] 验证服务正常启动
- [ ] 检查日志文件

### 3. 功能验证
- [ ] 访问前端页面，验证基本功能
- [ ] 测试 API 接口调用
- [ ] 验证数据库连接
- [ ] 检查静态资源加载

### 4. 其他项目验证
- [ ] 验证 mentis 项目仍可正常启动
- [ ] 验证 edu 项目仍可正常启动
- [ ] 验证 admin 项目仍可正常启动
- [ ] 检查项目间 API 调用（如适用）

---

## 📝 注意事项

1. **首次构建**: 可能需要重新下载依赖
2. **配置文件**: 检查 application.yml 中的路径配置
3. **环境变量**: 确认环境变量配置正确
4. **数据库**: 确认数据库连接配置正确
5. **端口冲突**: 确认端口配置无冲突

---

## 🐛 常见问题排查

### 构建失败
- 检查 Java 版本（需要 Java 17+）
- 检查 Maven 版本（需要 Maven 3.9+）
- 检查 Node.js 版本（需要 Node.js 18+）
- 清理缓存后重试: `mvn clean` 或 `rm -rf node_modules`

### 启动失败
- 检查端口是否被占用
- 检查日志文件查看错误信息
- 验证配置文件路径正确
- 检查数据库连接

### 路径问题
- 使用 `grep -r "frontend/\|backend/"` 搜索可能的遗漏
- 检查相对路径和绝对路径的使用
- 验证脚本中的路径引用

---

**检查清单创建时间**: 2026-01-11
