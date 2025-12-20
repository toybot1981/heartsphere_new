# AdminScreen.tsx 重构方案

## 当前状态
- **文件大小**: 3503 行
- **目标大小**: ~1000 行
- **需要减少**: ~2500 行

## 重构策略

### 1. 提取管理组件（约 2500 行）

#### 1.1 CharactersManagement.tsx (~290 行)
- **位置**: 行 882-1172
- **功能**: 角色管理（列表、创建、编辑、删除）
- **需要传入的 props**:
  - `systemCharacters`, `systemEras`
  - `adminToken`
  - `onSave`, `onDelete`, `onReload`
  - `viewMode`, `setViewMode`
  - `formData`, `setFormData`
  - `editingId`, `setEditingId`
  - 图片上传相关状态和函数

#### 1.2 ScenariosManagement.tsx (~446 行)
- **位置**: 行 1173-1619
- **功能**: 剧本管理
- **需要传入的 props**:
  - `systemScripts`, `systemEras`, `systemCharacters`
  - `adminToken`
  - `showScenarioBuilder`, `setShowScenarioBuilder`
  - `selectedNodeId`, `setSelectedNodeId`
  - 相关状态和回调函数

#### 1.3 InviteCodesManagement.tsx (~307 行)
- **位置**: 行 1620-1927
- **功能**: 邀请码管理
- **需要传入的 props**:
  - `inviteCodes`, `inviteCodeRequired`
  - `adminToken`
  - `generateQuantity`, `setGenerateQuantity`
  - `generateExpiresAt`, `setGenerateExpiresAt`
  - `inviteCodeFilter`, `setInviteCodeFilter`
  - 相关回调函数

#### 1.4 ResourcesManagement.tsx (~450 行)
- **位置**: 行 1928-2378
- **功能**: 资源管理
- **需要传入的 props**:
  - `resources`, `resourceCategory`
  - `adminToken`
  - `isMatchingResources`
  - `resourceUploading`, `newResourceName`, etc.
  - `editingResource`, `editResourceName`, etc.
  - 资源选择器相关状态

#### 1.5 SubscriptionPlansManagement.tsx (~322 行)
- **位置**: 行 2379-2701
- **功能**: 订阅计划管理
- **需要传入的 props**:
  - `subscriptionPlans`
  - `adminToken`
  - `editingPlan`, `setEditingPlan`
  - `planFormData`, `setPlanFormData`
  - 相关回调函数

#### 1.6 EmailConfigManagement.tsx (~346 行)
- **位置**: 行 2702-3048
- **功能**: 邮箱配置管理
- **需要传入的 props**:
  - `emailConfig`, `emailVerificationRequired`
  - `adminToken`
  - `isLoadingEmailConfig`
  - `showAuthCodeGuide`, `setShowAuthCodeGuide`
  - 相关回调函数

#### 1.7 SettingsManagement.tsx (~438 行)
- **位置**: 行 3049-3487
- **功能**: 系统设置（AI模型、通用策略、第三方登录与支付）
- **需要传入的 props**:
  - `gameState`, `onUpdateGameState`
  - `settingsTab`, `setSettingsTab`
  - `wechatConfig`, `wechatPayConfig`, `alipayConfig`
  - `adminToken`
  - 所有配置相关的状态和加载状态
  - 相关回调函数

### 2. 提取自定义 Hooks（约 200 行）

#### 2.1 useAdminData.ts
- **功能**: 管理所有系统数据的加载和状态
- **包含**:
  - `loadSystemData` 函数
  - 所有系统数据的状态（worlds, eras, characters, scripts, etc.）
  - 数据加载逻辑

#### 2.2 useAdminConfig.ts
- **功能**: 管理所有配置相关的状态和加载
- **包含**:
  - 所有配置状态（email, notion, wechat, wechatPay, alipay）
  - 配置加载和保存逻辑

#### 2.3 useAdminAuth.ts
- **功能**: 管理认证相关逻辑
- **包含**:
  - 登录状态
  - 登录/登出函数
  - Token 管理

### 3. 提取工具函数（约 100 行）

#### 3.1 adminUtils.ts
- **功能**: 通用工具函数
- **包含**:
  - `checkAndHandleTokenError`
  - `switchToList`
  - 其他辅助函数

## 重构后的文件结构

```
frontend/admin/
├── AdminScreen.tsx (~1000 行) - 主组件，负责路由和布局
├── components/
│   ├── CharactersManagement.tsx (~290 行)
│   ├── ScenariosManagement.tsx (~446 行)
│   ├── InviteCodesManagement.tsx (~307 行)
│   ├── ResourcesManagement.tsx (~450 行)
│   ├── SubscriptionPlansManagement.tsx (~322 行)
│   ├── EmailConfigManagement.tsx (~346 行)
│   ├── SettingsManagement.tsx (~438 行)
│   └── ... (已有组件)
└── hooks/
    ├── useAdminData.ts (~150 行)
    ├── useAdminConfig.ts (~100 行)
    └── useAdminAuth.ts (~80 行)
```

## 重构步骤

### Phase 1: 提取 Hooks（优先级高）
1. 创建 `useAdminAuth.ts` - 提取认证逻辑
2. 创建 `useAdminData.ts` - 提取数据加载逻辑
3. 创建 `useAdminConfig.ts` - 提取配置管理逻辑

### Phase 2: 提取管理组件（按复杂度从低到高）
1. `InviteCodesManagement.tsx` - 相对简单
2. `SubscriptionPlansManagement.tsx` - 中等复杂度
3. `EmailConfigManagement.tsx` - 中等复杂度
4. `CharactersManagement.tsx` - 较复杂（包含图片上传）
5. `ResourcesManagement.tsx` - 较复杂（包含资源选择器）
6. `ScenariosManagement.tsx` - 最复杂（包含场景构建器）
7. `SettingsManagement.tsx` - 最复杂（包含多个子tab）

### Phase 3: 清理和优化
1. 移除未使用的状态和函数
2. 优化导入
3. 添加 TypeScript 类型定义
4. 代码审查和测试

## 预期效果

- **主文件**: ~1000 行（减少 71%）
- **可维护性**: 大幅提升，每个组件职责单一
- **可测试性**: 提升，组件和 hooks 可以独立测试
- **可复用性**: 提升，组件可以在其他地方复用

## 注意事项

1. **状态管理**: 需要仔细设计 props 传递，避免 prop drilling
2. **类型定义**: 为每个组件创建清晰的 TypeScript 接口
3. **错误处理**: 确保错误处理逻辑正确传递
4. **性能**: 使用 React.memo 优化不必要的重渲染
5. **向后兼容**: 确保重构后功能完全一致


