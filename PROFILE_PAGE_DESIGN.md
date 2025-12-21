# 用户个人资料页面设计方案

## 页面定位
"我"是心域的主人，这个页面是用户专属的个人中心，提供个人信息管理、数据统计查看以及与用户相关的所有内容。

## 页面结构设计

### 1. 头部区域（Header Section）
- **用户头像**（可点击上传/更换）
- **昵称**（可编辑）
- **用户ID/邮箱**（显示但不直接编辑）
- **注册时间/加入心域时间**
- **会员状态标识**（如果有会员系统）

### 2. 核心数据统计卡片（Statistics Cards）
采用网格布局，展示关键数据指标：

#### 2.1 心域探索统计
- **场景数量**：访问过的场景数
- **角色互动**：互动过的角色数
- **对话轮数**：总对话消息数
- **活跃天数**：连续/总活跃天数

#### 2.2 内容创作统计
- **日记碎片**：已创建的日记条目数
- **自定义角色**：创建的自定义角色数
- **自定义场景**：创建的自定义场景数
- **剧本创作**：创建的剧本数

#### 2.3 社交互动统计
- **时光信件**：收到的信件总数
- **未读信件**：未读信件数（带红点提示）
- **笔记同步**：同步的笔记数（如果启用）

### 3. 个人信息管理区域（Profile Management）
可折叠/展开的卡片式区域：

#### 3.1 基本信息
- 昵称编辑
- 头像上传/更换
- 手机号码（如果绑定）
- 邮箱（显示）

#### 3.2 账号安全
- 密码修改
- 账号绑定状态（微信/邮箱等）
- 登录记录/设备管理

### 4. 我的内容区域（My Content）
展示用户创建/相关的所有内容：

#### 4.1 我的角色
- 自定义创建的角色列表
- 可以快速跳转到角色详情或对话

#### 4.2 我的场景
- 自定义创建的场景列表
- 最近访问的场景（包含系统场景）

#### 4.3 我的日记
- 最近创建的日记条目
- 日记统计（按时间、标签等）

#### 4.4 我的剧本
- 自定义创建的剧本列表
- 最近使用的剧本

### 5. 活动时间线（Activity Timeline）
展示用户在心域中的重要活动：
- 首次进入心域
- 创建第一个角色
- 创建第一个场景
- 重要对话/互动节点
- 成就解锁（如果未来有成就系统）

### 6. 快捷操作区域（Quick Actions）
常用功能的快捷入口：
- 设置与模型配置
- 笔记同步
- 数据备份/导出
- 关于我们
- 帮助与反馈

### 7. 底部操作
- 退出登录按钮

## UI/UX 设计原则

### 视觉风格
- 延续应用的暗色主题（深色背景）
- 使用渐变色和光效增强视觉层次
- 卡片式布局，圆角设计
- 数据可视化使用图标+数字的形式

### 交互设计
- 关键数据卡片支持点击查看详情
- 个人信息区域支持编辑模式
- 内容列表支持滑动/分页加载
- 重要操作需要确认对话框

### 响应式设计
- 移动端：单列布局，垂直滚动
- 桌面端：可考虑多列布局，更好的空间利用

## 技术实现要点

### 数据获取
需要从以下来源获取数据：
1. 用户基本信息：`UserProfile` / 后端用户API
2. 对话统计：`gameState.history`（前端统计）
3. 场景/角色数据：`gameState.userWorldScenes`, `gameState.customCharacters`
4. 日记数据：`gameState.journalEntries`
5. 信件数据：`gameState.mailbox`
6. 自定义内容：各种自定义创建的内容

### 状态管理
- 使用 `useGameState` Hook 获取全局状态
- 可能需要新增 Profile 相关的状态管理
- 编辑模式使用局部 state

### API 集成
需要检查/创建以下后端接口：
- `GET /api/user/profile` - 获取用户详细信息
- `PUT /api/user/profile` - 更新用户信息
- `GET /api/user/statistics` - 获取用户统计数据
- `POST /api/user/avatar` - 上传头像

## 功能优先级

### Phase 1（核心功能）
1. ✅ 基本信息展示
2. ✅ 核心统计数据展示
3. ✅ 个人信息编辑（昵称、头像）
4. ✅ 我的内容概览（角色、场景、日记）

### Phase 2（增强功能）
1. 详细统计数据
2. 活动时间线
3. 账号安全管理
4. 数据导出功能

### Phase 3（高级功能）
1. 成就系统
2. 数据分析可视化
3. 社交功能（如果未来有）
4. 个性化设置

## 页面路由
建议在 `gameState.currentScreen` 中新增：
- `'profile'` - 个人资料页面

或使用现有的 `'mobileProfile'` 并增强功能。

## 实现状态

### ✅ 已完成
1. **UserProfile组件** (`frontend/components/UserProfile.tsx`)
   - 个人信息展示（头像、昵称、账号状态）
   - 个人信息编辑（昵称点击编辑、头像上传）
   - 统计数据展示（心域探索、内容创作、社交互动）
   - 我的内容展示（自定义场景、角色、最近日记）
   - 可折叠/展开的区域设计
   - 响应式布局设计

### 📋 待完成功能
1. **后端API集成**
   - 更新用户昵称的API接口
   - 上传头像的API接口
   - 获取用户详细统计数据的API接口

2. **集成到App**
   - 在 `App.tsx` 或 `MobileApp.tsx` 中使用新的 `UserProfile` 组件
   - 替换或补充现有的 `MobileProfile` 组件

3. **功能增强**
   - 活动时间线展示
   - 账号安全管理
   - 数据导出功能
   - 更详细的统计分析

## 使用方式

### 在 MobileApp 中使用
```tsx
import { UserProfile } from '../components/UserProfile';

// 在渲染逻辑中替换 MobileProfile
{gameState.currentScreen === 'mobileProfile' && gameState.userProfile && (
  <UserProfile 
    userProfile={gameState.userProfile}
    journalEntries={gameState.journalEntries}
    mailbox={gameState.mailbox}
    history={gameState.history}
    gameState={gameState}
    onOpenSettings={() => setShowSettings(true)}
    onLogout={handleLogout}
    onUpdateProfile={(profile) => setGameState(prev => ({ ...prev, userProfile: profile }))}
    onNavigateToScene={(sceneId) => {
      setGameState(prev => ({ ...prev, selectedSceneId: sceneId, currentScreen: 'sceneSelection' }));
    }}
    onNavigateToCharacter={(characterId, sceneId) => {
      setGameState(prev => ({ 
        ...prev, 
        selectedSceneId: sceneId,
        selectedCharacterId: characterId,
        currentScreen: 'chat'
      }));
    }}
    onNavigateToJournal={() => {
      setGameState(prev => ({ ...prev, currentScreen: 'realWorld' }));
    }}
  />
)}
```

### 组件Props说明
- `userProfile`: 用户基本信息
- `journalEntries`: 日记条目列表
- `mailbox`: 信箱信件列表
- `history`: 对话历史记录
- `gameState`: 完整的游戏状态（用于统计和内容展示）
- `onOpenSettings`: 打开设置的回调
- `onLogout`: 登出回调
- `onUpdateProfile`: 更新用户信息的回调
- `onNavigateToScene`: 导航到场景的回调（可选）
- `onNavigateToCharacter`: 导航到角色的回调（可选）
- `onNavigateToJournal`: 导航到日记的回调（可选）

