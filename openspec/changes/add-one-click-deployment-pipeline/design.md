# 一键部署流程设计文档

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                  Admin Frontend                         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │      Deployment Pipeline Manager                │  │
│  │  - PipelineTemplateList                         │  │
│  │  - PipelineExecutor                             │  │
│  │  - PipelineProgressView (可视化)                │  │
│  └─────────────────────────────────────────────────┘  │
└────────────────────┬──────────────────────────────────┘
                     │ HTTP/REST API + SSE
                     │
┌────────────────────▼──────────────────────────────────┐
│              Admin Backend                            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  DeploymentPipelineController                    │  │
│  │  - 流程模板CRUD                                  │  │
│  │  - 流程执行接口                                  │  │
│  │  - 流程状态查询                                  │  │
│  └────────────────────┬────────────────────────────┘  │
│                       │                                │
│  ┌────────────────────▼────────────────────────────┐  │
│  │  PipelineExecutionEngine                        │  │
│  │  - 流程编排和执行                                │  │
│  │  - 步骤依赖管理                                  │  │
│  │  - 条件执行逻辑                                  │  │
│  └────────────────────┬────────────────────────────┘  │
│                       │                                │
│  ┌────────────────────▼────────────────────────────┐  │
│  │  ScriptExecutionEngine (复用)                  │  │
│  │  - 执行单个脚本                                  │  │
│  │  - 实时日志推送                                  │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 数据模型

### 流程模板 (DeploymentPipeline)

```java
@Entity
public class DeploymentPipeline {
    private Long id;
    private String name;                    // 流程名称
    private String description;              // 流程描述
    private String environment;             // 目标环境 (test/prod)
    private List<PipelineStep> steps;        // 流程步骤
    private String createdBy;               // 创建人
    private LocalDateTime createdAt;        // 创建时间
    private boolean isTemplate;             // 是否为模板
}
```

### 流程步骤 (PipelineStep)

```java
@Entity
public class PipelineStep {
    private Long id;
    private Long pipelineId;                // 所属流程ID
    private String name;                    // 步骤名称
    private String scriptId;                // 关联的脚本ID
    private int order;                      // 执行顺序
    private List<Long> dependsOn;           // 依赖的步骤ID列表
    private Map<String, Object> parameters; // 步骤参数
    private String condition;               // 执行条件（如：previous_step.success）
    private boolean parallel;               // 是否可并行执行
    private boolean required;               // 是否必需（失败是否停止流程）
}
```

### 流程执行 (PipelineExecution)

```java
@Entity
public class PipelineExecution {
    private Long id;
    private Long pipelineId;                // 流程模板ID
    private String status;                  // 执行状态 (RUNNING/SUCCESS/FAILED/CANCELLED)
    private LocalDateTime startedAt;        // 开始时间
    private LocalDateTime finishedAt;        // 结束时间
    private String executedBy;              // 执行人
    private List<PipelineStepExecution> stepExecutions; // 步骤执行记录
}
```

### 步骤执行记录 (PipelineStepExecution)

```java
@Entity
public class PipelineStepExecution {
    private Long id;
    private Long pipelineExecutionId;       // 流程执行ID
    private Long stepId;                    // 步骤ID
    private Long scriptExecutionId;         // 关联的脚本执行ID
    private String status;                  // 步骤状态
    private LocalDateTime startedAt;         // 开始时间
    private LocalDateTime finishedAt;        // 结束时间
    private String error;                    // 错误信息
}
```

## 流程执行引擎设计

### 执行流程

1. **流程初始化**
   - 加载流程模板
   - 创建流程执行记录
   - 初始化步骤执行记录

2. **步骤编排**
   - 根据依赖关系构建执行图
   - 确定并行/串行执行顺序
   - 创建执行队列

3. **步骤执行**
   - 检查执行条件
   - 调用 ScriptExecutionEngine 执行脚本
   - 监听脚本执行状态
   - 更新步骤执行状态

4. **流程控制**
   - 检查步骤执行结果
   - 根据条件决定是否继续执行
   - 处理错误和回滚

5. **流程完成**
   - 更新流程执行状态
   - 发送完成通知
   - 清理资源

### 依赖关系处理

- **串行执行**：步骤A完成后执行步骤B
- **并行执行**：步骤A和B可以同时执行
- **条件执行**：根据前置步骤结果决定是否执行

### 错误处理

- **必需步骤失败**：立即停止流程，标记为失败
- **可选步骤失败**：记录错误，继续执行后续步骤
- **回滚机制**：支持定义回滚步骤（如：部署失败后回滚）

## 前端可视化设计

### Pipeline视图

```
┌─────────────────────────────────────────────────────────┐
│  部署流程: 测试环境完整部署                              │
│  [🟢 运行中] 已执行: 2/5 步骤                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [✅] 安全扫描    [✅] 代码扫描    [🟢] 单元测试        │
│    │              │              │                    │
│    └──────────────┴──────────────┘                    │
│                        │                               │
│                   [⏸️] 构建                           │
│                        │                               │
│                   [⏸️] 部署                           │
│                                                         │
│  当前步骤: 单元测试 (执行中...)                         │
│  预计剩余时间: 5分钟                                    │
└─────────────────────────────────────────────────────────┘
```

### 步骤状态指示

- **⏸️ 待执行**：灰色，未开始
- **🟢 执行中**：蓝色，正在执行，显示进度
- **✅ 成功**：绿色，执行成功
- **❌ 失败**：红色，执行失败
- **⏭️ 跳过**：黄色，条件不满足被跳过
- **⏹️ 已取消**：灰色，流程被取消

### 实时更新

- 使用SSE推送流程执行状态
- 步骤状态实时更新
- 当前执行步骤高亮显示
- 日志流实时显示

## 预定义流程模板

### 测试环境完整部署流程

```yaml
name: 测试环境完整部署
description: 包含安全扫描、代码扫描、测试、构建、部署的完整流程
environment: test
steps:
  - name: 安全扫描
    scriptId: code-scan-security
    order: 1
    required: true
    parameters:
      severity: medium
  
  - name: 代码扫描
    scriptId: code-scan-eslint
    order: 2
    dependsOn: [1]
    required: true
    parameters:
      module: ""
      fix: false
  
  - name: 单元测试
    scriptId: test-unit
    order: 3
    dependsOn: [2]
    required: true
    parameters:
      module: ""
      coverage: true
  
  - name: 构建
    scriptId: build-all
    order: 4
    dependsOn: [3]
    required: true
    parameters:
      clean: false
      skipTests: false
  
  - name: 部署到测试环境
    scriptId: deploy-all-dev
    order: 5
    dependsOn: [4]
    required: true
    parameters:
      skipBuild: true
```

### 生产环境完整部署流程

```yaml
name: 生产环境完整部署
description: 生产环境部署流程，包含完整的安全检查
environment: prod
steps:
  - name: 安全扫描
    scriptId: code-scan-security
    order: 1
    required: true
    parameters:
      severity: high
  
  - name: 代码扫描
    scriptId: code-scan-sonar
    order: 2
    dependsOn: [1]
    required: true
  
  - name: 全量测试
    scriptId: test-all
    order: 3
    dependsOn: [2]
    required: true
  
  - name: 构建
    scriptId: build-all
    order: 4
    dependsOn: [3]
    required: true
    parameters:
      clean: true
      skipTests: false
  
  - name: 部署到生产环境
    scriptId: deploy-backend-prod
    order: 5
    dependsOn: [4]
    required: true
    confirmRequired: true
    parameters:
      version: latest
```

## API设计

### 流程模板管理

- `GET /api/admin/devops/pipelines` - 获取流程模板列表
- `GET /api/admin/devops/pipelines/{id}` - 获取流程模板详情
- `POST /api/admin/devops/pipelines` - 创建流程模板
- `PUT /api/admin/devops/pipelines/{id}` - 更新流程模板
- `DELETE /api/admin/devops/pipelines/{id}` - 删除流程模板

### 流程执行

- `POST /api/admin/devops/pipelines/{id}/execute` - 执行流程
- `GET /api/admin/devops/pipelines/executions/{executionId}` - 获取流程执行状态
- `GET /api/admin/devops/pipelines/executions/{executionId}/steps` - 获取步骤执行状态
- `POST /api/admin/devops/pipelines/executions/{executionId}/cancel` - 取消流程执行
- `GET /api/admin/devops/pipelines/executions` - 获取流程执行历史

### 实时状态推送

- `GET /api/admin/devops/pipelines/executions/{executionId}/stream` - SSE推送流程执行状态

## 安全考虑

1. **权限控制**：生产环境部署需要 SUPER_ADMIN 权限
2. **确认机制**：高风险操作需要二次确认
3. **审计日志**：记录所有流程执行操作
4. **参数验证**：严格验证流程参数，防止注入攻击

## 性能考虑

1. **并行执行**：支持步骤并行执行，提高执行效率
2. **状态缓存**：缓存流程执行状态，减少数据库查询
3. **日志流**：使用SSE推送日志，减少HTTP请求
4. **超时控制**：为每个步骤设置超时时间，防止长时间阻塞
