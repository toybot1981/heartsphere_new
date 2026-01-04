# Mobile版本欢迎页面访问指南

## 概述

Mobile版本的欢迎页面是`profileSetup`屏幕，用于新用户首次进入或未登录用户选择进入方式。

## 自动访问方式

### 1. 首次访问（未登录）
当用户**没有登录**（localStorage中没有`auth_token`）时，系统会自动显示欢迎页面：

```typescript
// 在 GameStateContext.tsx 中
const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
const initialScreen = hasToken ? 'entryPoint' : initialState.currentScreen; // 默认是 'profileSetup'
```

**触发条件**：
- 清除浏览器localStorage中的`auth_token`
- 首次访问应用
- 登出后

### 2. 状态加载时
当从localStorage加载状态时，如果没有token且没有用户信息，会自动设置为`profileSetup`：

```typescript
// 在 GameStateContext.tsx 的 loadGameData 中
if (hasToken || loadedState.userProfile) {
  targetScreen = (loadedState.currentScreen === 'profileSetup' || !loadedState.currentScreen) 
    ? 'entryPoint' 
    : loadedState.currentScreen;
} else {
  targetScreen = 'profileSetup'; // 自动显示欢迎页面
}
```

## 手动访问方式

### 方法1：通过代码设置状态

在MobileApp中，可以通过dispatch设置当前屏幕为`profileSetup`：

```typescript
dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'profileSetup' });
```

### 方法2：清除登录状态

清除localStorage中的token，然后刷新页面：

```javascript
// 在浏览器控制台执行
localStorage.removeItem('auth_token');
location.reload();
```

### 方法3：登出功能

如果实现了登出功能，登出后会自动跳转到欢迎页面：

```typescript
// 在MobileApp中的handleLogout
const handleLogout = async () => {
  localStorage.removeItem('auth_token');
  dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'profileSetup' });
  // ... 其他清理逻辑
};
```

## 欢迎页面功能

当前Mobile版本的欢迎页面（`profileSetup`）提供以下功能：

### 1. 访客模式
- 点击"以访客身份进入"按钮
- 弹出昵称输入对话框
- 输入昵称后以访客身份进入

### 2. 登录账户
- 点击"登录账户"按钮
- 打开登录模态框
- 登录成功后跳转到`realWorld`屏幕

## 欢迎页面代码位置

### 主组件
- **文件**：`frontend/mobile/MobileApp.tsx`
- **行数**：848-911行
- **条件**：`if (gameState.currentScreen === 'profileSetup')`

### 代码结构
```typescript
if (gameState.currentScreen === 'profileSetup') {
  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 space-y-6">
      <h1>HeartSphere Mobile</h1>
      <p>选择你的进入方式</p>
      
      {/* 访客模式按钮 */}
      <button onClick={() => setShowGuestNicknameModal(true)}>
        以访客身份进入
      </button>
      
      {/* 登录按钮 */}
      <button onClick={() => setShowLoginModal(true)}>
        登录账户
      </button>
      
      {/* 访客昵称输入对话框 */}
      {showGuestNicknameModal && (
        // 昵称输入模态框
      )}
    </div>
  );
}
```

## 与PC版本的差异

### PC版本
- 有`WelcomeOverlay`组件（欢迎覆盖层）
- 有`InitializationWizard`组件（初始化向导）
- 使用`showWelcomeOverlay`状态控制欢迎覆盖层显示

### Mobile版本（当前）
- ✅ 有`profileSetup`屏幕（欢迎页面）
- ❌ 缺少`WelcomeOverlay`组件（待实现）
- ❌ 缺少`InitializationWizard`组件（待实现）

## 待实现功能

根据优化计划，Mobile版本还需要实现：

### 1. MobileWelcomeOverlay组件
- **位置**：`frontend/mobile/components/MobileWelcomeOverlay.tsx`
- **功能**：首次登录时的欢迎覆盖层
- **触发**：通过`gameState.showWelcomeOverlay`控制
- **参考**：PC版本的`WelcomeOverlay.tsx`

### 2. MobileInitializationWizard组件
- **位置**：`frontend/mobile/components/MobileInitializationWizard.tsx`
- **功能**：首次登录时的初始化向导
- **触发**：通过`useInitializationWizard` Hook控制
- **参考**：PC版本的`InitializationWizard.tsx`

## 快速测试方法

### 在浏览器控制台测试

```javascript
// 1. 清除token，触发欢迎页面
localStorage.removeItem('auth_token');
location.reload();

// 2. 或者直接设置屏幕状态（需要访问dispatch）
// 在React DevTools中找到MobileApp组件，调用：
// dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'profileSetup' });
```

### 在代码中测试

在MobileApp中添加一个测试按钮：

```typescript
// 临时测试按钮（开发环境）
{process.env.NODE_ENV === 'development' && (
  <button 
    onClick={() => dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'profileSetup' })}
    className="fixed top-4 right-4 z-50 bg-red-500 text-white px-2 py-1 text-xs"
  >
    测试：显示欢迎页面
  </button>
)}
```

## 状态流转

```
未登录状态
    ↓
profileSetup (欢迎页面)
    ↓
[选择进入方式]
    ├─→ 访客模式 → realWorld
    └─→ 登录账户 → 登录成功 → realWorld
```

## 注意事项

1. **自动跳转**：登录成功后会自动从`profileSetup`跳转到`realWorld`
2. **状态持久化**：`currentScreen`状态会被保存到localStorage
3. **首次登录**：PC版本有`showWelcomeOverlay`和初始化向导，Mobile版本待实现

## 相关文件

- `frontend/mobile/MobileApp.tsx` - 主应用组件，包含欢迎页面渲染
- `frontend/contexts/GameStateContext.tsx` - 状态管理，控制初始屏幕
- `frontend/contexts/constants/defaultState.ts` - 默认状态，`currentScreen: 'profileSetup'`
- `frontend/components/WelcomeOverlay.tsx` - PC版本欢迎覆盖层（参考）
- `frontend/components/InitializationWizard.tsx` - PC版本初始化向导（参考）

---

**文档创建时间**：2025-01-XX
**最后更新时间**：2025-01-XX
**维护者**：开发团队
