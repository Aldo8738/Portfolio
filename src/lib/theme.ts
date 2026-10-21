export const themes = [
  {
    id: 'original',
    label: 'Original',
    salsa: 'Red salsa',
    node: 'SALSA_RED_PIVOT',
  },
  {
    id: 'noir',
    label: 'Noir',
    salsa: 'Green salsa',
    node: 'SALSA_GREEN_PIVOT',
  },
  {
    id: 'vintage',
    label: 'Vintage',
    salsa: 'Orange salsa',
    node: 'SALSA_ORANGE_PIVOT',
  },
] as const;
export type ThemeId = (typeof themes)[number]['id'];

export function parseTheme(value: unknown): ThemeId {
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
