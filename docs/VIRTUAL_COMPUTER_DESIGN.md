# HeartSphere 虚拟电脑技术设计文档

## 📋 文档信息

- **项目名称**: HeartSphere Virtual Computer
- **版本**: v1.0
- **创建日期**: 2026-01-12
- **参考方案**: Manus AI + E2B
- **文档类型**: 技术设计文档

---

## 📑 目录

1. [项目概述](#1-项目概述)
2. [参考方案分析](#2-参考方案分析)
3. [核心技术栈](#3-核心技术栈)
4. [系统架构设计](#4-系统架构设计)
5. [模块详细设计](#5-模块详细设计)
6. [数据流设计](#6-数据流设计)
7. [安全设计](#7-安全设计)
8. [性能优化](#8-性能优化)
9. [实施路线图](#9-实施路线图)
10. [成本分析](#10-成本分析)

---

## 1. 项目概述

### 1.1 目标

为 HeartSphere AI 角色提供一个**完整的虚拟计算机环境**,使 AI 角色能够像真实人类一样使用计算机执行复杂任务。

### 1.2 核心价值

- ✅ **完整计算机环境**: 支持 Web 浏览、文件操作、代码执行
- ✅ **持久化会话**: 任务可以跨数小时甚至数天完成
- ✅ **安全隔离**: 完全隔离的沙箱环境,不影响宿主系统
- ✅ **可观测性**: 实时查看 AI 操作过程
- ✅ **可扩展性**: 支持多用户并发使用

### 1.3 应用场景

#### 场景1: 角色任务执行
```
用户: "帮我搜索最新的AI新闻并整理成报告"
AI角色:
  1. 打开浏览器搜索新闻
  2. 访问多个网站收集信息
  3. 编写Python脚本分析数据
  4. 生成Markdown报告
  5. 保存文件到虚拟桌面
  6. 返回报告给用户
```

#### 场景2: 剧情创作辅助
```
用户: "研究文艺复兴时期的历史背景"
AI角色:
  1. 浏览维基百科收集资料
  2. 下载历史文献
  3. 整理时间线
  4. 创建角色档案
  5. 生成剧情大纲
```

#### 场景3: 教育场景
```
学生: "帮我完成数据分析作业"
AI助教:
  1. 读取数据文件
  2. 编写分析代码
  3. 生成可视化图表
  4. 撰写分析报告
  5. 检查错误并优化
```

---

## 2. 参考方案分析

### 2.1 Manus AI 架构深度解析

#### 2.1.1 技术栈对比

| 层级 | Manus AI 方案 | HeartSphere 方案 |
|------|--------------|-----------------|
| 虚拟化层 | Firecracker microVM | Docker + 安全增强 |
| 沙箱管理 | E2B (付费) | 自研 + 开源工具 |
| 前端 | Next.js | Vue.js / React |
| 后端 | Python/FastAPI | Spring Boot |
| AI模型 | OpenAI GPT-4 | 通义千问 / 智谱AI |
| 通信 | SSE | WebSocket + SSE |
| 存储 | E2B云存储 | 本地存储 + OSS |

#### 2.1.2 关键技术指标

| 指标 | E2B | Docker方案 | 差距分析 |
|------|-----|-----------|----------|
| 启动速度 | ~150ms | ~500ms-1s | 可接受 |
| 隔离级别 | 完整OS | 容器级 | 需增强 |
| 资源占用 | 低 | 中等 | 可优化 |
| 成本 | 付费 | 免费 | ✅ 优势 |
| 自托管 | 支持 | 完全支持 | ✅ 优势 |
| 定制化 | 有限 | 完全自由 | ✅ 优势 |

#### 2.1.3 为什么选择 Docker 方案?

**优势分析:**

1. **成本控制**
   - E2B: 按使用付费,长期成本高
   - Docker: 一次性投入,长期免费

2. **技术自主可控**
   - E2B: 依赖第三方服务
   - Docker: 完全自主可控

3. **定制化能力**
   - E2B: 受限于平台功能
   - Docker: 可任意定制

4. **数据隐私**
   - E2B: 数据在云端
   - Docker: 数据本地化

**劣势与对策:**

| 劣势 | 对策 |
|------|------|
| 启动稍慢 | 预创建池,热备实例 |
| 隔离较弱 | 多层安全加固(见7.安全设计) |
| 资源占用 | 资源限制+自动回收 |

---

## 3. 核心技术栈

### 3.1 虚拟化技术

#### 方案A: Docker (推荐)
```yaml
技术栈:
  - Docker Engine 24.x
  - Docker Compose
  - seccomp 安全配置
  - AppArmor/SELinux 强化
  - 用户命名空间隔离
```

**优势:**
- ✅ 生态成熟,文档丰富
- ✅ 启动快速(500ms-1s)
- ✅ 资源占用相对较小
- ✅ 易于部署和维护

#### 方案B: Firecracker (高级)
```yaml
技术栈:
  - Firecracker microVM
  - KVM 虚拟化
  - 完整操作系统隔离
```

**优势:**
- ✅ 完整OS隔离,安全性最高
- ✅ 启动快速(~150ms)
- ✅ AWS Lambda同款技术

**劣势:**
- ⚠️ 运维复杂度高
- ⚠️ 需要KVM支持
- ⚠️ Windows/Mac支持有限

#### 方案C: 混合方案
- 简单任务: Docker容器
- 复杂任务: Firecracker VM
- 根据安全级别动态选择

### 3.2 桌面环境

#### VNC + XFCE 方案
```bash
# 容器内组件
- XFCE4 桌面环境
- VNC Server (x11vnc)
- noVNC (浏览器客户端)
- Firefox/Chromium 浏览器
- Python 3.x
- Node.js
- 常用开发工具
```

**架构:**
```
Container
├── XFCE4 Desktop (Display :1)
├── x11vnc (Port 5901)
├── noVNC (Port 6080) → WebSocket → VNC
└── Applications
    ├── Browser
    ├── Terminal
    └── File Manager
```

### 3.3 通信协议

#### WebSocket 实时通信
```javascript
// 前端
const ws = new WebSocket('ws://localhost:8080/sandbox/{id}');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'screen') {
    // 更新虚拟桌面画面
    updateScreen(data.screen);
  } else if (message.type === 'action') {
    // 显示AI操作
    showAction(data.action);
  }
};
```

#### Server-Sent Events (SSE)
```java
// 后端
@GetMapping("/sandbox/{id}/events")
public SseEmitter getEvents(@PathVariable String id) {
    SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
    sandboxService.registerEmitter(id, emitter);
    return emitter;
}
```

---

## 4. 系统架构设计

### 4.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Vue.js SPA  │  │  Chat UI     │  │  Desktop View│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓ WebSocket/SSE
┌─────────────────────────────────────────────────────────────────┐
│                        Gateway Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ API Gateway  │  │ Auth Service │  │ Load Balancer│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓ REST API
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                          │
│  ┌──────────────────────────────────────────────────────┐      │
│  │          Virtual Computer Service                     │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │      │
│  │  │Sandbox   │  │Session   │  │Tool      │          │      │
│  │  │Manager   │  │Manager   │  │Executor  │          │      │
│  │  └──────────┘  └──────────┘  └──────────┘          │      │
│  └──────────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │               AI Orchestrator                         │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │      │
│  │  │Planner   │  │Executor  │  │Memory    │          │      │
│  │  │Agent     │  │Agent     │  │Service   │          │      │
│  │  └──────────┘  └──────────┘  └──────────┘          │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Docker API
┌─────────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                         │
│  ┌──────────────────────────────────────────────────────┐      │
│  │            Docker Sandbox Pool                        │      │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐              │      │
│  │  │Container│  │Container│  │Container│  ...         │      │
│  │  │  #1     │  │  #2     │  │  #3     │              │      │
│  │  │         │  │         │  │         │              │      │
│  │  │ • VNC    │  │ • VNC    │  │ • VNC    │              │      │
│  │  │ • Browser│  │ • Browser│  │ • Browser│              │      │
│  │  │ • Python │  │ • Python │  │ • Python │              │      │
│  │  └─────────┘  └─────────┘  └─────────┘              │      │
│  └──────────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │           Storage & Cache                             │      │
│  │  • Redis (Session/State)                              │      │
│  │  • PostgreSQL (Metadata)                              │      │
│  │  • MinIO/OSS (Files)                                  │      │
│  │  • Local Disk (Snapshots)                             │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 核心组件说明

#### 4.2.1 Sandbox Manager (沙箱管理器)

**职责:**
- 创建和销毁沙箱实例
- 管理沙箱生命周期
- 维护沙箱池(热备)
- 资源分配和回收

**接口设计:**
```java
public interface SandboxManager {
    /**
     * 创建新沙箱
     */
    Sandbox createSandbox(String userId, SandboxConfig config);

    /**
     * 获取沙箱
     */
    Sandbox getSandbox(String sandboxId);

    /**
     * 销毁沙箱
     */
    void destroySandbox(String sandboxId);

    /**
     * 暂停沙箱
     */
    void pauseSandbox(String sandboxId);

    /**
     * 恢复沙箱
     */
    void resumeSandbox(String sandboxId);

    /**
     * 保存快照
     */
    String saveSnapshot(String sandboxId);

    /**
     * 恢复快照
     */
    void restoreSnapshot(String sandboxId, String snapshotId);
}
```

#### 4.2.2 Session Manager (会话管理器)

**职责:**
- 管理用户会话
- 维护会话状态
- 处理会话超时
- 持久化会话数据

**会话状态机:**
```
CREATED → STARTED → ACTIVE → PAUSED → ACTIVE → COMPLETED
                 ↓                  ↓
              FAILED             STOPPED
```

**数据模型:**
```java
@Data
@Entity
public class SandboxSession {
    private String id;
    private String userId;
    private String sandboxId;

    @Enumerated(EnumType.STRING)
    private SessionStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private Integer maxDuration; // 秒

    // 快照
    @Lob
    private String snapshotData;

    // 元数据
    @MapKeyColumn(name = "key")
    @ElementCollection
    private Map<String, String> metadata;
}
```

#### 4.2.3 Tool Executor (工具执行器)

**支持的工具:**

| 工具类型 | 工具名称 | 功能描述 |
|---------|---------|---------|
| 浏览器 | browser_goto | 访问URL |
| | browser_click | 点击元素 |
| | browser_type | 输入文本 |
| | browser_screenshot | 截图 |
| | browser_scroll | 滚动页面 |
| 终端 | terminal_exec | 执行命令 |
| | terminal_write | 写入文件 |
| | terminal_read | 读取文件 |
| 文件系统 | file_create | 创建文件 |
| | file_delete | 删除文件 |
| | file_list | 列出文件 |
| | file_download | 下载文件 |
| 代码执行 | python_run | 运行Python |
| | node_run | 运行Node.js |
| | bash_run | 运行Bash |

**工具接口:**
```java
public interface Tool {
    /**
     * 工具名称
     */
    String getName();

    /**
     * 工具描述(用于AI理解)
     */
    String getDescription();

    /**
     * 参数定义
     */
    Map<String, ToolParameter> getParameters();

    /**
     * 执行工具
     */
    ToolResult execute(ToolContext context);
}
```

#### 4.2.4 AI Orchestrator (AI编排器)

**多智能体架构:**

```
┌─────────────────────────────────────────────────┐
│              User Request                        │
└───────────────────┬─────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│         Planner Agent (规划器)                   │
│  • 分析任务                                      │
│  • 分解子任务                                    │
│  • 制定执行计划                                  │
└───────────────────┬─────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│         Executor Agent (执行器)                  │
│  • 选择工具                                      │
│  • 执行操作                                      │
│  • 处理结果                                      │
└───────────────────┬─────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│         Monitor Agent (监控器)                   │
│  • 观察执行状态                                  │
│  • 错误检测                                      │
│  • 自动恢复                                      │
└─────────────────────────────────────────────────┘
```

**规划器提示词模板:**
```python
PLANNER_PROMPT = """
你是一个任务规划专家。请分析用户请求并制定执行计划。

用户请求: {user_request}

可用工具:
{available_tools}

请输出JSON格式的执行计划:
{
  "analysis": "任务分析",
  "steps": [
    {
      "step": 1,
      "action": "browser_goto",
      "params": {"url": "https://example.com"},
      "reasoning": "为什么要执行这一步"
    },
    ...
  ],
  "estimated_time": "预计耗时(分钟)"
}
"""
```

---

## 5. 模块详细设计

### 5.1 Docker 镜像设计

#### 5.1.1 基础镜像 Dockerfile

```dockerfile
# HeartSphere Virtual Computer Base Image
FROM ubuntu:22.04

# 设置时区
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Shanghai

# 安装基础工具
RUN apt-get update && apt-get install -y \
    # 桌面环境
    xfce4 \
    xfce4-goodies \
    # VNC服务器
    x11vnc \
    # 浏览器
    firefox \
    chromium-browser \
    # 开发工具
    python3 \
    python3-pip \
    nodejs \
    npm \
    git \
    vim \
    # 其他工具
    curl \
    wget \
    jq \
    # 清理
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 安装Python常用库
RUN pip3 install --no-cache-dir \
    pandas \
    numpy \
    matplotlib \
    seaborn \
    requests \
    beautifulsoup4 \
    selenium \
    jupyter

# 安装noVNC (浏览器VNC客户端)
RUN git clone https://github.com/novnc/noVNC /opt/noVNC

# 创建工作目录
WORKDIR /workspace

# 暴露端口
# 5901: VNC
# 6080: noVNC
# 8081: 沙箱API
EXPOSE 5901 6080 8081

# 启动脚本
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
```

#### 5.1.2 启动脚本 start.sh

```bash
#!/bin/bash

# 启动XFCE4桌面
export DISPLAY=:1
Xvfb :1 -screen 0 1920x1080x24 &
sleep 2

# 启动XFCE4
startxfce4 &

# 启动x11vnc
x11vnc -display :1 -forever -shared -rfbport 5901 &

# 启动noVNC
/opt/noVNC/utils/novnc_proxy --vnc localhost:5901 --listen 6080 &

# 启动沙箱API服务
python3 /sandbox-api/server.py &

# 保持运行
tail -f /dev/null
```

### 5.2 沙箱API服务

#### 5.2.1 FastAPI服务 (容器内)

```python
# sandbox-api/server.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import json

app = FastAPI()

class ToolRequest(BaseModel):
    tool: str
    params: dict

@app.post("/tools/execute")
async def execute_tool(request: ToolRequest):
    """执行工具命令"""
    try:
        if request.tool == "browser_goto":
            result = browser_goto(request.params["url"])
        elif request.tool == "terminal_exec":
            result = terminal_exec(request.params["command"])
        elif request.tool == "python_run":
            result = python_run(request.params["code"])
        else:
            raise HTTPException(400, f"Unknown tool: {request.tool}")

        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/health")
async def health():
    """健康检查"""
    return {"status": "healthy"}

def browser_goto(url: str):
    """打开浏览器访问URL"""
    subprocess.run(["firefox", url])
    return f"Opened {url}"

def terminal_exec(command: str):
    """执行终端命令"""
    result = subprocess.run(
        command,
        shell=True,
        capture_output=True,
        text=True
    )
    return {
        "stdout": result.stdout,
        "stderr": result.stderr,
        "returncode": result.returncode
    }

def python_run(code: str):
    """执行Python代码"""
    result = subprocess.run(
        ["python3", "-c", code],
        capture_output=True,
        text=True
    )
    return {
        "stdout": result.stdout,
        "stderr": result.stderr
    }
```

### 5.3 Spring Boot后端设计

#### 5.3.1 核心服务接口

```java
public interface VirtualComputerService {

    /**
     * 创建虚拟电脑
     */
    VirtualComputerDTO createComputer(String userId, CreateComputerRequest request);

    /**
     * 执行工具
     */
    ToolExecutionResult executeTool(String computerId, ToolExecutionRequest request);

    /**
     * 获取截图
     */
    String getScreenshot(String computerId);

    /**
     * 上传文件
     */
    void uploadFile(String computerId, MultipartFile file);

    /**
     * 下载文件
     */
    Resource downloadFile(String computerId, String filePath);

    /**
     * 暂停虚拟电脑
     */
    void pauseComputer(String computerId);

    /**
     * 恢复虚拟电脑
     */
    void resumeComputer(String computerId);

    /**
     * 销毁虚拟电脑
     */
    void destroyComputer(String computerId);
}
```

#### 5.3.2 实现类

```java
@Service
@Slf4j
public class VirtualComputerServiceImpl implements VirtualComputerService {

    @Autowired
    private DockerClient dockerClient;

    @Autowired
    private SandboxRepository sandboxRepository;

    @Autowired
    private SseEmitterService sseEmitterService;

    @Value("${sandbox.image:heartsphere/virtual-computer:latest}")
    private String sandboxImage;

    @Override
    public VirtualComputerDTO createComputer(String userId, CreateComputerRequest request) {
        log.info("创建虚拟电脑: userId={}", userId);

        // 1. 生成容器ID
        String containerId = "vc-" + UUID.randomUUID().toString().substring(0, 8);

        // 2. 配置容器
        ContainerConfig config = ContainerConfig.builder()
            .image(sandboxImage)
            .exposedPorts(Arrays.asList("5901", "6080", "8081"))
            .hostConfig(HostConfig.builder()
                .networkMode("bridge")
                .publishAllPorts(true)
                .memory(2 * 1024 * 1024 * 1024L) // 2GB
                .memorySwap(4 * 1024 * 1024 * 1024L) // 4GB
                .cpuQuota(100000L) // 1 CPU
                .build())
            .build();

        // 3. 创建并启动容器
        dockerClient.createContainer(containerId, config);
        dockerClient.startContainer(containerId);

        // 4. 等待服务就绪
        waitForReady(containerId);

        // 5. 获取映射端口
        ContainerInfo info = dockerClient.inspectContainer(containerId);
        Integer vncPort = info.getNetworkSettings().getPorts().get("5901/tcp").getHostPort();
        Integer noVncPort = info.getNetworkSettings().getPorts().get("6080/tcp").getHostPort();
        Integer apiPort = info.getNetworkSettings().getPorts().get("8081/tcp").getHostPort();

        // 6. 保存到数据库
        Sandbox sandbox = Sandbox.builder()
            .id(containerId)
            .userId(userId)
            .vncPort(vncPort)
            .noVncPort(noVncPort)
            .apiPort(apiPort)
            .status(SandboxStatus.RUNNING)
            .createdAt(LocalDateTime.now())
            .build();
        sandboxRepository.save(sandbox);

        // 7. 通知前端
        sseEmitterService推送(userId, "computer_created", toDTO(sandbox));

        return toDTO(sandbox);
    }

    @Override
    public ToolExecutionResult executeTool(String computerId, ToolExecutionRequest request) {
        Sandbox sandbox = sandboxRepository.findById(computerId)
            .orElseThrow(() -> new RuntimeException("虚拟电脑不存在"));

        // 调用容器内API
        String apiUrl = String.format("http://localhost:%d/tools/execute",
            sandbox.getApiPort());

        ToolExecutionResult result = restTemplate.postForObject(
            apiUrl,
            request,
            ToolExecutionResult.class
        );

        // 广播执行结果
        sseEmitterService.broadcast(sandbox.getUserId(), "tool_executed", result);

        return result;
    }

    private void waitForReady(String containerId) {
        // 健康检查,等待服务启动
        int maxRetries = 30;
        for (int i = 0; i < maxRetries; i++) {
            try {
                String result = dockerClient.execInContainer(containerId,
                    "curl", "http://localhost:8081/health");
                if (result.contains("healthy")) {
                    return;
                }
            } catch (Exception e) {
                log.debug("等待服务就绪: {}/{}", i + 1, maxRetries);
            }
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        throw new RuntimeException("虚拟电脑启动超时");
    }
}
```

---

## 6. 数据流设计

### 6.1 任务执行流程

```
┌──────────────────────────────────────────────────────────────┐
│ 1. 用户发起任务                                               │
│    "帮我搜索AI新闻并整理成报告"                                │
└──────────────────┬───────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. Planner Agent 规划任务                                     │
│    输出: [                                                    │
│      {"step": 1, "action": "browser_goto", ...},             │
│      {"step": 2, "action": "browser_screenshot", ...},        │
│      {"step": 3, "action": "python_run", ...},               │
│      ...                                                      │
│    ]                                                          │
└──────────────────┬───────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. Executor Agent 执行步骤                                    │
│    ┌──────────────────────────────────────────────┐          │
│    │ Step 1: browser_goto                         │          │
│    │   → 调用Docker API                           │          │
│    │   → 容器内执行firefox命令                    │          │
│    │   → 返回执行结果                             │          │
│    └──────────────────────────────────────────────┘          │
│                           ↓                                   │
│    ┌──────────────────────────────────────────────┐          │
│    │ Step 2: browser_screenshot                    │          │
│    │   → 调用容器API截图                          │          │
│    │   → 获取截图base64                           │          │
│    │   → 推送到前端显示                           │          │
│    └──────────────────────────────────────────────┘          │
│                           ↓                                   │
│    ┌──────────────────────────────────────────────┐          │
│    │ Step 3: python_run                           │          │
│    │   → 执行Python分析代码                       │          │
│    │   → 获取输出结果                             │          │
│    │   → 保存到虚拟桌面                           │          │
│    └──────────────────────────────────────────────┘          │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. 完成任务,返回结果                                           │
│    "已完成!报告已保存到 /workspace/report.md"                 │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 实时通信流程

#### WebSocket 消息格式

```typescript
// 前端 → 后端
interface ClientMessage {
  type: 'start' | 'execute_tool' | 'pause' | 'resume' | 'stop';
  payload: any;
}

// 后端 → 前端
interface ServerMessage {
  type: 'screen_update' | 'tool_executed' | 'error' | 'status';
  payload: any;
  timestamp: number;
}
```

#### 消息处理流程

```java
@Controller
public class WebSocketController {

    @MessageMapping("/sandbox/{sandboxId}")
    public void handleSandboxMessage(
        @Payload String message,
        @PathVariable String sandboxId,
        SimpMessageHeaderAccessor headerAccessor
    ) {
        String sessionId = headerAccessor.getSessionId();

        // 解析消息
        ClientMessage msg = JSON.parse(message);

        switch (msg.type) {
            case "execute_tool":
                ToolExecutionResult result = toolExecutor.execute(
                    sandboxId,
                    msg.payload
                );
                // 发送结果
                messagingTemplate.convertAndSendToUser(
                    sessionId,
                    "/queue/sandbox",
                    ServerMessage.builder()
                        .type("tool_executed")
                        .payload(result)
                        .timestamp(System.currentTimeMillis())
                        .build()
                );
                break;
            // ... 其他case
        }
    }
}
```

---

## 7. 安全设计

### 7.1 多层安全防护

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: 网络隔离                                        │
│  • Docker Bridge Network                                 │
│  • 端口白名单                                            │
│  • 防火墙规则                                            │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: 容器隔离                                        │
│  • 用户命名空间 (User Namespace)                         │
│  • PID命名空间                                           │
│  • 网络命名空间                                          │
│  • 挂载命名空间                                          │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 3: 资源限制                                        │
│  • CPU限制 (1核心)                                        │
│  • 内存限制 (2GB)                                         │
│  • 磁盘限制 (10GB)                                        │
│  • 进程数限制                                            │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 4: seccomp过滤                                     │
│  • 系统调用白名单                                        │
│  • 阻止危险操作 (如execve, clone)                        │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 5: AppArmor/SELinux                                │
│  • 强制访问控制                                          │
│  • 文件访问限制                                          │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 6: 应用层安全                                      │
│  • 代码沙箱执行                                          │
│  • 命令注入防护                                          │
│  • 路径遍历防护                                          │
└─────────────────────────────────────────────────────────┘
```

### 7.2 seccomp 配置

```json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64", "SCMP_ARCH_X86"],
  "syscalls": [
    {
      "names": [
        "read", "write", "open", "close", "stat", "fstat", "lstat",
        "poll", "lseek", "mmap", "mprotect", "munmap", "brk",
        "rt_sigaction", "rt_sigprocmask", "rt_sigreturn", "ioctl",
        "pread64", "pwrite64", "readv", "writev", "access", "pipe",
        "select", "sched_yield", "mremap", "msync", "mincore", "madvise",
        "dup", "dup2", "pause", "nanosleep", "getitimer", "alarm",
        "setitimer", "getpid", "sendfile", "socket", "connect"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
```

### 7.3 Docker安全配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  virtual-computer:
    image: heartsphere/virtual-computer:latest
    security_opt:
      - seccomp:seccomp-profile.json
      - apparmor:docker-default
    read_only: true
    tmpfs:
      - /tmp
      - /workspace
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    user: "1000:1000"
    networks:
      - sandbox-network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G

networks:
  sandbox-network:
    driver: bridge
    internal: false
```

---

## 8. 性能优化

### 8.1 沙箱池管理

#### 热备池 (Warm Pool)

```java
@Service
public class SandboxPoolManager {

    private final BlockingQueue<Sandbox> warmPool = new LinkedBlockingQueue<>(10);

    @PostConstruct
    public void init() {
        // 预创建5个沙箱
        for (int i = 0; i < 5; i++) {
            try {
                Sandbox sandbox = createSandbox();
                warmPool.offer(sandbox);
            } catch (Exception e) {
                log.error("预创建沙箱失败", e);
            }
        }
    }

    public Sandbox acquire() {
        // 尝试从池中获取
        Sandbox sandbox = warmPool.poll();
        if (sandbox != null) {
            log.info("从池中获取沙箱: {}", sandbox.getId());
            return sandbox;
        }

        // 池为空,创建新的
        log.info("池为空,创建新沙箱");
        return createSandbox();
    }

    public void release(Sandbox sandbox) {
        // 重置沙箱状态
        resetSandbox(sandbox);

        // 归还到池
        if (warmPool.size() < 10) {
            warmPool.offer(sandbox);
        } else {
            // 池已满,销毁
            destroySandbox(sandbox);
        }
    }
}
```

**优化效果:**
- 普通创建: 3-5秒
- 池中获取: <100ms
- **提升 30-50倍**

### 8.2 缓存策略

#### Redis缓存层

```java
@Service
public class CacheService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    // 缓存沙箱配置
    public void cacheSandboxConfig(String sandboxId, SandboxConfig config) {
        String key = "sandbox:config:" + sandboxId;
        redisTemplate.opsForValue().set(key, config, 1, TimeUnit.HOURS);
    }

    // 缓存执行结果
    public void cacheExecutionResult(String taskId, ToolResult result) {
        String key = "task:result:" + taskId;
        redisTemplate.opsForValue().set(key, result, 30, TimeUnit.MINUTES);
    }

    // 缓存截图(减少传输)
    public String cacheScreenshot(String sandboxId, String screenshot) {
        String key = "screenshot:" + sandboxId;
        redisTemplate.opsForValue().set(key, screenshot, 1, TimeUnit.MINUTES);
        return key;
    }
}
```

### 8.3 并发优化

#### 异步执行

```java
@Service
public class AsyncToolExecutor {

    @Async("taskExecutor")
    public CompletableFuture<ToolResult> executeAsync(
        String sandboxId,
        ToolRequest request
    ) {
        ToolResult result = doExecute(sandboxId, request);
        return CompletableFuture.completedFuture(result);
    }

    // 批量并行执行
    public CompletableFuture<List<ToolResult>> executeBatch(
        String sandboxId,
        List<ToolRequest> requests
    ) {
        List<CompletableFuture<ToolResult>> futures = requests.stream()
            .map(req -> executeAsync(sandboxId, req))
            .collect(Collectors.toList());

        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenApply(v -> futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList()));
    }
}
```

---

## 9. 实施路线图

### Phase 1: MVP (最小可行产品) - 4周

**Week 1-2: 基础设施**
- [ ] Docker镜像构建
  - [ ] 基础镜像开发 (Ubuntu + XFCE4 + VNC)
  - [ ] 安装浏览器和开发工具
  - [ ] 配置noVNC
- [ ] 沙箱API服务
  - [ ] FastAPI服务开发
  - [ ] 工具执行接口实现
  - [ ] 健康检查接口

**Week 3: 后端服务**
- [ ] Spring Boot服务
  - [ ] Docker客户端集成
  - [ ] 沙箱管理器开发
  - [ ] WebSocket/SSE通信

**Week 4: 前端界面**
- [ ] Vue.js前端
  - [ ] 虚拟桌面显示
  - [ ] 聊天界面
  - [ ] 任务状态显示

**里程碑**: 能够创建虚拟电脑并执行简单命令

### Phase 2: 核心功能 - 6周

**Week 5-6: AI集成**
- [ ] Planner Agent开发
- [ ] Executor Agent开发
- [ ] 提示词工程优化

**Week 7-8: 工具开发**
- [ ] 浏览器工具集
- [ ] 终端工具集
- [ ] 文件系统工具集
- [ ] 代码执行工具

**Week 9-10: 会话管理**
- [ ] 会话持久化
- [ ] 快照保存/恢复
- [ ] 暂停/恢复功能

**里程碑**: 完整的多步骤任务执行能力

### Phase 3: 优化和增强 - 4周

**Week 11-12: 性能优化**
- [ ] 沙箱池实现
- [ ] 缓存优化
- [ ] 异步执行

**Week 13-14: 安全加固**
- [ ] seccomp配置
- [ ] 资源限制
- [ ] 安全审计

**里程碑**: 生产级性能和安全性

### Phase 4: 高级功能 - 6周

**Week 15-17: 多模态支持**
- [ ] 图片识别集成
- [ ] 语音输入支持
- [ ] 视频处理能力

**Week 18-20: 集成和测试**
- [ ] 与现有系统集成
- [ ] 压力测试
- [ ] 用户测试

**里程碑**: 完整功能发布

---

## 10. 成本分析

### 10.1 基础设施成本

#### 服务器配置

| 配置 | 单价/月 | 数量 | 小计 |
|------|--------|------|------|
| 4核8G服务器 | ¥200 | 2台 | ¥400 |
| 100GB SSD | ¥50 | 2个 | ¥100 |
| 1TB OSS存储 | ¥100 | 1个 | ¥100 |
| Redis云服务 | ¥50 | 1个 | ¥50 |
| **合计** | | | **¥650/月** |

#### 资源利用率

- 单个虚拟电脑: 1核2GB
- 单服务器支持: 3-4个并发
- 2服务器总并发: 6-8个
- 按池化策略: 可支持20-30个用户

### 10.2 开发成本

| 角色 | 人数 | 周期 | 人月 | 成本 |
|------|------|------|------|------|
| 后端开发 | 2 | 14周 | 7 | ¥70K |
| 前端开发 | 1 | 10周 | 2.5 | ¥25K |
| AI工程师 | 1 | 8周 | 2 | ¥30K |
| 测试工程师 | 1 | 6周 | 1.5 | ¥15K |
| **合计** | | | **13人月** | **¥140K** |

### 10.3 运营成本

| 项目 | 成本/月 |
|------|---------|
| 服务器 | ¥650 |
| API调用(AI模型) | ¥500 |
| 带宽流量 | ¥200 |
| 维护支持 | ¥100 |
| **合计** | **¥1,450/月** |

### 10.4 成本对比

| 方案 | 初始成本 | 月度成本 | 年度总成本 |
|------|---------|---------|-----------|
| **自建(Docker)** | ¥140K | ¥1.5K | ¥158K |
| E2B(按使用) | ¥0 | ¥10K-50K | ¥120K-600K |

**结论:** 自建方案在3-6个月后比E2B更经济

---

## 11. 风险与挑战

### 11.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Docker安全性不足 | 高 | 多层安全加固,定期审计 |
| 性能瓶颈 | 中 | 池化策略,异步执行 |
| 资源泄露 | 高 | 监控告警,自动回收 |

### 11.2 业务风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 用户需求变化 | 中 | 敏捷迭代,用户反馈 |
| 成本超支 | 中 | 严格预算控制 |
| 竞品压力 | 中 | 快速迭代,差异化功能 |

---

## 12. 附录

### 12.1 参考资料

- [E2B Documentation](https://e2b.dev/docs)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Manus AI Blog](https://e2b.dev/blog/how-manus-uses-e2b-to-provide-agents-with-virtual-computers)
- [Firecracker GitHub](https://github.com/firecracker-microvm/firecracker)

### 12.2 技术选型对比

| 方案 | 优势 | 劣势 | 推荐度 |
|------|------|------|--------|
| Docker | 成熟、快速、成本低 | 隔离较弱 | ⭐⭐⭐⭐⭐ |
| Firecracker | 完整隔离、快速 | 复杂、维护成本高 | ⭐⭐⭐ |
| E2B | 开箱即用 | 成本高、依赖第三方 | ⭐⭐⭐⭐ |

### 12.3 术语表

- **Sandbox**: 沙箱,隔离的执行环境
- **MicroVM**: 微型虚拟机,轻量级虚拟机
- **seccomp**: 安全计算模式,系统调用过滤
- **AppArmor**: Linux强制访问控制
- **VNC**: Virtual Network Computing,虚拟网络计算
- **noVNC**: 基于HTML5的VNC客户端

---

**文档版本**: v1.0
**最后更新**: 2026-01-12
**维护人**: HeartSphere Team
