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
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.utils.DTOMapper;
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

    @Autowired
    private ScriptRepository scriptRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private EraRepository eraRepository;

    // 获取当前用户的所有剧本
    @GetMapping
    public ResponseEntity<List<ScriptDTO>> getAllScripts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
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
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userDetails.getId()));

        World world = worldRepository.findById(scriptDTO.getWorldId())
                .orElseThrow(() -> new RuntimeException("World not found with id: " + scriptDTO.getWorldId()));

        // 确保世界属于当前用户
        if (!world.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        Script script = new Script();
        script.setTitle(scriptDTO.getTitle());
        script.setContent(scriptDTO.getContent());
        script.setSceneCount(scriptDTO.getSceneCount());
        script.setWorld(world);
        script.setUser(user);

        if (scriptDTO.getEraId() != null) {
            Era era = eraRepository.findById(scriptDTO.getEraId())
                    .orElseThrow(() -> new RuntimeException("Era not found with id: " + scriptDTO.getEraId()));
            if (!era.getUser().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).build();
            }
            script.setEra(era);
        }

        Script savedScript = scriptRepository.save(script);
        return ResponseEntity.ok(DTOMapper.toScriptDTO(savedScript));
    }

    // 更新指定ID的剧本
    @PutMapping("/{id}")
    public ResponseEntity<ScriptDTO> updateScript(@PathVariable Long id, @RequestBody ScriptDTO scriptDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Script script = scriptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Script not found with id: " + id));

        // 确保用户只能更新自己的剧本
        if (!script.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        script.setTitle(scriptDTO.getTitle());
        script.setContent(scriptDTO.getContent());
        script.setSceneCount(scriptDTO.getSceneCount());

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
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        Script script = scriptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Script not found with id: " + id));

        // 确保用户只能删除自己的剧本
        if (!script.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        scriptRepository.delete(script);
        return ResponseEntity.noContent().build();
    }
}