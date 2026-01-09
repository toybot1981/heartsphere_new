# Mentis GUI 自动化功能实现说明

**日期**：2025-01-06  
**状态**：基础实现完成

---

## 一、实现内容

### 1. GUI 自动化执行器接口

创建了 `GuiAutomationExecutor` 接口，定义了 GUI 自动化的核心操作：
- `performAction()` - 执行 GUI 操作
- `captureScreenshot()` - 获取屏幕截图
- `findElement()` - 查找页面元素

### 2. Selenium 实现

实现了 `SeleniumGuiAutomationExecutor`，基于 Selenium WebDriver 提供以下功能：

#### 支持的操作类型
- **CLICK** - 点击元素
- **TYPE** - 输入文本
- **SCROLL** - 滚动页面
- **SCREENSHOT** - 截图
- **NAVIGATE** - 导航到 URL
- **WAIT** - 等待元素或时间

#### 元素选择器支持
- CSS 选择器：`css:div.button`
- XPath：`xpath://button[@id='submit']`
- ID：`id:username`
- Name：`name:email`
- Class：`class:btn-primary`
- Link Text：`link:登录`
- 默认 CSS 选择器

#### 功能特性
- 多会话支持（每个会话独立的 WebDriver 实例）
- 自动截图（每次操作后自动截图）
- 元素定位和查找
- 异常处理和错误信息

### 3. Playwright 实现（可选）

创建了 `PlaywrightGuiAutomationExecutor` 作为 Selenium 的替代方案，但目前需要添加依赖才能使用。

### 4. 集成到 Computer-Use 执行器

在 `ComputerUseExecutorImpl` 中集成了 `GuiAutomationExecutor`，使其可以通过统一的接口调用。

---

## 二、配置文件

在 `application.yml` 中添加了 GUI 相关配置：

```yaml
mentis:
  gui:
    browser: chrome  # chrome, firefox
    headless: true   # 是否使用无头模式
    timeout: 30      # GUI操作超时时间（秒）
```

---

## 三、依赖添加

在 `pom.xml` 中添加了 Selenium 相关依赖：

```xml
<!-- Selenium for GUI Automation -->
<dependency>
    <groupId>org.seleniumhq.selenium</groupId>
    <artifactId>selenium-java</artifactId>
    <version>4.15.0</version>
</dependency>
<dependency>
    <groupId>org.seleniumhq.selenium</groupId>
    <artifactId>selenium-chrome-driver</artifactId>
    <version>4.15.0</version>
</dependency>
<dependency>
    <groupId>org.seleniumhq.selenium</groupId>
    <artifactId>selenium-firefox-driver</artifactId>
    <version>4.15.0</version>
</dependency>
```

---

## 四、使用示例

### 1. 点击操作

```java
GuiAction action = new GuiAction();
action.setActionType("CLICK");
action.setTarget("css:button.submit-btn");
GuiActionResult result = guiAutomationExecutor.performAction(sessionId, action);
```

### 2. 输入操作

```java
GuiAction action = new GuiAction();
action.setActionType("TYPE");
action.setTarget("id:username");
action.setValue("testuser");
GuiActionResult result = guiAutomationExecutor.performAction(sessionId, action);
```

### 3. 截图操作

```java
String screenshot = guiAutomationExecutor.captureScreenshot(sessionId);
// 返回 base64 编码的图片: "data:image/png;base64,..."
```

### 4. 查找元素

```java
ElementInfo element = guiAutomationExecutor.findElement(sessionId, "css:.user-name");
if (element.isFound()) {
    System.out.println("元素文本: " + element.getText());
    System.out.println("元素位置: (" + element.getX() + ", " + element.getY() + ")");
}
```

---

## 五、架构设计

### 组件关系

```
ComputerUseExecutor
    └── GuiAutomationExecutor (接口)
            ├── SeleniumGuiAutomationExecutor (Selenium 实现)
            └── PlaywrightGuiAutomationExecutor (Playwright 实现，可选)
```

### 会话管理

每个会话维护独立的 WebDriver 实例，通过 `sessionDrivers` Map 管理：
- 首次操作时自动创建 WebDriver
- 会话结束时可以手动关闭
- 支持同时处理多个会话

---

## 六、待完成功能

### 1. Playwright 完整实现
- 添加 Playwright Java 依赖
- 实现所有操作方法
- 测试验证

### 2. OCR 功能（可选）
- 集成 Tesseract 或其他 OCR 库
- 从截图中提取文本
- 支持多语言识别

### 3. 元素识别增强
- 基于图像的元素定位
- 基于 AI 的智能元素识别
- 元素等待策略优化

### 4. 视频录制
- 录制 GUI 操作过程
- 生成操作视频回放

### 5. 移动端支持
- 支持移动端浏览器自动化
- 触摸操作支持

---

## 七、注意事项

### 1. 浏览器驱动

使用 Chrome 或 Firefox 需要确保：
- ChromeDriver 已安装或在 PATH 中
- GeckoDriver 已安装或在 PATH 中
- 或者使用 WebDriverManager 自动管理驱动

### 2. 无头模式

生产环境建议使用无头模式（`headless: true`），可以：
- 减少资源消耗
- 提高执行速度
- 避免显示窗口

### 3. 会话清理

建议实现会话清理机制：
- 定期清理长时间未使用的 WebDriver
- 会话结束时自动关闭 WebDriver
- 应用关闭时清理所有资源

### 4. 并发安全

当前实现使用 `ConcurrentHashMap` 保证线程安全，但需要注意：
- WebDriver 不是线程安全的
- 同一会话的操作应在同一线程中执行
- 避免并发操作同一 WebDriver 实例

---

## 八、测试建议

1. **单元测试**
   - 测试各种操作类型
   - 测试元素选择器解析
   - 测试异常处理

2. **集成测试**
   - 测试完整的 GUI 自动化流程
   - 测试多会话并发
   - 测试资源清理

3. **性能测试**
   - 测试截图性能
   - 测试操作响应时间
   - 测试内存占用

---

## 九、总结

GUI 自动化功能的基础实现已完成，支持基本的浏览器自动化操作。后续可以：
1. 完善 Playwright 实现作为替代方案
2. 添加 OCR 功能增强元素识别
3. 优化性能和资源管理
4. 添加更多高级功能

---

**实现时间**：2025-01-06
