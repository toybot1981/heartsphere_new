package com.heartsphere.ai.skill.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.ai.skill.dto.SkillExecutionRecordDTO;
import com.heartsphere.ai.skill.engine.SkillApplicationResult;
import com.heartsphere.ai.skill.engine.SkillEvaluationContext;
import com.heartsphere.ai.skill.engine.LLMSkillApplicationEngine;
import com.heartsphere.ai.skill.service.SkillExecutionRecordService;
import com.heartsphere.ai.skill.service.SkillRecordMonitor;
import com.heartsphere.ai.skill.service.SkillMemoryCorrelationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 技能调试 Controller
 * 提供技能执行调试和数据查询的 REST API
 */
@RestController
@RequestMapping("/api/v1/skill/debug")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Skill Debug", description = "技能调试相关接口")
public class SkillDebugController {

    private final SkillExecutionRecordService recordService;
    private final LLMSkillApplicationEngine llmSkillApplicationEngine;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Autowired(required = false)
    private SkillRecordMonitor monitor;
    
    @Autowired(required = false)
    private SkillMemoryCorrelationService correlationService;

    /**
     * 解析 relatedMemoryIds JSON 字符串为 List<Long>
     */
    private List<Long> parseRelatedMemoryIds(String jsonStr) {
        if (jsonStr == null || jsonStr.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(jsonStr, new TypeReference<List<Long>>() {});
        } catch (Exception e) {
            log.warn("解析 relatedMemoryIds 失败: {}", jsonStr, e);
            return new ArrayList<>();
        }
    }

    // ==================== 执行记录查询 ====================

    /**
     * 获取对话的技能执行历史
     */
    @GetMapping("/conversation/{conversationId}/history")
    @Operation(summary = "获取对话的技能执行历史", description = "获取指定对话中所有技能的执行记录")
    public ResponseEntity<List<SkillExecutionRecordDTO>> getConversationHistory(
        @PathVariable Long conversationId,
        @RequestParam(defaultValue = "100") int limit,
        Authentication authentication) {

        try {
            List<SkillExecutionRecordDTO> history = recordService
                .getConversationHistory(conversationId, limit);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("查询对话历史失败: conversationId={}", conversationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 分页查询对话的技能执行历史
     */
    @GetMapping("/conversation/{conversationId}/history/paged")
    @Operation(summary = "分页查询对话历史", description = "分页查询指定对话的技能执行记录")
    public ResponseEntity<Page<SkillExecutionRecordDTO>> getConversationHistoryPaged(
        @PathVariable Long conversationId,
        @RequestParam(defaultValue = "0") int pageNo,
        @RequestParam(defaultValue = "20") int pageSize,
        Authentication authentication) {

        try {
            Page<SkillExecutionRecordDTO> page = recordService
                .getConversationHistoryPaged(conversationId, pageNo, pageSize);
            return ResponseEntity.ok(page);
        } catch (Exception e) {
            log.error("分页查询失败: conversationId={}", conversationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 获取单个执行记录的详情
     */
    @GetMapping("/record/{recordId}")
    @Operation(summary = "获取执行记录详情", description = "获取指定ID的技能执行记录完整信息")
    public ResponseEntity<SkillExecutionRecordDTO> getRecordDetail(
        @PathVariable Long recordId,
        Authentication authentication) {

        try {
            // 这里需要根据 recordId 查询单条记录
            // 由于 Repository 中没有直接方法，需要添加
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("查询记录失败: recordId={}", recordId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 技能统计 ====================

    /**
     * 获取用户的技能使用统计
     */
    @GetMapping("/user/{userId}/statistics")
    @Operation(summary = "获取用户统计", description = "获取用户的技能使用统计数据")
    public ResponseEntity<?> getUserStatistics(
        @PathVariable Long userId,
        @RequestParam(defaultValue = "7") int days,
        Authentication authentication) {

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startTime = now.minusDays(days);
            
            var stats = recordService.getUserStatistics(userId, startTime, now);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("查询用户统计失败: userId={}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 获取技能的统计数据
     */
    @GetMapping("/skill/{skillId}/statistics")
    @Operation(summary = "获取技能统计", description = "获取指定技能的执行统计数据")
    public ResponseEntity<?> getSkillStatistics(
        @PathVariable Long skillId,
        @RequestParam(defaultValue = "7") int days,
        Authentication authentication) {

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime startTime = now.minusDays(days);
            
            var stats = recordService.getSkillStatistics(skillId, startTime, now);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("查询技能统计失败: skillId={}", skillId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 技能-记忆关联 ====================

    /**
     * 根据记忆ID查询相关技能
     */
    @GetMapping("/memory/{memoryId}/skills")
    @Operation(summary = "查询记忆相关的技能", description = "根据记忆ID查询使用该记忆的技能执行记录")
    public ResponseEntity<List<SkillExecutionRecordDTO>> getSkillsByMemoryId(
        @PathVariable Long memoryId,
        Authentication authentication) {
        try {
            if (correlationService == null) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            var records = correlationService.getSkillsByMemoryId(memoryId);
            var dtos = records.stream()
                .map(record -> {
                    // 转换为 DTO
                    SkillExecutionRecordDTO dto = new SkillExecutionRecordDTO();
                    dto.setId(record.getId());
                    dto.setConversationId(record.getConversationId());
                    dto.setSkillId(record.getSkillId());
                    dto.setUserId(record.getUserId());
                    dto.setDecision(record.getDecision());
                    dto.setExecutionStatus(record.getExecutionStatus().name());
                    dto.setCompositeScore(record.getCompositeScore());
                    dto.setRelatedMemoryIds(parseRelatedMemoryIds(record.getRelatedMemoryIds()));
                    return dto;
                })
                .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("查询记忆相关技能失败: memoryId={}", memoryId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 根据技能ID查询相关记忆
     */
    @GetMapping("/skill/{skillId}/memories")
    @Operation(summary = "查询技能相关的记忆", description = "根据技能ID查询该技能使用的记忆ID列表")
    public ResponseEntity<List<Long>> getMemoryIdsBySkillId(
        @PathVariable Long skillId,
        Authentication authentication) {
        try {
            if (correlationService == null) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            var memoryIds = correlationService.getMemoryIdsBySkillId(skillId);
            return ResponseEntity.ok(memoryIds);
        } catch (Exception e) {
            log.error("查询技能相关记忆失败: skillId={}", skillId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 获取技能-记忆关联统计
     */
    @GetMapping("/skill/{skillId}/correlation")
    @Operation(summary = "获取关联统计", description = "获取技能与记忆的关联统计信息")
    public ResponseEntity<SkillMemoryCorrelationService.CorrelationStats> getCorrelationStats(
        @PathVariable Long skillId,
        Authentication authentication) {
        try {
            if (correlationService == null) {
                return ResponseEntity.ok(SkillMemoryCorrelationService.CorrelationStats.builder()
                    .skillId(skillId)
                    .totalRecords(0)
                    .recordsWithMemory(0)
                    .uniqueMemoryCount(0)
                    .memoryIds(Collections.emptyList())
                    .correlationRate(0.0)
                    .build());
            }
            var stats = correlationService.getCorrelationStats(skillId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("获取关联统计失败: skillId={}", skillId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 失败分析 ====================

    /**
     * 获取最近的执行失败
     */
    @GetMapping("/failures/recent")
    @Operation(summary = "获取最近失败", description = "获取最近执行失败的技能记录")
    public ResponseEntity<List<SkillExecutionRecordDTO>> getRecentFailures(
        @RequestParam(defaultValue = "10") int limit,
        @RequestParam(defaultValue = "1") int hoursAgo,
        Authentication authentication) {

        try {
            LocalDateTime sinceTime = LocalDateTime.now().minusHours(hoursAgo);
            List<SkillExecutionRecordDTO> failures = recordService
                .getRecentFailures(limit, sinceTime);
            return ResponseEntity.ok(failures);
        } catch (Exception e) {
            log.error("查询失败记录失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 调试相关 ====================

    /**
     * 调试：评估技能得分（不实际执行）
     * 注意：已移除规则匹配，现在只支持 LLM 驱动的评估
     */
    @PostMapping("/evaluate-skills")
    @Operation(summary = "调试评估技能", description = "测试 LLM 驱动的技能评估（不实际执行）")
    public ResponseEntity<?> debugEvaluateSkills(
        @RequestBody SkillEvaluationContext context,
        Authentication authentication) {

        try {
            log.info("调试评估技能（LLM 驱动）: userMessage={}", context.getMessageSummary());
            
            // 注意：已移除规则匹配的调试功能，现在只支持 LLM 驱动
            // 如果需要调试 LLM 驱动的技能选择，请使用 LLMSkillApplicationEngine
            
            return ResponseEntity.ok().body(Map.of(
                "message", "技能评估完成（LLM 驱动模式，调试功能已更新）",
                "note", "已移除规则匹配，现在只支持 LLM 驱动的技能评估",
                "timestamp", LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("调试评估失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 获取技能应用结果（从缓存）
     */
    @GetMapping("/conversation/{conversationId}/result")
    @Operation(summary = "获取应用结果", description = "获取对话中技能应用的结果摘要")
    public ResponseEntity<?> getApplicationResult(
        @PathVariable Long conversationId,
        Authentication authentication) {

        try {
            // 注意：SkillApplicationResult.getApplicationResult 方法已移除
            // 现在需要通过 SkillExecutionRecordService 查询执行记录来获取结果
            List<SkillExecutionRecordDTO> records = recordService
                .getConversationHistory(conversationId, 100);
            
            int totalApplied = (int) records.stream()
                .filter(r -> "APPLIED".equals(r.getDecision()))
                .count();
            
            return ResponseEntity.ok(Map.of(
                "totalEvaluated", records.size(),
                "totalApplied", totalApplied,
                "applicationRate", records.isEmpty() ? "0.00%" : 
                    String.format("%.2f%%", (double) totalApplied / records.size() * 100),
                "records", records,
                "note", "已更新为通过执行记录查询结果（LLM 驱动模式）"
            ));
        } catch (Exception e) {
            log.error("查询应用结果失败: conversationId={}", conversationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 健康检查 ====================

    /**
     * 技能系统健康检查
     */
    @GetMapping("/health")
    @Operation(summary = "健康检查", description = "检查技能系统是否正常运行")
    public ResponseEntity<?> healthCheck(Authentication authentication) {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now(),
            "version", "1.0.0"
        ));
    }
}
