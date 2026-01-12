package com.heartsphere.skill.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.skill.dto.SkillExecutionRequest;
import com.heartsphere.skill.dto.SkillExecutionResultDTO;
import com.heartsphere.skill.service.SkillExecutor;
import com.heartsphere.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 技能执行 Controller
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/skills/execute")
@RequiredArgsConstructor
public class SkillExecutionController {
    
    private final SkillExecutor skillExecutor;
    
    /**
     * 执行技能
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SkillExecutionResultDTO>> executeSkill(
            @RequestBody SkillExecutionRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        // 构建执行上下文
        SkillExecutor.SkillExecutionContext context = SkillExecutor.SkillExecutionContext.builder()
            .characterId(request.getCharacterId())
            .userId(userDetails.getId())
            .additionalContext(request.getAdditionalContext())
            .build();
        
        // 执行技能
        SkillExecutor.SkillExecutionResult result = skillExecutor.execute(
            request.getSkillId(),
            request.getParameters(),
            context
        );
        
        // 转换为 DTO
        SkillExecutionResultDTO dto = SkillExecutionResultDTO.builder()
            .skillId(result.getSkillId())
            .success(result.isSuccess())
            .result(result.getResult())
            .errorMessage(result.getErrorMessage())
            .executionTimeMs(result.getExecutionTimeMs())
            .build();
        
        if (result.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.success(dto));
        } else {
            return ResponseEntity.ok(ApiResponse.error(500, result.getErrorMessage()));
        }
    }
}
