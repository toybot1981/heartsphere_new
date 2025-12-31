package com.heartsphere.controller;

import com.heartsphere.entity.Character;
import com.heartsphere.entity.ConversationLog;
import com.heartsphere.entity.Era;
import com.heartsphere.entity.Script;
import com.heartsphere.entity.World;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.ConversationLogRepository;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.repository.ScriptRepository;
import com.heartsphere.repository.WorldRepository;
import com.heartsphere.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/recycle-bin")
@CrossOrigin(origins = "*")
public class RecycleBinController {
    private static final Logger logger = LoggerFactory.getLogger(RecycleBinController.class);

    private final CharacterRepository characterRepository;
    private final WorldRepository worldRepository;
    private final EraRepository eraRepository;
    private final ScriptRepository scriptRepository;
    private final ConversationLogRepository conversationLogRepository;

    public RecycleBinController(
            CharacterRepository characterRepository,
            WorldRepository worldRepository,
            EraRepository eraRepository,
            ScriptRepository scriptRepository,
            ConversationLogRepository conversationLogRepository) {
        this.characterRepository = characterRepository;
        this.worldRepository = worldRepository;
        this.eraRepository = eraRepository;
        this.scriptRepository = scriptRepository;
        this.conversationLogRepository = conversationLogRepository;
    }

    // 获取回收站中的所有数据
    @GetMapping
    public ResponseEntity<Map<String, Object>> getRecycleBin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        logger.info(String.format("[RecycleBinController] 获取回收站数据，用户ID: %d", userId));

        Map<String, Object> recycleBin = new HashMap<>();
        recycleBin.put("characters", characterRepository.findDeletedByUser_Id(userId));
        recycleBin.put("worlds", worldRepository.findDeletedByUserId(userId));
        recycleBin.put("eras", eraRepository.findDeletedByUser_Id(userId));
        recycleBin.put("scripts", scriptRepository.findDeletedByUser_Id(userId));
        recycleBin.put("conversationLogs", conversationLogRepository.findByUserIdAndIsDeletedTrueOrderByDeletedAtDesc(userId));

        return ResponseEntity.ok(recycleBin);
    }

    // 恢复角色
    @PostMapping("/characters/{id}/restore")
    public ResponseEntity<Void> restoreCharacter(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Character not found"));

        if (!character.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        character.setIsDeleted(false);
        character.setDeletedAt(null);
        characterRepository.save(character);

        logger.info(String.format("[RecycleBinController] 恢复角色: ID=%d", id));
        return ResponseEntity.ok().build();
    }

    // 恢复世界
    @PostMapping("/worlds/{id}/restore")
    public ResponseEntity<Void> restoreWorld(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        World world = worldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("World not found"));

        if (!world.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        world.setIsDeleted(false);
        world.setDeletedAt(null);
        worldRepository.save(world);

        logger.info(String.format("[RecycleBinController] 恢复世界: ID=%d", id));
        return ResponseEntity.ok().build();
    }

    // 恢复时代
    @PostMapping("/eras/{id}/restore")
    public ResponseEntity<Void> restoreEra(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Era era = eraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Era not found"));

        if (!era.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        era.setIsDeleted(false);
        era.setDeletedAt(null);
        eraRepository.save(era);

        logger.info(String.format("[RecycleBinController] 恢复时代: ID=%d", id));
        return ResponseEntity.ok().build();
    }

    // 恢复剧本
    @PostMapping("/scripts/{id}/restore")
    public ResponseEntity<Void> restoreScript(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Script script = scriptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Script not found"));

        if (!script.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        script.setIsDeleted(false);
        script.setDeletedAt(null);
        scriptRepository.save(script);

        logger.info(String.format("[RecycleBinController] 恢复剧本: ID=%d", id));
        return ResponseEntity.ok().build();
    }

    // 永久删除角色
    @DeleteMapping("/characters/{id}")
    public ResponseEntity<Void> permanentlyDeleteCharacter(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Character not found"));

        if (!character.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        characterRepository.delete(character);
        logger.info(String.format("[RecycleBinController] 永久删除角色: ID=%d", id));
        return ResponseEntity.noContent().build();
    }

    // 永久删除世界
    @DeleteMapping("/worlds/{id}")
    public ResponseEntity<Void> permanentlyDeleteWorld(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        World world = worldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("World not found"));

        if (!world.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        worldRepository.delete(world);
        logger.info(String.format("[RecycleBinController] 永久删除世界: ID=%d", id));
        return ResponseEntity.noContent().build();
    }

    // 永久删除时代
    @DeleteMapping("/eras/{id}")
    public ResponseEntity<Void> permanentlyDeleteEra(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Era era = eraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Era not found"));

        if (!era.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        eraRepository.delete(era);
        logger.info(String.format("[RecycleBinController] 永久删除时代: ID=%d", id));
        return ResponseEntity.noContent().build();
    }

    // 永久删除剧本
    @DeleteMapping("/scripts/{id}")
    public ResponseEntity<Void> permanentlyDeleteScript(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Script script = scriptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Script not found"));

        if (!script.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        scriptRepository.delete(script);
        logger.info(String.format("[RecycleBinController] 永久删除剧本: ID=%d", id));
        return ResponseEntity.noContent().build();
    }

    // 恢复对话日志
    @PostMapping("/conversation-logs/{id}/restore")
    public ResponseEntity<Void> restoreConversationLog(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        ConversationLog log = conversationLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation log not found"));

        if (!log.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        log.restore();
        conversationLogRepository.save(log);

        logger.info(String.format("[RecycleBinController] 恢复对话日志: ID=%d", id));
        return ResponseEntity.ok().build();
    }

    // 永久删除对话日志
    @DeleteMapping("/conversation-logs/{id}")
    public ResponseEntity<Void> permanentlyDeleteConversationLog(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        ConversationLog log = conversationLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation log not found"));

        if (!log.getUserId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        conversationLogRepository.delete(log);
        logger.info(String.format("[RecycleBinController] 永久删除对话日志: ID=%d", id));
        return ResponseEntity.noContent().build();
    }
}

