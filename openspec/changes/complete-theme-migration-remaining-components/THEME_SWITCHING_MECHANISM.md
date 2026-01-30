# 主题切换机制详解

## 概述

当前主题系统使用 **CSS 变量 + data-theme 属性** 的方式实现主题切换。这是一个轻量级、高性能的方案，无需重新加载页面即可切换主题。

## 切换流程

### 1. 用户触发切换

用户通过主题选择器组件触发切换：

```typescript
// ThemeSelector.tsx 或 MobileThemeSelector.tsx
<button onClick={() => setTheme(theme.id)}>
  选择主题
</button>
```

### 2. React Context 处理

`ThemeContext` 中的 `setTheme` 函数被调用：

```typescript
// src/contexts/ThemeContext.tsx
const setTheme = useCallback((newThemeId: ThemeId) => {
  setThemeIdState(newThemeId);           // 1. 更新 React 状态
  setCurrentTheme(getTheme(newThemeId));  // 2. 更新当前主题对象
  applyTheme(newThemeId);                 // 3. 应用主题到 DOM
  saveThemeToStorage(newThemeId);        // 4. 保存到 localStorage
}, []);
```

### 3. 应用主题到 DOM

`applyTheme` 函数设置 `data-theme` 属性：

```typescript
// src/utils/theme.ts
export function applyTheme(themeId: ThemeId): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', themeId);  // 关键：设置 data-theme 属性
  
  // 兼容旧的 dark 主题
  if (themeId === 'tech') {
    root.setAttribute('data-theme-legacy', 'dark');
  } else {
    root.removeAttribute('data-theme-legacy');
  }
}
```

### 4. CSS 选择器生效

CSS 通过属性选择器匹配不同的主题：

```css
/* tokens.css */

/* 默认主题（Tech Style） */
:root,
:root[data-theme="tech"],
:root[data-theme="dark"] {
  --bg-primary: #000000;
  --text-primary: #FFFFFF;
  --color-primary: #4F46E5;
  /* ... 其他变量 */
}

/* Serene Horizon 主题 */
:root[data-theme="serene-horizon"] {
  --bg-primary: #E3F2F8;
  --text-primary: #0F1F2E;
  --color-primary: #5BA3C7;
  /* ... 其他变量 */
}
```

### 5. 组件自动更新

所有使用 CSS 变量的组件自动更新：

```tsx
// 组件中使用 CSS 变量
<div style={{ backgroundColor: 'var(--bg-primary)' }}>
  <p style={{ color: 'var(--text-primary)' }}>文字内容</p>
</div>
```

## 核心机制

### CSS 变量 + 属性选择器

这是整个系统的核心：

1. **CSS 变量定义**：在 `tokens.css` 中为每个主题定义 CSS 变量
2. **属性选择器匹配**：通过 `:root[data-theme="xxx"]` 选择器匹配不同主题
3. **即时生效**：改变 `data-theme` 属性后，CSS 立即应用新的变量值

### 优势

- ✅ **性能优秀**：无需重新渲染组件，只需改变一个 DOM 属性
- ✅ **即时切换**：切换时间 < 100ms
- ✅ **无闪烁**：CSS 变量切换是原子操作
- ✅ **易于维护**：所有颜色定义集中在 CSS 文件中

## 完整流程图

```
用户点击主题选择器
    ↓
ThemeSelector.setTheme(themeId)
    ↓
ThemeContext.setTheme(newThemeId)
    ↓
┌─────────────────────────────────┐
│ 1. setThemeIdState(newThemeId)  │  ← 更新 React 状态
│ 2. setCurrentTheme(getTheme())  │  ← 更新主题对象
│ 3. applyTheme(newThemeId)       │  ← 应用主题到 DOM
│ 4. saveThemeToStorage()         │  ← 保存到 localStorage
└─────────────────────────────────┘
    ↓
document.documentElement.setAttribute('data-theme', themeId)
    ↓
CSS 选择器 :root[data-theme="xxx"] 匹配
    ↓
CSS 变量值更新（--bg-primary, --text-primary 等）
    ↓
所有使用 var(--xxx) 的组件自动更新样式
    ↓
页面立即显示新主题
```

## 持久化机制

### 保存主题

```typescript
// src/utils/theme.ts
export function saveThemeToStorage(themeId: ThemeId): void {
  try {
    localStorage.setItem('heartsphere-theme', themeId);
  } catch (error) {
    console.warn('[Theme] Failed to save theme to localStorage:', error);
  }
}
```

### 加载主题

```typescript
// 应用启动时
export function initializeTheme(): ThemeId {
  const themeId = loadThemeFromStorage();  // 从 localStorage 读取
  applyTheme(themeId);                      // 立即应用
  return themeId;
}
```

### 初始化流程

```typescript
// ThemeContext.tsx
useEffect(() => {
  const initialThemeId = initializeTheme();  // 从 localStorage 加载
  if (initialThemeId !== themeId) {
    setThemeIdState(initialThemeId);
    setCurrentTheme(getTheme(initialThemeId));
  }
}, []);
```

## 组件使用方式

### 在组件中使用主题

```typescript
// 方式 1: 使用 useTheme Hook
import { useTheme } from '../hooks/useTheme';

const MyComponent = () => {
  const { currentTheme, setTheme, themeId } = useTheme();
  
  return (
    <div>
      <p>当前主题: {currentTheme.name}</p>
      <button onClick={() => setTheme('serene-horizon')}>
        切换主题
      </button>
    </div>
  );
};
```

### 在样式中使用 CSS 变量

```tsx
// 方式 2: 直接使用 CSS 变量
<div style={{ 
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border-color-overlay)',
}}>
  内容
</div>
```

### 在 CSS 类中使用

```css
/* 在 CSS 文件中 */
.my-component {
  background-color: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color-overlay);
}
```

## 特殊处理

### Canvas 绘制

Canvas API 无法直接使用 CSS 变量，需要动态获取：

```typescript
// ConnectionSpace.tsx
const getThemeColor = (varName: string, fallback: string) => {
  if (typeof window !== 'undefined') {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName).trim();
    return value || fallback;
  }
  return fallback;
};

// 使用
const bgColor = getThemeColor('--bg-primary', '#050510');
ctx.fillStyle = hexToRgba(bgColor, 0.4);
```

### SVG 渐变

SVG 渐变可以直接使用 CSS 变量：

```tsx
<linearGradient id="emotionGradient">
  <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.3" />
  <stop offset="50%" stopColor="var(--text-tertiary)" stopOpacity="0.1" />
  <stop offset="100%" stopColor="var(--color-error)" stopOpacity="0.3" />
</linearGradient>
```

## 主题定义结构

### TypeScript 类型定义

```typescript
// src/types/theme.ts
export interface Theme {
  id: ThemeId;
  name: string;
  nameEn: string;
  description: string;
  colors: {
    bg: { primary: string; secondary: string; ... };
    text: { primary: string; secondary: string; ... };
    primary: { main: string; light: string; ... };
    semantic: { success: string; warning: string; ... };
  };
  shadows: { sm: string; md: string; ... };
  radius: { sm: string; md: string; ... };
  gradients: { primary: string; secondary: string; ... };
}
```

### 主题定义文件

```typescript
// src/themes/serene-horizon.ts
export const sereneHorizonTheme: Theme = {
  id: 'serene-horizon',
  name: '海天宁静',
  colors: { ... },
  // ...
};
```

### CSS 变量映射

CSS 变量在 `tokens.css` 中定义，与 TypeScript 主题对象对应：

```css
:root[data-theme="serene-horizon"] {
  --bg-primary: #E3F2F8;        /* 对应 theme.colors.bg.primary */
  --text-primary: #0F1F2E;      /* 对应 theme.colors.text.primary */
  --color-primary: #5BA3C7;     /* 对应 theme.colors.primary.main */
  /* ... */
}
```

## 兼容性处理

### 旧主题兼容

```typescript
// 兼容旧的 dark 主题
if (themeId === 'tech') {
  root.setAttribute('data-theme-legacy', 'dark');
} else {
  root.removeAttribute('data-theme-legacy');
}
```

### CSS 兼容

```css
/* 同时匹配 tech 和 dark */
:root,
:root[data-theme="tech"],
:root[data-theme="dark"] {
  /* Tech Style 主题变量 */
}
```

## 性能优化

### 1. 使用 useCallback

```typescript
const setTheme = useCallback((newThemeId: ThemeId) => {
  // ...
}, []);  // 无依赖，函数引用稳定
```

### 2. CSS 变量切换是原子操作

- 只需改变一个 DOM 属性
- 浏览器自动处理所有 CSS 变量更新
- 无需重新渲染 React 组件

### 3. 避免不必要的重渲染

```typescript
// 组件中使用 CSS 变量，而不是从 Context 读取颜色值
// 这样组件不会因为主题切换而重渲染
<div style={{ color: 'var(--text-primary)' }}>  // ✅ 好
<div style={{ color: currentTheme.colors.text.primary }}>  // ❌ 会导致重渲染
```

## 调试方法

### 检查当前主题

```javascript
// 浏览器控制台
document.documentElement.getAttribute('data-theme')
```

### 检查 CSS 变量值

```javascript
// 浏览器控制台
getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')
```

### 手动切换主题

```javascript
// 浏览器控制台
document.documentElement.setAttribute('data-theme', 'serene-horizon')
```

## 总结

当前主题切换机制的核心是：

1. **CSS 变量**：所有颜色定义为 CSS 变量
2. **data-theme 属性**：通过改变 `<html>` 元素的 `data-theme` 属性切换主题
3. **CSS 选择器**：通过 `:root[data-theme="xxx"]` 匹配不同主题
4. **React Context**：管理主题状态和切换逻辑
5. **localStorage**：持久化用户选择

这是一个**高效、简洁、易维护**的主题切换方案。
