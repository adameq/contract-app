import { useCallback, useState } from 'react';

/**
 * Custom hook for managing modal state
 * Provides modal open/close functionality with callback support
 */
export function useModalState(initialState = false) {
  const [isModalOpen, setIsModalOpen] = useState(initialState);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsModalOpen(prev => !prev);
  }, []);

  const handleModalOpenChange = useCallback((open: boolean) => {
    setIsModalOpen(open);
  }, []);

  return {
    isModalOpen,
    openModal,
    closeModal,
    toggleModal,
    handleModalOpenChange,
  };
}
