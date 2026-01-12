# Change: 重构主项目为基础设施服务

## Why

当前项目结构下，主项目的 `frontend` 和 `backend` 与其他子项目（`mentis`、`edu`、`admin`）处于同一层级，缺乏清晰的定位。主项目未来将作为基础设施服务提供者，为其他项目提供场景角色剧本、AIAgent 等底层基础服务。需要：

1. **明确主项目定位**：将主项目（frontend + backend）迁移到 `main` 文件夹，明确其作为基础设施服务的角色
2. **清理教育相关代码**：从主项目中移除 `edu` 相关的代码，因为 `edu` 已经作为独立项目存在
3. **保持项目独立性**：确保 `mentis`、`edu`、`admin` 作为独立项目，不依赖主项目的业务代码（仅依赖基础设施服务）

## What Changes

- **BREAKING**: 创建 `main` 文件夹，将 `frontend` 和 `backend` 迁移到 `main/` 目录下
- **BREAKING**: 从主项目的 `backend` 和 `frontend` 中清理所有 `edu` 相关的代码和配置
- **BREAKING**: 从 `mentis`、`edu`、`admin` 中清理与主项目业务逻辑的耦合，确保它们仅通过 API 调用主项目的基础设施服务
- 更新所有构建脚本、部署脚本、配置文件中的路径引用
- 更新文档中的项目结构说明

## Impact

- **受影响的项目结构**：
  - `heartsphere_new/` → `heartsphere_new/main/` (frontend + backend)
  - `heartsphere_new/mentis/` (保持不变，但需清理 edu 相关代码)
  - `heartsphere_new/edu/` (保持不变，但需清理与主项目的业务耦合)
  - `heartsphere_new/admin/` (保持不变，但需清理 edu 相关代码)
  
- **受影响的代码**：
  - 所有构建脚本（Maven pom.xml、package.json、启动脚本等）
  - 所有部署脚本和配置文件
  - 数据库迁移脚本路径
  - 静态资源路径
  - API 路由和跨项目引用

- **受影响的文档**：
  - `openspec/project.md` - 项目结构说明
  - `README.md` - 项目介绍
  - 所有开发指南和部署文档

- **需要创建的规范**：
  - 基础设施服务 API 规范（场景角色剧本、AIAgent 等服务接口）
  - 项目间通信规范（如何调用主项目的基础设施服务）
