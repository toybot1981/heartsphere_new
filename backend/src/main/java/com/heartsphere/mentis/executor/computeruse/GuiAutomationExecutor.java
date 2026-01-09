package com.heartsphere.mentis.executor.computeruse;

import com.heartsphere.mentis.executor.ComputerUseExecutor;

/**
 * GUI 自动化执行器接口
 * 负责在虚拟机中执行 GUI 自动化操作，包括屏幕截图、点击、输入等
 *
 * @author HeartSphere
 * @version 1.0
 */
public interface GuiAutomationExecutor {

    /**
     * 执行 GUI 操作
     *
     * @param sessionId 会话ID
     * @param action GUI 操作
     * @return GUI 操作结果
     */
    ComputerUseExecutor.GuiActionResult performAction(String sessionId, ComputerUseExecutor.GuiAction action);

    /**
     * 获取屏幕截图
     *
     * @param sessionId 会话ID
     * @return 截图URL或base64编码的图片
     */
    String captureScreenshot(String sessionId);

    /**
     * 查找页面元素
     *
     * @param sessionId 会话ID
     * @param selector 元素选择器（CSS选择器、XPath等）
     * @return 元素信息（位置、文本等）
     */
    ElementInfo findElement(String sessionId, String selector);

    /**
     * 页面元素信息
     */
    class ElementInfo {
        private boolean found;
        private String tagName;
        private String text;
        private int x;
        private int y;
        private int width;
        private int height;
        private String screenshot; // 元素截图

        // Getters and Setters
        public boolean isFound() { return found; }
        public void setFound(boolean found) { this.found = found; }
        public String getTagName() { return tagName; }
        public void setTagName(String tagName) { this.tagName = tagName; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public int getX() { return x; }
        public void setX(int x) { this.x = x; }
        public int getY() { return y; }
        public void setY(int y) { this.y = y; }
        public int getWidth() { return width; }
        public void setWidth(int width) { this.width = width; }
        public int getHeight() { return height; }
        public void setHeight(int height) { this.height = height; }
        public String getScreenshot() { return screenshot; }
        public void setScreenshot(String screenshot) { this.screenshot = screenshot; }
    }
}
