# 心域-教育版前端

## 项目简介

心域-教育版是一个专为小学生和中学生设计的AI学习平台，通过有趣的场景构建、角色创建、AI对话等方式，让学习变得更有趣。

## 技术栈

- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **React Router** - 路由管理

## 项目结构

```
frontend-edu/
├── src/
│   ├── components/         # 组件
│   │   ├── common/        # 通用组件
│   │   └── layout/        # 布局组件
│   ├── pages/             # 页面
│   │   ├── student/       # 学生端页面
│   │   ├── teacher/       # 教师端页面
│   │   └── parent/        # 家长端页面
│   ├── types/             # 类型定义
│   │   ├── index.ts       # 基础类型
│   │   └── mock.ts        # Mock数据
│   ├── App.tsx            # 应用入口
│   └── main.tsx           # 入口文件
├── public/                # 静态资源
└── package.json           # 依赖配置
```

## 功能模块

### 学生端

1. **登录/注册** - 学生账户登录和注册
2. **主页（Dashboard）** - 小学生版和中学生版
3. **场景管理** - 创建、编辑、查看学习场景
4. **角色管理** - 创建、编辑AI角色
5. **AI对话** - 与AI进行学习对话
6. **作业系统** - 查看和提交作业
7. **心理辅导** - 情绪支持和心理辅导
8. **个人中心** - 查看学习统计和个人信息

### 教师端

1. **登录** - 教师账户登录
2. **主页（Dashboard）** - 教学概览
3. **学生管理** - 查看和管理学生
4. **课程管理** - 创建和管理课程
5. **作业管理** - 布置和批改作业
6. **进度监控** - 查看学生学习进度
7. **资源库** - 管理和分享教学资源
8. **个人中心** - 教师个人信息

### 家长端

1. **登录** - 家长账户登录
2. **主页（Dashboard）** - 孩子学习概览
3. **学习报告** - 详细的学习分析报告
4. **作业情况** - 查看孩子的作业完成情况
5. **AI使用情况** - 了解孩子的AI使用情况
6. **时间管理** - 设置使用时长和时间段
7. **内容控制** - 设置允许访问的内容类型
8. **情绪健康** - 查看孩子的情绪健康摘要
9. **个人中心** - 家长个人信息

## 年龄分级设计

### 小学生版（Elementary）

- **配色**：明亮、活泼的色彩（橙色、黄色为主）
- **字体**：较大、易读的字体
- **界面**：简洁、图标丰富
- **语言**：使用emoji和简单易懂的文字

### 中学生版（Middle）

- **配色**：更成熟的配色（蓝色、绿色为主）
- **字体**：标准字体大小
- **界面**：更专业、功能完整
- **语言**：更正式的用语，功能描述更详细

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3001

### 类型检查

```bash
npm run check:types
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

## 路由说明

### 学生端路由

- `/login` - 登录页面
- `/student/dashboard/:ageGroup` - 学生主页（elementary/middle）
- `/student/scenes` - 场景列表
- `/student/scenes/create` - 创建场景
- `/student/scenes/:id` - 场景详情/编辑
- `/student/characters` - 角色列表
- `/student/characters/create` - 创建角色
- `/student/characters/:id` - 角色详情
- `/student/ai-chat` - AI对话
- `/student/homework` - 作业列表
- `/student/homework/:id` - 作业详情
- `/student/counseling` - 心理辅导
- `/student/profile` - 个人中心

### 教师端路由

- `/teacher/login` - 教师登录
- `/teacher/dashboard` - 教师主页
- `/teacher/students` - 学生管理
- `/teacher/courses` - 课程管理
- `/teacher/homework` - 作业管理
- `/teacher/progress` - 进度监控
- `/teacher/resources` - 资源库
- `/teacher/profile` - 个人中心

### 家长端路由

- `/parent/login` - 家长登录
- `/parent/dashboard` - 家长主页
- `/parent/report` - 学习报告
- `/parent/homework` - 作业情况
- `/parent/ai-usage` - AI使用情况
- `/parent/time-control` - 时间管理
- `/parent/content-control` - 内容控制
- `/parent/emotional-summary` - 情绪健康
- `/parent/profile` - 个人中心

## 设计规范

### 颜色系统

- **小学生版主色**：橙色系（#FF9800）
- **中学生版主色**：蓝色系（#2196F3）
- **辅助色**：绿色、紫色、黄色
- **中性色**：灰色系

### 组件规范

- 使用 Tailwind CSS 进行样式设计
- 组件支持 `ageGroup` 属性，自动适配不同年龄段
- 所有交互元素都有明确的视觉反馈

### 响应式设计

- **移动端**：< 768px
- **平板**：768px - 1024px
- **桌面**：> 1024px

## 当前状态

✅ Phase 1: 原型界面开发 - 已完成

- [x] 项目初始化和设计系统
- [x] UI设计系统和组件库
- [x] Mock数据准备
- [x] 学生端界面原型（11个页面）
- [x] 教师端界面原型（8个页面）
- [x] 家长端界面原型（9个页面）
- [x] 管理后台界面原型（8个页面）

⏳ Phase 2: 基础架构搭建 - 待开发

## 注意事项

- 当前使用 Mock 数据，不涉及后端API
- 所有页面都是原型阶段，实际功能待实现
- 年龄分级通过 URL 参数 `ageGroup` 传递

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License