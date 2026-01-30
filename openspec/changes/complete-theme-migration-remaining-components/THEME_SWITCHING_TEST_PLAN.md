# 主题切换全面测试计划

## 测试目标
验证主题系统在所有场景下的正确性和性能，确保用户可以在不同主题间无缝切换，所有组件都能正确响应主题变化。

## 测试环境准备

### 1. 浏览器兼容性测试
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] 移动端浏览器（iOS Safari, Chrome Mobile）

### 2. 测试设备
- [ ] 桌面端（1920x1080, 2560x1440）
- [ ] 平板（iPad, Android Tablet）
- [ ] 手机（iPhone, Android Phone）

### 3. 测试主题
- [ ] Tech Style（默认深色主题）
- [ ] Serene Horizon（浅色主题）

## 测试用例

### 一、主题切换功能测试

#### TC-001: 主题切换基础功能
**测试步骤：**
1. 打开应用
2. 进入设置页面
3. 点击主题选择器
4. 切换到 "Serene Horizon" 主题
5. 观察页面变化

**预期结果：**
- [ ] 页面背景色立即切换为淡蓝色
- [ ] 所有文字颜色正确显示（深色文字在浅色背景上）
- [ ] 主题选择器显示 "当前" 标记
- [ ] 无闪烁或布局跳动
- [ ] 控制台无错误信息

**验证点：**
- `document.documentElement.getAttribute('data-theme')` 应为 `'serene-horizon'`
- CSS 变量值应正确更新

#### TC-002: 主题持久化
**测试步骤：**
1. 切换到 "Serene Horizon" 主题
2. 刷新页面
3. 检查主题是否保持

**预期结果：**
- [ ] 刷新后主题仍为 "Serene Horizon"
- [ ] localStorage 中 `heartsphere-theme` 值为 `'serene-horizon'`
- [ ] 页面加载时无主题闪烁

#### TC-003: 主题切换性能
**测试步骤：**
1. 打开 Chrome DevTools Performance 面板
2. 开始录制
3. 切换主题
4. 停止录制

**预期结果：**
- [ ] 主题切换时间 < 100ms
- [ ] 无长时间阻塞主线程
- [ ] 重绘次数最少
- [ ] 无内存泄漏

### 二、组件视觉测试

#### TC-004: 按钮组件
**测试组件：** `Button.tsx`, `MobileTouchableButton.tsx`

**测试步骤：**
1. 在两个主题下查看所有按钮变体
2. 测试 hover 和 active 状态

**预期结果：**
- [ ] Primary 按钮：渐变背景正确显示
- [ ] Secondary 按钮：边框和背景正确
- [ ] Ghost 按钮：文字颜色正确
- [ ] Hover 状态：颜色过渡平滑
- [ ] 文字在所有状态下清晰可读

#### TC-005: 卡片组件
**测试组件：** 所有使用 `--bg-card` 的组件

**测试步骤：**
1. 查看用户资料卡片
2. 查看统计卡片
3. 查看场景卡片
4. 查看角色卡片

**预期结果：**
- [ ] 卡片背景色正确
- [ ] 卡片边框颜色正确
- [ ] 卡片内文字清晰可读
- [ ] 阴影效果正确
- [ ] Hover 效果正确

#### TC-006: 模态框组件
**测试组件：** 所有 Modal 组件

**测试步骤：**
1. 打开各种模态框（设置、邮箱、创建场景等）
2. 在两个主题下测试

**预期结果：**
- [ ] 模态框背景色正确
- [ ] 遮罩层透明度正确
- [ ] 模态框内文字清晰可读
- [ ] 关闭按钮可见
- [ ] 输入框边框和背景正确

#### TC-007: 输入框组件
**测试组件：** `MobileFormField.tsx`, 所有输入框

**测试步骤：**
1. 测试文本输入框
2. 测试文本域
3. 测试选择框
4. 测试焦点状态

**预期结果：**
- [ ] 输入框背景色正确
- [ ] 输入框边框颜色正确
- [ ] 占位符文字颜色正确
- [ ] 焦点状态边框高亮正确
- [ ] 输入文字清晰可读

#### TC-008: 导航组件
**测试组件：** `MobileBottomNav.tsx`, HeaderBar

**测试步骤：**
1. 查看底部导航栏
2. 查看顶部导航栏
3. 测试激活状态

**预期结果：**
- [ ] 导航栏背景色正确
- [ ] 图标颜色正确
- [ ] 激活状态图标颜色正确
- [ ] 未读徽章颜色正确

### 三、Canvas 和 SVG 测试

#### TC-009: ConnectionSpace Canvas
**测试组件：** `ConnectionSpace.tsx`, `MobileConnectionSpaceScreen.tsx`

**测试步骤：**
1. 在两个主题下打开连接空间
2. 观察 Canvas 绘制
3. 切换主题时观察 Canvas 重绘

**预期结果：**
- [ ] Canvas 背景色正确（使用主题变量）
- [ ] 星星颜色正确
- [ ] 星云效果正确
- [ ] 主题切换时 Canvas 正确重绘
- [ ] 无性能问题（FPS > 30）

**验证代码：**
```javascript
// 在控制台执行
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
// 检查 fillStyle 是否使用主题颜色
```

#### TC-010: SVG 图表组件
**测试组件：** `EmotionTimeline.tsx`, `EmotionStatistics.tsx`, `GrowthStatistics.tsx`

**测试步骤：**
1. 打开情绪时间线
2. 打开情绪统计
3. 打开成长统计
4. 在两个主题下测试

**预期结果：**
- [ ] SVG 渐变颜色正确（使用 CSS 变量）
- [ ] 路径颜色正确
- [ ] 数据点颜色正确
- [ ] 图例文字清晰可读
- [ ] 图表背景色正确

**验证代码：**
```javascript
// 检查 SVG 渐变
const gradient = document.querySelector('#emotionGradient');
const stops = gradient.querySelectorAll('stop');
// 检查 stopColor 是否使用 CSS 变量
```

### 四、颜色对比度测试

#### TC-011: 文字对比度（WCAG AA）
**测试工具：** Chrome DevTools Accessibility 面板或在线工具

**测试步骤：**
1. 使用 DevTools 检查所有文字元素
2. 验证对比度比

**预期结果：**
- [ ] 主文字（--text-primary）对比度 ≥ 4.5:1
- [ ] 次要文字（--text-secondary）对比度 ≥ 4.5:1
- [ ] 第三级文字（--text-tertiary）对比度 ≥ 3:1（大文字）或 ≥ 4.5:1（小文字）
- [ ] 链接文字对比度 ≥ 4.5:1

**测试页面：**
- [ ] 主页
- [ ] 用户资料页
- [ ] 设置页面
- [ ] 所有模态框

#### TC-012: 交互元素对比度
**测试步骤：**
1. 检查所有按钮
2. 检查所有链接
3. 检查所有输入框

**预期结果：**
- [ ] 按钮文字对比度 ≥ 4.5:1
- [ ] 按钮背景对比度 ≥ 3:1（相对于页面背景）
- [ ] 输入框边框对比度 ≥ 3:1
- [ ] 焦点指示器对比度 ≥ 3:1

### 五、特殊场景测试

#### TC-013: 页面加载时的主题应用
**测试步骤：**
1. 清除 localStorage
2. 设置主题为 "Serene Horizon"
3. 刷新页面
4. 观察页面加载过程

**预期结果：**
- [ ] 无白色闪烁（FOUC - Flash of Unstyled Content）
- [ ] 主题立即应用
- [ ] 无布局跳动

#### TC-014: 快速切换主题
**测试步骤：**
1. 快速连续切换主题 10 次
2. 观察页面表现

**预期结果：**
- [ ] 每次切换都正确应用
- [ ] 无性能问题
- [ ] 无内存泄漏
- [ ] 最终状态正确

#### TC-015: 深色模式系统偏好
**测试步骤：**
1. 设置系统为深色模式
2. 清除应用 localStorage
3. 打开应用

**预期结果：**
- [ ] 应用使用默认主题（Tech Style）
- [ ] 或根据系统偏好自动选择（如果实现）

### 六、移动端特殊测试

#### TC-016: 移动端主题切换
**测试步骤：**
1. 在移动设备上打开应用
2. 进入设置
3. 切换主题
4. 测试所有移动端组件

**预期结果：**
- [ ] 主题切换流畅
- [ ] 移动端组件正确显示
- [ ] 底部导航栏颜色正确
- [ ] 移动端模态框正确显示

#### TC-017: 移动端 Canvas 性能
**测试步骤：**
1. 在移动设备上打开连接空间
2. 观察 Canvas 性能
3. 切换主题

**预期结果：**
- [ ] Canvas 流畅运行（FPS > 20）
- [ ] 主题切换时 Canvas 正确重绘
- [ ] 无卡顿或延迟

### 七、边界情况测试

#### TC-018: 无效主题 ID
**测试步骤：**
1. 在 localStorage 中设置无效主题 ID
2. 刷新页面

**预期结果：**
- [ ] 应用回退到默认主题
- [ ] 无错误信息
- [ ] 页面正常显示

#### TC-019: CSS 变量缺失
**测试步骤：**
1. 在 DevTools 中删除部分 CSS 变量
2. 观察页面表现

**预期结果：**
- [ ] 组件使用回退值
- [ ] 页面仍可正常使用
- [ ] 无布局破坏

#### TC-020: 主题切换时的动画
**测试步骤：**
1. 打开有动画的组件
2. 在动画进行时切换主题

**预期结果：**
- [ ] 动画继续正常播放
- [ ] 主题切换不影响动画
- [ ] 无视觉异常

## 自动化测试脚本

### 测试脚本 1: 主题切换基础测试
```javascript
// 在浏览器控制台执行
async function testThemeSwitching() {
  console.log('开始主题切换测试...');
  
  // 1. 测试主题切换
  const themes = ['tech', 'serene-horizon'];
  for (const theme of themes) {
    console.log(`切换到主题: ${theme}`);
    document.documentElement.setAttribute('data-theme', theme);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 验证主题已应用
    const currentTheme = document.documentElement.getAttribute('data-theme');
    console.assert(currentTheme === theme, `主题未正确应用: ${currentTheme}`);
    
    // 验证 CSS 变量
    const bgPrimary = getComputedStyle(document.documentElement)
      .getPropertyValue('--bg-primary').trim();
    console.log(`背景色: ${bgPrimary}`);
    console.assert(bgPrimary, '背景色变量未定义');
  }
  
  console.log('主题切换测试完成');
}
testThemeSwitching();
```

### 测试脚本 2: 颜色对比度检查
```javascript
// 需要安装 chroma.js: npm install chroma-js
function checkContrast(element) {
  const style = getComputedStyle(element);
  const bgColor = style.backgroundColor;
  const textColor = style.color;
  
  // 使用 chroma.js 计算对比度
  const contrast = chroma.contrast(bgColor, textColor);
  const wcagAA = contrast >= 4.5;
  const wcagAAA = contrast >= 7;
  
  return {
    contrast,
    wcagAA,
    wcagAAA,
    element: element.tagName + (element.className ? '.' + element.className : '')
  };
}

// 检查所有文字元素
function checkAllTextContrast() {
  const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, button, a, input, textarea');
  const results = [];
  
  textElements.forEach(el => {
    const result = checkContrast(el);
    if (!result.wcagAA) {
      results.push(result);
    }
  });
  
  console.table(results);
  return results;
}
```

### 测试脚本 3: Canvas 主题颜色验证
```javascript
function verifyCanvasThemeColors() {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    console.log('未找到 Canvas 元素');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  const root = document.documentElement;
  
  // 获取主题颜色
  const bgPrimary = getComputedStyle(root).getPropertyValue('--bg-primary').trim();
  
  console.log('Canvas 主题颜色验证:');
  console.log('背景色变量:', bgPrimary);
  
  // 检查 Canvas 是否使用主题颜色
  // 这需要检查源代码中的 fillStyle 设置
  console.log('提示: 检查 Canvas 绘制代码是否使用 getComputedStyle 获取主题颜色');
}
```

## 测试检查清单

### 功能检查清单
- [ ] 主题切换功能正常
- [ ] 主题持久化正常
- [ ] 所有组件正确响应主题变化
- [ ] Canvas/SVG 正确使用主题颜色
- [ ] 无控制台错误

### 视觉检查清单
- [ ] 所有文字清晰可读
- [ ] 所有按钮可见且可点击
- [ ] 所有输入框可见且可用
- [ ] 所有卡片正确显示
- [ ] 所有模态框正确显示
- [ ] 导航栏正确显示

### 性能检查清单
- [ ] 主题切换时间 < 100ms
- [ ] 无布局跳动
- [ ] 无内存泄漏
- [ ] Canvas 性能正常

### 可访问性检查清单
- [ ] 文字对比度符合 WCAG AA
- [ ] 交互元素对比度符合标准
- [ ] 焦点指示器可见
- [ ] 键盘导航正常

## 测试报告模板

### 测试执行记录
```
测试日期: [日期]
测试人员: [姓名]
测试环境: [浏览器/设备]
测试主题: [Tech Style / Serene Horizon]

测试用例执行情况:
- TC-001: [通过/失败] - [备注]
- TC-002: [通过/失败] - [备注]
...

发现的问题:
1. [问题描述]
   - 严重程度: [高/中/低]
   - 复现步骤: [步骤]
   - 预期结果: [结果]
   - 实际结果: [结果]

性能数据:
- 主题切换时间: [ms]
- FPS: [fps]
- 内存使用: [MB]
```

## 已知问题和限制

### 已知问题
1. [如有] 问题描述和解决方案

### 设计限制
1. 情绪颜色映射使用硬编码颜色（设计决策）
2. 动态颜色参数（如角色主题色）不在主题系统范围内

## 后续优化建议

1. **性能优化**
   - 考虑使用 CSS Containment 优化重绘
   - 优化 Canvas 重绘逻辑

2. **功能增强**
   - 添加主题预览功能
   - 支持自定义主题
   - 支持系统主题自动切换

3. **测试自动化**
   - 添加 E2E 测试（Playwright/Cypress）
   - 添加视觉回归测试
   - 添加性能监控

## 测试完成标准

所有测试用例通过，且满足以下条件：
- [ ] 所有功能测试通过
- [ ] 所有视觉测试通过
- [ ] 所有性能测试通过
- [ ] 所有可访问性测试通过
- [ ] 无严重或高优先级问题
- [ ] 测试报告完整
