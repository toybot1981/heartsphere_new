# 心域传送门系统技术设计

## Context

心域传送门是跨心域连接的核心机制，需要在现有心域共享系统的基础上扩展。系统需要支持：
- 心域主人在场景中放置传送门
- 访问者通过传送门跳转到其他心域
- 科幻风格的视觉效果和动画
- 灵活的权限控制机制

**重要约束**：
- 传送门系统必须作为独立模块实现，不影响现有的心域共享功能
- 复用现有的工具和模式，避免重复开发
- 保持模块间的解耦，通过接口和事件通信

## Goals / Non-Goals

### Goals
- 创造沉浸式的科幻传送体验
- 支持多种传送门类型和视觉风格
- 灵活的权限和连接规则配置
- 流畅的传送动画效果
- 目标心域的信息预览
- **模块化设计**：传送门作为独立模块，可以独立开发、测试、部署
- **复用现有工具**：充分利用现有的代码生成器、权限验证模式、Service架构等
- **最小化影响**：通过功能开关控制，不影响现有功能

### Non-Goals
- 本次不实现传送门之间的复杂路由系统（后续可扩展）
- 不实现传送门的物理碰撞系统（简化交互为点击触发）
- 不实现传送门的能量消耗机制（游戏化元素，后续考虑）

## Decisions

### Decision: 独立的模块化架构
传送门系统作为`heartconnect`包的子模块（`portal`）实现，与现有的`heartconnect`子模块（如`share`、`connection`）同级。通过清晰的接口和事件机制与现有系统集成，但不直接依赖或修改现有代码。

**包结构**：
```
com.heartsphere.heartconnect.portal/
├── entity/          # 传送门实体
├── repository/      # 数据访问层
├── service/         # 业务逻辑层
├── controller/      # API控制器
├── dto/            # 数据传输对象
├── util/           # 工具类（复用现有工具）
└── interceptor/    # 拦截器（可选）
```

**前端模块结构**：
```
frontend/
├── components/
│   └── portal/           # 传送门组件（独立目录）
│       ├── PortalRenderer.tsx      # 3D渲染组件
│       ├── PortalInteraction.tsx   # 交互组件
│       ├── PortalManagement.tsx    # 管理界面
│       └── portalTypes/            # 不同类型传送门
├── services/api/
│   └── portal/           # 传送门API（独立目录）
└── hooks/
    └── usePortal.ts      # 传送门Hook
```

**Alternatives considered**:
- 直接修改heartconnect包：增加耦合，影响现有功能
- 完全独立的服务：过度设计，增加复杂度

### Decision: 复用现有工具和模式
复用现有的基础设施，避免重复开发：
- **扩展ShareCodeGenerator**：添加`generatePortalId()`方法（格式：PT-XXXXXX）
- **复用权限验证模式**：参考`ConnectionRequestService`的权限检查逻辑
- **复用Service架构**：遵循现有的Service层设计模式
- **复用DTO转换模式**：使用类似的Entity到DTO转换方法
- **复用API响应格式**：使用统一的API响应结构

**不直接复用但参考的部分**：
- `HeartSphereShareConfig`的实体设计模式
- `ShareConfigService`的服务层架构
- `ShareConfigController`的Controller层设计

### Decision: 独立的渲染系统
传送门使用独立的WebGL/Three.js渲染系统，与现有的Canvas 2D渲染（ConnectionSpace）完全分离。传送门渲染器作为场景中的一个独立图层，不干扰现有的Canvas渲染。

**实现方式**：
- 使用独立的WebGL Context或Three.js Scene
- 传送门渲染层叠加在现有场景之上
- 通过PortalLayer组件管理，可以独立启用/禁用

**Alternatives considered**:
- 集成到现有Canvas：Canvas 2D无法实现复杂3D效果
- 混合渲染：增加复杂度，难以维护

### Decision: 传送门作为场景中的可视化元素
传送门是场景中的一个特殊对象，具有位置、视觉表现、连接目标等属性。与普通的场景物品不同，传送门是可交互的，点击后会触发传送流程。

**Alternatives considered**:
- 作为场景边缘的出口：不够直观，缺乏科幻感
- 作为菜单选项：破坏了沉浸感

### Decision: 基于WebGL/Three.js的3D视觉效果（独立模块）
使用独立的Three.js渲染器渲染传送门的科幻效果（星门、虫洞、能量场），支持粒子系统、光效、扭曲效果等。Three.js Scene作为独立模块加载，不影响现有的Canvas 2D渲染。

**模块化渲染架构**：
- `PortalRenderer`：核心渲染类，封装Three.js逻辑
- `PortalTypeRenderer`：不同传送门类型的渲染器（策略模式）
  - `StargateRenderer`
  - `WormholeRenderer`
  - `QuantumRenderer`
- `PortalEffectSystem`：粒子系统和特效管理（可独立复用）

**Alternatives considered**:
- 纯CSS动画：效果有限，难以实现复杂视觉
- 视频播放：文件大，不够灵活
- 集成到现有Canvas：技术限制，无法实现3D效果

### Decision: 传送门类型系统
支持三种传送门类型：
1. **星门传送门**：经典科幻风格，圆形星门，能量漩涡效果
2. **虫洞传送门**：扭曲时空效果，黑洞/白洞风格
3. **量子传送门**：粒子重组效果，科技感强

每种类型有不同的视觉表现，但交互逻辑相同。

### Decision: 权限验证在传送时进行（复用现有模式）
权限验证在用户点击传送门并确认传送时进行，而不是在显示传送门时。这样即使无权限访问，用户也能看到传送门的存在（增强探索感）。

**复用现有的权限验证模式**：
- 参考`ConnectionRequestService`的权限检查逻辑
- 创建独立的`PortalPermissionService`，但遵循相同的验证模式
- 权限验证结果使用统一的响应格式

**Alternatives considered**:
- 根据权限隐藏传送门：减少探索性
- 显示但禁用：需要额外的视觉状态
- 直接使用ConnectionRequestService：增加耦合，不符合模块化原则

## 科幻视觉设计

### 星门传送门 (Stargate Portal)
- **外观**：圆形框架，直径2-4米（可配置）
- **视觉效果**：
  - 外圈能量环：缓慢旋转，蓝紫色光晕
  - 中心能量漩涡：深度感，粒子从中心向外扩散
  - 边缘光效：脉冲式发光，频率0.5-2Hz
  - 粒子系统：从传送门中心向外发射能量粒子
  - 环境光影响：传送门周围产生微弱光效
- **动画**：
  - 待机：能量漩涡缓慢旋转
  - 激活：能量漩涡加速，光效增强
  - 传送中：漩涡反转，粒子快速向中心汇聚
  - 冷却：能量逐渐恢复

### 虫洞传送门 (Wormhole Portal)
- **外观**：扭曲的空间区域，椭圆形，边缘扭曲
- **视觉效果**：
  - 空间扭曲：背景通过传送门时产生扭曲效果
  - 中心黑洞：深色中心，周围有光晕
  - 能量环：多层同心圆，不同速度旋转
  - 粒子轨迹：模拟物质被吸入的效果
  - 边缘闪烁：不规则的边缘闪烁效果
- **动画**：
  - 待机：缓慢的空间扭曲
  - 激活：扭曲加剧，能量环加速
  - 传送中：空间强烈扭曲，产生"穿越"感

### 量子传送门 (Quantum Portal)
- **外观**：科技感框架，几何形状（六边形/八边形）
- **视觉效果**：
  - 全息框架：半透明的几何框架
  - 量子粒子：框架内量子粒子随机闪烁
  - 能量网格：框架内显示能量网格
  - 扫描线：垂直扫描线从上到下移动
  - 数据流：框架周围显示数据流效果
- **动画**：
  - 待机：粒子闪烁，扫描线循环
  - 激活：粒子加速，网格增强
  - 传送中：粒子重组，数据流快速流动

### 传送动画序列
1. **靠近阶段**（1秒）：
   - 传送门激活，视觉效果增强
   - 显示目标心域预览信息
   - 播放激活音效

2. **确认阶段**（可选，用户交互）：
   - 显示确认对话框
   - 继续显示预览信息
   - 传送门保持激活状态

3. **传送阶段**（2-3秒）：
   - 场景逐渐淡出
   - 传送门视觉效果达到峰值
   - 粒子/能量汇聚到传送门
   - 播放传送音效
   - 屏幕短暂全黑或显示"穿越"效果

4. **到达阶段**（1秒）：
   - 从目标心域淡入
   - 显示"已到达 [心域名称]"提示
   - 传送门完成动画

## Risks / Trade-offs

### 风险：性能开销
复杂的粒子系统和3D效果可能影响低端设备的性能。

**缓解措施**：
- 提供视觉质量设置（低/中/高）
- 使用性能优化技术（LOD、粒子数量限制、帧率控制）
- 低质量模式使用简化的2D效果
- 传送门渲染器独立管理，可以完全禁用

### 风险：权限复杂性
传送门权限可能与其他权限系统冲突。

**缓解措施**：
- 传送门权限独立于心域共享权限，但遵循相同的验证模式
- 清晰的权限继承和覆盖规则
- 权限冲突时的明确提示
- 通过接口隔离，避免直接依赖

### 风险：动画时长影响体验
传送动画可能让用户感觉等待时间过长。

**缓解措施**：
- 动画可跳过（用户可选）
- 动画时长可配置
- 在动画过程中后台预加载目标心域数据

### 风险：模块耦合
传送门系统可能与现有系统过度耦合，影响独立性。

**缓解措施**：
- **严格的分包**：独立的`heartconnect.portal`包，不直接依赖`heartconnect`包的内部实现
- **接口隔离**：通过接口访问现有功能（如`ShareConfigService`的查询方法），而不是直接注入依赖
- **事件驱动**：使用事件机制通信，而不是直接调用
- **功能开关**：通过配置开关完全禁用传送门功能，不影响现有系统
- **独立数据库表**：传送门使用独立的表，不与现有表产生外键依赖（通过逻辑关联）

### 风险：对现有功能的影响
传送门的实现可能意外影响现有的心域共享功能。

**缓解措施**：
- **功能开关**：默认关闭，需要显式启用
- **独立部署**：可以单独部署传送门模块
- **向后兼容**：现有API完全不受影响
- **测试隔离**：独立的测试套件，不影响现有测试

## Migration Plan

### 实施阶段（模块化、独立部署）

1. **阶段一**：基础设施准备
   - 创建独立包结构 `heartconnect.portal`
   - 扩展工具类（PortalCodeGenerator，复用ShareCodeGenerator模式）
   - 数据库迁移，添加传送门相关表（独立表，无外键依赖）

2. **阶段二**：后端核心模块
   - Entity、Repository层（独立包）
   - Service层（PortalService，参考ShareConfigService模式但独立实现）
   - Controller层（独立API端点 `/api/portal/...`）

3. **阶段三**：前端渲染模块
   - 创建独立的PortalRenderer模块
   - 实现Three.js渲染系统（独立Scene）
   - 实现不同类型传送门的渲染器（策略模式）

4. **阶段四**：前端交互模块
   - PortalInteraction组件（独立组件）
   - 传送门管理界面（独立页面/模态框）

5. **阶段五**：集成和优化
   - 将传送门渲染器集成到场景系统（通过PortalLayer）
   - 传送动画和交互完善
   - 性能优化和测试

6. **阶段六**：测试和部署
   - 独立测试套件
   - 功能开关配置
   - 灰度发布

### 复用现有资源清单

**后端复用**：
- `ShareCodeGenerator` 模式 → 扩展为 `PortalCodeGenerator`
- `ShareConfigService` 架构模式 → 参考实现 `PortalService`
- 权限验证逻辑模式 → 参考实现 `PortalPermissionService`
- DTO转换模式 → 复用转换方法结构
- API响应格式 → 复用统一响应结构

**前端复用**：
- API调用模式（`services/api/` 结构）
- 状态管理模式（Hooks模式）
- 组件架构模式（Props、State管理）

**不直接复用但参考**：
- `ConnectionSpace` 的Canvas渲染（架构参考，但技术不同）
- `ShareConfigController` 的API设计（参考RESTful设计）

### 回滚计划

如果出现问题，可以通过以下方式完全回滚，不影响现有功能：

1. **功能开关**：在配置文件中禁用传送门功能
   ```properties
   heartconnect.portal.enabled=false
   ```

2. **前端条件渲染**：通过功能开关控制组件渲染
   ```typescript
   {features.portalEnabled && <PortalLayer />}
   ```

3. **数据库保留**：传送门表保留但不使用，不影响现有表

4. **API降级**：传送门API返回"功能未启用"错误，不影响其他API

5. **代码隔离**：传送门代码在独立包中，可以直接注释导入或移除依赖

## 模块化设计原则

### 1. 包结构和依赖管理

**后端模块化**：
```java
// 独立包，不直接依赖heartconnect包
package com.heartsphere.heartconnect.portal;

// 通过接口访问现有功能，不直接注入
public interface ShareConfigQueryService {
    ShareConfigDTO getShareConfigByCode(String shareCode);
    boolean isUserConnected(Long userId, Long shareConfigId);
}

// PortalService使用接口，而不是直接注入ShareConfigService
@Service
public class PortalService {
    @Autowired
    private ShareConfigQueryService shareConfigQueryService; // 接口，由现有Service实现
    // ...
}
```

**前端模块化**：
```typescript
// 独立的传送门模块
// frontend/components/portal/
export class PortalRenderer {
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    
    // 独立的渲染上下文，不影响现有Canvas
    init(container: HTMLElement) {
        // 创建独立的WebGL Context
    }
}

// 通过Props和Events通信，不直接访问全局状态
<PortalLayer 
    portals={portals}
    onPortalClick={handlePortalClick}
    onTeleport={handleTeleport}
/>
```

### 2. 功能开关和条件加载

**后端配置**：
```properties
# application.yml
heartconnect:
  portal:
    enabled: ${PORTAL_ENABLED:false}  # 默认关闭
    features:
      stargate: true
      wormhole: true
      quantum: true
```

**前端条件加载**：
```typescript
// 功能开关配置
const features = {
  portal: config.heartconnect?.portal?.enabled ?? false
};

// 条件渲染
{features.portal && (
  <PortalLayer />
)}
```

### 3. 接口隔离和事件通信

**后端接口隔离**：
```java
// 独立子模块，作为heartconnect的子包
package com.heartsphere.heartconnect.portal;

// 通过接口访问现有功能，不直接注入
public interface ShareConfigQueryService {
    ShareConfigDTO getShareConfigByCode(String shareCode);
    boolean isUserConnected(Long userId, Long shareConfigId);
}

// PortalService使用接口，而不是直接注入ShareConfigService
@Service
public class PortalService {
    @Autowired
    private ShareConfigQueryService shareConfigQueryService; // 接口，由现有Service实现
    // ...
}
```

**前端事件通信**：
- 使用CustomEvent进行模块间通信
- 传送门点击事件 → 触发传送流程
- 不直接修改全局状态，通过事件传递数据

## Open Questions

- 是否支持传送门的"双向"连接（自动在目标心域创建反向传送门）？
- 是否需要传送门的"冷却时间"机制（防止频繁传送）？
- 传送门是否需要消耗某种资源（能量、积分等）？
- PortalService如何访问ShareConfigService的功能？（通过接口还是直接注入？推荐通过接口）
