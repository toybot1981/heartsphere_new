# 公司官网模块

## 概述

泰安正心智能科技有限公司的官方官方网站，展示公司理念、核心产品和AI服务。

## 访问路径

- 首页：`/company`
- 关于我们：`/company/about`
- 核心产品：`/company/product`
- AI服务：`/company/services`
- 联系我们：`/company/contact`

## 功能特性

### 已实现功能

1. **基础架构**
   - 路由系统（基于路径检测）
   - 响应式布局组件
   - 导航栏和页脚

2. **页面内容**
   - 首页：Hero区域、核心理念预览、产品亮点
   - 关于我们：正心理念详解、八条目可视化
   - 核心产品：产品展示、功能卡片、截图展示
   - AI服务：服务列表和卡片
   - 联系我们：联系表单

3. **视觉效果**
   - 动画效果（framer-motion）
   - 页面过渡动画
   - 滚动触发动画
   - 悬停效果和微交互
   - 科技感与温度感并重的设计

4. **SEO优化**
   - Meta标签（title, description, keywords）
   - Open Graph标签（社交媒体分享）
   - 结构化数据（JSON-LD）

5. **后端API**
   - 联系表单提交API
   - 数据验证
   - 邮件通知

## 技术栈

- React 18 + TypeScript
- Tailwind CSS
- Framer Motion（动画）
- React Helmet Async（SEO）

## 文件结构

```
frontend/
├── pages/company/          # 页面组件
│   ├── HomePage.tsx
│   ├── AboutPage.tsx
│   ├── ProductPage.tsx
│   ├── ServicesPage.tsx
│   └── ContactPage.tsx
├── components/company/      # 组件
│   ├── Layout.tsx
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── PhilosophySection.tsx
│   ├── ProductShowcase.tsx
│   ├── ServiceCard.tsx
│   ├── ContactForm.tsx
│   ├── animations.tsx      # 动画工具
│   └── SEOHead.tsx         # SEO组件
└── routes/
    └── company.tsx         # 路由配置
```

## 待完成工作

1. **图片资源**（Step 9）
   - 公司Logo和品牌素材
   - 正心理念相关图片和图表
   - 心域产品截图和演示图
   - AI服务相关图片

2. **测试**（Step 10）
   - 单元测试
   - 集成测试
   - 跨浏览器测试
   - 响应式设计测试

## 使用说明

### 开发环境

1. 启动开发服务器：
```bash
cd frontend
npm run dev
```

2. 访问公司官网：
```
http://localhost:3000/company
```

### 生产环境

1. 构建项目：
```bash
cd frontend
npm run build
```

2. 部署到服务器（根据部署配置）

## 注意事项

1. **图片资源**：当前使用占位符，需要替换为实际图片
2. **邮件配置**：联系表单的邮件通知需要配置邮件服务器
3. **SEO优化**：需要根据实际域名更新SEOHead中的URL
4. **响应式设计**：已在组件中实现，建议在不同设备上测试

## 更新日志

- 2026-01-08: 初始版本完成
  - 完成基础架构和路由系统
  - 完成所有页面和组件
  - 添加动画效果和SEO优化
  - 完成后端API集成
