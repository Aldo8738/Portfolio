import { expect, it } from 'vitest';
import { getProject, projects } from '../src/content/portfolio';
import { drawings, photos, guitarTrack } from '../src/content/media';
import { parseTheme } from '../src/lib/theme';

it('defaults unknown or tampered stored theme values safely', () => {
  expect(parseTheme('noir')).toBe('noir');
  expect(parseTheme('vintage')).toBe('vintage');
  expect(parseTheme('<script>')).toBe('original');
  expect(parseTheme(null)).toBe('original');
});
it('never substitutes fake personal content or nonexistent originals', () => {
  expect(projects).toEqual([]);
  expect(getProject('missing')).toBeUndefined();
  expect(photos.map((photo) => photo.id)).toEqual(['lucha', 'paris', 'canal']);
  expect([...drawings, ...photos].every((item) => item.original === null)).toBe(
    true,
  );
  expect(guitarTrack).toBeNull();
});
