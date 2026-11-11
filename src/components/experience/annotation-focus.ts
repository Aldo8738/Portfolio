export function restoreSceneFocus(element: HTMLElement | null) {
  if (!element) return;
  if (element.closest('[data-scene-annotations]')) {
    // The projection loop restores focus once the returning camera reveals the controls.
    element.dataset.restoreFocus = 'true';
  } else element.focus({ preventScroll: true });
}
