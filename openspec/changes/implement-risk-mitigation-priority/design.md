# Design: 实施风险缓解优先级任务

## Context

在系统大重构（refactor-split-into-subprojects）开始前，需要实施风险缓解优先级任务。这些任务基于风险分析中识别的高风险项，旨在降低重构过程中的风险。

## Goals / Non-Goals

### Goals

1. **代码分析工具和流程**：
   - 建立代码重复度检测机制
   - 建立依赖关系分析机制
   - 集成到 CI/CD，自动检测和告警

2. **技术培训计划**：
   - 团队熟悉 Maven 多模块项目
   - 团队熟悉 npm/yarn workspace
   - 提供详细的操作文档和 FAQ

3. **API 兼容层**：
   - 支持旧 API 路径重定向到新路径
   - 在迁移过渡期保持 API 兼容性
   - 提供 API 路径迁移工具

4. **统一构建脚本**：
   - 支持单独构建和联合构建
   - 优化构建性能（并行构建、缓存）
   - 集成到 CI/CD

### Non-Goals

1. **不实现完整的重构**：只实施风险缓解准备任务
2. **不改变现有代码结构**：只添加工具和脚本
3. **不引入新的技术栈**：使用现有技术栈的工具

## Decisions

### Decision 1: 代码分析工具选择

**Chosen**: SonarQube（如果已有）或 CodeClimate（如果使用 GitHub）

**Alternatives considered**:
1. SonarQube
   - Pros: 功能强大，支持多种语言，可以自托管
   - Cons: 需要服务器资源，配置较复杂

2. CodeClimate
   - Pros: 与 GitHub 集成好，使用简单
   - Cons: 免费版功能有限

3. 简单的代码分析脚本
   - Pros: 轻量级，易于定制
   - Cons: 功能有限，需要自己实现

**Rationale**: 优先使用 SonarQube（如果已有），否则使用 CodeClimate。如果都没有，可以先用简单的脚本，后续再集成专业工具。

### Decision 2: API 兼容层实现方式

**Chosen**: Spring Boot 的 @RequestMapping 支持多个路径

**具体实现**:
```java
@RestController
@RequestMapping({"/api/old-path", "/api/client/new-path"})
public class SomeController {
    // ...
}
```

**Alternatives considered**:
1. 使用 Spring 的 URL 重定向
   - Pros: 简单直接
   - Cons: 需要额外的重定向逻辑

2. 使用 API 网关
   - Pros: 统一管理，功能强大
   - Cons: 增加系统复杂度

3. 使用反向代理（Nginx）
   - Pros: 性能好，不侵入代码
   - Cons: 需要额外的配置

**Rationale**: 使用 Spring Boot 的多路径支持最简单，不需要额外的基础设施，且易于维护。

### Decision 3: 构建脚本组织方式

**Chosen**: 使用 Shell 脚本（bash），支持单独构建和联合构建

**脚本结构**:
```
scripts/
├── build-all.sh          # 构建所有项目
├── build-client.sh       # 构建客户端
├── build-admin.sh        # 构建管理端
├── build-mentis.sh       # 构建 Mentis
└── setup-dev.sh          # 开发环境设置
```

**Alternatives considered**:
1. 使用 Makefile
   - Pros: 跨平台，功能强大
   - Cons: 团队可能不熟悉

2. 使用 Gradle/Maven 多模块
   - Pros: 统一管理
   - Cons: 前端项目使用 npm，需要混合方案

3. 使用 CI/CD 配置
   - Pros: 自动化
   - Cons: 本地开发不便

**Rationale**: Shell 脚本简单直接，团队熟悉，易于维护。可以后续集成到 CI/CD。

### Decision 4: 培训材料组织方式

**Chosen**: Markdown 文档 + 实际操作示例

**材料结构**:
```
docs/
├── training/
│   ├── maven-multi-module.md      # Maven 多模块培训
│   ├── npm-workspace.md           # npm workspace 培训
│   └── examples/                  # 实际操作示例
├── development-guide.md           # 开发指南
└── faq.md                         # 常见问题
```

**Alternatives considered**:
1. 视频教程
   - Pros: 直观易懂
   - Cons: 制作成本高，更新不便

2. 在线文档（Wiki）
   - Pros: 易于更新和协作
   - Cons: 需要额外的平台

3. 交互式教程
   - Pros: 学习效果好
   - Cons: 制作成本高

**Rationale**: Markdown 文档易于维护和更新，可以包含代码示例，适合技术文档。

## Risks / Trade-offs

### 风险 1: 代码分析工具配置复杂

**风险**: SonarQube 或 CodeClimate 的配置可能较复杂

**缓解措施**:
- 提供详细的配置文档
- 使用 Docker 简化部署（如果使用 SonarQube）
- 如果配置困难，先使用简单的脚本

### 风险 2: API 兼容层可能影响性能

**风险**: 多个路径映射可能略微影响性能

**缓解措施**:
- 性能影响通常可以忽略不计
- 在迁移完成后移除兼容层
- 监控 API 响应时间

### 风险 3: 构建脚本维护成本

**风险**: 构建脚本可能需要频繁更新

**缓解措施**:
- 保持脚本简单，易于理解
- 添加详细的注释
- 建立脚本维护规范

## Implementation Plan

### 阶段 1: 代码分析工具和流程（3-4 天）

1. **安装和配置代码分析工具**
   - 评估现有工具（SonarQube/CodeClimate）
   - 安装和配置工具
   - 配置项目分析规则

2. **建立代码重复度基线**
   - 运行代码分析，生成基线报告
   - 设定目标值（< 3%）
   - 记录当前代码重复度

3. **集成到 CI/CD**
   - 配置 CI/CD 检查
   - 设置告警阈值
   - 测试告警机制

### 阶段 2: 技术培训计划（3-4 天）

1. **准备培训材料**
   - 编写 Maven 多模块培训材料
   - 编写 npm workspace 培训材料
   - 准备实际操作示例

2. **创建操作文档**
   - 编写开发指南
   - 编写 FAQ
   - 创建快速参考卡片

3. **安排培训**
   - 安排培训时间
   - 进行培训
   - 收集反馈

### 阶段 3: API 兼容层（2-3 天）

1. **设计 API 兼容机制**
   - 设计路径映射方案
   - 设计兼容层接口
   - 创建 API 路径映射表

2. **实现 API 兼容层**
   - 实现路径重定向
   - 添加兼容层注解
   - 编写测试

3. **创建 API 迁移工具**
   - 创建 API 路径迁移脚本
   - 测试迁移脚本
   - 编写使用文档

### 阶段 4: 统一构建脚本（2-3 天）

1. **创建构建脚本**
   - 创建统一构建脚本
   - 创建各子项目构建脚本
   - 添加构建选项（开发/测试/生产）

2. **优化构建流程**
   - 实现并行构建
   - 添加构建缓存
   - 优化构建时间

3. **集成到 CI/CD**
   - 更新 CI/CD 配置
   - 测试构建流程
   - 监控构建性能

## Open Questions

1. **代码分析工具**: 团队是否已有 SonarQube 或 CodeClimate？
2. **培训时间**: 团队何时可以进行培训？
3. **API 兼容层**: 是否需要支持所有旧 API 路径？
4. **构建脚本**: 是否需要支持 Windows 系统？
