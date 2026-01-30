# 下一步工作计划

## 📋 当前状态

### ✅ 已完成

1. **E2B Provider 实现**
   - ✅ E2B API 客户端 (`E2BApiClient`)
   - ✅ E2B Provider 实现 (`E2BVmProviderImpl`)
   - ✅ 数据模型 (`E2BSandbox`, `E2BProcessResult`, `E2BVncInfo`)

2. **后端 API 集成**
   - ✅ VM 管理 API (`VmController`)
   - ✅ VNC 连接信息返回
   - ✅ 终端命令执行
   - ✅ 截图获取

3. **前端集成**
   - ✅ API 服务方法
   - ✅ useVirtualComputer Hook
   - ✅ VirtualComputerView 组件
   - ✅ TerminalViewer 组件
   - ✅ 对话历史加载（已完善）

4. **测试框架**
   - ✅ Java 单元测试和集成测试
   - ✅ Shell 脚本端到端测试
   - ✅ 测试文档

### ⏳ 待完成

1. **E2B API 验证**
   - [ ] 验证实际 API 端点
   - [ ] 调整请求/响应格式
   - [ ] 测试所有 API 方法

2. **前端功能完善**
   - [ ] 附件上传功能
   - [ ] 语音输入功能
   - [ ] VNC 客户端集成（noVNC）

3. **流式输出**
   - [ ] 命令输出的流式传输
   - [ ] 实时显示命令执行过程

4. **多智能体系统**
   - [ ] Planner Agent
   - [ ] Executor Agent
   - [ ] Monitor Agent

5. **工具生态系统**
   - [ ] 浏览器工具（Playwright）
   - [ ] 文件系统工具
   - [ ] 代码执行工具

## 🎯 推荐下一步（按优先级）

### 优先级 1: E2B API 验证和测试 ⭐⭐⭐

**目标**: 确保 E2B API 集成正确工作

**任务**:
1. 获取 E2B API 文档
2. 使用 curl 或 E2B CLI 测试实际 API
3. 验证所有端点
4. 调整代码实现
5. 运行端到端测试

**预计时间**: 1-2 天

**产出**:
- 验证后的 E2B API 实现
- 测试报告
- API 文档更新

### 优先级 2: 前端 VNC 客户端集成 ⭐⭐⭐

**目标**: 实现真实的 VNC 桌面显示

**任务**:
1. 集成 noVNC 客户端库
2. 实现 VNC 连接界面
3. 处理连接错误和重连
4. 优化用户体验

**预计时间**: 2-3 天

**产出**:
- VNC 客户端组件
- 连接管理功能
- 用户界面优化

### 优先级 3: 流式命令输出 ⭐⭐

**目标**: 实时显示命令执行过程

**任务**:
1. 后端实现流式输出
2. 前端实现流式接收
3. 实时更新终端显示

**预计时间**: 1-2 天

**产出**:
- 流式输出功能
- 实时终端显示

### 优先级 4: 附件上传和语音输入 ⭐

**目标**: 完善消息输入功能

**任务**:
1. 实现附件上传
2. 实现语音输入
3. 文件预览和处理

**预计时间**: 1-2 天

**产出**:
- 附件上传功能
- 语音输入功能

### 优先级 5: 多智能体系统 ⭐⭐⭐

**目标**: 实现 Planner + Executor + Monitor 协作

**任务**:
1. Planner Agent 实现
2. Executor Agent 实现
3. Monitor Agent 实现
4. 智能体通信机制

**预计时间**: 2-3 周

**产出**:
- 多智能体系统
- 任务分解和执行
- 监控和恢复机制

## 📝 立即行动项

### 1. E2B API 验证（推荐首先执行）

```bash
# 1. 获取 E2B API Key
export E2B_API_KEY="your-e2b-api-key"

# 2. 测试创建沙箱
curl -X POST "https://api.e2b.dev/v2/sandbox" \
  -H "Authorization: Bearer $E2B_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"template": "base"}'

# 3. 查看实际响应格式
# 4. 根据响应调整代码
```

### 2. 前端 VNC 客户端集成

```bash
# 1. 安装 noVNC
cd mentis/frontend
npm install @novnc/core

# 2. 创建 VNC 客户端组件
# 3. 集成到 VirtualComputerView
# 4. 测试连接
```

### 3. 运行端到端测试

```bash
# 1. 配置 E2B API Key
export E2B_API_KEY="your-e2b-api-key"

# 2. 启动后端服务
cd mentis/backend
mvn spring-boot:run

# 3. 运行测试
./scripts/test-e2e-vm.sh
```

## 🔄 迭代计划

### 迭代 1: 基础功能验证（本周）
- [ ] E2B API 验证
- [ ] 端到端测试运行
- [ ] 修复发现的问题

### 迭代 2: 用户体验提升（下周）
- [ ] VNC 客户端集成
- [ ] 流式命令输出
- [ ] 附件上传功能

### 迭代 3: 高级功能（后续）
- [ ] 多智能体系统
- [ ] 工具生态系统
- [ ] 持久化和检查点

## 📊 成功标准

### 功能完整性
- [ ] 所有 E2B API 端点正常工作
- [ ] 虚拟机创建、删除、命令执行正常
- [ ] VNC 连接和桌面显示正常
- [ ] 终端命令执行和输出正常

### 用户体验
- [ ] 界面响应流畅
- [ ] 错误提示清晰
- [ ] 操作直观易用

### 稳定性
- [ ] 端到端测试通过
- [ ] 错误处理完善
- [ ] 资源清理正常

## 🎉 总结

当前已完成核心功能实现，下一步重点是：

1. **验证 E2B API** - 确保基础功能正确
2. **集成 VNC 客户端** - 实现桌面显示
3. **完善用户体验** - 流式输出、附件上传等
4. **实现多智能体系统** - 高级功能

建议优先进行 E2B API 验证，确保基础功能正确后再进行其他开发。
