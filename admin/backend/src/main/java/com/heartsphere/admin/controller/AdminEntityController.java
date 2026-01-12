package com.heartsphere.admin.controller;

import com.heartsphere.admin.entity.Character;
import com.heartsphere.admin.entity.Era;
import com.heartsphere.admin.entity.ScenarioEvent;
import com.heartsphere.admin.entity.ScenarioItem;
import com.heartsphere.admin.entity.World;
import com.heartsphere.admin.repository.CharacterRepository;
import com.heartsphere.admin.repository.EraRepository;
import com.heartsphere.admin.repository.ScenarioEventRepository;
import com.heartsphere.admin.repository.ScenarioItemRepository;
import com.heartsphere.admin.repository.WorldRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 实体API控制器
 * 为Graph流程编辑器提供实体查询接口
 */
@RestController
@RequestMapping("/api/admin/entities")
public class AdminEntityController extends BaseAdminController {
    
    @Autowired
    private EraRepository eraRepository;
    
    @Autowired
    private CharacterRepository characterRepository;
    
    @Autowired
    private ScenarioEventRepository scenarioEventRepository;
    
    @Autowired
    private ScenarioItemRepository scenarioItemRepository;
    
    @Autowired
    private WorldRepository worldRepository;
    
    /**
     * 获取场景列表
     * GET /api/admin/entities/eras
     */
    @GetMapping("/eras")
    public ResponseEntity<Map<String, Object>> getEras(
            @RequestParam(required = false) Long worldId,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size);
        List<Era> eras;
        
        if (worldId != null) {
            eras = eraRepository.findByWorld_Id(worldId);
        } else {
            eras = eraRepository.findAll();
        }
        
        // 手动分页
        int start = page * size;
        int end = Math.min(start + size, eras.size());
        List<Era> pagedEras = eras.subList(Math.min(start, eras.size()), end);
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", pagedEras.stream()
            .map(this::convertEraToMap)
            .collect(Collectors.toList()));
        response.put("total", eras.size());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", (int) Math.ceil((double) eras.size() / size));
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取角色列表
     * GET /api/admin/entities/characters
     */
    @GetMapping("/characters")
    public ResponseEntity<Map<String, Object>> getCharacters(
            @RequestParam(required = false) Long eraId,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size);
        List<Character> characters;
        
        if (eraId != null) {
            characters = characterRepository.findByEra_Id(eraId);
        } else {
            characters = characterRepository.findAll();
        }
        
        // 手动分页
        int start = page * size;
        int end = Math.min(start + size, characters.size());
        List<Character> pagedCharacters = characters.subList(Math.min(start, characters.size()), end);
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", pagedCharacters.stream()
            .map(this::convertCharacterToMap)
            .collect(Collectors.toList()));
        response.put("total", characters.size());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", (int) Math.ceil((double) characters.size() / size));
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取事件列表
     * GET /api/admin/entities/events
     */
    @GetMapping("/events")
    public ResponseEntity<Map<String, Object>> getEvents(
            @RequestParam(required = false) Long eraId,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size);
        List<ScenarioEvent> events;
        
        if (eraId != null) {
            events = scenarioEventRepository.findByEraIdOrSystem(eraId);
        } else {
            events = scenarioEventRepository.findAll();
        }
        
        // 手动分页
        int start = page * size;
        int end = Math.min(start + size, events.size());
        List<ScenarioEvent> pagedEvents = events.subList(Math.min(start, events.size()), end);
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", pagedEvents.stream()
            .map(this::convertEventToMap)
            .collect(Collectors.toList()));
        response.put("total", events.size());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", (int) Math.ceil((double) events.size() / size));
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取物品列表
     * GET /api/admin/entities/items
     */
    @GetMapping("/items")
    public ResponseEntity<Map<String, Object>> getItems(
            @RequestParam(required = false) Long eraId,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size);
        List<ScenarioItem> items;
        
        if (eraId != null) {
            items = scenarioItemRepository.findByEraIdOrSystem(eraId);
        } else {
            items = scenarioItemRepository.findAll();
        }
        
        // 手动分页
        int start = page * size;
        int end = Math.min(start + size, items.size());
        List<ScenarioItem> pagedItems = items.subList(Math.min(start, items.size()), end);
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", pagedItems.stream()
            .map(this::convertItemToMap)
            .collect(Collectors.toList()));
        response.put("total", items.size());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", (int) Math.ceil((double) items.size() / size));
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 获取世界列表
     * GET /api/admin/entities/worlds
     */
    @GetMapping("/worlds")
    public ResponseEntity<Map<String, Object>> getWorlds(
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "50") Integer size,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<World> worldPage = worldRepository.findAll(pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("items", worldPage.getContent().stream()
            .map(this::convertWorldToMap)
            .collect(Collectors.toList()));
        response.put("total", worldPage.getTotalElements());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", worldPage.getTotalPages());
        
        return ResponseEntity.ok(response);
    }
    
    // 转换方法
    private Map<String, Object> convertEraToMap(Era era) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", era.getId());
        map.put("name", era.getName());
        map.put("description", era.getDescription());
        map.put("type", "era");
        if (era.getWorld() != null) {
            map.put("worldId", era.getWorld().getId());
        }
        if (era.getUser() != null) {
            map.put("userId", era.getUser().getId());
        }
        return map;
    }
    
    private Map<String, Object> convertCharacterToMap(Character character) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", character.getId());
        map.put("name", character.getName());
        map.put("description", character.getDescription());
        map.put("type", "character");
        if (character.getEra() != null) {
            map.put("eraId", character.getEra().getId());
        }
        if (character.getUser() != null) {
            map.put("userId", character.getUser().getId());
        }
        return map;
    }
    
    private Map<String, Object> convertEventToMap(ScenarioEvent event) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", event.getId());
        map.put("eventId", event.getEventId());
        map.put("name", event.getName());
        map.put("description", event.getDescription());
        map.put("type", "event");
        if (event.getEra() != null) {
            map.put("eraId", event.getEra().getId());
        }
        if (event.getUser() != null) {
            map.put("userId", event.getUser().getId());
        }
        return map;
    }
    
    private Map<String, Object> convertItemToMap(ScenarioItem item) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", item.getId());
        map.put("itemId", item.getItemId());
        map.put("name", item.getName());
        map.put("description", item.getDescription());
        map.put("type", "item");
        if (item.getEra() != null) {
            map.put("eraId", item.getEra().getId());
        }
        if (item.getUser() != null) {
            map.put("userId", item.getUser().getId());
        }
        return map;
    }
    
    private Map<String, Object> convertWorldToMap(World world) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", world.getId());
        map.put("name", world.getName());
        map.put("description", world.getDescription());
        map.put("type", "world");
        if (world.getUser() != null) {
            map.put("userId", world.getUser().getId());
        }
        return map;
    }
}
