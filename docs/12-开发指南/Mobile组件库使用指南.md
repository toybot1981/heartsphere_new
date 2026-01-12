# Mobile组件库使用指南

**创建日期**: 2025-01-08  
**版本**: 1.0  
**适用对象**: 所有Mobile页面和组件开发

---

## 📋 概述

本指南介绍Mobile组件库的使用方法，帮助开发者快速构建符合UX规范的Mobile页面和组件。

## 🎨 设计理念

所有组件遵循以下设计理念：
- **扁平化**: 减少阴影层级，简化视觉层次
- **简洁**: 充足的留白，清晰的视觉层次
- **科技感**: 使用渐变背景、毛玻璃效果、柔和发光
- **温馨**: 使用柔和色彩和圆角，营造温暖友好的氛围

## 📦 核心组件

### 1. MobileTouchableButton

统一的触摸按钮组件，确保最小触摸区域44x44px。

**使用方式**:
```tsx
import { MobileTouchableButton } from '../components/MobileTouchableButton';

<MobileTouchableButton
  onClick={handleClick}
  variant="primary" // primary | secondary | outline | ghost | danger
  size="md" // sm | md | lg
  fullWidth={false}
  loading={false}
  disabled={false}
  className=""
>
  按钮文字
</MobileTouchableButton>
```

**变体样式**:
- `primary`: 主按钮（渐变背景，紫色系）
- `secondary`: 次要按钮（毛玻璃效果）
- `outline`: 轮廓按钮（透明背景，边框）
- `ghost`: 幽灵按钮（无背景，仅文字）
- `danger`: 危险按钮（红色系）

### 2. MobileBackButton

统一的返回键组件。

**使用方式**:
```tsx
import { MobileBackButton } from '../components/MobileBackButton';

<MobileBackButton
  onClick={handleBack}
  aria-label="返回"
  className=""
/>
```

### 3. MobileEmptyState

空状态组件，用于显示列表为空时的友好提示。

**使用方式**:
```tsx
import { MobileEmptyState } from '../components/MobileEmptyState';

<MobileEmptyState
  icon="📭"
  title="暂无数据"
  description="描述信息"
  action={{
    label: "操作按钮",
    onClick: handleAction
  }}
  className=""
/>
```

### 4. MobileLoadingSpinner

统一的加载指示器组件。

**使用方式**:
```tsx
import { MobileLoadingSpinner } from '../components/MobileLoadingSpinner';

<MobileLoadingSpinner
  size="md" // sm | md | lg
  text="加载中..."
  className=""
/>
```

### 5. MobileErrorToast

错误提示Toast组件。

**使用方式**:
```tsx
import { MobileErrorToast } from '../components/MobileErrorToast';

<MobileErrorToast
  message="错误信息"
  type="error" // error | success | warning | info
  duration={3000}
  onClose={handleClose}
/>
```

### 6. MobileSkeleton

骨架屏组件，用于加载状态。

**使用方式**:
```tsx
import { MobileSkeleton, MobileSceneCardSkeleton, MobileListItemSkeleton } from '../components/MobileSkeleton';

// 基础骨架屏
<MobileSkeleton
  variant="text" // text | card | avatar | image | button
  width="100%"
  height="20px"
  lines={3}
  className=""
/>

// 场景卡片骨架屏
<MobileSceneCardSkeleton className="" />

// 列表项骨架屏
<MobileListItemSkeleton className="" />
```

### 7. MobileSmoothScroll

平滑滚动容器组件。

**使用方式**:
```tsx
import { MobileSmoothScroll } from '../components/MobileSmoothScroll';

<MobileSmoothScroll
  className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))]"
  onScroll={handleScroll}
>
  {/* 内容 */}
</MobileSmoothScroll>
```

### 8. MobileLazyImage

懒加载图片组件。

**使用方式**:
```tsx
import { MobileLazyImage } from '../components/MobileLazyImage';

<MobileLazyImage
  src={imageUrl}
  alt="描述"
  placeholder="占位图URL"
  fallback="回退图URL"
  className="w-full h-48 object-cover rounded-xl"
  onLoad={handleLoad}
  onError={handleError}
  enableWebP={true}
  enableResponsive={true}
/>
```

### 9. MobilePageTransition

页面过渡动画组件。

**使用方式**:
```tsx
import { MobilePageTransition } from '../components/MobilePageTransition';

<MobilePageTransition className="">
  {/* 页面内容 */}
</MobilePageTransition>
```

### 10. MobileModalContainer

统一模态框容器组件，支持点击背景关闭、ESC关闭。

**使用方式**:
```tsx
import { MobileModalContainer } from '../components/MobileModalContainer';

<MobileModalContainer
  isOpen={isOpen}
  onClose={handleClose}
  title="模态框标题"
  closeOnBackdrop={true}
  closeOnEscape={true}
  showCloseButton={true}
  size="md" // sm | md | lg | full
  aria-label="模态框"
>
  {/* 模态框内容 */}
</MobileModalContainer>
```

### 11. MobileFormField

统一表单字段组件，提供验证提示。

**使用方式**:
```tsx
import { MobileFormField } from '../components/MobileFormField';
import { MobileInputStyles } from '../components/MobileStyleGuide';

<MobileFormField
  label="字段标签"
  error={errors.field}
  success={successMessage}
  hint="提示信息"
  required={true}
>
  <input
    type="text"
    className={MobileInputStyles}
    value={value}
    onChange={handleChange}
  />
</MobileFormField>
```

### 12. MobileBottomNav

底部导航栏组件。

**使用方式**:
```tsx
import { MobileBottomNav } from '../components/MobileBottomNav';

<MobileBottomNav
  currentScreen={gameState.currentScreen}
  onNavigate={handleNavigate}
  hasUnreadMail={hasUnreadMail}
  onOpenMail={handleOpenMail}
/>
```

## 🎨 Design Token系统

使用统一的Design Token系统，确保视觉一致性。

**导入方式**:
```tsx
import {
  MobileColors,
  MobileSpacing,
  MobileTypography,
  MobileButtonStyles,
  MobileInputStyles,
  MobileCardStyles,
  MobileModalStyles,
  MobileAnimationStyles,
  MobileRadius,
  MobileShadow,
  MobileTouchTarget,
  MobileLoadingStyles,
  MobileEmptyStateStyles,
  MobileStatusStyles,
  MobileSafeArea,
} from '../components/MobileStyleGuide';
```

**使用示例**:
```tsx
// 使用颜色
<div className={MobileColors.background.card}>
  <p className={MobileColors.text.primary}>主要文字</p>
</div>

// 使用间距
<div className={MobileSpacing.padding.md}>
  <div className={MobileSpacing.gap.sm}>
    {/* 内容 */}
  </div>
</div>

// 使用按钮样式
<button className={`${MobileButtonStyles.primary} ${MobileSpacing.padding.md}`}>
  按钮
</button>
```

## 📐 布局规范

### 页面布局结构

```tsx
<div className="flex flex-col h-screen">
  {/* 顶部导航栏 */}
  <header className="pt-[calc(1rem+env(safe-area-inset-top))] ...">
    {/* 标题、返回键、操作按钮 */}
  </header>
  
  {/* 内容区域 */}
  <main className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">
    {/* 页面内容 */}
  </main>
  
  {/* TabBar（由MobileApp统一管理） */}
</div>
```

### 安全区域适配

```tsx
// 顶部安全区域
<div className="pt-[calc(1rem+env(safe-area-inset-top))]">
  {/* 内容 */}
</div>

// 底部安全区域（TabBar）
<div className="pb-[calc(4rem+env(safe-area-inset-bottom))]">
  {/* 内容 */}
</div>
```

## 🎬 动画规范

### 页面过渡动画
- **时长**: 300ms
- **缓动函数**: ease-in-out
- **实现**: 使用 `MobilePageTransition` 组件

### 组件动画
- **时长**: 200ms
- **缓动函数**: ease-out
- **实现**: 使用 `animate-scale-in` 类

### 微交互
- **时长**: 150ms
- **缓动函数**: ease-in-out
- **实现**: 使用 `active:scale-95` 或 `active:opacity-80`

## 🎯 最佳实践

### 1. 使用Design Token

**✅ 正确**:
```tsx
import { MobileButtonStyles, MobileSpacing } from '../components/MobileStyleGuide';

<button className={`${MobileButtonStyles.primary} ${MobileSpacing.padding.md}`}>
  按钮
</button>
```

**❌ 错误**:
```tsx
<button className="bg-purple-600 px-4 py-3">
  按钮
</button>
```

### 2. 使用统一组件

**✅ 正确**:
```tsx
<MobileTouchableButton variant="primary" onClick={handleClick}>
  按钮
</MobileTouchableButton>
```

**❌ 错误**:
```tsx
<button onClick={handleClick}>按钮</button>
```

### 3. 处理安全区域

**✅ 正确**:
```tsx
<div className="pb-[calc(4rem+env(safe-area-inset-bottom))]">
  {/* 内容 */}
</div>
```

**❌ 错误**:
```tsx
<div className="pb-24">
  {/* 内容 */}
</div>
```

### 4. 添加触摸反馈

**✅ 正确**:
```tsx
<div
  className="active:scale-95 transition-transform duration-150 touch-manipulation"
  onClick={handleClick}
>
  可点击元素
</div>
```

**❌ 错误**:
```tsx
<div onClick={handleClick}>
  可点击元素
</div>
```

### 5. 使用骨架屏

**✅ 正确**:
```tsx
{isLoading ? (
  <MobileSceneCardSkeleton />
) : (
  <SceneCard scene={scene} />
)}
```

**❌ 错误**:
```tsx
{isLoading ? (
  <MobileLoadingSpinner />
) : (
  <SceneCard scene={scene} />
)}
```

## 🔍 检查清单

使用组件前，请检查：
- [ ] 是否使用了Design Token系统
- [ ] 是否使用了统一组件
- [ ] 是否处理了安全区域
- [ ] 是否添加了触摸反馈
- [ ] 是否添加了无障碍支持（ARIA标签）
- [ ] 是否符合最小触摸目标（44x44px）
- [ ] 是否符合动画规范

## 📚 参考文档

- **Mobile UX设计规范**: `docs/12-开发指南/开发规范/心域开发指南.md` 第3.5节
- **Design Token系统**: `frontend/mobile/components/MobileStyleGuide.ts`
- **Mobile UX检查清单**: `docs/12-开发指南/Mobile_UX检查清单.md`
- **Mobile UX全面审计报告**: `docs/12-开发指南/Mobile_UX全面审计报告.md`

---

**最后更新**: 2025-01-08  
**维护者**: HeartSphere开发团队
