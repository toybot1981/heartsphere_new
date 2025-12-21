package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.SystemMainStoryDTO;
import com.heartsphere.admin.service.SystemMainStoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 系统主线剧情管理控制器
 */
@RestController
@RequestMapping("/api/admin/system/main-stories")
public class AdminMainStoryController extends BaseAdminController {

    @Autowired
    private SystemMainStoryService mainStoryService;

    @GetMapping
    public ResponseEntity<List<SystemMainStoryDTO>> getAllMainStories(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(mainStoryService.getAllMainStories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SystemMainStoryDTO> getMainStoryById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(mainStoryService.getMainStoryById(id));
    }

    @GetMapping("/era/{eraId}")
    public ResponseEntity<SystemMainStoryDTO> getMainStoryByEraId(
            @PathVariable Long eraId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        SystemMainStoryDTO story = mainStoryService.getMainStoryByEraId(eraId);
        if (story == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(story);
    }

    @PostMapping
    public ResponseEntity<SystemMainStoryDTO> createMainStory(
            @RequestBody SystemMainStoryDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(mainStoryService.createMainStory(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SystemMainStoryDTO> updateMainStory(
            @PathVariable Long id,
            @RequestBody SystemMainStoryDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(mainStoryService.updateMainStory(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMainStory(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        mainStoryService.deleteMainStory(id);
        return ResponseEntity.noContent().build();
    }
}

