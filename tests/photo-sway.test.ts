import { expect, it } from 'vitest';
import { photoSway, stepPhotoSway } from '../src/lib/photo-sway';

it('bounds a strong nudge and settles back to the authored hanging angle', () => {
  const state = { angle: 0, velocity: photoSway.maxVelocity };
  let crossedRest = false;
  for (let frame = 0; frame < 1200; frame++) {
    stepPhotoSway(state, 1 / 60);
    expect(Math.abs(state.angle)).toBeLessThanOrEqual(photoSway.maxAngle);
    crossedRest ||= state.angle < 0;
  }
  expect(crossedRest).toBe(true);
  expect(state).toEqual({ angle: 0, velocity: 0 });
});

it('caps long frame gaps instead of jumping after a paused tab', () => {
  const normal = { angle: 0.05, velocity: 0.1 };
  const stalled = { ...normal };
  stepPhotoSway(normal, 0.05);
  stepPhotoSway(stalled, 30);
  expect(stalled).toEqual(normal);
});
