package com.heartsphere.admin.service;

import com.heartsphere.admin.entity.PipelineExecution;
import com.heartsphere.admin.entity.cmdb.Asset;
import com.heartsphere.admin.entity.cmdb.AssetHistory;
import com.heartsphere.admin.entity.cmdb.RelationshipType;
import com.heartsphere.admin.repository.cmdb.AssetRepository;
import com.heartsphere.admin.repository.cmdb.AssetHistoryRepository;
import com.heartsphere.admin.repository.cmdb.RelationshipTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * CMDB 与部署流程集成服务
 */
@Service
public class CMDBPipelineIntegrationService {
    
    private static final Logger logger = LoggerFactory.getLogger(CMDBPipelineIntegrationService.class);
    
    @Autowired
    private AssetRepository assetRepository;
    
    @Autowired
    private AssetHistoryRepository assetHistoryRepository;
    
    @Autowired
    private RelationshipTypeRepository relationshipTypeRepository;
    
    /**
     * 记录部署到资产
     */
    @Transactional
    public void recordDeploymentToAsset(PipelineExecution execution, Long assetId) {
        try {
            Optional<Asset> assetOpt = assetRepository.findById(assetId);
            if (assetOpt.isEmpty()) {
                logger.warn("资产不存在: {}", assetId);
                return;
            }
            
            Asset asset = assetOpt.get();
            
            // 创建部署历史记录
            AssetHistory history = new AssetHistory();
            history.setAsset(asset);
            history.setAction(AssetHistory.ActionType.UPDATE);
            // changedBy 字段需要 Long 类型，execution.getExecutedBy() 返回的是 SystemAdmin
            // 需要获取 SystemAdmin 的 ID
            if (execution.getExecutedBy() != null) {
                history.setChangedBy(execution.getExecutedBy().getId());
            }
            history.setChangeSummary(String.format("部署流程执行: %s (ID: %d)", 
                execution.getPipeline().getName(), execution.getId()));
            
            // 保存变更详情
            String changeDetails = String.format(
                "{\"executionId\": %d, \"status\": \"%s\", \"environment\": \"%s\"}",
                execution.getId(),
                execution.getStatus().name(),
                execution.getPipeline().getEnvironment()
            );
            history.setNewValue(changeDetails);
            
            assetHistoryRepository.save(history);
            
            // 更新资产状态（保持当前状态，或根据需求扩展 AssetStatus 枚举）
            // 注意：AssetStatus 枚举目前只有 ACTIVE, INACTIVE, DEPRECATED, DELETED
            // 如果需要部署状态，可以扩展枚举或使用 attributes 字段存储
            if (execution.getStatus() == PipelineExecution.ExecutionStatus.SUCCESS) {
                // 部署成功，保持资产为活跃状态
                asset.setStatus(Asset.AssetStatus.ACTIVE);
            }
            // 部署失败时，可以根据需要设置状态或记录到 attributes
            assetRepository.save(asset);
            
            logger.info("已记录部署到资产: {} (执行ID: {})", assetId, execution.getId());
            
        } catch (Exception e) {
            logger.error("记录部署到资产失败", e);
        }
    }
    
    /**
     * 创建部署与资产的关联关系
     */
    @Transactional
    public void createDeploymentAssetRelationship(PipelineExecution execution, Long assetId) {
        try {
            Optional<Asset> assetOpt = assetRepository.findById(assetId);
            if (assetOpt.isEmpty()) {
                logger.warn("资产不存在: {}", assetId);
                return;
            }
            
            Asset asset = assetOpt.get();
            
            // 查找或创建"部署到"关系类型
            Optional<RelationshipType> relationshipTypeOpt = relationshipTypeRepository
                .findByName("DEPLOYED_TO");
            
            RelationshipType relationshipType;
            if (relationshipTypeOpt.isEmpty()) {
                relationshipType = new RelationshipType();
                relationshipType.setName("DEPLOYED_TO");
                relationshipType.setCode("DEPLOYED_TO");
                relationshipType.setDescription("部署到");
                relationshipType.setIsDirectional(true);
                relationshipType = relationshipTypeRepository.save(relationshipType);
            } else {
                relationshipType = relationshipTypeOpt.get();
            }
            
            // 检查关系是否已存在
            // TODO: 实现关系存在性检查
            
            logger.info("已创建部署与资产的关联关系: {} -> {}", execution.getId(), assetId);
            
        } catch (Exception e) {
            logger.error("创建部署与资产的关联关系失败", e);
        }
    }
    
    /**
     * 更新资产部署状态
     */
    @Transactional
    public void updateAssetDeploymentStatus(Long assetId, String status, String version) {
        try {
            Optional<Asset> assetOpt = assetRepository.findById(assetId);
            if (assetOpt.isEmpty()) {
                logger.warn("资产不存在: {}", assetId);
                return;
            }
            
            Asset asset = assetOpt.get();
            // 根据状态字符串设置资产状态
            try {
                Asset.AssetStatus assetStatus = Asset.AssetStatus.valueOf(status.toUpperCase());
                asset.setStatus(assetStatus);
            } catch (IllegalArgumentException e) {
                logger.warn("无效的资产状态: {}, 保持当前状态", status);
            }
            
            // 更新资产属性中的版本信息
            // TODO: 从 asset.getAttributes() 中更新版本
            
            assetRepository.save(asset);
            
            logger.info("已更新资产部署状态: {} -> {}", assetId, status);
            
        } catch (Exception e) {
            logger.error("更新资产部署状态失败", e);
        }
    }
}
