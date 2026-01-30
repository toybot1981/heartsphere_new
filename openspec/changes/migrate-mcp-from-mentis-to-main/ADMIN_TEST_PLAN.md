# Admin MCP 管理功能测试计划

## 测试环境准备

### 前置条件
1. ✅ Main 后端服务运行在 `http://localhost:8081`
2. ✅ Admin 后端服务运行在 `http://localhost:8085`
3. ✅ Admin 前端服务运行在 `http://localhost:3005`
4. ✅ 数据库 `heartsphere` 中存在 `mcp_server_configs` 和 `mcp_service_templates` 表
5. ✅ Main 后端的 MCP API 接口正常（`/api/v1/ai/mcp/*`）

### 配置检查
- [ ] 检查 `admin/backend/src/main/resources/application.yml` 中的 `main.backend.base-url` 配置
- [ ] 确认值为 `http://localhost:8081`（或正确的 main 后端地址）

## 测试用例

### 1. MCP 配置 CRUD 测试

#### 1.1 创建 MCP 配置
- **步骤**：
  1. 登录 Admin 管理后台
  2. 进入 Mentis 管理 → MCP 配置管理
  3. 点击"创建配置"
  4. 填写配置信息（名称、类型、URL、API Key 等）
  5. 点击保存
- **预期结果**：
  - ✅ 配置创建成功
  - ✅ 配置出现在列表中
  - ✅ 数据库中 `mcp_server_configs` 表有对应记录

#### 1.2 查看 MCP 配置列表
- **步骤**：
  1. 进入 MCP 配置管理页面
  2. 查看配置列表
- **预期结果**：
  - ✅ 显示所有 MCP 配置
  - ✅ 显示配置的状态（启用/禁用）
  - ✅ 显示连接状态（如果有）

#### 1.3 查看单个 MCP 配置详情
- **步骤**：
  1. 点击配置列表中的某个配置
  2. 或点击"编辑"按钮
- **预期结果**：
  - ✅ 显示配置的详细信息
  - ✅ 所有字段正确显示

#### 1.4 更新 MCP 配置
- **步骤**：
  1. 点击某个配置的"编辑"按钮
  2. 修改配置信息
  3. 点击保存
- **预期结果**：
  - ✅ 配置更新成功
  - ✅ 列表中显示更新后的信息
  - ✅ 数据库中记录已更新

#### 1.5 删除 MCP 配置
- **步骤**：
  1. 点击某个配置的"删除"按钮
  2. 确认删除
- **预期结果**：
  - ✅ 配置删除成功
  - ✅ 从列表中移除
  - ✅ 数据库中记录已删除

### 2. Toggle（启用/禁用）测试

#### 2.1 启用配置
- **步骤**：
  1. 找到状态为"禁用"的配置
  2. 点击"启用"按钮
- **预期结果**：
  - ✅ 配置状态变为"启用"
  - ✅ 列表中状态显示为"启用"
  - ✅ 数据库中 `enabled` 字段为 `true`
  - ✅ Main 后端的配置状态同步更新

#### 2.2 禁用配置
- **步骤**：
  1. 找到状态为"启用"的配置
  2. 点击"禁用"按钮
- **预期结果**：
  - ✅ 配置状态变为"禁用"
  - ✅ 列表中状态显示为"禁用"
  - ✅ 数据库中 `enabled` 字段为 `false`
  - ✅ Main 后端的配置状态同步更新

### 3. 连接测试功能

#### 3.1 测试 MCP 连接
- **步骤**：
  1. 选择一个 MCP 配置
  2. 点击"连接测试"按钮
- **预期结果**：
  - ✅ 显示测试结果（成功/失败）
  - ✅ 如果成功，配置的 `connectionStatus` 更新为 `CONNECTED`
  - ✅ 如果失败，显示错误信息，`connectionStatus` 更新为 `ERROR`
  - ✅ `lastTestedAt` 字段更新为当前时间
  - ✅ 实际调用 main 后端的 `/api/v1/ai/mcp/configs/{id}/test` 接口

### 4. 工具列表功能

#### 4.1 获取 MCP 工具列表
- **步骤**：
  1. 选择一个 MCP 配置
  2. 点击"工具测试"按钮
  3. 查看工具列表
- **预期结果**：
  - ✅ 显示该 MCP 服务器的可用工具列表
  - ✅ 工具信息正确显示（名称、描述等）
  - ✅ 实际调用 main 后端的 `/api/v1/ai/mcp/configs/{id}/tools` 接口

### 5. 工具调用功能

#### 5.1 调用 MCP 工具
- **步骤**：
  1. 在工具测试对话框中
  2. 选择一个工具
  3. 填写工具参数
  4. 点击"调用"按钮
- **预期结果**：
  - ✅ 工具调用成功
  - ✅ 显示工具执行结果
  - ✅ 实际调用 main 后端的 `/api/v1/ai/mcp/configs/{id}/tools/{toolName}/call` 接口

### 6. 数据一致性测试

#### 6.1 验证数据源一致性
- **步骤**：
  1. 在 Admin 中创建/更新/删除 MCP 配置
  2. 直接查询数据库 `mcp_server_configs` 表
- **预期结果**：
  - ✅ Admin 的操作直接反映到数据库中
  - ✅ 数据在 `heartsphere` 数据库的 `mcp_server_configs` 表中
  - ✅ Main 后端可以读取到相同的配置

#### 6.2 验证 Main 后端同步
- **步骤**：
  1. 在 Admin 中创建/更新 MCP 配置
  2. 调用 Main 后端的 `/api/v1/ai/mcp/configs` 接口
- **预期结果**：
  - ✅ Main 后端返回的配置与 Admin 中显示的配置一致
  - ✅ 配置的 ID、名称、状态等字段一致

### 7. 错误处理测试

#### 7.1 Main 后端不可用时的处理
- **步骤**：
  1. 停止 Main 后端服务
  2. 在 Admin 中执行连接测试、工具列表、工具调用等操作
- **预期结果**：
  - ✅ 显示适当的错误提示
  - ✅ 不会导致 Admin 后端崩溃
  - ✅ 错误信息清晰易懂

#### 7.2 无效配置的处理
- **步骤**：
  1. 创建一个无效的 MCP 配置（错误的 URL 或 API Key）
  2. 执行连接测试
- **预期结果**：
  - ✅ 显示连接失败的错误信息
  - ✅ 配置的 `connectionStatus` 更新为 `ERROR`
  - ✅ `lastError` 字段记录错误信息

## 测试执行

### 手动测试步骤

1. **启动服务**：
   ```bash
   # 启动 Main 后端
   cd main/backend
   mvn spring-boot:run
   
   # 启动 Admin 后端
   cd admin/backend
   mvn spring-boot:run
   
   # 启动 Admin 前端
   cd admin/frontend
   npm run dev
   ```

2. **访问 Admin 管理后台**：
   - 打开浏览器访问 `http://localhost:3005`
   - 使用管理员账户登录

3. **执行测试用例**：
   - 按照上述测试用例逐一执行
   - 记录测试结果
   - 发现问题及时记录

### 自动化测试（可选）

可以编写集成测试来验证功能：

```java
// admin/backend/src/test/java/com/heartsphere/admin/controller/MentisManagementControllerTest.java
@SpringBootTest
@AutoConfigureMockMvc
class MentisManagementControllerTest {
    
    @Test
    void testGetMcpConfigs() {
        // 测试获取 MCP 配置列表
    }
    
    @Test
    void testCreateMcpConfig() {
        // 测试创建 MCP 配置
    }
    
    @Test
    void testToggleMcpConfig() {
        // 测试切换配置状态
    }
    
    @Test
    void testTestMcpConnection() {
        // 测试连接测试功能（需要 Mock main 后端）
    }
}
```

## 测试检查清单

- [ ] MCP 配置 CRUD 功能正常
- [ ] Toggle（启用/禁用）功能正常
- [ ] 连接测试功能正常
- [ ] 工具列表功能正常
- [ ] 工具调用功能正常
- [ ] 数据一致性验证通过
- [ ] Main 后端同步正常
- [ ] 错误处理正确
- [ ] 前端 UI 显示正常
- [ ] 所有 API 接口响应正常

## 已知问题

（测试过程中发现的问题记录在这里）

## 测试结果

### 测试日期：2026-01-28

### 测试人员：

### 测试结果：
- [ ] 通过
- [ ] 部分通过（说明问题）
- [ ] 未通过（说明问题）

### 问题记录：
