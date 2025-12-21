package com.heartsphere.admin.service;

import com.heartsphere.admin.dto.SystemWorldDTO;
import com.heartsphere.admin.entity.SystemWorld;
import com.heartsphere.admin.repository.SystemWorldRepository;
import com.heartsphere.admin.util.SystemDTOMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 系统世界服务
 * 提供SystemWorld的CRUD操作
 */
@Service
public class SystemWorldService {

    @Autowired
    private SystemWorldRepository worldRepository;

    /**
     * 获取所有系统世界
     */
    public List<SystemWorldDTO> getAllWorlds() {
        return worldRepository.findAll().stream()
                .map(SystemDTOMapper::toWorldDTO)
                .collect(Collectors.toList());
    }

    /**
     * 根据ID获取系统世界
     */
    public SystemWorldDTO getWorldById(Long id) {
        SystemWorld world = worldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统世界不存在: " + id));
        return SystemDTOMapper.toWorldDTO(world);
    }

    /**
     * 创建系统世界
     */
    @Transactional
    public SystemWorldDTO createWorld(SystemWorldDTO dto) {
        SystemWorld world = new SystemWorld();
        world.setName(dto.getName());
        world.setDescription(dto.getDescription());
        world.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        world.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        world = worldRepository.save(world);
        return SystemDTOMapper.toWorldDTO(world);
    }

    /**
     * 更新系统世界
     */
    @Transactional
    public SystemWorldDTO updateWorld(Long id, SystemWorldDTO dto) {
        SystemWorld world = worldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("系统世界不存在: " + id));
        world.setName(dto.getName());
        world.setDescription(dto.getDescription());
        if (dto.getIsActive() != null) world.setIsActive(dto.getIsActive());
        if (dto.getSortOrder() != null) world.setSortOrder(dto.getSortOrder());
        world = worldRepository.save(world);
        return SystemDTOMapper.toWorldDTO(world);
    }

    /**
     * 删除系统世界
     */
    @Transactional
    public void deleteWorld(Long id) {
        worldRepository.deleteById(id);
    }
}

