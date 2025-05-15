import { useState } from 'react';

export function useAdminPassword() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

  const requireAdminPassword = (action: () => void) => {
    setPendingAction(() => action);
    setShowAdminModal(true);
  };

  const handleConfirm = () => {
    pendingAction();
    setPendingAction(() => {});
  };

  const handleClose = () => {
    setShowAdminModal(false);
    setPendingAction(() => {});
  };

  return {
    showAdminModal,
    requireAdminPassword,
    handleConfirm,
    handleClose
  };
}