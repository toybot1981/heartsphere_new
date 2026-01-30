# Change: 重构部署流程 - 以项目为主体入口

## Why

当前部署流程以"流程模板"为主体，用户需要先选择流程模板，然后执行。但实际使用场景中，用户更关心的是"为哪个项目部署"，而不是"执行哪个流程"。

### 当前问题

1. **不符合用户思维习惯**：
   - 用户首先想到的是"我要部署 main 项目"或"我要部署 admin 项目"
   - 而不是"我要执行测试环境完整部署流程"

2. **流程模板与项目分离**：
   - 流程模板是通用的，但实际部署时总是针对特定项目
   - 用户需要在执行时手动选择项目参数（module）

3. **步骤数显示为0**：
   - 由于 LazyInitializationException，步骤数据没有正确加载
   - 用户无法看到流程包含哪些步骤

## What Changes

### 1. 数据模型调整

#### 1.1 在 DeploymentPipeline 中添加 project 字段

```java
@Column(name = "project", length = 50)
private String project; // main, admin, company, edu, mentis, 或 "" 表示通用
```

#### 1.2 支持项目级别的流程管理

- 每个流程模板可以关联到特定项目，也可以设置为通用（所有项目可用）
- 项目列表：main, admin, company, edu, mentis, shared

### 2. UI 重构

#### 2.1 项目选择界面

- 首先显示项目列表（卡片形式）
- 每个项目卡片显示：
  - 项目名称和图标
  - 可用的部署流程数量
  - 最近部署状态

#### 2.2 项目部署流程界面

- 选择项目后，显示该项目的所有可用部署流程
- 流程卡片显示：
  - 流程名称和描述
  - 步骤列表（修复步骤数显示问题）
  - 环境标签（测试/生产）
  - 执行按钮

#### 2.3 执行流程界面

- 选择流程后，显示执行配置
- 自动填充项目参数（module）
- 显示流程步骤预览

### 3. 后端 API 调整

#### 3.1 添加项目相关的查询接口

```java
// 获取所有项目列表
GET /api/admin/devops/projects

// 获取指定项目的部署流程
GET /api/admin/devops/pipelines?project={project}

// 执行指定项目的部署流程
POST /api/admin/devops/pipelines/{pipelineId}/execute
{
  "project": "main",
  "parameters": {...}
}
```

## Impact

### 影响的文件

**后端：**
- `admin/backend/src/main/java/com/heartsphere/admin/entity/DeploymentPipeline.java` - 添加 project 字段
- `admin/backend/src/main/java/com/heartsphere/admin/repository/DeploymentPipelineRepository.java` - 添加按项目查询方法
- `admin/backend/src/main/java/com/heartsphere/admin/service/DeploymentPipelineService.java` - 添加项目相关服务方法
- `admin/backend/src/main/java/com/heartsphere/admin/controller/DeploymentPipelineController.java` - 添加项目相关接口
- `admin/backend/src/main/resources/pipelines/*.yml` - 更新模板配置，添加 project 字段
- `sql/create_pipeline_tables.sql` - 添加 project 字段到数据库表

**前端：**
- `admin/frontend/src/components/DevOpsWorkbench/PipelineManager.tsx` - 重构为项目选择界面
- `admin/frontend/src/components/DevOpsWorkbench/ProjectSelector.tsx` - 新建项目选择组件
- `admin/frontend/src/components/DevOpsWorkbench/ProjectPipelineList.tsx` - 新建项目流程列表组件
- `admin/frontend/src/services/api/admin/devops.ts` - 添加项目相关 API

### 影响的规范

- **部署流程规范**：需要定义项目与流程的关联关系
- **UI/UX 规范**：需要定义项目选择界面的设计规范

## Migration Strategy

1. **数据库迁移**：
   - 添加 `project` 字段到 `deployment_pipelines` 表
   - 为现有流程模板设置默认项目（根据流程名称推断，或设置为通用）

2. **模板配置更新**：
   - 更新所有 YAML 模板文件，添加 `project` 字段
   - 根据流程用途设置合适的项目

3. **前端逐步迁移**：
   - 保留原有的流程模板界面（作为备用）
   - 新增项目选择界面
   - 逐步引导用户使用新的界面

## Acceptance Criteria

1. ✅ 用户首先看到项目列表（main, admin, company, edu, mentis）
2. ✅ 选择项目后，显示该项目的所有可用部署流程
3. ✅ 流程卡片正确显示步骤数（修复 LazyInitializationException）
4. ✅ 执行流程时，项目参数自动填充
5. ✅ 支持创建项目特定的部署流程
6. ✅ 支持通用流程（所有项目可用）
