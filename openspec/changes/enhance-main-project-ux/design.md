# Design: 增强主项目用户体验功能

## 架构设计

### 1. 插件隐藏功能

#### 组件结构
```
ScenePluginContainer
├── 隐藏按钮（插件上方）
├── 插件内容区域
└── 右侧边栏隐藏区域（较窄，可点击恢复）
```

#### 状态管理
- `isHidden`: boolean - 插件是否隐藏
- 隐藏状态可保存到本地存储或后端（用户偏好）

#### UI/UX 设计
- 隐藏按钮：位于插件容器上方，使用图标按钮
- 隐藏动画：平滑过渡到右侧边栏
- 恢复区域：右侧边栏显示较窄的插件标识，点击恢复
- 移动端：适配触摸操作，按钮大小适合点击

### 2. 图片质量分级系统

#### 质量等级定义
```typescript
type ImageQuality = 'thumbnail' | 'medium' | 'high' | 'original';

interface ImageVariants {
  thumbnail?: string;  // 200×200 或更小
  medium?: string;     // 800×600
  high?: string;       // 1920×1080
  original?: string;   // 原图
}
```

#### 场景映射规则
- **缩略图场景**：列表、卡片、头像 → `thumbnail`
- **中等质量场景**：详情页、对话框、移动端背景 → `medium`
- **高质量场景**：PC 背景、大图展示 → `high`
- **原图场景**：特殊需求（不推荐） → `original`

#### 回退策略
1. 优先使用目标质量等级
2. 如果不存在，按优先级回退：`high` → `medium` → `thumbnail` → `original`
3. 如果都不存在，使用原始 URL

### 3. 传送门访问优化

#### UI 设计
```
SharedHeartSphereScreen
└── 右上角传送按钮
    └── 点击后弹出传送门选择弹窗
        ├── 共享心域列表（可搜索）
        ├── 传送效果选择器
        └── 确认按钮
```

#### 数据流
1. 用户点击传送按钮
2. 获取用户可访问的共享心域列表
3. 显示选择弹窗
4. 用户选择目标心域和效果
5. 执行传送操作

#### 兼容性
- 保留现有传送门数据（不删除）
- 仅改变访问方式（从场景内改为按钮访问）
- 支持现有传送门配置迁移

### 4. 场景风格系统重构

#### 数据模型
```java
@Entity
public class Era {
    // ... 现有字段
    @Column(name = "style")
    private String style; // 'realistic', 'anime', 'cyberpunk', etc.
}
```

#### 风格影响范围
1. **场景图片生成**：使用场景风格作为生成参数
2. **角色图片生成**：使用场景风格作为生成参数
3. **角色属性设定**：根据风格调整角色属性（如科技风格的角色更偏向技术属性）

#### 迁移策略
- 现有场景：设置默认风格为 `realistic`
- 用户偏好：从 EntryPoint 的用户偏好迁移到场景风格（如果用户有偏好）

### 5. Warm 提示语优化

#### 移除位置
- `ChatWindow` 组件上方
- `SharedChatWindow` 组件上方

#### 保留位置
- 每个页面只保留一个 warm 提示语（通常在页面主要内容区域）

## 技术实现细节

### 插件隐藏功能

#### 实现方案
```typescript
// ScenePluginContainer.tsx
const [isHidden, setIsHidden] = useState(false);

const handleHide = () => {
  setIsHidden(true);
  // 保存状态到本地存储或后端
};

const handleRestore = () => {
  setIsHidden(false);
  // 恢复状态
};
```

#### 样式实现
- 使用 CSS transition 实现平滑动画
- 隐藏时：`transform: translateX(100%)` 或移动到右侧边栏
- 恢复时：`transform: translateX(0)`

### 图片质量分级

#### 工具函数
```typescript
// imageResolution.ts
export function getImageUrl(
  variants: ImageVariants,
  quality: ImageQuality,
  scene: ImageScene
): string {
  // 根据场景和质量等级选择图片
  // 实现回退策略
}
```

#### 组件使用
```typescript
// LazyImage.tsx
<LazyImage
  src={imageUrl}
  quality="medium"
  scene="detail"
  // ...
/>
```

### 传送门访问

#### 组件结构
```typescript
// PortalSelectionModal.tsx
interface PortalSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (targetShareCode: string, effect: PortalEffect) => void;
}
```

#### API 调用
- 获取共享心域列表：`heartConnectApi.getPublicSharedHeartSpheres()`
- 执行传送：`portalApi.executeTeleportation(portalId, skipAnimation)`

### 场景风格

#### 后端实现
```java
// Era.java
@Column(name = "style")
private String style = "realistic"; // 默认值

// EraService.java
public Era createEra(CreateEraRequest request) {
    Era era = new Era();
    era.setStyle(request.getStyle() != null ? request.getStyle() : "realistic");
    // ...
}
```

#### 前端实现
```typescript
// EraConstructorModal.tsx
const [style, setStyle] = useState<WorldStyle>('realistic');

// 在创建场景时保存风格
const handleCreate = () => {
  createEra({
    // ... 其他字段
    style: style,
  });
};
```

## 兼容性和迁移

### 数据迁移

1. **传送门数据**：保留现有传送门配置，仅改变访问方式
2. **场景风格**：为现有场景设置默认风格 `realistic`
3. **用户偏好**：从 EntryPoint 的用户偏好迁移到场景风格（可选）

### 向后兼容

- 所有改动都保持向后兼容
- 现有功能不受影响
- 新功能可逐步启用

## 性能考虑

### 图片加载优化
- 使用懒加载和渐进式加载
- 根据视口大小选择合适质量
- 实现图片缓存策略

### 插件隐藏优化
- 隐藏的插件不参与渲染（使用 CSS `display: none` 或移除 DOM）
- 减少不必要的重渲染

### 传送门优化
- 共享心域列表缓存
- 延迟加载传送门数据

## 测试策略

### 单元测试
- 插件隐藏/恢复逻辑
- 图片质量选择逻辑
- 场景风格保存和加载

### 集成测试
- 传送门选择流程
- 场景创建流程
- 图片加载流程

### E2E 测试
- 完整用户流程
- PC 和移动端测试
- 不同浏览器测试
