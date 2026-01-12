package com.heartsphere.edu.controller;

import com.heartsphere.edu.dto.InteractionQuery;
import com.heartsphere.edu.dto.RecordInteractionRequest;
import com.heartsphere.edu.entity.EduCharacterInteraction;
import com.heartsphere.edu.service.DigitalHumanService;
import com.heartsphere.shared.dto.ApiResponse;
import com.heartsphere.shared.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * 教育版数字人互动记录控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/edu/character-interactions")
@RequiredArgsConstructor
public class EduCharacterInteractionController {
    
    private final DigitalHumanService digitalHumanService;
    
    /**
     * 记录学生与数字人的互动
     */
    @PostMapping
    public ResponseEntity<ApiResponse<EduCharacterInteraction>> recordInteraction(
            @Valid @RequestBody RecordInteractionRequest request) {
        try {
            log.info("记录互动请求: studentId={}, characterId={}, type={}", 
                request.getStudentId(), request.getCharacterId(), request.getInteractionType());
            EduCharacterInteraction interaction = digitalHumanService.recordInteraction(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("记录互动成功", interaction));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (Exception e) {
            log.error("记录互动失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("记录互动失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取互动历史（支持筛选、分页）
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<EduCharacterInteraction>>> getInteractions(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long characterId,
            @RequestParam(required = false) String interactionType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            if (studentId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error(400, "studentId 参数不能为空"));
            }
            
            InteractionQuery query = new InteractionQuery();
            query.setCharacterId(characterId);
            if (interactionType != null) {
                try {
                    query.setInteractionType(EduCharacterInteraction.InteractionType.valueOf(interactionType.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(ApiResponse.error(400, "无效的互动类型: " + interactionType));
                }
            }
            query.setStartDate(startDate);
            query.setEndDate(endDate);
            
            Pageable pageable = PageRequest.of(page, size);
            Page<EduCharacterInteraction> interactions = digitalHumanService.getStudentInteractions(
                studentId, query, pageable);
            
            return ResponseEntity.ok(ApiResponse.success("获取互动历史成功", interactions));
        } catch (Exception e) {
            log.error("获取互动历史失败: studentId={}", studentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取互动历史失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取互动详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EduCharacterInteraction>> getInteractionById(@PathVariable Long id) {
        try {
            EduCharacterInteraction interaction = digitalHumanService.getInteractionById(id);
            return ResponseEntity.ok(ApiResponse.success("获取互动详情成功", interaction));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (Exception e) {
            log.error("获取互动详情失败: id={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取互动详情失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取学生的互动历史（便捷端点）
     */
    @GetMapping("/students/{studentId}")
    public ResponseEntity<ApiResponse<Page<EduCharacterInteraction>>> getStudentInteractions(
            @PathVariable Long studentId,
            @RequestParam(required = false) Long characterId,
            @RequestParam(required = false) String interactionType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            InteractionQuery query = new InteractionQuery();
            query.setCharacterId(characterId);
            if (interactionType != null) {
                try {
                    query.setInteractionType(EduCharacterInteraction.InteractionType.valueOf(interactionType.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(ApiResponse.error(400, "无效的互动类型: " + interactionType));
                }
            }
            query.setStartDate(startDate);
            query.setEndDate(endDate);
            
            Pageable pageable = PageRequest.of(page, size);
            Page<EduCharacterInteraction> interactions = digitalHumanService.getStudentInteractions(
                studentId, query, pageable);
            
            return ResponseEntity.ok(ApiResponse.success("获取学生互动历史成功", interactions));
        } catch (Exception e) {
            log.error("获取学生互动历史失败: studentId={}", studentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取学生互动历史失败: " + e.getMessage()));
        }
    }
}
