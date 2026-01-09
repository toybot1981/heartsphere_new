package com.heartsphere.mentis.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.mentis.dto.TaskExecuteRequestDTO;
import com.heartsphere.mentis.entity.MentisTask;
import com.heartsphere.mentis.service.MentisTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Mentis 任务管理控制器
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/mentis/tasks")
@RequiredArgsConstructor
public class MentisTaskController {
    
    private final MentisTaskService taskService;
    
    /**
     * 获取任务详情
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<MentisTask>> getTask(
            @PathVariable String taskId) {
        
        MentisTask task = taskService.getTask(taskId);
        return ResponseEntity.ok(ApiResponse.success(task));
    }
    
    /**
     * 获取会话的所有任务
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<MentisTask>>> getSessionTasks(
            @RequestParam String sessionId) {
        
        List<MentisTask> tasks = taskService.getSessionTasks(sessionId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }
    
    /**
     * 取消任务
     */
    @PostMapping("/{taskId}/cancel")
    public ResponseEntity<ApiResponse<MentisTask>> cancelTask(
            @PathVariable String taskId) {
        
        taskService.cancelTask(taskId);
        MentisTask task = taskService.getTask(taskId);
        return ResponseEntity.ok(ApiResponse.success(task));
    }
}
