/**
 * Mobile版本角色构建模态框
 * 使用useCharacterConstructor hook复用PC业务逻辑，UI独立
 */

import React, { memo, useRef } from 'react';
import { MobileModalContainer } from '../MobileModalContainer';
import { MobileTouchableButton } from '../MobileTouchableButton';
import { MobileFormField } from '../MobileFormField';
import { MobileLoadingSpinner } from '../MobileLoadingSpinner';
import { MobileStatusStyles, MobileColors, MobileTypography, MobileSpacing, MobileInputStyles, MobileCardStyles } from '../MobileStyleGuide';
import { useCharacterConstructor } from '../../hooks/useCharacterConstructor';
import type { WorldScene } from '../../../types';

interface MobileCharacterConstructorModalProps {
  scene: WorldScene;
  initialCharacter?: any | null;
  onSave: (character: any) => void;
  onClose: () => void;
  worldStyle?: string;
}

/**
 * Mobile版本角色构建模态框
 * 参照PC版本CharacterConstructorModal，按照Mobile风格重新设计（简化版）
 */
export const MobileCharacterConstructorModal: React.FC<MobileCharacterConstructorModalProps> = memo(({
  scene,
  initialCharacter,
  onSave,
  onClose,
  worldStyle,
}) => {
  const {
    name,
    description,
    avatarUrl,
    backgroundUrl,
    prompt,
    isLoading,
    isUploadingAvatar,
    isUploadingBackground,
    error,
    systemCharacters,
    creationMode,
    loadingSystemCharacters,
    setName,
    setDescription,
    setAvatarUrl,
    setBackgroundUrl,
    setPrompt,
    setError,
    setCreationMode,
    handleGenerateCharacter,
    handleUploadAvatar,
    handleUploadBackground,
    handleSelectPresetCharacter,
    handleSave,
  } = useCharacterConstructor({
    scene,
    initialCharacter,
    worldStyle,
    onSave,
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUploadAvatar(file);
    }
  };

  const handleBackgroundFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUploadBackground(file);
    }
  };

  return (
    <MobileModalContainer
      isOpen={true}
      onClose={onClose}
      title={initialCharacter ? '编辑角色' : '创建角色'}
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
            {!initialCharacter && scene.systemEraId && (
              <div className="space-y-3">
                <label className={`block ${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary} mb-3`}>
                  创建方式
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCreationMode('preset')}
                    className="flex-1 p-3 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: creationMode === 'preset'
                        ? 'var(--color-primary, #a855f7)'
                        : 'var(--border-color-overlay, #475569)',
                      backgroundColor: creationMode === 'preset'
                        ? 'var(--color-primary, rgba(168, 85, 247, 0.1))'
                        : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (creationMode !== 'preset') {
                        e.currentTarget.style.borderColor = 'var(--color-primary, rgba(168, 85, 247, 0.3))';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (creationMode !== 'preset') {
                        e.currentTarget.style.borderColor = 'var(--border-color-overlay, #475569)';
                      }
                    }}
                  >
                    <span className={`${MobileTypography.fontSize.sm}`} style={{ color: 'var(--text-primary)' }}>
                      预置角色
                    </span>
                  </button>
                  <button
                    onClick={() => setCreationMode('custom')}
                    className="flex-1 p-3 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: creationMode === 'custom'
                        ? 'var(--color-primary, #a855f7)'
                        : 'var(--border-color-overlay, #475569)',
                      backgroundColor: creationMode === 'custom'
                        ? 'var(--color-primary, rgba(168, 85, 247, 0.1))'
                        : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (creationMode !== 'custom') {
                        e.currentTarget.style.borderColor = 'var(--color-primary, rgba(168, 85, 247, 0.3))';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (creationMode !== 'custom') {
                        e.currentTarget.style.borderColor = 'var(--border-color-overlay, #475569)';
                      }
                    }}
                  >
                    <span className={`${MobileTypography.fontSize.sm}`} style={{ color: 'var(--text-primary)' }}>
                      自定义
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 预置角色选择 */}
            {!initialCharacter && creationMode === 'preset' && scene.systemEraId && (
              <div className="space-y-3">
                {loadingSystemCharacters ? (
                  <div className="flex justify-center py-8">
                    <MobileLoadingSpinner size="md" />
                  </div>
                ) : systemCharacters.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {systemCharacters.map(char => (
                      <div
                        key={char.id}
                        onClick={() => handleSelectPresetCharacter(char)}
                        className={`${MobileCardStyles.default} p-3 cursor-pointer transition-all ${MobileCardStyles.interactive}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-primary, rgba(168, 85, 247, 0.3))';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`选择预置角色：${char.name}`}
                      >
                        <div className="flex items-center gap-3">
                          {char.avatarUrl && (
                            <img
                              src={char.avatarUrl}
                              alt={char.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className={`${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary}`}>
                              {char.name}
                            </h4>
                            <p className={`${MobileTypography.fontSize.sm} ${MobileColors.text.secondary} mt-1 line-clamp-2`}>
                              {char.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${MobileTypography.fontSize.sm} ${MobileColors.text.muted}`}>
                    暂无预置角色
                  </div>
                )}
              </div>
            )}

            {/* 自定义表单 */}
            {(initialCharacter || creationMode === 'custom') && (
              <>
                {/* AI生成角色 */}
                {!initialCharacter && (
                  <div className={`${MobileCardStyles.default} p-4 space-y-3`}>
                    <MobileFormField label="角色描述" hint="描述角色的外观、性格、背景等">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="例如：一位温柔的女医生，有着棕色的长发和温暖的笑容..."
                        rows={3}
                        className={`${MobileInputStyles} resize-none`}
                        disabled={isLoading}
                        aria-label="角色描述"
                      />
                    </MobileFormField>
                    <MobileTouchableButton
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={handleGenerateCharacter}
                      disabled={isLoading || !prompt.trim()}
                      loading={isLoading}
                      aria-label="AI生成角色"
                    >
                      ✨ AI生成角色
                    </MobileTouchableButton>
                  </div>
                )}

                <MobileFormField label="角色名称" required>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="输入角色名称"
                    className={MobileInputStyles}
                    disabled={isLoading}
                    aria-label="角色名称"
                  />
                </MobileFormField>

                <MobileFormField label="角色简介" required>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="输入角色简介..."
                    rows={4}
                    className={`${MobileInputStyles} resize-none`}
                    disabled={isLoading}
                    aria-label="角色简介"
                  />
                </MobileFormField>

                {/* 头像上传 */}
                <div className="space-y-3">
                  <label className={`block ${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary}`}>
                    角色头像
                  </label>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/*"
                    className="hidden"
                    aria-label="选择头像图片"
                  />
                  <MobileTouchableButton
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isLoading || isUploadingAvatar}
                    loading={isUploadingAvatar}
                    aria-label="上传头像"
                  >
                    上传头像图片
                  </MobileTouchableButton>
                  {avatarUrl && (
                    <div className={`${MobileCardStyles.default} p-3`}>
                      <img
                        src={avatarUrl}
                        alt="头像预览"
                        className="w-24 h-24 rounded-full object-cover mx-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* 背景上传 */}
                <div className="space-y-3">
                  <label className={`block ${MobileTypography.fontSize.base} ${MobileTypography.fontWeight.semibold} ${MobileColors.text.primary}`}>
                    角色背景（可选）
                  </label>
                  <input
                    type="file"
                    ref={bgInputRef}
                    onChange={handleBackgroundFileChange}
                    accept="image/*"
                    className="hidden"
                    aria-label="选择背景图片"
                  />
                  <MobileTouchableButton
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={() => bgInputRef.current?.click()}
                    disabled={isLoading || isUploadingBackground}
                    loading={isUploadingBackground}
                    aria-label="上传背景"
                  >
                    上传背景图片
                  </MobileTouchableButton>
                  {backgroundUrl && (
                    <div className={`${MobileCardStyles.default} p-3`}>
                      <img
                        src={backgroundUrl}
                        alt="背景预览"
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
        <div className={`flex items-center justify-end gap-3 ${MobileSpacing.padding.md} border-t ${MobileColors.border.default} mt-4 pt-4 shrink-0`}>
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
            aria-label={initialCharacter ? '保存更改' : '创建角色'}
          >
            {initialCharacter ? '保存' : '创建'}
          </MobileTouchableButton>
        </div>
      </div>
    </MobileModalContainer>
  );
});

MobileCharacterConstructorModal.displayName = 'MobileCharacterConstructorModal';
