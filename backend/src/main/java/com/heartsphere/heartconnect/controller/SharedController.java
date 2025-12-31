package com.heartsphere.heartconnect.controller;

import com.heartsphere.dto.ApiResponse;
import com.heartsphere.dto.EraDTO;
import com.heartsphere.dto.WorldDTO;
import com.heartsphere.heartconnect.context.SharedModeContext;
import com.heartsphere.heartconnect.dto.CreateWarmMessageRequest;
import com.heartsphere.heartconnect.dto.WarmMessageDTO;
import com.heartsphere.heartconnect.entity.HeartSphereShareScope;
import com.heartsphere.heartconnect.entity.HeartSphereShareConfig;
import com.heartsphere.heartconnect.repository.HeartSphereShareScopeRepository;
import com.heartsphere.heartconnect.repository.HeartSphereShareConfigRepository;
import com.heartsphere.heartconnect.service.WarmMessageService;
import com.heartsphere.heartconnect.storage.TemporaryDataStorage;
import com.heartsphere.memory.dto.SaveMessageRequest;
import com.heartsphere.memory.model.ChatMessage;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.World;
import com.heartsphere.entity.Character;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.WorldRepository;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.utils.DTOMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 共享模式控制器
 * 专门用于查看他人共享的心域内容
 */
@RestController
@RequestMapping("/api/heartconnect/shared")
@CrossOrigin(origins = "*")
public class SharedController {
    
    @Autowired
    private WarmMessageService warmMessageService;
    
    @Autowired
    private WorldRepository worldRepository;
    
    @Autowired
    private EraRepository eraRepository;
    
    @Autowired
    private HeartSphereShareScopeRepository shareScopeRepository;
    
    @Autowired
    private HeartSphereShareConfigRepository shareConfigRepository;
    
    @Autowired
    private CharacterRepository characterRepository;
    
    @Autowired(required = false)
    private TemporaryDataStorage temporaryDataStorage;
    
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SharedController.class);
    
    /**
     * 获取共享心域的世界列表（共享模式）
     */
    @GetMapping("/worlds")
    public ResponseEntity<List<WorldDTO>> getSharedWorlds() {
        log.info("========== 共享模式：获取共享世界列表 ==========");
        
        // 验证共享模式是否激活
        if (!SharedModeContext.isActive()) {
            log.warn("❌ 共享模式未激活，拒绝访问");
            return ResponseEntity.status(403).build();
        }
        
        Long shareConfigId = SharedModeContext.getShareConfigId();
        Long ownerId = SharedModeContext.getOwnerId(); // 共享配置主人的用户ID
        Long visitorId = SharedModeContext.getVisitorId(); // 访问者ID（仅用于日志）
        
        log.info("========== 共享模式：获取共享世界列表 ==========");
        log.info("共享配置ID: {}", shareConfigId);
        log.info("主人用户ID (ownerId): {} - 使用此ID查询主人的数据", ownerId);
        log.info("访问者用户ID (visitorId): {} - 仅用于权限验证，不用于数据查询", visitorId);
        
        if (shareConfigId == null || ownerId == null) {
            log.warn("❌ 共享模式上下文缺少必要信息: shareConfigId={}, ownerId={}", shareConfigId, ownerId);
            return ResponseEntity.status(400).build();
        }
        
        // 获取共享配置，检查共享类型
        HeartSphereShareConfig shareConfig = shareConfigRepository.findById(shareConfigId).orElse(null);
        if (shareConfig == null) {
            log.warn("❌ 共享配置不存在: shareConfigId={}", shareConfigId);
            return ResponseEntity.status(404).build();
        }
        
        // ⚠️ 重要：使用主人的用户ID (ownerId) 查询数据，而不是访问者的ID
        log.info("查询主人的世界数据: ownerId={}, shareType={}", ownerId, shareConfig.getShareType());
        
        List<World> userWorlds;
        
        // 如果共享类型是 ALL，返回所有世界；否则根据共享范围过滤
        if (shareConfig.getShareType() == HeartSphereShareConfig.ShareType.ALL) {
            log.info("共享类型为 ALL，返回主人的所有世界");
            userWorlds = worldRepository.findByUserId(ownerId);
        } else {
            // 获取共享范围中配置的世界ID
            List<HeartSphereShareScope> scopes = shareScopeRepository.findByShareConfigId(shareConfigId);
            log.info("共享范围配置数量: {}", scopes.size());
            
            Set<Long> sharedWorldIds = scopes.stream()
                .filter(scope -> scope.getScopeType() == HeartSphereShareScope.ScopeType.WORLD)
                .map(HeartSphereShareScope::getScopeId)
                .collect(Collectors.toSet());
            
            log.info("共享世界ID列表: {}", sharedWorldIds);
            
            userWorlds = worldRepository.findByUserId(ownerId).stream()
                .filter(world -> sharedWorldIds.contains(world.getId()))
                .collect(Collectors.toList());
        }
        
        log.info("主人的共享世界数量: {}", userWorlds.size());
        userWorlds.forEach(world -> log.info("  - 世界ID: {}, 名称: {}", world.getId(), world.getName()));
        
        List<WorldDTO> worldDTOs = userWorlds.stream()
            .map(DTOMapper::toWorldDTO)
            .collect(Collectors.toList());
        
        log.info("✅ 返回世界DTO数量: {}", worldDTOs.size());
        return ResponseEntity.ok(worldDTOs);
    }
    
    /**
     * 获取共享心域的场景列表（共享模式）
     */
    @GetMapping("/eras")
    public ResponseEntity<List<EraDTO>> getSharedEras() {
        log.info("========== 共享模式：获取共享场景列表 ==========");
        
        // 验证共享模式是否激活
        if (!SharedModeContext.isActive()) {
            log.warn("❌ 共享模式未激活，拒绝访问");
            return ResponseEntity.status(403).build();
        }
        
        Long shareConfigId = SharedModeContext.getShareConfigId();
        Long ownerId = SharedModeContext.getOwnerId(); // 共享配置主人的用户ID
        Long visitorId = SharedModeContext.getVisitorId(); // 访问者ID（仅用于日志）
        
        log.info("========== 共享模式：获取共享场景列表 ==========");
        log.info("共享配置ID: {}", shareConfigId);
        log.info("主人用户ID (ownerId): {} - 使用此ID查询主人的数据", ownerId);
        log.info("访问者用户ID (visitorId): {} - 仅用于权限验证，不用于数据查询", visitorId);
        
        if (shareConfigId == null || ownerId == null) {
            log.warn("❌ 共享模式上下文缺少必要信息: shareConfigId={}, ownerId={}", shareConfigId, ownerId);
            return ResponseEntity.status(400).build();
        }
        
        // 获取共享配置，检查共享类型
        HeartSphereShareConfig shareConfig = shareConfigRepository.findById(shareConfigId).orElse(null);
        if (shareConfig == null) {
            log.warn("❌ 共享配置不存在: shareConfigId={}", shareConfigId);
            return ResponseEntity.status(404).build();
        }
        
        // ⚠️ 重要：使用主人的用户ID (ownerId) 查询数据，而不是访问者的ID
        log.info("查询主人的场景数据: ownerId={}, shareType={}", ownerId, shareConfig.getShareType());
        
        List<Era> eras;
        
        // 如果共享类型是 ALL，返回所有场景；否则根据共享范围过滤
        if (shareConfig.getShareType() == HeartSphereShareConfig.ShareType.ALL) {
            log.info("共享类型为 ALL，返回主人的所有场景");
            eras = eraRepository.findByUser_Id(ownerId);
        } else {
            // 获取共享范围中配置的场景ID
            List<HeartSphereShareScope> scopes = shareScopeRepository.findByShareConfigId(shareConfigId);
            log.info("共享范围配置数量: {}", scopes.size());
            
            Set<Long> sharedEraIds = scopes.stream()
                .filter(scope -> scope.getScopeType() == HeartSphereShareScope.ScopeType.ERA)
                .map(HeartSphereShareScope::getScopeId)
                .collect(Collectors.toSet());
            
            log.info("共享场景ID列表: {}", sharedEraIds);
            
            eras = eraRepository.findByUser_Id(ownerId).stream()
                .filter(era -> sharedEraIds.contains(era.getId()))
                .collect(Collectors.toList());
        }
        
        log.info("主人的共享场景数量: {}", eras.size());
        eras.forEach(era -> log.info("  - 场景ID: {}, 名称: {}, 世界ID: {}", era.getId(), era.getName(), era.getWorld() != null ? era.getWorld().getId() : "null"));
        
        List<EraDTO> eraDTOs = eras.stream()
            .map(DTOMapper::toEraDTO)
            .collect(Collectors.toList());
        
        log.info("✅ 返回场景DTO数量: {}", eraDTOs.size());
        return ResponseEntity.ok(eraDTOs);
    }
    
    /**
     * 获取指定世界的共享场景列表（共享模式）
     */
    @GetMapping("/worlds/{worldId}/eras")
    public ResponseEntity<List<EraDTO>> getSharedErasByWorld(@PathVariable Long worldId) {
        log.info("========== 共享模式：获取指定世界的共享场景列表 ==========");
        log.info("请求参数: worldId={}", worldId);
        
        // 验证共享模式是否激活
        if (!SharedModeContext.isActive()) {
            log.warn("❌ 共享模式未激活，拒绝访问");
            return ResponseEntity.status(403).build();
        }
        
        Long shareConfigId = SharedModeContext.getShareConfigId();
        Long ownerId = SharedModeContext.getOwnerId();
        
        log.info("共享模式上下文: shareConfigId={}, ownerId={}", shareConfigId, ownerId);
        
        if (shareConfigId == null || ownerId == null) {
            log.warn("❌ 共享模式上下文缺少必要信息: shareConfigId={}, ownerId={}", shareConfigId, ownerId);
            return ResponseEntity.status(400).build();
        }
        
        // 获取共享配置，检查共享类型
        HeartSphereShareConfig shareConfig = shareConfigRepository.findById(shareConfigId).orElse(null);
        if (shareConfig == null) {
            log.warn("❌ 共享配置不存在: shareConfigId={}", shareConfigId);
            return ResponseEntity.status(404).build();
        }
        
        List<Era> eras;
        
        // 如果共享类型是 ALL，返回指定世界的所有场景；否则根据共享范围过滤
        if (shareConfig.getShareType() == HeartSphereShareConfig.ShareType.ALL) {
            log.info("共享类型为 ALL，返回指定世界的所有场景: worldId={}", worldId);
            eras = eraRepository.findByWorld_IdAndUser_Id(worldId, ownerId);
        } else {
            // 获取共享范围中配置的场景ID
            List<HeartSphereShareScope> scopes = shareScopeRepository.findByShareConfigId(shareConfigId);
            log.info("共享范围配置数量: {}", scopes.size());
            
            Set<Long> sharedEraIds = scopes.stream()
                .filter(scope -> scope.getScopeType() == HeartSphereShareScope.ScopeType.ERA)
                .map(HeartSphereShareScope::getScopeId)
                .collect(Collectors.toSet());
            
            log.info("共享场景ID列表: {}", sharedEraIds);
            
            // 只返回共享的场景，且属于主人，且在指定世界中
            eras = eraRepository.findByWorld_IdAndUser_Id(worldId, ownerId).stream()
                .filter(era -> sharedEraIds.contains(era.getId()))
                .collect(Collectors.toList());
        }
        
        log.info("主人的共享场景数量（世界ID={}）: {}", worldId, eras.size());
        eras.forEach(era -> log.info("  - 场景ID: {}, 名称: {}", era.getId(), era.getName()));
        
        List<EraDTO> eraDTOs = eras.stream()
            .map(DTOMapper::toEraDTO)
            .collect(Collectors.toList());
        
        log.info("✅ 返回场景DTO数量: {}", eraDTOs.size());
        return ResponseEntity.ok(eraDTOs);
    }
    
    /**
     * 获取指定场景的角色列表（共享模式）
     */
    @GetMapping("/eras/{eraId}/characters")
    public ResponseEntity<List<com.heartsphere.dto.CharacterDTO>> getSharedCharactersByEra(
            @PathVariable("eraId") @org.springframework.lang.NonNull Long eraId) {
        log.info("========== 共享模式：获取指定场景的角色列表 ==========");
        log.info("请求参数: eraId={}", eraId);
        
        // 验证共享模式是否激活
        if (!SharedModeContext.isActive()) {
            log.warn("❌ 共享模式未激活，拒绝访问");
            return ResponseEntity.status(403).build();
        }
        
        Long shareConfigId = SharedModeContext.getShareConfigId();
        Long ownerId = SharedModeContext.getOwnerId();
        
        log.info("共享模式上下文: shareConfigId={}, ownerId={}", shareConfigId, ownerId);
        
        if (shareConfigId == null || ownerId == null) {
            log.warn("❌ 共享模式上下文缺少必要信息: shareConfigId={}, ownerId={}", shareConfigId, ownerId);
            return ResponseEntity.status(400).build();
        }
        
        // 获取共享配置，检查共享类型
        HeartSphereShareConfig shareConfig = shareConfigRepository.findById(shareConfigId).orElse(null);
        if (shareConfig == null) {
            log.warn("❌ 共享配置不存在: shareConfigId={}", shareConfigId);
            return ResponseEntity.status(404).build();
        }
        
        // 如果共享类型不是 ALL，需要验证场景是否在共享范围内
        if (shareConfig.getShareType() != HeartSphereShareConfig.ShareType.ALL) {
            List<HeartSphereShareScope> scopes = shareScopeRepository.findByShareConfigId(shareConfigId);
            Set<Long> sharedEraIds = scopes.stream()
                .filter(scope -> scope.getScopeType() == HeartSphereShareScope.ScopeType.ERA)
                .map(HeartSphereShareScope::getScopeId)
                .collect(Collectors.toSet());
            
            log.info("共享场景ID列表: {}", sharedEraIds);
            
            if (!sharedEraIds.contains(eraId)) {
                log.warn("❌ 场景不在共享范围内: eraId={}, sharedEraIds={}", eraId, sharedEraIds);
                return ResponseEntity.status(403).build();
            }
        } else {
            log.info("共享类型为 ALL，允许访问所有场景的角色: eraId={}", eraId);
        }
        
        // 验证场景属于主人
        Era era = eraRepository.findById(eraId).orElse(null);
        if (era == null || era.getUser() == null || !era.getUser().getId().equals(ownerId)) {
            log.warn("❌ 场景不属于主人: eraId={}, ownerId={}", eraId, ownerId);
            return ResponseEntity.status(403).build();
        }
        
        // ⚠️ 重要：使用主人的用户ID (ownerId) 查询数据，而不是访问者的ID
        log.info("查询主人的场景角色数据: eraId={}, ownerId={}", eraId, ownerId);
        List<Character> characters = characterRepository.findByEra_Id(eraId).stream()
            .filter(character -> character.getUser().getId().equals(ownerId))
            .collect(Collectors.toList());
        
        log.info("主人的场景角色数量: {}", characters.size());
        characters.forEach(character -> log.info("  - 角色ID: {}, 名称: {}, 所属用户ID: {}", 
            character.getId(), character.getName(), character.getUser().getId()));
        
        List<com.heartsphere.dto.CharacterDTO> characterDTOs = characters.stream()
            .map(DTOMapper::toCharacterDTO)
            .collect(Collectors.toList());
        
        log.info("✅ 返回角色DTO数量: {}", characterDTOs.size());
        return ResponseEntity.ok(characterDTOs);
    }
    
    /**
     * 保存聊天消息（共享模式）
     * 消息会保存到临时存储，不会影响主人的数据
     */
    @PostMapping("/chat/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<ChatMessage>> saveChatMessage(
            @PathVariable("sessionId") String sessionId,
            @RequestBody SaveMessageRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("========== 共享模式：保存聊天消息 ==========");
        log.info("sessionId: {}, role: {}, content: {}", sessionId, request.getRole(), request.getContent());
        
        // 验证共享模式是否激活
        if (!SharedModeContext.isActive()) {
            log.warn("❌ 共享模式未激活，拒绝访问");
            return ResponseEntity.status(403).build();
        }
        
        Long shareConfigId = SharedModeContext.getShareConfigId();
        Long visitorId = SharedModeContext.getVisitorId();
        
        if (shareConfigId == null || visitorId == null) {
            log.warn("❌ 共享模式上下文缺少必要信息: shareConfigId={}, visitorId={}", shareConfigId, visitorId);
            return ResponseEntity.status(400).build();
        }
        
        if (temporaryDataStorage == null) {
            log.error("❌ TemporaryDataStorage 未初始化");
            return ResponseEntity.status(500).body(ApiResponse.error("临时存储服务未初始化"));
        }
        
        try {
            // 创建消息对象
            ChatMessage message = ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .sessionId(sessionId)
                .userId(visitorId.toString())
                .role(request.getRole())
                .content(request.getContent())
                .metadata(request.getMetadata())
                .timestamp(System.currentTimeMillis())
                .importance(request.getImportance() != null ? request.getImportance() : 0.5)
                .build();
            
            // 保存到临时存储
            temporaryDataStorage.save(
                shareConfigId.toString(),
                visitorId.toString(),
                "dialogue",
                message
            );
            
            log.info("✅ 共享模式消息已保存: messageId={}, sessionId={}, shareConfigId={}, visitorId={}", 
                message.getId(), sessionId, shareConfigId, visitorId);
            
            return ResponseEntity.status(201).body(ApiResponse.success(message));
        } catch (Exception e) {
            log.error("❌ 保存共享模式消息失败: sessionId={}", sessionId, e);
            return ResponseEntity.status(500).body(ApiResponse.error("保存消息失败: " + e.getMessage()));
        }
    }
    
    /**
     * 获取聊天消息历史（共享模式）
     * 从临时存储中获取消息列表
     */
    @GetMapping("/chat/sessions/{sessionId}/messages")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getChatMessages(
            @PathVariable("sessionId") String sessionId,
            @RequestParam(defaultValue = "100") int limit,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("========== 共享模式：获取聊天消息历史 ==========");
        log.info("sessionId: {}, limit: {}", sessionId, limit);
        
        // 验证共享模式是否激活
        if (!SharedModeContext.isActive()) {
            log.warn("❌ 共享模式未激活，拒绝访问");
            return ResponseEntity.status(403).build();
        }
        
        Long shareConfigId = SharedModeContext.getShareConfigId();
        Long visitorId = SharedModeContext.getVisitorId();
        
        if (shareConfigId == null || visitorId == null) {
            log.warn("❌ 共享模式上下文缺少必要信息: shareConfigId={}, visitorId={}", shareConfigId, visitorId);
            return ResponseEntity.status(400).build();
        }
        
        if (temporaryDataStorage == null) {
            log.error("❌ TemporaryDataStorage 未初始化");
            return ResponseEntity.status(500).body(ApiResponse.error("临时存储服务未初始化"));
        }
        
        try {
            // 从临时存储获取消息
            List<ChatMessage> allMessages = temporaryDataStorage.get(
                shareConfigId.toString(),
                visitorId.toString(),
                "dialogue",
                ChatMessage.class
            );
            
            // 过滤出当前会话的消息，并按时间排序
            List<ChatMessage> sessionMessages = allMessages.stream()
                .filter(msg -> sessionId.equals(msg.getSessionId()))
                .sorted(Comparator.comparing(ChatMessage::getTimestamp))
                .limit(limit)
                .collect(Collectors.toList());
            
            log.info("✅ 获取共享模式消息成功: sessionId={}, 消息数量={}", sessionId, sessionMessages.size());
            
            Map<String, Object> result = new HashMap<>();
            result.put("messages", sessionMessages);
            result.put("total", sessionMessages.size());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("❌ 获取共享模式消息失败: sessionId={}", sessionId, e);
            return ResponseEntity.status(500).body(ApiResponse.error("获取消息失败: " + e.getMessage()));
        }
    }
    
    /**
     * 清空聊天会话（共享模式）
     */
    @DeleteMapping("/chat/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<Void>> clearChatSession(
            @PathVariable("sessionId") String sessionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("========== 共享模式：清空聊天会话 ==========");
        log.info("sessionId: {}", sessionId);
        
        // 验证共享模式是否激活
        if (!SharedModeContext.isActive()) {
            log.warn("❌ 共享模式未激活，拒绝访问");
            return ResponseEntity.status(403).build();
        }
        
        Long shareConfigId = SharedModeContext.getShareConfigId();
        Long visitorId = SharedModeContext.getVisitorId();
        
        if (shareConfigId == null || visitorId == null) {
            log.warn("❌ 共享模式上下文缺少必要信息: shareConfigId={}, visitorId={}", shareConfigId, visitorId);
            return ResponseEntity.status(400).build();
        }
        
        if (temporaryDataStorage == null) {
            log.error("❌ TemporaryDataStorage 未初始化");
            return ResponseEntity.status(500).body(ApiResponse.error("临时存储服务未初始化"));
        }
        
        try {
            // 从临时存储获取消息
            List<ChatMessage> allMessages = temporaryDataStorage.get(
                shareConfigId.toString(),
                visitorId.toString(),
                "dialogue",
                ChatMessage.class
            );
            
            // 过滤出需要保留的消息（非当前会话的消息）
            List<ChatMessage> messagesToKeep = allMessages.stream()
                .filter(msg -> !sessionId.equals(msg.getSessionId()))
                .collect(Collectors.toList());
            
            // 清除所有消息，然后重新保存需要保留的消息
            temporaryDataStorage.clear(shareConfigId.toString(), visitorId.toString());
            for (ChatMessage msg : messagesToKeep) {
                temporaryDataStorage.save(
                    shareConfigId.toString(),
                    visitorId.toString(),
                    "dialogue",
                    msg
                );
            }
            
            log.info("✅ 清空共享模式会话成功: sessionId={}", sessionId);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (Exception e) {
            log.error("❌ 清空共享模式会话失败: sessionId={}", sessionId, e);
            return ResponseEntity.status(500).body(ApiResponse.error("清空会话失败: " + e.getMessage()));
        }
    }
    
    /**
     * 创建暖心留言
     */
    @PostMapping("/{shareConfigId}/warm-message")
    public ApiResponse<WarmMessageDTO> createWarmMessage(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long shareConfigId,
            @RequestBody CreateWarmMessageRequest request) {
        WarmMessageDTO message = warmMessageService.createWarmMessage(
                shareConfigId, userDetails.getId(), request);
        return ApiResponse.success("留言发送成功", message);
    }
    
    /**
     * 获取暖心留言列表（主人查看）
     */
    @GetMapping("/{shareConfigId}/warm-messages")
    public ApiResponse<List<WarmMessageDTO>> getWarmMessages(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long shareConfigId) {
        List<WarmMessageDTO> messages = warmMessageService.getWarmMessages(
                shareConfigId, userDetails.getId());
        return ApiResponse.success(messages);
    }
}

