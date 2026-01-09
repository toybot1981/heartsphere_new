# 图片处理工具使用说明

## 概述

图片处理工具提供了图片裁剪和缩略图生成功能，用于优化角色图片和资源图片的存储和加载性能。

## API接口使用

### 1. 生成缩略图

**接口地址**：`POST /api/images/thumbnail`

**请求头**：
```
Content-Type: application/json
```

**请求体**：
```json
{
  "url": "图片URL或相对路径",
  "width": 200,           // 可选，目标宽度（像素）
  "height": 200,          // 可选，目标高度（像素）
  "keepAspectRatio": true, // 可选，是否保持宽高比，默认true
  "quality": 0.85         // 可选，压缩质量(0.0-1.0)，默认0.85
}
```

**响应示例**：
```json
{
  "success": true,
  "url": "http://localhost:8081/api/images/test/2026/01/original_thumb_200x150.png",
  "relativePath": "test/2026/01/original_thumb_200x150.png",
  "originalSize": 102400,
  "processedSize": 15360,
  "width": 200,
  "height": 150,
  "message": "缩略图生成成功"
}
```

**使用示例**：

```bash
# 使用curl
curl -X POST http://localhost:8081/api/images/thumbnail \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "http://localhost:8081/api/images/character/2025/12/original.png",
    "width": 200,
    "height": 150,
    "keepAspectRatio": true,
    "quality": 0.85
  }'
```

**JavaScript/TypeScript示例**：

```typescript
// 生成缩略图
async function generateThumbnail(imageUrl: string, width: number, height: number) {
  const response = await fetch('/api/images/thumbnail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      url: imageUrl,
      width: width,
      height: height,
      keepAspectRatio: true,
      quality: 0.85
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('缩略图URL:', result.url);
    return result.url;
  } else {
    throw new Error(result.error);
  }
}

// 使用示例
const thumbnailUrl = await generateThumbnail(
  'http://localhost:8081/api/images/character/2025/12/original.png',
  200,
  150
);
```

### 2. 裁剪图片

**接口地址**：`POST /api/images/crop`

**请求头**：
```
Content-Type: application/json
```

**请求体**：
```json
{
  "url": "图片URL或相对路径",
  "x": 100,      // 必需，裁剪起始X坐标（像素）
  "y": 50,       // 必需，裁剪起始Y坐标（像素）
  "width": 200,  // 必需，裁剪宽度（像素）
  "height": 150  // 必需，裁剪高度（像素）
}
```

**响应示例**：
```json
{
  "success": true,
  "url": "http://localhost:8081/api/images/test/2026/01/original_crop_100_50_200_150.png",
  "relativePath": "test/2026/01/original_crop_100_50_200_150.png",
  "originalSize": 102400,
  "processedSize": 25600,
  "width": 200,
  "height": 150,
  "message": "图片裁剪成功"
}
```

**使用示例**：

```bash
# 使用curl
curl -X POST http://localhost:8081/api/images/crop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "http://localhost:8081/api/images/character/2025/12/original.png",
    "x": 100,
    "y": 50,
    "width": 200,
    "height": 150
  }'
```

**JavaScript/TypeScript示例**：

```typescript
// 裁剪图片
async function cropImage(imageUrl: string, x: number, y: number, width: number, height: number) {
  const response = await fetch('/api/images/crop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      url: imageUrl,
      x: x,
      y: y,
      width: width,
      height: height
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('裁剪后图片URL:', result.url);
    return result.url;
  } else {
    throw new Error(result.error);
  }
}

// 使用示例
const croppedUrl = await cropImage(
  'http://localhost:8081/api/images/character/2025/12/original.png',
  100,  // x坐标
  50,   // y坐标
  200,  // 宽度
  150   // 高度
);
```

## Java代码中使用

### 1. 注入服务

```java
@Autowired
private ImageProcessingService imageProcessingService;
```

### 2. 生成缩略图

```java
// 方式1：生成并保存缩略图（推荐）
String thumbnailPath = imageProcessingService.generateAndSaveThumbnail(
    "character/2025/12/original.png",  // 原始图片相对路径
    200,                                // 目标宽度
    150,                                // 目标高度
    true,                               // 保持宽高比
    0.85                                // 压缩质量
);
// 返回：处理后的图片相对路径，如 "character/2025/12/original_thumb_200x150.png"

// 方式2：分步操作
BufferedImage sourceImage = imageProcessingService.readImage("character/2025/12/original.png");
BufferedImage thumbnail = imageProcessingService.generateThumbnail(
    sourceImage, 
    200, 150, true, 0.85
);
String savedPath = imageProcessingService.saveProcessedImage(
    thumbnail, 
    "character/2025/12/original.png", 
    "_thumb_200x150"
);
```

### 3. 裁剪图片

```java
// 方式1：裁剪并保存（推荐）
String croppedPath = imageProcessingService.cropAndSaveImage(
    "character/2025/12/original.png",  // 原始图片相对路径
    100,                                // 裁剪起始X坐标
    50,                                 // 裁剪起始Y坐标
    200,                                // 裁剪宽度
    150                                 // 裁剪高度
);
// 返回：处理后的图片相对路径，如 "character/2025/12/original_crop_100_50_200_150.png"

// 方式2：分步操作
BufferedImage sourceImage = imageProcessingService.readImage("character/2025/12/original.png");
BufferedImage cropped = imageProcessingService.cropImage(
    sourceImage, 
    100, 50, 200, 150
);
String savedPath = imageProcessingService.saveProcessedImage(
    cropped, 
    "character/2025/12/original.png", 
    "_crop_100_50_200_150"
);
```

### 4. 获取图片信息

```java
ImageProcessingService.ImageInfo info = imageProcessingService.getImageInfo(
    "character/2025/12/original.png"
);
System.out.println("宽度: " + info.getWidth());
System.out.println("高度: " + info.getHeight());
System.out.println("文件大小: " + info.getFileSize() + " bytes");
```

## 配置说明

### application.yml配置

```yaml
app:
  image:
    processing:
      thumbnail:
        default-width: 200          # 默认缩略图宽度
        default-height: 200          # 默认缩略图高度
        default-quality: 0.85       # 默认压缩质量 (0.0-1.0)
        keep-aspect-ratio: true     # 默认保持宽高比
      crop:
        max-width: 5000             # 最大裁剪宽度
        max-height: 5000            # 最大裁剪高度
```

### 环境变量配置

也可以通过环境变量配置：

```bash
export IMAGE_THUMBNAIL_DEFAULT_WIDTH=200
export IMAGE_THUMBNAIL_DEFAULT_HEIGHT=200
export IMAGE_THUMBNAIL_DEFAULT_QUALITY=0.85
export IMAGE_THUMBNAIL_KEEP_ASPECT_RATIO=true
export IMAGE_CROP_MAX_WIDTH=5000
export IMAGE_CROP_MAX_HEIGHT=5000
```

## 使用场景示例

### 场景1：上传图片后自动生成缩略图

```java
@PostMapping("/upload")
public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("file") MultipartFile file) {
    // 1. 上传原始图片
    String originalPath = imageStorageService.saveImage(file, "character", userId);
    
    // 2. 自动生成缩略图
    String thumbnailPath = imageProcessingService.generateAndSaveThumbnail(
        originalPath, 
        200, 200, true, 0.85
    );
    
    // 3. 返回结果
    Map<String, Object> response = new HashMap<>();
    response.put("originalUrl", imageUrlUtils.toFullUrl(originalPath));
    response.put("thumbnailUrl", imageUrlUtils.toFullUrl(thumbnailPath));
    return ResponseEntity.ok(response);
}
```

### 场景2：前端图片裁剪

```typescript
// 前端选择裁剪区域后调用
async function cropCharacterAvatar(imageUrl: string, cropArea: CropArea) {
  const response = await fetch('/api/images/crop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      url: imageUrl,
      x: cropArea.x,
      y: cropArea.y,
      width: cropArea.width,
      height: cropArea.height
    })
  });
  
  const result = await response.json();
  return result.url; // 返回裁剪后的图片URL
}
```

### 场景3：批量生成缩略图

```java
public void generateThumbnailsForCategory(String category) {
    // 获取某个分类下的所有图片
    List<String> imagePaths = getImagePathsByCategory(category);
    
    for (String imagePath : imagePaths) {
        try {
            // 生成多种尺寸的缩略图
            imageProcessingService.generateAndSaveThumbnail(imagePath, 200, 200, true, 0.85);
            imageProcessingService.generateAndSaveThumbnail(imagePath, 400, 400, true, 0.85);
            imageProcessingService.generateAndSaveThumbnail(imagePath, 800, 800, true, 0.85);
        } catch (Exception e) {
            logger.error("生成缩略图失败: " + imagePath, e);
        }
    }
}
```

## 参数说明

### 缩略图参数

- **width** (可选)：目标宽度（像素）。如果不指定，使用默认值或按高度缩放
- **height** (可选)：目标高度（像素）。如果不指定，使用默认值或按宽度缩放
- **keepAspectRatio** (可选，默认true)：是否保持宽高比
  - `true`：按比例缩放，确保图片不变形
  - `false`：强制缩放到指定尺寸，可能变形
- **quality** (可选，默认0.85)：压缩质量，范围0.0-1.0
  - 值越大，质量越好，文件越大
  - 推荐值：0.85（平衡质量和文件大小）

### 裁剪参数

- **x** (必需)：裁剪起始X坐标（像素），从图片左上角开始计算
- **y** (必需)：裁剪起始Y坐标（像素），从图片左上角开始计算
- **width** (必需)：裁剪宽度（像素），不能超过 `max-width` 配置
- **height** (必需)：裁剪高度（像素），不能超过 `max-height` 配置

**注意**：如果裁剪区域超出图片范围，会自动调整到图片边界内。

## 文件命名规则

处理后的图片会保存在与原始图片相同的目录下，文件名格式：

- **缩略图**：`{原文件名}_thumb_{width}x{height}.{扩展名}`
  - 示例：`uuid_thumb_200x150.png`
- **裁剪图**：`{原文件名}_crop_{x}_{y}_{width}_{height}.{扩展名}`
  - 示例：`uuid_crop_100_50_200_150.png`

## 错误处理

### 常见错误

1. **图片URL不能为空**
   - 原因：请求中缺少 `url` 参数
   - 解决：确保请求体包含 `url` 字段

2. **图片文件不存在**
   - 原因：指定的图片路径不存在
   - 解决：检查图片URL是否正确，确保图片已上传

3. **裁剪参数不完整**
   - 原因：裁剪请求缺少必需的参数（x, y, width, height）
   - 解决：确保所有裁剪参数都已提供

4. **裁剪参数无效**
   - 原因：坐标或尺寸为负数，或超出最大限制
   - 解决：检查参数值是否合法

5. **无法处理外部URL**
   - 原因：尝试处理外部域名的图片
   - 解决：只能处理本系统内的图片

### 错误响应格式

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

## 性能建议

1. **缩略图尺寸**：根据实际显示需求选择合适的尺寸，避免生成过大的缩略图
2. **压缩质量**：对于列表展示，0.75-0.85 即可；对于详情页，可使用 0.9
3. **批量处理**：大量图片处理建议使用异步任务，避免阻塞主线程
4. **缓存策略**：处理后的图片可以缓存，避免重复处理

## 完整示例

### 前端完整示例（React）

```typescript
import React, { useState } from 'react';

interface ImageProcessorProps {
  imageUrl: string;
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ imageUrl }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 生成缩略图
  const handleGenerateThumbnail = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/images/thumbnail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          url: imageUrl,
          width: 200,
          height: 200,
          keepAspectRatio: true,
          quality: 0.85
        })
      });

      const result = await response.json();
      if (result.success) {
        setThumbnailUrl(result.url);
      } else {
        alert('生成缩略图失败: ' + result.error);
      }
    } catch (error) {
      alert('请求失败: ' + error);
    } finally {
      setLoading(false);
    }
  };

  // 裁剪图片
  const handleCropImage = async (x: number, y: number, width: number, height: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/images/crop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          url: imageUrl,
          x: x,
          y: y,
          width: width,
          height: height
        })
      });

      const result = await response.json();
      if (result.success) {
        setThumbnailUrl(result.url);
      } else {
        alert('裁剪失败: ' + result.error);
      }
    } catch (error) {
      alert('请求失败: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <img src={imageUrl} alt="原始图片" />
      <button onClick={handleGenerateThumbnail} disabled={loading}>
        {loading ? '处理中...' : '生成缩略图'}
      </button>
      {thumbnailUrl && (
        <div>
          <p>处理后的图片：</p>
          <img src={thumbnailUrl} alt="处理后" />
        </div>
      )}
    </div>
  );
};

export default ImageProcessor;
```

### 后端完整示例

```java
@RestController
@RequestMapping("/api/characters")
public class CharacterController {
    
    @Autowired
    private ImageStorageService imageStorageService;
    
    @Autowired
    private ImageProcessingService imageProcessingService;
    
    @Autowired
    private ImageUrlUtils imageUrlUtils;
    
    /**
     * 上传角色头像并自动生成缩略图
     */
    @PostMapping("/{characterId}/avatar")
    public ResponseEntity<Map<String, Object>> uploadAvatar(
            @PathVariable Long characterId,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        // 1. 上传原始图片
        String userId = getCurrentUserId();
        String originalPath = imageStorageService.saveImage(file, "character", userId);
        
        // 2. 自动生成多种尺寸的缩略图
        String thumbnail200 = imageProcessingService.generateAndSaveThumbnail(
            originalPath, 200, 200, true, 0.85
        );
        String thumbnail400 = imageProcessingService.generateAndSaveThumbnail(
            originalPath, 400, 400, true, 0.85
        );
        
        // 3. 返回结果
        Map<String, Object> response = new HashMap<>();
        response.put("original", imageUrlUtils.toFullUrl(originalPath));
        response.put("thumbnail200", imageUrlUtils.toFullUrl(thumbnail200));
        response.put("thumbnail400", imageUrlUtils.toFullUrl(thumbnail400));
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 裁剪角色头像
     */
    @PostMapping("/{characterId}/avatar/crop")
    public ResponseEntity<Map<String, Object>> cropAvatar(
            @PathVariable Long characterId,
            @RequestBody Map<String, Object> request) throws IOException {
        
        String imageUrl = (String) request.get("url");
        Integer x = ((Number) request.get("x")).intValue();
        Integer y = ((Number) request.get("y")).intValue();
        Integer width = ((Number) request.get("width")).intValue();
        Integer height = ((Number) request.get("height")).intValue();
        
        // 裁剪图片
        String croppedPath = imageProcessingService.cropAndSaveImage(
            imageUrl, x, y, width, height
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("url", imageUrlUtils.toFullUrl(croppedPath));
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }
}
```

## 注意事项

1. **认证要求**：API接口需要用户认证（JWT Token）
2. **文件格式**：支持 JPG、PNG、WEBP、GIF 格式
3. **文件大小**：受 `app.image.storage.max-size` 配置限制（默认10MB）
4. **路径格式**：支持相对路径和完整URL（本系统内的图片）
5. **存储位置**：处理后的图片保存在与原始图片相同的目录下

## 更多信息

- 需求分析设计文档：`docs/12-开发指南/架构设计/IMAGE_PROCESSING_TOOL_REQUIREMENTS.md`
- 实现总结文档：`docs/12-开发指南/架构设计/IMAGE_PROCESSING_TOOL_IMPLEMENTATION_SUMMARY.md`
