# 注册、登录、初始化测试总结

## 已创建的测试文件

### 1. test-auth-init.sh
**完整测试脚本** - 一次性运行所有测试
- 支持所有注册、登录、初始化测试
- 自动处理邮箱验证码情况（跳过或提示）
- 适合快速完整测试

### 2. test-auth-init-staged.sh ⭐ **推荐**
**分阶段测试脚本** - 支持分阶段执行
- 7个独立测试阶段，可单独运行
- 支持跳过需要邮箱验证码的测试
- 支持手动提供验证码
- 支持使用已存在的用户信息继续测试
- 适合调试和分步验证

### 3. test-auth-init.py
**Python版本测试脚本** - 更完善的JSON处理
- 使用Python requests库
- 更好的错误处理和JSON解析
- 适合需要复杂测试逻辑的场景

## 测试覆盖内容

### ✅ 阶段1: 服务可用性检查
- 后端服务运行状态
- API端点可访问性

### ✅ 阶段2: 系统配置检查
- 邀请码配置
- 邮箱验证码配置

### ✅ 阶段3: 注册功能测试（基础验证）
- 无效注册请求（缺少字段）
- 无效密码（不符合规则）
- 无效邮箱格式
- **不执行实际注册**

### ✅ 阶段4: 注册功能测试（完整流程）
- 实际注册流程
- 重复用户名/邮箱检测
- 初始化验证（世界创建）
- JWT Token返回
- 首次登录标识

### ✅ 阶段5: 登录功能测试
- 错误密码登录
- 不存在用户登录
- 正常登录
- 首次登录标识验证
- 世界数据返回

### ✅ 阶段6: 用户信息获取测试
- Token认证
- 无Token访问拒绝
- 用户信息完整性

### ✅ 阶段7: 初始化过程验证
- 默认世界创建（"心域"）
- 世界数据完整性

## 快速开始

### 方式1: 分阶段测试（推荐）

```bash
# 运行所有阶段
./test-auth-init-staged.sh

# 只运行阶段1（服务检查）
./test-auth-init-staged.sh 1

# 只运行阶段2（配置检查）
./test-auth-init-staged.sh 2

# 跳过邮箱验证运行阶段4
SKIP_EMAIL_VERIFICATION=true ./test-auth-init-staged.sh 4
```

### 方式2: 完整测试

```bash
# 运行完整测试
./test-auth-init.sh
```

### 方式3: Python版本

```bash
# 需要先安装requests
pip3 install requests

# 运行测试
python3 test-auth-init.py
```

## 处理邮箱验证码

系统启用了邮箱验证码时，有3种处理方式：

### 方式1: 跳过需要验证码的测试
```bash
SKIP_EMAIL_VERIFICATION=true ./test-auth-init-staged.sh 4
```

### 方式2: 手动提供验证码
```bash
# 先发送验证码
./test-auth-init-staged.sh 4

# 从邮件或后端日志获取验证码后
EMAIL_CODE=123456 ./test-auth-init-staged.sh 4
```

### 方式3: 临时禁用邮箱验证码要求
在管理后台临时禁用邮箱验证码要求

## 测试结果示例

### 成功运行示例
```
========================================
注册、登录、初始化过程分阶段测试
========================================

测试环境: http://localhost:8081
测试阶段: 1

阶段1: 服务可用性检查
✅ PASS - 后端服务运行正常

测试总结
总测试数: 1
通过: 1
失败: 0

✅ 所有测试通过！
```

### 需要验证码时的提示
```
阶段4: 注册功能测试（完整流程）
⚠️  系统要求邮箱验证码，跳过完整注册测试
   如需测试完整注册流程，请：
   1. 临时禁用邮箱验证码要求，或
   2. 设置 SKIP_EMAIL_VERIFICATION=true 跳过此阶段，或
   3. 手动提供验证码进行测试
```

## 文档

- **STAGED_TEST_GUIDE.md** - 分阶段测试详细指南
- **TEST_AUTH_INIT_README.md** - 完整测试文档
- **QUICK_TEST_GUIDE.md** - 快速使用指南

## 测试统计

根据当前测试运行情况：

- ✅ 服务可用性检查 - 通过
- ✅ 系统配置检查 - 通过
- ✅ 注册基础验证 - 通过（3/3）
- ⚠️ 注册完整流程 - 需要邮箱验证码
- ⏭️ 登录测试 - 需要先完成注册
- ⏭️ 用户信息测试 - 需要先完成登录
- ⏭️ 初始化验证 - 需要先完成登录

## 下一步建议

1. **如果系统启用了邮箱验证码**：
   - 使用 `SKIP_EMAIL_VERIFICATION=true` 跳过需要验证码的测试
   - 或临时禁用邮箱验证码要求进行完整测试
   - 或手动提供验证码完成测试

2. **完成完整测试流程**：
   ```bash
   # 步骤1: 基础检查
   ./test-auth-init-staged.sh 1
   ./test-auth-init-staged.sh 2
   ./test-auth-init-staged.sh 3
   
   # 步骤2: 完整注册（跳过验证码）
   SKIP_EMAIL_VERIFICATION=true ./test-auth-init-staged.sh 4
   
   # 步骤3: 登录和后续测试
   ./test-auth-init-staged.sh 5
   ./test-auth-init-staged.sh 6
   ./test-auth-init-staged.sh 7
   ```

3. **日常快速测试**：
   ```bash
   # 运行所有阶段（自动跳过需要验证码的部分）
   SKIP_EMAIL_VERIFICATION=true ./test-auth-init-staged.sh all
   ```

## 注意事项

1. 测试会创建测试用户（用户名以`testuser_`开头），这些用户会保留在数据库中
2. 建议在测试环境运行，不要在生产环境使用
3. 如果测试中断，可以使用已保存的用户信息继续后续阶段测试
4. 确保后端服务已启动在指定端口（默认8081）

## 故障排查

### 问题: 无法连接到后端服务
- 检查后端服务是否已启动
- 检查端口是否正确（默认8081）
- 检查BASE_URL配置

### 问题: 阶段4失败，需要邮箱验证码
- 使用 `SKIP_EMAIL_VERIFICATION=true` 跳过
- 或提供验证码：`EMAIL_CODE=123456 ./test-auth-init-staged.sh 4`

### 问题: 阶段5失败，需要先注册
- 先完成阶段4的注册
- 或手动设置：`REGISTERED_USERNAME=xxx REGISTERED_PASSWORD=xxx ./test-auth-init-staged.sh 5`

## 总结

✅ **已完成**：
- 创建了3个测试脚本（Bash完整版、Bash分阶段版、Python版）
- 实现了7个测试阶段的完整覆盖
- 支持邮箱验证码的处理
- 提供了详细的使用文档

🎯 **推荐使用**：
- **分阶段测试脚本** (`test-auth-init-staged.sh`) - 最灵活，适合调试
- 使用 `SKIP_EMAIL_VERIFICATION=true` 跳过需要验证码的测试

📚 **参考文档**：
- 详细指南：`STAGED_TEST_GUIDE.md`
- 快速开始：`QUICK_TEST_GUIDE.md`
