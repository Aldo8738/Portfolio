import { useEffect, useRef } from 'react';

const dragThreshold = 6;

export function usePointerDrag(element: HTMLElement) {
  const dragged = useRef(false);
  useEffect(() => {
    let start: { pointerId: number; x: number; y: number } | null = null;
    const onDown = (event: PointerEvent) => {
      dragged.current = false;
      start = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
    };
    const onMove = (event: PointerEvent) => {
      if (!start || event.pointerId !== start.pointerId) return;
      if (
        Math.hypot(event.clientX - start.x, event.clientY - start.y) >
        dragThreshold
      )
        dragged.current = true;
    };
    const onUp = (event: PointerEvent) => {
      onMove(event);
      start = null;
    };
    const onCancel = () => {
      start = null;
      dragged.current = true;
    };
    // Capture before R3F dispatches a click; keep the result until the next gesture.
    element.addEventListener('pointerdown', onDown, true);
    element.addEventListener('pointermove', onMove, true);
    element.addEventListener('pointerup', onUp, true);
    element.addEventListener('pointercancel', onCancel, true);
    return () => {
      element.removeEventListener('pointerdown', onDown, true);
      element.removeEventListener('pointermove', onMove, true);
      element.removeEventListener('pointerup', onUp, true);
      element.removeEventListener('pointercancel', onCancel, true);
    };
  }, [element]);
  return dragged;
}
