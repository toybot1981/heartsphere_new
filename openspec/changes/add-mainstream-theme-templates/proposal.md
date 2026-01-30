# Change: 添加两种主流风格模板

## Why

当前系统已有"科技风格"（Tech Style）和"海天宁静"（Serene Horizon）两种主题，但为了满足更广泛的用户需求，需要添加两种主流的设计风格模板：

1. **主流设计趋势覆盖不足**：当前主题偏向特定风格（科技感、宁静感），缺乏更通用的主流设计风格
2. **用户选择多样性**：不同用户有不同的审美偏好和使用场景，需要更多风格选择
3. **行业标准对齐**：主流应用通常提供深色模式和浅色模式等经典选择
4. **设计系统完善**：作为设计系统的一部分，应该提供更多可选的风格模板供用户选择

## What Changes

- **添加两种主流风格模板**:
  - **经典深色模式（Classic Dark）**：传统的深色主题，适合夜间使用，提供高对比度和护眼体验
  - **现代浅色模式（Modern Light）**：现代的浅色主题，适合日间使用，提供清爽明亮的视觉体验

- **主题定义扩展**:
  - 在 `main/frontend/src/themes/` 目录下创建新的主题定义文件
  - 更新 `ThemeId` 类型定义，添加新的主题ID
  - 在 `tokens.css` 中添加新主题的CSS变量定义

- **主题选择器更新**:
  - 更新PC端和移动端的主题选择器，显示新添加的主题
  - 为主题选择器添加主题预览功能

- **文档更新**:
  - 更新主题系统文档，说明新主题的特点和使用场景

## Impact

- **影响的文件**:
  - `main/frontend/src/themes/classic-dark.ts` - 新增：经典深色模式主题定义
  - `main/frontend/src/themes/modern-light.ts` - 新增：现代浅色模式主题定义
  - `main/frontend/src/themes/index.ts` - 更新：注册新主题
  - `main/frontend/src/types/theme.ts` - 更新：扩展 `ThemeId` 类型
  - `main/frontend/src/tokens.css` - 更新：添加新主题的CSS变量
  - `main/frontend/components/ThemeSelector.tsx` - 更新：显示新主题选项
  - `main/frontend/mobile/components/MobileThemeSelector.tsx` - 更新：显示新主题选项

- **影响的规范**:
  - 更新主题管理规范，说明新主题的设计原则和使用场景

- **影响的工作流**:
  - 新主题需要经过设计评审和用户测试
  - 需要确保新主题在所有组件中正确显示

## Notes

- 新主题应该遵循现有的主题系统架构，使用相同的设计令牌结构
- 新主题应该确保颜色对比度符合WCAG AA标准
- 新主题应该支持PC端和移动端
- 新主题应该与现有主题保持一致的切换体验
- 主题ID使用kebab-case命名规范（`classic-dark`, `modern-light`）
- 新主题应该提供完整的移动端特殊变量（如云纹背景、星空背景等）
