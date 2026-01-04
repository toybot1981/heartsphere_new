package com.heartsphere.admin.controller;

import com.heartsphere.aiagent.dto.GraphDefinitionCreateRequest;
import com.heartsphere.aiagent.dto.GraphDefinitionDTO;
import com.heartsphere.aiagent.service.GraphDefinitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Graph流程编辑器管理控制器
 */
@RestController
@RequestMapping("/api/admin/graph")
@CrossOrigin(origins = "*")
public class AdminGraphController extends BaseAdminController {
    
    @Autowired
    private GraphDefinitionService graphDefinitionService;
    
    /**
     * 获取所有Graph定义
     */
    @GetMapping
    public ResponseEntity<List<GraphDefinitionDTO>> getAllGraphs(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(graphDefinitionService.getAllGraphs());
    }
    
    /**
     * 根据ID获取Graph定义（包含节点和边）
     */
    @GetMapping("/{id}")
    public ResponseEntity<GraphDefinitionDTO> getGraphById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        return ResponseEntity.ok(graphDefinitionService.getGraphById(id));
    }
    
    /**
     * 创建Graph定义
     */
    @PostMapping
    public ResponseEntity<GraphDefinitionDTO> createGraph(
            @RequestBody GraphDefinitionCreateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        var admin = validateAdmin(authHeader);
        return ResponseEntity.ok(graphDefinitionService.createGraph(request, admin.getId()));
    }
    
    /**
     * 更新Graph定义
     */
    @PutMapping("/{id}")
    public ResponseEntity<GraphDefinitionDTO> updateGraph(
            @PathVariable Long id,
            @RequestBody GraphDefinitionCreateRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        var admin = validateAdmin(authHeader);
        return ResponseEntity.ok(graphDefinitionService.updateGraph(id, request, admin.getId()));
    }
    
    /**
     * 删除Graph定义
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGraph(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        validateAdmin(authHeader);
        graphDefinitionService.deleteGraph(id);
        return ResponseEntity.noContent().build();
    }
}
