package com.heartsphere.controller;

import com.heartsphere.admin.dto.SystemMainStoryDTO;
import com.heartsphere.admin.service.SystemDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 客户端预置主线剧情接口（公开接口，不需要认证）
 * 用于初始化向导等客户端功能
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/preset-main-stories")
public class PresetMainStoryController {

    @Autowired
    private SystemDataService systemDataService;

    /**
     * 获取所有系统预设主线剧情（客户端公开接口）
     */
    @GetMapping(produces = "application/json;charset=UTF-8")
    public ResponseEntity<List<SystemMainStoryDTO>> getAllMainStories() {
        List<SystemMainStoryDTO> stories = systemDataService.getAllMainStories();
        return ResponseEntity.ok(stories);
    }

    /**
     * 根据时代ID获取系统预设主线剧情（客户端公开接口）
     */
    @GetMapping(value = "/era/{eraId}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemMainStoryDTO> getMainStoryByEraId(@PathVariable Long eraId) {
        SystemMainStoryDTO story = systemDataService.getMainStoryByEraId(eraId);
        if (story == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(story);
    }

    /**
     * 根据ID获取系统预设主线剧情（客户端公开接口）
     */
    @GetMapping(value = "/{id}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemMainStoryDTO> getMainStoryById(@PathVariable Long id) {
        SystemMainStoryDTO story = systemDataService.getMainStoryById(id);
        if (story == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(story);
    }
}




