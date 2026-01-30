# 设计文档：完成剩余组件的主题迁移

## 设计目标

完成 main 工程中所有剩余组件的主题迁移，确保：
1. **一致性**: 所有组件在不同主题下正确显示
2. **可维护性**: 使用统一的 CSS 变量，便于管理和扩展
3. **性能**: 主题切换流畅，无性能问题
4. **可访问性**: 颜色对比度符合 WCAG AA 标准

## 当前状态

### 已完成迁移
- **PC端**: 13个组件（约10%）
  - ChatWindow 子组件（9个）
  - 主要页面组件（4个）
  - 基础组件（3个）
- **移动端**: 4个组件（约8%）
  - 主要页面（3个）
  - 设置组件（1个）

### 待迁移组件统计
- **PC端**: 约 100+ 个文件
- **移动端**: 约 40+ 个文件
- **总计**: 约 140+ 个文件

## 迁移策略

### 优先级分类

#### 高优先级（阶段 1）
- **核心功能组件**: 用户最常使用的页面和组件
- **主要模态框**: 登录、设置等关键交互
- **移动端主要页面**: 移动端核心功能页面

#### 中优先级（阶段 2）
- **功能模块组件**: 特定功能的组件集合
- **按模块分组**: HeartConnect、QuickConnect、Portal 等

#### 低优先级（阶段 3）
- **辅助组件**: 工具类、示例类组件
- **可选组件**: 不影响核心功能的组件

### 迁移模式

#### 标准迁移模式

**背景色迁移**:
```tsx
// 替换前
className="bg-black"
className="bg-slate-900"
className="bg-gray-800"

// 替换后
style={{ backgroundColor: 'var(--bg-primary, #000000)' }}
style={{ backgroundColor: 'var(--bg-secondary, #0f172a)' }}
style={{ backgroundColor: 'var(--bg-card, rgba(31, 41, 55, 0.8))' }}
```

**文字颜色迁移**:
```tsx
// 替换前
className="text-white"
className="text-gray-300"
className="text-gray-400"

// 替换后
style={{ color: 'var(--text-primary)' }}
style={{ color: 'var(--text-secondary)' }}
style={{ color: 'var(--text-tertiary)' }}
```

**边框颜色迁移**:
```tsx
// 替换前
className="border border-white/10"
className="border border-slate-700"

// 替换后
style={{ borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))' }}
style={{ borderColor: 'var(--bg-overlay, rgba(148, 163, 184, 1))' }}
```

**悬停效果迁移**:
```tsx
// 替换前
className="hover:bg-white/20 hover:text-white"

// 替换后
onMouseEnter={(e) => {
  e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
  e.currentTarget.style.color = 'var(--text-primary)';
}}
onMouseLeave={(e) => {
  e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
  e.currentTarget.style.color = 'var(--text-secondary)';
}}
```

**渐变背景迁移**:
```tsx
// 替换前
className="bg-gradient-to-b from-black/80 to-transparent"

// 替换后
style={{
  background: 'linear-gradient(to bottom, var(--bg-overlay, rgba(0, 0, 0, 0.8)), transparent)',
}}
```

#### 移动端特殊处理

移动端组件应使用移动端专用变量：
- `--tabbar-bg`: 底部导航栏背景
- `--tabbar-icon-color`: 底部导航栏图标颜色
- `--tabbar-icon-active`: 底部导航栏激活图标颜色
- `--bg-cloud-pattern`: 云纹背景
- `--bg-starry`: 星空背景
- `--card-bg`: 卡片背景
- `--card-shadow`: 卡片阴影
- `--card-radius`: 卡片圆角

### 特殊情况处理

#### 1. 语义色保持
- 错误、警告、成功等语义色可以保持原色，或使用语义色变量
- 使用 `var(--color-error)`, `var(--color-warning)`, `var(--color-success)` 等

#### 2. 动态颜色
- 角色颜色（`character.colorAccent`）等动态颜色保持原样
- 但文字颜色应使用主题变量，确保对比度

#### 3. 渐变按钮
- 使用角色的动态颜色时，文字颜色应使用主题变量
- 确保在不同主题下都有良好的对比度

#### 4. 图片和背景
- 背景图片保持不变
- 但遮罩层和覆盖层应使用主题变量

## 实施计划

### 阶段 1: 高优先级组件（预计 2-3 天）
1. ChatWindow 主容器
2. 主要模态框（6个）
3. 移动端主要页面（6个）

### 阶段 2: 中优先级组件（预计 5-7 天）
1. HeartConnect 相关（11个）
2. QuickConnect 相关（10个）
3. Portal 相关（4个）
4. Character 相关（8个）
5. Scenario 相关（5个）
6. Scene Wizard 相关（5个）
7. Plugin 相关（5个）
8. Mailbox 相关（6个）

### 阶段 3: 低优先级组件（预计 3-5 天）
1. 用户资料和编辑器（3个）
2. 其他模态框（12个）
3. 交互和卡片组件（6个）
4. 成长和情感系统组件（10个）
5. 其他辅助组件（10个）
6. 移动端模态框和辅助组件（约40个）

### 阶段 4: 验证和优化（预计 1-2 天）
1. 全面测试
2. 代码审查
3. 文档更新
4. 性能优化

## 质量保证

### 测试策略
1. **单元测试**: 每个组件迁移后立即测试
2. **集成测试**: 每个阶段完成后进行集成测试
3. **视觉测试**: 在不同主题下进行视觉对比
4. **性能测试**: 测试主题切换性能

### 代码审查要点
1. 是否所有硬编码颜色都已替换
2. 是否使用统一的 CSS 变量命名
3. 是否遵循迁移模式
4. 是否有性能问题
5. 是否保持向后兼容

### 验收标准
1. 所有组件在不同主题下正确显示
2. 主题切换即时生效
3. 无 linter 错误
4. 颜色对比度符合 WCAG AA 标准
5. 性能无明显下降

## 风险和缓解

### 风险 1: 迁移工作量大
- **缓解**: 分阶段进行，优先核心功能
- **缓解**: 使用统一的迁移模式，提高效率

### 风险 2: 遗漏某些组件
- **缓解**: 使用工具扫描硬编码颜色
- **缓解**: 每个阶段完成后进行全面检查

### 风险 3: 性能问题
- **缓解**: 使用 CSS 变量，确保性能
- **缓解**: 避免在主题切换时触发大量重渲染

### 风险 4: 视觉不一致
- **缓解**: 使用统一的 CSS 变量命名
- **缓解**: 参考已迁移组件的实现

## 参考资源

### 已迁移组件示例
- `main/frontend/components/chat/HeaderBar.tsx`
- `main/frontend/components/chat/MessageBubble.tsx`
- `main/frontend/components/ConnectionSpace.tsx`
- `main/frontend/components/screens/SharedChatWindow.tsx`

### 迁移指南
- `main/frontend/docs/THEME_MIGRATION_GUIDE.md`
- `openspec/changes/add-theme-skin-management-system/CHAT_COMPONENTS_MIGRATION_COMPLETE.md`

### CSS 变量定义
- `main/frontend/src/tokens.css`
- `main/frontend/src/themes/tech.ts`
- `main/frontend/src/themes/serene-horizon.ts`
