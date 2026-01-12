package com.heartsphere.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.dto.ApiResponse;
import com.heartsphere.plugin.plugins.photoalbum.entity.Photo;
import com.heartsphere.plugin.plugins.photoalbum.entity.PhotoAlbum;
import com.heartsphere.plugin.plugins.photoalbum.repository.PhotoAlbumRepository;
import com.heartsphere.plugin.plugins.photoalbum.repository.PhotoRepository;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 相册插件控制器
 * 处理相册相关的 API 请求
 */
@Slf4j
@RestController
@RequestMapping("/api/plugins/photo-album")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PhotoAlbumController {
    
    private final PhotoAlbumRepository photoAlbumRepository;
    private final PhotoRepository photoRepository;
    private final ImageStorageService imageStorageService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 创建相册
     */
    @PostMapping("/albums")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createAlbum(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
            }

            log.info("创建相册 - userId: {}, request: {}", userId, request);

            Long pluginInstanceId = request.get("pluginInstanceId") != null 
                ? Long.parseLong(request.get("pluginInstanceId").toString()) 
                : null;
            String name = (String) request.get("name");
            String description = (String) request.get("description");
            @SuppressWarnings("unchecked")
            List<String> tags = (List<String>) request.get("tags");

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("相册名称不能为空"));
            }

            // 创建相册实体
            PhotoAlbum album = PhotoAlbum.builder()
                    .userId(userId)
                    .pluginInstanceId(pluginInstanceId)
                    .name(name)
                    .description(description)
                    .tags(tags != null ? objectMapper.writeValueAsString(tags) : null)
                    .photoCount(0)
                    .isPublic(false)
                    .isDeleted(false)
                    .build();

            // 保存到数据库
            album = photoAlbumRepository.save(album);

            // 转换为响应格式
            Map<String, Object> response = convertAlbumToMap(album);

            log.info("相册创建成功 - albumId: {}", album.getId());
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("创建相册失败", e);
            return ResponseEntity.status(500).body(ApiResponse.error("创建相册失败: " + e.getMessage()));
        }
    }

    /**
     * 获取相册列表
     */
    @GetMapping("/albums")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAlbums(
            @RequestParam(required = false) Long pluginInstanceId,
            Authentication authentication) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
            }

            log.info("获取相册列表 - userId: {}, pluginInstanceId: {}", userId, pluginInstanceId);

            // 查询相册列表
            List<PhotoAlbum> albumList;
            if (pluginInstanceId != null) {
                albumList = photoAlbumRepository.findByUserIdAndPluginInstanceIdAndIsDeletedFalse(userId, pluginInstanceId);
            } else {
                albumList = photoAlbumRepository.findByUserIdAndIsDeletedFalse(userId);
            }

            // 转换为响应格式
            List<Map<String, Object>> albums = albumList.stream()
                    .map(this::convertAlbumToMap)
                    .collect(Collectors.toList());

            log.info("获取相册列表成功 - count: {}", albums.size());
            return ResponseEntity.ok(ApiResponse.success(albums));

        } catch (Exception e) {
            log.error("获取相册列表失败", e);
            return ResponseEntity.status(500).body(ApiResponse.error("获取相册列表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取相册详情
     */
    @GetMapping("/albums/{albumId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAlbumById(
            @PathVariable Long albumId,
            Authentication authentication) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
            }

            log.info("获取相册详情 - userId: {}, albumId: {}", userId, albumId);

            // 查询相册
            PhotoAlbum album = photoAlbumRepository.findByIdAndUserIdAndIsDeletedFalse(albumId, userId);
            if (album == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("相册不存在"));
            }

            // 转换为响应格式
            Map<String, Object> response = convertAlbumToMap(album);
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("获取相册详情失败", e);
            return ResponseEntity.status(500).body(ApiResponse.error("获取相册详情失败: " + e.getMessage()));
        }
    }

    /**
     * 更新相册
     */
    @PutMapping("/albums/{albumId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateAlbum(
            @PathVariable Long albumId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
            }

            log.info("更新相册 - userId: {}, albumId: {}, request: {}", userId, albumId, request);

            // 查询相册
            PhotoAlbum album = photoAlbumRepository.findByIdAndUserIdAndIsDeletedFalse(albumId, userId);
            if (album == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("相册不存在"));
            }

            // 更新字段
            if (request.containsKey("name")) {
                album.setName((String) request.get("name"));
            }
            if (request.containsKey("description")) {
                album.setDescription((String) request.get("description"));
            }
            if (request.containsKey("tags")) {
                @SuppressWarnings("unchecked")
                List<String> tags = (List<String>) request.get("tags");
                album.setTags(tags != null ? objectMapper.writeValueAsString(tags) : null);
            }
            if (request.containsKey("isPublic")) {
                album.setIsPublic((Boolean) request.get("isPublic"));
            }

            // 保存更新
            album = photoAlbumRepository.save(album);

            // 转换为响应格式
            Map<String, Object> response = convertAlbumToMap(album);
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("更新相册失败", e);
            return ResponseEntity.status(500).body(ApiResponse.error("更新相册失败: " + e.getMessage()));
        }
    }

    /**
     * 删除相册
     */
    @DeleteMapping("/albums/{albumId}")
    public ResponseEntity<ApiResponse<Void>> deleteAlbum(
            @PathVariable Long albumId,
            Authentication authentication) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
            }

            log.info("删除相册 - userId: {}, albumId: {}", userId, albumId);

            // 查询相册
            PhotoAlbum album = photoAlbumRepository.findByIdAndUserIdAndIsDeletedFalse(albumId, userId);
            if (album == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("相册不存在"));
            }

            // 软删除
            album.setIsDeleted(true);
            photoAlbumRepository.save(album);

            return ResponseEntity.ok(ApiResponse.success(null));

        } catch (Exception e) {
            log.error("删除相册失败", e);
            return ResponseEntity.status(500).body(ApiResponse.error("删除相册失败: " + e.getMessage()));
        }
    }

    /**
     * 获取相册中的照片列表
     */
    @GetMapping("/albums/{albumId}/photos")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPhotos(
            @PathVariable Long albumId,
            Authentication authentication) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
            }

            log.info("获取照片列表 - userId: {}, albumId: {}", userId, albumId);

            // 验证相册是否存在且属于该用户
            PhotoAlbum album = photoAlbumRepository.findByIdAndUserIdAndIsDeletedFalse(albumId, userId);
            if (album == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("相册不存在"));
            }

            // 查询照片列表
            List<Photo> photoList = photoRepository.findByAlbumIdAndUserIdAndIsDeletedFalseOrderBySortOrderAsc(albumId, userId);

            // 转换为响应格式
            List<Map<String, Object>> photos = photoList.stream()
                    .map(this::convertPhotoToMap)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(photos));

        } catch (Exception e) {
            log.error("获取照片列表失败", e);
            return ResponseEntity.status(500).body(ApiResponse.error("获取照片列表失败: " + e.getMessage()));
        }
    }

    /**
     * 上传照片
     */
    @PostMapping("/albums/{albumId}/photos")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadPhoto(
            @PathVariable Long albumId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String takenAt,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String tags,
            Authentication authentication) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
            }

            log.info("上传照片 - userId: {}, albumId: {}, fileName: {}", userId, albumId, file.getOriginalFilename());

            // 确保相册存在且属于当前用户
            PhotoAlbum album = photoAlbumRepository.findByIdAndUserIdAndIsDeletedFalse(albumId, userId);
            if (album == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("相册不存在或无权访问"));
            }

            // 保存图片文件
            String photoUrl;
            try {
                photoUrl = imageStorageService.saveImage(file, "photo-album", String.valueOf(userId));
                log.info("图片保存成功 - photoUrl: {}", photoUrl);
            } catch (IOException e) {
                log.error("保存图片文件失败", e);
                return ResponseEntity.status(500).body(ApiResponse.error("保存图片文件失败: " + e.getMessage()));
            }

            // 暂时使用原图URL作为缩略图（后续可以实现缩略图生成）
            String thumbnailUrl = photoUrl;

            // 解析标签
            List<String> tagList = new ArrayList<>();
            if (tags != null && !tags.trim().isEmpty()) {
                try {
                    tagList = Arrays.asList(tags.split(","));
                } catch (Exception e) {
                    log.warn("解析标签失败: {}", tags);
                }
            }

            // 解析拍摄时间
            LocalDateTime takenAtTime = null;
            if (takenAt != null && !takenAt.trim().isEmpty()) {
                try {
                    takenAtTime = LocalDateTime.parse(takenAt);
                } catch (Exception e) {
                    log.warn("解析拍摄时间失败: {}", takenAt);
                }
            }

            // 创建照片实体
            Photo newPhoto = Photo.builder()
                    .albumId(albumId)
                    .userId(userId)
                    .title(title)
                    .description(description)
                    .photoUrl(photoUrl)
                    .thumbnailUrl(thumbnailUrl)
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .mimeType(file.getContentType())
                    .takenAt(takenAtTime)
                    .location(location)
                    .tags(tagList.isEmpty() ? null : objectMapper.writeValueAsString(tagList))
                    .isDeleted(false)
                    .sortOrder(0) // 默认排序
                    .build();

            Photo savedPhoto = photoRepository.save(newPhoto);
            log.info("照片保存到数据库成功 - photoId: {}", savedPhoto.getId());

            // 更新相册的照片数量
            album.setPhotoCount(album.getPhotoCount() + 1);
            photoAlbumRepository.save(album);

            // 转换为响应格式（与 getPhotos 保持一致）
            Map<String, Object> photoMap = convertPhotoToMap(savedPhoto);
            return ResponseEntity.ok(ApiResponse.success(photoMap));

        } catch (Exception e) {
            log.error("上传照片失败", e);
            return ResponseEntity.status(500).body(ApiResponse.error("上传照片失败: " + e.getMessage()));
        }
    }

    /**
     * 获取照片详情
     */
    @GetMapping("/photos/{photoId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPhotoById(
            @PathVariable Long photoId,
            Authentication authentication) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
            }

            log.info("获取照片详情 - userId: {}, photoId: {}", userId, photoId);

            // TODO: 实现实际的数据库查询逻辑
            return ResponseEntity.status(404).body(ApiResponse.error("照片不存在"));

        } catch (Exception e) {
            log.error("获取照片详情失败", e);
            return ResponseEntity.status(500).body(ApiResponse.error("获取照片详情失败: " + e.getMessage()));
        }
    }

    /**
     * 更新照片信息
     */
    @PutMapping("/photos/{photoId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePhoto(
            @PathVariable Long photoId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
            }

            log.info("更新照片 - userId: {}, photoId: {}, request: {}", userId, photoId, request);

            // TODO: 实现实际的数据库更新逻辑
            return ResponseEntity.status(404).body(ApiResponse.error("照片不存在"));

        } catch (Exception e) {
            log.error("更新照片失败", e);
            return ResponseEntity.status(500).body(ApiResponse.error("更新照片失败: " + e.getMessage()));
        }
    }

    /**
     * 删除照片
     */
    @DeleteMapping("/photos/{photoId}")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(
            @PathVariable Long photoId,
            Authentication authentication) {
        try {
            Long userId = getUserId(authentication);
            if (userId == null) {
                return ResponseEntity.status(401).body(ApiResponse.error("未授权"));
            }

            log.info("删除照片 - userId: {}, photoId: {}", userId, photoId);

            // TODO: 实现实际的数据库删除逻辑
            return ResponseEntity.ok(ApiResponse.success(null));

        } catch (Exception e) {
            log.error("删除照片失败", e);
            return ResponseEntity.status(500).body(ApiResponse.error("删除照片失败: " + e.getMessage()));
        }
    }

    /**
     * 将相册实体转换为 Map
     */
    private Map<String, Object> convertAlbumToMap(PhotoAlbum album) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", album.getId());
        map.put("pluginInstanceId", album.getPluginInstanceId());
        map.put("name", album.getName());
        map.put("description", album.getDescription());
        map.put("coverPhotoUrl", album.getCoverPhotoUrl());
        map.put("photoCount", album.getPhotoCount());
        map.put("isPublic", album.getIsPublic());
        try {
            List<String> tags = album.getTags() != null 
                ? objectMapper.readValue(album.getTags(), new TypeReference<List<String>>() {})
                : new ArrayList<>();
            map.put("tags", tags);
        } catch (Exception e) {
            map.put("tags", new ArrayList<>());
        }
        map.put("createdAt", album.getCreatedAt() != null ? album.getCreatedAt().toEpochSecond(java.time.ZoneOffset.UTC) * 1000 : null);
        map.put("updatedAt", album.getUpdatedAt() != null ? album.getUpdatedAt().toEpochSecond(java.time.ZoneOffset.UTC) * 1000 : null);
        return map;
    }

    /**
     * 将照片实体转换为 Map
     */
    private Map<String, Object> convertPhotoToMap(Photo photo) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", photo.getId());
        map.put("albumId", photo.getAlbumId());
        map.put("userId", photo.getUserId());
        map.put("title", photo.getTitle());
        map.put("description", photo.getDescription());
        map.put("photoUrl", photo.getPhotoUrl());
        map.put("thumbnailUrl", photo.getThumbnailUrl());
        map.put("fileSize", photo.getFileSize());
        map.put("width", photo.getWidth());
        map.put("height", photo.getHeight());
        map.put("mimeType", photo.getMimeType());
        map.put("takenAt", photo.getTakenAt() != null ? photo.getTakenAt().toEpochSecond(java.time.ZoneOffset.UTC) * 1000 : null);
        map.put("location", photo.getLocation());
        try {
            List<String> tags = photo.getTags() != null 
                ? objectMapper.readValue(photo.getTags(), new TypeReference<List<String>>() {})
                : new ArrayList<>();
            map.put("tags", tags);
        } catch (Exception e) {
            map.put("tags", new ArrayList<>());
        }
        map.put("createdAt", photo.getCreatedAt() != null ? photo.getCreatedAt().toEpochSecond(java.time.ZoneOffset.UTC) * 1000 : null);
        map.put("updatedAt", photo.getUpdatedAt() != null ? photo.getUpdatedAt().toEpochSecond(java.time.ZoneOffset.UTC) * 1000 : null);
        return map;
    }

    /**
     * 获取当前用户ID
     */
    private Long getUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        if (authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            return userDetails.getId();
        }
        return null;
    }
}
