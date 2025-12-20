package com.heartsphere.controller;

import com.heartsphere.dto.ScriptDTO;
import com.heartsphere.entity.Script;
import com.heartsphere.entity.User;
import com.heartsphere.entity.World;
import com.heartsphere.entity.Era;
import com.heartsphere.repository.ScriptRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.repository.WorldRepository;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.admin.entity.SystemScript;
import com.heartsphere.admin.repository.SystemScriptRepository;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.utils.DTOMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/scripts")
public class ScriptController {

    private static final Logger logger = LoggerFactory.getLogger(ScriptController.class);

    @Autowired
    private ScriptRepository scriptRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private EraRepository eraRepository;

    @Autowired
    private SystemScriptRepository systemScriptRepository;

    // 获取当前用户的所有剧本
    @GetMapping
    public ResponseEntity<List<ScriptDTO>> getAllScripts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Script> scripts = scriptRepository.findByUser_Id(userDetails.getId());
        List<ScriptDTO> scriptDTOs = scripts.stream()
            .map(DTOMapper::toScriptDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(scriptDTOs);
    }

    // 获取指定ID的剧本
    @GetMapping("/{id}")
    public ResponseEntity<ScriptDTO> getScriptById(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Script script = scriptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Script not found with id: " + id));

        // 确保用户只能访问自己的剧本
        if (!script.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(DTOMapper.toScriptDTO(script));
    }

    // 获取指定世界的所有剧本
    @GetMapping("/world/{worldId}")
    public ResponseEntity<List<ScriptDTO>> getScriptsByWorldId(@PathVariable Long worldId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Script> scripts = scriptRepository.findByWorld_Id(worldId);
        // 过滤出当前用户的剧本
        List<ScriptDTO> scriptDTOs = scripts.stream()
            .filter(script -> script.getUser().getId().equals(userDetails.getId()))
            .map(DTOMapper::toScriptDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(scriptDTOs);
    }

    // 获取指定时代的所有剧本
    @GetMapping("/era/{eraId}")
    public ResponseEntity<List<ScriptDTO>> getScriptsByEraId(@PathVariable Long eraId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Script> scripts = scriptRepository.findByEra_Id(eraId);
        // 过滤出当前用户的剧本
        List<ScriptDTO> scriptDTOs = scripts.stream()
            .filter(script -> script.getUser().getId().equals(userDetails.getId()))
            .map(DTOMapper::toScriptDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(scriptDTOs);
    }

    // 创建新剧本
    @PostMapping
    public ResponseEntity<ScriptDTO> createScript(@RequestBody ScriptDTO scriptDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        // 验证worldId是否存在
        if (scriptDTO.getWorldId() == null) {
            return ResponseEntity.status(400).build();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        World world = worldRepository.findById(scriptDTO.getWorldId())
                .orElseThrow(() -> new RuntimeException("World not found with id: " + scriptDTO.getWorldId()));

        // 确保世界属于当前用户
        if (!world.getUser().getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }

        // ========== 初始化过程入库记录 ==========
        logger.info("========== [用户剧本创建] 初始化过程入库记录 ==========");
        logger.info("用户ID: {}, 世界ID: {}, 场景ID: {}, 系统预置剧本ID: {}", 
            userId, scriptDTO.getWorldId(), scriptDTO.getEraId(), scriptDTO.getSystemScriptId());
        logger.info("接收到的DTO数据: worldId={}, eraId={}, systemScriptId={}, title={}", 
            scriptDTO.getWorldId(), scriptDTO.getEraId(), scriptDTO.getSystemScriptId(), scriptDTO.getTitle());

        // 从系统预置数据库查询完整数据
        SystemScript systemScript = null;
        if (scriptDTO.getSystemScriptId() != null) {
            systemScript = systemScriptRepository.findById(scriptDTO.getSystemScriptId())
                .orElseThrow(() -> new RuntimeException("系统预置剧本不存在: " + scriptDTO.getSystemScriptId()));
            
            logger.info("从系统预置数据库查询到的剧本: id={}, title={}, description={}, sceneCount={}", 
                systemScript.getId(), systemScript.getTitle(), 
                systemScript.getDescription() != null ? (systemScript.getDescription().length() > 50 ? systemScript.getDescription().substring(0, 50) + "..." : systemScript.getDescription()) : "null",
                systemScript.getSceneCount());
        }

        // 验证eraId（如果提供）
        Era era = null;
        if (scriptDTO.getEraId() != null) {
            era = eraRepository.findById(scriptDTO.getEraId())
                    .orElseThrow(() -> new RuntimeException("场景不存在: " + scriptDTO.getEraId()));
            if (!era.getUser().getId().equals(userId)) {
                return ResponseEntity.status(403).build();
            }
        }

        // 从系统预置数据创建Script实体（优先使用预置数据，DTO中的字段作为覆盖）
        Script script = new Script();
        script.setWorld(world);
        script.setUser(user);
        script.setEra(era);
        
        // 如果提供了系统预置剧本ID，从预置数据库获取完整数据
        if (systemScript != null) {
            // 使用系统预置的完整数据
            script.setTitle(scriptDTO.getTitle() != null ? scriptDTO.getTitle() : systemScript.getTitle()); // 允许前端自定义标题
            script.setDescription(systemScript.getDescription());
            script.setContent(systemScript.getContent());
            script.setSceneCount(systemScript.getSceneCount() != null ? systemScript.getSceneCount() : 1);
            script.setCharacterIds(systemScript.getCharacterIds());
            script.setTags(systemScript.getTags());
            
            logger.info("使用系统预置数据创建: title={}, description={}, sceneCount={}, content={}, characterIds={}, tags={}", 
                script.getTitle(), 
                script.getDescription() != null ? (script.getDescription().length() > 50 ? script.getDescription().substring(0, 50) + "..." : script.getDescription()) : "null",
                script.getSceneCount(),
                script.getContent() != null ? ("有(" + script.getContent().length() + "字符)") : "无",
                script.getCharacterIds(),
                script.getTags());
        } else {
            // 如果没有提供系统预置剧本ID，使用DTO中的数据（兼容旧逻辑）
            script.setTitle(scriptDTO.getTitle());
            script.setDescription(scriptDTO.getDescription());
            script.setContent(scriptDTO.getContent());
            script.setSceneCount(scriptDTO.getSceneCount() != null ? scriptDTO.getSceneCount() : 1);
            script.setCharacterIds(scriptDTO.getCharacterIds());
            script.setTags(scriptDTO.getTags());
            
            logger.info("使用DTO数据创建（兼容模式）: title={}, description={}, sceneCount={}, characterIds={}, tags={}", 
                script.getTitle(), 
                script.getDescription() != null ? (script.getDescription().length() > 50 ? script.getDescription().substring(0, 50) + "..." : script.getDescription()) : "null",
                script.getSceneCount(),
                script.getCharacterIds(),
                script.getTags());
        }
        
        script.setIsDeleted(false);

        logger.info("========== [用户剧本创建] 入库记录完成 ==========");

        Script savedScript = scriptRepository.save(script);
        
        // 记录保存后的数据
        logger.info("========== [用户剧本创建] 保存后数据验证 ==========");
        logger.info("保存成功，ID: {}, title: {}, description: {}, sceneCount: {}", 
            savedScript.getId(), savedScript.getTitle(), 
            savedScript.getDescription() != null ? (savedScript.getDescription().length() > 50 ? savedScript.getDescription().substring(0, 50) + "..." : savedScript.getDescription()) : "null",
            savedScript.getSceneCount());
        logger.info("========== [用户剧本创建] 数据验证完成 ==========");
        
        return ResponseEntity.ok(DTOMapper.toScriptDTO(savedScript));
    }

    // 更新指定ID的剧本
    @PutMapping("/{id}")
    public ResponseEntity<ScriptDTO> updateScript(@PathVariable Long id, @RequestBody ScriptDTO scriptDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Script script = scriptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Script not found with id: " + id));

        // 确保用户只能更新自己的剧本
        if (!script.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        script.setTitle(scriptDTO.getTitle());
        if (scriptDTO.getDescription() != null) {
            script.setDescription(scriptDTO.getDescription());
        }
        script.setContent(scriptDTO.getContent());
        script.setSceneCount(scriptDTO.getSceneCount());
        if (scriptDTO.getCharacterIds() != null) {
            script.setCharacterIds(scriptDTO.getCharacterIds());
        }
        if (scriptDTO.getTags() != null) {
            script.setTags(scriptDTO.getTags());
        }

        // 如果worldId改变，更新world关联
        if (scriptDTO.getWorldId() != null && !scriptDTO.getWorldId().equals(script.getWorld().getId())) {
            World world = worldRepository.findById(scriptDTO.getWorldId())
                    .orElseThrow(() -> new RuntimeException("World not found with id: " + scriptDTO.getWorldId()));
            if (!world.getUser().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).build();
            }
            script.setWorld(world);
        }

        // 如果eraId改变，更新era关联
        if (scriptDTO.getEraId() != null) {
            if (script.getEra() == null || !scriptDTO.getEraId().equals(script.getEra().getId())) {
                Era era = eraRepository.findById(scriptDTO.getEraId())
                        .orElseThrow(() -> new RuntimeException("Era not found with id: " + scriptDTO.getEraId()));
                if (!era.getUser().getId().equals(userDetails.getId())) {
                    return ResponseEntity.status(403).build();
                }
                script.setEra(era);
            }
        } else {
            script.setEra(null);
        }

        Script updatedScript = scriptRepository.save(script);
        return ResponseEntity.ok(DTOMapper.toScriptDTO(updatedScript));
    }

    // 删除指定ID的剧本
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScript(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Script script = scriptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Script not found with id: " + id));

        // 确保用户只能删除自己的剧本
        if (!script.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        // 软删除：标记为已删除
        script.setIsDeleted(true);
        script.setDeletedAt(java.time.LocalDateTime.now());
        scriptRepository.save(script);
        return ResponseEntity.noContent().build();
    }
}