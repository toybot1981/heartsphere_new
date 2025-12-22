# 个人资料页面入口说明

## 进入方式

### 移动端（Mobile）
个人资料页面在移动端可以通过以下方式进入：

1. **底部导航栏** - "我的"按钮
   - 位置：应用底部导航栏的最右侧
   - 图标：用户头像图标 👤
   - 文字：显示"我的"
   - 点击后导航到 `mobileProfile` 屏幕

2. **导航结构**：
   ```
   底部导航栏包含5个按钮：
   - 现实 (realWorld) - 日记和现实世界入口
   - 心域 (sceneSelection) - 场景选择
   - ✨ (connectionSpace) - 连接空间（中央大按钮）
   - 信箱 - 时光信件
   - 我的 (mobileProfile) - 个人资料 ← 入口在这里
   ```

### PC端（Desktop）
PC端当前没有专门的个人资料页面入口，但可以通过以下方式访问：

1. **设置菜单** - 在EntryPoint页面右上角的设置按钮 ⚙️
   - 位置：EntryPoint页面右上角
   - 功能：打开设置对话框，可以访问部分用户信息
   - 注意：当前PC端主要通过设置对话框管理用户信息

2. **建议**：未来可以在PC端添加个人资料入口，例如：
   - 在EntryPoint页面添加用户头像/昵称点击入口
   - 在导航栏中添加"个人中心"菜单项

## 屏幕路由

个人资料页面使用 `currentScreen === 'mobileProfile'` 来标识。

### 路由配置
在 `GameState` 的 `currentScreen` 字段中：
- 类型：`'mobileProfile'` 是 `currentScreen` 的合法值之一
- 条件：需要 `userProfile` 存在才能显示个人资料页面

### 代码位置
- **导航组件**：`frontend/mobile/components/MobileBottomNav.tsx`
  - 第60-68行：定义"我的"按钮
  - 点击时调用 `onNavigate('mobileProfile')`

- **页面渲染**：`frontend/mobile/MobileApp.tsx`
  - 第1061-1071行：检测 `currentScreen === 'mobileProfile'` 时渲染 `UserProfile` 组件

## 功能说明

个人资料页面（UserProfile组件）包含以下功能：

1. **个人信息管理**
   - 头像上传/更换
   - 昵称编辑
   - 微信绑定（仅限注册用户）

2. **数据统计**
   - 心域探索统计（场景、角色、对话、活跃天数）
   - 内容创作统计（自定义角色、场景、剧本、日记）
   - 社交互动统计（时光信件、未读信件）

3. **我的内容**
   - 我的场景列表
   - 我的角色列表
   - 最近日记

4. **快捷操作**
   - 设置与模型配置
   - 退出登录

## 使用示例

### 导航到个人资料页面
```typescript
// 在组件中导航到个人资料页面
setGameState(prev => ({
  ...prev,
  currentScreen: 'mobileProfile'
}));
```

### 从个人资料页面导航到其他页面
UserProfile组件提供了以下导航回调：
- `onNavigateToScene(sceneId)` - 跳转到场景选择页面
- `onNavigateToCharacter(characterId, sceneId)` - 跳转到角色对话页面
- `onNavigateToJournal()` - 跳转到日记页面（realWorld）

## 注意事项

1. **用户必须已登录或有用户资料**：个人资料页面需要 `userProfile` 存在
2. **移动端专用**：当前 `mobileProfile` 屏幕主要在移动端使用
3. **PC端访问**：PC端用户可以通过设置对话框访问部分功能，或切换到移动模式访问完整功能

## 未来改进

1. **PC端支持**：添加PC端的个人资料页面入口和完整UI
2. **快捷入口**：在更多位置添加个人资料的快捷入口（如用户头像点击）
3. **深层链接**：支持通过URL参数直接打开个人资料页面



