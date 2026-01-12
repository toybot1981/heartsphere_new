# Mobile UX无障碍设计检查清单

**创建日期**: 2025-01-08  
**版本**: 1.0  
**适用对象**: 所有Mobile页面和组件开发

---

## 📋 概述

本检查清单用于确保Mobile应用符合WCAG 2.1 AA级别标准，支持键盘导航、屏幕阅读器、适当的对比度等。

## 🎯 无障碍标准

### WCAG 2.1 AA级别要求
- **文本对比度**: 至少4.5:1（正常文本）或3:1（大文本）
- **键盘导航**: 所有功能可以通过键盘访问
- **屏幕阅读器**: 所有内容可以被屏幕阅读器访问
- **焦点管理**: 焦点指示器清晰可见
- **语义化HTML**: 使用语义化HTML元素

## ✅ ARIA标签

### 检查项
- [ ] 所有交互元素有适当的 `aria-label` 或 `aria-labelledby`
- [ ] 所有表单字段有适当的 `aria-describedby`（如果有提示信息）
- [ ] 所有表单字段有适当的 `aria-required`（如果必填）
- [ ] 所有表单字段有适当的 `aria-invalid`（如果有错误）
- [ ] 所有模态框有 `role="dialog"` 和 `aria-modal="true"`
- [ ] 所有加载状态有 `role="status"` 和 `aria-label`
- [ ] 所有错误提示有 `role="alert"` 和 `aria-live="assertive"`
- [ ] 所有成功提示有 `role="status"` 和 `aria-live="polite"`
- [ ] 所有图片有适当的 `alt` 文本
- [ ] 所有装饰性图片有 `aria-hidden="true"`

### 实现示例
```tsx
// ✅ 正确：按钮有aria-label
<button
  onClick={handleClick}
  aria-label="关闭"
>
  <svg aria-hidden="true">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
</button>

// ✅ 正确：表单字段有aria属性
<input
  type="text"
  aria-label="用户名"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={error ? "error-id" : "hint-id"}
/>

// ✅ 正确：模态框有role和aria-modal
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">标题</h2>
  {/* 内容 */}
</div>

// ✅ 正确：加载状态有role和aria-label
<div role="status" aria-label="加载中">
  <MobileLoadingSpinner />
</div>

// ✅ 正确：错误提示有role和aria-live
<div role="alert" aria-live="assertive">
  错误信息
</div>
```

## ✅ 键盘导航

### 检查项
- [ ] 所有交互元素可以通过Tab键访问
- [ ] 所有交互元素可以通过Enter键或空格键激活
- [ ] 所有模态框可以通过ESC键关闭（如适用）
- [ ] 所有下拉菜单可以通过Arrow keys导航
- [ ] 所有表单字段可以通过Tab键导航
- [ ] 焦点顺序逻辑合理（从上到下、从左到右）
- [ ] 焦点不会被困在某个区域
- [ ] 焦点指示器清晰可见

### 实现示例
```tsx
// ✅ 正确：支持键盘导航
<div
  onClick={handleClick}
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  role="button"
  tabIndex={0}
  aria-label="操作"
>
  可点击元素
</div>

// ✅ 正确：支持ESC键关闭模态框
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  document.addEventListener('keydown', handleEscape);
  return () => {
    document.removeEventListener('keydown', handleEscape);
  };
}, [onClose]);
```

## ✅ 焦点管理

### 检查项
- [ ] 所有交互元素有清晰的焦点指示器
- [ ] 使用 `focus-visible` 类显示焦点指示器
- [ ] 焦点指示器有足够的对比度（至少3:1）
- [ ] 焦点指示器大小足够（至少2px）
- [ ] 焦点顺序逻辑合理
- [ ] 焦点不会跳过重要元素
- [ ] 焦点被正确管理（模态框打开时焦点移到模态框内）

### 实现示例
```tsx
// ✅ 正确：使用focus-visible显示焦点指示器
<button
  className="focus-visible:outline-2 focus-visible:outline-purple-500 focus-visible:outline-offset-2"
  onClick={handleClick}
>
  按钮
</button>

// ✅ 正确：模态框打开时焦点移到模态框内
useEffect(() => {
  if (isOpen) {
    const firstFocusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    firstFocusable?.focus();
  }
}, [isOpen]);
```

## ✅ 文本对比度

### 检查项
- [ ] 正常文本（小于18px）对比度至少4.5:1
- [ ] 大文本（18px以上）对比度至少3:1
- [ ] 交互元素（按钮、链接）对比度至少4.5:1
- [ ] 使用对比度检查工具验证对比度
- [ ] 避免使用低对比度颜色组合

### 颜色对比度参考
```tsx
// ✅ 正确：高对比度颜色组合
// 白色文字 on 黑色背景: 21:1
// 白色文字 on 深灰背景: 12.63:1
// 紫色文字 on 黑色背景: 约8:1

// ❌ 错误：低对比度颜色组合
// 灰色文字 on 深灰背景: 约2:1（不满足要求）
```

## ✅ 屏幕阅读器支持

### 检查项
- [ ] 所有内容使用语义化HTML元素
- [ ] 所有表单使用 `<label>` 关联输入框
- [ ] 所有图片有适当的 `alt` 文本
- [ ] 所有装饰性图片有 `aria-hidden="true"`
- [ ] 所有动态内容变化有适当的 `aria-live` 属性
- [ ] 所有列表使用 `<ul>`、`<ol>`、`<li>` 元素
- [ ] 所有标题使用 `<h1>`-`<h6>` 元素，层级合理
- [ ] 所有导航使用 `<nav>` 元素

### 实现示例
```tsx
// ✅ 正确：使用语义化HTML
<nav role="navigation" aria-label="主导航">
  <ul>
    <li>
      <a href="/home" aria-current="page">首页</a>
    </li>
  </ul>
</nav>

// ✅ 正确：表单字段关联label
<label htmlFor="username">
  用户名
  <input
    id="username"
    type="text"
    aria-required="true"
  />
</label>

// ✅ 正确：图片有alt文本
<img
  src={imageUrl}
  alt="描述性文本"
/>

// ✅ 正确：装饰性图片隐藏
<svg aria-hidden="true">
  <path d="..." />
</svg>

// ✅ 正确：动态内容有aria-live
<div role="status" aria-live="polite">
  {statusMessage}
</div>
```

## ✅ 触摸目标大小

### 检查项
- [ ] 所有触摸目标至少44x44px（iOS推荐）
- [ ] 所有触摸目标至少48x48px（Android推荐）
- [ ] 触摸目标之间有足够的间距（至少8px）
- [ ] 使用 `min-w-[44px] min-h-[44px]` 或 `MobileTouchTarget.minSize`

### 实现示例
```tsx
// ✅ 正确：触摸目标至少44x44px
<button className="min-w-[44px] min-h-[44px] px-4 py-3">
  按钮
</button>

// ✅ 正确：使用MobileTouchTarget常量
import { MobileTouchTarget } from '../components/MobileStyleGuide';

<button className={`${MobileTouchTarget.minSize} px-4 py-3`}>
  按钮
</button>
```

## ✅ 语义化HTML

### 检查项
- [ ] 使用语义化HTML元素（`<header>`、`<nav>`、`<main>`、`<footer>`等）
- [ ] 标题层级合理（`<h1>`-`<h6>`）
- [ ] 列表使用 `<ul>`、`<ol>`、`<li>`
- [ ] 表单使用 `<form>`、`<label>`、`<input>`、`<button>`
- [ ] 导航使用 `<nav>`
- [ ] 主要内容使用 `<main>`
- [ ] 避免使用 `<div>` 替代语义化元素

### 实现示例
```tsx
// ✅ 正确：使用语义化HTML
<header>
  <h1>页面标题</h1>
  <nav aria-label="主导航">
    <ul>
      <li><a href="/">首页</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h2>文章标题</h2>
    <p>文章内容</p>
  </article>
</main>

<footer>
  <p>版权信息</p>
</footer>

// ❌ 错误：使用div替代语义化元素
<div>
  <div>页面标题</div>
  <div>
    <div><a href="/">首页</a></div>
  </div>
</div>
```

## ✅ 颜色和视觉

### 检查项
- [ ] 不单独使用颜色传达信息（结合文字或图标）
- [ ] 错误状态使用颜色和文字/图标
- [ ] 成功状态使用颜色和文字/图标
- [ ] 警告状态使用颜色和文字/图标
- [ ] 信息状态使用颜色和文字/图标

### 实现示例
```tsx
// ✅ 正确：使用颜色和文字/图标
<div className="bg-red-500/20 border border-red-500/50 text-red-400">
  <svg aria-hidden="true">...</svg>
  <span>错误：用户名不能为空</span>
</div>

// ❌ 错误：单独使用颜色
<div className="bg-red-500/20">
  {/* 没有文字说明，色盲用户无法理解 */}
</div>
```

## 📊 无障碍检查清单总结

### 必须项
- [ ] 所有交互元素有适当的ARIA标签
- [ ] 所有功能可以通过键盘访问
- [ ] 文本对比度至少4.5:1（正常文本）
- [ ] 触摸目标至少44x44px
- [ ] 焦点指示器清晰可见
- [ ] 所有图片有适当的alt文本

### 推荐项
- [ ] 所有内容使用语义化HTML
- [ ] 动态内容变化有适当的aria-live属性
- [ ] 模态框打开时焦点移到模态框内
- [ ] 使用无障碍测试工具（axe-core等）验证
- [ ] 使用屏幕阅读器测试
- [ ] 使用键盘导航测试

## 🔧 无障碍测试工具

### 推荐工具
- **axe DevTools**: Chrome扩展，检测无障碍问题
- **WAVE**: 浏览器扩展，检测无障碍问题
- **Lighthouse**: Chrome DevTools，包含无障碍评分
- **NVDA/JAWS**: 屏幕阅读器，测试屏幕阅读器支持
- **Keyboard Navigation**: 使用Tab、Enter、Esc、Arrow keys测试

### 使用示例
```bash
# 使用axe-core进行无障碍测试
npm install --save-dev @axe-core/react

# 在开发模式下运行无障碍检查
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

## 📚 参考文档

- **Mobile UX设计规范**: `docs/12-开发指南/开发规范/心域开发指南.md` 第3.5.9.8节（无障碍设计标准）
- **WCAG 2.1标准**: [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- **ARIA规范**: [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- **无障碍最佳实践**: [WebAIM无障碍指南](https://webaim.org/)

---

**最后更新**: 2025-01-08  
**维护者**: HeartSphere开发团队
