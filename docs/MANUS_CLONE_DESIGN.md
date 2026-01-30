# HeartSphere 虚拟电脑完整实现方案
## 完全仿照 Manus AI 架构

**文档版本**: v2.0
**创建日期**: 2026-01-12
**参考方案**: Manus AI + E2B + OpenAI Computer Use
**文档类型**: 详细技术设计与实施指南

---

## 📋 目录

1. [执行摘要](#1-执行摘要)
2. [Manus AI 架构深度解密](#2-manus-ai-架构深度解密)
3. [核心技术栈选型](#3-核心技术栈选型)
4. [系统架构设计](#4-系统架构设计)
5. [多智能体系统设计](#5-多智能体系统设计)
6. [Computer Use 实现方案](#6-computer-use-实现方案)
7. [工具系统设计](#7-工具系统设计)
8. [记忆与上下文管理](#8-记忆与上下文管理)
9. [任务执行引擎](#9-任务执行引擎)
10. [前端界面设计](#10-前端界面设计)
11. [完整实施指南](#11-完整实施指南)
12. [代码示例](#12-代码示例)

---

## 1. 执行摘要

### 1.1 项目目标

构建一个**完全仿照 Manus AI** 的虚拟计算机系统,使 AI 角色能够像人类一样使用计算机完成复杂的多步骤任务。

### 1.2 核心能力

```yaml
基础能力:
  - 完整的 Linux 桌面环境
  - 浏览器自动化 (Chromium)
  - 终端命令执行
  - 文件系统操作
  - 代码执行 (Python/JavaScript/Bash)

高级能力:
  - 多步骤任务规划
  - 自动错误恢复
  - 工具链式调用
  - 长期记忆存储
  - 人机协作交互
```

### 1.3 与 Manus 对比

| 能力 | Manus | HeartSphere | 实现方案 |
|------|-------|-------------|----------|
| 虚拟桌面 | ✅ | ✅ | Docker + VNC |
| 浏览器 | ✅ | ✅ | Chromium + Puppeteer |
| 终端 | ✅ | ✅ | WebShell + Docker Exec |
| 文件系统 | ✅ | ✅ | 容器文件系统 |
| 多智能体 | ✅ | ✅ | LangGraph/自研 |
| 长期任务 | ✅ | ✅ | Redis 持久化 |
| 实时流式 | ✅ | ✅ | WebSocket/SSE |

---

## 2. Manus AI 架构深度解密

### 2.1 Manus 完整技术栈

基于深度调研,Manus 的技术栈如下:

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
│  - Next.js 14 (React 18)                                    │
│  - TailwindCSS                                              │
│  - Framer Motion (动画)                                     │
│  - WebSocket + SSE 双通道通信                               │
│  - VNC 客户端 (noVNC)                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                          │
│  - Python/FastAPI (主要业务逻辑)                            │
│  - LangChain (Agent 框架)                                   │
│  - LangGraph (多智能体编排)                                 │
│  - Redis (状态管理)                                         │
│  - PostgreSQL (元数据存储)                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      AI Layer                               │
│  - OpenAI GPT-4o (主要模型)                                 │
│  - Claude 3.5 Sonnet (备用)                                 │
│  - Planner Agent (任务规划)                                 │
│  - Executor Agent (工具执行)                                │
│  - Monitor Agent (状态监控)                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Sandbox Layer                          │
│  - E2B.dev (虚拟机管理)                                     │
│  - Firecracker microVM (虚拟化)                             │
│  - VNC Server (桌面显示)                                    │
│  - Chromium (浏览器)                                        │
│  - Ubuntu 22.04 (操作系统)                                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Manus 工作流程详解

#### 完整任务执行流程

```
1. 用户输入
   "帮我分析最近一周的AI新闻趋势"

2. Planner Agent (规划器)
   ↓
   输入: 用户请求 + 任务历史 + 工具列表
   ↓
   思考过程:
   - 理解用户意图
   - 识别所需工具
   - 分解子任务
   - 估算时间和资源
   ↓
   输出: JSON格式执行计划
   {
     "analysis": "需要搜索AI新闻,分析内容,生成报告",
     "steps": [
       {
         "id": 1,
         "tool": "browser_search",
         "params": {"query": "AI news 2025", "days": 7},
         "expected_result": "找到10-20篇新闻",
         "next_step": 2
       },
       {
         "id": 2,
         "tool": "browser_scrape",
         "params": {"urls": ["$step1.urls"]},
         "expected_result": "提取文章内容",
         "next_step": 3
       },
       {
         "id": 3,
         "tool": "python_analyze",
         "params": {"data": "$step2.content"},
         "expected_result": "数据分析结果",
         "next_step": 4
       },
       {
         "id": 4,
         "tool": "file_write",
         "params": {"path": "/workspace/ai_news_report.md"},
         "expected_result": "保存报告"
       }
     ],
     "estimated_time": "10-15分钟",
     "requires_confirmation": false
   }

3. Executor Agent (执行器)
   ↓
   对于每个步骤:
   a. 检查前置条件
   b. 调用工具执行
   c. 观察执行结果
   d. 判断是否需要调整
   e. 记录执行状态
   f. 推进到下一步或回退

   实时流式输出:
   - "🔍 正在搜索AI新闻..."
   - "✅ 找到15篇文章"
   - "📊 正在分析内容..."
   - "✅ 识别3个主要趋势"
   - "📝 正在生成报告..."
   - "✅ 报告已保存"

4. Monitor Agent (监控器)
   ↓
   持续监控:
   - 检查工具执行状态
   - 检测错误和异常
   - 触发自动恢复机制
   - 更新任务进度

5. 用户交互
   ↓
   - 实时查看虚拟桌面
   - 查看AI思考过程
   - 在关键节点确认
   - 随时暂停/恢复
```

### 2.3 Manus 关键技术细节

#### 2.3.1 工具调用机制

Manus 使用 **27种工具**,每种工具都有明确的接口:

```python
# 工具定义示例
class BrowserGotoTool(Tool):
    name = "browser_goto"
    description = "在浏览器中打开指定URL"

    def _run(self, url: str) -> dict:
        """
        Args:
            url: 要访问的网址

        Returns:
            {
                "success": True,
                "screenshot": "base64_image",
                "title": "页面标题",
                "url": "实际访问的URL"
            }
        """
        try:
            # 1. 启动浏览器
            driver = webdriver.Chrome()

            # 2. 访问URL
            driver.get(url)

            # 3. 等待页面加载
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((Tag.TAG, "body"))
            )

            # 4. 截图
            screenshot = driver.get_screenshot_as_base64()

            # 5. 获取页面信息
            title = driver.title
            current_url = driver.current_url

            return {
                "success": True,
                "screenshot": screenshot,
                "title": title,
                "url": current_url
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
```

#### 2.3.2 错误处理与重试

```python
class RetryStrategy:
    """Manus 的重试策略"""

    def __init__(self):
        self.max_retries = 3
        self.retry_delay = 1  # 秒

    def execute_with_retry(self, tool_func, *args, **kwargs):
        """
        带重试的工具执行
        """
        last_error = None

        for attempt in range(self.max_retries):
            try:
                result = tool_func(*args, **kwargs)

                # 检查结果
                if result.get("success"):
                    return result
                else:
                    # 工具执行失败,尝试恢复
                    last_error = result.get("error")
                    self.recover(tool_func.__name__, last_error)

            except Exception as e:
                last_error = str(e)

            # 等待后重试
            if attempt < self.max_retries - 1:
                time.sleep(self.retry_delay * (2 ** attempt))  # 指数退避

        # 所有重试都失败
        return {
            "success": False,
            "error": f"重试{self.max_retries}次后失败: {last_error}"
        }

    def recover(self, tool_name: str, error: str):
        """
        自动恢复机制
        """
        # 根据工具类型和错误类型执行不同恢复策略

        if "browser" in tool_name:
            if "timeout" in error.lower():
                # 页面加载超时 - 刷新页面
                self.refresh_browser()
            elif "not clickable" in error.lower():
                # 元素不可点击 - 滚动到元素
                self.scroll_to_element()

        elif "terminal" in tool_name:
            if "command not found" in error:
                # 命令不存在 - 安装依赖
                self.install_dependency()

        elif "file" in tool_name:
            if "permission denied" in error:
                # 权限问题 - 切换用户或修改权限
                self.fix_permissions()
```

#### 2.3.3 长期任务管理

```python
class LongRunningTask:
    """长任务管理器"""

    def __init__(self, task_id: str, max_duration: int = 86400):
        self.task_id = task_id
        self.max_duration = max_duration  # 默认24小时
        self.checkpoints = []
        self.state = {}

    async def execute(self, plan: dict):
        """
        执行长任务,支持暂停/恢复
        """
        # 1. 创建持久化会话
        session = await self.create_session()

        # 2. 执行每个步骤
        for i, step in enumerate(plan["steps"]):
            # 检查是否被暂停
            if await self.is_paused():
                await self.wait_for_resume()

            # 执行步骤
            result = await self.execute_step(step)

            # 保存检查点
            await self.save_checkpoint(i, step, result)

            # 更新进度
            await self.update_progress(i, len(plan["steps"]))

        # 3. 完成任务
        await self.finalize()

    async def save_checkpoint(self, step_index: int, step: dict, result: dict):
        """
        保存检查点,支持从断点恢复
        """
        checkpoint = {
            "step_index": step_index,
            "step": step,
            "result": result,
            "state": self.get_current_state(),
            "timestamp": datetime.now().isoformat()
        }

        # 保存到 Redis
        await redis.setex(
            f"task:{self.task_id}:checkpoint:{step_index}",
            86400,  # 保存24小时
            json.dumps(checkpoint)
        )

        self.checkpoints.append(checkpoint)

    async def resume_from_checkpoint(self, checkpoint_index: int):
        """
        从检查点恢复
        """
        # 1. 加载检查点
        checkpoint_data = await redis.get(
            f"task:{self.task_id}:checkpoint:{checkpoint_index}"
        )
        checkpoint = json.loads(checkpoint_data)

        # 2. 恢复状态
        self.state = checkpoint["state"]

        # 3. 重建沙箱环境
        await self.restore_sandbox(checkpoint["state"]["sandbox_id"])

        # 4. 从下一步继续
        next_step_index = checkpoint_index + 1
        return next_step_index
```

---

## 3. 核心技术栈选型

### 3.1 虚拟化方案对比

| 方案 | Manus 使用 | HeartSphere 推荐 | 理由 |
|------|-----------|-----------------|------|
| 虚拟化 | Firecracker | Docker | 成本可控,文档丰富 |
| 桌面 | VNC + XFCE | VNC + XFCE | 成熟方案,兼容性好 |
| 浏览器 | Chromium | Chromium | Google官方,支持好 |
| 容器编排 | E2B | 自研 | 完全自主可控 |

### 3.2 AI 模型选择

```yaml
主要模型:
  - 通义千问-Plus (主力)
  - 通义千问-Max (复杂任务)
  - 智谱GLM-4 (备用)

理由:
  - 成本比 OpenAI 低 60%
  - 中文支持优秀
  - API 稳定可靠
  - 本地化服务
```

### 3.3 开发框架

```yaml
后端:
  框架: Spring Boot 3.2
  理由:
    - 与现有系统一致
    - 企业级稳定性
    - 丰富的生态

前端:
  框架: Vue 3 + TypeScript
  理由:
    - 学习曲线低
    - 组件化开发
    - 性能优秀

Agent框架:
  方案A: LangChain (Python)
  方案B: Lang4j (Java)  ← 推荐
  理由:
    - 与Spring Boot无缝集成
    - 类型安全
    - 无需跨语言调用
```

### 3.4 通信协议

```yaml
主通道: WebSocket (双向实时通信)
  - AI思考过程流式输出
  - 虚拟桌面实时更新
  - 用户交互指令

辅助通道: Server-Sent Events (单向推送)
  - 任务进度更新
  - 系统通知
  - 状态变化
```

---

## 4. 系统架构设计

### 4.1 完整架构图

```
┌───────────────────────────────────────────────────────────────────┐
│                           Client Layer                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐        │
│  │   Vue 3 SPA    │  │   Mobile App   │  │   Desktop App  │        │
│  │  - Chat UI     │  │   (React Native)│  │   (Electron)   │        │
│  │  - Desktop View│  │                │  │                │        │
│  │  - Task Panel  │  │                │  │                │        │
│  └────────────────┘  └────────────────┘  └────────────────┘        │
└───────────────────────────────────────────────────────────────────┘
                              ↓ WebSocket/SSE
┌───────────────────────────────────────────────────────────────────┐
│                         API Gateway Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Nginx/LB    │  │  API Gateway │  │  Auth Service│             │
│  │              │  │  (Spring Cloud)│  │              │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└───────────────────────────────────────────────────────────────────┘
                              ↓ REST/WebSocket
┌───────────────────────────────────────────────────────────────────┐
│                      Application Layer                            │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                 Virtual Computer Service                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │ Sandbox  │  │ Session  │  │  Tool    │  │Snapshot  │    │  │
│  │  │ Manager  │  │ Manager  │  │ Executor │  │ Manager  │    │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  Multi-Agent System                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │  │
│  │  │   Planner    │  │   Executor   │  │   Monitor    │      │  │
│  │  │   Agent      │  │   Agent      │  │   Agent      │      │  │
│  │  │              │  │              │  │              │      │  │
│  │  │ - Task       │  │ - Tool       │  │ - State      │      │  │
│  │  │   Planning  │  │   Execution  │  │   Tracking   │      │  │
│  │  │ - Reasoning  │  │ - Error      │  │ - Recovery   │      │  │
│  │  │              │  │   Handling   │  │              │      │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                   Memory System                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │ Short-Term│  │ Long-Term│  │ Episodic │  │Semantic  │    │  │
│  │  │ Memory   │  │ Memory   │  │ Memory   │  │ Memory   │    │  │
│  │  │ (Redis)  │  │ (PG+Milvus)│ │ (PG)     │  │ (Graph)  │    │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
                              ↓ Docker API
┌───────────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                         │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                   Docker Sandbox Pool                        │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │  │
│  │  │Container│  │Container│  │Container│  │Container│  ...    │  │
│  │  │  Warm-1 │  │  Warm-2 │  │  Warm-3 │  │  Active │         │  │
│  │  │         │  │         │  │         │  │         │         │  │
│  │  │ • VNC    │  │ • VNC    │  │ • VNC    │  │ • VNC    │         │  │
│  │  │ • XFCE   │  │ • XFCE   │  │ • XFCE   │  │ • XFCE   │         │  │
│  │  │ • Chrome │  │ • Chrome │  │ • Chrome │  │ • Chrome │         │  │
│  │  │ • Python │  │ • Python │  │ • Python │  │ • Python │         │  │
│  │  │ • Node   │  │ • Node   │  │ • Node   │  │ • Node   │         │  │
│  │  │ • APIsrv │  │ • APIsrv │  │ • APIsrv │  │ • APIsrv │         │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              Storage & Message Queue                         │  │
│  │  • PostgreSQL (元数据、检查点)                               │  │
│  │  • Redis (会话状态、缓存)                                    │  │
│  │  • Milvus (向量存储、语义搜索)                               │  │
│  │  • RabbitMQ/Kafka (任务队列)                                 │  │
│  │  • MinIO/OSS (文件存储)                                      │  │
│  └─────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

### 4.2 数据流图

#### 任务执行数据流

```
┌─────────────┐
│ User Input  │
│ "搜索AI新闻  │
│  并分析"     │
└──────┬──────┘
       ↓
┌─────────────────────────────────────────────────┐
│  API Gateway                                    │
│  • 认证用户                                      │
│  • 创建任务ID                                    │
│  • 分配到Planner Agent                           │
└──────┬──────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────┐
│  Planner Agent                                  │
│  Input: 用户请求 + 工具列表 + 历史上下文          │
│  ↓                                               │
│  Process:                                       │
│  1. 理解意图 (LLM)                               │
│  2. 分解任务 (CoT)                               │
│  3. 选择工具 (Tool Selection)                    │
│  4. 制定计划 (Action Plan)                       │
│  ↓                                               │
│  Output: JSON执行计划                            │
│  {                                              │
│    "steps": [                                   │
│      {"tool": "browser_search", ...},           │
│      {"tool": "page_scrape", ...},              │
│      {"tool": "python_analyze", ...},           │
│      {"tool": "generate_report", ...}           │
│    ]                                            │
│  }                                              │
└──────┬──────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────┐
│  Executor Agent                                 │
│  For each step:                                 │
│  ┌───────────────────────────────────────┐      │
│  │ 1. 获取可用沙箱                        │      │
│  │    - 从池中获取或创建新的              │      │
│  │    - 检查沙箱健康状态                  │      │
│  │                                        │      │
│  │ 2. 调用工具执行                        │      │
│  │    - 构造工具调用参数                  │      │
│  │    - 通过沙箱API执行                  │      │
│  │    - 获取执行结果                      │      │
│  │                                        │      │
│  │ 3. 处理执行结果                        │      │
│  │    - 验证结果有效性                    │      │
│  │    - 提取关键信息                      │      │
│  │    - 更新上下文                        │      │
│  │                                        │      │
│  │ 4. 判断下一步                          │      │
│  │    - 成功 → 继续下一步                  │      │
│  │    - 失败 → 重试或调整策略              │      │
│  │    - 需要确认 → 暂停等待用户           │      │
│  │                                        │      │
│  │ 5. 实时流式输出                        │      │
│  │    - 通过WebSocket推送思考过程         │      │
│  │    - 更新任务进度                      │      │
│  │    - 发送虚拟桌面截图                  │      │
│  └───────────────────────────────────────┘      │
└──────┬──────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────┐
│  Monitor Agent                                  │
│  • 监控执行状态                                 │
│  • 检测异常和错误                               │
│  • 触发自动恢复                                 │
│  • 记录执行日志                                 │
└──────┬──────────────────────────────────────────┘
       ↓
┌─────────────────────────────────────────────────┐
│  Result Processing                              │
│  • 汇总所有步骤结果                              │
│  • 生成最终报告                                  │
│  • 保存到虚拟桌面                                │
│  • 通知用户                                      │
└─────────────────────────────────────────────────┘
```

---

## 5. 多智能体系统设计

### 5.1 智能体架构

```java
/**
 * 智能体基类
 */
public abstract class Agent {
    protected String id;
    protected String name;
    protected String role;
    protected LLMClient llmClient;

    /**
     * 执行智能体任务
     */
    public abstract AgentResult execute(AgentContext context);

    /**
     * 思考过程
     */
    protected Thought processThought(AgentContext context) {
        // 使用LLM生成思考过程
        String prompt = buildThoughtPrompt(context);
        String response = llmClient.complete(prompt);

        return Thought.parse(response);
    }
}

/**
 * 规划器智能体
 */
@Component
public class PlannerAgent extends Agent {

    @Override
    public AgentResult execute(AgentContext context) {
        log.info("Planner Agent 开始规划任务");

        // 1. 理解用户意图
        Thought thought = processThought(context);
        log.debug("Planner思考: {}", thought.getReasoning());

        // 2. 分析可用工具
        List<Tool> availableTools = toolRegistry.getAvailableTools();
        log.debug("可用工具: {}", availableTools.size());

        // 3. 分解任务
        ExecutionPlan plan = decomposeTask(
            context.getUserRequest(),
            availableTools,
            thought
        );

        // 4. 优化计划
        plan = optimizePlan(plan);

        // 5. 保存计划
        planRepository.save(plan);

        return AgentResult.builder()
            .plan(plan)
            .thought(thought)
            .build();
    }

    private ExecutionPlan decomposeTask(
        String request,
        List<Tool> tools,
        Thought thought
    ) {
        // 使用CoT (Chain of Thought) 分解任务
        String prompt = String.format("""
            你是一个任务规划专家。请分析用户请求并制定执行计划。

            用户请求: %s

            可用工具:
            %s

            思考过程:
            %s

            请输出JSON格式的执行计划:
            {
              "analysis": "任务分析",
              "steps": [
                {
                  "step": 1,
                  "tool": "工具名称",
                  "params": {"参数名": "参数值"},
                  "reasoning": "为什么要执行这一步",
                  "expected_result": "预期结果",
                  "next_step": 2
                }
              ],
              "estimated_time": "预计耗时(分钟)",
              "risks": ["潜在风险1", "潜在风险2"]
            }
            """,
            request,
            formatTools(tools),
            thought.getReasoning()
        );

        String response = llmClient.complete(prompt);
        return ExecutionPlan.fromJson(response);
    }
}

/**
 * 执行器智能体
 */
@Component
public class ExecutorAgent extends Agent {

    @Override
    public AgentResult execute(AgentContext context) {
        ExecutionPlan plan = context.getPlan();

        List<StepResult> stepResults = new ArrayList<>();

        // 执行每个步骤
        for (PlanStep step : plan.getSteps()) {
            log.info("执行步骤 {}: {}", step.getStep(), step.getTool());

            // 1. 检查是否暂停
            if (isPaused(context.getTaskId())) {
                waitForResume(context.getTaskId());
            }

            // 2. 思考当前步骤
            Thought stepThought = thinkAboutStep(step, context);

            // 3. 执行工具
            StepResult result = executeStep(step, context);

            // 4. 处理结果
            if (result.isSuccess()) {
                stepResults.add(result);
                context.addMemory(step, result);
            } else {
                // 执行失败,尝试恢复
                result = recoverFromFailure(step, result, context);
            }

            // 5. 流式输出
            streamProgress(step, result, context);

            // 6. 更新计划(可能需要调整后续步骤)
            if (result.requiresPlanAdjustment()) {
                plan = adjustPlan(plan, step, result, context);
            }
        }

        return AgentResult.builder()
            .stepResults(stepResults)
            .finalResult(generateFinalResult(stepResults))
            .build();
    }

    private StepResult executeStep(PlanStep step, AgentContext context) {
        // 1. 获取沙箱
        Sandbox sandbox = sandboxManager.acquire(context.getUserId());

        try {
            // 2. 调用工具
            Tool tool = toolRegistry.getTool(step.getTool());
            ToolResult toolResult = tool.execute(
                sandbox.getId(),
                step.getParams(),
                context
            );

            // 3. 处理工具结果
            return StepResult.builder()
                .step(step.getStep())
                .tool(step.getTool())
                .success(toolResult.isSuccess())
                .data(toolResult.getData())
                .screenshot(toolResult.getScreenshot())
                .build();

        } finally {
            // 4. 归还沙箱到池
            if (!context.requiresPersistentSandbox()) {
                sandboxManager.release(sandbox);
            }
        }
    }
}

/**
 * 监控器智能体
 */
@Component
public class MonitorAgent extends Agent {

    @Scheduled(fixedRate = 5000) // 每5秒检查一次
    public void monitor() {
        List<Task> activeTasks = taskRepository.findActiveTasks();

        for (Task task : activeTasks) {
            monitorTask(task);
        }
    }

    private void monitorTask(Task task) {
        // 1. 检查超时
        if (isTimeout(task)) {
            handleTimeout(task);
            return;
        }

        // 2. 检查沙箱健康
        if (!isSandboxHealthy(task.getSandboxId())) {
            handleUnhealthySandbox(task);
            return;
        }

        // 3. 检查错误率
        if (getErrorRate(task) > 0.5) {
            handleHighErrorRate(task);
            return;
        }

        // 4. 更新任务状态
        updateTaskStatus(task);
    }
}
```

### 5.2 智能体协作

```java
/**
 * 智能体协调器
 */
@Service
public class AgentOrchestrator {

    @Autowired
    private PlannerAgent plannerAgent;

    @Autowired
    private ExecutorAgent executorAgent;

    @Autowired
    private MonitorAgent monitorAgent;

    /**
     * 完整的任务执行流程
     */
    public TaskResult executeTask(String userId, String userRequest) {
        // 1. 创建任务上下文
        AgentContext context = createContext(userId, userRequest);

        // 2. Planner Agent 规划
        AgentResult planResult = plannerAgent.execute(context);
        ExecutionPlan plan = planResult.getPlan();

        // 流式输出规划结果
        streamPlan(userId, plan);

        // 3. 用户确认(可选)
        if (plan.requiresConfirmation()) {
            waitForConfirmation(userId, plan.getPlanId());
        }

        // 4. Executor Agent 执行
        AgentResult executeResult = executorAgent.execute(context);

        // 5. Monitor Agent 监控(异步)
        monitorAgent.startMonitoring(context.getTaskId());

        // 6. 返回最终结果
        return executeResult.getFinalResult();
    }

    /**
     * 智能体之间通信
     */
    public void agentCommunication(
        String fromAgent,
        String toAgent,
        Message message
    ) {
        // 1. 记录通信
        communicationLog.save(fromAgent, toAgent, message);

        // 2. 路由到目标智能体
        Agent targetAgent = agentRegistry.getAgent(toAgent);
        targetAgent.receiveMessage(message);

        // 3. 如果需要回复
        if (message.requiresReply()) {
            Message reply = targetAgent.generateReply(message);
            agentCommunication(toAgent, fromAgent, reply);
        }
    }
}
```

---

## 6. Computer Use 实现方案

### 6.1 OpenAI Computer Use API 仿照实现

基于 OpenAI 的 Computer Use 能力,实现类似功能:

```java
/**
 * Computer Use 服务
 */
@Service
public class ComputerUseService {

    /**
     * 计算机使用接口
     * 仿照 OpenAI 的 computer_use API
     */
    public ComputerUseResult useComputer(ComputerUseRequest request) {
        String action = request.getAction();
        Map<String, Object> params = request.getParameters();

        switch (action) {
            case "screenshot":
                return takeScreenshot(params);

            case "click":
                return clickElement(params);

            case "type":
                return typeText(params);

            case "scroll":
                return scrollPage(params);

            case "drag":
                return dragElement(params);

            case "wait":
                return waitForElement(params);

            case "goto":
                return gotoUrl(params);

            case "execute_code":
                return executeCode(params);

            default:
                throw new UnsupportedOperationException(
                    "Unknown action: " + action
                );
        }
    }

    /**
     * 点击元素
     */
    private ComputerUseResult clickElement(Map<String, Object> params) {
        String selector = (String) params.get("selector");
        String button = (String) params.getOrDefault("button", "left");

        // 通过 Puppeteer 控制
        String sandboxId = getSandboxId();
        String apiUrl = String.format(
            "http://localhost:%d/browser/click",
            getApiPort(sandboxId)
        );

        ClickRequest clickReq = ClickRequest.builder()
            .selector(selector)
            .button(button)
            .build();

        ApiResponse response = restTemplate.postForObject(
            apiUrl,
            clickReq,
            ApiResponse.class
        );

        return ComputerUseResult.builder()
            .success(response.getSuccess())
            .screenshot(response.getScreenshot())
            .build();
    }

    /**
     * 输入文本
     */
    private ComputerUseResult typeText(Map<String, Object> params) {
        String text = (String) params.get("text");
        String selector = (String) params.get("selector");

        String sandboxId = getSandboxId();
        String apiUrl = String.format(
            "http://localhost:%d/browser/type",
            getApiPort(sandboxId)
        );

        TypeRequest typeReq = TypeRequest.builder()
            .selector(selector)
            .text(text)
            .build();

        ApiResponse response = restTemplate.postForObject(
            apiUrl,
            typeReq,
            ApiResponse.class
        );

        return ComputerUseResult.builder()
            .success(response.getSuccess())
            .screenshot(response.getScreenshot())
            .build();
    }
}
```

### 6.2 视觉理解集成

```java
/**
 * 视觉理解服务
 * 使用多模态大模型理解屏幕内容
 */
@Service
public class VisionUnderstandingService {

    @Autowired
    private LLMClient llmClient;

    /**
     * 理解屏幕内容
     */
    public ScreenUnderstanding understandScreen(String screenshotBase64) {
        // 1. 构建提示词
        String prompt = """
            请分析这张屏幕截图,识别:
            1. 页面类型(搜索结果/文章/表单等)
            2. 主要元素(按钮、输入框、链接等)
            3. 可交互元素的位置
            4. 页面内容摘要

            请以JSON格式返回:
            {
              "page_type": "类型",
              "elements": [
                {
                  "type": "button|input|link|text",
                  "selector": "CSS选择器",
                  "text": "显示文本",
                  "position": {"x": 100, "y": 200},
                  "actionable": true
                }
              ],
              "summary": "页面摘要"
            }
            """;

        // 2. 调用多模态模型
        VisionRequest request = VisionRequest.builder()
            .image(screenshotBase64)
            .prompt(prompt)
            .build();

        VisionResponse response = llmClient.vision(request);

        // 3. 解析结果
        return ScreenUnderstanding.fromJson(response.getContent());
    }

    /**
     * 查找元素
     */
    public String findElement(
        String screenshotBase64,
        String elementType,
        String text
    ) {
        ScreenUnderstanding understanding = understandScreen(screenshotBase64);

        return understanding.getElements().stream()
            .filter(e -> e.getType().equals(elementType))
            .filter(e -> e.getText().contains(text))
            .findFirst()
            .map(ScreenElement::getSelector)
            .orElseThrow(() -> new ElementNotFoundException(
                elementType + " with text: " + text
            ));
    }
}
```

---

## 7. 工具系统设计

### 7.1 工具接口定义

```java
/**
 * 工具接口
 */
public interface Tool {

    /**
     * 工具名称(唯一标识)
     */
    String getName();

    /**
     * 工具显示名称
     */
    String getDisplayName();

    /**
     * 工具描述(用于AI理解)
     */
    String getDescription();

    /**
     * 工具类别
     */
    ToolCategory getCategory();

    /**
     * 参数定义
     */
    List<ToolParameter> getParameters();

    /**
     * 执行工具
     */
    ToolResult execute(String sandboxId, Map<String, Object> params);

    /**
     * 验证参数
     */
    default ValidationResult validateParams(Map<String, Object> params) {
        // 默认验证逻辑
        for (ToolParameter param : getParameters()) {
            Object value = params.get(param.getName());

            if (param.isRequired() && value == null) {
                return ValidationResult.invalid(
                    "Missing required parameter: " + param.getName()
                );
            }

            if (value != null && !param.getType().isInstance(value)) {
                return ValidationResult.invalid(
                    "Invalid type for parameter: " + param.getName()
                );
            }
        }

        return ValidationResult.valid();
    }
}

/**
 * 工具参数定义
 */
@Data
@Builder
public class ToolParameter {
    private String name;
    private String displayName;
    private String description;
    private Class<?> type;
    private boolean required;
    private Object defaultValue;
    private List<String> allowedValues; // 枚举值
}

/**
 * 工具执行结果
 */
@Data
@Builder
public class ToolResult {
    private boolean success;
    private Object data;
    private String screenshot; // base64编码
    private String error;
    private Map<String, Object> metadata;
}
```

### 7.2 27种工具实现清单

#### 浏览器工具 (10种)

```java
/**
 * 浏览器工具集
 */
@Component
public class BrowserTools {

    /**
     * 1. browser_goto - 访问URL
     */
    public static class BrowserGotoTool implements Tool {
        @Override
        public String getName() {
            return "browser_goto";
        }

        @Override
        public String getDescription() {
            return "在浏览器中打开指定的URL";
        }

        @Override
        public List<ToolParameter> getParameters() {
            return Arrays.asList(
                ToolParameter.builder()
                    .name("url")
                    .displayName("URL")
                    .description("要访问的网址")
                    .type(String.class)
                    .required(true)
                    .build()
            );
        }

        @Override
        public ToolResult execute(String sandboxId, Map<String, Object> params) {
            String url = (String) params.get("url");

            // 调用沙箱API
            String apiUrl = String.format(
                "http://localhost:%d/browser/goto",
                getApiPort(sandboxId)
            );

            GotoRequest request = GotoRequest.builder().url(url).build();
            GotoResponse response = restTemplate.postForObject(
                apiUrl,
                request,
                GotoResponse.class
            );

            return ToolResult.builder()
                .success(response.isSuccess())
                .data(response.getData())
                .screenshot(response.getScreenshot())
                .build();
        }
    }

    /**
     * 2. browser_click - 点击元素
     */
    public static class BrowserClickTool implements Tool {
        @Override
        public String getName() {
            return "browser_click";
        }

        @Override
        public String getDescription() {
            return "点击页面上的元素(按钮、链接等)";
        }

        @Override
        public List<ToolParameter> getParameters() {
            return Arrays.asList(
                ToolParameter.builder()
                    .name("selector")
                    .displayName("CSS选择器")
                    .description("元素的CSS选择器")
                    .type(String.class)
                    .required(true)
                    .build(),
                ToolParameter.builder()
                    .name("button")
                    .displayName("鼠标按键")
                    .description("left或right")
                    .type(String.class)
                    .required(false)
                    .defaultValue("left")
                    .build()
            );
        }

        @Override
        public ToolResult execute(String sandboxId, Map<String, Object> params) {
            // 实现点击逻辑
        }
    }

    /**
     * 3. browser_type - 输入文本
     */
    public static class BrowserTypeTool implements Tool {
        @Override
        public String getName() {
            return "browser_type";
        }

        @Override
        public String getDescription() {
            return "在输入框中输入文本";
        }

        @Override
        public List<ToolParameter> getParameters() {
            return Arrays.asList(
                ToolParameter.builder()
                    .name("selector")
                    .displayName("CSS选择器")
                    .description("输入框的CSS选择器")
                    .type(String.class)
                    .required(true)
                    .build(),
                ToolParameter.builder()
                    .name("text")
                    .displayName("文本")
                    .description("要输入的文本")
                    .type(String.class)
                    .required(true)
                    .build()
            );
        }

        @Override
        public ToolResult execute(String sandboxId, Map<String, Object> params) {
            // 实现输入逻辑
        }
    }

    /**
     * 4. browser_scroll - 滚动页面
     */
    /**
     * 5. browser_screenshot - 截取屏幕
     */
    /**
     * 6. browser_back - 后退
     */
    /**
     * 7. browser_forward - 前进
     */
    /**
     * 8. browser_refresh - 刷新
     */
    /**
     * 9. browser_search - 搜索
     */
    /**
     * 10. browser_extract - 提取内容
     */
}
```

#### 终端工具 (5种)

```java
/**
 * 终端工具集
 */
@Component
public class TerminalTools {

    /**
     * 1. terminal_exec - 执行命令
     */
    public static class TerminalExecTool implements Tool {
        @Override
        public String getName() {
            return "terminal_exec";
        }

        @Override
        public String getDescription() {
            return "在终端中执行shell命令";
        }

        @Override
        public List<ToolParameter> getParameters() {
            return Arrays.asList(
                ToolParameter.builder()
                    .name("command")
                    .displayName("命令")
                    .description("要执行的shell命令")
                    .type(String.class)
                    .required(true)
                    .build(),
                ToolParameter.builder()
                    .name("working_dir")
                    .displayName("工作目录")
                    .description("命令执行的目录")
                    .type(String.class)
                    .required(false)
                    .defaultValue("/workspace")
                    .build()
            );
        }

        @Override
        public ToolResult execute(String sandboxId, Map<String, Object> params) {
            String command = (String) params.get("command");
            String workingDir = (String) params.getOrDefault("working_dir", "/workspace");

            String apiUrl = String.format(
                "http://localhost:%d/terminal/exec",
                getApiPort(sandboxId)
            );

            ExecRequest request = ExecRequest.builder()
                .command(command)
                .workingDir(workingDir)
                .build();

            ExecResponse response = restTemplate.postForObject(
                apiUrl,
                request,
                ExecResponse.class
            );

            return ToolResult.builder()
                .success(response.getExitCode() == 0)
                .data(Map.of(
                    "stdout", response.getStdout(),
                    "stderr", response.getStderr(),
                    "exitCode", response.getExitCode()
                ))
                .build();
        }
    }

    /**
     * 2. terminal_write - 写入文件
     */
    /**
     * 3. terminal_read - 读取文件
     */
    /**
     * 4. terminal_cd - 切换目录
     */
    /**
     * 5. terminal_ls - 列出文件
     */
}
```

#### 文件系统工具 (4种)

```java
/**
 * 文件系统工具集
 */
@Component
public class FilesystemTools {

    /**
     * 1. file_create - 创建文件
     */
    /**
     * 2. file_delete - 删除文件
     */
    /**
     * 3. file_copy - 复制文件
     */
    /**
     * 4. file_move - 移动文件
     */
}
```

#### 代码执行工具 (3种)

```java
/**
 * 代码执行工具集
 */
@Component
public class CodeExecutionTools {

    /**
     * 1. python_run - 运行Python代码
     */
    public static class PythonRunTool implements Tool {
        @Override
        public String getName() {
            return "python_run";
        }

        @Override
        public String getDescription() {
            return "执行Python代码";
        }

        @Override
        public List<ToolParameter> getParameters() {
            return Arrays.asList(
                ToolParameter.builder()
                    .name("code")
                    .displayName("代码")
                    .description("要执行的Python代码")
                    .type(String.class)
                    .required(true)
                    .build()
            );
        }

        @Override
        public ToolResult execute(String sandboxId, Map<String, Object> params) {
            String code = (String) params.get("code");

            String apiUrl = String.format(
                "http://localhost:%d/code/python",
                getApiPort(sandboxId)
            );

            CodeRequest request = CodeRequest.builder()
                .code(code)
                .build();

            CodeResponse response = restTemplate.postForObject(
                apiUrl,
                request,
                CodeResponse.class
            );

            return ToolResult.builder()
                .success(response.isSuccess())
                .data(Map.of(
                    "output", response.getOutput(),
                    "error", response.getError()
                ))
                .build();
        }
    }

    /**
     * 2. node_run - 运行Node.js代码
     */
    /**
     * 3. bash_run - 运行Bash脚本
     */
}
```

#### 系统工具 (5种)

```java
/**
 * 系统工具集
 */
@Component
public class SystemTools {

    /**
     * 1. system_info - 获取系统信息
     */
    /**
     * 2. system_snapshot - 创建快照
     */
    /**
     * 3. system_restore - 恢复快照
     */
    /**
     * 4. system_wait - 等待(延迟)
     */
    /**
     * 5. system_log - 查看日志
     */
}
```

---

## 8. 记忆与上下文管理

### 8.1 记忆系统架构

```java
/**
 * 记忆系统服务
 */
@Service
public class MemorySystemService {

    @Autowired
    private ShortTermMemoryService shortTermMemory;

    @Autowired
    private LongTermMemoryService longTermMemory;

    @Autowired
    private EpisodicMemoryService episodicMemory;

    @Autowired
    private SemanticMemoryService semanticMemory;

    /**
     * 存储记忆
     */
    public void storeMemory(Memory memory) {
        switch (memory.getType()) {
            case SHORT_TERM:
                shortTermMemory.store(memory);
                break;
            case LONG_TERM:
                longTermMemory.store(memory);
                break;
            case EPISODIC:
                episodicMemory.store(memory);
                break;
            case SEMANTIC:
                semanticMemory.store(memory);
                break;
        }
    }

    /**
     * 检索相关记忆
     */
    public List<Memory> retrieveMemories(String query, MemoryType type, int limit) {
        switch (type) {
            case SHORT_TERM:
                return shortTermMemory.retrieve(query, limit);
            case LONG_TERM:
                return longTermMemory.retrieve(query, limit);
            case EPISODIC:
                return episodicMemory.retrieve(query, limit);
            case SEMANTIC:
                return semanticMemory.retrieve(query, limit);
            default:
                return Collections.emptyList();
        }
    }
}

/**
 * 短期记忆服务 (Redis)
 */
@Service
public class ShortTermMemoryService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String PREFIX = "memory:short:";
    private static final Duration TTL = Duration.ofHours(1);

    public void store(Memory memory) {
        String key = PREFIX + memory.getId();
        redisTemplate.opsForValue().set(key, memory, TTL);
    }

    public List<Memory> retrieve(String query, int limit) {
        // 使用Redis Search进行全文搜索
        return redisTemplate.keys(PREFIX + "*").stream()
            .limit(limit)
            .map(key -> (Memory) redisTemplate.opsForValue().get(key))
            .filter(memory -> memory.getContent().contains(query))
            .collect(Collectors.toList());
    }
}

/**
 * 长期记忆服务 (PostgreSQL + Milvus)
 */
@Service
public class LongTermMemoryService {

    @Autowired
    private MemoryRepository memoryRepository;

    @Autowired
    private VectorSearchService vectorSearchService;

    public void store(Memory memory) {
        // 1. 保存到PostgreSQL
        memoryRepository.save(memory);

        // 2. 生成向量并保存到Milvus
        float[] embedding = embeddingService.embed(memory.getContent());
        vectorSearchService.insert(memory.getId(), embedding);
    }

    public List<Memory> retrieve(String query, int limit) {
        // 1. 将查询转换为向量
        float[] queryEmbedding = embeddingService.embed(query);

        // 2. 向量搜索
        List<String> memoryIds = vectorSearchService.search(queryEmbedding, limit);

        // 3. 从数据库加载完整记忆
        return memoryRepository.findAllById(memoryIds);
    }
}

/**
 * 情景记忆服务 (PostgreSQL)
 */
@Service
public class EpisodicMemoryService {

    /**
     * 存储情景记忆(具体事件)
     */
    public void store(Memory memory) {
        Episode episode = Episode.builder()
            .taskId(memory.getTaskId())
            .timestamp(Instant.now())
            .content(memory.getContent())
            .context(memory.getContext())
            .emotionalWeight(memory.getEmotionalWeight())
            .build();

        episodeRepository.save(episode);
    }

    /**
     * 检索情景记忆
     */
    public List<Memory> retrieve(String query, int limit) {
        // 按时间顺序检索相关情景
        return episodeRepository.findByContentContaining(query)
            .stream()
            .limit(limit)
            .map(this::toMemory)
            .collect(Collectors.toList());
    }
}

/**
 * 语义记忆服务 (知识图谱)
 */
@Service
public class SemanticMemoryService {

    /**
     * 存储语义记忆(知识)
     */
    public void store(Memory memory) {
        // 1. 提取实体和关系
        List<Entity> entities = entityExtractor.extract(memory.getContent());
        List<Relation> relations = relationExtractor.extract(memory.getContent());

        // 2. 保存到知识图谱
        knowledgeGraph.addEntities(entities);
        knowledgeGraph.addRelations(relations);
    }

    /**
     * 检索语义记忆
     */
    public List<Memory> retrieve(String query, int limit) {
        // 1. 从查询中提取实体
        List<Entity> queryEntities = entityExtractor.extract(query);

        // 2. 在知识图谱中查找相关实体
        List<Entity> relatedEntities = knowledgeGraph.findRelated(queryEntities, 2);

        // 3. 获取相关记忆
        return relatedEntities.stream()
            .flatMap(entity -> memoryRepository.findByEntity(entity).stream())
            .distinct()
            .limit(limit)
            .collect(Collectors.toList());
    }
}
```

### 8.2 上下文管理

```java
/**
 * 上下文管理器
 */
@Component
public class ContextManager {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    /**
     * 更新上下文
     */
    public void updateContext(String taskId, String key, Object value) {
        String contextKey = "context:" + taskId;
        redisTemplate.opsForHash().put(contextKey, key, value);
        redisTemplate.expire(contextKey, Duration.ofDays(1));
    }

    /**
     * 获取完整上下文
     */
    public Map<String, Object> getContext(String taskId) {
        String contextKey = "context:" + taskId;
        return redisTemplate.opsForHash().entries(contextKey);
    }

    /**
     * 构建LLM提示词上下文
     */
    public String buildPromptContext(String taskId) {
        Map<String, Object> context = getContext(taskId);

        StringBuilder sb = new StringBuilder();

        // 1. 任务历史
        List<TaskStep> steps = (List<TaskStep>) context.get("steps");
        if (steps != null) {
            sb.append("## 任务执行历史\n\n");
            for (TaskStep step : steps) {
                sb.append(String.format(
                    "步骤%d: %s → %s\n",
                    step.getStep(),
                    step.getTool(),
                    step.getResult()
                ));
            }
            sb.append("\n");
        }

        // 2. 当前状态
        String currentState = (String) context.get("current_state");
        if (currentState != null) {
            sb.append("## 当前状态\n\n");
            sb.append(currentState).append("\n\n");
        }

        // 3. 相关记忆
        List<Memory> memories = memoryService.retrieveMemories(
            (String) context.get("user_request"),
            MemoryType.SHORT_TERM,
            5
        );
        if (!memories.isEmpty()) {
            sb.append("## 相关记忆\n\n");
            for (Memory memory : memories) {
                sb.append("- ").append(memory.getContent()).append("\n");
            }
            sb.append("\n");
        }

        // 4. 可用工具
        List<Tool> tools = toolRegistry.getAvailableTools();
        sb.append("## 可用工具\n\n");
        for (Tool tool : tools) {
            sb.append(String.format(
                "- %s: %s\n",
                tool.getName(),
                tool.getDescription()
            ));
        }

        return sb.toString();
    }
}
```

---

## 9. 任务执行引擎

### 9.1 任务定义

```java
/**
 * 任务实体
 */
@Data
@Entity
@Table(name = "vc_tasks")
public class Task {
    @Id
    private String id;

    private String userId;
    private String userRequest;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    private ExecutionPlan plan;

    @OneToMany(mappedBy = "task")
    private List<TaskStep> steps;

    @Lob
    private String finalResult;

    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    private Integer progress; // 0-100
}

/**
 * 任务步骤
 */
@Data
@Entity
@Table(name = "vc_task_steps")
public class TaskStep {
    @Id
    private String id;

    @ManyToOne
    private Task task;

    private Integer stepNumber;
    private String toolName;
    private String parameters; // JSON

    @Enumerated(EnumType.STRING)
    private StepStatus status;

    private String result;
    private String screenshot; // base64

    private LocalDateTime executedAt;
    private Long duration; // 毫秒
}

/**
 * 任务状态枚举
 */
public enum TaskStatus {
    PENDING,        // 待执行
    PLANNING,       // 规划中
    RUNNING,        // 执行中
    PAUSED,         // 已暂停
    COMPLETED,      // 已完成
    FAILED,         // 失败
    CANCELLED        // 已取消
}

/**
 * 步骤状态枚举
 */
public enum StepStatus {
    PENDING,
    RUNNING,
    COMPLETED,
    FAILED,
    SKIPPED
}
```

### 9.2 任务执行引擎

```java
/**
 * 任务执行引擎
 */
@Service
public class TaskExecutionEngine {

    @Autowired
    private AgentOrchestrator agentOrchestrator;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private WebSocketMessageBroker messagingTemplate;

    private final ExecutorService executorService =
        Executors.newFixedThreadPool(10);

    /**
     * 异步执行任务
     */
    public void executeTaskAsync(String taskId) {
        executorService.submit(() -> {
            try {
                executeTask(taskId);
            } catch (Exception e) {
                log.error("任务执行失败: taskId={}", taskId, e);
                handleTaskFailure(taskId, e);
            }
        });
    }

    /**
     * 同步执行任务
     */
    public void executeTask(String taskId) {
        // 1. 加载任务
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new TaskNotFoundException(taskId));

        // 2. 更新状态
        task.setStatus(TaskStatus.RUNNING);
        task.setStartedAt(LocalDateTime.now());
        taskRepository.save(task);

        // 3. 通知前端
        notifyTaskUpdate(task);

        // 4. 使用智能体编排器执行
        TaskResult result = agentOrchestrator.executeTask(
            task.getUserId(),
            task.getUserRequest()
        );

        // 5. 保存结果
        task.setFinalResult(result.getOutput());
        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());
        task.setProgress(100);
        taskRepository.save(task);

        // 6. 通知前端
        notifyTaskUpdate(task);
    }

    /**
     * 暂停任务
     */
    public void pauseTask(String taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new TaskNotFoundException(taskId));

        task.setStatus(TaskStatus.PAUSED);
        taskRepository.save(task);

        // 设置暂停标志
        redisTemplate.opsForValue().set(
            "task:paused:" + taskId,
            "true",
            Duration.ofDays(1)
        );

        notifyTaskUpdate(task);
    }

    /**
     * 恢复任务
     */
    public void resumeTask(String taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new TaskNotFoundException(taskId));

        task.setStatus(TaskStatus.RUNNING);
        taskRepository.save(task);

        // 清除暂停标志
        redisTemplate.delete("task:paused:" + taskId);

        notifyTaskUpdate(task);

        // 继续执行
        executeTaskAsync(taskId);
    }

    /**
     * 取消任务
     */
    public void cancelTask(String taskId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new TaskNotFoundException(taskId));

        task.setStatus(TaskStatus.CANCELLED);
        taskRepository.save(task);

        // 销毁相关沙箱
        sandboxManager.destroySandbox(task.getSandboxId());

        notifyTaskUpdate(task);
    }

    /**
     * 通知前端任务更新
     */
    private void notifyTaskUpdate(Task task) {
        messagingTemplate.convertAndSendToUser(
            task.getUserId(),
            "/queue/task-updates",
            TaskUpdateDTO.builder()
                .taskId(task.getId())
                .status(task.getStatus())
                .progress(task.getProgress())
                .result(task.getFinalResult())
                .timestamp(System.currentTimeMillis())
                .build()
        );
    }
}
```

---

## 10. 前端界面设计

### 10.1 页面布局

```vue
<!-- VirtualComputer.vue -->
<template>
  <div class="virtual-computer-container">
    <!-- 顶部栏 -->
    <div class="header">
      <h1>HeartSphere 虚拟电脑</h1>
      <div class="controls">
        <button @click="newComputer">新建</button>
        <button @click="pause" :disabled="!canPause">暂停</button>
        <button @click="resume" :disabled="!canResume">恢复</button>
        <button @click="stop" :disabled="!canStop">停止</button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧: 虚拟桌面 -->
      <div class="desktop-view">
        <VNCViewer
          :url="vncUrl"
          @connected="onVNCConnected"
          @disconnected="onVNCDisconnected"
        />
      </div>

      <!-- 右侧: 聊天和任务 -->
      <div class="side-panel">
        <!-- 聊天界面 -->
        <div class="chat-panel">
          <div class="messages" ref="messagesContainer">
            <div
              v-for="message in messages"
              :key="message.id"
              :class="['message', message.role]"
            >
              <div class="message-content">
                {{ message.content }}
              </div>
              <div class="message-time">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <div class="input-area">
            <textarea
              v-model="inputMessage"
              @keydown.enter.exact="sendMessage"
              placeholder="输入指令..."
              rows="3"
            ></textarea>
            <button @click="sendMessage" :disabled="!canSend">
              发送
            </button>
          </div>
        </div>

        <!-- 任务进度 -->
        <div class="task-panel">
          <h3>当前任务</h3>
          <div v-if="currentTask">
            <div class="task-info">
              <div class="task-status">
                状态: {{ formatStatus(currentTask.status) }}
              </div>
              <div class="task-progress">
                <progress :value="currentTask.progress" max="100"></progress>
                {{ currentTask.progress }}%
              </div>
            </div>

            <div class="task-steps">
              <h4>执行步骤</h4>
              <div
                v-for="(step, index) in currentTask.steps"
                :key="index"
                :class="['step', step.status]"
              >
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-content">
                  <div class="step-tool">{{ step.toolName }}</div>
                  <div class="step-result">{{ step.result }}</div>
                </div>
                <div class="step-status">
                  {{ formatStepStatus(step.status) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useWebSocket } from '@/composables/useWebSocket';
import { useVirtualComputer } from '@/composables/useVirtualComputer';

const {
  createComputer,
  pauseComputer,
  resumeComputer,
  stopComputer
} = useVirtualComputer();

const {
  connect,
  disconnect,
  send,
  onMessage
} = useWebSocket();

const messages = ref([]);
const inputMessage = ref('');
const currentTask = ref(null);
const vncUrl = ref('');

onMounted(async () => {
  // 创建虚拟电脑
  const computer = await createComputer();
  vncUrl.value = computer.noVncUrl;

  // 连接WebSocket
  connect(`/ws/sandbox/${computer.id}`);

  // 监听消息
  onMessage((message) => {
    if (message.type === 'agent_thought') {
      // AI思考过程
      messages.value.push({
        id: Date.now(),
        role: 'assistant',
        content: `💭 ${message.data.reasoning}`,
        timestamp: message.timestamp
      });
    } else if (message.type === 'step_progress') {
      // 步骤进度
      currentTask.value = message.data;
    } else if (message.type === 'step_completed') {
      // 步骤完成
      messages.value.push({
        id: Date.now(),
        role: 'assistant',
        content: `✅ ${message.data.tool}: ${message.data.result}`,
        timestamp: message.timestamp
      });
    } else if (message.type === 'screenshot') {
      // 更新虚拟桌面
      // VNC会自动更新
    }
  });
});

const sendMessage = () => {
  if (!inputMessage.value.trim()) return;

  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: inputMessage.value,
    timestamp: Date.now()
  });

  // 发送到后端
  send({
    type: 'user_request',
    data: {
      message: inputMessage.value
    }
  });

  inputMessage.value = '';
};

const canSend = computed(() => {
  return inputMessage.value.trim() && currentTask.value?.status !== 'running';
});

const canPause = computed(() => {
  return currentTask.value?.status === 'running';
});

const canResume = computed(() => {
  return currentTask.value?.status === 'paused';
});

const canStop = computed(() => {
  return ['running', 'paused'].includes(currentTask.value?.status);
});
</script>

<style scoped>
.virtual-computer-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.desktop-view {
  flex: 2;
  background: #000;
}

.side-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #ddd;
}

.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #ddd;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  margin-bottom: 1rem;
}

.message.user {
  text-align: right;
}

.message.assistant {
  text-align: left;
}

.message-content {
  display: inline-block;
  max-width: 80%;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.message.user .message-content {
  background: #007bff;
  color: white;
}

.message.assistant .message-content {
  background: #f0f0f0;
  color: #333;
}

.input-area {
  display: flex;
  padding: 1rem;
  gap: 0.5rem;
}

.input-area textarea {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
}

.task-panel {
  padding: 1rem;
  overflow-y: auto;
}

.step {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.step.pending {
  opacity: 0.5;
}

.step.running {
  background: #e3f2fd;
}

.step.completed {
  background: #e8f5e9;
}

.step.failed {
  background: #ffebee;
}
</style>
```

### 10.2 WebSocket 客户端

```typescript
// composables/useWebSocket.ts
export function useWebSocket() {
  let ws: WebSocket | null = null;
  const messageHandlers = new Map<string, Function[]>();

  const connect = (url: string) => {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const handlers = messageHandlers.get(message.type) || [];
      handlers.forEach(handler => handler(message));
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // 尝试重连
      setTimeout(() => connect(url), 5000);
    };
  };

  const disconnect = () => {
    if (ws) {
      ws.close();
      ws = null;
    }
  };

  const send = (data: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  };

  const onMessage = (type: string, handler: Function) => {
    if (!messageHandlers.has(type)) {
      messageHandlers.set(type, []);
    }
    messageHandlers.get(type)!.push(handler);
  };

  return {
    connect,
    disconnect,
    send,
    onMessage
  };
}
```

---

## 11. 完整实施指南

### 11.1 Phase 1: 基础设施 (2周)

#### Week 1: Docker镜像
```bash
# 项目结构
docker/
├── base/
│   ├── Dockerfile
│   ├── start.sh
│   └── requirements.txt
├── api/
│   ├── server.py
│   └── tools/
│       ├── browser.py
│       ├── terminal.py
│       └── code.py
└── compose/
    └── docker-compose.yml

# 构建镜像
cd docker/base
docker build -t heartsphere/virtual-computer:v1 .

# 测试镜像
docker run -p 6080:6080 heartsphere/virtual-computer:v1
```

#### Week 2: Spring Boot后端骨架
```java
// 项目结构
src/main/java/com/heartsphere/virtualcomputer/
├── VirtualComputerApplication.java
├── config/
│   ├── DockerConfig.java
│   ├── WebSocketConfig.java
│   └── RedisConfig.java
├── controller/
│   ├── SandboxController.java
│   └── TaskController.java
├── service/
│   ├── SandboxManager.java
│   ├── TaskExecutionEngine.java
│   └── AgentOrchestrator.java
└── dto/
    ├── CreateSandboxRequest.java
    └── TaskExecutionRequest.java
```

### 11.2 Phase 2: 核心功能 (4周)

#### Week 3-4: 沙箱管理
- [ ] Docker客户端集成
- [ ] 沙箱生命周期管理
- [ ] 沙箱池实现
- [ ] VNC集成

#### Week 5-6: 智能体系统
- [ ] Planner Agent实现
- [ ] Executor Agent实现
- [ ] Monitor Agent实现
- [ ] 智能体协作机制

### 11.3 Phase 3: 工具开发 (4周)

#### Week 7-8: 浏览器工具
- [ ] browser_goto
- [ ] browser_click
- [ ] browser_type
- [ ] browser_screenshot
- [ ] browser_scroll

#### Week 9-10: 其他工具
- [ ] 终端工具(5种)
- [ ] 文件系统工具(4种)
- [ ] 代码执行工具(3种)
- [ ] 系统工具(5种)

### 11.4 Phase 4: 前端和集成 (4周)

#### Week 11-12: Vue前端
- [ ] 虚拟桌面显示
- [ ] 聊天界面
- [ ] 任务进度显示
- [ ] WebSocket集成

#### Week 13-14: 集成测试
- [ ] 端到端测试
- [ ] 性能测试
- [ ] 安全测试

---

## 12. 代码示例

### 12.1 完整的工具实现示例

```java
/**
 * 浏览器访问工具完整实现
 */
@Component
@Slf4j
public class BrowserGotoTool implements Tool {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private SandboxRepository sandboxRepository;

    @Override
    public String getName() {
        return "browser_goto";
    }

    @Override
    public String getDisplayName() {
        return "访问网页";
    }

    @Override
    public String getDescription() {
        return "在浏览器中打开指定的URL,等待页面加载完成并返回页面信息";
    }

    @Override
    public ToolCategory getCategory() {
        return ToolCategory.BROWSER;
    }

    @Override
    public List<ToolParameter> getParameters() {
        return Arrays.asList(
            ToolParameter.builder()
                .name("url")
                .displayName("网址")
                .description("要访问的完整URL,例如: https://www.google.com")
                .type(String.class)
                .required(true)
                .build(),
            ToolParameter.builder()
                .name("wait_for_selector")
                .displayName("等待元素")
                .description("等待指定的CSS选择器元素出现")
                .type(String.class)
                .required(false)
                .build(),
            ToolParameter.builder()
                .name("timeout")
                .displayName("超时时间")
                .description("页面加载超时时间(秒)")
                .type(Integer.class)
                .required(false)
                .defaultValue(30)
                .build()
        );
    }

    @Override
    public ToolResult execute(String sandboxId, Map<String, Object> params) {
        log.info("执行 browser_goto: sandboxId={}, params={}", sandboxId, params);

        // 1. 验证参数
        ValidationResult validation = validateParams(params);
        if (!validation.isValid()) {
            return ToolResult.builder()
                .success(false)
                .error(validation.getError())
                .build();
        }

        String url = (String) params.get("url");
        String waitForSelector = (String) params.get("wait_for_selector");
        Integer timeout = (Integer) params.getOrDefault("timeout", 30);

        // 2. 获取沙箱信息
        Sandbox sandbox = sandboxRepository.findById(sandboxId)
            .orElseThrow(() -> new SandboxNotFoundException(sandboxId));

        // 3. 调用沙箱API
        try {
            String apiUrl = String.format(
                "http://localhost:%d/browser/goto",
                sandbox.getApiPort()
            );

            BrowserGotoRequest request = BrowserGotoRequest.builder()
                .url(url)
                .waitForSelector(waitForSelector)
                .timeout(timeout)
                .build();

            BrowserGotoResponse response = restTemplate.postForObject(
                apiUrl,
                request,
                BrowserGotoResponse.class
            );

            // 4. 返回结果
            return ToolResult.builder()
                .success(response.isSuccess())
                .data(Map.of(
                    "title", response.getTitle(),
                    "url", response.getActualUrl(),
                    "loadTime", response.getLoadTime()
                ))
                .screenshot(response.getScreenshot())
                .metadata(Map.of(
                    "timestamp", System.currentTimeMillis(),
                    "sandboxId", sandboxId
                ))
                .build();

        } catch (Exception e) {
            log.error("browser_goto 执行失败", e);
            return ToolResult.builder()
                .success(false)
                .error("执行失败: " + e.getMessage())
                .build();
        }
    }
}
```

### 12.2 完整的智能体实现示例

```java
/**
 * 规划器智能体完整实现
 */
@Component
@Slf4j
public class PlannerAgent extends Agent {

    @Autowired
    private QwenLLMClient llmClient;

    @Autowired
    private ToolRegistry toolRegistry;

    @Autowired
    private MemorySystemService memorySystem;

    @Value("${agent.planner.model:qwen-plus}")
    private String model;

    @Value("${agent.planner.max-tokens:2000}")
    private Integer maxTokens;

    @Override
    public AgentResult execute(AgentContext context) {
        log.info("Planner Agent 开始执行: taskId={}", context.getTaskId());

        // 1. 构建规划提示词
        String prompt = buildPlanningPrompt(context);

        // 2. 调用LLM生成计划
        LLMRequest llmRequest = LLMRequest.builder()
            .model(model)
            .messages(Arrays.asList(
                ChatMessage.system("你是一个专业的任务规划专家..."),
                ChatMessage.user(prompt)
            ))
            .maxTokens(maxTokens)
            .temperature(0.7)
            .build();

        LLMResponse llmResponse = llmClient.chat(llmRequest);

        // 3. 解析计划
        String planJson = extractJson(llmResponse.getContent());
        ExecutionPlan plan = ExecutionPlan.fromJson(planJson);

        // 4. 验证计划
        validatePlan(plan);

        // 5. 优化计划
        plan = optimizePlan(plan, context);

        // 6. 保存计划
        context.setPlan(plan);
        planRepository.save(plan);

        // 7. 记录思考过程
        Thought thought = Thought.builder()
            .agentId(getId())
            .taskId(context.getTaskId())
            .reasoning(llmResponse.getContent())
            .timestamp(Instant.now())
            .build();
        memorySystem.storeMemory(Memory.fromThought(thought));

        log.info("Planner Agent 完成: steps={}", plan.getSteps().size());

        return AgentResult.builder()
            .plan(plan)
            .thought(thought)
            .build();
    }

    private String buildPlanningPrompt(AgentContext context) {
        // 获取可用工具
        List<Tool> tools = toolRegistry.getAvailableTools();
        String toolsDesc = tools.stream()
            .map(tool -> String.format(
                "- %s: %s\n  参数: %s",
                tool.getName(),
                tool.getDescription(),
                formatParameters(tool.getParameters())
            ))
            .collect(Collectors.joining("\n"));

        // 获取相关记忆
        List<Memory> relevantMemories = memorySystem.retrieveMemories(
            context.getUserRequest(),
            MemoryType.LONG_TERM,
            5
        );

        String memoriesDesc = relevantMemories.isEmpty()
            ? "无相关历史记忆"
            : relevantMemories.stream()
                .map(Memory::getContent)
                .collect(Collectors.joining("\n"));

        // 构建提示词
        return String.format("""
            # 任务规划

            请分析用户请求并制定详细的执行计划。

            ## 用户请求
            %s

            ## 可用工具
            %s

            ## 相关记忆
            %s

            ## 任务要求
            1. 理解用户真实意图
            2. 识别所需工具和执行顺序
            3. 预估每步的预期结果
            4. 识别潜在风险
            5. 估算总耗时

            ## 输出格式
            请以JSON格式输出执行计划:
            {
              "analysis": "任务分析",
              "steps": [
                {
                  "step": 1,
                  "tool": "工具名称",
                  "params": {"参数名": "参数值"},
                  "reasoning": "执行这一步的原因",
                  "expected_result": "预期结果",
                  "next_step": 2
                }
              ],
              "estimated_time": "预计耗时(分钟)",
              "risks": ["风险1", "风险2"],
              "requires_confirmation": false
            }
            """,
            context.getUserRequest(),
            toolsDesc,
            memoriesDesc
        );
    }

    private String extractJson(String content) {
        // 从LLM输出中提取JSON
        Pattern pattern = Pattern.compile("```json\\s*([\\s\\S]*?)\\s*```");
        Matcher matcher = pattern.matcher(content);

        if (matcher.find()) {
            return matcher.group(1);
        }

        // 如果没有代码块,尝试直接解析
        return content.trim();
    }

    private void validatePlan(ExecutionPlan plan) {
        if (plan.getSteps() == null || plan.getSteps().isEmpty()) {
            throw new InvalidPlanException("计划必须包含至少一个步骤");
        }

        for (PlanStep step : plan.getSteps()) {
            // 验证工具存在
            if (!toolRegistry.hasTool(step.getTool())) {
                throw new InvalidPlanException(
                    "工具不存在: " + step.getTool()
                );
            }

            // 验证参数
            Tool tool = toolRegistry.getTool(step.getTool());
            ValidationResult validation = tool.validateParams(step.getParams());
            if (!validation.isValid()) {
                throw new InvalidPlanException(
                    "步骤" + step.getStep() + "参数错误: " + validation.getError()
                );
            }
        }
    }

    private ExecutionPlan optimizePlan(ExecutionPlan plan, AgentContext context) {
        // 优化策略1: 合并相似步骤
        plan = mergeSimilarSteps(plan);

        // 优化策略2: 并行化独立步骤
        plan = parallelizeIndependentSteps(plan);

        // 优化策略3: 添加缓存利用
        plan = addCacheUtilization(plan, context);

        return plan;
    }

    private ExecutionPlan mergeSimilarSteps(ExecutionPlan plan) {
        List<PlanStep> optimizedSteps = new ArrayList<>();
        PlanStep lastStep = null;

        for (PlanStep step : plan.getSteps()) {
            if (lastStep != null &&
                lastStep.getTool().equals(step.getTool()) &&
                canMergeSteps(lastStep, step)) {

                // 合并步骤
                lastStep = mergeSteps(lastStep, step);
            } else {
                if (lastStep != null) {
                    optimizedSteps.add(lastStep);
                }
                lastStep = step;
            }
        }

        if (lastStep != null) {
            optimizedSteps.add(lastStep);
        }

        plan.setSteps(optimizedSteps);
        return plan;
    }

    private ExecutionPlan parallelizeIndependentSteps(ExecutionPlan plan) {
        // 识别可以并行执行的步骤
        // 例如: 多个独立的浏览器访问
        return plan;
    }

    private ExecutionPlan addCacheUtilization(ExecutionPlan plan, AgentContext context) {
        // 检查是否有缓存结果可以利用
        // 例如: 搜索相同的关键词
        return plan;
    }

    private String formatParameters(List<ToolParameter> parameters) {
        return parameters.stream()
            .map(p -> String.format(
                "%s (%s): %s%s",
                p.getName(),
                p.getType().getSimpleName(),
                p.isRequired() ? "必需" : "可选",
                p.getDefaultValue() != null ? ", 默认: " + p.getDefaultValue() : ""
            ))
            .collect(Collectors.joining(", "));
    }
}
```

### 12.3 沙箱API完整实现

```python
# sandbox-api/server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import base64
import json
from typing import Optional, Dict, Any

app = FastAPI(title="HeartSphere Sandbox API")

class BrowserGotoRequest(BaseModel):
    url: str
    wait_for_selector: Optional[str] = None
    timeout: int = 30

class BrowserGotoResponse(BaseModel):
    success: bool
    title: Optional[str] = None
    actual_url: Optional[str] = None
    load_time: Optional[int] = None
    screenshot: Optional[str] = None
    error: Optional[str] = None

@app.post("/browser/goto", response_model=BrowserGotoResponse)
async def browser_goto(request: BrowserGotoRequest):
    """
    在浏览器中访问指定URL
    """
    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        import time

        # 1. 启动浏览器
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')

        driver = webdriver.Chrome(options=options)

        start_time = time.time()

        # 2. 访问URL
        driver.get(request.url)

        # 3. 等待页面加载
        if request.wait_for_selector:
            WebDriverWait(driver, request.timeout).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, request.wait_for_selector)
                )
            )
        else:
            # 等待body元素
            WebDriverWait(driver, request.timeout).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )

        load_time = int((time.time() - start_time) * 1000)

        # 4. 获取页面信息
        title = driver.title
        actual_url = driver.current_url

        # 5. 截图
        screenshot = driver.get_screenshot_as_base64()

        # 6. 关闭浏览器
        driver.quit()

        return BrowserGotoResponse(
            success=True,
            title=title,
            actual_url=actual_url,
            load_time=load_time,
            screenshot=screenshot
        )

    except Exception as e:
        return BrowserGotoResponse(
            success=False,
            error=str(e)
        )

class TerminalExecRequest(BaseModel):
    command: str
    working_dir: str = "/workspace"

class TerminalExecResponse(BaseModel):
    success: bool
    stdout: str
    stderr: str
    exit_code: int

@app.post("/terminal/exec", response_model=TerminalExecResponse)
async def terminal_exec(request: TerminalExecRequest):
    """
    执行终端命令
    """
    try:
        result = subprocess.run(
            request.command,
            shell=True,
            cwd=request.working_dir,
            capture_output=True,
            text=True,
            timeout=30
        )

        return TerminalExecResponse(
            success=result.returncode == 0,
            stdout=result.stdout,
            stderr=result.stderr,
            exit_code=result.returncode
        )

    except subprocess.TimeoutExpired:
        return TerminalExecResponse(
            success=False,
            stdout="",
            stderr="Command timed out",
            exit_code=-1
        )
    except Exception as e:
        return TerminalExecResponse(
            success=False,
            stdout="",
            stderr=str(e),
            exit_code=-1
        )

class PythonRunRequest(BaseModel):
    code: str

class PythonRunResponse(BaseModel):
    success: bool
    output: str
    error: str

@app.post("/code/python", response_model=PythonRunResponse)
async def python_run(request: PythonRunRequest):
    """
    执行Python代码
    """
    try:
        result = subprocess.run(
            ["python3", "-c", request.code],
            capture_output=True,
            text=True,
            timeout=60
        )

        return PythonRunResponse(
            success=result.returncode == 0,
            output=result.stdout,
            error=result.stderr
        )

    except subprocess.TimeoutExpired:
        return PythonRunResponse(
            success=False,
            output="",
            error="Code execution timed out"
        )
    except Exception as e:
        return PythonRunResponse(
            success=False,
            output="",
            error=str(e)
        )

@app.get("/health")
async def health():
    """
    健康检查
    """
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)
```

---

## 附录

### A. 配置文件示例

```yaml
# application.yml
virtual-computer:
  # Docker配置
  docker:
    api-version: "1.41"
    image: "heartsphere/virtual-computer:latest"
    network: "bridge"

  # 沙箱池配置
  pool:
    min-size: 3
    max-size: 10
    warm-up-timeout: 30000  # 30秒

  # 资源限制
  resources:
    memory: "2G"
    memory-swap: "4G"
    cpu-quota: 100000
    cpus: "1.0"

  # LLM配置
  llm:
    provider: "qwen"
    model: "qwen-plus"
    api-key: "${QWEN_API_KEY}"
    base-url: "https://dashscope.aliyuncs.com/api/v1"
    max-tokens: 2000
    temperature: 0.7

  # 智能体配置
  agents:
    planner:
      model: "qwen-plus"
      max-tokens: 2000
      temperature: 0.7

    executor:
      model: "qwen-plus"
      max-tokens: 1000
      temperature: 0.5

    monitor:
      check-interval: 5000  # 5秒

  # 记忆配置
  memory:
    short-term:
      ttl: 3600  # 1小时

    long-term:
      enabled: true
      vector-dimension: 1536

  # WebSocket配置
  websocket:
    endpoint: "/ws/sandbox"
    allowed-origins: "*"

  # 任务配置
  task:
    max-duration: 86400  # 24小时
    checkpoint-interval: 60  # 每分钟保存检查点
    auto-retry: true
    max-retries: 3
```

### B. 数据库Schema

```sql
-- 沙箱表
CREATE TABLE vc_sandboxes (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    container_id VARCHAR(64) NOT NULL,
    vnc_port INTEGER,
    novnc_port INTEGER,
    api_port INTEGER,
    status VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- 任务表
CREATE TABLE vc_tasks (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    sandbox_id VARCHAR(64),
    user_request TEXT NOT NULL,
    plan JSON,
    status VARCHAR(32) NOT NULL,
    progress INTEGER DEFAULT 0,
    final_result TEXT,
    created_at TIMESTAMP NOT NULL,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- 任务步骤表
CREATE TABLE vc_task_steps (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL,
    step_number INTEGER NOT NULL,
    tool_name VARCHAR(64) NOT NULL,
    parameters JSON,
    status VARCHAR(32) NOT NULL,
    result TEXT,
    screenshot TEXT,
    executed_at TIMESTAMP,
    duration BIGINT,
    FOREIGN KEY (task_id) REFERENCES vc_tasks(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_step_number (step_number)
);

-- 记忆表
CREATE TABLE vc_memories (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    task_id VARCHAR(64),
    type VARCHAR(32) NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    metadata JSON,
    created_at TIMESTAMP NOT NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- 检查点表
CREATE TABLE vc_checkpoints (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL,
    step_number INTEGER NOT NULL,
    state JSON NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (task_id) REFERENCES vc_tasks(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id)
);
```

---

**文档版本**: v2.0
**最后更新**: 2026-01-12
**维护人**: HeartSphere Team
