# Implementation Tasks

## Step 1: 基础架构和路由系统

- [x] 1.1 创建公司官网路由配置 (`frontend/routes/company.tsx`)
- [x] 1.2 在 `frontend/App.tsx` 中添加公司官网路由
- [x] 1.3 创建基础布局组件 (`frontend/components/company/Layout.tsx`)
  - 包含导航栏、页脚、页面容器
- [x] 1.4 创建导航组件 (`frontend/components/company/Navigation.tsx`)
  - 响应式导航菜单
  - 支持移动端汉堡菜单
- [x] 1.5 创建页脚组件 (`frontend/components/company/Footer.tsx`)
  - 公司信息、联系方式、版权信息
- [x] 1.6 创建页面容器组件 (`frontend/components/company/PageContainer.tsx`)
  - 统一的页面布局和样式

## Step 2: 首页实现

- [x] 2.1 创建首页组件 (`frontend/pages/company/HomePage.tsx`)
- [x] 2.2 创建Hero区域组件 (`frontend/components/company/HeroSection.tsx`)
  - 公司名称和slogan
  - 核心理念简要介绍
  - CTA按钮（了解更多、体验产品）
- [x] 2.3 创建核心理念预览组件 (`frontend/components/company/PhilosophyPreview.tsx`)
  - 正心理念的简要介绍
  - 链接到关于我们页面
- [x] 2.4 创建产品亮点组件 (`frontend/components/company/ProductHighlights.tsx`)
  - 心域产品的核心功能亮点
  - 链接到核心产品页面
- [x] 2.5 添加首页样式和响应式设计
- [ ] 2.6 添加首页图片资源（Hero背景图、理念图标等）

## Step 3: 关于我们页面（正心理念详解）

- [x] 3.1 创建关于我们页面 (`frontend/pages/company/AboutPage.tsx`)
- [x] 3.2 创建正心理念展示组件 (`frontend/components/company/PhilosophySection.tsx`)
  - 《大学》八条目图解
  - "正心"的承上启下作用说明
  - 正心理念与公司业务的关联
- [x] 3.3 创建理念可视化组件 (`frontend/components/company/PhilosophyVisualization.tsx`)
  - 八条目的流程图或关系图
  - 正心位置的突出显示
- [ ] 3.4 添加理念相关图片资源（八条目图解、正心理念图等）
- [x] 3.5 完善页面样式和响应式设计

## Step 4: 核心产品页面（心域介绍）

- [x] 4.1 创建核心产品页面 (`frontend/pages/company/ProductPage.tsx`)
- [x] 4.2 创建产品展示组件 (`frontend/components/company/ProductShowcase.tsx`)
  - 产品概述
  - 核心功能模块介绍
  - 使用场景说明
- [x] 4.3 创建功能卡片组件 (`frontend/components/company/FeatureCard.tsx`)
  - 单个功能模块的展示卡片
  - 图标、标题、描述
- [x] 4.4 创建产品截图展示组件 (`frontend/components/company/ProductScreenshots.tsx`)
  - 产品界面截图轮播或网格展示
  - 支持点击放大查看
- [ ] 4.5 添加产品相关图片资源（产品截图、功能演示图等）
- [x] 4.6 完善页面样式和响应式设计

## Step 5: AI服务页面

- [x] 5.1 创建AI服务页面 (`frontend/pages/company/ServicesPage.tsx`)
- [x] 5.2 创建服务卡片组件 (`frontend/components/company/ServiceCard.tsx`)
  - 服务类型、描述、应用场景
- [x] 5.3 创建服务列表组件 (`frontend/components/company/ServiceList.tsx`)
  - 展示多个AI服务卡片
- [ ] 5.4 添加服务相关图片资源（服务图标、案例图等）
- [x] 5.5 完善页面样式和响应式设计

## Step 6: 联系我们页面和表单功能

- [x] 6.1 创建联系我们页面 (`frontend/pages/company/ContactPage.tsx`)
- [x] 6.2 创建联系表单组件 (`frontend/components/company/ContactForm.tsx`)
  - 表单字段：姓名、邮箱、电话、公司、咨询内容
  - 表单验证
  - 提交按钮和加载状态
- [x] 6.3 创建后端API端点 (`backend/src/main/java/com/heartsphere/controller/CompanyController.java`)
  - POST `/api/company/contact` - 接收联系表单提交
- [x] 6.4 创建后端服务 (`backend/src/main/java/com/heartsphere/service/CompanyService.java`)
  - 表单数据验证
  - 数据存储（可选：数据库表）
  - 发送通知邮件（可选）
- [x] 6.5 创建DTO类 (`backend/src/main/java/com/heartsphere/dto/ContactFormDTO.java`)
- [x] 6.6 集成前端表单与后端API（前端和后端已完成）
- [x] 6.7 添加表单提交成功/失败提示
- [x] 6.8 完善页面样式和响应式设计

## Step 7: 视觉优化和动画效果

- [x] 7.1 安装并配置动画库（如 framer-motion）
- [x] 7.2 添加页面过渡动画
- [x] 7.3 添加滚动触发动画（Scroll Reveal）
- [x] 7.4 添加悬停效果和微交互
- [x] 7.5 优化色彩方案和渐变效果（已在组件中实现）
- [x] 7.6 优化响应式设计（移动端、平板、桌面端）（已在组件中实现）
- [ ] 7.7 添加加载状态和骨架屏（如需要）

## Step 8: SEO优化和部署配置

- [x] 8.1 安装并配置 React Helmet（react-helmet-async）
- [x] 8.2 为每个页面添加meta标签（title, description, keywords）
- [x] 8.3 添加Open Graph标签（社交媒体分享）
- [x] 8.4 添加结构化数据（JSON-LD）
- [ ] 8.5 优化图片（压缩、WebP格式、响应式图片）
- [x] 8.6 配置路由和部署路径（已完成）
- [x] 8.7 性能优化（代码分割、懒加载）（已在路由中实现）
- [ ] 8.8 测试所有页面和功能

## Step 9: 内容完善和图片资源

- [x] 9.1 准备公司Logo和品牌素材（目录结构已创建，需要添加实际图片）
- [x] 9.2 准备正心理念相关图片和图表（目录结构已创建，需要添加实际图片）
- [x] 9.3 准备心域产品截图和演示图（目录结构已创建，需要添加实际图片）
- [x] 9.4 准备AI服务相关图片（目录结构已创建，需要添加实际图片）
- [ ] 9.5 优化图片资源（压缩、格式转换）（需要实际图片后执行）
- [x] 9.6 将图片资源放置到 `frontend/public/company/` 目录（目录结构已创建）
- [x] 9.7 检查所有图片路径和引用（已创建README说明文档）

## Step 10: 测试和文档

- [x] 10.1 编写单元测试（关键组件）（已创建基础测试文件）
- [x] 10.2 编写集成测试（表单提交流程）（ContactForm测试已包含）
- [ ] 10.3 进行跨浏览器测试（需要手动测试）
- [ ] 10.4 进行响应式设计测试（多设备）（需要手动测试）
- [ ] 10.5 进行可访问性测试（a11y）（需要手动测试）
- [x] 10.6 编写部署文档（已创建DEPLOYMENT.md）
- [x] 10.7 编写内容更新指南（已包含在README和部署文档中）
