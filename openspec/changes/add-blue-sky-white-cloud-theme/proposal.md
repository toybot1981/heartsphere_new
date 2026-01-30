# Change: 添加蓝白主题（蓝天白云风格）

## Why

用户希望有一个清新、明亮的蓝白主题风格，特别是：
1. **视觉体验**：蓝天白云的清新风格，提供与现有深色主题不同的明亮体验
2. **心域连接页面**：在心域链接页面（ConnectionSpace）中，布满闪烁的心域星辰，营造梦幻的星空连接感
3. **主题多样性**：增加主题选择，满足不同用户的视觉偏好

当前已有4个主题（tech、serene-horizon、classic-dark、modern-light），但缺少一个以蓝天白云为特色的明亮主题。

## What Changes

### 新增主题
- **主题ID**: `blue-sky-white-cloud`
- **主题名称**: "蓝天白云"
- **主题描述**: 清新明亮的蓝天白云风格，心域连接页面布满闪烁的星辰

### 设计特点
1. **背景色系**：
   - 主背景：天空蓝渐变（从浅蓝到深蓝）
   - 卡片背景：白色云朵效果（半透明白色，带柔和的云朵纹理）
   - 辅助背景：淡蓝色调

2. **文字颜色**：
   - 主文字：深蓝色（确保在浅色背景上清晰可读）
   - 次要文字：中蓝色
   - 强调文字：亮蓝色

3. **心域连接页面特殊效果**：
   - 背景：蓝天渐变（从浅天蓝到深天蓝）
   - 云朵效果：使用CSS渐变或SVG创建云朵图案
   - 闪烁星辰：在ConnectionSpace组件中增强星辰效果
     - 增加星辰数量
     - 增强闪烁动画效果
     - 添加心域星辰的特殊光晕效果
     - 星辰颜色：白色、淡蓝色、淡粉色（心域色）

4. **其他UI元素**：
   - 按钮：蓝色渐变
   - 边框：淡蓝色
   - 阴影：柔和的蓝色阴影
   - 图标：适配蓝白主题的图标颜色

### 技术实现
- 在 `tokens.css` 中添加新主题的CSS变量定义
- 在主题管理系统中注册新主题
- 增强 `ConnectionSpace` 组件的星辰渲染效果
- 添加云朵背景图案（CSS渐变或背景图片）

## Impact

- **Affected specs**: `theme-management` (新增主题定义)
- **Affected code**:
  - `main/frontend/src/tokens.css` - 添加新主题CSS变量
  - `main/frontend/src/themes/index.ts` - 注册新主题
  - `main/frontend/src/types/theme.ts` - 添加主题类型
  - `main/frontend/components/ConnectionSpace.tsx` - 增强星辰效果
  - `main/frontend/mobile/screens/MobileConnectionSpaceScreen.tsx` - 移动端适配
- **User-facing**: 用户可以在设置中选择新的"蓝天白云"主题
