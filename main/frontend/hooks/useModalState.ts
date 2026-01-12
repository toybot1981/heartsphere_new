/**
 * Modal 状态管理 Hook
 * 统一管理所有 Modal 的显示/隐藏状态
 */

import { useState, useCallback } from 'react';

interface ModalState {
  showSettingsModal: boolean;
  showEraCreator: boolean;
  showCharacterCreator: boolean;
  showMainStoryEditor: boolean;
  showMailbox: boolean;
  showEraMemory: boolean;
  showRecycleBin: boolean;
  showMembershipModal: boolean;
  showLoginModal: boolean;
  showInitializationWizard: boolean;
}

interface ModalActions {
  setShowSettingsModal: (show: boolean) => void;
  setShowEraCreator: (show: boolean) => void;
  setShowCharacterCreator: (show: boolean) => void;
  setShowMainStoryEditor: (show: boolean) => void;
  setShowMailbox: (show: boolean) => void;
  setShowEraMemory: (show: boolean) => void;
  setShowRecycleBin: (show: boolean) => void;
  setShowMembershipModal: (show: boolean) => void;
  setShowLoginModal: (show: boolean) => void;
  setShowInitializationWizard: (show: boolean) => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openEraCreator: () => void;
  closeEraCreator: () => void;
  openCharacterCreator: () => void;
  closeCharacterCreator: () => void;
  openMainStoryEditor: () => void;
  closeMainStoryEditor: () => void;
  openMailbox: () => void;
  closeMailbox: () => void;
  openEraMemory: () => void;
  closeEraMemory: () => void;
  openRecycleBin: () => void;
  closeRecycleBin: () => void;
  openMembershipModal: () => void;
  closeMembershipModal: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openInitializationWizard: () => void;
  closeInitializationWizard: () => void;
}

export const useModalState = (): ModalState & ModalActions => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEraCreator, setShowEraCreator] = useState(false);
  const [showCharacterCreator, setShowCharacterCreator] = useState(false);
  const [showMainStoryEditor, setShowMainStoryEditor] = useState(false);
  const [showMailbox, setShowMailbox] = useState(false);
  const [showEraMemory, setShowEraMemory] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showInitializationWizard, setShowInitializationWizard] = useState(false);

  return {
    // State
    showSettingsModal,
    showEraCreator,
    showCharacterCreator,
    showMainStoryEditor,
    showMailbox,
    showEraMemory,
    showRecycleBin,
    showMembershipModal,
    showLoginModal,
    showInitializationWizard,
    // Setters
    setShowSettingsModal,
    setShowEraCreator,
    setShowCharacterCreator,
    setShowMainStoryEditor,
    setShowMailbox,
    setShowEraMemory,
    setShowRecycleBin,
    setShowMembershipModal,
    setShowLoginModal,
    setShowInitializationWizard,
    // Convenience methods
    openSettingsModal: useCallback(() => setShowSettingsModal(true), []),
    closeSettingsModal: useCallback(() => setShowSettingsModal(false), []),
    openEraCreator: useCallback(() => setShowEraCreator(true), []),
    closeEraCreator: useCallback(() => setShowEraCreator(false), []),
    openCharacterCreator: useCallback(() => setShowCharacterCreator(true), []),
    closeCharacterCreator: useCallback(() => setShowCharacterCreator(false), []),
    openMainStoryEditor: useCallback(() => setShowMainStoryEditor(true), []),
    closeMainStoryEditor: useCallback(() => setShowMainStoryEditor(false), []),
    openMailbox: useCallback(() => setShowMailbox(true), []),
    closeMailbox: useCallback(() => setShowMailbox(false), []),
    openEraMemory: useCallback(() => setShowEraMemory(true), []),
    closeEraMemory: useCallback(() => setShowEraMemory(false), []),
    openRecycleBin: useCallback(() => setShowRecycleBin(true), []),
    closeRecycleBin: useCallback(() => setShowRecycleBin(false), []),
    openMembershipModal: useCallback(() => setShowMembershipModal(true), []),
    closeMembershipModal: useCallback(() => setShowMembershipModal(false), []),
    openLoginModal: useCallback(() => setShowLoginModal(true), []),
    closeLoginModal: useCallback(() => setShowLoginModal(false), []),
    openInitializationWizard: useCallback(() => setShowInitializationWizard(true), []),
    closeInitializationWizard: useCallback(() => setShowInitializationWizard(false), []),
  };
};





