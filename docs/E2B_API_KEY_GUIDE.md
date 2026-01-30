# E2B API Key 获取指南

## 📋 概述

本文档说明如何获取 E2B API Key，这是使用 E2B VM Provider 的必需配置。

## 🔑 获取 E2B API Key 的步骤

### 步骤 1: 访问 E2B 官网

1. 打开浏览器，访问 [E2B 官网](https://e2b.dev)
2. 点击右上角的 **"Sign Up"** 或 **"Get Started"** 按钮

### 步骤 2: 注册账号

1. 填写注册信息：
   - 邮箱地址（Email）
   - 密码（Password）
   - 用户名（可选）
2. 点击 **"Sign Up"** 完成注册
3. 检查邮箱，点击确认链接（如果需要）

### 步骤 3: 登录 Dashboard

1. 注册完成后，自动跳转到 Dashboard
2. 或访问 [E2B Dashboard](https://e2b.dev/dashboard) 手动登录

### 步骤 4: 获取 API Key

**方法一：从 Dashboard 获取**

1. 登录后，进入 Dashboard 主页
2. 在左侧菜单或顶部导航栏找到 **"API Keys"** 或 **"Settings"** 选项
3. 点击进入 API Keys 页面
4. 找到 **"Create API Key"** 或 **"Generate API Key"** 按钮
5. 点击生成新的 API Key
6. **重要**：复制生成的 API Key 并妥善保存（只会显示一次）

**方法二：从账户设置获取**

1. 点击右上角用户头像或菜单
2. 选择 **"Settings"** 或 **"Account Settings"**
3. 找到 **"API Keys"** 或 **"API Access"** 部分
4. 点击 **"Create New API Key"** 或 **"Generate API Key"**
5. 复制生成的 API Key

### 步骤 5: 保存 API Key

⚠️ **重要提示**：

- API Key 只显示一次，请立即复制保存
- API Key 格式通常为：`e2b_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- 不要将 API Key 提交到代码仓库
- 不要在不安全的环境下使用

## 🔧 配置 API Key

### 方法 1: 环境变量（推荐）

**macOS / Linux (Bash / Zsh)**:

```bash
# 临时设置（当前终端会话有效）
export E2B_API_KEY="e2b_your-api-key-here"

# 永久设置（添加到 ~/.zshrc 或 ~/.bashrc）
echo 'export E2B_API_KEY="e2b_your-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

**Windows (PowerShell)**:

```powershell
# 临时设置（当前会话有效）
$env:E2B_API_KEY = "e2b_your-api-key-here"

# 永久设置（用户级别）
[System.Environment]::SetEnvironmentVariable("E2B_API_KEY", "e2b_your-api-key-here", "User")
```

**Windows (CMD)**:

```cmd
# 临时设置
set E2B_API_KEY=e2b_your-api-key-here

# 永久设置（需要重启）
setx E2B_API_KEY "e2b_your-api-key-here"
```

### 方法 2: 配置文件（不推荐用于生产环境）

**application.yml**:

```yaml
mentis:
  e2b:
    api-key: e2b_your-api-key-here  # 不推荐：API Key 暴露在配置文件中
```

⚠️ **注意**：不要在配置文件中直接写入 API Key，特别是提交到代码仓库时。

### 方法 3: IDE 运行配置

**IntelliJ IDEA**:
1. 打开 **Run** → **Edit Configurations...**
2. 选择你的运行配置
3. 在 **Environment variables** 中添加：
   ```
   E2B_API_KEY=e2b_your-api-key-here
   ```
4. 点击 **OK** 保存

**VS Code**:
1. 创建或编辑 `.vscode/launch.json`
2. 添加环境变量：
   ```json
   {
     "configurations": [
       {
         "env": {
           "E2B_API_KEY": "e2b_your-api-key-here"
         }
       }
     ]
   }
   ```

## ✅ 验证 API Key 配置

### 方法 1: 使用 curl 测试

```bash
# 设置 API Key
export E2B_API_KEY="e2b_your-api-key-here"

# 测试创建沙箱（根据实际 E2B API 文档调整端点）
curl -X POST "https://api.e2b.dev/v2/sandbox" \
  -H "Authorization: Bearer $E2B_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"template": "base"}'
```

### 方法 2: 运行测试脚本

```bash
# 设置 API Key
export E2B_API_KEY="e2b_your-api-key-here"

# 运行测试脚本
cd mentis/backend
./scripts/test-e2e-vm.sh
```

### 方法 3: 检查应用日志

启动应用后，查看日志中是否有 E2B 相关的错误：

```bash
# 启动应用
cd mentis/backend
mvn spring-boot:run

# 查看日志
tail -f logs/application.log | grep -i e2b
```

## 🔒 安全建议

1. **不要提交 API Key 到代码仓库**
   - 使用 `.gitignore` 忽略包含 API Key 的配置文件
   - 使用环境变量管理敏感信息

2. **使用密钥管理工具**（生产环境）
   - AWS Secrets Manager
   - HashiCorp Vault
   - Kubernetes Secrets
   - Azure Key Vault

3. **定期轮换 API Key**
   - 定期更换 API Key
   - 删除不再使用的 API Key

4. **限制 API Key 权限**（如果 E2B 支持）
   - 创建具有最小权限的 API Key
   - 只为必要的操作授权

## ❓ 常见问题

### Q1: 找不到 API Key 页面？

**A**: 
- 确保已登录 E2B 账号
- 检查是否完成了邮箱验证
- 查看 E2B 文档中的最新说明

### Q2: API Key 格式是什么？

**A**: E2B API Key 通常以 `e2b_` 开头，后面跟着一串字符，例如：
```
e2b_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### Q3: 如何重置 API Key？

**A**:
1. 登录 E2B Dashboard
2. 进入 API Keys 页面
3. 找到需要重置的 API Key
4. 点击 **"Revoke"** 或 **"Delete"** 删除旧 Key
5. 创建新的 API Key

### Q4: API Key 泄露了怎么办？

**A**:
1. **立即** 登录 E2B Dashboard
2. **立即** 删除泄露的 API Key
3. 创建新的 API Key
4. 更新所有使用旧 API Key 的地方
5. 检查是否有异常使用记录

### Q5: 环境变量不生效？

**A**:
- 确保在正确的 shell 中设置环境变量
- 检查环境变量名称是否正确（大小写敏感）
- 重启应用/IDE 以使环境变量生效
- 使用 `echo $E2B_API_KEY` 验证环境变量是否设置成功

## 🔗 相关链接

- [E2B 官网](https://e2b.dev)
- [E2B Dashboard](https://e2b.dev/dashboard)
- [E2B 文档](https://e2b.dev/docs)
- [E2B API 参考](https://e2b.dev/docs/api-reference)
- [E2B GitHub](https://github.com/e2b-dev)

## 📝 下一步

获取 API Key 后，请：

1. ✅ 配置环境变量
2. ✅ 验证 API Key 是否生效
3. ✅ 运行端到端测试
4. ✅ 开始使用 E2B VM Provider

参考文档：
- [E2B Provider 实现说明](../mentis/backend/src/main/java/com/heartsphere/mentis/vm/impl/E2B_README.md)
- [端到端测试指南](../openspec/changes/implement-manus-virtual-computer/E2E_TEST_GUIDE.md)
