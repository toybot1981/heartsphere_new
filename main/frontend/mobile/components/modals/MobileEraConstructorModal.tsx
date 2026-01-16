/**
 * Mobile版本时代/场景构建模态框
 * 使用useEraConstructor hook复用PC业务逻辑，UI独立
 */

import React, { memo } from 'react';
import { MobileModalContainer } from '../MobileModalContainer';
import { MobileTouchableButton } from '../MobileTouchableButton';
import { MobileFormField } from '../MobileFormField';
import { MobileLoadingSpinner } from '../MobileLoadingSpinner';
import { MobileStatusStyles, MobileColors, MobileTypography, MobileSpacing, MobileInputStyles, MobileCardStyles } from '../MobileStyleGuide';
import { useEraConstructor } from '../../hooks/useEraConstructor';
import type { WorldScene, WorldStyle } from '../../../types';
import { WORLD_STYLE_DESCRIPTIONS } from '../../../types';

interface MobileEraConstructorModalProps {
  initialScene?: WorldScene | null;
  onSave: (scene: WorldScene) => void;
  onDelete?: () => void;
  onClose: () => void;
  worldStyle?: string;
}

/**
 * Mobile版本时代/场景构建模态框
 * 参照PC版本EraConstructorModal，按照Mobile风格重新设计
 */
export const MobileEraConstructorModal: React.FC<MobileEraConstructorModalProps> = memo(({
  initialScene,
  onSave,
  onDelete,
  onClose,
  worldStyle,
}) => {
  const {
    name,
    description,
    imageUrl,
    style,
    imageMode,
    creationMode,
    selectedPresetEraId,
    isLoading,
    isUploading,
    isGeneratingImage,
    loadingSystemEras,
    error,
    systemEras,
    setName,
    setDescription,
    setImageUrl,
    setStyle,
    setImageMode,
    setCreationMode,
    handleGetPrompt,
    handleGenerateImage,
    handleUploadImage,
    handleSelectPresetEra,
    handleSave,
    handleDelete,
  } = useEraConstructor({
    initialScene,
    worldStyle,
    onSave,
    onDelete,
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUploadImage(file);
    }
  };

  return (
    <MobileModalContainer
      isOpen={true}
      onClose={onClose}
      title={initialScene ? '编辑场景' : '创建场景'}
      size="lg"
      closeOnBackdrop={!isLoading}
    >
      <div className="flex flex-col min-h-0 max-h-[calc(90vh-8rem)]">
        {/* 错误提示 */}
        {error && (
          <div className={`${MobileStatusStyles.error.container} ${MobileSpacing.margin.bottom.md}`} role="alert">
            <p className={MobileStatusStyles.error.text}>{error}</p>
          </div>
        )}

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className={`space-y-4 ${MobileSpacing.padding.md}`}>
            {/* 创建模式选择（仅新建时显示） */}
            {!initialScene && (
              <div className="space-y-3">
                <label className={`block ${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary} mb-3`}>
                  创建方式
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCreationMode('preset')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      creationMode === 'preset'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-600 hover:border-purple-500/30'
                    }`}
                  >
                    <span className={`${MobileTypography.fontSize.sm} ${MobileColors.text.primary}`}>
                      预置场景
                    </span>
                  </button>
                  <button
                    onClick={() => setCreationMode('custom')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      creationMode === 'custom'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-600 hover:border-purple-500/30'
                    }`}
                  >
                    <span className={`${MobileTypography.fontSize.sm} ${MobileColors.text.primary}`}>
                      自定义
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 预置场景选择 */}
            {!initialScene && creationMode === 'preset' && (
              <div className="space-y-3">
                {loadingSystemEras ? (
                  <div className="flex justify-center py-8">
                    <MobileLoadingSpinner size="md" />
                  </div>
                ) : systemEras.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {systemEras.map(era => (
                      <div
                        key={era.id}
                        onClick={() => handleSelectPresetEra(era.id)}
                        className={`${MobileCardStyles.default} p-3 cursor-pointer transition-all ${
                          selectedPresetEraId === era.id
                            ? 'border-purple-500/50 bg-purple-500/10'
                            : 'hover:border-purple-500/30'
                        } ${MobileCardStyles.interactive}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`选择预置场景：${era.name}`}
                      >
                        <h4 className={`${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary}`}>
                          {era.name}
                        </h4>
                        <p className={`${MobileTypography.fontSize.sm} ${MobileColors.text.secondary} mt-1`}>
                          {era.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${MobileTypography.fontSize.sm} ${MobileColors.text.muted}`}>
                    暂无预置场景
                  </div>
                )}
              </div>
            )}

            {/* 自定义表单 */}
            {(initialScene || creationMode === 'custom') && (
              <>
                <MobileFormField label="场景名称" required>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="输入场景名称"
                    className={MobileInputStyles}
                    disabled={isLoading}
                    aria-label="场景名称"
                  />
                </MobileFormField>

                <MobileFormField label="场景简介" required>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="输入场景简介..."
                    rows={4}
                    className={`${MobileInputStyles} resize-none`}
                    disabled={isLoading}
                    aria-label="场景简介"
                  />
                </MobileFormField>

                {/* 场景风格选择 */}
                <MobileFormField label="场景风格">
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as WorldStyle)}
                    className={MobileInputStyles}
                    disabled={isLoading}
                    aria-label="场景风格"
                  >
                    {(Object.keys(WORLD_STYLE_DESCRIPTIONS) as WorldStyle[]).map((styleOption) => (
                      <option key={styleOption} value={styleOption}>
                        {WORLD_STYLE_DESCRIPTIONS[styleOption].name}
                      </option>
                    ))}
                  </select>
                  <p className={`${MobileTypography.fontSize.xs} ${MobileColors.text.muted} mt-1`}>
                    {WORLD_STYLE_DESCRIPTIONS[style].description}。风格将影响场景和角色图片的生成。
                  </p>
                </MobileFormField>

                {/* 图片设置 */}
                <div className="space-y-3">
                  <label className={`block ${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary}`}>
                    场景封面
                  </label>

                  {/* 图片模式选择 */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setImageMode('generate')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        imageMode === 'generate'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-600 hover:border-purple-500/30'
                      }`}
                      disabled={isLoading || isGeneratingImage}
                    >
                      <span className={`${MobileTypography.fontSize.sm} ${MobileColors.text.primary}`}>
                        AI生成
                      </span>
                    </button>
                    <button
                      onClick={() => setImageMode('upload')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        imageMode === 'upload'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-600 hover:border-purple-500/30'
                      }`}
                      disabled={isLoading || isUploading}
                    >
                      <span className={`${MobileTypography.fontSize.sm} ${MobileColors.text.primary}`}>
                        上传图片
                      </span>
                    </button>
                  </div>

                  {/* AI生成 */}
                  {imageMode === 'generate' && (
                    <div className="space-y-2">
                      <MobileTouchableButton
                        variant="secondary"
                        size="md"
                        fullWidth
                        onClick={handleGenerateImage}
                        disabled={isLoading || isGeneratingImage || !name || !description}
                        loading={isGeneratingImage}
                        aria-label="生成封面图片"
                      >
                        生成封面图片
                      </MobileTouchableButton>
                      <MobileTouchableButton
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={handleGetPrompt}
                        disabled={!name || !description}
                        aria-label="复制提示词"
                      >
                        📋 复制提示词
                      </MobileTouchableButton>
                    </div>
                  )}

                  {/* 上传图片 */}
                  {imageMode === 'upload' && (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        aria-label="选择图片文件"
                      />
                      <MobileTouchableButton
                        variant="secondary"
                        size="md"
                        fullWidth
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || isUploading}
                        loading={isUploading}
                        aria-label="上传图片"
                      >
                        选择图片文件
                      </MobileTouchableButton>
                    </div>
                  )}

                  {/* 图片预览 */}
                  {imageUrl && (
                    <div className={`${MobileCardStyles.default} p-3`}>
                      <img
                        src={imageUrl}
                        alt="场景封面预览"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className={`flex items-center justify-between gap-3 ${MobileSpacing.padding.md} border-t ${MobileColors.border.default} mt-4 pt-4 shrink-0`}>
          {initialScene && onDelete && (
            <MobileTouchableButton
              variant="danger"
              size="md"
              onClick={handleDelete}
              disabled={isLoading}
              aria-label="删除场景"
            >
              删除
            </MobileTouchableButton>
          )}
          {!initialScene && (
            <div className="flex-1" />
          )}

          <div className="flex gap-3 flex-1 justify-end">
            <MobileTouchableButton
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={isLoading}
              aria-label="取消"
            >
              取消
            </MobileTouchableButton>
            <MobileTouchableButton
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={isLoading || !name.trim() || !description.trim()}
              loading={isLoading}
              aria-label={initialScene ? '保存更改' : '创建场景'}
            >
              {initialScene ? '保存' : '创建'}
            </MobileTouchableButton>
          </div>
        </div>
      </div>
    </MobileModalContainer>
  );
});

MobileEraConstructorModal.displayName = 'MobileEraConstructorModal';
