# Mobile UX检查清单

**创建日期**: 2025-01-08  
**版本**: 1.0  
**适用对象**: 所有Mobile页面和组件开发

---

## 📋 基础检查清单（必须项）

创建新Mobile页面或组件时，必须检查以下项目：

### 1. 安全区域适配 ✅
- [ ] 页面内容区域已添加底部内边距（`pb-[calc(4rem+env(safe-area-inset-bottom))]`）
- [ ] 页面顶部已处理安全区域（`pt-[calc(1rem+env(safe-area-inset-top))]`）
- [ ] 左右安全区域已处理（如需要）

### 2. 触摸目标大小 ✅
- [ ] 所有按钮符合最小触摸目标（44x44px）
- [ ] 所有可点击元素符合最小触摸目标（44x44px）
- [ ] 使用 `min-w-[44px] min-h-[44px]` 或 `MobileTouchTarget.minSize`

### 3. 交互反馈 ✅
- [ ] 所有交互元素有触摸反馈（`active:scale-95` 或 `active:opacity-80`）
- [ ] 所有按钮使用 `MobileTouchableButton` 组件
- [ ] 所有可点击卡片有触摸反馈
- [ ] 所有输入框有聚焦反馈（`focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20`）

### 4. Design Token使用 ✅
- [ ] 所有颜色使用 `MobileColors` 中定义的颜色
- [ ] 所有间距使用 `MobileSpacing` 中定义的间距（8px基准）
- [ ] 所有按钮使用 `MobileButtonStyles` 中定义的样式
- [ ] 所有卡片使用 `MobileCardStyles` 中定义的样式
- [ ] 所有输入框使用 `MobileInputStyles` 中定义的样式

### 5. 设计风格 ✅
- [ ] 符合扁平化设计风格（减少阴影层级）
- [ ] 符合简洁设计风格（充足的留白，清晰的视觉层次）
- [ ] 符合科技感设计风格（渐变背景、毛玻璃效果、柔和发光）
- [ ] 符合温馨设计风格（柔和色彩、适度圆角、友好交互）

---

## 📋 高级检查清单（推荐项）

为了达到很高的体验水平，建议检查以下项目：

### 6. 视觉一致性 ✅
- [ ] 使用统一的色彩系统（主色、辅助色、语义色）
- [ ] 使用统一的字体系统（字号、字重、行高）
- [ ] 使用统一的间距系统（8px基准）
- [ ] 使用统一的圆角和阴影规范

### 7. 加载状态 ✅
- [ ] 所有加载状态使用 `MobileLoadingSpinner` 组件
- [ ] 列表加载时使用骨架屏（`MobileSkeleton`）而不是加载指示器
- [ ] 加载状态有适当的无障碍支持（`role="status"`、`aria-label`）

### 8. 错误状态 ✅
- [ ] 所有错误提示使用 `MobileErrorToast` 组件或统一样式
- [ ] 表单验证错误使用实时的、友好的提示方式
- [ ] 错误状态有适当的无障碍支持（`role="alert"`、`aria-live="assertive"`）

### 9. 空状态 ✅
- [ ] 所有空状态使用 `MobileEmptyState` 组件
- [ ] 空状态包含友好的图标、标题、描述
- [ ] 空状态包含操作按钮（如适用）

### 10. 动画和过渡 ✅
- [ ] 所有页面过渡使用统一的动画（300ms ease-in-out）
- [ ] 所有组件动画使用统一的动画（200ms ease-out）
- [ ] 所有微交互动画使用统一的动画（150ms ease-in-out）
- [ ] 所有动画使用CSS动画而非JavaScript动画（性能更好）

### 11. 性能 ✅
- [ ] 滚动性能保持60fps（使用 `MobileSmoothScroll`）
- [ ] 图片加载使用 `MobileLazyImage` 和骨架屏占位符
- [ ] 首屏加载时间 < 1.5s（First Contentful Paint）
- [ ] 可交互时间 < 3s（Time to Interactive）

### 12. 无障碍设计 ✅
- [ ] 所有交互元素有适当的ARIA标签（`aria-label`、`aria-describedby`等）
- [ ] 所有功能可以通过键盘访问（Tab、Enter、Esc、Arrow keys）
- [ ] 焦点指示器清晰可见（`focus-visible:outline-2 focus-visible:outline-purple-500`）
- [ ] 文本对比度符合WCAG AA标准（至少4.5:1）
- [ ] 动态内容变化有适当的ARIA属性（`aria-live`、`aria-atomic`等）

### 13. 响应式适配 ✅
- [ ] 所有页面在不同屏幕尺寸下布局正确
- [ ] 字体大小在小屏设备上可读
- [ ] 触摸目标在小屏设备上仍然可访问（最小44x44px）
- [ ] 横屏模式下布局合理（或锁定竖屏）

---

## 📋 组件特定检查清单

### 按钮组件
- [ ] 使用 `MobileTouchableButton` 组件
- [ ] 符合最小触摸目标（44x44px）
- [ ] 有触摸反馈（`active:scale-95`）
- [ ] 使用统一的样式（`MobileButtonStyles`）
- [ ] 有适当的ARIA标签（如 `aria-label`）

### 输入框组件
- [ ] 使用统一的样式（`MobileInputStyles`）
- [ ] 符合最小高度（44px）
- [ ] 有聚焦反馈（`focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20`）
- [ ] 有触摸优化（`touch-manipulation`）
- [ ] 有适当的ARIA标签（如 `aria-label`、`aria-describedby`）

### 卡片组件
- [ ] 使用统一的样式（`MobileCardStyles`）
- [ ] 有触摸反馈（如可点击）
- [ ] 有适当的阴影和边框
- [ ] 有适当的圆角（`rounded-xl`）

### 模态框组件
- [ ] 使用统一的样式（`MobileModalStyles`）
- [ ] 有毛玻璃效果（`backdrop-blur-xl`）
- [ ] 点击背景关闭（如适用）
- [ ] 按ESC键关闭（如适用）
- [ ] 有适当的ARIA标签（`role="dialog"`、`aria-labelledby`等）

### 返回键组件
- [ ] 使用 `MobileBackButton` 组件
- [ ] 符合最小触摸目标（44x44px）
- [ ] 有触摸反馈
- [ ] 有适当的ARIA标签（`aria-label="返回"`）

---

## 📋 页面特定检查清单

### 场景选择页面
- [ ] 使用骨架屏（`MobileSceneCardSkeleton`）显示加载状态
- [ ] 场景卡片有触摸反馈（`active:scale-[0.97]`）
- [ ] 使用统一的色彩系统（indigo-purple渐变）
- [ ] 空状态使用 `MobileEmptyState` 组件

### 聊天页面
- [ ] 返回键使用 `MobileBackButton` 组件
- [ ] 输入框使用统一的样式
- [ ] 消息气泡有适当的样式和动画
- [ ] 键盘弹出时布局调整正确

### 个人资料页面
- [ ] 头像编辑有适当的交互反馈
- [ ] 表单验证有友好的提示
- [ ] 成功状态有适当的提示

---

## 📋 代码审查检查清单

代码审查时，检查以下项目：

### 视觉一致性
- [ ] 是否使用Design Token系统（`MobileStyleGuide.ts`）
- [ ] 是否避免硬编码的样式值
- [ ] 是否符合设计规范（扁平化、简洁、科技感、温馨）

### 交互体验
- [ ] 所有交互元素是否有触摸反馈
- [ ] 触摸反馈是否一致
- [ ] 页面过渡是否有动画
- [ ] 动画时长是否符合规范（300ms页面、200ms组件、150ms微交互）

### 性能
- [ ] 是否使用性能优化技术（React.memo、useMemo、useCallback）
- [ ] 滚动性能是否流畅（60fps）
- [ ] 图片加载是否使用懒加载
- [ ] 首屏加载时间是否合理（< 1.5s FCP）

### 无障碍
- [ ] 是否有适当的ARIA标签
- [ ] 是否支持键盘导航
- [ ] 焦点指示器是否清晰
- [ ] 文本对比度是否符合WCAG AA标准

### 响应式
- [ ] 不同屏幕尺寸下布局是否正确
- [ ] 横屏模式下布局是否合理
- [ ] 字体大小是否可读
- [ ] 触摸目标是否可访问

---

## 📋 特殊说明

### MobileConnectionSpaceScreen（心域连接星空页面）
**特殊处理**: 此页面的视觉设计和交互体验已经比较满意，**尽量不改动**。

**允许的修改**:
- 修复TabBar遮挡问题（添加底部内边距）
- 修复安全区域适配问题
- 修复其他技术性问题

**不允许的修改**:
- 改变Canvas星空动画逻辑
- 改变布局和视觉风格
- 改变交互逻辑

---

## 📋 参考文档

- **Mobile UX设计规范**: `docs/12-开发指南/开发规范/心域开发指南.md` 第3.5节
- **Design Token系统**: `frontend/mobile/components/MobileStyleGuide.ts`
- **Mobile UX全面审计报告**: `docs/12-开发指南/Mobile_UX全面审计报告.md`
- **Mobile组件库**: `frontend/mobile/components/`

---

**最后更新**: 2025-01-08  
**维护者**: HeartSphere开发团队
