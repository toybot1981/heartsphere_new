# 主题/皮肤管理系统设计文档

## 设计目标

建立一个灵活、可扩展的主题管理系统，允许用户在不同视觉风格之间切换，同时保持代码的可维护性和性能。

## 现有系统分析

### 当前CSS变量系统

`tokens.css`中已有一个CSS变量系统，为"温度感设计系统"设计：

- **默认主题**：浅色背景（白色、米色），温暖色调（粉色、橙色、蓝色）
- **暗色模式**：通过`[data-theme="dark"]`实现，深色背景（#1A1A1A, #2A2A2A）
- **CSS变量命名**：使用`--color-*`, `--bg-*`, `--text-*`等前缀

### 当前颜色使用情况

**PC端**：
- `index.html`中body背景为黑色（`background-color: black`）
- 组件中大量使用Tailwind类名（如`bg-blue-500/20`, `text-white`, `bg-slate-800`）
- 部分组件使用CSS变量（如`var(--color-warm-pink)`）

**移动端**：
- `MobileStyleGuide.ts`中定义深色科技风格（黑色、slate-950、紫色渐变）
- 所有颜色通过Tailwind类名硬编码
- 背景为深色（`bg-black`, `bg-slate-950`）

### 冲突点

1. **主题命名冲突**：现有`[data-theme="dark"]`与提案的`data-theme="tech"`冲突
2. **颜色系统不一致**：PC端tokens.css为浅色，但实际使用深色背景
3. **Tailwind硬编码**：大量组件使用Tailwind颜色类，不支持运行时切换

## 架构设计

### 1. 主题数据结构

每个主题包含以下设计令牌（Design Tokens）：

```typescript
interface Theme {
  id: string;                    // 主题ID，如 'tech' 或 'serene-horizon'
  name: string;                  // 主题名称（中文）
  nameEn: string;                // 主题名称（英文）
  description: string;           // 主题描述
  
  colors: {
    // 背景色
    bg: {
      primary: string;           // 主背景色
      secondary: string;         // 次要背景色
      card: string;              // 卡片背景色
      overlay: string;           // 遮罩背景色
    };
    
    // 文字颜色
    text: {
      primary: string;           // 主文字色
      secondary: string;         // 次要文字色
      tertiary: string;          // 第三级文字色
      disabled: string;          // 禁用文字色
      link: string;              // 链接文字色
      accent: string;            // 强调文字色
    };
    
    // 主色调
    primary: {
      main: string;              // 主色
      light: string;             // 浅色
      lighter: string;            // 更浅色
      lightest: string;           // 最浅色
    };
    
    // 辅助色
    secondary?: {
      main: string;
      light: string;
    };
    
    // 语义色
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  
  // 阴影
  shadows: {
    sm: string;
    md: string;
    lg: string;
    primary: string;
  };
  
  // 圆角
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
}
```

### 2. 主题定义

#### 科技风格（Tech Style）
- **ID**: `tech`（kebab-case命名规范）
- **特点**: 深色背景（黑色、深紫色、靛蓝色），高对比度，科技感强
- **适用场景**: 当前默认风格，适合喜欢现代科技感的用户
- **具体颜色定义**（基于移动端MobileStyleGuide.ts和PC端实际使用）:
  - 背景: 
    - 主背景: `#000000`（黑色）
    - 次要背景: `#0F172A`（slate-950）
    - 卡片背景: `rgba(30, 41, 59, 0.8)`（slate-800/80，带毛玻璃效果）
  - 文字:
    - 主文字: `#FFFFFF`（白色）
    - 次要文字: `#CBD5E1`（slate-300）
    - 弱化文字: `#94A3B8`（slate-400）
  - 主色调:
    - 主色: `#4F46E5`（indigo-600）
    - 辅助色: `#9333EA`（purple-600）
    - 渐变: `from-indigo-600 to-purple-600`
  - 语义色:
    - 成功: `#22C55E`（green-500）
    - 警告: `#EAB308`（yellow-500）
    - 错误: `#EF4444`（red-500）
    - 信息: `#3B82F6`（blue-500）
- **兼容性处理**: 将现有的`[data-theme="dark"]`映射到`[data-theme="tech"]`，保持向后兼容

#### 海天宁静（Serene Horizon）
- **ID**: `serene-horizon`（kebab-case命名规范）
- **特点**: 淡蓝色背景，低饱和度，宁静、淡泊、放松
- **设计理念**: "海与天空的宁静，星辰的连接"
- **颜色方案**:
  - 背景: 
    - 主背景: `#E8F4F8`（淡蓝色，最浅）
    - 次要背景: `#BFD9E8`（浅蓝色）
    - 卡片背景: `rgba(255, 255, 255, 0.9)`（白色半透明）
    - 背景渐变: `linear-gradient(135deg, #E8F4F8 0%, #BFD9E8 50%, #9FC9E0 100%)`
  - 文字:
    - 主文字: `#2C3E50`（深灰蓝色）
    - 次要文字: `#5A6C7D`（中灰蓝色）
    - 弱化文字: `#7F8C9A`（浅灰蓝色）
  - 主色调:
    - 主色: `#7FB8D1`（宁静蓝色）
    - 浅色: `#9FC9E0`（浅蓝色）
    - 更浅: `#BFD9E8`（更浅蓝色）
    - 最浅: `#E8F4F8`（最浅蓝色）
  - 语义色（适配淡色背景）:
    - 成功: `#10B981`（green-500，提高对比度）
    - 警告: `#F59E0B`（yellow-500）
    - 错误: `#EF4444`（red-500）
    - 信息: `#3B82F6`（blue-500）
- **移动端特殊设计**:
  - **场景选择页**: 浅蓝云纹背景（使用CSS渐变模拟云纹效果）
  - **场景卡片**: 大圆角（16-20px）白色浮动卡片，带柔和阴影
  - **心域连接页**: 全屏沉浸式星空背景（使用提供的星空图片），角色和心域具象化为柔光星辰
  - **底部导航**: 半透明白色（`rgba(255, 255, 255, 0.9)`），图标使用Clear Sky Blue（`#7FB8D1`）

### 3. 实现方案

#### 3.1 CSS变量系统

使用CSS Custom Properties实现主题切换，保留现有变量命名以保持兼容性：

```css
/* 默认主题（科技风格）- 保持向后兼容 */
:root,
:root[data-theme="tech"],
:root[data-theme="dark"] {  /* 兼容现有的dark主题 */
  --bg-primary: #000000;
  --bg-secondary: #0F172A;
  --bg-card: rgba(30, 41, 59, 0.8);
  --text-primary: #FFFFFF;
  --text-secondary: #CBD5E1;
  --text-tertiary: #94A3B8;
  --color-primary: #4F46E5;
  --color-secondary: #9333EA;
  /* ... 其他变量 */
}

/* 海天宁静主题 */
:root[data-theme="serene-horizon"] {
  --bg-primary: #E8F4F8;
  --bg-secondary: #BFD9E8;
  --bg-card: rgba(255, 255, 255, 0.9);
  --text-primary: #2C3E50;
  --text-secondary: #5A6C7D;
  --text-tertiary: #7F8C9A;
  --color-primary: #7FB8D1;
  --color-secondary: #9FC9E0;
  /* ... 其他变量 */
}
```

**迁移策略**：
1. 保留现有的CSS变量命名（`--color-*`, `--bg-*`, `--text-*`）
2. 将`[data-theme="dark"]`映射到`[data-theme="tech"]`，保持向后兼容
3. 逐步将硬编码颜色替换为CSS变量引用

#### 3.2 React Context实现

创建ThemeContext提供主题状态管理：

```typescript
interface ThemeContextValue {
  currentTheme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
}
```

#### 3.3 持久化存储

使用localStorage保存用户选择的主题：

```typescript
const THEME_STORAGE_KEY = 'heartsphere-theme';
```

### 4. 渐变处理方案

#### 4.1 问题分析

代码中大量使用Tailwind渐变类（如`from-warm-pink to-warm-pink-light`、`from-indigo-600 to-purple-600`），但Tailwind的`from-*`和`to-*`类无法直接使用CSS变量，导致主题切换时渐变无法自动更新。

#### 4.2 解决方案

采用**CSS渐变类方案**（推荐）：

1. **创建主题相关的CSS渐变类**
   - 在`tokens.css`中为每个主题定义渐变类
   - 使用CSS变量构建渐变，确保主题切换时自动更新

2. **渐变类命名规范**
   - 格式：`.gradient-{用途}-{主题}`
   - 示例：`.gradient-primary-tech`, `.gradient-primary-serene`
   - 通用类：`.gradient-primary`（自动适配当前主题）

3. **实现方式**

```css
/* 科技风格渐变 */
:root[data-theme="tech"],
:root[data-theme="dark"] {
  --gradient-primary: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  --gradient-button: linear-gradient(135deg, #4F46E5 0%, #9333EA 100%);
  --gradient-bg: linear-gradient(135deg, #000000 0%, #0F172A 100%);
}

/* 海天宁静渐变 */
:root[data-theme="serene-horizon"] {
  --gradient-primary: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  --gradient-button: linear-gradient(135deg, #7FB8D1 0%, #9FC9E0 100%);
  --gradient-bg: linear-gradient(135deg, #E8F4F8 0%, #BFD9E8 50%, #9FC9E0 100%);
}

/* 通用渐变类（自动适配当前主题） */
.gradient-primary {
  background: var(--gradient-primary);
}

.gradient-button {
  background: var(--gradient-button);
}

.gradient-bg {
  background: var(--gradient-bg);
}
```

4. **组件迁移策略**

**迁移前**（使用Tailwind渐变类）：
```tsx
<button className="bg-gradient-to-r from-pink-500 to-purple-600">
  按钮
</button>
```

**迁移后**（使用CSS渐变类）：
```tsx
<button className="gradient-button">
  按钮
</button>
```

**或者使用内联样式**（适用于动态渐变）：
```tsx
<button style={{ background: 'var(--gradient-button)' }}>
  按钮
</button>
```

5. **需要迁移的组件**

- `components/Button.tsx`: `from-pink-500 to-purple-600` → `.gradient-button`
- `components/ui/Button.tsx`: `from-warm-pink to-warm-pink-light` → `.gradient-primary`
- `components/character/Expression.tsx`: `from-warm-pink-lightest/50 to-calm-blue-lightest/50` → 自定义渐变类
- `MobileStyleGuide.ts`: `from-indigo-600 to-purple-600` → `.gradient-button-tech`

#### 4.3 现有渐变类的处理

`tokens.css`中已有的渐变类（`.gradient-primary`, `.gradient-secondary`等）已经使用CSS变量，理论上支持主题切换。需要：

1. 确保所有主题都定义了相应的CSS变量
2. 验证这些渐变类在不同主题下的表现
3. 根据主题特点调整渐变效果

### 5. 移动端特殊效果实现

#### 5.1 云纹背景（场景选择页）

**实现方式**：使用CSS渐变模拟云纹效果

```css
/* 海天宁静主题 - 云纹背景 */
:root[data-theme="serene-horizon"] {
  --bg-cloud-pattern: 
    radial-gradient(circle at 20% 30%, rgba(191, 217, 232, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(159, 201, 224, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(232, 244, 248, 0.4) 0%, transparent 50%),
    linear-gradient(135deg, #E8F4F8 0%, #BFD9E8 50%, #9FC9E0 100%);
}

.mobile-scene-selection-bg {
  background: var(--bg-cloud-pattern);
  background-size: 100% 100%;
  background-attachment: fixed;
}
```

**特点**：
- 使用多个径向渐变叠加，模拟云朵效果
- 颜色使用主题CSS变量，确保主题切换时自动更新
- 性能优化：使用`background-attachment: fixed`实现视差效果（可选）

#### 5.2 星空背景（心域连接页）

**实现方式**：使用提供的星空图片 + CSS滤镜

```css
/* 海天宁静主题 - 星空背景 */
:root[data-theme="serene-horizon"] {
  --bg-starry: url('/images/starry-connection-bg.jpg');
  --bg-starry-overlay: rgba(127, 184, 209, 0.1); /* 柔和的蓝色遮罩 */
}

.mobile-connection-space-bg {
  background-image: var(--bg-starry);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.mobile-connection-space-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--bg-starry-overlay);
  backdrop-filter: blur(0.5px); /* 轻微柔化 */
}
```

**特点**：
- 使用提供的星空图片作为背景
- 添加柔和的蓝色遮罩，与主题色调一致
- 轻微模糊效果，增强沉浸感

#### 5.3 柔光星辰效果（角色和心域）

**实现方式**：CSS动画 + 发光效果

```css
/* 柔光星辰效果 */
.star-glow {
  position: relative;
  filter: drop-shadow(0 0 8px rgba(127, 184, 209, 0.6));
  animation: starPulse 3s ease-in-out infinite;
}

.star-glow::before {
  content: '';
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, rgba(127, 184, 209, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: starGlow 2s ease-in-out infinite;
}

@keyframes starPulse {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.1);
    opacity: 0.9;
  }
}

@keyframes starGlow {
  0%, 100% { 
    opacity: 0.3;
    transform: scale(1);
  }
  50% { 
    opacity: 0.6;
    transform: scale(1.2);
  }
}
```

**使用方式**：
```tsx
<div className="star-glow">
  {/* 角色或心域内容 */}
</div>
```

**特点**：
- 使用CSS动画实现柔和的脉冲效果
- 发光效果使用`drop-shadow`和径向渐变
- 颜色使用主题CSS变量，确保主题切换时自动更新

#### 5.4 大圆角白色浮动卡片

**实现方式**：CSS样式 + 阴影

```css
/* 海天宁静主题 - 浮动卡片 */
:root[data-theme="serene-horizon"] {
  --card-bg: rgba(255, 255, 255, 0.9);
  --card-shadow: 0 8px 32px rgba(127, 184, 209, 0.15);
  --card-radius: 20px;
}

.mobile-scene-card-serene {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.mobile-scene-card-serene:active {
  transform: scale(0.98);
}
```

**特点**：
- 大圆角（20px）营造柔和感
- 半透明白色背景，带毛玻璃效果
- 柔和的蓝色阴影，与主题色调一致
- 触摸反馈动画

#### 5.5 半透明白色底部导航

**实现方式**：CSS样式

```css
/* 海天宁静主题 - 底部导航 */
:root[data-theme="serene-horizon"] {
  --tabbar-bg: rgba(255, 255, 255, 0.9);
  --tabbar-icon-color: #7FB8D1; /* Clear Sky Blue */
  --tabbar-icon-active: #5A9BB8;
}

.mobile-tabbar-serene {
  background: var(--tabbar-bg);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(127, 184, 209, 0.2);
}

.mobile-tabbar-icon-serene {
  color: var(--tabbar-icon-color);
  transition: color 0.2s ease;
}

.mobile-tabbar-icon-serene.active {
  color: var(--tabbar-icon-active);
}
```

**特点**：
- 半透明白色背景，带强毛玻璃效果
- 图标使用Clear Sky Blue（#7FB8D1）
- 激活状态颜色稍深

### 6. CSS变量完整列表

#### 6.1 背景色变量

```css
--bg-primary: /* 主背景色 */
--bg-secondary: /* 次要背景色 */
--bg-card: /* 卡片背景色 */
--bg-overlay: /* 遮罩背景色 */
--bg-hover: /* 悬停背景色 */
--bg-cloud-pattern: /* 云纹背景（移动端） */
--bg-starry: /* 星空背景（移动端） */
--bg-starry-overlay: /* 星空背景遮罩（移动端） */
```

#### 6.2 文字颜色变量

```css
--text-primary: /* 主文字色 */
--text-secondary: /* 次要文字色 */
--text-tertiary: /* 第三级文字色 */
--text-disabled: /* 禁用文字色 */
--text-link: /* 链接文字色 */
--text-accent: /* 强调文字色 */
```

#### 6.3 主色调变量

```css
--color-primary: /* 主色 */
--color-primary-light: /* 主色浅色 */
--color-primary-lighter: /* 主色更浅 */
--color-primary-lightest: /* 主色最浅 */
--color-secondary: /* 辅助色 */
--color-secondary-light: /* 辅助色浅色 */
```

#### 6.4 温度感系统变量（保留兼容性）

```css
--color-warm-pink: /* 温暖粉色 */
--color-warm-pink-light: /* 温暖粉色浅色 */
--color-warm-pink-lighter: /* 温暖粉色更浅 */
--color-warm-pink-lightest: /* 温暖粉色最浅 */
--color-warm-beige: /* 温暖米色 */
--color-warm-beige-light: /* 温暖米色浅色 */
--color-warm-beige-dark: /* 温暖米色深色 */
--color-warm-orange: /* 温暖橙色 */
--color-warm-orange-light: /* 温暖橙色浅色 */
--color-calm-blue: /* 宁静蓝色 */
--color-calm-blue-light: /* 宁静蓝色浅色 */
--color-calm-blue-lighter: /* 宁静蓝色更浅 */
--color-calm-blue-lightest: /* 宁静蓝色最浅 */
```

#### 6.5 语义色变量

```css
--color-success: /* 成功色 */
--color-warning: /* 警告色 */
--color-error: /* 错误色 */
--color-info: /* 信息色 */
```

#### 6.6 渐变变量

```css
--gradient-primary: /* 主渐变 */
--gradient-secondary: /* 次要渐变 */
--gradient-button: /* 按钮渐变 */
--gradient-bg: /* 背景渐变 */
--gradient-text: /* 文字渐变 */
```

#### 6.7 阴影变量

```css
--shadow-sm: /* 小阴影 */
--shadow-md: /* 中等阴影 */
--shadow-lg: /* 大阴影 */
--shadow-primary: /* 主色调阴影 */
--shadow-card: /* 卡片阴影（移动端） */
```

#### 6.8 圆角变量

```css
--radius-sm: /* 小圆角 */
--radius-md: /* 中等圆角 */
--radius-lg: /* 大圆角 */
--radius-xl: /* 超大圆角 */
--radius-full: /* 完全圆角 */
--card-radius: /* 卡片圆角（移动端） */
```

#### 6.9 移动端特殊变量

```css
--tabbar-bg: /* 底部导航背景 */
--tabbar-icon-color: /* 底部导航图标颜色 */
--tabbar-icon-active: /* 底部导航图标激活颜色 */
```

#### 6.10 过渡和动画变量

```css
--transition-fast: /* 快速过渡 */
--transition-normal: /* 正常过渡 */
--transition-slow: /* 慢速过渡 */
--ease-out: /* 缓出函数 */
--ease-in: /* 缓入函数 */
--ease-in-out: /* 缓入缓出函数 */
```

### 7. Tailwind集成方案

#### 7.1 集成策略

由于Tailwind不支持运行时主题切换，采用**混合方案**：

**方案A：CSS变量覆盖Tailwind颜色**（推荐）
- 在Tailwind配置中使用CSS变量作为颜色值
- 通过`theme()`函数引用CSS变量
- 优点：可以继续使用Tailwind类名，代码改动小
- 缺点：需要Tailwind 3.1+，部分动态类名可能不工作

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'text-primary': 'var(--text-primary)',
        // ...
      }
    }
  }
}
```

**方案B：减少Tailwind颜色类使用**
- 对于需要主题切换的组件，改用CSS变量
- 保留Tailwind用于布局、间距等不需要主题的部分
- 优点：完全控制，性能好
- 缺点：需要修改大量组件代码

**实施方案**：采用**方案B**，分阶段迁移：
1. 基础组件（Button, Input, Card）优先使用CSS变量
2. 页面组件逐步迁移
3. 布局、间距等继续使用Tailwind

#### 7.2 Tailwind配置更新

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        // 主题颜色（通过CSS变量）
        'theme-bg-primary': 'var(--bg-primary)',
        'theme-bg-secondary': 'var(--bg-secondary)',
        'theme-bg-card': 'var(--bg-card)',
        'theme-text-primary': 'var(--text-primary)',
        'theme-text-secondary': 'var(--text-secondary)',
        // 保留原有颜色系统（用于不需要主题的部分）
        // ...
      }
    }
  }
}
```

### 8. 组件适配策略

#### 8.1 迁移优先级

**阶段1：基础组件**（最高优先级）
- Button, Input, Card, Modal等基础UI组件
- 这些组件被广泛使用，优先迁移影响最大

**阶段2：页面组件**
- ChatWindow, SceneCard, CharacterCard等页面级组件
- 确保主要功能页面支持主题切换

**阶段3：其他组件**
- 辅助组件、工具组件等
- 逐步完善主题支持

#### 8.2 迁移步骤
1. **识别硬编码颜色**: 使用工具搜索所有组件中的硬编码颜色值
2. **替换为CSS变量**: 将硬编码颜色替换为CSS变量引用或Tailwind主题类
3. **测试主题切换**: 确保组件在不同主题下正常显示
4. **验证对比度**: 确保文字可读性（WCAG AA标准）

#### 8.3 组件分类
- **基础组件**: Button, Input, Card等，必须完全支持主题
- **页面组件**: 各页面组件，需要适配主题
- **移动端组件**: Mobile组件，需要适配主题，特别是"海天宁静"风格的特殊设计

### 9. 性能考虑

- **CSS变量**: 使用CSS变量而非JavaScript动态注入，确保性能
- **主题切换优化**:
  - 使用`requestAnimationFrame`批量更新DOM
  - 避免在主题切换时触发大量重排/重绘
  - 考虑使用CSS `transition`实现平滑过渡（但需要谨慎，避免性能问题）
- **懒加载**: 主题定义可以按需加载
- **缓存**: 主题配置缓存在内存中，避免重复解析
- **防抖处理**: 主题切换操作不需要防抖（用户操作频率低）

### 10. 扩展性

系统设计支持未来添加更多主题：
- 主题定义独立于代码逻辑
- 新增主题只需添加主题定义文件
- 无需修改现有组件代码
- 主题ID使用kebab-case命名规范（如`tech`, `serene-horizon`）

### 11. 错误处理

- **localStorage不可用**: 降级到内存存储，不持久化用户选择
- **主题定义加载失败**: 使用默认主题（tech），并在控制台输出警告
- **无效主题ID**: 验证主题ID，如果无效则使用默认主题
- **CSS变量未定义**: 提供fallback值，确保页面正常显示

### 12. 温度感系统兼容性

#### 12.1 兼容性说明

温度感系统使用CSS变量如`var(--color-warm-pink)`, `var(--color-calm-blue)`等，这些变量在不同主题下会有不同的值：

- **科技风格**：保持或调整温度感颜色，确保在深色背景下有足够的对比度
- **海天宁静**：调整温度感颜色，使其与淡蓝色背景协调

#### 12.2 实现策略

1. **保留温度感变量**：所有温度感相关的CSS变量都保留，确保现有组件继续工作
2. **主题适配**：在每个主题中定义温度感变量的值，确保在不同主题下都有合适的表现
3. **测试验证**：确保温度感系统在不同主题下正常工作

#### 12.3 温度感变量定义

每个主题都需要定义以下温度感变量：

```css
/* 科技风格 */
:root[data-theme="tech"] {
  --color-warm-pink: #FFB3B3; /* 在深色背景下提高亮度 */
  --color-calm-blue: #9FC9E0;
  /* ... 其他温度感变量 */
}

/* 海天宁静 */
:root[data-theme="serene-horizon"] {
  --color-warm-pink: #FF9999; /* 保持原色或稍作调整 */
  --color-calm-blue: #7FB8D1; /* 与主题主色一致 */
  /* ... 其他温度感变量 */
}
```

## 技术决策

### 为什么使用CSS变量而非CSS-in-JS？
- **性能**: CSS变量由浏览器原生支持，性能更好
- **兼容性**: 与现有Tailwind CSS系统兼容
- **简单性**: 无需引入额外的CSS-in-JS库

### 为什么使用localStorage而非后端存储？
- **即时性**: 主题切换应该立即生效，无需等待网络请求
- **离线支持**: 即使离线也能切换主题
- **减轻服务器负担**: 主题偏好是纯前端配置，无需后端支持

## 迁移计划

### Phase 1: 准备和设计（1-2天）
1. 分析现有颜色使用情况（使用工具扫描代码）
2. 确定"科技风格"的具体颜色定义（基于实际使用）
3. 确定Tailwind集成方案
4. 完善设计文档

### Phase 2: 基础设施（2-3天）
1. 创建主题数据结构（TypeScript接口）
2. 实现Theme Context和Provider
3. 重构CSS变量系统（支持多主题）
4. 实现"科技风格"和"海天宁静"主题定义
5. 实现主题持久化（localStorage）

### Phase 3: 基础组件迁移（3-5天）
1. 迁移Button、Input、Card等基础组件
2. 更新Tailwind配置
3. 测试主题切换功能
4. 修复发现的问题

### Phase 4: 页面组件迁移（5-7天）
1. 迁移PC端页面组件（ChatWindow, SceneCard等）
2. 迁移移动端页面组件
3. 实现"海天宁静"风格的移动端特殊设计
4. 测试所有页面在不同主题下的显示

### Phase 5: 用户界面和测试（2-3天）
1. 实现设置界面中的主题选择器（PC和移动端）
2. 实现主题预览功能
3. 实现主题切换过渡动画
4. 全面测试（功能、性能、无障碍性）
5. 文档更新
