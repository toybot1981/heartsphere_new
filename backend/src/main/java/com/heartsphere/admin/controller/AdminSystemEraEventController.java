package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.SystemEraEventDTO;
import com.heartsphere.admin.entity.SystemEraEvent;
import com.heartsphere.admin.service.SystemEraEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 系统预置时代事件管理控制器
 */
@RestController
@RequestMapping("/api/admin/system/era-events")
public class AdminSystemEraEventController extends BaseAdminController {

    @Autowired
    private SystemEraEventService eventService;

    /**
     * 获取所有系统事件
     */
    @GetMapping
    public ResponseEntity<List<SystemEraEventDTO>> getAllEvents(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    /**
     * 根据系统时代ID获取事件
     */
    @GetMapping("/era/{systemEraId}")
    public ResponseEntity<List<SystemEraEventDTO>> getEventsBySystemEraId(
            @PathVariable Long systemEraId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(eventService.getEventsBySystemEraId(systemEraId));
    }

    /**
     * 根据ID获取事件
     */
    @GetMapping("/{id}")
    public ResponseEntity<SystemEraEvent> getEventById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    /**
     * 创建系统事件
     */
    @PostMapping
    public ResponseEntity<SystemEraEvent> createEvent(
            @RequestBody SystemEraEvent event,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(eventService.createEvent(event));
    }

    /**
     * 更新系统事件
     */
    @PutMapping("/{id}")
    public ResponseEntity<SystemEraEvent> updateEvent(
            @PathVariable Long id,
            @RequestBody SystemEraEvent event,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(eventService.updateEvent(id, event));
    }

    /**
     * 删除系统事件
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        eventService.deleteEvent(id);
        return ResponseEntity.ok().build();
    }
}



