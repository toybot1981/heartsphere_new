# 图片处理工具需求分析设计文档

## 1. 项目背景

### 1.1 问题描述
当前系统中角色图片和资源图片都比较大，导致：
- 图片加载速度慢，影响用户体验
- 存储空间占用大
- 带宽消耗高
- 移动端用户体验差

### 1.2 目标
构建一个专门的图片处理工具，提供图片裁剪和缩略图生成功能，优化图片存储和加载性能。

## 2. 功能需求

### 2.1 核心功能

#### 2.1.1 图片裁剪（Crop）
- **功能描述**：根据指定区域裁剪图片
- **输入参数**：
  - 原始图片路径或文件
  - 裁剪区域坐标（x, y, width, height）
  - 输出格式（可选，默认保持原格式）
- **输出**：裁剪后的图片文件
- **使用场景**：
  - 用户上传图片后，裁剪为合适的尺寸
  - 从大图中提取特定区域

#### 2.1.2 生成缩略图（Thumbnail）
- **功能描述**：生成指定尺寸的缩略图
- **输入参数**：
  - 原始图片路径或文件
  - 目标宽度（可选）
  - 目标高度（可选）
  - 是否保持宽高比（默认：是）
  - 缩放模式（默认：按比例缩放）
- **输出**：缩略图文件
- **使用场景**：
  - 列表页显示小图
  - 预览图
  - 移动端优化显示

### 2.2 辅助功能

#### 2.2.1 图片信息获取
- 获取图片尺寸（宽度、高度）
- 获取图片文件大小
- 获取图片格式（MIME类型）

#### 2.2.2 批量处理
- 批量生成缩略图
- 批量裁剪图片

#### 2.2.3 格式转换
- 支持常见图片格式：JPG、PNG、WEBP、GIF
- 格式自动转换（如需要）

### 2.3 质量与性能要求

#### 2.3.1 图片质量
- 缩略图压缩质量：可配置（默认：0.85，范围：0.0-1.0）
- 保持图片清晰度，避免明显失真
- 支持高质量缩放算法

#### 2.3.2 性能要求
- 单张图片处理时间：< 1秒（2MB以内图片）
- 支持异步处理（批量处理时）
- 内存占用优化

## 3. 技术方案

### 3.1 技术选型

#### 3.1.1 图片处理库
**选择：Thumbnailator**
- **优势**：
  - Java原生库，API简洁易用
  - 功能强大，支持缩放、裁剪、旋转、水印等
  - 性能优秀，底层使用Java 2D API
  - 维护活跃
  - 无额外系统依赖（如ImageMagick）
- **版本**：0.4.20（最新稳定版）

#### 3.1.2 架构设计
- **服务层**：`ImageProcessingService` - 图片处理核心服务
- **控制器层**：在 `ImageController` 中添加图片处理接口
- **集成**：与现有的 `ImageStorageService` 集成

### 3.2 设计模式

#### 3.2.1 服务层设计
```java
@Service
public class ImageProcessingService {
    // 生成缩略图
    BufferedImage generateThumbnail(BufferedImage source, int width, int height, boolean keepAspectRatio);
    
    // 裁剪图片
    BufferedImage cropImage(BufferedImage source, int x, int y, int width, int height);
    
    // 保存处理后的图片
    String saveProcessedImage(BufferedImage image, String category, String userId, String suffix);
}
```

#### 3.2.2 API设计

**生成缩略图接口**
```
POST /api/images/thumbnail
参数：
- url: 原始图片URL或相对路径
- width: 目标宽度（可选）
- height: 目标高度（可选）
- keepAspectRatio: 是否保持宽高比（默认：true）
- quality: 压缩质量（0.0-1.0，默认：0.85）
响应：
{
  "success": true,
  "url": "处理后的图片URL",
  "relativePath": "相对路径",
  "originalSize": 原始文件大小,
  "processedSize": 处理后文件大小,
  "width": 宽度,
  "height": 高度
}
```

**裁剪图片接口**
```
POST /api/images/crop
参数：
- url: 原始图片URL或相对路径
- x: 裁剪起始X坐标
- y: 裁剪起始Y坐标
- width: 裁剪宽度
- height: 裁剪高度
响应：
{
  "success": true,
  "url": "处理后的图片URL",
  "relativePath": "相对路径",
  "originalSize": 原始文件大小,
  "processedSize": 处理后文件大小,
  "width": 宽度,
  "height": 高度
}
```

### 3.3 存储策略

#### 3.3.1 文件命名规则
- 缩略图：`{原文件名}_thumb_{width}x{height}.{扩展名}`
  - 示例：`uuid_thumb_200x200.png`
- 裁剪图：`{原文件名}_crop_{x}_{y}_{width}_{height}.{扩展名}`
  - 示例：`uuid_crop_100_100_300_300.png`

#### 3.3.2 目录结构
- 保持与原始图片相同的目录结构
- 缩略图和裁剪图存储在同一目录下
- 路径格式：`{userId}/{category}/{year}/{month}/{filename}` 或 `{category}/{year}/{month}/{filename}`

### 3.4 配置项设计

在 `application.yml` 中添加配置：

```yaml
app:
  image:
    processing:
      thumbnail:
        default-width: 200          # 默认缩略图宽度
        default-height: 200         # 默认缩略图高度
        default-quality: 0.85       # 默认压缩质量
        keep-aspect-ratio: true     # 默认保持宽高比
      crop:
        max-width: 5000             # 最大裁剪宽度
        max-height: 5000            # 最大裁剪高度
      supported-formats:            # 支持的图片格式
        - jpg
        - jpeg
        - png
        - webp
        - gif
```

## 4. 实现计划

### 4.1 开发阶段

#### 阶段1：需求分析设计（当前阶段）
- [x] 需求分析
- [x] 技术选型
- [x] 架构设计
- [x] API设计

#### 阶段2：功能开发
1. **添加依赖**
   - 在 `pom.xml` 中添加 Thumbnailator 依赖

2. **创建服务类**
   - 创建 `ImageProcessingService` 服务类
   - 实现缩略图生成功能
   - 实现图片裁剪功能
   - 实现图片信息获取功能

3. **集成到现有系统**
   - 在 `ImageController` 中添加处理接口
   - 更新配置文件

4. **异常处理**
   - 图片格式不支持异常
   - 参数验证异常
   - 文件不存在异常

#### 阶段3：自动化测试
1. **单元测试**
   - `ImageProcessingService` 单元测试
   - 测试缩略图生成
   - 测试图片裁剪
   - 测试边界情况

2. **集成测试**
   - API接口测试
   - 文件系统集成测试
   - 与现有服务集成测试

### 4.2 测试用例

#### 单元测试用例
1. 生成缩略图 - 正常情况
2. 生成缩略图 - 保持宽高比
3. 生成缩略图 - 不保持宽高比
4. 生成缩略图 - 只指定宽度
5. 生成缩略图 - 只指定高度
6. 裁剪图片 - 正常情况
7. 裁剪图片 - 边界情况
8. 图片格式转换
9. 异常处理 - 无效图片
10. 异常处理 - 参数超出范围

#### 集成测试用例
1. API接口 - 生成缩略图
2. API接口 - 裁剪图片
3. 文件系统集成 - 保存处理后的图片
4. 与 ImageStorageService 集成

## 5. 风险评估

### 5.1 技术风险
- **风险**：大图片处理可能占用大量内存
- **缓解**：使用流式处理，设置内存限制

### 5.2 性能风险
- **风险**：批量处理可能影响系统性能
- **缓解**：异步处理，限制并发数

### 5.3 兼容性风险
- **风险**：不同图片格式的兼容性问题
- **缓解**：充分测试各种格式，提供格式转换功能

## 6. 后续优化方向

1. **高级功能**
   - 图片旋转
   - 水印添加
   - 图片滤镜
   - 格式转换（WEBP支持）

2. **性能优化**
   - 异步处理
   - 缓存机制
   - 批量处理优化

3. **云存储支持**
   - OSS/S3集成
   - CDN集成

4. **自动化处理**
   - 上传时自动生成缩略图
   - 定时批量处理历史图片

## 7. 参考资料

- Thumbnailator官方文档：https://github.com/coobird/thumbnailator
- Java ImageIO API文档
- Spring Boot最佳实践
