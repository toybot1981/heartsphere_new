package com.heartsphere.admin.service.cmdb;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.dto.cmdb.*;
import com.heartsphere.admin.entity.SystemAdmin;
import com.heartsphere.admin.entity.cmdb.*;
import com.heartsphere.admin.repository.cmdb.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * CMDB服务
 */
@Service
public class CMDBService {
    
    private static final Logger logger = LoggerFactory.getLogger(CMDBService.class);
    
    @Autowired
    private AssetTypeRepository assetTypeRepository;
    
    @Autowired
    private AssetRepository assetRepository;
    
    @Autowired
    private RelationshipTypeRepository relationshipTypeRepository;
    
    @Autowired
    private AssetRelationshipRepository assetRelationshipRepository;
    
    @Autowired
    private AssetHistoryRepository assetHistoryRepository;
    
    @Autowired
    private AssetAuditLogRepository assetAuditLogRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // ========== Asset Type Operations ==========
    
    public List<AssetTypeDTO> getAllAssetTypes() {
        return assetTypeRepository.findAll().stream()
                .map(this::toAssetTypeDTO)
                .collect(Collectors.toList());
    }
    
    public AssetTypeDTO getAssetType(Long id) {
        AssetType type = assetTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("资产类型不存在: " + id));
        return toAssetTypeDTO(type);
    }
    
    private AssetTypeDTO toAssetTypeDTO(AssetType type) {
        AssetTypeDTO dto = new AssetTypeDTO();
        dto.setId(type.getId());
        dto.setName(type.getName());
        dto.setCode(type.getCode());
        dto.setDescription(type.getDescription());
        dto.setIcon(type.getIcon());
        dto.setAttributesSchema(type.getAttributesSchema());
        return dto;
    }
    
    // ========== Asset Operations ==========
    
    @Transactional
    public AssetDTO createAsset(AssetDTO dto, SystemAdmin admin) {
        AssetType type = assetTypeRepository.findById(dto.getType().getId())
                .orElseThrow(() -> new RuntimeException("资产类型不存在: " + dto.getType().getId()));
        
        Asset asset = new Asset();
        asset.setName(dto.getName());
        asset.setType(type);
        asset.setStatus(Asset.AssetStatus.valueOf(dto.getStatus()));
        asset.setVersion(dto.getVersion());
        asset.setLocation(dto.getLocation());
        if (dto.getOwnerId() != null) {
            // TODO: Load owner from repository if needed
        }
        asset.setDescription(dto.getDescription());
        asset.setAttributes(dto.getAttributes());
        asset.setCreatedBy(admin);
        
        asset = assetRepository.save(asset);
        
        // Record history
        recordAssetHistory(asset, AssetHistory.ActionType.CREATE, admin.getId(), null, toAssetJson(asset));
        
        // Record audit log
        recordAuditLog(asset, "CREATE", admin, null);
        
        return toAssetDTO(asset);
    }
    
    @Transactional
    public AssetDTO updateAsset(Long id, AssetDTO dto, SystemAdmin admin) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("资产不存在: " + id));
        
        String oldValue = toAssetJson(asset);
        
        asset.setName(dto.getName());
        if (dto.getType() != null && dto.getType().getId() != null) {
            AssetType type = assetTypeRepository.findById(dto.getType().getId())
                    .orElseThrow(() -> new RuntimeException("资产类型不存在: " + dto.getType().getId()));
            asset.setType(type);
        }
        if (dto.getStatus() != null) {
            asset.setStatus(Asset.AssetStatus.valueOf(dto.getStatus()));
        }
        asset.setVersion(dto.getVersion());
        asset.setLocation(dto.getLocation());
        asset.setDescription(dto.getDescription());
        asset.setAttributes(dto.getAttributes());
        
        asset = assetRepository.save(asset);
        
        String newValue = toAssetJson(asset);
        
        // Record history
        recordAssetHistory(asset, AssetHistory.ActionType.UPDATE, admin.getId(), oldValue, newValue);
        
        // Record audit log
        recordAuditLog(asset, "UPDATE", admin, null);
        
        return toAssetDTO(asset);
    }
    
    @Transactional
    public void deleteAsset(Long id, SystemAdmin admin) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("资产不存在: " + id));
        
        String oldValue = toAssetJson(asset);
        
        asset.setIsDeleted(true);
        asset.setDeletedAt(LocalDateTime.now());
        asset.setStatus(Asset.AssetStatus.DELETED);
        assetRepository.save(asset);
        
        // Record history
        recordAssetHistory(asset, AssetHistory.ActionType.DELETE, admin.getId(), oldValue, null);
        
        // Record audit log
        recordAuditLog(asset, "DELETE", admin, null);
    }
    
    public AssetDTO getAsset(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("资产不存在: " + id));
        return toAssetDTO(asset);
    }
    
    public Page<AssetDTO> searchAssets(AssetSearchRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Asset.AssetStatus status = request.getStatus() != null 
                ? Asset.AssetStatus.valueOf(request.getStatus()) 
                : null;
        
        Page<Asset> assets = assetRepository.searchAssets(
                request.getName(),
                request.getTypeId(),
                status,
                pageable
        );
        
        return assets.map(this::toAssetDTO);
    }
    
    private AssetDTO toAssetDTO(Asset asset) {
        AssetDTO dto = new AssetDTO();
        dto.setId(asset.getId());
        dto.setName(asset.getName());
        if (asset.getType() != null) {
            dto.setType(toAssetTypeDTO(asset.getType()));
        }
        dto.setStatus(asset.getStatus().name());
        dto.setVersion(asset.getVersion());
        dto.setLocation(asset.getLocation());
        if (asset.getOwner() != null) {
            dto.setOwnerId(asset.getOwner().getId());
            dto.setOwnerName(asset.getOwner().getUsername());
        }
        dto.setDescription(asset.getDescription());
        dto.setAttributes(asset.getAttributes());
        if (asset.getCreatedBy() != null) {
            dto.setCreatedById(asset.getCreatedBy().getId());
            dto.setCreatedByName(asset.getCreatedBy().getUsername());
        }
        dto.setCreatedAt(asset.getCreatedAt());
        dto.setUpdatedAt(asset.getUpdatedAt());
        return dto;
    }
    
    private String toAssetJson(Asset asset) {
        try {
            return objectMapper.writeValueAsString(asset);
        } catch (Exception e) {
            logger.warn("Failed to serialize asset to JSON", e);
            return "{}";
        }
    }
    
    // ========== Relationship Operations ==========
    
    @Transactional
    public AssetRelationshipDTO createRelationship(AssetRelationshipDTO dto, SystemAdmin admin) {
        Asset sourceAsset = assetRepository.findById(dto.getSourceAssetId())
                .orElseThrow(() -> new RuntimeException("源资产不存在: " + dto.getSourceAssetId()));
        Asset targetAsset = assetRepository.findById(dto.getTargetAssetId())
                .orElseThrow(() -> new RuntimeException("目标资产不存在: " + dto.getTargetAssetId()));
        RelationshipType relationshipType = relationshipTypeRepository.findById(dto.getRelationshipType().getId())
                .orElseThrow(() -> new RuntimeException("关系类型不存在: " + dto.getRelationshipType().getId()));
        
        AssetRelationship relationship = new AssetRelationship();
        relationship.setSourceAsset(sourceAsset);
        relationship.setTargetAsset(targetAsset);
        relationship.setRelationshipType(relationshipType);
        relationship.setProperties(dto.getProperties());
        relationship.setIsActive(true);
        
        relationship = assetRelationshipRepository.save(relationship);
        
        // Record audit log
        recordAuditLog(sourceAsset, "CREATE_RELATIONSHIP", admin, 
                "Created relationship: " + relationshipType.getName() + " -> " + targetAsset.getName());
        
        return toAssetRelationshipDTO(relationship);
    }
    
    public List<AssetRelationshipDTO> getAssetRelationships(Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("资产不存在: " + assetId));
        
        List<AssetRelationship> relationships = assetRelationshipRepository.findAllRelationshipsForAsset(asset);
        return relationships.stream()
                .map(this::toAssetRelationshipDTO)
                .collect(Collectors.toList());
    }
    
    private AssetRelationshipDTO toAssetRelationshipDTO(AssetRelationship relationship) {
        AssetRelationshipDTO dto = new AssetRelationshipDTO();
        dto.setId(relationship.getId());
        if (relationship.getSourceAsset() != null) {
            dto.setSourceAssetId(relationship.getSourceAsset().getId());
            dto.setSourceAssetName(relationship.getSourceAsset().getName());
        }
        if (relationship.getTargetAsset() != null) {
            dto.setTargetAssetId(relationship.getTargetAsset().getId());
            dto.setTargetAssetName(relationship.getTargetAsset().getName());
        }
        if (relationship.getRelationshipType() != null) {
            RelationshipTypeDTO typeDTO = new RelationshipTypeDTO();
            typeDTO.setId(relationship.getRelationshipType().getId());
            typeDTO.setName(relationship.getRelationshipType().getName());
            typeDTO.setCode(relationship.getRelationshipType().getCode());
            typeDTO.setDescription(relationship.getRelationshipType().getDescription());
            typeDTO.setIsDirectional(relationship.getRelationshipType().getIsDirectional());
            dto.setRelationshipType(typeDTO);
        }
        dto.setProperties(relationship.getProperties());
        dto.setIsActive(relationship.getIsActive());
        dto.setCreatedAt(relationship.getCreatedAt());
        dto.setUpdatedAt(relationship.getUpdatedAt());
        return dto;
    }
    
    // ========== History Operations ==========
    
    public List<AssetHistoryDTO> getAssetHistory(Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new RuntimeException("资产不存在: " + assetId));
        
        List<AssetHistory> history = assetHistoryRepository.findByAssetOrderByTimestampDesc(asset);
        return history.stream()
                .map(this::toAssetHistoryDTO)
                .collect(Collectors.toList());
    }
    
    private AssetHistoryDTO toAssetHistoryDTO(AssetHistory history) {
        AssetHistoryDTO dto = new AssetHistoryDTO();
        dto.setId(history.getId());
        if (history.getAsset() != null) {
            dto.setAssetId(history.getAsset().getId());
            dto.setAssetName(history.getAsset().getName());
        }
        dto.setAction(history.getAction().name());
        dto.setChangedBy(history.getChangedBy());
        dto.setOldValue(history.getOldValue());
        dto.setNewValue(history.getNewValue());
        dto.setChangeSummary(history.getChangeSummary());
        dto.setTimestamp(history.getTimestamp());
        return dto;
    }
    
    // ========== Audit Log Operations ==========
    
    public Page<AssetAuditLogDTO> getAuditLogs(Long assetId, Pageable pageable) {
        Asset asset = assetId != null 
                ? assetRepository.findById(assetId).orElse(null)
                : null;
        
        Page<AssetAuditLog> logs = asset != null
                ? assetAuditLogRepository.findByAssetOrderByCreatedAtDesc(asset, pageable)
                : assetAuditLogRepository.findAll(pageable);
        
        return logs.map(this::toAssetAuditLogDTO);
    }
    
    private AssetAuditLogDTO toAssetAuditLogDTO(AssetAuditLog log) {
        AssetAuditLogDTO dto = new AssetAuditLogDTO();
        dto.setId(log.getId());
        if (log.getAsset() != null) {
            dto.setAssetId(log.getAsset().getId());
            dto.setAssetName(log.getAsset().getName());
        }
        dto.setOperation(log.getOperation());
        dto.setOperatorId(log.getOperatorId());
        dto.setOperatorName(log.getOperatorName());
        dto.setDetails(log.getDetails());
        dto.setIpAddress(log.getIpAddress());
        dto.setUserAgent(log.getUserAgent());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
    
    // ========== Helper Methods ==========
    
    private void recordAssetHistory(Asset asset, AssetHistory.ActionType action, Long changedBy, 
                                   String oldValue, String newValue) {
        try {
            AssetHistory history = new AssetHistory();
            history.setAsset(asset);
            history.setAction(action);
            history.setChangedBy(changedBy);
            history.setOldValue(oldValue);
            history.setNewValue(newValue);
            history.setChangeSummary(generateChangeSummary(action, asset));
            assetHistoryRepository.save(history);
        } catch (Exception e) {
            logger.error("Failed to record asset history", e);
        }
    }
    
    private void recordAuditLog(Asset asset, String operation, SystemAdmin operator, String details) {
        try {
            AssetAuditLog log = new AssetAuditLog();
            log.setAsset(asset);
            log.setOperation(operation);
            log.setOperatorId(operator != null ? operator.getId() : null);
            log.setOperatorName(operator != null ? operator.getUsername() : null);
            if (details != null) {
                log.setDetails(details);
            }
            assetAuditLogRepository.save(log);
        } catch (Exception e) {
            logger.error("Failed to record audit log", e);
        }
    }
    
    private String generateChangeSummary(AssetHistory.ActionType action, Asset asset) {
        switch (action) {
            case CREATE:
                return "创建资产: " + asset.getName();
            case UPDATE:
                return "更新资产: " + asset.getName();
            case DELETE:
                return "删除资产: " + asset.getName();
            default:
                return "操作: " + action.name();
        }
    }
}
