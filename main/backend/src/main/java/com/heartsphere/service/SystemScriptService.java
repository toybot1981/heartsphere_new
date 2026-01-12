package com.heartsphere.service;

import com.heartsphere.dto.SystemScriptDTO;
import com.heartsphere.entity.SystemScript;
import com.heartsphere.entity.SystemEra;
import com.heartsphere.repository.SystemScriptRepository;
import com.heartsphere.repository.SystemEraRepository;
import com.heartsphere.util.SystemDTOMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * 系统剧本服务
 * 提供SystemScript的查询操作
 * 注意：此服务直接访问数据库，admin 只负责配置
 */
@Service
public class SystemScriptService {

    private static final Logger logger = Logger.getLogger(SystemScriptService.class.getName());

    @Autowired
    private SystemScriptRepository scriptRepository;

    @Autowired
    private SystemEraRepository eraRepository;

    /**
     * 获取所有剧本（按排序）
     */
    public List<SystemScriptDTO> getAllScripts() {
        List<SystemScript> allScripts = scriptRepository.findAll();
        return allScripts.stream()
                .sorted((a, b) -> {
                    // 先按isActive排序（激活的在前）
                    if (a.getIsActive() != null && b.getIsActive() != null) {
                        int activeCompare = Boolean.compare(b.getIsActive(), a.getIsActive());
                        if (activeCompare != 0) return activeCompare;
                    }
                    // 再按sortOrder排序
                    int orderCompare = Integer.compare(
                            a.getSortOrder() != null ? a.getSortOrder() : 0,
                            b.getSortOrder() != null ? b.getSortOrder() : 0
                    );
                    if (orderCompare != 0) return orderCompare;
                    // 最后按ID排序
                    return Long.compare(a.getId(), b.getId());
                })
                .map(SystemDTOMapper::toScriptDTO)
                .collect(Collectors.toList());
    }

    /**
     * 根据时代ID获取剧本列表
     */
    public List<SystemScriptDTO> getScriptsByEraId(Long eraId) {
        return scriptRepository.findByEraIdAndIsActiveTrue(eraId).stream()
                .map(SystemDTOMapper::toScriptDTO)
                .collect(Collectors.toList());
    }

    /**
     * 根据ID获取剧本
     */
    public SystemScriptDTO getScriptById(Long id) {
        SystemScript script = scriptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统剧本不存在: " + id));
        return SystemDTOMapper.toScriptDTO(script);
    }
}
