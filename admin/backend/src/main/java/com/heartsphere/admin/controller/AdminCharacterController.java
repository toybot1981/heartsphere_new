package com.heartsphere.admin.controller;

import com.heartsphere.admin.dto.SystemCharacterDTO;
import com.heartsphere.admin.service.SystemCharacterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 系统角色管理控制器
 */
@RestController
@RequestMapping("/api/admin/system/characters")
public class AdminCharacterController extends BaseAdminController {

    @Autowired
    private SystemCharacterService characterService;

    @GetMapping(produces = "application/json;charset=UTF-8")
    public ResponseEntity<List<SystemCharacterDTO>> getAllCharacters(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        List<SystemCharacterDTO> result = characterService.getAllCharacters();
        return ResponseEntity.ok()
                .header("Content-Type", "application/json;charset=UTF-8")
                .body(result);
    }

    @GetMapping(value = "/{id}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemCharacterDTO> getCharacterById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        SystemCharacterDTO result = characterService.getCharacterById(id);
        return ResponseEntity.ok()
                .header("Content-Type", "application/json;charset=UTF-8")
                .body(result);
    }

    @PostMapping(produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemCharacterDTO> createCharacter(
            @RequestBody SystemCharacterDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        SystemCharacterDTO result = characterService.createCharacter(dto);
        return ResponseEntity.ok()
                .header("Content-Type", "application/json;charset=UTF-8")
                .body(result);
    }

    @PutMapping(value = "/{id}", produces = "application/json;charset=UTF-8")
    public ResponseEntity<SystemCharacterDTO> updateCharacter(
            @PathVariable Long id,
            @RequestBody SystemCharacterDTO dto,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        SystemCharacterDTO result = characterService.updateCharacter(id, dto);
        return ResponseEntity.ok()
                .header("Content-Type", "application/json;charset=UTF-8")
                .body(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharacter(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        characterService.deleteCharacter(id);
        return ResponseEntity.noContent().build();
    }
}




