import { expect, it } from 'vitest';
import { getProject, projects } from '../src/content/portfolio';
import {
  backgroundTrack,
  cameraSound,
  drawings,
  photos,
  guitarTrack,
  salsaSound,
} from '../src/content/media';
import { parseTheme } from '../src/lib/theme';
import { existsSync } from 'node:fs';

it('defaults unknown or tampered stored theme values safely', () => {
  expect(parseTheme('noir')).toBe('noir');
  expect(parseTheme('synthwave')).toBe('synthwave');
  expect(parseTheme('vintage')).toBe('synthwave');
  expect(parseTheme('<script>')).toBe('original');
  expect(parseTheme(null)).toBe('original');
});
it('never substitutes fake personal content or nonexistent originals', () => {
  expect(projects.map((project) => project.slug)).toEqual([
    'knowledge-bridge',
    'trading-agent',
    'herby',
    'custom-cpu-os',
  ]);
  expect(getProject('missing')).toBeUndefined();
  expect(photos.map((photo) => photo.id)).toEqual(['lucha', 'paris', 'canal']);
  expect(drawings.every((item) => item.original === null)).toBe(true);
  expect(guitarTrack?.src).toBe('/media/music/original/h6.mp3');
  expect(existsSync(`public${guitarTrack?.src}`)).toBe(true);
  expect(existsSync(`public${decodeURI(backgroundTrack.src)}`)).toBe(true);
  expect(existsSync(`public${decodeURI(salsaSound.src)}`)).toBe(true);
  expect(existsSync(`public${decodeURI(cameraSound.src)}`)).toBe(true);
  for (const photo of photos) {
    expect(photo.original).toBeTruthy();
    expect(existsSync(`public${photo.original}`)).toBe(true);
  }
});
