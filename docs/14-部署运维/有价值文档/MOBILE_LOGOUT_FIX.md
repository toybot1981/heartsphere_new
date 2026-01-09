# 移动端退出登录问题修复

## 修复的问题

### 1. ✅ 退出登录没有真正退出
**问题**：移动端退出登录后，`auth_token` 仍然保留在 localStorage 中，导致实际上没有真正退出登录

**修复**：
- 在 `handleLogout` 函数中添加了 `localStorage.removeItem('auth_token')` 清除认证token
- 添加了详细的日志输出以便调试
- 确保所有相关状态都被重置

**位置**：`frontend/mobile/MobileApp.tsx` 第268-300行

### 2. ✅ 退出登录后回到welcome页面无法点击登录
**问题**：
- 退出登录后回到 profileSetup（welcome）页面
- 登录按钮点击后没有反应，LoginModal 不显示
- 原因是 LoginModal 只在主渲染逻辑中显示，而 profileSetup 页面使用了早期返回（early return），导致 LoginModal 无法渲染

**修复**：
- 在 profileSetup 页面的返回 JSX 中也添加了 LoginModal 的渲染
- 确保在 profileSetup 页面点击登录按钮时，LoginModal 能够正常显示
- 优化了 onCancel 处理，添加了日志

**位置**：`frontend/mobile/MobileApp.tsx` 第955-970行

## 修改的文件

1. **frontend/mobile/MobileApp.tsx**
   - 修复 `handleLogout` 函数，添加 token 清除逻辑
   - 在 profileSetup 页面添加 LoginModal 渲染
   - 优化状态重置逻辑

## 修复详情

### handleLogout 函数改进

**之前**：
```typescript
const handleLogout = () => {
    const cleanState: GameState = {
        ...DEFAULT_STATE,
        settings: gameState.settings, 
        currentScreen: 'profileSetup',
        userProfile: null
    };
    setShowSettings(false);
    setGameState(cleanState);
    storageService.saveState(cleanState);
};
```

**之后**：
```typescript
const handleLogout = () => {
    console.log('[MobileApp] 开始退出登录');
    
    // 1. 清除认证token
    localStorage.removeItem('auth_token');
    console.log('[MobileApp] 已清除 auth_token');
    
    // 2. 清除所有UI状态
    setShowSettings(false);
    setShowLoginModal(false);
    setShowGuestNicknameModal(false);
    setProfileNickname('');
    
    // 3. 重置游戏状态
    const cleanState: GameState = {
        ...DEFAULT_STATE,
        settings: gameState.settings, 
        currentScreen: 'profileSetup',
        userProfile: null
    };
    setGameState(cleanState);
    
    // 4. 保存状态
    storageService.saveState(cleanState);
};
```

### profileSetup 页面改进

**之前**：
- profileSetup 页面使用早期返回，LoginModal 在主渲染逻辑中
- 导致在 profileSetup 页面时 LoginModal 无法显示

**之后**：
- 在 profileSetup 页面的返回 JSX 中也添加了 LoginModal
- 确保登录按钮点击后能正常显示登录框

## 测试建议

1. **测试退出登录**：
   - 在移动端登录账户
   - 进入设置页面
   - 点击"退出登录"
   - 检查是否返回到 welcome 页面
   - 检查 localStorage 中的 `auth_token` 是否已被清除

2. **测试退出后登录**：
   - 退出登录后，在 welcome 页面
   - 点击"登录账户"按钮
   - 确认 LoginModal 能正常显示
   - 尝试登录，确认能正常登录

3. **测试状态重置**：
   - 退出登录后
   - 检查所有UI状态是否已重置（设置面板、登录框等）
   - 检查游戏状态是否已重置为初始状态

## 技术细节

### 清除的内容

退出登录时会清除：
1. ✅ `localStorage` 中的 `auth_token`
2. ✅ `showSettings` 状态
3. ✅ `showLoginModal` 状态
4. ✅ `showGuestNicknameModal` 状态
5. ✅ `profileNickname` 状态
6. ✅ 游戏状态（保留设置中的API密钥等）

### 保留的内容

退出登录时会保留：
- ✅ 用户设置（API密钥等配置）
- ✅ 其他应用配置

## 注意事项

1. 退出登录后，所有需要认证的API调用都会失败（因为token已被清除）
2. 用户需要重新登录才能访问需要认证的功能
3. 访客模式不受影响，可以继续使用

## 相关文件

- `frontend/mobile/MobileApp.tsx` - 主要修改文件
- `frontend/components/LoginModal.tsx` - 登录模态框组件（未修改，但需要确保在profileSetup页面能正常显示）

## 后续优化建议

1. 可以考虑添加退出登录的确认对话框
2. 可以考虑添加退出登录的加载状态
3. 可以考虑添加退出登录后的提示信息
