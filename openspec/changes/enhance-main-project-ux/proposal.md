# Change: 增强主项目用户体验功能

## Why

当前主项目（main）存在多个用户体验问题，影响用户使用效率和体验：

1. **插件可见性管理不足**：现实世界中的插件无法隐藏，占用屏幕空间，影响用户查看和操作其他内容
2. **图片加载规则不统一**：图片缺乏统一的质量等级管理，无法根据场景选择合适的图片质量，影响加载性能和用户体验
3. **传送门使用门槛高**：传送门需要在场景中设置，操作复杂，用户难以快速访问其他共享心域
4. **世界风格设置不合理**：世界风格在入口点设置，但实际应该在场景创建时设定，且风格应该影响场景和角色的生成
5. **Warm 提示语冗余**：ChatWindow 和 SharedChatWindow 中存在多个 warm 提示语，造成界面冗余

通过本次改进，提升用户体验的一致性和操作的便捷性，降低功能使用门槛。

## What Changes

### 1. 插件隐藏功能
- **ADDED**: 插件隐藏按钮和功能
  - 在插件上方添加隐藏按钮
  - 点击后插件隐藏到右侧边栏
  - 保留较窄的可点击区域用于恢复显示
  - 支持 PC 和移动端

### 2. 图片质量分级系统
- **ADDED**: 统一的图片质量等级管理
  - 小缩略图（thumbnail）：用于列表、卡片等场景
  - 中等质量（medium）：用于详情页、对话框等场景
  - 高质量（high）：用于背景、大图展示等场景
  - 所有图片加载遵循统一规则
  - 支持 PC 和移动端自适应

### 3. 传送门访问优化
- **MODIFIED**: 传送门访问方式
  - 移除场景中的传送门设置
  - 在共享心域页面右上角添加传送按钮
  - 点击后弹出选择页面，选择目标共享心域和传送效果
  - 降低使用门槛，提升易用性
  - 支持 PC 和移动端

### 4. 场景风格系统重构
- **MODIFIED**: 世界风格设置位置和逻辑
  - 移除 EntryPoint 中的世界风格选择器
  - 在场景创建时设置场景风格（默认写实风格）
  - 场景风格保存到数据库
  - 场景风格影响场景和角色图片生成
  - 场景风格影响角色属性设定
  - 支持 PC 和移动端

### 5. Warm 提示语优化
- **MODIFIED**: ChatWindow 和 SharedChatWindow 的 Warm 提示语
  - 移除 ChatWindow 和 SharedChatWindow 上方的 warm 提示语
  - 每个页面只保留一个 warm 提示语
  - 支持 PC 和移动端

## Impact

- **Affected specs**: 
  - `plugin-visibility` capability (new)
  - `image-quality` capability (new)
  - `portal-access` capability (modified)
  - `scene-style` capability (modified)
  - `warm-messages` capability (modified)

- **Affected code**:
  - `main/frontend/components/plugin/ScenePluginContainer.tsx` - 添加隐藏功能
  - `main/frontend/components/RealWorldScreen.tsx` - 插件隐藏管理
  - `main/frontend/components/LazyImage.tsx` - 图片质量选择
  - `main/frontend/utils/imageResolution.ts` - 图片质量规则
  - `main/frontend/components/screens/SharedHeartSphereScreen.tsx` - 传送门按钮
  - `main/frontend/components/portal/PortalManagement.tsx` - 传送门选择界面
  - `main/frontend/components/EntryPoint.tsx` - 移除风格选择器
  - `main/frontend/components/EraConstructorModal.tsx` - 添加场景风格设置
  - `main/frontend/components/ChatWindow.tsx` - 移除 warm 提示语
  - `main/frontend/components/screens/SharedChatWindow.tsx` - 移除 warm 提示语
  - `main/backend/src/main/java/com/heartsphere/entity/Era.java` - 添加风格字段
  - 移动端对应组件

- **Breaking changes**: 
  - 传送门不再在场景中显示，改为通过按钮访问（需要迁移现有传送门数据）
  - EntryPoint 中移除风格选择器（需要迁移用户偏好设置）

- **Performance impact**: 
  - 图片质量分级可提升加载性能
  - 插件隐藏可减少渲染负担

## Dependencies

- 需要数据库迁移脚本添加场景风格字段
- 需要迁移现有传送门配置数据
- 需要确保图片服务支持多质量等级
