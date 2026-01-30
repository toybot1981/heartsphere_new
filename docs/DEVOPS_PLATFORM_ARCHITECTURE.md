# DevOps 平台架构文档

## 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    DevOps 平台                            │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   CMDB       │  │   Pipeline   │  │  Auto-Fix    │  │
│  │   Manager    │  │   Engine     │  │   Engine     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                 │                  │           │
│         └─────────────────┼──────────────────┘           │
│                           │                              │
│  ┌──────────────────────────────────────────────┐      │
│  │         Quality Gate Service                  │      │
│  └──────────────────────────────────────────────┘      │
│                           │                              │
│  ┌──────────────────────────────────────────────┐      │
│  │         Problem Detection Service              │      │
│  └──────────────────────────────────────────────┘      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 核心模块

### 1. CMDB 模块

#### 数据模型
- `Asset`: 资产实体
- `AssetType`: 资产类型
- `AssetRelationship`: 资产关系
- `AssetHistory`: 资产历史
- `AssetAuditLog`: 审计日志

#### 服务层
- `CMDBService`: CMDB 核心服务
- `AssetDiscoveryService`: 资产自动发现
- `AssetMonitoringService`: 资产监控

### 2. 部署流程模块

#### 数据模型
- `DeploymentPipeline`: 部署流程模板
- `PipelineStep`: 流程步骤
- `PipelineExecution`: 流程执行
- `PipelineStepExecution`: 步骤执行
- `CodeScanResult`: 代码扫描结果
- `TestResult`: 测试结果

#### 服务层
- `PipelineExecutionEngine`: 流程执行引擎
- `QualityGateService`: 质量门禁服务
- `CodeScanResultParser`: 代码扫描结果解析器
- `TestResultParser`: 测试结果解析器

### 3. 自动修复模块

#### 数据模型
- `AutoFixRecord`: 自动修复记录

#### 服务层
- `ProblemDetectionService`: 问题检测服务
- `AutoFixService`: 自动修复服务
- `CodeQualityFixer`: 代码质量修复器
- `TestFixer`: 测试修复器
- `ConfigurationFixer`: 配置修复器

### 4. 集成服务

#### 服务层
- `CMDBPipelineIntegrationService`: CMDB 与流程集成服务

## 数据流

### 流程执行流程

```
1. 用户触发流程执行
   ↓
2. PipelineExecutionEngine 创建执行记录
   ↓
3. 按顺序/并行执行步骤
   ↓
4. 每个步骤执行脚本
   ↓
5. 解析执行结果（代码扫描、测试）
   ↓
6. 质量门禁评估
   ↓
7. 如果失败，触发自动修复
   ↓
8. 记录到 CMDB（如配置）
   ↓
9. 更新执行状态
```

### 自动修复流程

```
1. 流程执行失败
   ↓
2. ProblemDetectionService 检测问题
   ↓
3. AutoFixService 生成修复方案
   ↓
4. 根据风险级别：
   - 低风险：自动应用
   - 高风险：等待审批
   ↓
5. 应用修复
   ↓
6. 验证修复效果
   ↓
7. 记录修复历史
```

## 数据库设计

### 核心表
- `cmdb_assets`: CMDB 资产表
- `cmdb_asset_relationships`: 资产关系表
- `cmdb_asset_history`: 资产历史表
- `deployment_pipelines`: 部署流程表
- `pipeline_executions`: 流程执行表
- `pipeline_step_executions`: 步骤执行表
- `code_scan_results`: 代码扫描结果表
- `test_results`: 测试结果表
- `auto_fix_records`: 自动修复记录表

## 技术栈

### 后端
- Spring Boot 3.x
- Spring Data JPA
- MySQL
- Lombok

### 前端
- React 18
- TypeScript
- Vite

### 测试
- JUnit 5
- Vitest
- Testing Library

## 扩展点

### 1. 代码扫描工具
- 实现 `CodeScanResultParser` 接口
- 添加新的扫描工具支持

### 2. 测试框架
- 实现 `TestResultParser` 接口
- 添加新的测试框架支持

### 3. 修复器
- 实现 `Fixer` 接口
- 添加新的修复策略

### 4. 资产发现
- 实现 `AssetDiscoveryService` 的具体逻辑
- 添加新的发现源

## 性能考虑

### 1. 流程执行
- 使用异步执行提高并发
- 步骤并行执行优化
- 结果缓存减少重复计算

### 2. CMDB 查询
- 使用索引优化查询
- 分页查询大数据集
- 关系查询优化

### 3. 自动修复
- 批量处理问题
- 修复结果缓存
- 异步验证

## 安全考虑

### 1. 认证授权
- JWT Token 认证
- 基于角色的访问控制

### 2. 数据安全
- 敏感信息加密
- 审计日志记录
- 数据备份

### 3. 执行安全
- 脚本执行沙箱
- 资源限制
- 执行日志审计

## 监控和告警

### 1. 流程监控
- 执行状态监控
- 执行时长统计
- 失败率统计

### 2. 资产监控
- 资产健康状态
- 变更监控
- 关系变更监控

### 3. 自动修复监控
- 修复成功率
- 修复耗时
- 修复效果统计
