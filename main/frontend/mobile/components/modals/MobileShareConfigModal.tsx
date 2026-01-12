/**
 * Mobile版本共享配置模态框主组件
 * 整合三个步骤：选择共享范围、权限和描述设置、分享预览
 */

import React, { memo } from 'react';
import { MobileModalContainer } from '../MobileModalContainer';
import { MobileTouchableButton } from '../MobileTouchableButton';
import { MobileBackButton } from '../MobileBackButton';
import { MobileShareConfigStep1 } from './MobileShareConfigStep1';
import { MobileShareConfigStep2 } from './MobileShareConfigStep2';
import { MobileShareConfigStep3 } from './MobileShareConfigStep3';
import { MobileStatusStyles, MobileColors, MobileTypography, MobileSpacing } from '../MobileStyleGuide';
import { useShareConfig } from '../../hooks/useShareConfig';

interface MobileShareConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Mobile版本共享配置模态框
 * 参照PC版本ShareConfigModal，按照Mobile风格重新设计
 */
export const MobileShareConfigModal: React.FC<MobileShareConfigModalProps> = memo(({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    step,
    loading,
    error,
    existingConfig,
    shareType,
    accessPermission,
    description,
    coverImageUrl,
    selectedScopes,
    worlds,
    eras,
    setStep,
    setShareType,
    setAccessPermission,
    setDescription,
    setCoverImageUrl,
    setSelectedScopes,
    setError,
    loadWorldsAndEras,
    handleNext,
    handleBack,
    handleSubmit,
    handleScopeToggle,
    handleRegenerateShareCode,
  } = useShareConfig({
    isOpen,
    onSuccess,
  });

  // 关闭时重置错误
  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <MobileModalContainer
      isOpen={isOpen}
      onClose={handleClose}
      title="共享我的心域"
      size="lg"
      closeOnBackdrop={step === 3} // 只有在步骤3时才允许点击背景关闭
    >
      <div className="flex flex-col min-h-0 max-h-[calc(90vh-8rem)]">
        {/* 步骤指示器 */}
        {step !== 3 && (
          <div className={`flex items-center justify-between ${MobileSpacing.padding.md} border-b ${MobileColors.border.default} mb-4 pb-3`}>
            <div className={`${MobileTypography.fontSize.sm} ${MobileColors.text.secondary}`}>
              步骤 {step}/2
            </div>
            <div className="flex gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  step >= 1 ? 'bg-purple-500' : 'bg-slate-600'
                }`}
                aria-label="步骤1"
              />
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  step >= 2 ? 'bg-purple-500' : 'bg-slate-600'
                }`}
                aria-label="步骤2"
              />
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className={`${MobileStatusStyles.error.container} ${MobileSpacing.margin.bottom.md}`} role="alert">
            <p className={MobileStatusStyles.error.text}>{error}</p>
          </div>
        )}

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {step === 1 && (
            <MobileShareConfigStep1
              shareType={shareType}
              setShareType={setShareType}
              selectedScopes={selectedScopes}
              setSelectedScopes={setSelectedScopes}
              worlds={worlds}
              eras={eras}
              loading={loading}
            />
          )}

          {step === 2 && (
            <MobileShareConfigStep2
              accessPermission={accessPermission}
              setAccessPermission={setAccessPermission}
              description={description}
              setDescription={setDescription}
              coverImageUrl={coverImageUrl}
              setCoverImageUrl={setCoverImageUrl}
              shareType={shareType}
              selectedScopes={selectedScopes}
            />
          )}

          {step === 3 && (
            <MobileShareConfigStep3
              shareConfig={existingConfig}
              onRegenerate={handleRegenerateShareCode}
              onClose={handleClose}
            />
          )}
        </div>

        {/* 底部按钮 */}
        {step !== 3 && (
          <div className={`flex items-center justify-between gap-3 ${MobileSpacing.padding.md} border-t ${MobileColors.border.default} mt-4 pt-4 shrink-0`}>
            {step === 2 ? (
              <MobileBackButton onClick={handleBack} aria-label="上一步" />
            ) : (
              <div className="w-10" />
            )}

            <div className="flex-1" />

            {step === 1 ? (
              <MobileTouchableButton
                variant="primary"
                size="lg"
                onClick={handleNext}
                disabled={loading || (shareType !== 'all' && selectedScopes.length === 0)}
                aria-label="下一步"
                className="min-w-[100px]"
              >
                下一步
              </MobileTouchableButton>
            ) : (
              <MobileTouchableButton
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={loading}
                loading={loading}
                aria-label={existingConfig ? '更新配置' : '保存并开启共享'}
                className="min-w-[140px]"
              >
                {existingConfig ? '更新配置' : '保存并开启共享'}
              </MobileTouchableButton>
            )}
          </div>
        )}
      </div>
    </MobileModalContainer>
  );
});

MobileShareConfigModal.displayName = 'MobileShareConfigModal';
