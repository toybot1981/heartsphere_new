# 现实世界日记与记忆提取自动化测试详细计划

## 测试范围

### 功能模块
1. **现实世界日记功能**（RealWorldScreen）
   - 进入现实世界
   - 日记列表展示
   - 新建日记
   - 编辑日记
   - 删除日记
   - 写今日功能
   - 日记筛选和搜索

2. **记忆提取功能**
   - 从日记中自动提取记忆
   - 查看日记记忆（JournalMemoryModal）
   - 记忆展示和筛选

## 测试用例设计

### 测试套件 1：进入现实世界

#### 用例 1.1：从入口点进入现实世界
**前置条件**：
- 用户已登录（或使用游客模式）
- Main 前端运行在 `http://localhost:5173`
- Main 后端运行在 `http://localhost:8081`

**测试步骤**：
1. `navigate to http://localhost:5173`
2. `wait for page load`
3. `click text=进入现实` 或 `click text=现实世界`
4. `wait for 2 seconds`
5. `verify text=写今日` 或 `verify text=新思维`

**预期结果**：
- 成功进入现实世界界面
- 显示日记相关功能入口（写今日、新思维等）

### 测试套件 2：日记 CRUD 操作

#### 用例 2.1：新建日记
**测试步骤**：
1. `navigate to http://localhost:5173`
2. `click text=进入现实`
3. `wait for text=写今日`
4. `click text=新思维` 或 `click button[aria-label*="新思维"]`
5. `wait for input[placeholder*="标题"]` 或 `wait for textarea`
6. `type "测试日记标题" in input[placeholder*="标题"]`
7. `type "这是测试日记内容，用于验证记忆提取功能。" in textarea`
8. `click button:has-text("保存")` 或 `click text=保存`
9. `wait for 3 seconds` （等待保存和记忆提取）
10. `verify text=测试日记标题`

**预期结果**：
- 日记创建成功
- 日记出现在列表中
- 记忆提取功能被触发（异步）

#### 用例 2.2：编辑日记
**测试步骤**：
1. `navigate to http://localhost:5173`
2. `click text=进入现实`
3. `wait for text=写今日`
4. `click text=测试日记标题` （点击已存在的日记）
5. `wait for textarea` 或 `wait for input[value*="测试日记标题"]`
6. `type " - 已编辑" in input[value*="测试日记标题"]` 或使用 `fill` 命令
7. `click button:has-text("保存")`
8. `wait for 2 seconds`
9. `verify text=测试日记标题 - 已编辑`

**预期结果**：
- 日记编辑成功
- 列表中显示更新后的标题
- 记忆提取功能被触发（异步）

#### 用例 2.3：删除日记
**测试步骤**：
1. `navigate to http://localhost:5173`
2. `click text=进入现实`
3. `wait for text=写今日`
4. `click text=测试日记标题 - 已编辑`
5. `wait for button:has-text("删除")`
6. `click button:has-text("删除")`
7. `wait for dialog` 或 `wait for text=确定`
8. `click text=确定` 或 `click button:has-text("确定")`
9. `wait for 2 seconds`
10. `verify text=测试日记标题 - 已编辑 not visible`

**预期结果**：
- 日记删除成功
- 日记从列表中移除

### 测试套件 3：写今日功能

#### 用例 3.1：使用写今日快速创建日记
**测试步骤**：
1. `navigate to http://localhost:5173`
2. `click text=进入现实`
3. `wait for text=写今日`
4. `click text=写今日` 或 `click button:has-text("写今日")`
5. `wait for textarea`
6. `type "今天是一个测试日，用于验证写今日功能。" in textarea`
7. `click button:has-text("保存")`
8. `wait for 3 seconds`
9. `verify text=今日` （标题应为"今日"）
10. `verify text=今天是一个测试日`

**预期结果**：
- 使用"写今日"创建日记成功
- 标题自动设置为"今日"
- 内容正确保存
- 记忆提取功能被触发

### 测试套件 4：记忆提取功能

#### 用例 4.1：打开日记记忆模态框
**测试步骤**：
1. `navigate to http://localhost:5173`
2. `click text=进入现实`
3. `wait for text=写今日`
4. `click text=查看从日记中提取的记忆` 或 `click button[title*="查看从日记中提取的记忆"]`
5. `wait for 3 seconds` （等待模态框打开和记忆加载）
6. `verify text=日记记忆` 或 `verify text=从日记中提取的记忆`

**预期结果**：
- 记忆模态框成功打开
- 显示记忆相关界面

#### 用例 4.2：验证记忆展示
**测试步骤**：
1. （先执行用例 2.1 创建一篇包含个人信息的日记）
2. `navigate to http://localhost:5173`
3. `click text=进入现实`
4. `wait for text=写今日`
5. `click text=查看从日记中提取的记忆`
6. `wait for 5 seconds` （等待记忆提取和加载）
7. `verify text=个人信息` 或 `verify text=偏好` 或 `verify text=重要时刻` （根据记忆类型）

**预期结果**：
- 记忆模态框显示提取的记忆
- 记忆类型正确分类
- 记忆内容正确显示

#### 用例 4.3：验证记忆提取异步完成
**测试步骤**：
1. `navigate to http://localhost:5173`
2. `click text=进入现实`
3. `click text=新思维`
4. `type "我的名字是张三，我喜欢编程和阅读。" in textarea`
5. `click button:has-text("保存")`
6. `wait for 5 seconds` （等待记忆提取完成）
7. `click text=查看从日记中提取的记忆`
8. `wait for 3 seconds`
9. `verify text=张三` 或 `verify text=编程` 或 `verify text=阅读`

**预期结果**：
- 记忆提取异步完成
- 记忆内容正确提取和展示

### 测试套件 5：日记列表和筛选

#### 用例 5.1：查看日记列表
**测试步骤**：
1. `navigate to http://localhost:5173`
2. `click text=进入现实`
3. `wait for text=写今日`
4. `verify element count > 0` （至少有一篇日记，或验证列表容器存在）

**预期结果**：
- 日记列表正确显示
- 可以查看所有日记条目

#### 用例 5.2：搜索日记
**测试步骤**：
1. `navigate to http://localhost:5173`
2. `click text=进入现实`
3. `wait for input[placeholder*="搜索"]` 或 `wait for input[type="search"]`
4. `type "测试" in input[placeholder*="搜索"]`
5. `wait for 1 second`
6. `verify text=测试日记标题` （或验证搜索结果）

**预期结果**：
- 搜索功能正常工作
- 显示匹配的日记条目

## 测试计划 JSON 结构

### 基础结构
```json
{
  "metadata": {
    "created_at": "2026-01-28T00:00:00Z",
    "app_url": "http://localhost:5173",
    "test_scope": "现实世界日记与记忆提取功能自动化测试",
    "priority": "high",
    "prerequisites": [
      "Main 前端运行在 http://localhost:5173",
      "Main 后端运行在 http://localhost:8081",
      "测试账号：tongyexin/123456（或游客模式）",
      "Python 3.8+ 和 Playwright 已安装"
    ]
  },
  "requirements": [
    "用户可以进入现实世界界面",
    "用户可以创建、编辑、删除日记",
    "用户可以使用写今日功能",
    "系统可以从日记中提取记忆",
    "用户可以查看从日记中提取的记忆"
  ],
  "test_cases": [
    // 具体测试用例见下方
  ],
  "test_suites": [
    {
      "id": "suite_1",
      "name": "进入现实世界",
      "description": "测试进入现实世界界面的功能",
      "test_cases": ["case_1_1"]
    },
    {
      "id": "suite_2",
      "name": "日记 CRUD 操作",
      "description": "测试日记的创建、编辑、删除功能",
      "test_cases": ["case_2_1", "case_2_2", "case_2_3"]
    },
    {
      "id": "suite_3",
      "name": "写今日功能",
      "description": "测试写今日快速创建日记功能",
      "test_cases": ["case_3_1"]
    },
    {
      "id": "suite_4",
      "name": "记忆提取功能",
      "description": "测试从日记中提取记忆和查看记忆功能",
      "test_cases": ["case_4_1", "case_4_2", "case_4_3"]
    },
    {
      "id": "suite_5",
      "name": "日记列表和筛选",
      "description": "测试日记列表展示和搜索功能",
      "test_cases": ["case_5_1", "case_5_2"]
    }
  ]
}
```

## 选择器策略

### 中文 UI 选择器
- 使用 `text=` 选择器匹配中文文案
- 示例：`text=写今日`、`text=新思维`、`text=查看从日记中提取的记忆`
- 如果 `text=` 选择器不稳定，使用 `button:has-text("写今日")` 或 `[aria-label*="写今日"]`

### SPA 导航选择器
- 不依赖 URL 变化
- 使用特征文案验证页面状态：`verify text=写今日`、`verify text=新思维`
- 使用等待策略：`wait for text=写今日`、`wait for 2 seconds`

### 模态框选择器
- 等待模态框打开：`wait for text=日记记忆`、`wait for 3 seconds`
- 验证模态框内容：`verify text=从日记中提取的记忆`

## 注意事项

### 异步操作处理
1. **记忆提取是异步的**：
   - 保存日记后，需要等待 3-5 秒让记忆提取完成
   - 打开记忆模态框后，需要等待记忆加载完成

2. **SPA 状态变化**：
   - 不依赖 URL 变化
   - 使用特征文案或元素出现来验证状态

3. **模态框打开**：
   - 点击按钮后，等待模态框元素出现
   - 使用 `wait for` 确保模态框完全加载

### 测试数据管理
- 测试前清理测试数据（可选）
- 使用唯一的测试标题，便于识别和清理
- 测试后可以选择保留或清理测试数据

### 环境配置
- Main 前端：`http://localhost:5173`
- Main 后端：`http://localhost:8081`
- 测试账号：`tongyexin/123456`（或使用游客模式）
