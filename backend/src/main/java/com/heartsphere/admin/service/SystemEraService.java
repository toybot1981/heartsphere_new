package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SystemEraDTO;
import com.heartsphere.admin.entity.SystemEra;
import com.heartsphere.admin.repository.SystemEraRepository;
import com.heartsphere.admin.util.SystemDTOMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 系统时代服务
 * 提供SystemEra的CRUD操作
 */
@Service
public class SystemEraService {

    @Autowired
    private SystemEraRepository eraRepository;

    /**
     * 获取所有系统时代
     */
    public List<SystemEraDTO> getAllEras() {
        return eraRepository.findAll().stream()
                .map(SystemDTOMapper::toEraDTO)
                .collect(Collectors.toList());
    }

    /**
     * 根据ID获取系统时代
     */
    public SystemEraDTO getEraById(Long id) {
        SystemEra era = eraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统时代不存在: " + id));
        return SystemDTOMapper.toEraDTO(era);
    }

    /**
     * 创建系统时代
     */
    @Transactional
    public SystemEraDTO createEra(SystemEraDTO dto) {
        SystemEra era = new SystemEra();
        era.setName(dto.getName());
        era.setDescription(dto.getDescription());
        era.setStartYear(dto.getStartYear());
        era.setEndYear(dto.getEndYear());
        era.setImageUrl(dto.getImageUrl());
        era.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        era.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        era = eraRepository.save(era);
        return SystemDTOMapper.toEraDTO(era);
    }

    /**
     * 更新系统时代
     */
    @Transactional
    public SystemEraDTO updateEra(Long id, SystemEraDTO dto) {
        SystemEra era = eraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统时代不存在: " + id));
        era.setName(dto.getName());
        era.setDescription(dto.getDescription());
        era.setStartYear(dto.getStartYear());
        era.setEndYear(dto.getEndYear());
        era.setImageUrl(dto.getImageUrl());
        if (dto.getIsActive() != null) era.setIsActive(dto.getIsActive());
        if (dto.getSortOrder() != null) era.setSortOrder(dto.getSortOrder());
        era = eraRepository.save(era);
        return SystemDTOMapper.toEraDTO(era);
    }

    /**
     * 删除系统时代
     */
    @Transactional
    public void deleteEra(Long id) {
        eraRepository.deleteById(id);
    }
}

