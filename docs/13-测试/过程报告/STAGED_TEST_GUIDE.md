# 分阶段测试指南

## 概述

`test-auth-init-staged.sh` 是一个分阶段测试脚本，可以将注册、登录、初始化测试分成7个独立的阶段执行。这对于：
- 调试特定功能
- 处理需要邮箱验证码的情况
- 逐步验证系统功能
- 在测试中断后继续执行

## 测试阶段

### 阶段1: 服务可用性检查
- 检查后端服务是否运行
- 验证API端点可访问性

### 阶段2: 系统配置检查
- 检查是否需要邀请码
- 检查是否需要邮箱验证码
- 返回配置信息供后续阶段使用

### 阶段3: 注册功能测试（基础验证）
- 测试无效注册请求（缺少字段）
- 测试无效密码（不符合规则）
- 测试无效邮箱格式
- **不执行实际注册**，只验证输入校验

### 阶段4: 注册功能测试（完整流程）
- 执行实际注册
- 测试重复用户名/邮箱检测
- 验证初始化过程（世界创建）
- **如果系统要求邮箱验证码，需要提供验证码或跳过**

### 阶段5: 登录功能测试
- 测试错误密码登录
- 测试不存在用户登录
- 测试正常登录
- **需要先完成阶段4的注册**

### 阶段6: 用户信息获取测试
- 测试使用Token获取用户信息
- 测试无Token访问（应被拒绝）
- **需要先完成阶段5的登录**

### 阶段7: 初始化过程验证
- 验证世界是否已创建
- 验证世界数据完整性
- **需要先完成阶段5的登录**

## 使用方法

### 基本用法

```bash
# 运行所有阶段
./test-auth-init-staged.sh

# 或明确指定
./test-auth-init-staged.sh all
```

### 运行单个阶段

```bash
# 只运行阶段1（服务检查）
./test-auth-init-staged.sh 1

# 只运行阶段2（配置检查）
./test-auth-init-staged.sh 2

# 只运行阶段3（基础验证）
./test-auth-init-staged.sh 3

# 只运行阶段4（完整注册）
./test-auth-init-staged.sh 4

# 只运行阶段5（登录测试）
./test-auth-init-staged.sh 5

# 只运行阶段6（用户信息）
./test-auth-init-staged.sh 6

# 只运行阶段7（初始化验证）
./test-auth-init-staged.sh 7
```

### 处理邮箱验证码

如果系统启用了邮箱验证码，有几种方式处理：

#### 方式1: 跳过需要验证码的测试

```bash
SKIP_EMAIL_VERIFICATION=true ./test-auth-init-staged.sh 4
```

#### 方式2: 手动提供验证码

```bash
# 先发送验证码（会在阶段4中自动发送）
./test-auth-init-staged.sh 4

# 从邮件或后端日志获取验证码后，再次运行并提供验证码
EMAIL_CODE=123456 ./test-auth-init-staged.sh 4
```

#### 方式3: 临时禁用邮箱验证码要求

在管理后台临时禁用邮箱验证码要求，然后运行测试。

### 分阶段执行示例

```bash
# 步骤1: 检查服务
./test-auth-init-staged.sh 1

# 步骤2: 检查配置
./test-auth-init-staged.sh 2

# 步骤3: 基础验证（不需要注册）
./test-auth-init-staged.sh 3

# 步骤4: 完整注册（如果需要验证码，先发送）
./test-auth-init-staged.sh 4

# 如果阶段4需要验证码，获取验证码后：
EMAIL_CODE=123456 ./test-auth-init-staged.sh 4

# 步骤5: 登录测试（使用阶段4注册的用户）
./test-auth-init-staged.sh 5

# 步骤6: 用户信息测试
./test-auth-init-staged.sh 6

# 步骤7: 初始化验证
./test-auth-init-staged.sh 7
```

### 使用已存在的用户信息

如果之前已经注册了用户，可以直接使用：

```bash
REGISTERED_USERNAME=testuser_xxx \
REGISTERED_PASSWORD=Test1234@ \
./test-auth-init-staged.sh 5

# 或使用已有的Token
REGISTERED_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... \
./test-auth-init-staged.sh 6
```

### 自定义后端地址

```bash
BASE_URL=http://your-backend:8081 ./test-auth-init-staged.sh
```

## 环境变量说明

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `BASE_URL` | 后端服务地址 | `http://localhost:8081` | `http://192.168.1.100:8081` |
| `STAGE` | 测试阶段 | `all` | `1`, `2`, `3`, `4`, `5`, `6`, `7` |
| `SKIP_EMAIL_VERIFICATION` | 跳过邮箱验证 | `false` | `true` |
| `EMAIL_CODE` | 手动提供验证码 | - | `123456` |
| `REGISTERED_USERNAME` | 已注册用户名 | - | `testuser_123` |
| `REGISTERED_PASSWORD` | 已注册密码 | - | `Test1234@` |
| `REGISTERED_TOKEN` | 已注册Token | - | `eyJhbGciOiJ...` |
| `LOGIN_TOKEN` | 登录Token | - | `eyJhbGciOiJ...` |

## 测试流程建议

### 首次测试

1. **阶段1-2**: 验证服务可用性和配置
2. **阶段3**: 验证输入校验逻辑
3. **阶段4**: 执行注册（处理验证码）
4. **阶段5-7**: 验证登录和初始化

### 日常测试

如果系统配置不变，可以：
- 直接运行 `./test-auth-init-staged.sh all`
- 或只运行关键阶段：`./test-auth-init-staged.sh 4 5 6 7`

### 调试特定问题

- 注册问题：运行阶段3和4
- 登录问题：运行阶段5
- 初始化问题：运行阶段7

## 常见问题

### Q: 阶段4失败，提示需要邮箱验证码

**A**: 有几种解决方案：
1. 设置 `SKIP_EMAIL_VERIFICATION=true` 跳过
2. 提供验证码：`EMAIL_CODE=123456 ./test-auth-init-staged.sh 4`
3. 临时禁用系统的邮箱验证码要求

### Q: 阶段5失败，提示需要先注册

**A**: 需要先完成阶段4的注册，或者手动设置：
```bash
REGISTERED_USERNAME=xxx REGISTERED_PASSWORD=xxx ./test-auth-init-staged.sh 5
```

### Q: 如何获取邮箱验证码？

**A**: 
1. 查看邮件（如果邮件服务器已配置）
2. 查看后端日志（验证码会记录在日志中）
3. 在测试环境中，可以临时禁用邮箱验证码要求

### Q: 测试中断后如何继续？

**A**: 保存阶段4的用户信息，然后继续：
```bash
# 保存的信息
REGISTERED_USERNAME=testuser_xxx
REGISTERED_PASSWORD=Test1234@

# 继续执行后续阶段
REGISTERED_USERNAME=testuser_xxx REGISTERED_PASSWORD=Test1234@ ./test-auth-init-staged.sh 5
```

## 输出说明

测试脚本会输出：
- ✅ PASS - 测试通过
- ❌ FAIL - 测试失败（带错误信息）
- ⚠️ 警告 - 跳过某些测试（带原因）

最后会显示测试总结：
- 总测试数
- 通过数
- 失败数
- 失败详情

## 与完整测试脚本的区别

| 特性 | test-auth-init.sh | test-auth-init-staged.sh |
|------|-------------------|-------------------------|
| 执行方式 | 一次性运行所有测试 | 可分阶段运行 |
| 邮箱验证码 | 自动跳过 | 支持手动提供或跳过 |
| 调试友好 | 一般 | 优秀（可单独运行阶段） |
| 中断恢复 | 需要重新开始 | 可以从任意阶段继续 |
| 适用场景 | 快速完整测试 | 调试、分步验证 |

## 帮助信息

查看完整帮助：
```bash
./test-auth-init-staged.sh --help
```
