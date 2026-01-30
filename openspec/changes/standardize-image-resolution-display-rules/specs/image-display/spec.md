## ADDED Requirements

### Requirement: 统一的图片展示场景定义
系统 SHALL 定义标准化的图片展示场景类型，所有项目（admin、main、edu等）必须使用相同的场景定义。

#### Scenario: 标准场景类型
- **WHEN** 开发者需要展示图片
- **THEN** 系统提供以下标准场景类型：
  - `thumbnail`: 缩略图（列表、卡片等小尺寸展示）
  - `list`: 列表项（列表中的图片项）
  - `detail`: 详情页/对话框（中等尺寸展示）
  - `background`: 移动端背景（移动端全屏背景）
  - `chatBackground`: ChatWindow背景（PC端聊天窗口背景）
  - `original`: 原图（特殊需求，不推荐）

#### Scenario: 场景类型使用规范
- **WHEN** 开发者选择展示场景
- **THEN** 必须使用标准场景类型，不得自定义场景名称
- **AND** 场景类型通过 `ImageDisplayPurpose` 类型定义
- **AND** 所有项目使用相同的类型定义

### Requirement: 场景到分辨率映射规则
系统 SHALL 根据展示场景自动选择合适的分辨率版本，遵循固定的映射规则。

#### Scenario: 缩略图/列表场景使用小缩略图
- **WHEN** 图片在缩略图或列表场景中展示（`purpose='thumbnail'` 或 `purpose='list'`）
- **THEN** 系统自动选择 200×200 小缩略图版本
- **AND** 如果小缩略图不存在，回退到原图

#### Scenario: 详情页/对话框场景使用中等质量图
- **WHEN** 图片在详情页或对话框中展示（`purpose='detail'`）
- **THEN** 系统自动选择 800×600 中等质量图版本
- **AND** 如果中等质量图不存在，按优先级回退：小缩略图 → 原图

#### Scenario: 移动端背景场景使用中等质量图
- **WHEN** 图片在移动端作为背景展示（`purpose='background'` 且 `isMobile=true`）
- **THEN** 系统自动选择 800×600 中等质量图版本
- **AND** 如果中等质量图不存在，按优先级回退：小缩略图 → 原图

#### Scenario: PC ChatWindow背景场景使用高质量图
- **WHEN** 图片在PC端ChatWindow中作为背景展示（`purpose='chatBackground'` 且 `isMobile=false`）
- **THEN** 系统自动选择 1920×1080 高质量图版本
- **AND** 如果高质量图不存在，按优先级回退：中等质量图 → 小缩略图 → 原图

#### Scenario: 移动端ChatWindow背景场景使用中等质量图
- **WHEN** 图片在移动端ChatWindow中作为背景展示（`purpose='chatBackground'` 且 `isMobile=true`）
- **THEN** 系统自动选择 800×600 中等质量图版本
- **AND** 如果中等质量图不存在，按优先级回退：小缩略图 → 原图

#### Scenario: 特殊需求场景使用原图
- **WHEN** 有特殊需求需要使用原图（`purpose='original'`）
- **THEN** 系统使用原图版本
- **AND** 此场景不推荐使用，仅在特殊需求时使用

### Requirement: 统一的工具函数实现
系统 SHALL 提供统一的工具函数 `selectImageResolution()`，所有项目必须使用相同的实现。

#### Scenario: 工具函数接口规范
- **WHEN** 开发者需要选择图片分辨率
- **THEN** 使用 `selectImageResolution(imageUrl, variants, purpose, isMobile)` 函数
- **AND** 函数参数：
  - `imageUrl`: 原图URL（必需）
  - `variants`: 多分辨率版本URL对象（可选）
  - `purpose`: 展示场景类型（可选，默认 `'detail'`）
  - `isMobile`: 是否为移动端（可选，默认 `false`）
- **AND** 函数返回：选择的分辨率版本URL

#### Scenario: 工具函数行为规范
- **WHEN** 调用 `selectImageResolution()` 函数
- **THEN** 函数根据 `purpose` 和 `isMobile` 参数选择合适的分辨率
- **AND** 如果目标分辨率不存在，按回退策略选择降级分辨率
- **AND** 如果所有分辨率版本都不存在，返回原图URL

### Requirement: 统一的组件实现
系统 SHALL 在所有项目的 `LazyImage` 组件中集成分辨率选择逻辑，使用统一的规则。

#### Scenario: LazyImage组件接口规范
- **WHEN** 使用 `LazyImage` 组件展示图片
- **THEN** 组件必须支持以下属性：
  - `src`: 原图URL（必需）
  - `variants`: 多分辨率版本URL对象（可选）
  - `purpose`: 展示场景类型（可选，默认 `'detail'`）
  - `isMobile`: 是否为移动端（可选，默认自动检测）
- **AND** 组件内部自动调用 `selectImageResolution()` 选择合适的分辨率

#### Scenario: 组件自动选择分辨率
- **WHEN** `LazyImage` 组件渲染
- **THEN** 组件根据 `purpose` 和 `isMobile` 属性自动选择合适的分辨率版本
- **AND** 组件使用选择的分辨率版本进行展示
- **AND** 如果目标分辨率加载失败，自动回退到原图

### Requirement: 跨项目一致性
系统 SHALL 确保所有项目（admin、main、edu等）使用相同的图片分辨率展示规则。

#### Scenario: 所有项目使用统一规则
- **WHEN** 在 admin、main、edu 等任何项目中展示图片
- **THEN** 必须使用相同的场景类型定义
- **AND** 必须使用相同的映射规则
- **AND** 必须使用相同的工具函数或组件

#### Scenario: 规则统一维护
- **WHEN** 需要修改图片分辨率展示规则
- **THEN** 修改统一工具函数或组件
- **AND** 所有项目自动应用新规则（如果使用共享实现）
- **OR** 所有项目同步更新（如果使用复制实现）

## MODIFIED Requirements

### Requirement: 图片展示组件分辨率选择
图片展示组件（如 `LazyImage`）SHALL 根据展示场景自动选择合适的分辨率版本，遵循统一的映射规则和回退策略。

#### Scenario: 组件自动选择分辨率（更新）
- **WHEN** 图片展示组件渲染
- **THEN** 组件根据 `purpose` 属性自动选择合适的分辨率版本：
  - `thumbnail` / `list` → 200×200 小缩略图
  - `detail` → 800×600 中等质量图
  - `background` → 800×600 中等质量图（移动端）
  - `chatBackground` → 1920×1080 高质量图（PC）或 800×600 中等质量图（移动端）
  - `original` → 原图
- **AND** 如果目标分辨率不存在，按优先级回退：
  - 小缩略图场景：回退到原图
  - 中等质量场景：回退到小缩略图 → 原图
  - 高质量场景：回退到中等质量图 → 小缩略图 → 原图
- **AND** 组件自动检测设备类型（PC/移动端），或使用 `isMobile` 参数
