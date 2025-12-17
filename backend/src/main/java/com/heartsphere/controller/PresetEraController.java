package com.heartsphere.controller;

import com.heartsphere.admin.dto.SystemEraDTO;
import com.heartsphere.admin.entity.SystemEra;
import com.heartsphere.admin.repository.SystemEraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/preset-eras")
public class PresetEraController {

    @Autowired
    private SystemEraRepository systemEraRepository;

    // 获取预置时代（客户端公共接口，不需要认证）
    @GetMapping
    public ResponseEntity<List<SystemEraDTO>> getPresetEras() {
        List<SystemEra> eras = systemEraRepository.findByIsActiveTrueOrderBySortOrderAsc();
        List<SystemEraDTO> eraDTOs = eras.stream()
            .map(era -> {
                SystemEraDTO dto = new SystemEraDTO();
                dto.setId(era.getId());
                dto.setName(era.getName());
                dto.setDescription(era.getDescription());
                dto.setStartYear(era.getStartYear());
                dto.setEndYear(era.getEndYear());
                dto.setImageUrl(era.getImageUrl());
                dto.setIsActive(era.getIsActive());
                dto.setSortOrder(era.getSortOrder());
                dto.setCreatedAt(era.getCreatedAt());
                dto.setUpdatedAt(era.getUpdatedAt());
                return dto;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(eraDTOs);
    }
}
