/**
 * 传送门管理界面组件
 * 提供创建、编辑、删除、查看传送门的功能
 */

import React, { useState, useEffect } from 'react';
import { usePortal } from '../../hooks/usePortal';
import { portalApi } from '../../services/api/portal';
import type { PortalConfig, CreatePortalRequest, UpdatePortalRequest } from '../../services/api/portal/types';
import { logger } from '../../utils/logger';

interface PortalManagementProps {
  sceneId: number;
  onClose?: () => void;
  onPortalCreated?: (portal: PortalConfig) => void;
  onPortalUpdated?: (portal: PortalConfig) => void;
  onPortalDeleted?: (portalId: number) => void;
}

/**
 * 传送门管理界面
 */
export const PortalManagement: React.FC<PortalManagementProps> = ({
  sceneId,
  onClose,
  onPortalCreated,
  onPortalUpdated,
  onPortalDeleted,
}) => {
  const {
    portals,
    loading,
    error,
    loadPortals,
    createPortal,
    updatePortal,
    deletePortal,
  } = usePortal(sceneId);

  // UI状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<PortalConfig | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 表单数据
  const [formData, setFormData] = useState<Partial<CreatePortalRequest>>({
    sceneId,
    portalName: '',
    portalType: 'stargate',
    targetHeartsphereId: undefined,
    targetShareCode: '',
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    size: 3.0,
    permissionType: 'approval',
    description: '',
  });

  // 加载传送门列表
  useEffect(() => {
    if (sceneId) {
      loadPortals(sceneId);
    }
  }, [sceneId, loadPortals]);

  // ==================== 事件处理方法 ====================
  // 步骤1: 创建相关方法
  
  /**
   * 打开创建传送门表单
   */
  const handleCreatePortal = () => {
    setFormData({
      sceneId,
      portalName: '',
      portalType: 'stargate',
      targetHeartsphereId: undefined,
      targetShareCode: '',
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      size: 3.0,
      permissionType: 'approval',
      description: '',
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  /**
   * 验证表单
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.portalName || formData.portalName.trim().length === 0) {
      errors.portalName = '传送门名称不能为空';
    } else if (formData.portalName.length > 100) {
      errors.portalName = '传送门名称不能超过100个字符';
    }

    if (!formData.targetHeartsphereId && (!formData.targetShareCode || formData.targetShareCode.trim().length === 0)) {
      errors.target = '必须指定目标心域ID或共享码';
    }

    if (formData.size !== undefined && (formData.size < 0.1 || formData.size > 100)) {
      errors.size = '尺寸必须在0.1到100之间';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * 提交创建传送门
   */
  const handleCreateSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const request: CreatePortalRequest = {
        sceneId: formData.sceneId!,
        portalName: formData.portalName!.trim(),
        portalType: formData.portalType || 'stargate',
        targetHeartsphereId: formData.targetHeartsphereId,
        targetShareCode: formData.targetShareCode?.trim() || undefined,
        positionX: formData.positionX || 0,
        positionY: formData.positionY || 0,
        positionZ: formData.positionZ || 0,
        size: formData.size || 3.0,
        permissionType: formData.permissionType || 'approval',
        description: formData.description?.trim() || undefined,
      };

      const portal = await createPortal(request);
      if (portal) {
        logger.info('[PortalManagement] 传送门创建成功:', portal);
        setShowCreateModal(false);
        onPortalCreated?.(portal);
        // 刷新列表
        await loadPortals(sceneId);
      }
    } catch (error: any) {
      logger.error('[PortalManagement] 创建传送门失败:', error);
      setFormErrors({ submit: error?.message || '创建传送门失败，请稍后重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 取消创建
   */
  const handleCreateCancel = () => {
    setShowCreateModal(false);
    setFormData({
      sceneId,
      portalName: '',
      portalType: 'stargate',
      targetHeartsphereId: undefined,
      targetShareCode: '',
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      size: 3.0,
      permissionType: 'approval',
      description: '',
    });
    setFormErrors({});
  };

  // 步骤2: 编辑和删除相关方法
  
  /**
   * 打开编辑传送门表单
   */
  const handleEditPortal = (portal: PortalConfig) => {
    setSelectedPortal(portal);
    setFormData({
      sceneId: portal.sceneId,
      portalName: portal.portalName,
      portalType: portal.portalType,
      targetHeartsphereId: portal.targetHeartsphereId,
      targetShareCode: portal.targetShareCode || '',
      positionX: portal.positionX || 0,
      positionY: portal.positionY || 0,
      positionZ: portal.positionZ || 0,
      size: portal.size || 3.0,
      permissionType: portal.permissionType,
      description: portal.description || '',
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  /**
   * 提交编辑传送门
   */
  const handleEditSubmit = async () => {
    if (!selectedPortal) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const request: UpdatePortalRequest = {
        portalName: formData.portalName?.trim(),
        portalType: formData.portalType,
        targetHeartsphereId: formData.targetHeartsphereId,
        targetShareCode: formData.targetShareCode?.trim() || undefined,
        positionX: formData.positionX,
        positionY: formData.positionY,
        positionZ: formData.positionZ,
        size: formData.size,
        permissionType: formData.permissionType,
        description: formData.description?.trim() || undefined,
        isActive: selectedPortal.isActive, // 保持当前激活状态
      };

      const portal = await updatePortal(selectedPortal.id, request);
      if (portal) {
        logger.info('[PortalManagement] 传送门更新成功:', portal);
        setShowEditModal(false);
        setSelectedPortal(null);
        onPortalUpdated?.(portal);
        // 刷新列表
        await loadPortals(sceneId);
      }
    } catch (error: any) {
      logger.error('[PortalManagement] 更新传送门失败:', error);
      setFormErrors({ submit: error?.message || '更新传送门失败，请稍后重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 取消编辑
   */
  const handleEditCancel = () => {
    setShowEditModal(false);
    setSelectedPortal(null);
    setFormData({
      sceneId,
      portalName: '',
      portalType: 'stargate',
      targetHeartsphereId: undefined,
      targetShareCode: '',
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      size: 3.0,
      permissionType: 'approval',
      description: '',
    });
    setFormErrors({});
  };

  /**
   * 打开删除确认对话框
   */
  const handleDeletePortal = (portalId: number) => {
    setDeleteConfirmId(portalId);
  };

  /**
   * 确认删除传送门
   */
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;

    setIsSubmitting(true);
    try {
      const success = await deletePortal(deleteConfirmId);
      if (success) {
        logger.info('[PortalManagement] 传送门删除成功: portalId=', deleteConfirmId);
        onPortalDeleted?.(deleteConfirmId);
        setDeleteConfirmId(null);
        // 刷新列表
        await loadPortals(sceneId);
      }
    } catch (error: any) {
      logger.error('[PortalManagement] 删除传送门失败:', error);
      alert('删除传送门失败：' + (error?.message || '请稍后重试'));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 取消删除
   */
  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  // ==================== 渲染方法 ====================
  // 步骤1: 创建表单渲染
  
  /**
   * 渲染创建表单
   */
  const renderCreateForm = () => {
    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* 传送门名称 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            传送门名称 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.portalName || ''}
            onChange={(e) => setFormData({ ...formData, portalName: e.target.value })}
            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
              formErrors.portalName ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-indigo-500'
            }`}
            placeholder="输入传送门名称"
            maxLength={100}
          />
          {formErrors.portalName && (
            <p className="mt-1 text-sm text-red-400">{formErrors.portalName}</p>
          )}
        </div>

        {/* 传送门类型 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            传送门类型
          </label>
          <select
            value={formData.portalType || 'stargate'}
            onChange={(e) => setFormData({ ...formData, portalType: e.target.value as any })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="stargate">星门 (Stargate)</option>
            <option value="wormhole">虫洞 (Wormhole)</option>
            <option value="quantum">量子 (Quantum)</option>
          </select>
        </div>

        {/* 目标心域设置 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            目标心域 <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            <div>
              <label className="flex items-center mb-1">
                <input
                  type="radio"
                  name="targetType"
                  checked={!!formData.targetHeartsphereId}
                  onChange={() => setFormData({ ...formData, targetShareCode: '' })}
                  className="mr-2"
                />
                <span className="text-sm text-slate-300">使用心域ID</span>
              </label>
              <input
                type="number"
                value={formData.targetHeartsphereId || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  targetHeartsphereId: e.target.value ? parseInt(e.target.value) : undefined,
                })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="输入目标心域ID"
              />
            </div>
            <div>
              <label className="flex items-center mb-1">
                <input
                  type="radio"
                  name="targetType"
                  checked={!formData.targetHeartsphereId}
                  onChange={() => setFormData({ ...formData, targetHeartsphereId: undefined })}
                  className="mr-2"
                />
                <span className="text-sm text-slate-300">使用共享码</span>
              </label>
              <input
                type="text"
                value={formData.targetShareCode || ''}
                onChange={(e) => setFormData({ ...formData, targetShareCode: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  formErrors.target ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-indigo-500'
                }`}
                placeholder="输入共享码（如：SC-XXXXXX）"
              />
            </div>
          </div>
          {formErrors.target && (
            <p className="mt-1 text-sm text-red-400">{formErrors.target}</p>
          )}
        </div>

        {/* 位置设置 */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">X坐标</label>
            <input
              type="number"
              step="0.1"
              value={formData.positionX || 0}
              onChange={(e) => setFormData({ ...formData, positionX: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Y坐标</label>
            <input
              type="number"
              step="0.1"
              value={formData.positionY || 0}
              onChange={(e) => setFormData({ ...formData, positionY: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Z坐标</label>
            <input
              type="number"
              step="0.1"
              value={formData.positionZ || 0}
              onChange={(e) => setFormData({ ...formData, positionZ: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 尺寸 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            尺寸 (米)
            {formData.size !== undefined && (
              <span className="ml-2 text-slate-400 text-xs">({formData.size})</span>
            )}
          </label>
          <input
            type="range"
            min="0.1"
            max="100"
            step="0.1"
            value={formData.size || 3.0}
            onChange={(e) => setFormData({ ...formData, size: parseFloat(e.target.value) })}
            className="w-full"
          />
          {formErrors.size && (
            <p className="mt-1 text-sm text-red-400">{formErrors.size}</p>
          )}
        </div>

        {/* 权限类型 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">访问权限</label>
          <select
            value={formData.permissionType || 'approval'}
            onChange={(e) => setFormData({ ...formData, permissionType: e.target.value as any })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="public">公开 - 所有人可访问</option>
            <option value="approval">需审批 - 需要主人同意</option>
            <option value="invite">仅邀请 - 仅受邀用户可访问</option>
          </select>
        </div>

        {/* 描述 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">描述（可选）</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="输入传送门描述..."
            maxLength={500}
          />
        </div>

        {/* 提交错误 */}
        {formErrors.submit && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-300">{formErrors.submit}</p>
          </div>
        )}
      </div>
    );
  };

  /**
   * 渲染创建模态框
   */
  const renderCreateModal = () => {
    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
          <h3 className="text-xl font-bold text-white mb-4">创建传送门</h3>
          
          {renderCreateForm()}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
            <button
              onClick={handleCreateCancel}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              取消
            </button>
            <button
              onClick={handleCreateSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '创建中...' : '创建'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 步骤2: 编辑表单和删除确认渲染
  
  /**
   * 渲染编辑表单（复用创建表单的结构，但预填充数据）
   */
  const renderEditForm = () => {
    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* 传送门名称 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            传送门名称 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.portalName || ''}
            onChange={(e) => setFormData({ ...formData, portalName: e.target.value })}
            className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
              formErrors.portalName ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-indigo-500'
            }`}
            placeholder="输入传送门名称"
            maxLength={100}
          />
          {formErrors.portalName && (
            <p className="mt-1 text-sm text-red-400">{formErrors.portalName}</p>
          )}
        </div>

        {/* 传送门类型 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            传送门类型
          </label>
          <select
            value={formData.portalType || 'stargate'}
            onChange={(e) => setFormData({ ...formData, portalType: e.target.value as any })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="stargate">星门 (Stargate)</option>
            <option value="wormhole">虫洞 (Wormhole)</option>
            <option value="quantum">量子 (Quantum)</option>
          </select>
        </div>

        {/* 目标心域设置 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            目标心域 <span className="text-red-400">*</span>
          </label>
          <div className="space-y-2">
            <div>
              <label className="flex items-center mb-1">
                <input
                  type="radio"
                  name="targetType"
                  checked={!!formData.targetHeartsphereId}
                  onChange={() => setFormData({ ...formData, targetShareCode: '' })}
                  className="mr-2"
                />
                <span className="text-sm text-slate-300">使用心域ID</span>
              </label>
              <input
                type="number"
                value={formData.targetHeartsphereId || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  targetHeartsphereId: e.target.value ? parseInt(e.target.value) : undefined,
                })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="输入目标心域ID"
              />
            </div>
            <div>
              <label className="flex items-center mb-1">
                <input
                  type="radio"
                  name="targetType"
                  checked={!formData.targetHeartsphereId}
                  onChange={() => setFormData({ ...formData, targetHeartsphereId: undefined })}
                  className="mr-2"
                />
                <span className="text-sm text-slate-300">使用共享码</span>
              </label>
              <input
                type="text"
                value={formData.targetShareCode || ''}
                onChange={(e) => setFormData({ ...formData, targetShareCode: e.target.value })}
                className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  formErrors.target ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-indigo-500'
                }`}
                placeholder="输入共享码（如：SC-XXXXXX）"
              />
            </div>
          </div>
          {formErrors.target && (
            <p className="mt-1 text-sm text-red-400">{formErrors.target}</p>
          )}
        </div>

        {/* 位置设置 */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">X坐标</label>
            <input
              type="number"
              step="0.1"
              value={formData.positionX || 0}
              onChange={(e) => setFormData({ ...formData, positionX: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Y坐标</label>
            <input
              type="number"
              step="0.1"
              value={formData.positionY || 0}
              onChange={(e) => setFormData({ ...formData, positionY: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Z坐标</label>
            <input
              type="number"
              step="0.1"
              value={formData.positionZ || 0}
              onChange={(e) => setFormData({ ...formData, positionZ: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 尺寸 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            尺寸 (米)
            {formData.size !== undefined && (
              <span className="ml-2 text-slate-400 text-xs">({formData.size})</span>
            )}
          </label>
          <input
            type="range"
            min="0.1"
            max="100"
            step="0.1"
            value={formData.size || 3.0}
            onChange={(e) => setFormData({ ...formData, size: parseFloat(e.target.value) })}
            className="w-full"
          />
          {formErrors.size && (
            <p className="mt-1 text-sm text-red-400">{formErrors.size}</p>
          )}
        </div>

        {/* 权限类型 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">访问权限</label>
          <select
            value={formData.permissionType || 'approval'}
            onChange={(e) => setFormData({ ...formData, permissionType: e.target.value as any })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="public">公开 - 所有人可访问</option>
            <option value="approval">需审批 - 需要主人同意</option>
            <option value="invite">仅邀请 - 仅受邀用户可访问</option>
          </select>
        </div>

        {/* 激活状态（编辑模式特有） */}
        {selectedPortal && (
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedPortal.isActive !== false}
                onChange={(e) => {
                  if (selectedPortal) {
                    setSelectedPortal({ ...selectedPortal, isActive: e.target.checked });
                  }
                }}
                className="mr-2 w-4 h-4"
              />
              <span className="text-sm text-slate-300">激活传送门</span>
            </label>
            <p className="text-xs text-slate-500 mt-1">禁用后传送门将不可见且无法使用</p>
          </div>
        )}

        {/* 描述 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">描述（可选）</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="输入传送门描述..."
            maxLength={500}
          />
        </div>

        {/* 提交错误 */}
        {formErrors.submit && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-300">{formErrors.submit}</p>
          </div>
        )}
      </div>
    );
  };

  /**
   * 渲染编辑模态框
   */
  const renderEditModal = () => {
    if (!showEditModal || !selectedPortal) return null;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col">
          <h3 className="text-xl font-bold text-white mb-4">编辑传送门</h3>
          
          {renderEditForm()}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
            <button
              onClick={handleEditCancel}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              取消
            </button>
            <button
              onClick={handleEditSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * 渲染删除确认对话框
   */
  const renderDeleteConfirm = () => {
    if (!deleteConfirmId) return null;

    const portal = portals.find(p => p.id === deleteConfirmId);
    if (!portal) return null;

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
          <h3 className="text-xl font-bold text-white mb-4">确认删除传送门</h3>
          
          <div className="mb-6">
            <p className="text-slate-300 mb-4">
              确定要删除传送门 <span className="font-semibold text-white">「{portal.portalName}」</span> 吗？
            </p>
            <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <p className="text-sm text-yellow-300">
                ⚠️ 此操作不可撤销。删除后，所有与此传送门相关的权限和记录也将被删除。
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleDeleteCancel}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              取消
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '删除中...' : '确认删除'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * 渲染增强的传送门列表
   */
  const renderPortalList = () => {
    if (!loading && portals.length === 0) {
      return (
        <div className="text-center py-12 text-slate-400">
          <p className="mb-4">暂无传送门</p>
          <button
            onClick={handleCreatePortal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            创建第一个传送门
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {portals.map(portal => (
          <div
            key={portal.id}
            className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/70 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {portal.portalName}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      portal.isActive
                        ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                        : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                    }`}
                  >
                    {portal.isActive ? '激活' : '禁用'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      portal.portalType === 'stargate'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                        : portal.portalType === 'wormhole'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    }`}
                  >
                    {portal.portalType === 'stargate'
                      ? '星门'
                      : portal.portalType === 'wormhole'
                      ? '虫洞'
                      : '量子'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-400 mb-2">
                  <div>
                    <span className="text-slate-500">权限:</span>{' '}
                    {portal.permissionType === 'public'
                      ? '公开'
                      : portal.permissionType === 'approval'
                      ? '需审批'
                      : '仅邀请'}
                  </div>
                  <div>
                    <span className="text-slate-500">位置:</span>{' '}
                    ({portal.positionX?.toFixed(1)}, {portal.positionY?.toFixed(1)}, {portal.positionZ?.toFixed(1)})
                  </div>
                  <div>
                    <span className="text-slate-500">尺寸:</span> {portal.size?.toFixed(1)}m
                  </div>
                  {portal.targetHeartsphereId && (
                    <div>
                      <span className="text-slate-500">目标:</span> 心域ID {portal.targetHeartsphereId}
                    </div>
                  )}
                  {portal.targetShareCode && (
                    <div>
                      <span className="text-slate-500">目标:</span> {portal.targetShareCode}
                    </div>
                  )}
                </div>

                {portal.description && (
                  <p className="text-sm text-slate-400 line-clamp-2 mt-2">
                    {portal.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEditPortal(portal)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                  title="编辑传送门"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDeletePortal(portal.id)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                  title="删除传送门"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ==================== 主界面渲染 ====================
  return (
    <div className="portal-management-container bg-slate-900/95 border border-slate-700 rounded-xl p-6 max-w-4xl mx-auto my-8">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">传送门管理</h2>
        <div className="flex gap-3">
          <button
            onClick={handleCreatePortal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            + 创建传送门
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              关闭
            </button>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-8 text-slate-400">
          加载中...
        </div>
      )}

      {/* 传送门列表 */}
      {!loading && renderPortalList()}

      {/* 创建模态框 */}
      {renderCreateModal()}

      {/* 编辑模态框 */}
      {renderEditModal()}

      {/* 删除确认对话框 */}
      {renderDeleteConfirm()}
    </div>
  );
};
