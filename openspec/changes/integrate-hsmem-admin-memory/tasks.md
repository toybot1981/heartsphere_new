## 1. 创建HSMem API客户端服务
- [x] 1.1 创建 `admin/frontend/src/services/api/hsmem/hsmemApi.ts` 文件
- [x] 1.2 实现健康检查接口 (`GET /health`)
- [x] 1.3 实现记忆化接口 (`POST /api/v1/memory/memorize/conversation`, `/memorize/text`, `/memorize/document`)
- [x] 1.4 实现检索接口 (`POST /api/v1/memory/retrieve`)
- [x] 1.5 实现统计接口 (`GET /api/v1/memory/statistics`)
- [x] 1.6 实现分类接口 (`GET /api/v1/memory/categories`, `/categories/{category_name}`)
- [x] 1.7 定义TypeScript类型接口

## 2. 创建记忆测试组件
- [x] 2.1 创建 `admin/frontend/src/components/memory/MemoryTesting.tsx` 组件
- [x] 2.2 实现对话记忆测试功能（输入对话消息，调用记忆化接口）
- [x] 2.3 实现文本记忆测试功能（输入文本，调用记忆化接口）
- [x] 2.4 实现文档记忆测试功能（输入文档信息，调用记忆化接口）
- [x] 2.5 显示测试结果（资源ID、记忆项数量、分类信息等）
- [x] 2.6 添加错误处理和加载状态

## 3. 增强记忆查询功能
- [x] 3.1 在 `UserMemoryManagement.tsx` 中添加hsmem检索功能
- [x] 3.2 实现查询表单（支持查询文本、过滤条件、数量限制）
- [x] 3.3 显示检索结果（记忆项列表、摘要、类型、分类等）
- [ ] 3.4 添加查询历史记录功能（可选功能，暂不实现）

## 4. 添加记忆删除功能
- [x] 4.1 研究hsmem API是否提供删除接口（已确认：hsmem API当前未提供删除接口）
- [x] 4.2 实现记忆删除功能占位UI（添加禁用状态的删除按钮，显示提示信息）
- [ ] 4.3 添加删除确认对话框（等待API支持后实现）
- [ ] 4.4 更新删除后的列表显示（等待API支持后实现）
**注意**: hsmem API当前未提供删除接口，已在UI中添加占位删除按钮（禁用状态），需要等待hsmem API添加删除接口支持

## 5. 更新MemoryDashboard组件
- [x] 5.1 集成hsmem统计接口 (`GET /api/v1/memory/statistics`)
- [x] 5.2 显示hsmem服务的统计信息（资源数、记忆项数、分类数）
- [x] 5.3 显示服务健康状态
- [x] 5.4 添加刷新按钮

## 6. 更新MemoryManagement主组件
- [x] 6.1 在标签页中添加"记忆测试"标签
- [x] 6.2 集成MemoryTesting组件

## 7. 配置和测试
- [x] 7.1 配置hsmem服务地址（环境变量或配置文件，默认http://localhost:8000）
- [ ] 7.2 测试所有API接口调用（需要hsmem服务运行）
- [ ] 7.3 测试记忆测试功能（需要hsmem服务运行）
- [ ] 7.4 测试记忆查询功能（需要hsmem服务运行）
- [ ] 7.5 测试记忆删除功能（需要hsmem API支持）
- [ ] 7.6 验证错误处理和边界情况（需要hsmem服务运行）
