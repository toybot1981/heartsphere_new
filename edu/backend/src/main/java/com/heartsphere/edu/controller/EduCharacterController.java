package com.heartsphere.edu.controller;

import com.heartsphere.edu.dto.*;
import com.heartsphere.edu.entity.EduCharacter;
import com.heartsphere.edu.service.DigitalHumanService;
import com.heartsphere.shared.dto.ApiResponse;
import com.heartsphere.shared.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 教育版数字人角色管理控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/edu/characters")
@RequiredArgsConstructor
public class EduCharacterController {
    
    private final DigitalHumanService digitalHumanService;
    
    /**
     * 创建数字人角色
     */
    @PostMapping
    public ResponseEntity<ApiResponse<EduCharacter>> createCharacter(
            @Valid @RequestBody CreateCharacterRequest request) {
        try {
            log.info("创建数字人角色请求: name={}, type={}", request.getName(), request.getCharacterType());
            EduCharacter character = digitalHumanService.createCharacter(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("创建数字人角色成功", character));
        } catch (Exception e) {
            log.error("创建数字人角色失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("创建数字人角色失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取数字人角色列表（支持筛选、分页）
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<EduCharacter>>> getCharacters(
            @RequestParam(required = false) String characterType,
            @RequestParam(required = false) String ageGroup,
            @RequestParam(required = false) List<String> subjectTags,
            @RequestParam(required = false) String difficultyLevel,
            @RequestParam(required = false) String searchKeyword,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Boolean isEnabled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            CharacterQuery query = new CharacterQuery();
            if (characterType != null) {
                try {
                    query.setCharacterType(EduCharacter.CharacterType.valueOf(characterType.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(ApiResponse.error(400, "无效的角色类型: " + characterType));
                }
            }
            query.setAgeGroup(ageGroup);
            query.setSubjectTags(subjectTags);
            if (difficultyLevel != null) {
                try {
                    query.setDifficultyLevel(EduCharacter.DifficultyLevel.valueOf(difficultyLevel.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(ApiResponse.error(400, "无效的难度等级: " + difficultyLevel));
                }
            }
            query.setSearchKeyword(searchKeyword);
            query.setStudentId(studentId);
            query.setTeacherId(teacherId);
            query.setIsEnabled(isEnabled);
            
            Pageable pageable = PageRequest.of(page, size);
            Page<EduCharacter> characters = digitalHumanService.getCharacters(query, pageable);
            
            return ResponseEntity.ok(ApiResponse.success("获取数字人角色列表成功", characters));
        } catch (Exception e) {
            log.error("获取数字人角色列表失败", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取数字人角色列表失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取数字人角色详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EduCharacter>> getCharacterById(@PathVariable Long id) {
        try {
            EduCharacter character = digitalHumanService.getCharacterById(id);
            return ResponseEntity.ok(ApiResponse.success("获取数字人角色详情成功", character));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (Exception e) {
            log.error("获取数字人角色详情失败: id={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取数字人角色详情失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取推荐数字人角色
     */
    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<CharacterRecommendation>>> getRecommendations(
            @RequestParam Long studentId,
            @RequestParam(required = false) String ageGroup,
            @RequestParam(required = false) List<String> subjectInterests,
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @RequestParam(required = false, defaultValue = "true") Boolean includeHistory) {
        try {
            RecommendationCriteria criteria = new RecommendationCriteria();
            criteria.setAgeGroup(ageGroup);
            criteria.setSubjectInterests(subjectInterests);
            criteria.setLimit(limit);
            criteria.setIncludeHistory(includeHistory);
            
            List<CharacterRecommendation> recommendations = digitalHumanService.recommendCharacters(studentId, criteria);
            return ResponseEntity.ok(ApiResponse.success("获取推荐角色成功", recommendations));
        } catch (Exception e) {
            log.error("获取推荐角色失败: studentId={}", studentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取推荐角色失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取数字人角色统计信息
     */
    @GetMapping("/{id}/statistics")
    public ResponseEntity<ApiResponse<CharacterStatistics>> getCharacterStatistics(@PathVariable Long id) {
        try {
            CharacterStatistics statistics = digitalHumanService.getCharacterStatistics(id);
            return ResponseEntity.ok(ApiResponse.success("获取角色统计信息成功", statistics));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (Exception e) {
            log.error("获取角色统计信息失败: id={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取角色统计信息失败: " + e.getMessage()));
        }
    }
    
    /**
     * 更新数字人角色信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EduCharacter>> updateCharacter(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCharacterRequest request) {
        try {
            EduCharacter character = digitalHumanService.updateCharacter(id, request);
            return ResponseEntity.ok(ApiResponse.success("更新数字人角色成功", character));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (Exception e) {
            log.error("更新数字人角色失败: id={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("更新数字人角色失败: " + e.getMessage()));
        }
    }
    
    /**
     * 删除数字人角色（软删除）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCharacter(@PathVariable Long id) {
        try {
            digitalHumanService.deleteCharacter(id);
            return ResponseEntity.ok(ApiResponse.success("删除数字人角色成功", null));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(404, e.getMessage()));
        } catch (Exception e) {
            log.error("删除数字人角色失败: id={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("删除数字人角色失败: " + e.getMessage()));
        }
    }
}
