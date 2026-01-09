# 公司官网测试

## 测试文件

- `ContactForm.test.tsx` - 联系表单组件测试
- `Navigation.test.tsx` - 导航组件测试
- `FeatureCard.test.tsx` - 功能卡片组件测试

## 运行测试

```bash
# 运行所有测试
npm test

# 运行公司官网相关测试
npm test -- company

# 监视模式
npm test -- --watch company
```

## 测试覆盖

### 已测试组件
- ✅ ContactForm - 表单验证、提交功能
- ✅ Navigation - 导航菜单、移动端菜单
- ✅ FeatureCard - 卡片渲染

### 待测试组件
- HomePage
- AboutPage
- ProductPage
- ServicesPage
- ContactPage
- HeroSection
- PhilosophySection
- ProductShowcase
- ServiceCard
- Footer

## 测试说明

测试使用 Jest 和 React Testing Library，遵循以下原则：
1. 测试用户可见的行为
2. 测试关键交互功能
3. 测试表单验证和提交
4. 测试响应式行为

## 扩展测试

可以添加以下测试：
- 页面路由测试
- SEO标签测试
- 动画效果测试（需要特殊配置）
- 响应式设计测试（需要视口模拟）
