# 主题切换测试快速开始指南

## 快速测试步骤

### 1. 启动应用
```bash
cd main/frontend
npm run dev
```

### 2. 访问主题测试页面（推荐）
在浏览器中打开：
```
http://localhost:5173/?test=theme
```

这个页面提供了：
- 主题切换器
- 颜色变量展示
- 各种组件示例
- 测试工具使用说明

### 3. 打开浏览器控制台
- Chrome/Edge: `F12` 或 `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Firefox: `F12` 或 `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
- Safari: `Cmd+Option+C` (Mac)

### 3. 运行自动化测试

#### 方法一：运行所有测试（推荐）
```javascript
themeTestUtils.runAllTests()
```

这将运行：
- CSS 变量检查
- 主题切换功能测试
- 性能测试
- 文字对比度检查
- Canvas 颜色验证
- SVG 渐变验证

#### 方法二：运行单个测试
```javascript
// 测试主题切换功能
themeTestUtils.testThemeSwitching()

// 检查 CSS 变量
themeTestUtils.checkCSSVariables()

// 性能测试
themeTestUtils.testThemeSwitchingPerformance()

// 检查文字对比度
themeTestUtils.checkTextContrast()

// 验证 Canvas 颜色
themeTestUtils.verifyCanvasThemeColors()

// 验证 SVG 渐变
themeTestUtils.verifySVGGradientColors()
```

## 手动测试清单

### 基础功能测试
1. **打开设置页面**
   - [ ] 找到主题选择器
   - [ ] 看到两个主题选项：Tech Style 和 Serene Horizon

2. **切换主题**
   - [ ] 点击 "Serene Horizon" 主题
   - [ ] 页面立即切换为淡蓝色背景
   - [ ] 所有文字变为深色
   - [ ] 无闪烁或布局跳动

3. **验证持久化**
   - [ ] 刷新页面（F5）
   - [ ] 主题保持为 "Serene Horizon"
   - [ ] 关闭浏览器重新打开
   - [ ] 主题仍然保持

### 视觉测试

#### Tech Style 主题（深色）
- [ ] 背景为黑色/深灰色
- [ ] 文字为白色/浅灰色
- [ ] 按钮有渐变效果
- [ ] 卡片有阴影效果

#### Serene Horizon 主题（浅色）
- [ ] 背景为淡蓝色
- [ ] 文字为深蓝灰色
- [ ] 按钮有渐变效果
- [ ] 卡片有阴影效果

### 组件测试

#### 按钮组件
- [ ] Primary 按钮：渐变背景正确
- [ ] Secondary 按钮：边框和背景正确
- [ ] Ghost 按钮：文字颜色正确
- [ ] Hover 状态：颜色过渡平滑

#### 卡片组件
- [ ] 用户资料卡片：背景和文字正确
- [ ] 统计卡片：背景和文字正确
- [ ] 场景卡片：背景和文字正确
- [ ] 角色卡片：背景和文字正确

#### 模态框组件
- [ ] 设置模态框：背景和文字正确
- [ ] 邮箱模态框：背景和文字正确
- [ ] 创建场景模态框：背景和文字正确
- [ ] 遮罩层透明度正确

#### 输入框组件
- [ ] 文本输入框：背景和边框正确
- [ ] 文本域：背景和边框正确
- [ ] 焦点状态：边框高亮正确
- [ ] 占位符文字颜色正确

### Canvas 测试

#### ConnectionSpace
1. 打开连接空间页面
2. 在两个主题下观察：
   - [ ] Canvas 背景色正确
   - [ ] 星星颜色正确
   - [ ] 星云效果正确
3. 切换主题时：
   - [ ] Canvas 正确重绘
   - [ ] 无性能问题

### SVG 图表测试

#### 情绪时间线
1. 打开情绪时间线
2. 在两个主题下观察：
   - [ ] 渐变颜色正确
   - [ ] 路径颜色正确
   - [ ] 数据点颜色正确
   - [ ] 图例文字清晰

#### 情绪统计
1. 打开情绪统计
2. 在两个主题下观察：
   - [ ] 饼图颜色正确
   - [ ] 列表项背景正确
   - [ ] 文字清晰可读

### 移动端测试

#### 底部导航
- [ ] 背景色正确
- [ ] 图标颜色正确
- [ ] 激活状态正确
- [ ] 未读徽章颜色正确

#### 移动端 Canvas
- [ ] Canvas 背景色正确
- [ ] 性能流畅（FPS > 20）
- [ ] 主题切换时正确重绘

## 性能测试

### 使用 Chrome DevTools

1. **打开 Performance 面板**
   - `F12` → Performance 标签

2. **录制主题切换**
   - 点击录制按钮（圆点）
   - 切换主题
   - 停止录制

3. **检查结果**
   - [ ] 主题切换时间 < 100ms
   - [ ] 无长时间阻塞主线程
   - [ ] 重绘次数最少

### 使用自动化测试
```javascript
themeTestUtils.testThemeSwitchingPerformance()
```

## 颜色对比度测试

### 使用 Chrome DevTools

1. **打开 Elements 面板**
   - `F12` → Elements 标签

2. **选择元素**
   - 点击任意文字元素

3. **查看 Accessibility 面板**
   - 在右侧面板找到 "Accessibility"
   - 查看 "Contrast ratio"

4. **验证标准**
   - [ ] 普通文字：≥ 4.5:1 (WCAG AA)
   - [ ] 大文字（18pt+）：≥ 3:1 (WCAG AA)
   - [ ] 增强对比度：≥ 7:1 (WCAG AAA)

### 使用在线工具
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- WAVE: https://wave.webaim.org/

## 常见问题排查

### 问题 1: 主题切换后页面无变化
**检查：**
```javascript
// 检查 data-theme 属性
document.documentElement.getAttribute('data-theme')

// 检查 CSS 变量
getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')
```

**解决方案：**
- 确认 `tokens.css` 已正确加载
- 检查浏览器缓存
- 确认主题选择器正确调用 `setTheme()`

### 问题 2: Canvas 颜色不正确
**检查：**
```javascript
themeTestUtils.verifyCanvasThemeColors()
```

**解决方案：**
- 确认 Canvas 代码使用 `getComputedStyle` 获取颜色
- 检查 `getThemeColor` 函数是否正确实现

### 问题 3: 文字对比度不足
**检查：**
```javascript
themeTestUtils.checkTextContrast()
```

**解决方案：**
- 调整主题定义中的颜色值
- 使用 WebAIM Contrast Checker 验证
- 更新 `serene-horizon.ts` 中的颜色定义

### 问题 4: 主题切换性能差
**检查：**
```javascript
themeTestUtils.testThemeSwitchingPerformance()
```

**解决方案：**
- 减少不必要的重绘
- 使用 CSS Containment
- 优化 Canvas 重绘逻辑

## 测试报告模板

```
测试日期: [日期]
测试人员: [姓名]
测试环境: [浏览器/设备/版本]

测试结果:
- 基础功能: [通过/失败]
- 视觉测试: [通过/失败]
- 组件测试: [通过/失败]
- Canvas 测试: [通过/失败]
- 性能测试: [通过/失败]
- 对比度测试: [通过/失败]

发现的问题:
1. [问题描述]
   - 严重程度: [高/中/低]
   - 复现步骤: [步骤]
   - 预期结果: [结果]
   - 实际结果: [结果]

性能数据:
- 主题切换时间: [ms]
- FPS: [fps]
```

## 下一步

完成测试后：
1. 记录所有发现的问题
2. 修复高优先级问题
3. 更新测试报告
4. 提交代码审查
