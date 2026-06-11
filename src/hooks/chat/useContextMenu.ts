import { useState, useEffect } from 'react';

interface ContextMenu {
  messageId: string;
  x: number;
  y: number;
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);

  const open = (e: React.MouseEvent, messageId: string, allowed: boolean) => {
    e.preventDefault();
    if (!allowed) return;
    setContextMenu({ messageId, x: e.clientX, y: e.clientY });
  };

  const close = () => setContextMenu(null);

  useEffect(() => {
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  return { contextMenu, open, close };
}
