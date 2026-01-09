# Change: Create Company Website

## Why

泰安正心智能科技有限公司需要一个官方官方网站来：
1. 展示公司理念和文化（"正心"的哲学内涵）
2. 介绍核心产品"心域"（HeartSphere）的功能和特色
3. 展示公司在人工智能领域的其他服务能力
4. 建立品牌形象，体现科技感与温度感的平衡
5. 提供公司联系方式和业务咨询入口

目前系统只有产品应用本身，缺少面向公众的公司官网，无法有效传达公司价值和产品理念。

### 公司背景

**公司名称**：泰安正心智能科技有限公司

**核心理念**："正心"来自《大学》八条目"格物、致知、诚意、正心、修身、齐家、治国、平天下"中的"正心"，起到承上启下的作用。正心是连接内在修养（格物、致知、诚意）与外在实践（修身、齐家、治国、平天下）的桥梁，体现了公司在人工智能领域追求技术与人文平衡的理念。

**核心产品**：心域（HeartSphere）是正心智能的核心产品，是一个数字生命体交互系统，提供AI对话、场景管理、角色扮演、剧本系统等功能。

**业务范围**：除了心域产品外，公司还可以提供人工智能相关的其他服务。

## What Changes

- **ADDED**: 公司官网独立页面/路由系统，包含以下主要模块：
  - 首页（Hero Section）：公司介绍、核心理念展示，体现科技感与温度感
  - 关于我们：正心理念详解（《大学》八条目中的"正心"及其承上启下的作用），包含理念图解、哲学内涵阐释
  - 核心产品：心域（HeartSphere）详细介绍，包含功能特色、使用场景、图文展示、产品截图、功能演示等
  - AI服务：其他人工智能相关服务介绍，展示公司在AI领域的能力
  - 联系我们：公司信息、联系方式、业务咨询表单
- **ADDED**: 响应式设计，支持桌面端和移动端访问
- **ADDED**: 科技感与温度感并重的视觉设计系统
- **ADDED**: 图片资源管理和展示系统（公司照片、产品截图、理念图解等）
- **ADDED**: SEO优化支持（meta标签、结构化数据等）

## Impact

- **Affected specs**: New capability `company-website` (to be created)
- **Affected code**:
  - New: `frontend/pages/company/` - 公司官网页面组件
    - `HomePage.tsx` - 首页
    - `AboutPage.tsx` - 关于我们
    - `ProductPage.tsx` - 核心产品介绍
    - `ServicesPage.tsx` - AI服务介绍
    - `ContactPage.tsx` - 联系我们
  - New: `frontend/components/company/` - 公司官网专用组件
    - `HeroSection.tsx` - 首页Hero区域
    - `PhilosophySection.tsx` - 正心理念展示
    - `ProductShowcase.tsx` - 产品展示组件
    - `ServiceCard.tsx` - 服务卡片组件
    - `ContactForm.tsx` - 联系表单
  - New: `frontend/routes/company.tsx` - 公司官网路由配置
  - Modified: `frontend/App.tsx` - 添加公司官网路由
  - New: `frontend/public/company/` - 公司官网静态资源（图片、文档等）
  - New: `backend/src/main/java/com/heartsphere/controller/CompanyController.java` - 公司官网相关API（如联系表单提交）
  - New: `backend/src/main/java/com/heartsphere/service/CompanyService.java` - 公司官网业务逻辑
- **New dependencies**: 
  - 可能需要动画库（如 framer-motion）用于页面过渡效果
  - 可能需要图标库（如 react-icons）用于UI图标
- **Storage**: 公司官网相关图片和文档资源
- **Deployment**: 可能需要独立的子域名或路径（如 `www.heartsphere.cn` 或 `heartsphere.cn/company`）

## Non-Breaking Changes

这是一个全新的功能模块，不影响现有的产品应用功能。公司官网可以作为独立的路由或子应用部署。
