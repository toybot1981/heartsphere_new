# 图片分辨率展示规则迁移指南

**最后更新**: 2025-01-13

---

## 📋 概述

本指南帮助开发者将现有代码迁移到统一的图片分辨率展示规则。迁移过程是渐进式的，保持向后兼容。

## 🎯 迁移目标

- 统一所有项目的图片分辨率选择逻辑
- 使用标准化的场景类型定义
- 遵循统一的映射规则和回退策略
- 提升图片加载性能和用户体验

## 📝 迁移步骤

### 步骤1：了解新规则

在开始迁移前，请先阅读：
- [使用指南](../../../docs/12-开发指南/开发规范/图片分辨率展示规则使用指南.md)
- [设计文档](./design.md)
- [规范定义](./specs/image-display/spec.md)

### 步骤2：识别需要迁移的代码

查找以下模式：

```bash
# 查找直接使用 img 标签的地方
grep -r "<img" --include="*.tsx" --include="*.ts"

# 查找自定义分辨率选择逻辑
grep -r "thumbnail|medium|highQuality" --include="*.tsx" --include="*.ts"

# 查找 LazyImage 组件的使用
grep -r "LazyImage" --include="*.tsx" --include="*.ts"
```

### 步骤3：迁移模式

#### 模式1：直接使用 img 标签

**旧代码**：
```tsx
<img 
  src={imageUrl} 
  alt="图片" 
  className="w-full h-full object-cover"
/>
```

**新代码**：
```tsx
import { LazyImage } from '../components/LazyImage';

<LazyImage
  src={imageUrl}
  alt="图片"
  purpose="detail"  // 根据实际场景选择
  className="w-full h-full object-cover"
/>
```

#### 模式2：自定义分辨率选择逻辑

**旧代码**：
```tsx
const getImageUrl = () => {
  if (variants?.small && size === 'small') {
    return variants.small;
  }
  if (variants?.medium && size === 'medium') {
    return variants.medium;
  }
  return imageUrl;
};

<img src={getImageUrl()} alt="图片" />
```

**新代码**：
```tsx
import { LazyImage } from '../components/LazyImage';

<LazyImage
  src={imageUrl}
  alt="图片"
  variants={variants}
  purpose={size === 'small' ? 'thumbnail' : 'detail'}
/>
```

#### 模式3：条件渲染不同分辨率

**旧代码**：
```tsx
const imageSrc = isMobile 
  ? variants?.mobile || imageUrl
  : variants?.desktop || imageUrl;

<img src={imageSrc} alt="图片" />
```

**新代码**：
```tsx
import { LazyImage } from '../components/LazyImage';
import { isMobileDevice } from '../utils/imageResolution';

<LazyImage
  src={imageUrl}
  alt="图片"
  variants={variants}
  purpose="chatBackground"
  isMobile={isMobileDevice()}
/>
```

#### 模式4：使用不同的 LazyImage 实现

**旧代码**（admin项目）：
```tsx
// admin/frontend/src/components/LazyImage.tsx
const selectImageResolution = (baseSrc, variants, purpose) => {
  // 自定义逻辑
  const variantKey = purpose === 'thumbnail' ? 'thumbnail' : 'original';
  return variants[variantKey] || baseSrc;
};
```

**新代码**：
```tsx
// 已统一使用 main/frontend/utils/imageResolution.ts
import { selectImageResolution } from '../utils/imageResolution';
```

### 步骤4：更新场景类型

将自定义的场景类型映射到标准类型：

| 旧场景类型 | 新场景类型 | 说明 |
|----------|----------|------|
| `small` | `thumbnail` | 小尺寸图片 |
| `card` | `thumbnail` | 卡片图片 |
| `preview` | `detail` | 预览图 |
| `full` | `detail` | 完整图片 |
| `mobileBg` | `background` | 移动端背景 |
| `desktopBg` | `chatBackground` | PC端背景 |

### 步骤5：测试验证

迁移后，验证以下内容：

1. **功能验证**：
   - [ ] 图片正常显示
   - [ ] 不同场景使用正确的分辨率
   - [ ] 回退策略正常工作
   - [ ] 设备类型检测正确

2. **性能验证**：
   - [ ] 图片加载速度提升
   - [ ] 网络请求减少
   - [ ] 页面渲染性能良好

3. **兼容性验证**：
   - [ ] 旧代码仍然工作（向后兼容）
   - [ ] 新代码符合规范
   - [ ] 跨项目一致性

## 🔧 迁移示例

### 示例1：角色头像组件

**旧代码**：
```tsx
// CharacterAvatar.tsx
export const CharacterAvatar = ({ character, size }) => {
  const getAvatarUrl = () => {
    if (size === 'small' && character.avatarThumbnail) {
      return character.avatarThumbnail;
    }
    return character.avatarUrl;
  };

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden">
      <img 
        src={getAvatarUrl()} 
        alt={character.name}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
```

**新代码**：
```tsx
// CharacterAvatar.tsx
import { LazyImage } from '../LazyImage';
import type { ImageVariants } from '../utils/imageResolution';

export const CharacterAvatar = ({ 
  character, 
  size,
  avatarVariants 
}: { 
  character: Character;
  size: 'small' | 'medium' | 'large';
  avatarVariants?: ImageVariants;
}) => {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden">
      <LazyImage
        src={character.avatarUrl}
        alt={character.name}
        variants={avatarVariants}
        purpose={size === 'small' ? 'thumbnail' : 'detail'}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
```

### 示例2：背景层组件

**旧代码**：
```tsx
// BackgroundLayer.tsx
export const BackgroundLayer = ({ backgroundImage, isMobile }) => {
  const getBackgroundUrl = () => {
    if (!backgroundImage) return null;
    
    if (isMobile && backgroundVariants?.mobile) {
      return backgroundVariants.mobile;
    }
    if (!isMobile && backgroundVariants?.desktop) {
      return backgroundVariants.desktop;
    }
    return backgroundImage;
  };

  return (
    <div 
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${getBackgroundUrl()})` }}
    />
  );
};
```

**新代码**：
```tsx
// BackgroundLayer.tsx
import { selectImageResolution, isMobileDevice } from '../utils/imageResolution';
import type { ImageVariants } from '../utils/imageResolution';

export const BackgroundLayer = ({ 
  backgroundImage, 
  backgroundVariants 
}: { 
  backgroundImage: string | null;
  backgroundVariants?: ImageVariants;
}) => {
  const isMobile = isMobileDevice();
  const selectedImageUrl = backgroundImage 
    ? selectImageResolution(
        backgroundImage,
        backgroundVariants,
        'chatBackground',
        isMobile
      )
    : null;

  return (
    <div 
      className="absolute inset-0 bg-cover bg-center"
      style={{ 
        backgroundImage: selectedImageUrl ? `url(${selectedImageUrl})` : 'none' 
      }}
    />
  );
};
```

### 示例3：资源选择器

**旧代码**：
```tsx
// ResourcePicker.tsx
<div className="grid grid-cols-4 gap-4">
  {resources.map((resource) => (
    <div key={resource.id} className="aspect-square">
      <img
        src={resource.url}
        alt={resource.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder.png';
        }}
      />
    </div>
  ))}
</div>
```

**新代码**：
```tsx
// ResourcePicker.tsx
import { LazyImage } from '../LazyImage';

<div className="grid grid-cols-4 gap-4">
  {resources.map((resource) => (
    <div key={resource.id} className="aspect-square">
      <LazyImage
        src={resource.url}
        alt={resource.name}
        variants={resource.variants}
        purpose="thumbnail"
        className="w-full h-full object-cover"
      />
    </div>
  ))}
</div>
```

## ✅ 迁移检查清单

完成迁移后，请检查以下项目：

- [ ] 所有 `img` 标签已替换为 `LazyImage` 组件（或使用 `selectImageResolution` 函数）
- [ ] 所有场景类型使用标准类型（`thumbnail`, `list`, `detail`, `background`, `chatBackground`, `original`）
- [ ] 所有组件支持 `variants` 参数（如果后端提供了多分辨率版本）
- [ ] 设备类型检测正确（自动检测或手动指定）
- [ ] 回退策略正常工作
- [ ] 代码通过 linter 检查
- [ ] 功能测试通过
- [ ] 性能测试通过

## 🐛 常见问题

### Q: 迁移后图片不显示怎么办？

A: 检查以下几点：
1. 确认 `src` 参数正确
2. 确认 `variants` 参数格式正确（如果提供）
3. 检查浏览器控制台是否有错误
4. 确认图片URL可访问

### Q: 如何知道应该使用哪个场景类型？

A: 参考场景映射规则：
- 列表、卡片、小图标 → `thumbnail` 或 `list`
- 详情页、对话框 → `detail`
- 移动端全屏背景 → `background`
- PC端ChatWindow背景 → `chatBackground`

### Q: 迁移后性能没有提升？

A: 确保：
1. 后端返回了 `variants` 参数
2. 使用了正确的 `purpose` 参数
3. 图片已生成多分辨率版本

### Q: 旧代码还能用吗？

A: 是的，保持向后兼容。如果没有提供 `variants` 参数，组件会使用原图。

## 📚 相关资源

- [使用指南](../../../docs/12-开发指南/开发规范/图片分辨率展示规则使用指南.md)
- [设计文档](./design.md)
- [规范定义](./specs/image-display/spec.md)
- [提案文档](./proposal.md)

---

**需要帮助？** 请联系开发团队或查看相关文档。
