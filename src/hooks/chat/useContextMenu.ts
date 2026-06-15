import { useState, useEffect, useRef, useCallback } from 'react';

const MENU_WIDTH = 148;
const MENU_HEIGHT = 88;
const VIEWPORT_PADDING = 10;
const LEFT_OFFSET = 28;

interface ContextMenu {
  messageId: string;
  x: number;
  y: number;
}

function clampMenuPosition(clientX: number, clientY: number) {
  let x = clientX - LEFT_OFFSET;
  let y = clientY;

  if (x + MENU_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
    x = window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING;
  }
  if (x < VIEWPORT_PADDING) {
    x = VIEWPORT_PADDING;
  }
  if (y + MENU_HEIGHT > window.innerHeight - VIEWPORT_PADDING) {
    y = window.innerHeight - MENU_HEIGHT - VIEWPORT_PADDING;
  }
  if (y < VIEWPORT_PADDING) {
    y = VIEWPORT_PADDING;
  }

  return { x, y };
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const skipCloseRef = useRef(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const openAt = useCallback(
    (messageId: string, clientX: number, clientY: number) => {
      skipCloseRef.current = true;
      const { x, y } = clampMenuPosition(clientX, clientY);
      setContextMenu({ messageId, x, y });

      requestAnimationFrame(() => {
        setTimeout(() => {
          skipCloseRef.current = false;
        }, 350);
      });
    },
    []
  );

  const openFromMouse = useCallback(
    (e: React.MouseEvent, messageId: string, allowed: boolean) => {
      e.preventDefault();
      if (!allowed) return;
      openAt(messageId, e.clientX, e.clientY);
    },
    [openAt]
  );

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, messageId: string, allowed: boolean) => {
      if (!allowed) return;

      const touch = e.touches[0];
      if (!touch) return;

      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      clearLongPressTimer();

      longPressTimerRef.current = setTimeout(() => {
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
        openAt(messageId, touch.clientX, touch.clientY);
      }, 450);
    },
    [clearLongPressTimer, openAt]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStartRef.current;
      const touch = e.touches[0];
      if (!start || !touch) return;

      const dx = Math.abs(touch.clientX - start.x);
      const dy = Math.abs(touch.clientY - start.y);
      if (dx > 10 || dy > 10) {
        clearLongPressTimer();
      }
    },
    [clearLongPressTimer]
  );

  const handleTouchEnd = useCallback(() => {
    clearLongPressTimer();
    touchStartRef.current = null;
  }, [clearLongPressTimer]);

  const close = useCallback(() => setContextMenu(null), []);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (skipCloseRef.current) return;

      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;

      close();
    };

    document.addEventListener('pointerdown', handlePointerDown, {
      capture: true,
    });
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, {
        capture: true,
      });
    };
  }, [close]);

  useEffect(() => {
    return () => clearLongPressTimer();
  }, [clearLongPressTimer]);

  return {
    contextMenu,
    menuRef,
    openFromMouse,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    close,
  };
}
