import { useSyncExternalStore } from 'react';
import { parseTheme } from '../../lib/theme';

function subscribe(onChange: () => void) {
  window.addEventListener('taqueria:theme', onChange);
  return () => window.removeEventListener('taqueria:theme', onChange);
}

export function useSceneTheme() {
  return useSyncExternalStore(
    subscribe,
    () => parseTheme(document.documentElement.dataset.theme),
    () => 'original' as const,
  );
}
