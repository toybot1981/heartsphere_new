package com.heartsphere.controller;

import com.heartsphere.admin.dto.SystemEraDTO;
import com.heartsphere.admin.entity.SystemEra;
import com.heartsphere.admin.repository.SystemEraRepository;
import com.heartsphere.admin.util.SystemDTOMapper;
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
        // 使用SystemDTOMapper转换，会自动处理URL转换（相对路径 -> 完整URL）
        List<SystemEraDTO> eraDTOs = eras.stream()
            .map(SystemDTOMapper::toEraDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(eraDTOs);
    }
}
