package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SystemCharacterDTO;
import com.heartsphere.admin.dto.SystemEraDTO;
import com.heartsphere.admin.dto.SystemMainStoryDTO;
import com.heartsphere.admin.dto.SystemScriptDTO;
import com.heartsphere.admin.dto.SystemWorldDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 系统数据服务（Facade模式）
 * 提供统一的系统数据访问接口，委托给各个专门的Service
 * 
 * @deprecated 建议直接使用各个专门的Service：
 *   - SystemWorldService
 *   - SystemEraService
 *   - SystemCharacterService
 *   - SystemScriptService
 *   - SystemMainStoryService
 *   - ResourceMatchingService
 */
@Service
@Deprecated
public class SystemDataService {

    @Autowired
    private SystemWorldService worldService;

    @Autowired
    private SystemEraService eraService;

    @Autowired
    private SystemCharacterService characterService;

    @Autowired
    private SystemScriptService scriptService;

    @Autowired
    private SystemMainStoryService mainStoryService;

    @Autowired
    private ResourceMatchingService resourceMatchingService;

    // ========== SystemWorld CRUD ==========
    public List<SystemWorldDTO> getAllWorlds() {
        return worldService.getAllWorlds();
    }

    public SystemWorldDTO getWorldById(Long id) {
        return worldService.getWorldById(id);
    }

    @Transactional
    public SystemWorldDTO createWorld(SystemWorldDTO dto) {
        return worldService.createWorld(dto);
    }

    @Transactional
    public SystemWorldDTO updateWorld(Long id, SystemWorldDTO dto) {
        return worldService.updateWorld(id, dto);
    }

    @Transactional
    public void deleteWorld(Long id) {
        worldService.deleteWorld(id);
    }

    // ========== SystemEra CRUD ==========
    public List<SystemEraDTO> getAllEras() {
        return eraService.getAllEras();
    }

    public SystemEraDTO getEraById(Long id) {
        return eraService.getEraById(id);
    }

    @Transactional
    public SystemEraDTO createEra(SystemEraDTO dto) {
        return eraService.createEra(dto);
    }

    @Transactional
    public SystemEraDTO updateEra(Long id, SystemEraDTO dto) {
        return eraService.updateEra(id, dto);
    }

    @Transactional
    public void deleteEra(Long id) {
        eraService.deleteEra(id);
    }

    // ========== SystemCharacter CRUD ==========
    public List<SystemCharacterDTO> getAllCharacters() {
        return characterService.getAllCharacters();
    }

    public SystemCharacterDTO getCharacterById(Long id) {
        return characterService.getCharacterById(id);
    }

    @Transactional
    public SystemCharacterDTO createCharacter(SystemCharacterDTO dto) {
        return characterService.createCharacter(dto);
    }

    @Transactional
    public SystemCharacterDTO updateCharacter(Long id, SystemCharacterDTO dto) {
        return characterService.updateCharacter(id, dto);
    }

    @Transactional
    public void deleteCharacter(Long id) {
        characterService.deleteCharacter(id);
    }

    // ========== SystemScript CRUD ==========
    public List<SystemScriptDTO> getAllScripts() {
        return scriptService.getAllScripts();
    }

    public List<SystemScriptDTO> getScriptsByEraId(Long eraId) {
        return scriptService.getScriptsByEraId(eraId);
    }

    public SystemScriptDTO getScriptById(Long id) {
        return scriptService.getScriptById(id);
    }

    // ========== SystemMainStory CRUD ==========
    public List<SystemMainStoryDTO> getAllMainStories() {
        return mainStoryService.getAllMainStories();
    }

    public SystemMainStoryDTO getMainStoryById(Long id) {
        return mainStoryService.getMainStoryById(id);
    }

    public SystemMainStoryDTO getMainStoryByEraId(Long eraId) {
        return mainStoryService.getMainStoryByEraId(eraId);
    }

    @Transactional
    public SystemMainStoryDTO createMainStory(SystemMainStoryDTO dto) {
        return mainStoryService.createMainStory(dto);
    }

    @Transactional
    public SystemMainStoryDTO updateMainStory(Long id, SystemMainStoryDTO dto) {
        return mainStoryService.updateMainStory(id, dto);
    }

    @Transactional
    public void deleteMainStory(Long id) {
        mainStoryService.deleteMainStory(id);
    }

    // ========== 批量更新剧本节点提示词 ==========
    @Transactional
    public int updateAllScriptsWithPrompts() {
        return scriptService.updateAllScriptsWithPrompts();
    }

    // ========== 匹配资源并更新场景和角色图片 ==========
    @Transactional
    public Map<String, Object> matchAndUpdateResources() {
        return resourceMatchingService.matchAndUpdateResources();
    }
}
