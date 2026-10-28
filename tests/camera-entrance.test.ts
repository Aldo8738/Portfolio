import { expect, it } from 'vitest';
import { Box3, PerspectiveCamera, Spherical, Vector3 } from 'three';
import { fitCamera } from '../src/lib/camera';
import {
  createCameraEntrance,
  createCameraReset,
} from '../src/lib/camera-entrance';

it.each([0.46, 1, 1.78])(
  'keeps the rising rear-to-front orbit framed at aspect %s',
  (aspect) => {
    const bounds = new Box3(
      new Vector3(-3.214, 0, -2.05),
      new Vector3(3.535, 3.99, 2.075),
    );
    const points: Vector3[] = [];
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z])
          points.push(new Vector3(x, y, z));
    const fit = fitCamera(bounds, aspect, 38, points);
    const rearFit = fitCamera(bounds, aspect, 38, points, 'entrance');
    const sample = createCameraEntrance(fit, points, aspect, 38, rearFit);
    const camera = new PerspectiveCamera(38, aspect, 0.1, 100);
    const start = sample(0, new Vector3());
    const endOffset = fit.position.clone().sub(fit.target);
    expect(start.clone().sub(fit.target).dot(endOffset)).toBeLessThan(0);
    const startPhi = new Spherical().setFromVector3(
      start.clone().sub(fit.target),
    ).phi;
    const middlePhi = new Spherical().setFromVector3(
      sample(0.5, new Vector3()).sub(fit.target),
    ).phi;
    const endPhi = new Spherical().setFromVector3(endOffset).phi;
    expect(middlePhi).toBeLessThan(startPhi);
    expect(middlePhi).toBeLessThan(endPhi);
    for (let step = 0; step <= 100; step++) {
      sample(step / 100, camera.position);
      camera.lookAt(fit.target);
      camera.updateMatrixWorld();
      for (const point of points) {
        const projected = point.clone().project(camera);
        expect(Math.abs(projected.x)).toBeLessThan(1);
        expect(Math.abs(projected.y)).toBeLessThan(1);
      }
    }
    expect(sample(1, new Vector3()).toArray()).toEqual(fit.position.toArray());
  },
);

it('resets along a continuous short orbit to the exact shared hero pose', () => {
  const from = new Vector3(-8, 4, -6);
  const target = new Vector3(0, 2, 0);
  const fit = fitCamera(
    new Box3(new Vector3(-3, 0, -2), new Vector3(3, 4, 2)),
    1.78,
    38,
  );
  const sample = createCameraReset(from, target, fit);
  const position = new Vector3();
  const lookAt = new Vector3();
  sample(0, position, lookAt);
  expect(position.distanceTo(from)).toBeLessThan(1e-10);
  expect(lookAt.toArray()).toEqual(target.toArray());
  sample(0.99999, position, lookAt);
  expect(position.distanceTo(fit.position)).toBeLessThan(0.001);
  sample(1, position, lookAt);
  expect(position.toArray()).toEqual(fit.position.toArray());
  expect(lookAt.toArray()).toEqual(fit.target.toArray());
});
