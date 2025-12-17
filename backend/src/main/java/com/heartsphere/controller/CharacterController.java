package com.heartsphere.controller;

import com.heartsphere.dto.CharacterDTO;
import com.heartsphere.entity.Character;
import com.heartsphere.entity.User;
import com.heartsphere.entity.World;
import com.heartsphere.entity.Era;
import com.heartsphere.repository.CharacterRepository;
import com.heartsphere.repository.UserRepository;
import com.heartsphere.repository.WorldRepository;
import com.heartsphere.repository.EraRepository;
import com.heartsphere.security.UserDetailsImpl;
import com.heartsphere.utils.DTOMapper;
import com.heartsphere.exception.ResourceNotFoundException;
import com.heartsphere.exception.ForbiddenException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/characters")
public class CharacterController {

    private static final Logger logger = Logger.getLogger(CharacterController.class.getName());

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private EraRepository eraRepository;

    // 获取当前用户的所有角色
    @GetMapping
    public ResponseEntity<List<CharacterDTO>> getAllCharacters() {
        logger.info("========== [CharacterController] 获取所有角色 ==========");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        logger.info(String.format("[CharacterController] 用户ID: %d, 用户名: %s", userDetails.getId(), userDetails.getUsername()));
        
        List<Character> characters = characterRepository.findByUser_Id(userDetails.getId());
        logger.info(String.format("[CharacterController] 查询到 %d 个角色", characters.size()));
        
        List<CharacterDTO> characterDTOs = characters.stream()
            .map(DTOMapper::toCharacterDTO)
            .collect(Collectors.toList());
        
        logger.info(String.format("[CharacterController] 返回 %d 个角色DTO", characterDTOs.size()));
        return ResponseEntity.ok(characterDTOs);
    }

    // 获取指定ID的角色
    @GetMapping("/{id}")
    public ResponseEntity<CharacterDTO> getCharacterById(@PathVariable Long id) {
        logger.info(String.format("========== [CharacterController] 获取角色详情 ========== ID: %d", id));
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        logger.info(String.format("[CharacterController] 用户ID: %d, 用户名: %s", userDetails.getId(), userDetails.getUsername()));

        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Character", id));

        // 确保用户只能访问自己的角色
        if (!character.getUser().getId().equals(userDetails.getId())) {
            throw new ForbiddenException("无权访问该角色");
        }

        logger.info(String.format("[CharacterController] 成功获取角色: ID=%d, 名称=%s", id, character.getName()));
        return ResponseEntity.ok(DTOMapper.toCharacterDTO(character));
    }

    // 获取指定世界的所有角色
    @GetMapping("/world/{worldId}")
    public ResponseEntity<List<CharacterDTO>> getCharactersByWorldId(@PathVariable Long worldId) {
        logger.info(String.format("========== [CharacterController] 获取世界的角色 ========== WorldID: %d", worldId));
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        logger.info(String.format("[CharacterController] 用户ID: %d, 用户名: %s", userDetails.getId(), userDetails.getUsername()));
        
        List<Character> characters = characterRepository.findByWorld_Id(worldId);
        logger.info(String.format("[CharacterController] 世界 %d 共有 %d 个角色", worldId, characters.size()));
        
        // 过滤出当前用户的角色
        List<CharacterDTO> characterDTOs = characters.stream()
            .filter(character -> character.getUser().getId().equals(userDetails.getId()))
            .map(DTOMapper::toCharacterDTO)
            .collect(Collectors.toList());
        
        logger.info(String.format("[CharacterController] 用户 %d 在世界 %d 中有 %d 个角色", 
            userDetails.getId(), worldId, characterDTOs.size()));
        return ResponseEntity.ok(characterDTOs);
    }

    // 获取指定时代的所有角色
    @GetMapping("/era/{eraId}")
    public ResponseEntity<List<CharacterDTO>> getCharactersByEraId(@PathVariable Long eraId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<Character> characters = characterRepository.findByEra_Id(eraId);
        // 过滤出当前用户的角色
        List<CharacterDTO> characterDTOs = characters.stream()
            .filter(character -> character.getUser().getId().equals(userDetails.getId()))
            .map(DTOMapper::toCharacterDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(characterDTOs);
    }

    // 创建新角色
    @PostMapping
    public ResponseEntity<CharacterDTO> createCharacter(@RequestBody CharacterDTO characterDTO) {
        logger.info("========== [CharacterController] 创建角色 ==========");
        logger.info(String.format("[CharacterController] 请求参数: name=%s, worldId=%d, eraId=%s, role=%s", 
            characterDTO.getName(), characterDTO.getWorldId(), characterDTO.getEraId(), characterDTO.getRole()));
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        logger.info(String.format("[CharacterController] 用户ID: %d, 用户名: %s", userDetails.getId(), userDetails.getUsername()));

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("用户", userDetails.getId()));

        World world = worldRepository.findById(characterDTO.getWorldId())
                .orElseThrow(() -> new ResourceNotFoundException("世界", characterDTO.getWorldId()));

        // 确保世界属于当前用户
        if (!world.getUser().getId().equals(userDetails.getId())) {
            throw new ForbiddenException("无权在该世界创建角色");
        }
        
        logger.info(String.format("[CharacterController] 验证通过: 世界 %d 属于用户 %d", world.getId(), userDetails.getId()));

        Character character = new Character();
        character.setName(characterDTO.getName());
        character.setDescription(characterDTO.getDescription());
        character.setAge(characterDTO.getAge());
        character.setGender(characterDTO.getGender());
        character.setRole(characterDTO.getRole());
        character.setBio(characterDTO.getBio());
        character.setAvatarUrl(characterDTO.getAvatarUrl());
        character.setBackgroundUrl(characterDTO.getBackgroundUrl());
        character.setThemeColor(characterDTO.getThemeColor());
        character.setColorAccent(characterDTO.getColorAccent());
        character.setFirstMessage(characterDTO.getFirstMessage());
        character.setSystemInstruction(characterDTO.getSystemInstruction());
        character.setVoiceName(characterDTO.getVoiceName());
        character.setMbti(characterDTO.getMbti());
        character.setTags(characterDTO.getTags());
        character.setSpeechStyle(characterDTO.getSpeechStyle());
        character.setCatchphrases(characterDTO.getCatchphrases());
        character.setSecrets(characterDTO.getSecrets());
        character.setMotivations(characterDTO.getMotivations());
        character.setRelationships(characterDTO.getRelationships());
        character.setWorld(world);
        character.setUser(user);
        
        logger.info(String.format("[CharacterController] 角色对象已创建: name=%s, role=%s, bio长度=%d", 
            character.getName(), character.getRole(), character.getBio() != null ? character.getBio().length() : 0));

        if (characterDTO.getEraId() != null) {
            logger.info(String.format("[CharacterController] 关联时代: eraId=%d", characterDTO.getEraId()));
            Era era = eraRepository.findById(characterDTO.getEraId())
                    .orElseThrow(() -> new ResourceNotFoundException("时代", characterDTO.getEraId()));
            // 确保时代属于当前用户
            if (!era.getUser().getId().equals(userDetails.getId())) {
                throw new ForbiddenException("无权关联该时代");
            }
            character.setEra(era);
            logger.info(String.format("[CharacterController] 时代关联成功: eraId=%d, eraName=%s", era.getId(), era.getName()));
        }

        Character savedCharacter = characterRepository.save(character);
        logger.info(String.format("[CharacterController] 角色保存成功: ID=%d, name=%s", savedCharacter.getId(), savedCharacter.getName()));
        return ResponseEntity.ok(DTOMapper.toCharacterDTO(savedCharacter));
    }

    // 更新指定ID的角色
    @PutMapping("/{id}")
    public ResponseEntity<CharacterDTO> updateCharacter(@PathVariable Long id, @RequestBody CharacterDTO characterDTO) {
        logger.info(String.format("========== [CharacterController] 更新角色 ========== ID: %d", id));
        logger.info(String.format("[CharacterController] 请求参数: name=%s, worldId=%d, eraId=%s, role=%s", 
            characterDTO.getName(), characterDTO.getWorldId(), characterDTO.getEraId(), characterDTO.getRole()));
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        logger.info(String.format("[CharacterController] 用户ID: %d, 用户名: %s", userDetails.getId(), userDetails.getUsername()));

        Character character = characterRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warning(String.format("[CharacterController] 角色不存在: ID=%d", id));
                    return new RuntimeException("Character not found with id: " + id);
                });

        // 确保用户只能更新自己的角色
        if (!character.getUser().getId().equals(userDetails.getId())) {
            throw new ForbiddenException("无权更新该角色");
        }
        
        logger.info(String.format("[CharacterController] 权限验证通过: 用户 %d 可以更新角色 %d", userDetails.getId(), id));
        
        logger.info(String.format("[CharacterController] 原角色信息: name=%s, role=%s", character.getName(), character.getRole()));

        character.setName(characterDTO.getName());
        character.setDescription(characterDTO.getDescription());
        character.setAge(characterDTO.getAge());
        character.setGender(characterDTO.getGender());
        character.setRole(characterDTO.getRole());
        character.setBio(characterDTO.getBio());
        character.setAvatarUrl(characterDTO.getAvatarUrl());
        character.setBackgroundUrl(characterDTO.getBackgroundUrl());
        character.setThemeColor(characterDTO.getThemeColor());
        character.setColorAccent(characterDTO.getColorAccent());
        character.setFirstMessage(characterDTO.getFirstMessage());
        character.setSystemInstruction(characterDTO.getSystemInstruction());
        character.setVoiceName(characterDTO.getVoiceName());
        character.setMbti(characterDTO.getMbti());
        character.setTags(characterDTO.getTags());
        character.setSpeechStyle(characterDTO.getSpeechStyle());
        character.setCatchphrases(characterDTO.getCatchphrases());
        character.setSecrets(characterDTO.getSecrets());
        character.setMotivations(characterDTO.getMotivations());
        character.setRelationships(characterDTO.getRelationships());

        // 如果worldId改变，更新world关联
        if (characterDTO.getWorldId() != null && !characterDTO.getWorldId().equals(character.getWorld().getId())) {
            World world = worldRepository.findById(characterDTO.getWorldId())
                    .orElseThrow(() -> new ResourceNotFoundException("世界", characterDTO.getWorldId()));
            if (!world.getUser().getId().equals(userDetails.getId())) {
                throw new ForbiddenException("无权使用该世界");
            }
            character.setWorld(world);
        }

        // 如果eraId改变，更新era关联
        if (characterDTO.getEraId() != null) {
            if (character.getEra() == null || !characterDTO.getEraId().equals(character.getEra().getId())) {
                Era era = eraRepository.findById(characterDTO.getEraId())
                        .orElseThrow(() -> new ResourceNotFoundException("时代", characterDTO.getEraId()));
                if (!era.getUser().getId().equals(userDetails.getId())) {
                    throw new ForbiddenException("无权使用该时代");
                }
                character.setEra(era);
            }
        } else {
            character.setEra(null);
        }

        Character updatedCharacter = characterRepository.save(character);
        logger.info(String.format("[CharacterController] 角色更新成功: ID=%d, name=%s, role=%s", 
            updatedCharacter.getId(), updatedCharacter.getName(), updatedCharacter.getRole()));
        return ResponseEntity.ok(DTOMapper.toCharacterDTO(updatedCharacter));
    }

    // 删除指定ID的角色
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharacter(@PathVariable Long id) {
        logger.info(String.format("========== [CharacterController] 删除角色 ========== ID: %d", id));
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        logger.info(String.format("[CharacterController] 用户ID: %d, 用户名: %s", userDetails.getId(), userDetails.getUsername()));

        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("角色", id));

        // 确保用户只能删除自己的角色
        if (!character.getUser().getId().equals(userDetails.getId())) {
            throw new ForbiddenException("无权删除该角色");
        }

        // 软删除：标记为已删除
        character.setIsDeleted(true);
        character.setDeletedAt(java.time.LocalDateTime.now());
        characterRepository.save(character);
        logger.info(String.format("[CharacterController] 角色已移至回收站: ID=%d, name=%s", id, character.getName()));
        return ResponseEntity.noContent().build();
    }
}