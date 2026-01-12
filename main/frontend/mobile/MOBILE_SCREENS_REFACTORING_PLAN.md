# Mobile版本Screens模块化重构计划

## 目标
参照PC版本的模块化结构，将Mobile版本的所有页面组件统一组织到`screens`目录下，实现全覆盖和模块化。

## 已完成的工作

### ✅ 创建screens目录结构
- 创建了 `frontend/mobile/screens/` 目录
- 创建了 `index.ts` 统一导出文件

### ✅ 已创建的Screen组件

1. **MobileProfileSetupScreen.tsx** ✅
   - 欢迎/登录页面
   - 从MobileApp中提取

2. **MobileRealWorldScreen.tsx** ✅
   - 现实世界/日记页面
   - 从MobileRealWorld.tsx移动并修复导入路径

3. **MobileSceneSelectionScreen.tsx** ✅
   - 场景选择页面
   - 从MobileSceneSelection.tsx移动并修复导入路径

4. **MobileCharacterSelectionScreen.tsx** ✅
   - 角色选择页面
   - 从MobileCharacterSelection.tsx移动并修复导入路径

5. **MobileProfileScreen.tsx** ✅
   - 用户资料页面
   - 从MobileProfile.tsx移动并修复导入路径

6. **MobileScenarioBuilderScreen.tsx** ✅
   - 剧本构建器页面
   - 从MobileScenarioBuilder.tsx移动并修复导入路径

7. **MobileEntryPointScreen.tsx** ✅
   - 入口点/主页
   - 新创建，参照PC版本的EntryPoint

8. **MobileChatWindowScreen.tsx** ✅
   - 聊天窗口
   - 新创建，复用PC版本的ChatWindow

9. **MobileConnectionSpaceScreen.tsx** ✅
   - 连接空间
   - 新创建，复用PC版本的ConnectionSpace

10. **MobileSharedHeartSphereScreen.tsx** ✅
    - 共享心域选择
    - 新创建，参照PC版本的SharedHeartSphereScreen

11. **MobileSharedCharacterSelectionScreen.tsx** ✅
    - 共享角色选择
    - 新创建，参照PC版本的SharedCharacterSelectionScreen

12. **MobileSharedChatWindowScreen.tsx** ✅
    - 共享聊天窗口
    - 新创建，复用PC版本的SharedChatWindow

## 待完成的工作

### 第一步：更新MobileApp.tsx使用screens组件

需要将MobileApp.tsx中的页面渲染逻辑改为使用screens目录下的组件：

```typescript
// 当前方式（需要替换）
import { MobileRealWorld } from './MobileRealWorld';
import { MobileSceneSelection } from './MobileSceneSelection';
// ...

// 改为（使用screens）
import {
  MobileProfileSetupScreen,
  MobileEntryPointScreen,
  MobileRealWorldScreen,
  MobileSceneSelectionScreen,
  MobileCharacterSelectionScreen,
  MobileProfileScreen,
  MobileScenarioBuilderScreen,
  MobileChatWindowScreen,
  MobileConnectionSpaceScreen,
  MobileSharedHeartSphereScreen,
  MobileSharedCharacterSelectionScreen,
  MobileSharedChatWindowScreen,
} from './screens';
```

### 第二步：重构MobileApp.tsx的渲染逻辑

参照PC版本的App.tsx结构，按screen类型组织渲染：

```typescript
// 当前结构（需要重构）
{gameState.currentScreen === 'realWorld' && (
  <MobileRealWorld ... />
)}

// 改为（使用screens）
{gameState.currentScreen === 'profileSetup' && (
  <MobileProfileSetupScreen
    onGuestEnter={handleGuestEnter}
    onLogin={() => setShowLoginModal(true)}
  />
)}

{gameState.currentScreen === 'entryPoint' && (
  <MobileEntryPointScreen
    onNavigate={handleNavigate}
    onOpenSettings={() => setShowSettings(true)}
    nickname={gameState.userProfile?.nickname || ''}
    avatarUrl={gameState.userProfile?.avatarUrl}
    currentStyle={gameState.worldStyle}
    onStyleChange={handleStyleChange}
    onLoginSuccess={handleLoginSuccess}
    isGuest={gameState.userProfile?.isGuest || !gameState.userProfile}
    onGuestEnter={handleGuestEnter}
  />
)}

{gameState.currentScreen === 'realWorld' && (
  <MobileRealWorldScreen
    entries={gameState.journalEntries}
    onAddEntry={handleAddEntry}
    onUpdateEntry={handleUpdateEntry}
    onDeleteEntry={handleDeleteEntry}
    onExplore={handleExplore}
    onConsultMirror={handleConsultMirror}
    autoGenerateImage={gameState.settings.autoGenerateJournalImages}
    onSwitchToPC={onSwitchToPC}
    userName={gameState.userProfile?.nickname}
  />
)}

// ... 其他screen
```

### 第三步：处理共享模式路由

在MobileApp.tsx中添加共享模式的screen处理：

```typescript
// 共享模式路由
{isSharedModeActive && gameState.currentScreen === 'sharedHeartSphere' && (
  <MobileSharedHeartSphereScreen
    onSceneSelect={handleSharedSceneSelect}
    onBack={handleBackFromShared}
    dispatch={dispatch}
  />
)}

{isSharedModeActive && gameState.currentScreen === 'sharedCharacterSelection' && currentScene && (
  <MobileSharedCharacterSelectionScreen
    currentScene={currentScene}
    onBack={handleBackFromSharedCharacter}
    onCharacterSelect={handleSharedCharacterSelect}
  />
)}

{isSharedModeActive && gameState.currentScreen === 'sharedChat' && activeCharacter && (
  <MobileSharedChatWindowScreen
    character={activeCharacter}
    history={gameState.history[activeCharacter.id] || []}
    settings={gameState.settings}
    userProfile={gameState.userProfile!}
    onUpdateHistory={handleUpdateHistory}
    onBack={handleBackFromSharedChat}
  />
)}
```

### 第四步：清理旧文件（可选）

完成重构后，可以删除旧的组件文件：
- `MobileRealWorld.tsx` → 已移动到screens
- `MobileSceneSelection.tsx` → 已移动到screens
- `MobileCharacterSelection.tsx` → 已移动到screens
- `MobileProfile.tsx` → 已移动到screens
- `MobileScenarioBuilder.tsx` → 已移动到screens

## 文件结构对比

### PC版本结构
```
frontend/
  components/
    screens/
      SceneSelectionScreen.tsx
      CharacterSelectionScreen.tsx
      ProfileSetupScreen.tsx
      SharedHeartSphereScreen.tsx
      SharedCharacterSelectionScreen.tsx
      SharedChatWindow.tsx
    EntryPoint.tsx
    RealWorldScreen.tsx
    ChatWindow.tsx
    ScenarioBuilder.tsx
    ConnectionSpace.tsx
    UserProfile.tsx
```

### Mobile版本结构（目标）
```
frontend/mobile/
  screens/
    MobileProfileSetupScreen.tsx
    MobileEntryPointScreen.tsx
    MobileRealWorldScreen.tsx
    MobileSceneSelectionScreen.tsx
    MobileCharacterSelectionScreen.tsx
    MobileProfileScreen.tsx
    MobileScenarioBuilderScreen.tsx
    MobileChatWindowScreen.tsx
    MobileConnectionSpaceScreen.tsx
    MobileSharedHeartSphereScreen.tsx
    MobileSharedCharacterSelectionScreen.tsx
    MobileSharedChatWindowScreen.tsx
    index.ts
  components/
    MobileBottomNav.tsx
    MobileSharedModeBanner.tsx
    ...
  MobileApp.tsx
```

## 实施步骤

### 阶段1：更新导入（已完成）
- ✅ 创建所有screen组件
- ✅ 修复导入路径

### 阶段2：重构MobileApp.tsx
- [ ] 更新导入语句，使用screens目录
- [ ] 重构profileSetup渲染逻辑
- [ ] 添加entryPoint渲染逻辑
- [ ] 更新realWorld渲染逻辑
- [ ] 更新sceneSelection渲染逻辑
- [ ] 更新characterSelection渲染逻辑
- [ ] 更新chat渲染逻辑
- [ ] 更新connectionSpace渲染逻辑
- [ ] 更新mobileProfile渲染逻辑
- [ ] 更新builder渲染逻辑
- [ ] 添加共享模式screen渲染逻辑

### 阶段3：测试和验证
- [ ] 测试所有screen的导航
- [ ] 测试共享模式功能
- [ ] 验证状态管理正常
- [ ] 检查移动端适配

### 阶段4：清理（可选）
- [ ] 删除旧的组件文件
- [ ] 更新文档

## 注意事项

1. **保持组件独立性**：所有Mobile screen组件必须保持独立，不直接使用PC组件
2. **复用业务逻辑**：API调用和Hooks完全复用PC版本
3. **移动端优化**：所有screen都要符合移动端规范（触摸区域、安全区域等）
4. **状态管理**：使用统一的GameState和dispatch
5. **渐进式迁移**：可以逐步替换，不需要一次性完成

## 参考文件

- `frontend/App.tsx` - PC版本的screen组织方式
- `frontend/components/screens/` - PC版本的screens目录
- `frontend/mobile/MobileApp.tsx` - 当前Mobile版本主文件（需要重构）

---

**文档创建时间**：2025-01-XX
**最后更新时间**：2025-01-XX
**维护者**：开发团队
