## 1. 主题定义

- [x] 1.1 创建 `main/frontend/src/themes/classic-dark.ts` - 定义经典深色模式主题
- [x] 1.2 创建 `main/frontend/src/themes/modern-light.ts` - 定义现代浅色模式主题
- [x] 1.3 更新 `main/frontend/src/themes/index.ts` - 注册新主题到主题注册表
- [x] 1.4 更新 `main/frontend/src/types/theme.ts` - 扩展 `ThemeId` 类型，添加新主题ID

## 2. CSS变量定义

- [x] 2.1 在 `main/frontend/src/tokens.css` 中添加经典深色模式的CSS变量
- [x] 2.2 在 `main/frontend/src/tokens.css` 中添加现代浅色模式的CSS变量
- [x] 2.3 确保所有设计令牌都有对应的CSS变量（背景色、文字色、主色调、语义色、阴影、圆角、渐变等）

## 3. 主题选择器更新

- [x] 3.1 更新 `main/frontend/components/ThemeSelector.tsx` - 添加新主题选项和预览（已自动支持，使用themes.map遍历）
- [x] 3.2 更新 `main/frontend/mobile/components/MobileThemeSelector.tsx` - 添加新主题选项和预览（已自动支持，使用themes.map遍历）
- [x] 3.3 为主题选择器添加主题预览功能（显示主题的关键视觉元素）（已实现）

## 4. 测试和验证

- [ ] 4.1 测试新主题在PC端所有页面的显示效果
- [ ] 4.2 测试新主题在移动端所有页面的显示效果
- [ ] 4.3 验证颜色对比度符合WCAG AA标准
- [ ] 4.4 测试主题切换的流畅性和性能
- [ ] 4.5 测试主题持久化功能（localStorage）

## 5. 文档更新

- [ ] 5.1 更新主题系统文档，说明新主题的特点和使用场景
- [ ] 5.2 更新UX设计规范，添加新主题的设计说明
