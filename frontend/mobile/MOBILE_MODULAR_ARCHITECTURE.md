# Mobile版本模块化架构规划

## 目标
参照PC版本的模块化结构，构建Mobile版本的完整模块化架构，实现全覆盖和清晰的代码组织。

## 整体架构设计

### 目录结构

```
frontend/mobile/
├── mobile.tsx                    # 入口文件
├── MobileApp.tsx                 # 主应用组件（路由控制器）
│
├── screens/                      # 页面Screen组件（核心模块）
│   ├── index.ts                  # 统一导出
│   ├── MobileProfileSetupScreen.tsx
│   ├── MobileEntryPointScreen.tsx
│   ├── MobileRealWorldScreen.tsx
│   ├── MobileSceneSelectionScreen.tsx
│   ├── MobileCharacterSelectionScreen.tsx
│   ├── MobileChatWindowScreen.tsx
│   ├── MobileScenarioBuilderScreen.tsx
│   ├── MobileConnectionSpaceScreen.tsx
│   ├── MobileProfileScreen.tsx
│   ├── MobileSharedHeartSphereScreen.tsx
│   ├── MobileSharedCharacterSelectionScreen.tsx
│   └── MobileSharedChatWindowScreen.tsx
│
├── components/                   # 移动端专用组件
│   ├── MobileBottomNav.tsx       # 底部导航栏
│   ├── MobileStyleGuide.ts       # 样式规范
│   ├── MobileTouchableButton.tsx # 触摸按钮
│   ├── MobileSafeAreaView.tsx    # 安全区域容器
│   ├── MobileSmoothScroll.tsx    # 平滑滚动
│   ├── MobileLoadingSpinner.tsx  # 加载指示器
│   ├── MobileEmptyState.tsx      # 空状态
│   ├── MobileErrorToast.tsx      # 错误提示
│   └── modals/                   # 移动端专用Modal组件（子目录）
│       ├── MobileUnifiedMailboxModal.tsx
│       ├── MobileWelcomeOverlay.tsx
│       ├── MobileRecycleBinModal.tsx
│       ├── MobileMembershipModal.tsx
│       ├── MobileQuickConnectModal.tsx
│       ├── MobileInitializationWizard.tsx
│       ├── MobileDebugConsole.tsx
│       ├── MobileConnectionRequestModal.tsx
│       ├── MobileWarmMessageModal.tsx
│       └── MobileSharedModeBanner.tsx
│
├── hooks/                        # 移动端专用Hooks（如果需要）
│   └── useMobileNavigation.ts    # 移动端导航Hook（示例）
│
├── utils/                        # 移动端工具函数（如果需要）
│   └── mobileHelpers.ts          # 移动端辅助函数
│
└── docs/                         # 文档
    ├── MOBILE_MODULAR_ARCHITECTURE.md  # 本文档
    └── ...
```

## 模块划分

### 1. 核心Screen模块（screens/）

#### 1.1 认证和入口模块
- **MobileProfileSetupScreen** - 欢迎/登录页面
- **MobileEntryPointScreen** - 入口点/主页

#### 1.2 核心功能模块
- **MobileRealWorldScreen** - 现实世界/日记
- **MobileSceneSelectionScreen** - 场景选择
- **MobileCharacterSelectionScreen** - 角色选择
- **MobileChatWindowScreen** - 聊天窗口

#### 1.3 创建和编辑模块
- **MobileScenarioBuilderScreen** - 剧本构建器
- **MobileProfileScreen** - 用户资料

#### 1.4 社交和连接模块
- **MobileConnectionSpaceScreen** - 连接空间

#### 1.5 共享模式模块
- **MobileSharedHeartSphereScreen** - 共享心域选择
- **MobileSharedCharacterSelectionScreen** - 共享角色选择
- **MobileSharedChatWindowScreen** - 共享聊天窗口

### 2. 组件模块（components/）

#### 2.1 基础组件
- **MobileBottomNav** - 底部导航栏
- **MobileTouchableButton** - 触摸按钮
- **MobileSafeAreaView** - 安全区域容器
- **MobileSmoothScroll** - 平滑滚动容器

#### 2.2 反馈组件
- **MobileLoadingSpinner** - 加载指示器
- **MobileEmptyState** - 空状态
- **MobileErrorToast** - 错误提示

#### 2.3 样式规范
- **MobileStyleGuide** - 样式规范常量

#### 2.4 Modal组件（components/modals/）
所有移动端专用的Modal组件，包括：
- MobileUnifiedMailboxModal
- MobileWelcomeOverlay
- MobileRecycleBinModal
- MobileMembershipModal
- MobileQuickConnectModal
- MobileInitializationWizard
- MobileDebugConsole
- MobileConnectionRequestModal
- MobileWarmMessageModal
- MobileSharedModeBanner

### 3. 业务逻辑复用

#### 3.1 完全复用（不创建Mobile版本）
- ✅ **Hooks** - 所有业务逻辑Hooks（useEraHandlers, useAuthHandlers等）
- ✅ **API** - 所有API调用（authApi, journalApi等）
- ✅ **Services** - 所有服务（aiService, storageService, syncService等）
- ✅ **Utils** - 所有工具函数（dialog, sceneMapping等）
- ✅ **Types** - 所有类型定义（GameState, Character等）

### 4. 路由管理架构

#### 4.1 路由映射表
```typescript
const SCREEN_ROUTES: Record<GameState['currentScreen'], React.ComponentType<any>> = {
  'profileSetup': MobileProfileSetupScreen,
  'entryPoint': MobileEntryPointScreen,
  'realWorld': MobileRealWorldScreen,
  'sceneSelection': MobileSceneSelectionScreen,
  'characterSelection': MobileCharacterSelectionScreen,
  'chat': MobileChatWindowScreen,
  'builder': MobileScenarioBuilderScreen,
  'connectionSpace': MobileConnectionSpaceScreen,
  'mobileProfile': MobileProfileScreen,
  'sharedHeartSphere': MobileSharedHeartSphereScreen,
  'sharedCharacterSelection': MobileSharedCharacterSelectionScreen,
  'sharedChat': MobileSharedChatWindowScreen,
};
```

#### 4.2 路由渲染逻辑
```typescript
const renderCurrentScreen = () => {
  const ScreenComponent = SCREEN_ROUTES[gameState.currentScreen];
  if (!ScreenComponent) {
    return <div>Unknown screen: {gameState.currentScreen}</div>;
  }
  return <ScreenComponent {...screenProps} />;
};
```

## PC版本与Mobile版本对比

### PC版本结构
```
frontend/
├── App.tsx                       # 主应用，包含路由逻辑
├── components/
│   ├── screens/                  # Screen组件
│   ├── EntryPoint.tsx            # 入口点（非Screen）
│   ├── RealWorldScreen.tsx       # 现实世界（非Screen）
│   ├── ChatWindow.tsx            # 聊天窗口（非Screen）
│   ├── ScenarioBuilder.tsx       # 剧本构建器（非Screen）
│   ├── ConnectionSpace.tsx       # 连接空间（非Screen）
│   └── UserProfile.tsx           # 用户资料（非Screen）
```

### Mobile版本结构（目标）
```
frontend/mobile/
├── MobileApp.tsx                 # 主应用，包含路由逻辑
├── screens/                      # 所有Screen组件统一管理
│   └── Mobile[功能]Screen.tsx    # 统一的命名规范
└── components/                   # 移动端专用组件
    └── modals/                   # Modal组件子目录
```

## 第一阶段：构建整体架构

### 目标
建立清晰的模块化架构，为后续开发打好基础。

### 任务清单

#### 1. 目录结构重构 ✅（部分完成）
- [x] 创建`screens/`目录
- [x] 创建`components/`目录
- [ ] 创建`components/modals/`子目录
- [ ] 创建`hooks/`目录（如需要）
- [ ] 创建`utils/`目录（如需要）

#### 2. Screen组件组织 ✅（已完成）
- [x] 将所有Screen组件移动到`screens/`目录
- [x] 统一命名规范：`Mobile[功能]Screen.tsx`
- [x] 创建`index.ts`统一导出
- [ ] 检查所有Screen组件的导入路径
- [ ] 确保所有Screen组件导出正确

#### 3. MobileApp架构重构（重点）
- [ ] **提取路由映射表**：创建路由配置对象
- [ ] **简化路由渲染逻辑**：使用映射表渲染
- [ ] **统一Screen Props接口**：定义标准的Screen Props类型
- [ ] **提取Handlers逻辑**：将所有handler函数组织到统一的模块
- [ ] **优化状态管理**：确保所有Screen组件使用useGameState

#### 4. 组件模块化
- [ ] 将Modal组件移动到`components/modals/`目录
- [ ] 创建基础组件索引文件
- [ ] 创建样式规范使用指南

#### 5. 文档和规范
- [ ] 创建架构设计文档（本文档）
- [ ] 创建开发规范文档
- [ ] 创建组件使用指南

### 第一阶段交付物

1. ✅ **清晰的目录结构**
   - screens/目录完整
   - components/目录组织清晰
   - modals/子目录创建

2. **MobileApp.tsx重构**
   - 路由映射表
   - 简化的渲染逻辑
   - 清晰的代码组织

3. **统一的接口规范**
   - Screen Props类型定义
   - Handler函数组织
   - 状态管理规范

4. **文档完善**
   - 架构设计文档
   - 开发规范
   - 使用指南

## 第二阶段：功能完善（后续）

### 目标
确保所有Screen组件功能完整，与PC版本功能一致。

### 主要任务
1. 完善每个Screen组件的功能
2. 创建缺失的Modal组件
3. 优化移动端体验
4. 测试所有功能

## 第三阶段：优化和测试（后续）

### 目标
性能优化、体验优化和全面测试。

### 主要任务
1. 性能优化
2. UI/UX优化
3. 兼容性测试
4. 功能测试

## 架构原则

### 1. 模块独立性
- 每个Screen组件独立，职责单一
- 组件之间通过Props和事件通信
- 不直接依赖其他Screen组件

### 2. 代码复用
- 业务逻辑完全复用PC版本的Hooks和Services
- UI组件独立，但可以复用PC版本的逻辑
- 工具函数和类型定义完全复用

### 3. 清晰的依赖关系
```
MobileApp.tsx
    ↓
screens/ (Screen组件)
    ↓
components/ (基础组件)
    ↓
hooks/ (业务逻辑Hooks - 复用PC版本)
    ↓
services/ (服务层 - 复用PC版本)
    ↓
utils/ (工具函数 - 复用PC版本)
```

### 4. 统一的命名规范
- Screen组件：`Mobile[功能]Screen.tsx`
- Modal组件：`Mobile[功能]Modal.tsx`
- 基础组件：`Mobile[功能].tsx`
- Hooks：`use[功能]`（如果创建Mobile专用）

## 实施步骤

### 第一阶段：整体架构构建（当前阶段）

#### Step 1: 完善目录结构
1. 创建`components/modals/`目录
2. 移动所有Modal组件到modals目录
3. 更新导入路径

#### Step 2: 重构MobileApp.tsx
1. 创建路由映射配置
2. 提取所有handler函数
3. 简化路由渲染逻辑
4. 统一Screen组件Props接口

#### Step 3: 统一接口规范
1. 定义Screen Props类型
2. 创建Handler函数模块
3. 规范状态管理使用

#### Step 4: 文档完善
1. 完成架构设计文档
2. 创建开发规范
3. 编写使用指南

### 第二阶段：功能完善（后续）
- 完善每个Screen组件
- 创建缺失的Modal组件
- 功能测试

### 第三阶段：优化测试（后续）
- 性能优化
- UI/UX优化
- 全面测试

---

**文档创建时间**：2025-01-XX
**最后更新时间**：2025-01-XX
**维护者**：开发团队
