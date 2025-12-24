# 图片URL相对路径方案 - 使用示例

## DTO转换示例

### CharacterDTO 转换示例

```java
@Service
@RequiredArgsConstructor
public class CharacterService {
    
    private final ImageUrlUtils imageUrlUtils;
    
    public CharacterDTO toDTO(Character character) {
        CharacterDTO dto = new CharacterDTO();
        dto.setId(character.getId());
        dto.setName(character.getName());
        // ... 其他字段
        
        // 使用 ImageUrlUtils 将相对路径转换为完整URL
        dto.setAvatarUrl(imageUrlUtils.toFullUrl(character.getAvatarUrl()));
        dto.setBackgroundUrl(imageUrlUtils.toFullUrl(character.getBackgroundUrl()));
        
        return dto;
    }
}
```

### EraDTO 转换示例

```java
@Service
@RequiredArgsConstructor
public class EraService {
    
    private final ImageUrlUtils imageUrlUtils;
    
    public EraDTO toDTO(Era era) {
        EraDTO dto = new EraDTO();
        dto.setId(era.getId());
        dto.setName(era.getName());
        // ... 其他字段
        
        // 使用 ImageUrlUtils 将相对路径转换为完整URL
        dto.setImageUrl(imageUrlUtils.toFullUrl(era.getImageUrl()));
        
        return dto;
    }
}
```

### Controller 中使用

```java
@RestController
@RequestMapping("/api/characters")
@RequiredArgsConstructor
public class CharacterController {
    
    private final CharacterService characterService;
    
    @GetMapping("/{id}")
    public ResponseEntity<CharacterDTO> getCharacter(@PathVariable Long id) {
        Character character = characterService.findById(id);
        CharacterDTO dto = characterService.toDTO(character);
        return ResponseEntity.ok(dto);
    }
}
```

## 前端调用示例

前端无需修改，仍然接收完整的URL：

```typescript
// 前端代码保持不变
const response = await fetch('/api/characters/1');
const character = await response.json();
console.log(character.avatarUrl); 
// 输出: http://localhost:8081/api/images/files/character/2024/12/uuid-123.jpg
```

## 上传图片示例

上传图片后，后端返回相对路径，前端可以根据需要拼接：

```java
@PostMapping("/upload")
public ResponseEntity<Map<String, Object>> uploadImage(
        @RequestParam("file") MultipartFile file) {
    // ImageStorageService 现在返回相对路径
    String relativePath = imageStorageService.saveImage(file, "character");
    
    // 如果需要返回完整URL给前端，使用 ImageUrlUtils
    String fullUrl = imageUrlUtils.toFullUrl(relativePath);
    
    Map<String, Object> response = new HashMap<>();
    response.put("success", true);
    response.put("url", fullUrl);  // 返回完整URL
    response.put("relativePath", relativePath);  // 可选：同时返回相对路径
    return ResponseEntity.ok(response);
}
```

## 迁移检查脚本

```sql
-- 检查迁移前后的数据变化
-- 执行迁移前
SELECT 
    'characters.avatar_url' as table_column,
    COUNT(*) as total_count,
    SUM(CASE WHEN avatar_url LIKE 'http://localhost%' THEN 1 ELSE 0 END) as localhost_urls,
    SUM(CASE WHEN avatar_url LIKE 'https://%' THEN 1 ELSE 0 END) as https_urls,
    SUM(CASE WHEN avatar_url NOT LIKE 'http%' THEN 1 ELSE 0 END) as relative_paths
FROM characters 
WHERE avatar_url IS NOT NULL AND avatar_url != '';

-- 执行迁移后，应该看到 relative_paths 数量增加，localhost_urls 减少
```

## 注意事项

1. **外部URL处理**：外部URL（如 `picsum.photos`）不会被转换，会保持原样
2. **null 处理**：`ImageUrlUtils.toFullUrl(null)` 返回 `null`
3. **空字符串处理**：`ImageUrlUtils.toFullUrl("")` 返回 `null`
4. **向后兼容**：如果传入的是绝对URL，`toFullUrl()` 会直接返回，不会重复拼接

