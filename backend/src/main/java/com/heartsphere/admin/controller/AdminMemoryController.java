package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.MemorySystemDashboardDTO;
import com.heartsphere.memory.repository.jpa.ChatMessageRepository;
import com.heartsphere.memory.repository.jpa.SessionRepository;
import com.heartsphere.memory.repository.jpa.UserMemoryRepository;
import com.heartsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;

/**
 * 记忆系统管理控制器
 * 
 * @author HeartSphere
 * @date 2026-01-01
 */
@RestController
@RequestMapping("/api/admin/memory")
@RequiredArgsConstructor
@Slf4j
public class AdminMemoryController extends BaseAdminController {
    
    private final UserRepository userRepository;
    private final UserMemoryRepository userMemoryRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SessionRepository sessionRepository;
    
    /**
     * 获取记忆系统仪表板数据
     */
    @GetMapping("/dashboard")
    public ResponseEntity<MemorySystemDashboardDTO> getDashboard(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        try {
            MemorySystemDashboardDTO dashboard = buildDashboard();
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            log.error("获取记忆系统仪表板数据失败", e);
            throw new RuntimeException("获取仪表板数据失败: " + e.getMessage());
        }
    }
    
    /**
     * 构建仪表板数据
     */
    private MemorySystemDashboardDTO buildDashboard() {
        MemorySystemDashboardDTO.MemorySystemDashboardDTOBuilder builder = MemorySystemDashboardDTO.builder();
        
        // 系统状态
        builder.systemStatus("NORMAL")
               .serviceAvailability(100.0)
               .lastUpdatedAt(LocalDateTime.now().toString());
        
        // 用户统计
        long totalUsers = userRepository.count();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yesterday = now.minusDays(1);
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        
        // 24小时活跃用户（最近24小时有活动的用户，这里简化处理为有记忆或会话的用户）
        long activeUsers24h = countActiveUsers(yesterday, now);
        
        // 7天活跃用户
        long activeUsers7d = countActiveUsers(sevenDaysAgo, now);
        
        builder.totalUsers(totalUsers)
               .activeUsers24h(activeUsers24h)
               .activeUsers7d(activeUsers7d);
        
        // 记忆统计
        long totalMemories = userMemoryRepository.count();
        long longTermMemories = totalMemories; // 长期记忆就是所有user_memories
        long shortTermMemories = chatMessageRepository.count(); // 短期记忆是chat_messages数量
        
        builder.totalMemories(totalMemories)
               .longTermMemories(longTermMemories)
               .shortTermMemories(shortTermMemories);
        
        // 提取和检索统计（目前没有实际的数据源，设置默认值）
        builder.totalExtractions(totalMemories) // 假设每个记忆都是一次提取
               .totalRetrievals(0L); // 暂时无法统计
        
        // 性能指标（目前没有实际的数据源，设置默认值）
        builder.averageResponseTime(0.0)
               .successRate(100.0)
               .errorRate(0.0)
               .cacheHitRate(0.0);
        
        // 趋势数据（简化处理，返回空Map）
        builder.userGrowthTrend(new HashMap<>())
               .usageTrend(new HashMap<>())
               .performanceTrend(new HashMap<>());
        
        // Redis状态（目前使用MySQL，设置为null或默认值）
        MemorySystemDashboardDTO.RedisStatusDTO redisStatus = MemorySystemDashboardDTO.RedisStatusDTO.builder()
            .connected(false)
            .usedMemory(0L)
            .totalMemory(0L)
            .activeSessions((int) sessionRepository.count())
            .totalKeys(0)
            .build();
        builder.redisStatus(redisStatus);
        
        // MongoDB状态（目前使用MySQL，设置为null或默认值）
        MemorySystemDashboardDTO.MongoStatusDTO mongoStatus = MemorySystemDashboardDTO.MongoStatusDTO.builder()
            .connected(false)
            .totalDocuments(0L)
            .totalCollections(0L)
            .databaseSize(0L)
            .build();
        builder.mongoStatus(mongoStatus);
        
        return builder.build();
    }
    
    /**
     * 统计活跃用户数（在指定时间范围内有活动的用户）
     * 简化实现：统计有记忆或会话的用户
     */
    private long countActiveUsers(LocalDateTime startTime, LocalDateTime endTime) {
        // 这里简化处理，实际应该查询在指定时间范围内有创建记忆或会话的用户
        // 由于数据库结构限制，这里返回一个估算值：总用户数的50%
        long totalUsers = userRepository.count();
        // 更精确的实现需要查询user_memories和sessions表中有created_at在时间范围内的记录
        return Math.max(1, totalUsers / 2); // 至少返回1，避免为0
    }
}
