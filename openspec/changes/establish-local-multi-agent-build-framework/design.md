# Design: Local Multi-Agent Build Framework

## Context

### Background

当前项目完全基于大模型构建，存在以下核心问题：

1. **构建依赖外部服务**：构建和测试过程依赖在线大模型 API，无法在离线环境或网络不稳定时可靠工作
2. **构建系统分散**：各模块（main、admin、mentis、edu 等）使用不同的构建方式，缺乏统一管理
3. **多智能体支持不足**：虽然已有 AgentScope 集成，但缺乏统一的本地开发、测试、调试框架
4. **开发效率低**：每次测试都需要调用真实 API，成本高、速度慢、难以自动化

### Current Architecture

```
项目结构
├── main/backend/          # Maven 项目
├── admin/backend/         # Maven 项目
├── mentis/backend/        # Maven 项目（AgentScope 集成）
├── edu/backend/           # Maven 项目
├── frontend/              # npm/Vite 项目
└── 各模块独立构建脚本
    ├── build-fast.sh
    ├── deploy-*.sh
    └── 分散的构建配置
```

**问题**：
- 构建脚本分散，缺乏统一管理
- 依赖外部 API，构建不稳定
- 缺乏本地测试和调试工具
- 多智能体开发缺乏统一框架

### Constraints

1. **技术约束**：
   - 必须保持与现有 Spring Boot 3.2.0 架构兼容
   - 必须支持 Java 17、Node.js 18+
   - 必须支持 macOS、Linux、Windows
   - 必须保持现有构建流程向后兼容

2. **业务约束**：
   - 不能影响现有功能的正常运行
   - 必须支持渐进式迁移
   - 必须保持 API 兼容性

3. **资源约束**：
   - 工具应该轻量级，不增加过多依赖
   - 构建时间应该优化，不能显著增加
   - 本地环境设置应该简单快速

## Goals / Non-Goals

### Goals

1. **完全本地化的构建流程**：
   - 支持离线构建（不依赖外部 API）
   - 本地依赖缓存和管理
   - 构建缓存和增量构建

2. **统一的多智能体开发框架**：
   - 本地智能体模拟和测试
   - 智能体编排和协作工具
   - 统一的开发、测试、调试接口

3. **完整的开发工具链**：
   - 一键环境设置
   - 本地服务启动
   - 代码生成和脚手架
   - 调试和诊断工具

4. **提升开发效率**：
   - 构建时间减少 30%+
   - 环境设置时间从数小时减少到 30 分钟内
   - 支持本地运行所有测试

### Non-Goals

1. **不替换现有构建工具**：
   - 不替换 Maven、npm 等现有工具
   - 不改变现有项目结构
   - 不强制迁移，支持渐进式采用

2. **不完全模拟大模型**：
   - Mock 服务主要用于开发和测试
   - 不要求 100% 模拟真实 API 行为
   - 生产环境仍使用真实 API

3. **不改变现有架构**：
   - 不改变现有代码架构
   - 不改变数据库 schema
   - 不改变 API 接口

## Architecture Design

### Overall Architecture

```
本地开发环境
├── 统一构建系统
│   ├── 构建脚本框架
│   │   ├── build-all.sh          # 全量构建
│   │   ├── build-module.sh       # 单模块构建
│   │   └── build-config.yml      # 构建配置
│   ├── 依赖管理
│   │   ├── check-dependencies.sh # 依赖检查
│   │   ├── cache-dependencies.sh # 依赖缓存
│   │   └── .deps-cache/          # 本地依赖缓存
│   └── 构建缓存
│       ├── .build-cache/          # 构建缓存目录
│       └── cache-manager.sh       # 缓存管理
│
├── 多智能体框架
│   ├── 智能体模拟器
│   │   ├── AgentSimulator         # 模拟器核心
│   │   ├── MockAgent              # Mock 智能体实现
│   │   └── agent-config.yml       # 智能体配置
│   ├── 智能体编排
│   │   ├── AgentOrchestrator      # 编排器
│   │   ├── TaskScheduler          # 任务调度
│   │   └── CommunicationBus       # 通信总线
│   └── 测试框架
│       ├── AgentTestFramework     # 测试框架
│       ├── TestDataManager        # 测试数据管理
│       └── IntegrationTestEnv     # 集成测试环境
│
├── Mock 服务
│   ├── Mock LLM Service
│   │   ├── mock-llm-server        # Mock 服务实现
│   │   ├── response-templates/    # 响应模板
│   │   └── mock-config.yml        # Mock 配置
│   └── Mock External APIs
│       ├── mock-api-server        # Mock API 服务
│       └── mock-data/             # Mock 数据
│
└── 开发工具链
    ├── 环境设置
    │   ├── setup-local-env.sh    # 环境设置脚本
    │   └── check-env.sh           # 环境检查
    ├── 服务启动
    │   ├── start-local-services.sh # 启动本地服务
    │   └── docker-compose.local.yml # 本地 Docker 配置
    ├── 代码生成
    │   ├── generate-code.sh      # 代码生成工具
    │   └── templates/             # 代码模板
    └── 调试工具
        ├── view-logs.sh           # 日志查看
        ├── agent-status.sh        # 智能体状态
        └── debug-helper.sh        # 调试辅助
```

### Component Design

#### 1. 统一构建系统

**设计原则**：
- 统一接口，分散实现
- 支持并行构建
- 增量构建和缓存
- 离线构建支持

**核心组件**：

1. **构建脚本框架** (`scripts/build/`)
   - `build-all.sh`: 全量构建，支持并行
   - `build-module.sh`: 单模块构建，支持依赖检测
   - `build-config.yml`: 构建配置（模块列表、构建顺序、并行度等）

2. **依赖管理** (`scripts/build/deps/`)
   - `check-dependencies.sh`: 检查依赖完整性
   - `cache-dependencies.sh`: 缓存依赖到本地
   - `.deps-cache/`: 本地依赖缓存目录

3. **构建缓存** (`scripts/build/cache/`)
   - 文件级缓存（基于文件 hash）
   - 模块级缓存（基于模块版本）
   - 缓存清理和失效策略

**构建缓存策略细节**：

**缓存粒度**：
- **文件级缓存**：
  - 基于文件 hash（SHA-256），检测单个文件变更
  - 适用于源文件、配置文件等
  - 缓存键：`file:<path>:<hash>`
- **模块级缓存**：
  - 基于模块版本和依赖版本
  - 检测 `pom.xml`、`package.json` 变更
  - 缓存键：`module:<name>:<version>:<deps-hash>`
- **全局缓存**：
  - 跨模块共享的构建产物（如共享库、工具类）
  - 缓存键：`global:<artifact-name>:<version>`

**缓存失效策略**：
- **时间失效**：
  - 默认 TTL：7 天
  - 可配置：通过 `build-config.yml` 设置 `cache.ttl`
  - 自动清理：定期清理过期缓存
- **依赖变更失效**：
  - 检测 `pom.xml`、`package.json` 变更
  - 检测依赖版本变更
  - 自动失效相关缓存
- **手动失效**：
  - 提供 `cache-clean.sh` 脚本
  - 支持清理特定模块缓存
  - 支持清理全部缓存

**缓存存储**：
- **缓存目录**：`.build-cache/`（加入 `.gitignore`）
- **缓存格式**：
  - JSON 元数据文件：存储缓存信息（hash、时间戳、依赖等）
  - 构建产物：JAR、WAR、构建输出等
  - 目录结构：`<cache-dir>/<module>/<version>/<artifact>`
- **缓存大小限制**：
  - 默认限制：10GB（可配置）
  - 自动清理：当缓存超过限制时，清理最旧的缓存
  - 压缩选项：支持压缩缓存以节省空间

**缓存管理工具**：
- `cache-clean.sh`：清理缓存脚本
- `cache-stats.sh`：查看缓存统计信息
- `cache-export.sh`：导出缓存（用于离线构建）
- `cache-import.sh`：导入缓存（用于离线构建）

**实现要点**：
```bash
# build-all.sh 示例结构
#!/bin/bash
source scripts/build/common.sh

# 读取配置
CONFIG=$(load_config "build-config.yml")

# 检查依赖
check_dependencies

# 并行构建
build_modules_parallel "$CONFIG"

# 生成构建报告
generate_build_report
```

#### 2. 多智能体框架

**设计原则**：
- 与现有 AgentScope 集成
- 支持本地模拟和测试
- 统一的智能体接口
- 可扩展的架构

**核心组件**：

1. **智能体模拟器** (`tools/agent-simulator/`)
   - `AgentSimulator`: 模拟器核心接口
   - `MockAgent`: Mock 智能体实现
   - 支持行为模拟（响应延迟、错误模拟等）

2. **智能体编排** (`tools/agent-orchestrator/`)
   - `AgentOrchestrator`: 智能体编排器
   - `TaskScheduler`: 任务调度器
   - `CommunicationBus`: 智能体间通信总线

3. **测试框架** (`tools/test-framework/`)
   - `AgentTestFramework`: 智能体测试框架
   - `TestDataManager`: 测试数据管理
   - `IntegrationTestEnv`: 集成测试环境

**实现要点**：
```java
// AgentSimulator 接口示例
public interface AgentSimulator {
    AgentResponse simulate(AgentRequest request);
    void configure(AgentConfig config);
    void setBehavior(AgentBehavior behavior);
}

// MockAgent 实现
public class MockAgent implements AgentSimulator {
    private AgentConfig config;
    private AgentBehavior behavior;
    
    @Override
    public AgentResponse simulate(AgentRequest request) {
        // 模拟智能体响应
        return generateMockResponse(request);
    }
}
```

#### 3. Mock 服务

**设计原则**：
- 轻量级实现
- 可配置的响应
- 支持延迟和错误模拟
- 易于扩展

**核心组件**：

1. **Mock LLM Service** (`tools/mock-llm-service/`)
   - 实现标准 LLM API 接口（DashScope、OpenAI 等）
   - 响应模板系统
   - 规则引擎（基于请求内容返回不同响应）

2. **Mock External APIs** (`tools/mock-api-service/`)
   - 识别项目依赖的外部 API
   - 实现 Mock 服务
   - Mock 数据管理

**Mock LLM Service 实现细节**：

**架构选择**：
- **方案 A：独立 HTTP 服务**（推荐）
  - 优点：与真实 API 接口一致，易于切换，支持多语言客户端
  - 缺点：需要额外进程管理
  - 实现：使用 Spring Boot 或 Node.js 实现独立 HTTP 服务
  - 端口：默认 8081（可配置）
- **方案 B：嵌入式 Mock**（Spring Boot Test）
  - 优点：集成简单，无需额外进程，适合单元测试
  - 缺点：仅适用于测试环境，不支持跨语言客户端
  - 实现：使用 `@MockBean` 或自定义 `ChatModel` 实现

**API 兼容性**：
- **DashScope API 格式**：支持 `/api/v1/services/aigc/text-generation/generation` 端点
- **OpenAI API 格式**：支持 `/v1/chat/completions` 端点
- **Gemini API 格式**：支持 `/v1/models/*:generateContent` 端点（如需要）
- **统一配置接口**：通过 `mock-config.yml` 配置 API 格式和端点映射

**响应模板系统**：
- **模板匹配**：基于请求内容匹配模板
  - 关键词匹配：检查请求中的关键词
  - 正则表达式匹配：使用正则表达式匹配请求内容
  - 优先级：精确匹配 > 正则匹配 > 默认模板
- **延迟模拟**：
  - 可配置延迟时间（min/max）
  - 支持均匀分布、正态分布等延迟模式
  - 模拟真实 API 的响应延迟
- **错误模拟**：
  - 可配置错误率（如 5% 的请求返回错误）
  - 支持多种错误类型（超时、限流、服务错误等）
  - 支持特定场景的错误注入
- **模板存储**：
  - 模板存储在 `tools/mock-llm-service/templates/` 目录
  - 支持 JSON、YAML 格式的模板文件
  - 模板版本管理（Git 管理）

**实现要点**：
```java
// Mock LLM Service 示例（独立服务）
@RestController
@RequestMapping("/mock/llm")
public class MockLLMService {
    private ResponseTemplateEngine templateEngine;
    private DelaySimulator delaySimulator;
    private ErrorSimulator errorSimulator;
    
    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        // 错误模拟
        if (errorSimulator.shouldError()) {
            return errorSimulator.generateError();
        }
        
        // 延迟模拟
        delaySimulator.simulate();
        
        // 根据请求内容匹配模板
        ResponseTemplate template = templateEngine.match(request);
        return template.generate(request);
    }
}
```

**Mock 服务维护策略**：
- **自动化工具**：提供工具从真实 API 响应生成 Mock 模板
- **定期更新**：建议每周更新 Mock 模板，保持与真实 API 同步
- **版本管理**：Mock 模板使用 Git 管理，支持版本回退
- **测试验证**：定期运行测试验证 Mock 服务与真实 API 的一致性

#### 4. 开发工具链

**设计原则**：
- 一键操作
- 自动化程度高
- 友好的错误提示
- 详细的日志输出

**核心组件**：

1. **环境设置工具** (`scripts/dev/setup-local-env.sh`)
   - 检查环境（Java、Maven、Node.js、Docker）
   - 安装缺失依赖
   - 配置本地环境

2. **服务启动工具** (`scripts/dev/start-local-services.sh`)
   - 启动本地数据库（可选 Docker）
   - 启动 Mock 服务
   - 健康检查

3. **代码生成工具** (`scripts/dev/generate-code.sh`)
   - 基于模板生成代码
   - 支持多种代码类型（Controller、Service、Entity 等）
   - 代码验证

## Integration Points

### 1. 与现有构建系统集成

**策略**：
- 不替换现有构建脚本，而是包装和增强
- 提供统一入口，内部调用现有脚本
- 添加缓存和优化层

**实现**：
```bash
# build-module.sh 示例
build_module() {
    local module=$1
    
    # 检查缓存
    if is_cached "$module"; then
        echo "Using cache for $module"
        return
    fi
    
    # 调用现有构建脚本
    cd "$module/backend" || cd "$module"
    if [ -f "build-fast.sh" ]; then
        ./build-fast.sh dev
    elif [ -f "pom.xml" ]; then
        mvn clean package -DskipTests
    elif [ -f "package.json" ]; then
        npm run build
    fi
    
    # 更新缓存
    update_cache "$module"
}
```

### 2. 与 AgentScope 集成

**策略**：
- 在 AgentScope 基础上添加本地测试支持
- 提供 Mock 模型适配器
- 保持 AgentScope API 兼容

**AgentScope 集成细节**：

**Mock ChatModel 实现**：
- **接口实现**：实现 AgentScope 的 `ChatModel` 接口
- **内部机制**：内部使用 `AgentSimulator` 生成响应
- **API 兼容性**：保持与真实 `ChatModel` 的 API 完全兼容
- **响应格式**：返回与真实 API 相同格式的响应

**切换机制**：
- **配置驱动**：通过 `agent.mock.enabled=true` 启用 Mock
- **运行时切换**：支持运行时切换，无需重启服务
- **混合模式**：支持部分 Agent 使用 Mock，部分使用真实 API
- **环境变量**：支持通过环境变量 `AGENT_MOCK_ENABLED` 控制

**测试支持**：
- **注解支持**：提供 `@MockAgent` 注解，自动注入 Mock Agent
- **测试数据驱动**：支持从文件加载测试场景（JSON/YAML）
- **行为录制和回放**：
  - 录制真实 Agent 的行为
  - 回放录制的行为用于测试
  - 支持行为对比和验证

**实现**：
```java
// Mock ChatModel 适配器
public class MockChatModel implements ChatModel {
    private AgentSimulator simulator;
    private AgentConfig config;
    
    @Override
    public ChatResponse call(ChatRequest request) {
        // 使用模拟器生成响应
        return simulator.simulate(request);
    }
    
    @Override
    public Flux<ChatResponse> callStream(ChatRequest request) {
        // 支持流式响应
        return simulator.simulateStream(request);
    }
}

// 在 AgentScope 中使用
ReActAgent agent = ReActAgent.builder()
    .model(createChatModel())  // 根据配置选择 Mock 或真实模型
    .build();

// 配置示例
private ChatModel createChatModel() {
    if (config.isMockEnabled()) {
        return new MockChatModel(agentSimulator, config);
    } else {
        return DashScopeChatModel.builder()
            .apiKey(config.getApiKey())
            .modelName(config.getModelName())
            .build();
    }
}

// 测试中使用
@SpringBootTest
@MockAgent
public class AgentTest {
    @Autowired
    private ReActAgent agent;
    
    @Test
    void testAgentWithMock() {
        // 使用 Mock Agent 进行测试
        ChatResponse response = agent.call(request);
        // 验证响应
    }
}
```

### 3. 与现有测试框架集成

**策略**：
- 扩展现有测试框架（JUnit、Jest）
- 提供测试工具和辅助类
- 支持 Mock 服务注入

**实现**：
```java
// 测试辅助类
@SpringBootTest
public class AgentTestBase {
    @Autowired
    private MockLLMService mockLLMService;
    
    @BeforeEach
    void setup() {
        // 配置 Mock 服务
        mockLLMService.setResponseTemplate("default");
    }
}
```

### 4. 与现有脚本系统集成

**现状分析**：
- 项目已有 `scripts/start-all.sh`、`scripts/start-*-backend.sh` 等启动脚本
- 项目已有 `scripts/test-*.sh` 等测试脚本
- 各模块有独立的构建脚本（如 `main/backend/build-fast.sh`）

**集成策略**：

**并行存在策略**（推荐）：
- **保留现有脚本**：不删除或修改现有脚本，保持向后兼容
- **新脚本补充**：新工具链脚本放在 `scripts/build/` 和 `scripts/dev/` 目录
- **统一入口**：提供统一的入口脚本，内部调用现有脚本或新脚本
- **渐进式迁移**：团队可以逐步采用新脚本，旧脚本继续可用

**脚本目录结构**：
```
scripts/
├── start-all.sh              # 现有脚本（保留）
├── start-*-backend.sh         # 现有脚本（保留）
├── test-*.sh                 # 现有脚本（保留）
├── build/                     # 新构建脚本目录
│   ├── build-all.sh
│   ├── build-module.sh
│   └── ...
├── dev/                       # 新开发工具脚本目录
│   ├── setup-local-env.sh
│   ├── start-local-services.sh
│   └── ...
└── utils/                     # 共享工具函数（现有）
    └── port-utils.sh
```

**新脚本与现有脚本的关系**：

1. **`scripts/dev/start-local-services.sh` vs `scripts/start-all.sh`**：
   - `start-all.sh`：启动所有项目服务（生产模式）
   - `start-local-services.sh`：启动本地开发服务（包括 Mock 服务、测试数据库等）
   - 两者可以共存，用途不同

2. **`scripts/build/build-all.sh` vs 各模块构建脚本**：
   - `build-all.sh`：统一构建入口，内部调用各模块的构建脚本
   - 各模块构建脚本：保持不变，由 `build-all.sh` 调用
   - 添加缓存和优化层，不改变现有构建逻辑

3. **新测试框架 vs `scripts/test-*.sh`**：
   - `test-*.sh`：现有测试脚本，继续使用
   - 新测试框架：提供 Mock 服务支持，可以与现有测试脚本配合使用
   - 测试脚本可以选择使用 Mock 服务或真实 API

**实现示例**：
```bash
# scripts/build/build-all.sh
#!/bin/bash
source scripts/build/common.sh

# 读取配置
CONFIG=$(load_config "build-config.yml")

# 检查依赖
check_dependencies

# 构建各模块（调用现有构建脚本）
for module in "${CONFIG[@]}"; do
    MODULE_PATH="$module/backend"
    
    # 检查缓存
    if is_cached "$module"; then
        echo "Using cache for $module"
        continue
    fi
    
    # 调用现有构建脚本
    if [ -f "$MODULE_PATH/build-fast.sh" ]; then
        cd "$MODULE_PATH"
        ./build-fast.sh dev
    elif [ -f "$MODULE_PATH/pom.xml" ]; then
        cd "$MODULE_PATH"
        mvn clean package -DskipTests
    fi
    
    # 更新缓存
    update_cache "$module"
done
```

**迁移路径**：
1. **阶段 1**：新脚本与现有脚本并行存在
2. **阶段 2**：团队逐步采用新脚本，旧脚本继续可用
3. **阶段 3**：新脚本成熟后，可以考虑统一到新脚本系统（可选）

## Configuration

### build-config.yml

```yaml
build:
  modules:
    - name: main
      path: main/backend
      type: maven
      depends-on: []
    - name: admin
      path: admin/backend
      type: maven
      depends-on: []
    - name: mentis
      path: mentis/backend
      type: maven
      depends-on: []
    - name: frontend
      path: main/frontend
      type: npm
      depends-on: [main]
  
  parallel:
    enabled: true
    max-jobs: 4
  
  cache:
    enabled: true
    directory: .build-cache
    ttl: 7d
```

### agent-config.yml

```yaml
agents:
  - name: planner
    type: mock
    behavior: default
    response-delay: 100ms
  
  - name: executor
    type: mock
    behavior: default
    response-delay: 200ms

orchestration:
  max-concurrent: 5
  timeout: 30s
```

### mock-config.yml

```yaml
llm:
  enabled: true
  port: 8081
  templates:
    - pattern: ".*"
      response: "default-response.json"
  
  delay:
    min: 50ms
    max: 200ms
    distribution: uniform
```

## Migration Strategy

### Phase 1: 基础工具（1-2 周）

1. 创建构建脚本框架
2. 实现基础依赖管理
3. 实现环境设置工具
4. 文档和示例

### Phase 2: Mock 服务（2-3 周）

1. 实现 Mock LLM 服务
2. 实现 Mock 外部 API
3. 集成到测试框架
4. 测试和验证

### Phase 3: 多智能体框架（3-4 周）

1. 实现智能体模拟器
2. 实现智能体编排
3. 实现测试框架
4. 集成现有 AgentScope

### Phase 4: 优化和完善（2-3 周）

1. 性能优化
2. 功能增强
3. 文档完善
4. 团队培训

## Performance Considerations

### 1. 构建性能

**优化策略**：
- 并行构建（多模块同时构建）
- 增量构建（只构建变更模块）
- 构建缓存（避免重复构建）
- 依赖缓存（避免重复下载）

**目标**：
- 全量构建时间减少 30%+
- 增量构建时间减少 50%+

### 2. Mock 服务性能

**优化策略**：
- 轻量级实现（避免复杂逻辑）
- 响应缓存（相同请求缓存响应）
- 异步处理（支持并发请求）

**目标**：
- Mock 服务响应时间 < 10ms
- 支持 100+ 并发请求

### 3. 内存使用

**优化策略**：
- 流式处理（避免大量数据加载）
- 及时释放资源
- 限制并发数

## Security Considerations

### 1. 本地环境安全

**措施**：
- 环境变量管理（不硬编码敏感信息）
- 配置文件权限控制
- 本地服务访问控制

### 2. Mock 数据安全

**措施**：
- Mock 数据不包含真实敏感信息
- Mock 服务仅用于开发测试
- 生产环境禁用 Mock 服务

## Testing Strategy

### 1. 工具测试

- 单元测试（脚本功能测试）
- 集成测试（完整流程测试）
- 兼容性测试（不同环境测试）

### 2. 性能测试

- 构建时间对比
- Mock 服务性能测试
- 并发性能测试

### 3. 用户验收测试

- 开发者使用测试
- 反馈收集和优化

## Additional Risks and Mitigations

### 1. Mock 服务维护成本

**风险**：
- Mock 服务需要与真实 API 保持同步，维护成本高
- 真实 API 更新时，Mock 服务可能失效
- Mock 模板需要定期更新和验证

**缓解措施**：
- **自动化工具**：提供工具从真实 API 响应生成 Mock 模板
- **定期更新**：建议每周更新 Mock 模板，保持与真实 API 同步
- **版本管理**：Mock 模板使用 Git 管理，支持版本回退
- **测试验证**：定期运行测试验证 Mock 服务与真实 API 的一致性
- **文档化**：记录 Mock 模板的更新历史和变更原因

### 2. 构建缓存存储空间

**风险**：
- 构建缓存可能占用大量磁盘空间（10GB+）
- 缓存增长可能导致磁盘空间不足
- 缓存清理不及时可能影响系统性能

**缓解措施**：
- **大小限制**：设置缓存大小限制（默认 10GB，可配置）
- **自动清理**：自动清理过期缓存（基于 TTL）
- **压缩选项**：支持压缩缓存以节省空间
- **监控告警**：监控缓存大小，超过阈值时告警
- **清理工具**：提供便捷的缓存清理工具

### 3. 多平台兼容性

**风险**：
- 脚本在不同操作系统（macOS、Linux、Windows）可能不兼容
- Shell 脚本在 Windows 上需要 Git Bash 或 WSL
- 路径分隔符、权限等问题可能导致脚本失败

**缓解措施**：
- **跨平台脚本**：优先使用 Python 或 Node.js 脚本（跨平台性好）
- **平台检测**：脚本自动检测操作系统，使用平台特定的实现
- **文档说明**：明确说明各平台的使用方法和要求
- **充分测试**：在 macOS、Linux、Windows 上充分测试
- **备选方案**：提供平台特定的脚本变体（如 `.bat` 文件）

### 4. 工具复杂度

**风险**：
- 新工具链可能增加学习成本
- 团队成员需要时间熟悉新工具
- 工具配置可能复杂

**缓解措施**：
- **详细文档**：提供详细的使用文档和示例
- **逐步引入**：支持渐进式采用，不强制一次性迁移
- **默认配置**：提供简单易用的默认配置
- **培训和指导**：提供团队培训和一对一指导
- **社区支持**：建立内部社区，分享使用经验

## Open Questions

1. **Mock 服务准确性**：如何确保 Mock 服务与真实服务足够接近？
   - 方案：定期更新 Mock 模板，基于真实 API 响应生成模板
   - 补充：提供自动化工具和测试验证机制

2. **构建缓存策略**：如何平衡缓存命中率和存储空间？
   - 方案：基于时间的失效策略，定期清理旧缓存
   - 补充：设置缓存大小限制和自动清理机制

3. **多智能体框架复杂度**：如何平衡功能完整性和易用性？
   - 方案：提供简单默认配置，支持高级定制
   - 补充：提供详细文档和示例，支持渐进式采用

## References

- 现有构建脚本：`main/backend/build-fast.sh`、`deploy/deploy-backend-dev.sh`
- AgentScope 集成：`openspec/changes/integrate-agentscope-java`
- 项目架构：`openspec/project.md`
