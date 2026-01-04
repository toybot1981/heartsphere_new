# 第一阶段：Mobile版本整体架构构建计划

## 阶段目标
构建清晰的模块化架构，为Mobile版本的完整开发打好坚实基础。

## 工作量估算
**预计时间**：6-8小时

## 优先级
**高**（基础架构，必须优先完成）

---

## 任务清单

### 任务1：完善目录结构（1小时）

#### 1.1 创建组件子目录
- [ ] 创建`components/modals/`目录
- [ ] 创建`components/ui/`目录（如需要）

#### 1.2 移动Modal组件
- [ ] 移动`MobileUnifiedMailboxModal.tsx`到`components/modals/`
- [ ] 移动`MobileConnectionRequestModal.tsx`到`components/modals/`
- [ ] 移动`MobileWarmMessageModal.tsx`到`components/modals/`
- [ ] 移动`MobileSharedModeBanner.tsx`到`components/modals/`（或components/）
- [ ] 更新所有导入路径

#### 1.3 创建索引文件
- [ ] 创建`components/modals/index.ts`统一导出
- [ ] 更新`components/`目录的导出（如需要）

**验收标准**：
- [ ] 所有Modal组件都在`components/modals/`目录
- [ ] 所有导入路径正确
- [ ] 可以通过统一导出使用

---

### 任务2：重构MobileApp.tsx核心架构（3-4小时）

#### 2.1 创建路由映射配置
- [ ] 创建路由映射表`SCREEN_ROUTES`
- [ ] 定义Screen Props类型接口
- [ ] 创建Screen Props工厂函数（统一传递props）

**代码结构**：
```typescript
// 路由映射表
const SCREEN_ROUTES: Record<GameState['currentScreen'], React.ComponentType<any>> = {
  'profileSetup': MobileProfileSetupScreen,
  'entryPoint': MobileEntryPointScreen,
  // ... 其他Screen
};

// Screen Props类型
interface ScreenPropsBase {
  gameState: GameState;
  dispatch: (action: GameStateAction) => void;
  // 其他通用props
}
```

#### 2.2 提取Handlers模块
- [ ] 创建`handlers/`目录（或使用hooks）
- [ ] 提取所有handler函数到独立模块
- [ ] 组织handler函数（按功能分组）
- [ ] 定义handler函数类型接口

**Handler函数分组**：
- Navigation Handlers（导航相关）
- Data Handlers（数据操作）
- Auth Handlers（认证相关）
- UI Handlers（UI操作）

#### 2.3 简化路由渲染逻辑
- [ ] 移除重复的`if (gameState.currentScreen === 'xxx')`判断
- [ ] 使用路由映射表统一渲染
- [ ] 统一错误处理（未知screen的处理）

**目标代码结构**：
```typescript
const renderCurrentScreen = () => {
  const ScreenComponent = SCREEN_ROUTES[gameState.currentScreen];
  if (!ScreenComponent) {
    return <ErrorScreen screen={gameState.currentScreen} />;
  }
  
  const screenProps = buildScreenProps(gameState, handlers, dispatch);
  return <ScreenComponent {...screenProps} />;
};
```

#### 2.4 优化状态管理
- [ ] 确保所有Screen组件使用`useGameState`
- [ ] 统一状态访问方式
- [ ] 移除冗余的状态传递

**验收标准**：
- [ ] MobileApp.tsx代码行数减少50%以上
- [ ] 路由逻辑清晰，易于维护
- [ ] 所有Screen组件正确渲染
- [ ] 所有功能正常工作

---

### 任务3：统一接口规范（1-2小时）

#### 3.1 定义Screen Props接口
- [ ] 创建`types/mobile.types.ts`文件
- [ ] 定义`MobileScreenProps`基础接口
- [ ] 为每个Screen定义具体的Props接口
- [ ] 导出所有类型定义

**类型定义结构**：
```typescript
// 基础Screen Props
export interface MobileScreenPropsBase {
  gameState: GameState;
  dispatch: (action: GameStateAction) => void;
}

// 特定Screen Props
export interface MobileSceneSelectionScreenProps extends MobileScreenPropsBase {
  currentScenes: WorldScene[];
  onSceneSelect: (sceneId: string) => void;
  // ...
}
```

#### 3.2 创建Handler函数接口
- [ ] 定义Handler函数类型
- [ ] 创建Handler函数组织规范
- [ ] 确保类型安全

#### 3.3 规范状态管理
- [ ] 文档化状态管理规范
- [ ] 创建状态管理使用示例
- [ ] 确保所有Screen遵循规范

**验收标准**：
- [ ] 所有类型定义完整
- [ ] TypeScript类型检查通过
- [ ] 代码提示正常

---

### 任务4：文档完善（1小时）

#### 4.1 架构设计文档
- [x] 完成`MOBILE_MODULAR_ARCHITECTURE.md`
- [ ] 补充架构图
- [ ] 补充模块说明

#### 4.2 开发规范文档
- [ ] 创建`MOBILE_DEVELOPMENT_GUIDELINES.md`
- [ ] 定义代码规范
- [ ] 定义组件开发规范
- [ ] 定义命名规范

#### 4.3 使用指南
- [ ] 创建`MOBILE_COMPONENT_USAGE.md`
- [ ] 编写Screen组件使用示例
- [ ] 编写Handler使用示例
- [ ] 编写状态管理使用示例

**验收标准**：
- [ ] 所有文档完整
- [ ] 文档清晰易懂
- [ ] 包含代码示例

---

## 实施步骤

### Step 1: 准备阶段（30分钟）
1. 备份当前MobileApp.tsx
2. 创建新的目录结构
3. 阅读PC版本的App.tsx，理解架构

### Step 2: 目录重构（1小时）
1. 创建modals目录
2. 移动Modal组件
3. 更新导入路径
4. 测试导入是否正常

### Step 3: 路由重构（2小时）
1. 创建路由映射表
2. 提取handler函数
3. 重构渲染逻辑
4. 测试每个screen是否正常

### Step 4: 接口规范（1.5小时）
1. 定义类型接口
2. 更新所有Screen组件Props
3. 类型检查
4. 修复类型错误

### Step 5: 文档编写（1小时）
1. 完善架构文档
2. 编写开发规范
3. 编写使用指南

### Step 6: 测试和验证（1小时）
1. 功能测试（每个screen）
2. 类型检查
3. 代码审查
4. 修复发现的问题

---

## 可交付成果

### 1. 清晰的目录结构
```
frontend/mobile/
├── screens/              ✅ 已创建
├── components/
│   ├── modals/           ✅ 需创建
│   └── ...               ✅ 已存在
├── handlers/ 或 hooks/    ✅ 需创建（或使用现有hooks）
└── types/                ✅ 需创建（或使用现有types）
```

### 2. 重构后的MobileApp.tsx
- 代码行数减少50%以上
- 路由逻辑清晰
- 易于维护和扩展

### 3. 统一的接口规范
- 类型定义完整
- 类型安全
- 代码提示正常

### 4. 完善的文档
- 架构设计文档
- 开发规范文档
- 使用指南文档

---

## 验收标准

### 功能完整性
- [ ] 所有Screen组件正常渲染
- [ ] 所有功能正常工作
- [ ] 路由切换正常
- [ ] 状态管理正常

### 代码质量
- [ ] TypeScript类型检查通过
- [ ] 无ESLint错误
- [ ] 代码结构清晰
- [ ] 代码可维护性高

### 架构质量
- [ ] 模块划分清晰
- [ ] 依赖关系明确
- [ ] 扩展性良好
- [ ] 符合设计原则

---

## 风险提示

### 风险1：重构过程中功能破坏
- **缓解措施**：充分测试每个步骤，保留备份
- **应对**：如果出现问题，及时回滚

### 风险2：类型定义复杂
- **缓解措施**：参考PC版本的类型定义
- **应对**：逐步定义，先保证功能，再完善类型

### 风险3：Handler函数组织困难
- **缓解措施**：参考PC版本的hooks组织方式
- **应对**：可以先使用现有hooks，后续再优化

---

## 后续阶段预览

### 第二阶段：功能完善
- 完善每个Screen组件功能
- 创建缺失的Modal组件
- 功能测试

### 第三阶段：优化测试
- 性能优化
- UI/UX优化
- 全面测试

---

**文档创建时间**：2025-01-XX
**最后更新时间**：2025-01-XX
**维护者**：开发团队
