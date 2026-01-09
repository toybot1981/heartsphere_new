# 传送门系统

传送门系统是一个完整的心域间传送功能模块，允许用户在心域之间创建传送门，实现跨心域的导航体验。

## ✨ 功能特性

- 🌀 **三种传送门类型**: 星门（Stargate）、虫洞（Wormhole）、量子（Quantum）
- 🎨 **3D视觉效果**: 使用Three.js实现的精美3D渲染效果
- 🎬 **传送动画**: 流畅的场景切换动画和音效
- 🔐 **权限管理**: 公开、需审批、仅邀请三种权限模式
- 📊 **管理界面**: 完整的CRUD操作界面
- 🎯 **模块化设计**: 独立模块，不影响现有功能

## 📦 安装

### 前端依赖

```bash
npm install three @types/three
```

### 后端配置

在 `application.yml` 中启用功能：

```yaml
heartconnect:
  portal:
    enabled: true
```

## 🚀 快速开始

### 基础使用

```tsx
import { PortalLayer, TeleportationManager } from '@/components/portal';

<TeleportationManager sceneId={sceneId}>
  <PortalLayer portals={portals} />
</TeleportationManager>
```

### 打开管理界面

```tsx
import { PortalManagement } from '@/components/portal';

<PortalManagement sceneId={sceneId} />
```

详细文档请查看：[快速开始指南](docs/10-心域连接/传送门系统快速开始指南.md)

## 📚 文档

- [实现总结](docs/10-心域连接/传送门系统实现总结.md)
- [快速开始指南](docs/10-心域连接/传送门系统快速开始指南.md)
- [实现进度](docs/10-心域连接/传送门系统实现进度.md)
- [API测试指南](backend/src/test/java/com/heartsphere/heartconnect/portal/PortalApiTest.md)

## 🏗️ 架构

### 后端

- **包结构**: `com.heartsphere.heartconnect.portal`
- **数据库**: 3个独立表（portal_config, portal_permission, portal_teleportation_log）
- **API**: 9个REST端点

### 前端

- **组件**: `components/portal/`
- **服务**: `services/api/portal/`
- **Hook**: `hooks/usePortal.ts`

## 🧪 测试

```bash
cd backend/src/test/java/com/heartsphere/heartconnect/portal/
./PortalApiTest.sh http://localhost:8081 <token>
```

## 📊 文件统计

- **后端**: 19个Java文件
- **前端**: 16个TypeScript/TSX文件
- **数据库**: 1个迁移脚本，3个表

## 🔧 开发状态

✅ **完成**: 所有核心功能已实现  
⏳ **待扩展**: 权限请求、邀请系统、可视化编辑器

## 📝 许可证

遵循项目主许可证。
