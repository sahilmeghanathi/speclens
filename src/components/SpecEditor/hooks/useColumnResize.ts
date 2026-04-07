import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'spec-editor-column-widths';

export interface ColumnWidths {
  left: number;
  middle: number;
  right: number;
}

/**
 * Hook for managing resizable column widths.
 * Persists column widths to localStorage and handles drag events.
 */
export function useColumnResize() {
  const [widths, setWidths] = useState<ColumnWidths>(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fallback to defaults
      }
    }
    return { left: 33.33, middle: 33.33, right: 33.34 };
  });

  const [isResizing, setIsResizing] = useState<'left' | 'middle' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
  }, [widths]);

  // Handle mouse move for resizing
  useEffect(() => {
    if (!isResizing || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newLeft = ((e.clientX - rect.left) / rect.width) * 100;

      // Enforce minimum widths
      if (newLeft > 20 && newLeft < 80) {
        const remaining = 100 - newLeft;
        const middle = remaining / 2;
        const right = remaining / 2;

        setWidths({
          left: newLeft,
          middle,
          right,
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return {
    widths,
    containerRef,
    isResizing,
    startResize: (column: 'left' | 'middle') => setIsResizing(column),
  };
}
