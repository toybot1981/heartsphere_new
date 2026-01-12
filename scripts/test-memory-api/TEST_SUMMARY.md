# 记忆API全面测试总结

**创建日期**: 2026-01-11  
**测试范围**: HSMem Python API + 主项目后端记忆API

---

## 📋 测试方案概述

本测试方案提供了对记忆API的全面测试，包括：

1. **HSMem Python API 测试** - 测试 hsmem 服务的所有接口
2. **主项目后端记忆API测试** - 测试主项目后端集成的记忆接口
3. **错误处理测试** - 验证错误场景的处理
4. **性能测试** - 验证响应时间
5. **端到端测试** - 验证完整流程

---

## 🎯 测试覆盖

### HSMem Python API

#### 基础功能
- ✅ 健康检查 (`GET /health`)
- ✅ 根路径 (`GET /`)
- ✅ API文档 (`GET /docs`)

#### 记忆化功能
- ✅ 对话记忆化 (`POST /api/v1/memory/memorize/conversation`)
- ✅ 文本记忆化 (`POST /api/v1/memory/memorize/text`)
- ✅ 文档记忆化 (`POST /api/v1/memory/memorize/document`)

#### 检索功能
- ✅ 记忆检索 (`POST /api/v1/memory/retrieve`)
- ✅ 带过滤条件的检索
- ✅ 带数量限制的检索

#### 统计功能
- ✅ 统计信息 (`GET /api/v1/memory/statistics`)
- ✅ 分类列表 (`GET /api/v1/memory/categories`)
- ✅ 分类项 (`GET /api/v1/memory/categories/{category_name}`)

#### 错误处理
- ✅ 无效请求参数
- ✅ 缺少必需参数
- ✅ 不存在资源

### 主项目后端记忆API

#### 认证
- ✅ 用户登录
- ✅ Token验证
- ✅ 未授权访问拒绝

#### CRUD操作
- ✅ 保存记忆 (`POST /api/memory/v1/users/{userId}/memories`)
- ✅ 批量保存记忆 (`POST /api/memory/v1/users/{userId}/memories/batch`)
- ✅ 搜索记忆 (`GET /api/memory/v1/users/{userId}/memories/search`)
- ✅ 获取记忆 (`GET /api/memory/v1/users/{userId}/memories/{memoryId}`)
- ✅ 更新记忆 (`PUT /api/memory/v1/users/{userId}/memories/{memoryId}`)
- ✅ 删除记忆 (`DELETE /api/memory/v1/users/{userId}/memories/{memoryId}`)

#### 数据隔离
- ✅ 用户只能访问自己的记忆
- ✅ 跨用户访问被拒绝

---

## 🚀 使用方法

### 方式1: 运行全面测试（推荐）

```bash
# Shell版本
./scripts/test-memory-api/comprehensive-test.sh

# Python版本（更详细）
python3 scripts/test-memory-api/comprehensive_test.py
```

### 方式2: 分别测试

```bash
# 测试 HSMem Python API
./scripts/test-memory-api/test-hsmem-python-api.sh

# 测试主项目后端API
./scripts/test-memory-api/test-main-backend-api.sh
```

### 方式3: 使用 hsmem 自带的测试脚本

```bash
cd hsmem
python3 test_rest_api.py
```

---

## 📊 测试报告

测试脚本会自动生成测试报告，包括：

- **总测试数**: 执行的测试总数
- **通过数**: 成功通过的测试数
- **失败数**: 失败的测试数
- **跳过数**: 跳过的测试数（服务不可用等）
- **失败详情**: 详细的错误信息

### 示例输出

```
========================================
  测试报告
========================================

总测试数: 15
通过: 13
失败: 2
跳过: 0

失败详情:
  1. HSMem 对话记忆化失败: 状态码: 500
  2. 主项目后端记忆搜索失败: 状态码: 401
```

---

## 🔧 前置条件

### 1. 启动 HSMem 服务

```bash
cd hsmem
pip install -r requirements.txt
python3 rest_api_server.py
```

服务将在 `http://localhost:8000` 启动

### 2. 启动主项目后端（可选）

```bash
cd main/backend
mvn spring-boot:run
```

服务将在 `http://localhost:8081` 启动

### 3. 准备测试用户（主项目后端）

确保有可用的测试用户：
- 用户名: `test`
- 密码: `test123`

或通过环境变量设置：
```bash
export TEST_USERNAME=your_username
export TEST_PASSWORD=your_password
```

---

## 📝 测试计划

详细的测试计划请参考 `test-plan.md`，包括：

- 测试用例详细说明
- 测试步骤
- 预期结果
- 验收标准

---

## 🐛 故障排查

### HSMem 服务无法连接

**问题**: `无法连接到 HSMem 服务`

**解决方案**:
1. 检查服务是否运行: `curl http://localhost:8000/health`
2. 启动服务: `cd hsmem && python3 rest_api_server.py`
3. 检查端口是否被占用: `lsof -i :8000`

### 主项目后端无法连接

**问题**: `无法连接到主项目后端`

**解决方案**:
1. 检查服务是否运行: `curl http://localhost:8081`
2. 启动服务: `cd main/backend && mvn spring-boot:run`
3. 检查端口是否被占用: `lsof -i :8081`

### 认证失败

**问题**: `登录失败` 或 `未授权访问`

**解决方案**:
1. 检查测试用户名和密码是否正确
2. 确认数据库中有该用户
3. 检查JWT配置是否正确

### 测试脚本权限错误

**问题**: `Permission denied`

**解决方案**:
```bash
chmod +x scripts/test-memory-api/*.sh
```

---

## 📚 相关文档

- [HSMem API 指南](../../hsmem/API_GUIDE.md)
- [HSMem 使用指南](../../hsmem/USAGE.md)
- [测试计划](test-plan.md)
- [README](README.md)

---

## ✅ 测试检查清单

运行测试前，请确认：

- [ ] HSMem 服务已启动
- [ ] 主项目后端已启动（如需要）
- [ ] 测试用户已创建（主项目后端）
- [ ] 网络连接正常
- [ ] 测试脚本有执行权限

---

**最后更新**: 2026-01-11
