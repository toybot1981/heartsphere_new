# 主题系统文件参考

## 文件结构总览

```
main/frontend/
├── src/
│   ├── themes/                    # 主题定义目录
│   │   ├── index.ts              # 主题导出和注册
│   │   ├── tech.ts               # Tech Style 主题定义
│   │   └── serene-horizon.ts     # Serene Horizon 主题定义
│   ├── types/
│   │   └── theme.ts              # 主题类型定义
│   ├── contexts/
│   │   └── ThemeContext.tsx      # 主题 Context 和 Provider
│   ├── hooks/
│   │   └── useTheme.ts           # 主题 Hook
│   ├── utils/
│   │   ├── theme.ts              # 主题工具函数
│   │   ├── themeStyles.ts        # 主题样式工具函数
│   │   ├── themeClasses.ts       # 主题类名工具函数
│   │   └── themeTestUtils.ts     # 主题测试工具（开发用）
│   └── tokens.css                # CSS 变量定义（所有主题）
├── components/
│   ├── ThemeSelector.tsx         # PC 端主题选择器组件
│   └── ThemeTestPage.tsx         # 主题测试页面组件
└── mobile/
    └── components/
        └── MobileThemeSelector.tsx # 移动端主题选择器组件
```

## 详细文件说明

### 1. 主题定义文件

#### `src/themes/index.ts`
**路径**: `main/frontend/src/themes/index.ts`  
**作用**: 主题注册和导出  
**内容**:
- 导出所有主题定义
- 主题注册表
- `getTheme()`, `getAllThemes()`, `isValidThemeId()` 等函数

#### `src/themes/tech.ts`
**路径**: `main/frontend/src/themes/tech.ts`  
**作用**: Tech Style 主题定义（默认深色主题）  
**内容**:
- 主题 ID: `'tech'`
- 主题名称: `'科技风格'` / `'Tech Style'`
- 颜色定义（背景、文字、主色、语义色等）
- 阴影、圆角、渐变定义

#### `src/themes/serene-horizon.ts`
**路径**: `main/frontend/src/themes/serene-horizon.ts`  
**作用**: Serene Horizon 主题定义（浅色主题）  
**内容**:
- 主题 ID: `'serene-horizon'`
- 主题名称: `'海天宁静'` / `'Serene Horizon'`
- 颜色定义（淡蓝色背景、深色文字等）
- 阴影、圆角、渐变定义
- 移动端特殊变量（云纹背景、星空背景等）

### 2. 类型定义文件

#### `src/types/theme.ts`
**路径**: `main/frontend/src/types/theme.ts`  
**作用**: 主题系统的 TypeScript 类型定义  
**内容**:
- `ThemeId` 类型: `'tech' | 'serene-horizon'`
- `Theme` 接口: 完整的主题数据结构
- `ThemeConfig` 接口: 主题配置

### 3. Context 和 Hook

#### `src/contexts/ThemeContext.tsx`
**路径**: `main/frontend/src/contexts/ThemeContext.tsx`  
**作用**: 主题 Context 和 Provider  
**内容**:
- `ThemeContext`: React Context
- `ThemeProvider`: 主题提供者组件
- 主题状态管理
- 主题切换逻辑

#### `src/hooks/useTheme.ts`
**路径**: `main/frontend/src/hooks/useTheme.ts`  
**作用**: 主题 Hook，用于在组件中访问主题  
**内容**:
- `useTheme()`: 返回当前主题、主题列表、切换函数

### 4. 工具函数文件

#### `src/utils/theme.ts`
**路径**: `main/frontend/src/utils/theme.ts`  
**作用**: 主题核心工具函数  
**内容**:
- `applyTheme(themeId)`: 应用主题到 DOM
- `getCurrentTheme()`: 获取当前主题 ID
- `loadThemeFromStorage()`: 从 localStorage 加载主题
- `saveThemeToStorage(themeId)`: 保存主题到 localStorage
- `initializeTheme()`: 初始化主题

#### `src/utils/themeStyles.ts`
**路径**: `main/frontend/src/utils/themeStyles.ts`  
**作用**: 主题样式工具函数  
**内容**:
- `getThemeBgStyle()`: 获取主题背景色样式
- `getThemeTextStyle()`: 获取主题文字颜色样式
- `getThemePrimaryStyle()`: 获取主题主色调样式

#### `src/utils/themeClasses.ts`
**路径**: `main/frontend/src/utils/themeClasses.ts`  
**作用**: 主题类名工具函数  
**内容**:
- `getThemeBgClass()`: 获取主题背景色类名
- 其他类名工具函数

#### `src/utils/themeTestUtils.ts`
**路径**: `main/frontend/src/utils/themeTestUtils.ts`  
**作用**: 主题测试工具（开发环境使用）  
**内容**:
- `testThemeSwitching()`: 测试主题切换
- `checkCSSVariables()`: 检查 CSS 变量
- `testThemeSwitchingPerformance()`: 性能测试
- 其他测试函数

### 5. CSS 变量定义文件

#### `src/tokens.css`
**路径**: `main/frontend/src/tokens.css`  
**作用**: 所有主题的 CSS 变量定义  
**内容**:
- 默认值（字体、行高、过渡等）
- Tech Style 主题变量（`:root[data-theme="tech"]`）
- Serene Horizon 主题变量（`:root[data-theme="serene-horizon"]`）
- 所有 CSS 变量（背景、文字、颜色、阴影、圆角、渐变等）

### 6. 组件文件

#### `components/ThemeSelector.tsx`
**路径**: `main/frontend/components/ThemeSelector.tsx`  
**作用**: PC 端主题选择器组件  
**内容**:
- 显示所有可用主题
- 主题切换按钮
- 当前主题标记

#### `components/ThemeTestPage.tsx`
**路径**: `main/frontend/components/ThemeTestPage.tsx`  
**作用**: 主题测试页面组件  
**内容**:
- 主题选择器
- 颜色变量展示
- 组件示例
- 测试工具说明

#### `mobile/components/MobileThemeSelector.tsx`
**路径**: `main/frontend/mobile/components/MobileThemeSelector.tsx`  
**作用**: 移动端主题选择器组件  
**内容**:
- 移动端优化的主题选择界面
- 主题切换功能

## 文件依赖关系

```
tokens.css (CSS 变量定义)
    ↑
    │ 通过 data-theme 属性应用
    │
ThemeContext.tsx (状态管理)
    ↑
    │ 使用
    │
useTheme.ts (Hook)
    ↑
    │ 使用
    │
ThemeSelector.tsx / MobileThemeSelector.tsx (UI 组件)
    ↑
    │ 用户交互
    │
用户点击切换主题
```

## 如何添加新主题

### 步骤 1: 创建主题定义文件

在 `src/themes/` 目录下创建新文件，例如 `ocean-breeze.ts`:

```typescript
// src/themes/ocean-breeze.ts
import { Theme } from '../types/theme';

export const oceanBreezeTheme: Theme = {
  id: 'ocean-breeze',
  name: '海洋微风',
  nameEn: 'Ocean Breeze',
  description: '清新的海洋风格主题',
  colors: {
    bg: {
      primary: '#E0F2F1',
      secondary: '#B2DFDB',
      // ...
    },
    // ...
  },
  // ...
};
```

### 步骤 2: 注册主题

在 `src/themes/index.ts` 中注册：

```typescript
import { oceanBreezeTheme } from './ocean-breeze';

export const themes: Theme[] = [
  techTheme,
  sereneHorizonTheme,
  oceanBreezeTheme,  // 添加新主题
];

export type ThemeId = 'tech' | 'serene-horizon' | 'ocean-breeze';
```

### 步骤 3: 添加 CSS 变量

在 `src/tokens.css` 中添加：

```css
:root[data-theme="ocean-breeze"] {
  --bg-primary: #E0F2F1;
  --text-primary: #004D40;
  --color-primary: #00796B;
  /* ... 其他变量 */
}
```

### 步骤 4: 测试

1. 启动应用
2. 访问测试页面: `http://localhost:5173/?test=theme`
3. 验证新主题显示正确

## 关键文件快速查找

| 功能 | 文件路径 |
|------|---------|
| 添加新主题定义 | `src/themes/新主题名.ts` |
| 修改主题颜色 | `src/themes/主题名.ts` 和 `src/tokens.css` |
| 修改主题切换逻辑 | `src/utils/theme.ts` |
| 修改主题状态管理 | `src/contexts/ThemeContext.tsx` |
| 修改主题选择器 UI | `components/ThemeSelector.tsx` 或 `mobile/components/MobileThemeSelector.tsx` |
| 查看所有 CSS 变量 | `src/tokens.css` |
| 查看主题类型定义 | `src/types/theme.ts` |

## 文件大小参考

- `tokens.css`: ~450 行（包含两个主题的所有 CSS 变量）
- `tech.ts`: ~100 行
- `serene-horizon.ts`: ~110 行
- `ThemeContext.tsx`: ~85 行
- `theme.ts`: ~83 行

## 注意事项

1. **CSS 变量必须与 TypeScript 定义对应**
   - `tokens.css` 中的变量名必须与组件中使用的变量名一致
   - 例如: `--bg-primary` 在 CSS 和组件中都要一致

2. **主题 ID 必须唯一**
   - 在 `src/themes/index.ts` 中注册
   - 在 `ThemeId` 类型中添加

3. **CSS 选择器格式**
   - 必须使用 `:root[data-theme="主题ID"]` 格式
   - 确保与 `applyTheme()` 函数设置的属性值一致

4. **测试新主题**
   - 使用 `ThemeTestPage` 组件测试
   - 运行 `themeTestUtils.runAllTests()` 验证
