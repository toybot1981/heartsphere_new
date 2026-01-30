# Change: 添加场景创建向导功能

## Why

当前用户在已有世界中添加新场景时，只能通过 `EraConstructorModal` 逐个创建场景。这种方式存在以下问题：

1. **效率低下**：用户需要多次打开模态框，逐个创建场景、角色、主线剧情和剧本
2. **体验不一致**：首次注册时可以使用 `InitializationWizard` 批量创建，但后续添加场景时缺少类似的批量创建功能
3. **操作繁琐**：用户需要手动关联场景、角色、主线剧情和剧本之间的关系

参照 `InitializationWizard` 的实现，提供一个场景创建向导，支持：
- 批量选择多个预置场景
- 为每个场景选择多个角色
- 为每个场景选择主线剧情（可选）
- 为每个场景选择多个剧本（可选）
- 支持自定义名称（手动输入或AI生成）

这样可以显著提升用户添加场景的效率，并保持与初始化流程的一致性。

## What Changes

### ADDED（新增功能）

**前端组件：**
- `SceneCreationWizard` - 场景创建向导组件（参照 `InitializationWizard` 实现）
  - 步骤1：场景选择（支持多选，显示预置场景列表）
  - 步骤2：角色选择（按场景分组显示，支持多选）
  - 步骤3：主线剧情选择（按场景分组显示，每个场景可选一个）
  - 步骤4：剧本选择（按场景分组显示，支持多选）
  - 支持自定义名称（手动输入或AI生成）
  - 批量创建所有选中的场景、角色、主线剧情和剧本

**集成点：**
- 在场景列表页面添加"批量创建场景"按钮，打开 `SceneCreationWizard`
- 在 `EraConstructorModal` 中添加"使用向导创建"选项（可选）

**模块化设计：**
- 将向导拆分为多个子组件，便于维护和复用：
  - `SceneSelectionStep` - 场景选择步骤
  - `CharacterSelectionStep` - 角色选择步骤
  - `MainStorySelectionStep` - 主线剧情选择步骤
  - `ScriptSelectionStep` - 剧本选择步骤
  - `SceneCreationSummary` - 创建摘要预览（可选）

### MODIFIED（修改现有功能）

**无破坏性修改**，新增功能不影响现有场景创建流程。

## Impact

### Affected Specs
- **scene-management** - 新增场景创建向导相关需求

### Affected Code

**前端文件：**
- `main/frontend/components/SceneCreationWizard.tsx` - **新建**，主向导组件
- `main/frontend/components/scene-wizard/SceneSelectionStep.tsx` - **新建**，场景选择步骤组件
- `main/frontend/components/scene-wizard/CharacterSelectionStep.tsx` - **新建**，角色选择步骤组件
- `main/frontend/components/scene-wizard/MainStorySelectionStep.tsx` - **新建**，主线剧情选择步骤组件
- `main/frontend/components/scene-wizard/ScriptSelectionStep.tsx` - **新建**，剧本选择步骤组件
- `main/frontend/components/scene-wizard/SceneCreationSummary.tsx` - **新建**，创建摘要预览组件（可选）
- `main/frontend/components/screens/SceneSelectionScreen.tsx` - **修改**，添加"批量创建场景"按钮
- `main/frontend/components/EraConstructorModal.tsx` - **可选修改**，添加"使用向导创建"选项

**移动端文件（可选）：**
- `main/frontend/mobile/screens/MobileSceneSelectionScreen.tsx` - **可选修改**，添加移动端批量创建入口

### Breaking Changes
- **无破坏性变更**

### Testing
- **单元测试**：测试各个步骤组件的交互逻辑
- **集成测试**：测试完整的创建流程，验证数据正确创建
- **UI测试**：验证向导界面在不同屏幕尺寸下的显示效果
- **错误处理测试**：测试网络错误、API错误等异常情况的处理
