package com.heartsphere.mentis.executor.computeruse.impl;

import com.heartsphere.shared.exception.BusinessException;
import com.heartsphere.mentis.executor.ComputerUseExecutor;
import com.heartsphere.mentis.executor.computeruse.GuiAutomationExecutor;
import com.heartsphere.mentis.service.MentisVmService;
import lombok.extern.slf4j.Slf4j;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 基于 Selenium 的 GUI 自动化执行器实现
 * 仅在 prod profile 中启用（需要 Selenium 依赖）
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Lazy
@Component
@Profile("prod")
@ConditionalOnProperty(name = "mentis.gui.provider", havingValue = "selenium", matchIfMissing = false)
public class SeleniumGuiAutomationExecutor implements GuiAutomationExecutor {

    @Value("${mentis.gui.browser:chrome}")
    private String browserType; // chrome, firefox

    @Value("${mentis.gui.headless:true}")
    private boolean headless;

    @Value("${mentis.gui.timeout:30}")
    private int timeoutSeconds;

    // 会话到 WebDriver 的映射
    private final Map<String, WebDriver> sessionDrivers = new ConcurrentHashMap<>();

    /**
     * 获取或创建 WebDriver 实例
     */
    private WebDriver getOrCreateDriver(String sessionId) {
        return sessionDrivers.computeIfAbsent(sessionId, k -> {
            log.info("为会话创建 WebDriver: sessionId={}, browser={}", sessionId, browserType);
            WebDriver driver;
            
            switch (browserType.toLowerCase()) {
                case "chrome":
                    ChromeOptions chromeOptions = new ChromeOptions();
                    if (headless) {
                        chromeOptions.addArguments("--headless");
                    }
                    chromeOptions.addArguments("--no-sandbox");
                    chromeOptions.addArguments("--disable-dev-shm-usage");
                    chromeOptions.addArguments("--disable-gpu");
                    chromeOptions.addArguments("--window-size=1920,1080");
                    driver = new ChromeDriver(chromeOptions);
                    break;
                case "firefox":
                    FirefoxOptions firefoxOptions = new FirefoxOptions();
                    if (headless) {
                        firefoxOptions.addArguments("--headless");
                    }
                    driver = new FirefoxDriver(firefoxOptions);
                    break;
                default:
                    throw new BusinessException("不支持的浏览器类型: " + browserType);
            }
            
            driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(timeoutSeconds));
            driver.manage().window().maximize();
            
            return driver;
        });
    }

    @Override
    public ComputerUseExecutor.GuiActionResult performAction(String sessionId, ComputerUseExecutor.GuiAction action) {
        log.info("执行GUI操作: sessionId={}, actionType={}, target={}", 
                sessionId, action.getActionType(), action.getTarget());
        
        ComputerUseExecutor.GuiActionResult result = new ComputerUseExecutor.GuiActionResult();
        
        try {
            WebDriver driver = getOrCreateDriver(sessionId);
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
            Actions actions = new Actions(driver);
            
            switch (action.getActionType().toUpperCase()) {
                case "CLICK":
                    performClick(driver, wait, actions, action.getTarget());
                    result.setSuccess(true);
                    result.setMessage("点击操作成功: " + action.getTarget());
                    break;
                    
                case "TYPE":
                    performType(driver, wait, actions, action.getTarget(), action.getValue());
                    result.setSuccess(true);
                    result.setMessage("输入操作成功: " + action.getTarget());
                    break;
                    
                case "SCROLL":
                    performScroll(driver, actions, action.getTarget());
                    result.setSuccess(true);
                    result.setMessage("滚动操作成功");
                    break;
                    
                case "SCREENSHOT":
                    String screenshot = captureScreenshot(sessionId);
                    result.setSuccess(true);
                    result.setScreenshot(screenshot);
                    result.setMessage("截图成功");
                    break;
                    
                case "NAVIGATE":
                    performNavigate(driver, action.getTarget());
                    result.setSuccess(true);
                    result.setMessage("导航成功: " + action.getTarget());
                    break;
                    
                case "WAIT":
                    performWait(driver, wait, action.getTarget());
                    result.setSuccess(true);
                    result.setMessage("等待完成: " + action.getTarget());
                    break;
                    
                default:
                    result.setSuccess(false);
                    result.setMessage("不支持的操作类型: " + action.getActionType());
                    return result;
            }
            
            // 操作后自动截图
            String screenshot = captureScreenshot(sessionId);
            result.setScreenshot(screenshot);
            
        } catch (NoSuchElementException e) {
            log.error("元素未找到: sessionId={}, target={}", sessionId, action.getTarget(), e);
            result.setSuccess(false);
            result.setMessage("元素未找到: " + action.getTarget());
        } catch (TimeoutException e) {
            log.error("操作超时: sessionId={}, target={}", sessionId, action.getTarget(), e);
            result.setSuccess(false);
            result.setMessage("操作超时: " + e.getMessage());
        } catch (Exception e) {
            log.error("GUI操作失败: sessionId={}, actionType={}", sessionId, action.getActionType(), e);
            result.setSuccess(false);
            result.setMessage("操作失败: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * 执行点击操作
     */
    private void performClick(WebDriver driver, WebDriverWait wait, Actions actions, String target) {
        WebElement element = findElement(driver, wait, target);
        actions.moveToElement(element).click().perform();
    }

    /**
     * 执行输入操作
     */
    private void performType(WebDriver driver, WebDriverWait wait, Actions actions, String target, String value) {
        WebElement element = findElement(driver, wait, target);
        element.clear();
        if (value != null && !value.isEmpty()) {
            element.sendKeys(value);
        }
    }

    /**
     * 执行滚动操作
     */
    private void performScroll(WebDriver driver, Actions actions, String target) {
        if ("UP".equalsIgnoreCase(target) || "TOP".equalsIgnoreCase(target)) {
            ((JavascriptExecutor) driver).executeScript("window.scrollTo(0, 0);");
        } else if ("DOWN".equalsIgnoreCase(target) || "BOTTOM".equalsIgnoreCase(target)) {
            ((JavascriptExecutor) driver).executeScript("window.scrollTo(0, document.body.scrollHeight);");
        } else {
            // 滚动到指定元素
            WebElement element = driver.findElement(By.cssSelector(target));
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", element);
        }
    }

    /**
     * 执行导航操作
     */
    private void performNavigate(WebDriver driver, String url) {
        driver.navigate().to(url);
    }

    /**
     * 执行等待操作
     */
    private void performWait(WebDriver driver, WebDriverWait wait, String target) {
        if (target.startsWith("css:") || target.startsWith("xpath:")) {
            // 等待元素出现
            String selector = target.substring(target.indexOf(':') + 1);
            By by = target.startsWith("css:") ? By.cssSelector(selector) : By.xpath(selector);
            wait.until(org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated(by));
        } else {
            // 等待指定时间（毫秒）
            try {
                long milliseconds = Long.parseLong(target);
                Thread.sleep(milliseconds);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } catch (NumberFormatException e) {
                throw new BusinessException("无效的等待时间: " + target);
            }
        }
    }

    /**
     * 查找元素
     */
    private WebElement findElement(WebDriver driver, WebDriverWait wait, String selector) {
        By by = parseSelector(selector);
        return wait.until(org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated(by));
    }

    /**
     * 解析选择器
     */
    private By parseSelector(String selector) {
        if (selector.startsWith("css:")) {
            return By.cssSelector(selector.substring(4));
        } else if (selector.startsWith("xpath:")) {
            return By.xpath(selector.substring(6));
        } else if (selector.startsWith("id:")) {
            return By.id(selector.substring(3));
        } else if (selector.startsWith("name:")) {
            return By.name(selector.substring(5));
        } else if (selector.startsWith("class:")) {
            return By.className(selector.substring(6));
        } else if (selector.startsWith("link:")) {
            return By.linkText(selector.substring(5));
        } else {
            // 默认使用 CSS 选择器
            return By.cssSelector(selector);
        }
    }

    @Override
    public String captureScreenshot(String sessionId) {
        log.debug("捕获屏幕截图: sessionId={}", sessionId);
        
        try {
            WebDriver driver = getOrCreateDriver(sessionId);
            TakesScreenshot screenshot = (TakesScreenshot) driver;
            byte[] screenshotBytes = screenshot.getScreenshotAs(OutputType.BYTES);
            
            // 转换为 base64
            String base64Screenshot = Base64.getEncoder().encodeToString(screenshotBytes);
            return "data:image/png;base64," + base64Screenshot;
            
        } catch (Exception e) {
            log.error("截图失败: sessionId={}", sessionId, e);
            throw new BusinessException("截图失败: " + e.getMessage());
        }
    }

    @Override
    public ElementInfo findElement(String sessionId, String selector) {
        log.debug("查找元素: sessionId={}, selector={}", sessionId, selector);
        
        ElementInfo info = new ElementInfo();
        
        try {
            WebDriver driver = getOrCreateDriver(sessionId);
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
            By by = parseSelector(selector);
            WebElement element = wait.until(org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated(by));
            
            info.setFound(true);
            info.setTagName(element.getTagName());
            info.setText(element.getText());
            
            org.openqa.selenium.Point location = element.getLocation();
            org.openqa.selenium.Dimension size = element.getSize();
            info.setX(location.getX());
            info.setY(location.getY());
            info.setWidth(size.getWidth());
            info.setHeight(size.getHeight());
            
            // 元素截图
            try {
                byte[] screenshotBytes = element.getScreenshotAs(OutputType.BYTES);
                String base64Screenshot = Base64.getEncoder().encodeToString(screenshotBytes);
                info.setScreenshot("data:image/png;base64," + base64Screenshot);
            } catch (Exception e) {
                log.warn("元素截图失败: {}", e.getMessage());
            }
            
        } catch (NoSuchElementException | TimeoutException e) {
            log.debug("元素未找到: selector={}", selector);
            info.setFound(false);
        } catch (Exception e) {
            log.error("查找元素失败: sessionId={}, selector={}", sessionId, selector, e);
            info.setFound(false);
        }
        
        return info;
    }

    /**
     * 关闭指定会话的 WebDriver
     */
    public void closeDriver(String sessionId) {
        WebDriver driver = sessionDrivers.remove(sessionId);
        if (driver != null) {
            try {
                driver.quit();
                log.info("关闭 WebDriver: sessionId={}", sessionId);
            } catch (Exception e) {
                log.error("关闭 WebDriver 失败: sessionId={}", sessionId, e);
            }
        }
    }

    /**
     * 关闭所有 WebDriver
     */
    public void closeAllDrivers() {
        sessionDrivers.forEach((sessionId, driver) -> {
            try {
                driver.quit();
            } catch (Exception e) {
                log.error("关闭 WebDriver 失败: sessionId={}", sessionId, e);
            }
        });
        sessionDrivers.clear();
    }
}
