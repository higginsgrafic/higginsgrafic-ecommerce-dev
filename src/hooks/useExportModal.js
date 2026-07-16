import { useState, useEffect } from 'react';

export default function useExportModal() {
  const [exportCopyStatus, setExportCopyStatus] = useState('idle');
  const [exportTab, setExportTab] = useState('all');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportModalTitle, setExportModalTitle] = useState('');
  const [exportModalText, setExportModalText] = useState('');

  useEffect(() => {
    if (!exportModalOpen) return undefined;
    const onKeyDown = (e) => {
      try {
        if (!e) return;
        if (e.key === 'Escape') setExportModalOpen(false);
      } catch {
        // ignore
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [exportModalOpen]);

  return {
    exportCopyStatus,
    setExportCopyStatus,
    exportTab,
    setExportTab,
    exportModalOpen,
    setExportModalOpen,
    exportModalTitle,
    setExportModalTitle,
    exportModalText,
    setExportModalText,
  };
}
