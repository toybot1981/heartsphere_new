# Change: 重新设计公司官网为扁平简洁风格

## Why

当前公司官网的视觉设计存在以下问题：
1. **风格过于复杂**：使用了过多的渐变、模糊效果和阴影，视觉上显得臃肿
2. **缺乏现代感**：深色背景配合复杂渐变，不符合当前扁平化设计趋势
3. **不够简洁清新**：过多的装饰效果干扰了内容的阅读和信息的传达
4. **科技感不足**：虽然使用了深色主题，但缺乏现代科技公司的简洁专业感

用户反馈页面风格"太丑陋"，需要改进为：
- 有科技感
- 简洁清新
- 扁平风格

## What Changes

- **MODIFIED**: 视觉设计系统，从复杂渐变风格改为扁平简洁风格
  - 移除复杂的渐变背景和模糊效果
  - 采用简洁的纯色或轻微渐变背景
  - 使用扁平化的卡片设计，减少阴影和圆角
  - 优化色彩方案，使用更清新明亮的配色
  
- **MODIFIED**: 页面容器和布局组件
  - 简化背景设计，使用浅色或白色背景
  - 优化间距和留白，提升可读性
  - 使用更清晰的层次结构

- **MODIFIED**: 导航栏设计
  - 扁平化导航栏，移除背景模糊效果
  - 使用简洁的边框或分割线
  - 优化导航链接的悬停效果

- **MODIFIED**: Hero区域设计
  - 简化背景效果，移除模糊渐变
  - 使用扁平化的按钮设计
  - 优化文字排版和间距

- **MODIFIED**: 卡片组件设计
  - 扁平化卡片，减少阴影和圆角
  - 使用简洁的边框或背景色区分
  - 优化悬停效果，使用简洁的颜色变化

- **MODIFIED**: 色彩方案
  - 主背景：浅色（白色或浅灰色）
  - 强调色：保持科技感的蓝色/紫色系，但更清新
  - 文字：深色文字，提升可读性
  - 辅助色：使用清新的绿色、蓝色等

## Impact

- **Affected specs**: `company-website` capability (to be modified)
- **Affected code**:
  - Modified: `frontend/components/company/PageContainer.tsx` - 简化背景设计
  - Modified: `frontend/components/company/Navigation.tsx` - 扁平化导航栏
  - Modified: `frontend/components/company/HeroSection.tsx` - 简化Hero区域
  - Modified: `frontend/components/company/Footer.tsx` - 扁平化页脚
  - Modified: `frontend/components/company/FeatureCard.tsx` - 扁平化卡片
  - Modified: `frontend/components/company/ServiceCard.tsx` - 扁平化服务卡片
  - Modified: `frontend/components/company/PhilosophySection.tsx` - 简化理念展示
  - Modified: `frontend/components/company/PhilosophyVisualization.tsx` - 扁平化可视化
  - Modified: `frontend/components/company/ProductShowcase.tsx` - 简化产品展示
  - Modified: `frontend/components/company/ContactForm.tsx` - 扁平化表单
  - Modified: `frontend/components/company/PhilosophyPreview.tsx` - 简化预览组件
  - Modified: `frontend/components/company/ProductHighlights.tsx` - 简化亮点展示
  - Modified: `frontend/pages/company/*.tsx` - 所有页面组件（调整布局和样式）
- **Design changes**: 
  - 色彩方案：从深色主题改为浅色主题
  - 设计风格：从复杂渐变改为扁平简洁
  - 视觉效果：减少装饰效果，提升内容可读性

## Non-Breaking Changes

这是一个视觉设计的改进，不改变功能逻辑和数据结构，只修改样式和视觉效果。所有路由、组件结构和API保持不变。
