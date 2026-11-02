import { expect, it } from 'vitest';
import { BoxGeometry, Mesh, Vector3 } from 'three';
import { getPhotoControlsLayout } from '../src/lib/photo-controls-layout';

it('places capsules wholly inside the gaps between projected photographs', () => {
  const geometry = new BoxGeometry(2, 2, 0.1);
  const photo = new Mesh(geometry);
  const left = new Mesh(geometry);
  const right = new Mesh(geometry);
  left.position.x = -4;
  right.position.x = 4;
  const fit = { position: new Vector3(0, 0, 10), target: new Vector3() };
  const layout = getPhotoControlsLayout(
    photo,
    [left, right],
    fit,
    1440,
    900,
    38,
  );
  expect(layout).not.toBeNull();
  expect(layout?.previousX).toBeLessThan(500);
  expect(layout?.nextX).toBeGreaterThan(940);
  expect(layout?.centerY).toBeCloseTo(450);
  expect(layout?.counterY).toBeGreaterThan(580);
  right.position.x = 2.3;
  expect(
    getPhotoControlsLayout(photo, [left, right], fit, 1440, 900, 38),
  ).toBeNull();
  expect(getPhotoControlsLayout(photo, [left], fit, 390, 844, 38)).toBeNull();
  geometry.dispose();
});
