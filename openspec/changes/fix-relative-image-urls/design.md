# Design: Fix Relative Image URLs to Full URLs

## Context

当前系统后端在某些情况下返回相对路径的图片URL（如 `era/2026/01/xxx.png`），而前端组件（如 `LazyImage`）无法正确加载相对路径，导致图片显示失败。特别是在游客模式下，场景卡片图片无法显示。

## Goals

1. 统一图片URL格式，确保所有返回给前端的图片URL都是完整URL
2. 前端能够正确处理相对路径（作为兜底方案）
3. 图片变体URL（thumbnail、medium、highQuality）也是完整URL
4. 确保所有环境（开发/生产）都能正确加载图片

## Non-Goals

- 不改变图片存储方式（仍然使用相对路径存储）
- 不改变图片上传流程
- 不改变图片处理逻辑

## Decisions

### Decision 1: 后端统一返回完整URL

**Decision**: 后端所有返回图片URL的接口统一使用 `ImageUrlUtils.toFullUrl()` 转换为完整URL

**Rationale**:
- 前端不需要处理相对路径转换，逻辑更简单
- 减少前端代码复杂度
- 统一的数据格式，便于维护

**Implementation**:
```java
// EraController.java
eraDTO.setImageUrl(imageUrlUtils.toFullUrl(systemEra.getImageUrl()));

// CharacterController.java
dto.setAvatarUrl(imageUrlUtils.toFullUrl(sc.getAvatarUrl()));
dto.setBackgroundUrl(imageUrlUtils.toFullUrl(sc.getBackgroundUrl()));
```

**Alternatives Considered**:
- 前端统一处理相对路径转换
- **Rejected**: 增加前端复杂度，且不同环境base URL不同，难以统一处理

### Decision 2: 前端添加兜底方案

**Decision**: 前端添加 `toFullImageUrl()` 工具函数，作为兜底方案处理相对路径

**Rationale**:
- 向后兼容，如果后端返回相对路径，前端仍能正确处理
- 防御性编程，提高系统健壮性
- 便于调试和排查问题

**Implementation**:
```typescript
// utils/imageUrl.ts
export function toFullImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 相对路径，转换为完整URL
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:8081/images';
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return `${imageBaseUrl}${normalizedPath}`;
}
```

### Decision 3: 图片变体URL处理

**Decision**: 后端 `ImageUrlUtils.generateImageVariants()` 返回的变体URL都是完整URL

**Rationale**:
- 与主图片URL保持一致
- 前端不需要额外处理变体URL转换
- 统一的数据格式

**Implementation**:
```java
// ImageUrlUtils.java
public Map<String, String> generateImageVariants(String imageUrl) {
    Map<String, String> variants = new HashMap<>();
    String fullUrl = toFullUrl(imageUrl);
    variants.put("original", fullUrl);
    
    // 生成变体URL（也是完整URL）
    String thumbnailPath = getVariantPath(imageUrl, 200, 200);
    variants.put("thumbnail", toFullUrl(thumbnailPath));
    // ...
    return variants;
}
```

### Decision 4: 环境变量配置

**Decision**: 使用环境变量 `VITE_IMAGE_BASE_URL` 配置前端图片base URL

**Rationale**:
- 不同环境（开发/生产）可以使用不同的base URL
- 便于配置管理
- 与API base URL配置方式一致

**Default Values**:
- 开发环境: `http://localhost:8081/images`
- 生产环境: 通过环境变量配置

## Architecture Changes

### Current Flow

```
后端存储: 相对路径 (era/2026/01/xxx.png)
  ↓
后端返回: 相对路径 (era/2026/01/xxx.png)
  ↓
前端接收: 相对路径
  ↓
前端加载: 失败 ❌
```

### Target Flow

```
后端存储: 相对路径 (era/2026/01/xxx.png)
  ↓
后端转换: 完整URL (http://localhost:8081/images/era/2026/01/xxx.png)
  ↓
后端返回: 完整URL
  ↓
前端接收: 完整URL
  ↓
前端加载: 成功 ✅
```

### Fallback Flow

```
后端返回: 相对路径 (如果后端未转换)
  ↓
前端检测: 相对路径
  ↓
前端转换: 完整URL
  ↓
前端加载: 成功 ✅
```

## Data Flow

### Backend Image URL Conversion

1. **存储**: 数据库存储相对路径（如 `era/2026/01/xxx.png`）
2. **查询**: 从数据库读取相对路径
3. **转换**: 使用 `ImageUrlUtils.toFullUrl()` 转换为完整URL
4. **返回**: DTO中包含完整URL

### Frontend Image URL Handling

1. **接收**: 从API接收图片URL（可能是完整URL或相对路径）
2. **检测**: 检查是否为完整URL（以 `http://` 或 `https://` 开头）
3. **转换**: 如果是相对路径，使用 `toFullImageUrl()` 转换为完整URL
4. **使用**: 将完整URL传递给 `LazyImage` 组件

## Migration Plan

### Phase 1: 后端修改
1. 修改 `EraController` 返回完整URL
2. 修改 `CharacterController` 返回完整URL
3. 修改 `DTOMapper` 确保所有图片URL都是完整URL
4. 测试后端API返回的URL格式

### Phase 2: 前端工具函数
1. 创建 `utils/imageUrl.ts` 工具函数
2. 修改 `imageResolution.ts` 使用工具函数
3. 修改 `LazyImage.tsx` 使用工具函数
4. 修改 `SceneCard.tsx` 使用工具函数

### Phase 3: 测试验证
1. 测试完整URL加载
2. 测试相对路径兜底转换
3. 测试图片变体URL
4. 测试不同环境（开发/生产）

## Risks / Trade-offs

### Risk 1: Base URL配置错误
- **Risk**: 不同环境base URL配置错误导致图片无法加载
- **Mitigation**: 提供默认值，添加配置验证
- **Trade-off**: 需要维护环境变量配置

### Risk 2: 性能影响
- **Risk**: URL转换增加少量计算开销
- **Mitigation**: 转换逻辑简单，性能影响可忽略
- **Trade-off**: 换取代码一致性和可维护性

### Risk 3: 向后兼容
- **Risk**: 如果后端未转换，前端需要处理
- **Mitigation**: 前端兜底方案确保兼容性
- **Trade-off**: 增加前端代码，但提高健壮性

## Open Questions

1. 是否需要支持CDN URL？
   - **建议**: 当前不需要，未来可以通过base URL配置支持

2. 图片变体URL是否也需要转换？
   - **已解决**: 后端 `generateImageVariants()` 返回完整URL

3. 是否需要缓存转换结果？
   - **建议**: 不需要，转换逻辑简单，性能影响可忽略
