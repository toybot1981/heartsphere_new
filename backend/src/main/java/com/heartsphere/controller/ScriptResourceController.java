package com.heartsphere.controller;

import com.heartsphere.admin.dto.SystemCharacterDTO;
import com.heartsphere.admin.entity.SystemEraEvent;
import com.heartsphere.admin.entity.SystemEraItem;
import com.heartsphere.admin.entity.SystemCharacter;
import com.heartsphere.admin.util.SystemDTOMapper;
import com.heartsphere.dto.ApiResponse;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.ScriptEraResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 剧本资源控制器
 * 提供根据剧本ID获取对应时代的系统预置物品、事件和角色的接口
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/scripts/{scriptId}/resources")
public class ScriptResourceController {

    @Autowired
    private ScriptEraResourceService scriptEraResourceService;

    /**
     * 根据剧本ID获取对应时代的系统预置物品
     */
    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<SystemEraItem>>> getItemsByScriptId(
            @PathVariable Long scriptId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
        }

        List<SystemEraItem> items = scriptEraResourceService.getItemsByScriptId(scriptId);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    /**
     * 根据剧本ID和物品类型获取对应时代的系统预置物品
     */
    @GetMapping("/items/type/{itemType}")
    public ResponseEntity<ApiResponse<List<SystemEraItem>>> getItemsByScriptIdAndType(
            @PathVariable Long scriptId,
            @PathVariable String itemType) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
        }

        List<SystemEraItem> items = scriptEraResourceService.getItemsByScriptIdAndType(scriptId, itemType);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    /**
     * 根据剧本ID获取对应时代的系统预置事件
     */
    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<SystemEraEvent>>> getEventsByScriptId(
            @PathVariable Long scriptId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
        }

        List<SystemEraEvent> events = scriptEraResourceService.getEventsByScriptId(scriptId);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    /**
     * 根据剧本ID获取对应时代的系统预置角色
     */
    @GetMapping("/characters")
    public ResponseEntity<ApiResponse<List<SystemCharacterDTO>>> getCharactersByScriptId(
            @PathVariable Long scriptId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
        }

        List<SystemCharacter> characters = scriptEraResourceService.getCharactersByScriptId(scriptId);
        List<SystemCharacterDTO> characterDTOs = characters.stream()
                .map(SystemDTOMapper::toCharacterDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(characterDTOs));
    }
}

