package com.heartsphere.admin.service.graph;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.dto.graph.*;
import com.heartsphere.admin.entity.graph.GraphDefinition;
import com.heartsphere.admin.entity.graph.GraphNodeEntity;
import com.heartsphere.admin.entity.graph.GraphEdgeEntity;
import com.heartsphere.admin.repository.graph.GraphDefinitionRepository;
import com.heartsphere.admin.repository.graph.GraphNodeRepository;
import com.heartsphere.admin.repository.graph.GraphEdgeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Graph定义服务
 */
@Slf4j
@Service
public class GraphDefinitionService {
    
    @Autowired
    private GraphDefinitionRepository graphDefinitionRepository;
    
    @Autowired
    private GraphNodeRepository graphNodeRepository;
    
    @Autowired
    private GraphEdgeRepository graphEdgeRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * 获取所有Graph定义
     */
    public List<GraphDefinitionDTO> getAllGraphs() {
        return graphDefinitionRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 根据ID获取Graph定义（包含节点和边）
     */
    public GraphDefinitionDTO getGraphById(Long id) {
        GraphDefinition graph = graphDefinitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Graph定义不存在: " + id));
        return toFullDTO(graph);
    }
    
    /**
     * 创建Graph定义
     */
    @Transactional
    public GraphDefinitionDTO createGraph(GraphDefinitionCreateRequest request, Long adminId) {
        log.info("创建Graph定义: {}", request.getName());
        
        // 参数验证
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Graph名称不能为空");
        }
        if (request.getName().length() > 200) {
            throw new IllegalArgumentException("Graph名称长度不能超过200个字符");
        }
        if (request.getDescription() != null && request.getDescription().length() > 1000) {
            throw new IllegalArgumentException("Graph描述长度不能超过1000个字符");
        }
        
        // 创建Graph定义
        GraphDefinition graph = new GraphDefinition();
        graph.setName(request.getName().trim());
        graph.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        graph.setGraphType(request.getGraphType() != null ? request.getGraphType() : "SCRIPT");
        graph.setStartNodeId(request.getStartNodeId());
        graph.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        graph.setVersion(1);
        graph.setCreatedBy(adminId);
        graph.setUpdatedBy(adminId);
        
        GraphDefinition savedGraph = graphDefinitionRepository.save(graph);
        
        // 保存节点
        if (request.getNodes() != null) {
            for (GraphNodeDTO nodeDTO : request.getNodes()) {
                GraphNodeEntity node = new GraphNodeEntity();
                node.setGraphId(savedGraph.getId());
                node.setNodeId(nodeDTO.getNodeId());
                node.setNodeType(nodeDTO.getNodeType());
                try {
                    node.setNodeConfig(objectMapper.writeValueAsString(nodeDTO.getNodeConfig()));
                } catch (Exception e) {
                    log.error("序列化节点配置失败", e);
                    throw new RuntimeException("序列化节点配置失败", e);
                }
                node.setPositionX(nodeDTO.getPositionX());
                node.setPositionY(nodeDTO.getPositionY());
                node.setSortOrder(nodeDTO.getSortOrder());
                graphNodeRepository.save(node);
            }
        }
        
        // 保存边
        if (request.getEdges() != null) {
            for (GraphEdgeDTO edgeDTO : request.getEdges()) {
                GraphEdgeEntity edge = new GraphEdgeEntity();
                edge.setGraphId(savedGraph.getId());
                edge.setSourceNodeId(edgeDTO.getSourceNodeId());
                edge.setTargetNodeId(edgeDTO.getTargetNodeId());
                edge.setEdgeType(edgeDTO.getEdgeType());
                edge.setEdgeLabel(edgeDTO.getEdgeLabel());
                if (edgeDTO.getConditionConfig() != null) {
                    try {
                        edge.setConditionConfig(objectMapper.writeValueAsString(edgeDTO.getConditionConfig()));
                    } catch (Exception e) {
                        log.error("序列化边配置失败", e);
                        throw new RuntimeException("序列化边配置失败", e);
                    }
                }
                edge.setSortOrder(edgeDTO.getSortOrder());
                graphEdgeRepository.save(edge);
            }
        }
        
        return getGraphById(savedGraph.getId());
    }
    
    /**
     * 更新Graph定义
     */
    @Transactional
    public GraphDefinitionDTO updateGraph(Long id, GraphDefinitionCreateRequest request, Long adminId) {
        log.info("更新Graph定义: {}", id);
        
        // 参数验证
        if (id == null) {
            throw new IllegalArgumentException("Graph ID不能为空");
        }
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Graph名称不能为空");
        }
        if (request.getName().length() > 200) {
            throw new IllegalArgumentException("Graph名称长度不能超过200个字符");
        }
        if (request.getDescription() != null && request.getDescription().length() > 1000) {
            throw new IllegalArgumentException("Graph描述长度不能超过1000个字符");
        }
        
        GraphDefinition graph = graphDefinitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Graph定义不存在: " + id));
        
        graph.setName(request.getName().trim());
        graph.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        graph.setGraphType(request.getGraphType());
        graph.setStartNodeId(request.getStartNodeId());
        graph.setIsActive(request.getIsActive());
        graph.setUpdatedBy(adminId);
        graph.setVersion(graph.getVersion() != null ? graph.getVersion() + 1 : 1);
        
        graphDefinitionRepository.save(graph);
        
        // 删除旧的节点和边
        graphNodeRepository.deleteByGraphId(id);
        graphEdgeRepository.deleteByGraphId(id);
        
        // 保存新的节点
        if (request.getNodes() != null) {
            for (GraphNodeDTO nodeDTO : request.getNodes()) {
                GraphNodeEntity node = new GraphNodeEntity();
                node.setGraphId(id);
                node.setNodeId(nodeDTO.getNodeId());
                node.setNodeType(nodeDTO.getNodeType());
                try {
                    node.setNodeConfig(objectMapper.writeValueAsString(nodeDTO.getNodeConfig()));
                } catch (Exception e) {
                    log.error("序列化节点配置失败", e);
                    throw new RuntimeException("序列化节点配置失败", e);
                }
                node.setPositionX(nodeDTO.getPositionX());
                node.setPositionY(nodeDTO.getPositionY());
                node.setSortOrder(nodeDTO.getSortOrder());
                graphNodeRepository.save(node);
            }
        }
        
        // 保存新的边
        if (request.getEdges() != null) {
            for (GraphEdgeDTO edgeDTO : request.getEdges()) {
                GraphEdgeEntity edge = new GraphEdgeEntity();
                edge.setGraphId(id);
                edge.setSourceNodeId(edgeDTO.getSourceNodeId());
                edge.setTargetNodeId(edgeDTO.getTargetNodeId());
                edge.setEdgeType(edgeDTO.getEdgeType());
                edge.setEdgeLabel(edgeDTO.getEdgeLabel());
                if (edgeDTO.getConditionConfig() != null) {
                    try {
                        edge.setConditionConfig(objectMapper.writeValueAsString(edgeDTO.getConditionConfig()));
                    } catch (Exception e) {
                        log.error("序列化边配置失败", e);
                        throw new RuntimeException("序列化边配置失败", e);
                    }
                }
                edge.setSortOrder(edgeDTO.getSortOrder());
                graphEdgeRepository.save(edge);
            }
        }
        
        return getGraphById(id);
    }
    
    /**
     * 删除Graph定义
     */
    @Transactional
    public void deleteGraph(Long id) {
        log.info("删除Graph定义: {}", id);
        
        GraphDefinition graph = graphDefinitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Graph定义不存在: " + id));
        
        // 删除关联的节点和边
        graphNodeRepository.deleteByGraphId(id);
        graphEdgeRepository.deleteByGraphId(id);
        
        // 删除Graph定义
        graphDefinitionRepository.delete(graph);
    }
    
    /**
     * 转换为DTO（不包含节点和边）
     */
    private GraphDefinitionDTO toDTO(GraphDefinition graph) {
        GraphDefinitionDTO dto = new GraphDefinitionDTO();
        dto.setId(graph.getId());
        dto.setName(graph.getName());
        dto.setDescription(graph.getDescription());
        dto.setGraphType(graph.getGraphType());
        dto.setStartNodeId(graph.getStartNodeId());
        dto.setIsActive(graph.getIsActive());
        dto.setVersion(graph.getVersion());
        dto.setCreatedBy(graph.getCreatedBy());
        dto.setUpdatedBy(graph.getUpdatedBy());
        dto.setCreatedAt(graph.getCreatedAt());
        dto.setUpdatedAt(graph.getUpdatedAt());
        return dto;
    }
    
    /**
     * 转换为完整DTO（包含节点和边）
     */
    private GraphDefinitionDTO toFullDTO(GraphDefinition graph) {
        GraphDefinitionDTO dto = toDTO(graph);
        
        // 加载节点
        List<GraphNodeDTO> nodes = graphNodeRepository.findByGraphId(graph.getId()).stream()
                .map(this::nodeToDTO)
                .collect(Collectors.toList());
        dto.setNodes(nodes);
        
        // 加载边
        List<GraphEdgeDTO> edges = graphEdgeRepository.findByGraphId(graph.getId()).stream()
                .map(this::edgeToDTO)
                .collect(Collectors.toList());
        dto.setEdges(edges);
        
        return dto;
    }
    
    /**
     * 节点实体转DTO
     */
    private GraphNodeDTO nodeToDTO(GraphNodeEntity node) {
        GraphNodeDTO dto = new GraphNodeDTO();
        dto.setId(node.getId());
        dto.setGraphId(node.getGraphId());
        dto.setNodeId(node.getNodeId());
        dto.setNodeType(node.getNodeType());
        try {
            if (node.getNodeConfig() != null) {
                dto.setNodeConfig(objectMapper.readValue(node.getNodeConfig(), 
                    new TypeReference<Map<String, Object>>() {}));
            }
        } catch (Exception e) {
            log.error("解析节点配置失败: {}", node.getNodeConfig(), e);
        }
        dto.setPositionX(node.getPositionX());
        dto.setPositionY(node.getPositionY());
        dto.setSortOrder(node.getSortOrder());
        dto.setCreatedAt(node.getCreatedAt());
        dto.setUpdatedAt(node.getUpdatedAt());
        return dto;
    }
    
    /**
     * 边实体转DTO
     */
    private GraphEdgeDTO edgeToDTO(GraphEdgeEntity edge) {
        GraphEdgeDTO dto = new GraphEdgeDTO();
        dto.setId(edge.getId());
        dto.setGraphId(edge.getGraphId());
        dto.setSourceNodeId(edge.getSourceNodeId());
        dto.setTargetNodeId(edge.getTargetNodeId());
        dto.setEdgeType(edge.getEdgeType());
        dto.setEdgeLabel(edge.getEdgeLabel());
        try {
            if (edge.getConditionConfig() != null) {
                dto.setConditionConfig(objectMapper.readValue(edge.getConditionConfig(), 
                    new TypeReference<Map<String, Object>>() {}));
            }
        } catch (Exception e) {
            log.error("解析边配置失败: {}", edge.getConditionConfig(), e);
        }
        dto.setSortOrder(edge.getSortOrder());
        dto.setCreatedAt(edge.getCreatedAt());
        dto.setUpdatedAt(edge.getUpdatedAt());
        return dto;
    }
}
