package com.heartsphere.service;

import com.heartsphere.dto.SystemScriptDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 系统数据服务（Facade模式）
 * 提供统一的系统数据访问接口，委托给各个专门的Service
 * 注意：此服务直接访问数据库，admin 只负责配置
 */
@Service
public class SystemDataService {

    @Autowired
    private SystemScriptService scriptService;

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
}
