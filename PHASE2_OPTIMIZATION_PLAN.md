# Phase 2: App.tsx 深度优化计划

## 📊 当前状态分析

### 文件规模
- **总行数**: 4440 行
- **主要问题**: 
  - 大量 Handler 函数（~2000 行）
  - 复杂的数据加载逻辑（~800 行）
  - 渲染逻辑分散（~1000 行）
  - 数据转换逻辑重复（~400 行）

### 已完成的优化
✅ 状态管理重构（使用 `useGameState` 和 `dispatch`）
✅ API 模块拆分（场景、角色、剧本、主线剧情）
✅ 基础 Hooks（useScenes, useCharacters, useScripts, useChat, useSettings）

---

## 🎯 Phase 2 优化目标

**目标**: 将 `App.tsx` 从 4440 行减少到 **< 1000 行**

### 优化策略

#### 1. **提取 Handler Hooks** (预计减少 ~2000 行)

创建专门的 Handler Hooks，封装所有业务逻辑：

```
frontend/hooks/
├── useEraHandlers.ts          # 场景相关操作
├── useCharacterHandlers.ts    # 角色相关操作
├── useScriptHandlers.ts       # 剧本相关操作
├── useJournalHandlers.ts      # 日记相关操作
├── useMainStoryHandlers.ts    # 主线剧情相关操作
└── useNavigationHandlers.ts   # 导航相关操作
```

**需要提取的函数**:
- `handleSaveEra` → `useEraHandlers`
- `handleDeleteEra` → `useEraHandlers`
- `handleSaveCharacter` → `useCharacterHandlers`
- `handleDeleteCharacter` → `useCharacterHandlers`
- `handleSaveScenario` → `useScriptHandlers`
- `handleDeleteScenario` → `useScriptHandlers`
- `handleEditScript` → `useScriptHandlers`
- `handlePlayScenario` → `useScriptHandlers`
- `handleAddJournalEntry` → `useJournalHandlers`
- `handleUpdateJournalEntry` → `useJournalHandlers`
- `handleDeleteJournalEntry` → `useJournalHandlers`
- `handleEditMainStory` → `useMainStoryHandlers`
- `handleDeleteMainStory` → `useMainStoryHandlers`
- `handleSceneSelect` → `useNavigationHandlers`
- `handleCharacterSelect` → `useNavigationHandlers`
- `handleChatBack` → `useNavigationHandlers`

#### 2. **提取数据加载逻辑** (预计减少 ~800 行)

创建 `useDataLoader` Hook，统一管理数据加载：

```
frontend/hooks/
└── useDataLoader.ts
```

**需要提取的逻辑**:
- `loadAndSyncWorldData` (403-637 行)
- `handleLoginSuccess` 中的数据加载部分 (670-1118 行)
- `checkAuth` 中的数据加载部分 (1134-1333 行)
- 初始化向导完成后的数据同步 (3190-3344 行)

#### 3. **提取数据转换工具** (预计减少 ~400 行)

创建数据转换工具函数，统一处理后端数据到前端格式的转换：

```
frontend/utils/
└── dataTransformers.ts
```

**需要提取的函数**:
- `convertErasToWorldScenes` - 将后端 Era 数据转换为 WorldScene
- `convertCharactersToFrontend` - 将后端 Character 数据转换为前端格式
- `convertScriptsToScenarios` - 将后端 Script 数据转换为 CustomScenario
- `convertMainStoryToCharacter` - 将后端 MainStory 数据转换为 Character

#### 4. **拆分 Screen 组件** (预计减少 ~1000 行)

将不同 screen 的渲染逻辑提取到独立的 Screen 组件：

```
frontend/screens/
├── SceneSelectionScreen.tsx
├── CharacterSelectionScreen.tsx
├── ChatScreen.tsx (已存在 ChatWindow，可能需要包装)
└── ProfileSetupScreen.tsx
```

**需要提取的渲染逻辑**:
- `gameState.currentScreen === 'sceneSelection'` (3535-3631 行)
- `gameState.currentScreen === 'characterSelection'` (3633-4124 行)
- `gameState.currentScreen === 'profileSetup'` (3360-3385 行)

#### 5. **提取工具函数** (预计减少 ~200 行)

将通用工具函数提取到独立文件：

```
frontend/utils/
├── toast.ts              # showSyncErrorToast
├── deviceDetection.ts    # checkIsMobile
└── scenarioHelpers.ts    # 剧本相关的辅助函数
```

---

## 📋 实施步骤

### Step 1: 提取数据转换工具 (优先级: 高)
**原因**: 这是最基础的工具，其他优化都依赖它

1. 创建 `frontend/utils/dataTransformers.ts`
2. 提取所有数据转换逻辑
3. 在 `App.tsx` 中使用新的转换函数

**预计时间**: 1-2 小时
**预计减少**: ~400 行

### Step 2: 提取 Handler Hooks (优先级: 高)
**原因**: Handler 函数占用最多代码行数

1. 创建 Handler Hooks 文件
2. 逐个提取 Handler 函数
3. 在 `App.tsx` 中使用新的 Hooks

**实施顺序**:
1. `useEraHandlers.ts` (最简单)
2. `useJournalHandlers.ts` (相对独立)
3. `useCharacterHandlers.ts` (较复杂)
4. `useScriptHandlers.ts` (最复杂)
5. `useMainStoryHandlers.ts`
6. `useNavigationHandlers.ts`

**预计时间**: 4-6 小时
**预计减少**: ~2000 行

### Step 3: 提取数据加载逻辑 (优先级: 中)
**原因**: 逻辑复杂，但相对独立

1. 创建 `useDataLoader.ts`
2. 提取所有数据加载和同步逻辑
3. 统一错误处理和加载状态管理

**预计时间**: 2-3 小时
**预计减少**: ~800 行

### Step 4: 拆分 Screen 组件 (优先级: 中)
**原因**: 减少渲染逻辑，但需要仔细处理 props

1. 创建 Screen 组件目录
2. 逐个提取 Screen 渲染逻辑
3. 确保 props 传递正确

**预计时间**: 3-4 小时
**预计减少**: ~1000 行

### Step 5: 提取工具函数 (优先级: 低)
**原因**: 代码量小，但可以提升代码质量

1. 提取 `showSyncErrorToast` → `utils/toast.ts`
2. 提取 `checkIsMobile` → `utils/deviceDetection.ts`
3. 提取剧本相关辅助函数 → `utils/scenarioHelpers.ts`

**预计时间**: 1 小时
**预计减少**: ~200 行

---

## 📈 预期效果

### 代码行数变化
- **当前**: 4440 行
- **Step 1 后**: ~4040 行 (-400)
- **Step 2 后**: ~2040 行 (-2000)
- **Step 3 后**: ~1240 行 (-800)
- **Step 4 后**: ~240 行 (-1000)
- **Step 5 后**: ~40 行 (-200)

**最终目标**: `App.tsx` 仅保留核心路由和组件组合逻辑

### 代码质量提升
- ✅ 单一职责原则：每个 Hook 只负责一个领域
- ✅ 可测试性：Handler 函数可以独立测试
- ✅ 可维护性：修改某个功能只需修改对应的 Hook
- ✅ 可复用性：Handler Hooks 可以在其他组件中复用

---

## 🚀 开始优化

建议从 **Step 1: 提取数据转换工具** 开始，因为：
1. 风险最低
2. 为后续优化打好基础
3. 可以立即看到效果

准备好后，我们可以开始实施！

