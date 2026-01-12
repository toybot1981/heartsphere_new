package com.heartsphere.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.dto.ScenarioEventDTO;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.service.ScenarioEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scenario-events")
public class ScenarioEventController {

    @Autowired
    private ScenarioEventService eventService;

    /**
     * 获取场景的所有事件
     */
    @GetMapping("/era/{eraId}")
    public ResponseEntity<ApiResponse<List<ScenarioEventDTO>>> getEventsByEraId(@PathVariable Long eraId) {
        List<ScenarioEventDTO> events = eventService.getEventsByEraId(eraId);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    /**
     * 获取所有系统预设事件
     */
    @GetMapping("/system/all")
    public ResponseEntity<ApiResponse<List<ScenarioEventDTO>>> getSystemEvents() {
        List<ScenarioEventDTO> events = eventService.getSystemEvents();
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    /**
     * 获取用户的所有自定义事件
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ScenarioEventDTO>>> getMyEvents() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<ScenarioEventDTO> events = eventService.getUserEvents(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    /**
     * 根据ID获取事件
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ScenarioEventDTO>> getEventById(@PathVariable Long id) {
        ScenarioEventDTO event = eventService.getEventById(id);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    /**
     * 根据eventId获取事件
     */
    @GetMapping("/by-event-id/{eventId}")
    public ResponseEntity<ApiResponse<ScenarioEventDTO>> getEventByEventId(@PathVariable String eventId) {
        ScenarioEventDTO event = eventService.getEventByEventId(eventId);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    /**
     * 创建事件
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ScenarioEventDTO>> createEvent(@RequestBody ScenarioEventDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ScenarioEventDTO created = eventService.createEvent(dto, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(created));
    }

    /**
     * 更新事件
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ScenarioEventDTO>> updateEvent(@PathVariable Long id, @RequestBody ScenarioEventDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        ScenarioEventDTO updated = eventService.updateEvent(id, dto, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    /**
     * 删除事件
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "未登录"));
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        eventService.deleteEvent(id, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

