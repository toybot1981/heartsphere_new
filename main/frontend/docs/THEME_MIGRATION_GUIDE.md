# 主题系统迁移指南

## 概述

本文档说明如何将现有组件从硬编码颜色迁移到主题系统。

## 迁移模式

### 1. 背景色迁移

**迁移前：**
```tsx
<div className="bg-gray-900">
<div className="bg-black">
<div className="bg-slate-800">
```

**迁移后：**
```tsx
// 方式1：使用内联样式
<div style={{ backgroundColor: 'var(--bg-primary)' }}>

// 方式2：使用CSS变量类名（如果Tailwind配置支持）
<div className="bg-[var(--bg-primary)]">
```

### 2. 文字颜色迁移

**迁移前：**
```tsx
<p className="text-white">
<p className="text-gray-400">
```

**迁移后：**
```tsx
// 方式1：使用内联样式
<p style={{ color: 'var(--text-primary)' }}>

// 方式2：使用CSS变量类名
<p className="text-[var(--text-primary)]">
```

### 3. 渐变迁移

**迁移前：**
```tsx
<div className="bg-gradient-to-r from-pink-500 to-purple-600">
```

**迁移后：**
```tsx
// 使用CSS渐变类
<div className="gradient-button">
// 或
<div className="gradient-primary">
```

### 4. 边框和阴影迁移

**迁移前：**
```tsx
<div className="border border-white/10 shadow-lg">
```

**迁移后：**
```tsx
<div 
  className="border shadow-lg"
  style={{
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: 'var(--shadow-lg)',
  }}
>
```

### 5. 悬停效果迁移

**迁移前：**
```tsx
<button className="bg-black/50 hover:bg-white/20">
```

**迁移后：**
```tsx
<button
  style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  }}
>
```

## 可用的CSS变量

### 背景色
- `--bg-primary`: 主背景色
- `--bg-secondary`: 次要背景色
- `--bg-card`: 卡片背景色
- `--bg-overlay`: 遮罩背景色

### 文字颜色
- `--text-primary`: 主文字色
- `--text-secondary`: 次要文字色
- `--text-tertiary`: 第三级文字色
- `--text-disabled`: 禁用文字色
- `--text-link`: 链接文字色
- `--text-accent`: 强调文字色

### 主色调
- `--color-primary`: 主色
- `--color-primary-light`: 浅色
- `--color-primary-lighter`: 更浅色
- `--color-primary-lightest`: 最浅色
- `--color-secondary`: 辅助色

### 渐变
- `--gradient-primary`: 主渐变
- `--gradient-button`: 按钮渐变
- `--gradient-bg`: 背景渐变

### 阴影
- `--shadow-sm`: 小阴影
- `--shadow-md`: 中等阴影
- `--shadow-lg`: 大阴影
- `--shadow-primary`: 主色调阴影

### 圆角
- `--radius-sm`: 小圆角
- `--radius-md`: 中等圆角
- `--radius-lg`: 大圆角
- `--radius-xl`: 超大圆角

## 已迁移的组件

- ✅ `components/Button.tsx` - 基础按钮组件
- ✅ `components/CharacterCard.tsx` - 角色卡片组件
- ✅ `components/SceneCard.tsx` - 场景卡片组件

## 待迁移的组件

### 基础组件
- [ ] `components/ui/Button.tsx`
- [ ] `components/ui/Card.tsx`
- [ ] `components/ui/Input.tsx`
- [ ] Modal相关组件

### 页面组件
- [ ] `components/ChatWindow.tsx`
- [ ] 其他主要页面组件

## 迁移检查清单

迁移组件时，请检查：

1. ✅ 所有硬编码的背景色已替换为CSS变量
2. ✅ 所有硬编码的文字颜色已替换为CSS变量
3. ✅ 所有Tailwind渐变类已替换为CSS渐变类
4. ✅ 悬停效果使用内联样式或CSS变量
5. ✅ 组件在不同主题下显示正常
6. ✅ 颜色对比度符合无障碍标准

## 工具函数

可以使用以下工具函数辅助迁移：

```typescript
import { getThemeBgStyle, getThemeTextStyle } from '../utils/themeStyles';

// 使用示例
<div style={getThemeBgStyle('card')}>
  <p style={getThemeTextStyle('primary')}>文本</p>
</div>
```

## 注意事项

1. **保持向后兼容**：迁移时确保组件在默认主题下仍然正常工作
2. **测试主题切换**：迁移后测试组件在不同主题下的表现
3. **性能考虑**：内联样式比Tailwind类名稍慢，但对于主题切换是必要的
4. **渐进式迁移**：可以逐步迁移，不需要一次性完成所有组件
