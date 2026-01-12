# 传送门组件模块

## 依赖安装

传送门3D渲染系统需要Three.js库。请运行以下命令安装：

```bash
npm install three
npm install --save-dev @types/three
```

## 组件结构

```
components/portal/
├── types.ts              # 类型定义
├── PortalRenderer.ts     # 核心渲染器类
├── portalTypes/          # 不同类型传送门渲染器
│   ├── StargateRenderer.ts
│   ├── WormholeRenderer.ts
│   └── QuantumRenderer.ts
├── PortalComponent.tsx   # React组件封装
├── PortalLayer.tsx       # 传送门渲染层组件
└── README.md
```

## 使用方式

### 基本使用

```typescript
import { PortalRenderer } from './components/portal/PortalRenderer';

const renderer = new PortalRenderer({ quality: 'medium' });
await renderer.init(containerElement);

// 创建传送门
await renderer.createPortal(1, {
  portalType: 'stargate',
  position: { x: 0, y: 0, z: 0 },
  size: 3.0,
  state: PortalAnimationState.IDLE,
});

// 更新状态
renderer.updatePortalState(1, PortalAnimationState.ACTIVATED);

// 清理
renderer.dispose();
```

## 性能优化

- 根据设备性能自动调整质量设置
- 粒子数量限制
- 帧率控制
- LOD系统（后续实现）
