# 记忆API全面测试

本目录包含记忆API的全面测试脚本和文档。

## 📋 测试脚本

### 1. comprehensive-test.sh
**全面测试脚本** - 测试所有记忆API接口

```bash
./scripts/test-memory-api/comprehensive-test.sh
```

**功能**:
- 测试 HSMem Python API
- 测试主项目后端记忆API
- 测试错误处理
- 测试性能
- 生成测试报告

**环境变量**:
- `HSMEM_URL` - HSMem服务地址 (默认: http://localhost:8000)
- `MAIN_BACKEND_URL` - 主项目后端地址 (默认: http://localhost:8081)

### 2. test-hsmem-python-api.sh
**HSMem Python API 测试** - 使用Python测试脚本

```bash
./scripts/test-memory-api/test-hsmem-python-api.sh
```

**功能**:
- 检查HSMem服务状态
- 运行Python测试脚本 (test_rest_api.py)
- 自动启动服务（可选）

### 3. test-main-backend-api.sh
**主项目后端记忆API测试**

```bash
./scripts/test-memory-api/test-main-backend-api.sh
```

**功能**:
- 测试主项目后端的记忆API接口
- 需要有效的登录凭证
- 测试CRUD操作
- 测试错误处理

**环境变量**:
- `BACKEND_URL` - 后端地址 (默认: http://localhost:8081)
- `TEST_USERNAME` - 测试用户名 (默认: test)
- `TEST_PASSWORD` - 测试密码 (默认: test123)

## 🚀 快速开始

### 前置条件

1. **启动 HSMem 服务**:
```bash
cd hsmem
python3 rest_api_server.py
```

2. **启动主项目后端** (可选):
```bash
cd main/backend
mvn spring-boot:run
```

### 运行测试

#### 方式1: 运行全面测试
```bash
./scripts/test-memory-api/comprehensive-test.sh
```

#### 方式2: 分别测试
```bash
# 测试 HSMem Python API
./scripts/test-memory-api/test-hsmem-python-api.sh

# 测试主项目后端API
./scripts/test-memory-api/test-main-backend-api.sh
```

## 📊 测试覆盖

### HSMem Python API
- ✅ 健康检查
- ✅ 对话记忆化
- ✅ 文本记忆化
- ✅ 文档记忆化
- ✅ 记忆检索
- ✅ 统计信息
- ✅ 分类列表
- ✅ 错误处理

### 主项目后端API
- ✅ 用户登录
- ✅ 记忆搜索
- ✅ 保存记忆
- ✅ 获取记忆
- ✅ 更新记忆
- ✅ 删除记忆
- ✅ 错误处理

## 📝 测试报告

测试脚本会自动生成测试报告，包括：
- 总测试数
- 通过/失败数量
- 详细错误信息

## 🔧 故障排查

### HSMem 服务无法连接
```bash
# 检查服务是否运行
curl http://localhost:8000/health

# 启动服务
cd hsmem
python3 rest_api_server.py
```

### 主项目后端无法连接
```bash
# 检查服务是否运行
curl http://localhost:8081

# 启动服务
cd main/backend
mvn spring-boot:run
```

### 认证失败
- 检查测试用户名和密码是否正确
- 确认后端服务已启动
- 检查数据库连接

## 📚 相关文档

- [HSMem API 指南](../../hsmem/API_GUIDE.md)
- [HSMem 使用指南](../../hsmem/USAGE.md)
- [主项目记忆API文档](../../main/backend/docs/memory-api.md) (如果存在)
