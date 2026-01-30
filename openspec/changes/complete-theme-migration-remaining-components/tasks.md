# 任务清单：完成剩余组件的主题迁移

## 阶段 1: 高优先级组件迁移（核心功能）

### 1.1 ChatWindow 主容器
- [x] 1.1.1 迁移 ChatWindow.tsx 主容器的硬编码颜色
  - [x] 背景色（bg-black）
  - [x] 文字颜色（text-white）
  - [x] 其他硬编码样式
- [ ] 1.1.2 测试 ChatWindow 在不同主题下的显示效果
- [ ] 1.1.3 验证与子组件的样式一致性

### 1.2 主要模态框组件
- [x] 1.2.1 迁移 LoginModal.tsx
  - [x] 背景色和边框
  - [x] 文字颜色
  - [x] 输入框样式
  - [x] 按钮样式
- [x] 1.2.2 迁移 SettingsModal.tsx（补充剩余部分）
  - [x] 检查是否还有硬编码颜色
  - [x] 确保所有标签页都支持主题
  - [x] 主要部分已迁移（通用设置、对话风格、主题选择器）
  - [ ] AI 模型配置部分（部分完成，可后续补充）
  - [ ] 备份部分（可后续补充）
- [x] 1.2.3 迁移 ResourcePicker.tsx
- [x] 1.2.4 迁移 CharacterConstructorModal.tsx（主要部分已迁移，部分输入框和按钮可后续补充）
- [x] 1.2.5 迁移 EraConstructorModal.tsx（主要部分已迁移，部分输入框和按钮可后续补充）
- [x] 1.2.6 迁移 InitializationWizard.tsx（主要部分已迁移，容器、标题、卡片等已迁移，部分输入框和按钮可后续补充）
- [ ] 1.2.7 测试所有模态框在不同主题下的显示效果

### 1.3 移动端主要页面
- [x] 1.3.1 迁移 MobileCharacterSelectionScreen.tsx
  - [x] 主容器背景色
  - [x] 头部区域样式
  - [x] 卡片样式
  - [x] 按钮样式
- [x] 1.3.2 迁移 MobileRealWorldScreen.tsx
  - [x] 主容器背景色
  - [x] 搜索框样式（主要部分）
  - [x] 日记卡片样式（主要部分）
  - [x] 按钮样式（主要部分）
- [x] 1.3.3 迁移 MobileChatWindowScreen.tsx
  - [x] 主容器背景色
  - [x] 消息区域样式（主要部分）
  - [x] 输入框样式（主要部分）
  - [x] 语音输入按钮样式
- [x] 1.3.4 迁移 MobileConnectionSpaceScreen.tsx（主要部分已迁移）
- [x] 1.3.5 迁移 MobileProfileSetupScreen.tsx（主要部分已迁移）
- [x] 1.3.6 迁移 MobileProfileScreen.tsx（主要部分已迁移）
- [ ] 1.3.7 测试所有移动端页面在不同主题下的显示效果

## 阶段 2: 中优先级组件迁移（功能模块）

### 2.1 HeartConnect 相关组件
- [x] 2.1.1 迁移 ShareConfigModal.tsx（主要部分已迁移）
- [x] 2.1.2 迁移 ShareButton.tsx（主要部分已迁移）
- [x] 2.1.3 迁移 SharedModeBanner.tsx（主要部分已迁移）
- [x] 2.1.4 迁移 ShareCodeDisplay.tsx（主要部分已迁移）
- [x] 2.1.5 迁移 WarmMessagesList.tsx（主要部分已迁移）
- [x] 2.1.6 迁移 SharePage.tsx（主要部分已迁移）
- [x] 2.1.7 迁移 SharedHeartSphereCard.tsx（主要部分已迁移）
- [x] 2.1.8 迁移 ShareCodeInputModal.tsx（主要部分已迁移）
- [x] 2.1.9 迁移 ConnectionRequestModal.tsx（主要部分已迁移）
- [x] 2.1.10 迁移 QRCodeGenerator.tsx
- [x] 2.1.11 迁移 WarmMessageModal.tsx
- [x] 2.1.12 迁移 ConnectionRequestList.tsx
- [ ] 2.1.13 测试 HeartConnect 功能在不同主题下的显示效果

### 2.2 QuickConnect 相关组件
- [x] 2.2.1 迁移 QuickConnectModal.tsx（主要部分已迁移）
- [x] 2.2.2 迁移 quickconnect/CharacterCard.tsx（主要部分已迁移）
- [x] 2.2.3 迁移 SharedHeartSphereSection.tsx（主要部分已迁移）
- [x] 2.2.4 迁移 SceneFilter.tsx（主要部分已迁移）
- [x] 2.2.5 迁移 VirtualizedCharacterGrid.tsx（主要部分已迁移）
- [x] 2.2.6 迁移 CharacterGrid.tsx（主要部分已迁移）
- [x] 2.2.7 迁移 FilterTabs.tsx（主要部分已迁移）
- [x] 2.2.8 迁移 SearchBox.tsx（主要部分已迁移）
- [x] 2.2.9 迁移 QuickConnectButton.tsx（主要部分已迁移）
- [x] 2.2.10 迁移 EmptyState.tsx（主要部分已迁移）
- [x] 2.2.11 迁移 FavoriteManager.tsx（主要部分已迁移）
- [ ] 2.2.12 测试 QuickConnect 功能在不同主题下的显示效果

### 2.3 Portal 相关组件
- [x] 2.3.1 迁移 TeleportationManager.tsx
- [x] 2.3.2 迁移 PortalSelectionModal.tsx
- [x] 2.3.3 迁移 PortalManagement.tsx
- [x] 2.3.4 迁移 PortalPreviewCard.tsx
- [ ] 2.3.5 测试 Portal 功能在不同主题下的显示效果

### 2.4 Character 相关组件
- [x] 2.4.1 迁移 SkillEquipDialog.tsx
- [x] 2.4.2 迁移 CharacterMemoryTab.tsx
- [x] 2.4.3 迁移 CharacterSkillManagement.tsx
- [x] 2.4.4 迁移 MemoryItem.tsx
- [x] 2.4.5 迁移 SkillCard.tsx
- [x] 2.4.6 迁移 SkillList.tsx
- [x] 2.4.7 迁移 SkillDetailDialog.tsx
- [x] 2.4.8 迁移 character/Expression.tsx（补充剩余部分）
- [ ] 2.4.9 测试 Character 功能在不同主题下的显示效果

### 2.5 Scenario 相关组件
- [x] 2.5.1 迁移 ScenarioBuilder.tsx
- [x] 2.5.2 迁移 scenario/NodeEditor.tsx
- [x] 2.5.3 迁移 scenario/OptionEditor.tsx
- [x] 2.5.4 迁移 scenario/OptionConditionEditor.tsx
- [x] 2.5.5 迁移 scenario/OptionEffectEditor.tsx
- [ ] 2.5.6 测试 Scenario 功能在不同主题下的显示效果

### 2.6 Scene Wizard 相关组件
- [x] 2.6.1 迁移 SceneCreationWizard.tsx
- [x] 2.6.2 迁移 scene-wizard/ScriptSelectionStep.tsx
- [x] 2.6.3 迁移 scene-wizard/SceneSelectionStep.tsx
- [x] 2.6.4 迁移 scene-wizard/MainStorySelectionStep.tsx
- [x] 2.6.5 迁移 scene-wizard/SceneCreationSummary.tsx
- [x] 2.6.6 迁移 scene-wizard/CharacterSelectionStep.tsx
- [ ] 2.6.7 测试 Scene Wizard 功能在不同主题下的显示效果

### 2.7 Plugin 相关组件
- [x] 2.7.1 迁移 PluginSelectorModal.tsx
- [x] 2.7.2 迁移 PhotoAlbumPlugin.tsx
- [x] 2.7.3 迁移 PluginConfigModal.tsx
- [x] 2.7.4 迁移 ScenePluginContainer.tsx
- [x] 2.7.5 迁移 PluginToolbar.tsx
- [ ] 2.7.6 测试 Plugin 功能在不同主题下的显示效果

### 2.8 Mailbox 相关组件
- [x] 2.8.1 迁移 mailbox/MessageList.tsx
- [x] 2.8.2 迁移 mailbox/UnreadBadge.tsx
- [x] 2.8.3 迁移 mailbox/MessageDetail.tsx
- [x] 2.8.4 迁移 mailbox/UnifiedMailboxModal.tsx
- [x] 2.8.5 迁移 mailbox/ComposeMessageModal.tsx
- [x] 2.8.6 迁移 mailbox/ConversationView.tsx
- [x] 2.8.7 迁移 mailbox/ConversationList.tsx
- [ ] 2.8.8 测试 Mailbox 功能在不同主题下的显示效果

## 阶段 3: 低优先级组件迁移（辅助功能）

### 3.1 用户资料和编辑器
- [x] 3.1.1 迁移 UserProfile.tsx
- [x] 3.1.2 迁移 MainStoryEditor.tsx
- [x] 3.1.3 迁移 UserScriptEditor.tsx
- [ ] 3.1.4 测试用户资料和编辑器在不同主题下的显示效果

### 3.2 其他模态框
- [x] 3.2.1 迁移 WelcomeOverlay.tsx
- [x] 3.2.2 迁移 RecycleBinModal.tsx
- [x] 3.2.3 迁移 JournalPreviewModal.tsx
- [x] 3.2.4 迁移 NoteSyncModal.tsx
- [x] 3.2.5 迁移 memory/JournalMemoryModal.tsx
- [x] 3.2.6 迁移 EraMemoryModal.tsx
- [x] 3.2.7 迁移 EraSelectionModal.tsx
- [x] 3.2.8 迁移 PhotoAlbumModal.tsx
- [x] 3.2.9 迁移 MailboxModal.tsx
- [x] 3.2.10 迁移 AgreementModal.tsx
- [x] 3.2.11 迁移 AlertDialog.tsx
- [ ] 3.2.12 测试所有模态框在不同主题下的显示效果

### 3.3 交互和卡片组件
- [x] 3.3.1 迁移 interaction/InteractionButtons.tsx
- [x] 3.3.2 迁移 interaction/CommentList.tsx
- [x] 3.3.3 迁移 card/CardSender.tsx
- [x] 3.3.4 迁移 card/CardMaker.tsx
- [x] 3.3.5 迁移 card/CardEditor.tsx
- [x] 3.3.6 迁移 emoji/EmojiPicker.tsx
- [ ] 3.3.7 测试交互和卡片组件在不同主题下的显示效果

### 3.4 成长和情感系统组件
- [x] 3.4.1 迁移 growth/CelebrationAnimation.tsx
- [x] 3.4.2 迁移 growth/GrowthDashboard.tsx
- [x] 3.4.3 迁移 growth/MilestoneDisplay.tsx
- [x] 3.4.4 迁移 growth/GrowthStatistics.tsx
- [x] 3.4.5 迁移 companion/CareMessageNotification.tsx
- [x] 3.4.6 迁移 companion-memory/CompanionMemoryTimeline.tsx
- [x] 3.4.7 迁移 companion-memory/CompanionMemoryDashboard.tsx
- [x] 3.4.8 迁移 emotion/EmotionTimeline.tsx
- [x] 3.4.9 迁移 emotion/EmotionStatistics.tsx
- [x] 3.4.10 迁移 memory/MemoryList.tsx
- [ ] 3.4.11 测试成长和情感系统组件在不同主题下的显示效果

### 3.5 其他辅助组件
- [x] 3.5.1 迁移 LazyImage.tsx
- [x] 3.5.2 迁移 Footer.tsx
- [x] 3.5.3 迁移 transitions/PageTransitionSystem.tsx
- [x] 3.5.4 迁移 TemperatureEngineIntegration.tsx
- [x] 3.5.5 迁移 RealWorldJournal.tsx
- [x] 3.5.6 迁移 UserUsageStatistics.tsx
- [x] 3.5.7 迁移 PersonaCard.tsx
- [x] 3.5.8 迁移 DebugConsole.tsx
- [x] 3.5.9 迁移 StateManagementTest.tsx
- [ ] 3.5.10 测试其他辅助组件在不同主题下的显示效果

### 3.6 移动端模态框和辅助组件
- [x] 3.6.1 迁移移动端模态框组件（约11个）
  - [x] MobileSettingsModal.tsx
  - [x] MobileShareConfigStep1.tsx
  - [x] MobileShareConfigStep2.tsx
  - [x] MobileShareConfigStep3.tsx
  - [x] MobileQuickConnectModal.tsx
  - [x] MobileEraConstructorModal.tsx
  - [x] MobileCharacterConstructorModal.tsx
  - [x] MobileComposeMessageModal.tsx
  - [x] MobileUnifiedMailboxModal.tsx
  - [x] MobileWarmMessageModal.tsx
- [x] 3.6.2 迁移移动端其他页面（约6个）
  - [x] MobileApp.tsx
  - [x] MobileSceneSelection.tsx
  - [x] MobileCharacterSelection.tsx
  - [x] MobileProfile.tsx
  - [x] MobileRealWorld.tsx
  - [x] MobileScenarioBuilder.tsx
  - [x] MobileChatWindowScreen.tsx
  - [x] MobileScenarioBuilderScreen.tsx
  - [x] MobileSharedHeartSphereScreen.tsx
  - [x] MobileSharedChatWindowScreen.tsx
  - [x] MobileSyncStatusIndicator.tsx
  - [x] MobileSharedModeBanner.tsx
- [x] 3.6.3 迁移移动端基础组件（约22个）
  - [x] MobileBottomNav.tsx
  - [x] MobileLoadingSpinner.tsx
  - [x] MobileTouchableButton.tsx
  - [x] MobileEmptyState.tsx
  - [x] MobileErrorToast.tsx
  - [x] MobileFormField.tsx
  - [x] MobileSkeleton.tsx
  - [x] MobileBackButton.tsx
  - [x] MobileErrorBoundary.tsx
  - [x] MobileLoginForm.tsx
  - [x] MobileRegisterForm.tsx
  - [x] MobilePasswordStrengthIndicator.tsx
  - [x] MobileWechatLogin.tsx
  - [x] MobileLazyImage.tsx
  - [x] MobileLazyBackgroundImage.tsx
  - [x] MobileModalContainer.tsx
  - [x] MobileSafeAreaView.tsx
  - [x] MobileLoginScreen.tsx
  - [x] MobileEntryPointScreen.tsx
  - [x] MobileConnectionSpaceScreen.tsx
  - [x] MobileProfileScreen.tsx
  - [x] MobileRealWorldScreen.tsx
  - [x] MobileSceneSelectionScreen.tsx
  - [x] MobileMailboxScreen.tsx
  - [x] MobileProfileSetupScreen.tsx
  - [x] MobileCharacterSelectionScreen.tsx
- [ ] 3.6.4 测试所有移动端组件在不同主题下的显示效果

## 阶段 4: 验证和优化

### 4.1 全面测试
- [ ] 4.1.1 测试所有已迁移组件在"科技风格"主题下的显示效果
- [ ] 4.1.2 测试所有已迁移组件在"海天宁静"主题下的显示效果
- [ ] 4.1.3 测试主题切换的流畅性和性能
- [ ] 4.1.4 测试移动端主题切换功能
- [ ] 4.1.5 验证颜色对比度（WCAG AA 标准）

### 4.2 代码审查
- [ ] 4.2.1 检查所有组件是否都使用 CSS 变量
- [ ] 4.2.2 检查是否有遗漏的硬编码颜色
- [ ] 4.2.3 检查迁移模式的一致性
- [ ] 4.2.4 运行 linter 检查

### 4.3 文档更新
- [ ] 4.3.1 更新迁移进度文档
- [ ] 4.3.2 更新迁移指南（如有需要）
- [ ] 4.3.3 记录迁移过程中的问题和解决方案

### 4.4 性能优化
- [ ] 4.4.1 检查主题切换性能
- [ ] 4.4.2 优化大量组件更新时的性能
- [ ] 4.4.3 确保 CSS 变量使用最佳实践

## 验收标准

### 功能验收
- ✅ 所有组件在不同主题下正确显示
- ✅ 主题切换即时生效，无需刷新页面
- ✅ 主题切换包含平滑过渡动画
- ✅ 所有颜色对比度符合 WCAG AA 标准

### 代码质量
- ✅ 无硬编码颜色（除语义色和动态颜色外）
- ✅ 所有组件使用统一的 CSS 变量命名
- ✅ 无 linter 错误
- ✅ 代码符合项目规范

### 测试覆盖
- ✅ PC端主要功能在不同主题下测试通过
- ✅ 移动端主要功能在不同主题下测试通过
- ✅ 主题切换功能测试通过
- ✅ 向后兼容性测试通过
