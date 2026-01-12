# 公司官网图片资源说明

## 目录结构

```
public/company/images/
├── philosophy/          # 正心理念相关图片
│   ├── eight-steps-diagram.png    # 八条目关系图
│   └── zhengxin-concept.png       # 正心理念图解
├── product/            # 产品相关图片
│   ├── screenshot1.png            # 产品截图1
│   ├── screenshot2.png            # 产品截图2
│   ├── screenshot3.png            # 产品截图3
│   └── feature-demo.png           # 功能演示图
├── company/            # 公司相关图片
│   ├── logo.png                   # 公司Logo
│   ├── logo-white.png             # 白色版本Logo
│   └── og-image.jpg               # Open Graph图片（1200x630）
└── services/           # AI服务相关图片
    ├── ai-dialogue-icon.png       # AI对话图标
    ├── nlp-icon.png               # 自然语言处理图标
    └── cv-icon.png                # 计算机视觉图标
```

## 图片规格要求

### Logo
- **格式**: PNG（透明背景）
- **尺寸**: 
  - 主Logo: 200x60px 或更高分辨率
  - 图标版本: 64x64px
- **用途**: 导航栏、页脚、社交媒体

### 产品截图
- **格式**: PNG 或 JPG
- **尺寸**: 建议 1920x1080px 或更高
- **用途**: 产品展示页面
- **要求**: 清晰展示产品界面和功能

### Open Graph图片
- **格式**: JPG 或 PNG
- **尺寸**: 1200x630px（推荐）
- **用途**: 社交媒体分享预览
- **要求**: 包含公司名称和核心信息

### 理念图表
- **格式**: PNG 或 SVG
- **尺寸**: 根据内容调整
- **用途**: 关于我们页面
- **要求**: 清晰展示《大学》八条目关系

## 图片优化建议

1. **压缩**: 使用工具压缩图片，减少文件大小
2. **格式**: 
   - 照片使用 JPG
   - 图标和Logo使用 PNG
   - 简单图形考虑 SVG
3. **响应式**: 准备不同尺寸的图片用于响应式设计
4. **WebP**: 考虑使用 WebP 格式以获得更好的压缩比

## 占位符说明

当前代码中使用占位符，需要替换为实际图片：
- `ProductScreenshots.tsx`: 产品截图占位符
- `SEOHead.tsx`: Open Graph图片路径
- 其他组件中的图片引用

## 添加图片步骤

1. 将图片文件放置到对应目录
2. 更新组件中的图片路径
3. 测试图片加载和显示
4. 优化图片大小和格式
