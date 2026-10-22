import { expect, it } from 'vitest';
import { chooseSceneQuality } from '../src/components/experience/scene-quality';

it('keeps touch devices in the cheaper profile when rotated to landscape', () => {
  expect(chooseSceneQuality(844, 'Hardware GPU', null, true).name).toBe(
    'mobile',
  );
});

it.each([
  [390, 'Hardware GPU', null, 'mobile'],
  [1280, 'Hardware GPU', null, 'standard'],
  [1280, 'ANGLE SwiftShader', null, 'low'],
  [1280, 'Hardware GPU', 'low', 'low'],
  [1280, 'ANGLE SwiftShader', 'standard', 'standard'],
  [390, 'Hardware GPU', '<script>', 'mobile'],
] as const)(
  'selects a safe quality profile for %s / %s / %s',
  (width, renderer, requested, expected) => {
    expect(chooseSceneQuality(width, renderer, requested).name).toBe(expected);
  },
);
