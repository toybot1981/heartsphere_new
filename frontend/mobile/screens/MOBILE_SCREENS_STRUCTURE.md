# Mobile版本页面结构规划

## 目标
参照PC版本的模块化结构，为Mobile版本创建完整的screens目录，确保所有功能全覆盖。

## PC版本页面结构

### screens目录
- `SceneSelectionScreen.tsx` - 场景选择
- `CharacterSelectionScreen.tsx` - 角色选择
- `ProfileSetupScreen.tsx` - 欢迎/登录页面
- `SharedHeartSphereScreen.tsx` - 共享心域选择
- `SharedCharacterSelectionScreen.tsx` - 共享角色选择
- `SharedChatWindow.tsx` - 共享聊天窗口

### 其他页面组件
- `EntryPoint.tsx` - 入口点/主页
- `RealWorldScreen.tsx` - 现实世界/日记
- `ChatWindow.tsx` - 聊天窗口
- `ScenarioBuilder.tsx` - 剧本构建器
- `ConnectionSpace.tsx` - 连接空间
- `UserProfile.tsx` - 用户资料

## Mobile版本页面结构（规划）

### screens目录（需要创建）
- `MobileProfileSetupScreen.tsx` - 欢迎/登录页面 ✅ (当前在MobileApp中)
- `MobileEntryPointScreen.tsx` - 入口点/主页 ❌ (待创建)
- `MobileRealWorldScreen.tsx` - 现实世界/日记 ✅ (已有MobileRealWorld.tsx)
- `MobileSceneSelectionScreen.tsx` - 场景选择 ✅ (已有MobileSceneSelection.tsx)
- `MobileCharacterSelectionScreen.tsx` - 角色选择 ✅ (已有MobileCharacterSelection.tsx)
- `MobileChatWindowScreen.tsx` - 聊天窗口 ❌ (待创建，可复用ChatWindow但需要移动端适配)
- `MobileScenarioBuilderScreen.tsx` - 剧本构建器 ✅ (已有MobileScenarioBuilder.tsx)
- `MobileConnectionSpaceScreen.tsx` - 连接空间 ❌ (待创建)
- `MobileProfileScreen.tsx` - 用户资料 ✅ (已有MobileProfile.tsx)
- `MobileSharedHeartSphereScreen.tsx` - 共享心域选择 ❌ (待创建)
- `MobileSharedCharacterSelectionScreen.tsx` - 共享角色选择 ❌ (待创建)
- `MobileSharedChatWindowScreen.tsx` - 共享聊天窗口 ❌ (待创建)

## 实施计划

### 第一步：创建screens目录结构
1. 创建 `frontend/mobile/screens/` 目录
2. 将现有组件移动到screens目录
3. 重命名组件，统一命名规范

### 第二步：创建缺失的页面
1. MobileEntryPointScreen - 入口点页面
2. MobileChatWindowScreen - 聊天窗口（可复用ChatWindow，但需要移动端适配）
3. MobileConnectionSpaceScreen - 连接空间
4. MobileSharedHeartSphereScreen - 共享心域
5. MobileSharedCharacterSelectionScreen - 共享角色选择
6. MobileSharedChatWindowScreen - 共享聊天窗口

### 第三步：重构MobileApp.tsx
1. 按照PC版本的App.tsx结构组织
2. 使用screens目录下的组件
3. 统一路由和状态管理

## 文件映射

| PC版本 | Mobile版本 | 状态 |
|--------|-----------|------|
| ProfileSetupScreen | MobileProfileSetupScreen | ✅ 需移动 |
| EntryPoint | MobileEntryPointScreen | ❌ 待创建 |
| RealWorldScreen | MobileRealWorldScreen | ✅ 需移动 |
| SceneSelectionScreen | MobileSceneSelectionScreen | ✅ 需移动 |
| CharacterSelectionScreen | MobileCharacterSelectionScreen | ✅ 需移动 |
| ChatWindow | MobileChatWindowScreen | ❌ 待创建 |
| ScenarioBuilder | MobileScenarioBuilderScreen | ✅ 需移动 |
| ConnectionSpace | MobileConnectionSpaceScreen | ❌ 待创建 |
| UserProfile | MobileProfileScreen | ✅ 需移动 |
| SharedHeartSphereScreen | MobileSharedHeartSphereScreen | ❌ 待创建 |
| SharedCharacterSelectionScreen | MobileSharedCharacterSelectionScreen | ❌ 待创建 |
| SharedChatWindow | MobileSharedChatWindowScreen | ❌ 待创建 |

## 命名规范

- 所有Mobile版本的Screen组件统一使用 `Mobile` 前缀
- 所有Screen组件放在 `mobile/screens/` 目录
- 组件文件命名：`Mobile[功能]Screen.tsx`
- 组件导出命名：`Mobile[功能]Screen`

---

**文档创建时间**：2025-01-XX
**最后更新时间**：2025-01-XX
