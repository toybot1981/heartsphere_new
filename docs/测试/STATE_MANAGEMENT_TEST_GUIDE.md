# 状态管理测试指南

## 📋 测试方法

### 方法1: 使用测试组件（推荐）

1. 在 `App.tsx` 中临时添加测试路由：

```typescript
// 在App.tsx中添加
{state.currentScreen === 'test' && (
  <StateManagementTest />
)}
```

2. 或者创建一个独立的测试页面 `test.html`

3. 访问测试页面，点击"运行所有测试"按钮

### 方法2: 运行单元测试

```bash
cd frontend
npx ts-node test/stateManagement.test.ts
```

### 方法3: 在浏览器控制台测试

打开浏览器控制台，运行：

```javascript
// 测试Context是否可用
console.log('GameStateProvider:', typeof GameStateProvider);
console.log('useGameState:', typeof useGameState);
```

## ✅ 测试清单

### 基础功能测试
- [ ] Context和Provider正常初始化
- [ ] useGameState Hook可以正常使用
- [ ] 状态可以正常读取

### Reducer测试
- [ ] SET_CURRENT_SCREEN - 屏幕导航
- [ ] SET_USER_PROFILE - 用户资料设置
- [ ] SET_SELECTED_SCENE_ID - 场景选择
- [ ] ADD_MESSAGE - 添加消息
- [ ] BATCH_UPDATE - 批量更新
- [ ] UPDATE_SETTINGS - 更新设置
- [ ] RESET_STATE - 重置状态

### 业务Hooks测试
- [ ] useScenes - 场景管理
- [ ] useCharacters - 角色管理
- [ ] useScripts - 剧本管理
- [ ] useChat - 对话管理
- [ ] useSettings - 设置管理

### 持久化测试
- [ ] 状态自动保存到localStorage
- [ ] 刷新页面后状态可以恢复
- [ ] 状态加载逻辑正常

## 🔍 验证步骤

1. **编译检查**
   ```bash
   cd frontend
   npm run build
   ```
   应该无错误

2. **类型检查**
   ```bash
   npx tsc --noEmit
   ```
   应该无类型错误

3. **功能测试**
   - 打开应用
   - 使用测试组件验证各项功能
   - 检查浏览器控制台是否有错误

4. **集成测试**
   - 测试状态在不同组件间的共享
   - 测试状态更新是否触发重新渲染
   - 测试状态持久化是否正常

## 📝 测试报告模板

```
测试时间: [日期]
测试环境: [浏览器/Node版本]

测试结果:
- Context初始化: ✅/❌
- Reducer功能: ✅/❌
- 业务Hooks: ✅/❌
- 持久化: ✅/❌

发现的问题:
1. [问题描述]
2. [问题描述]

结论:
[测试通过/需要修复]
```

