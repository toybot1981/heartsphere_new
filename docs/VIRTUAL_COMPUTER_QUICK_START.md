# 虚拟电脑快速启动指南

## 📚 文档概览

已完成 **HeartSphere 虚拟电脑技术设计文档**,包含以下内容:

## 📋 文档结构

| 章节 | 内容 | 页数 |
|------|------|------|
| 1. 项目概述 | 目标、价值、应用场景 | - |
| 2. 参考方案分析 | Manus AI 深度解析、技术对比 | - |
| 3. 核心技术栈 | Docker、VNC、WebSocket | - |
| 4. 系统架构设计 | 整体架构图、核心组件 | - |
| 5. 模块详细设计 | Docker镜像、沙箱API、后端服务 | - |
| 6. 数据流设计 | 任务执行流程、实时通信 | - |
| 7. 安全设计 | 多层安全防护、seccomp配置 | - |
| 8. 性能优化 | 沙箱池、缓存、并发 | - |
| 9. 实施路线图 | 4个阶段、20周计划 | - |
| 10. 成本分析 | 基础设施、开发、运营成本 | - |

## 🎯 核心亮点

### 1. 技术选型

**推荐方案: Docker + 安全增强**

```
优势:
✅ 成本低 - 年节省 ¥100K+
✅ 可控 - 完全自主可控
✅ 快速 - 500ms启动(池化<100ms)
✅ 成熟 - 生态完善
```

### 2. 架构设计

**三层架构:**
- 前端: Vue.js SPA + 虚拟桌面视图
- 后端: Spring Boot + Docker管理
- 基础设施: Docker容器池 + VNC桌面

**多智能体:**
- Planner Agent - 任务规划
- Executor Agent - 工具执行
- Monitor Agent - 状态监控

### 3. 核心功能

**27种工具支持:**
- 🌐 浏览器操作(访问、点击、截图)
- 💻 终端命令(执行、读写)
- 📁 文件系统(创建、删除、下载)
- 🐍 代码执行(Python、Node.js、Bash)

**会话管理:**
- ⏸️ 暂停/恢复
- 💾 快照保存
- 🔄 持久化(最长14天)

### 4. 安全设计

**六层防护:**
```
Layer 1: 网络隔离
Layer 2: 容器隔离(命名空间)
Layer 3: 资源限制
Layer 4: seccomp过滤
Layer 5: AppArmor/SELinux
Layer 6: 应用层安全
```

### 5. 性能优化

**沙箱池策略:**
- 预创建5个热备实例
- 获取速度: <100ms (vs 3-5秒)
- **提升 30-50倍**

**缓存优化:**
- Redis缓存配置和结果
- 截图缓存减少传输
- 30-50%性能提升

## 📅 实施计划

### Phase 1: MVP (4周)
- ✅ Docker镜像构建
- ✅ 沙箱API服务
- ✅ Spring Boot后端
- ✅ Vue.js前端

**里程碑**: 创建虚拟电脑并执行命令

### Phase 2: 核心功能 (6周)
- ✅ AI智能体集成
- ✅ 27种工具开发
- ✅ 会话持久化

**里程碑**: 完整任务执行能力

### Phase 3: 优化增强 (4周)
- ✅ 沙箱池实现
- ✅ 性能优化
- ✅ 安全加固

**里程碑**: 生产级性能

### Phase 4: 高级功能 (6周)
- ✅ 多模态支持
- ✅ 集成测试
- ✅ 用户测试

**里程碑**: 功能发布

**总计: 20周 (5个月)**

## 💰 成本分析

### 初始投入
- **开发成本**: ¥140K (13人月)
- **基础设施**: ¥0 (使用现有服务器)

### 月度运营
- **服务器**: ¥650/月
- **API调用**: ¥500/月
- **其他**: ¥300/月
- **合计**: **¥1,450/月**

### 对比E2B
| 方案 | 年度成本 |
|------|----------|
| **自建(Docker)** | ¥158K |
| E2B (按使用) | ¥120K-600K |

**结论**: 3-6个月后自建更经济

## 🚀 快速开始

### 1. 阅读设计文档
```bash
open docs/VIRTUAL_COMPUTER_DESIGN.md
```

### 2. 准备环境
```bash
# 安装Docker
curl -fsSL https://get.docker.com | sh

# 克隆项目
git clone https://github.com/heartsphere/virtual-computer.git
cd virtual-computer
```

### 3. 构建镜像
```bash
cd docker/base
docker build -t heartsphere/virtual-computer:latest .
```

### 4. 启动服务
```bash
cd backend
mvn spring-boot:run

# 另一个终端
cd frontend
npm run dev
```

### 5. 访问界面
```
http://localhost:3000
```

## 📖 技术文档

- [完整设计文档](docs/VIRTUAL_COMPUTER_DESIGN.md)
- [Docker镜像构建指南](docker/README.md)
- [API接口文档](api/README.md)
- [安全最佳实践](security/README.md)

## 🤝 贡献指南

欢迎贡献代码和提出建议!

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 发起 Pull Request

## 📞 联系方式

- 项目主页: [HeartSphere](https://heartsphere.com)
- 问题反馈: [GitHub Issues](https://github.com/heartsphere/virtual-computer/issues)

---

**下一步行动:**
1. ✅ 审阅设计文档
2. ⏳ 技术评审会议
3. ⏳ 组建开发团队
4. ⏳ 启动Phase 1开发

**文档版本**: v1.0
**创建日期**: 2026-01-12
**最后更新**: 2026-01-12
