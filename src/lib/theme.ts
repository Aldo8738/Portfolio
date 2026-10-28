export const themes = [
  {
    id: 'original',
    label: 'Original',
    salsa: 'Red salsa',
    node: 'SALSA_RED_PIVOT',
    motion: { speed: 1.06, spring: 2.1 },
  },
  {
    id: 'noir',
    label: 'Noir',
    salsa: 'Green salsa',
    node: 'SALSA_GREEN_PIVOT',
    motion: { speed: 0.96, spring: 1.5 },
  },
  {
    id: 'synthwave',
    label: 'Synthwave',
    salsa: 'Orange salsa',
    node: 'SALSA_ORANGE_PIVOT',
    motion: { speed: 1, spring: 2.4 },
  },
] as const;
export type ThemeId = (typeof themes)[number]['id'];

export function parseTheme(value: unknown): ThemeId {
  if (value === 'vintage') return 'synthwave';
  return themes.find((theme) => theme.id === value)?.id ?? 'original';
}

export function selectTheme(theme: ThemeId) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('taqueria-theme', theme);
  } catch {
    /* Theme still works when storage is unavailable. */
  }
  window.dispatchEvent(new CustomEvent('taqueria:theme', { detail: theme }));
}

export function requestTheme(theme: ThemeId) {
  const request = new CustomEvent('taqueria:theme-request', {
    detail: theme,
    cancelable: true,
  });
  if (window.dispatchEvent(request)) selectTheme(theme);
}
