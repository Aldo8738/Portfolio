import { expect, it } from 'vitest';
import {
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  PerspectiveCamera,
  Vector3,
} from 'three';
import { fitCamera, getFramingPoints } from '../src/lib/camera';

it.each([0.6, 1, 2.2])(
  'fits every model-bound corner at aspect %s',
  (aspect) => {
    const bounds = new Box3(
      new Vector3(-3.214, 0, -2.05),
      new Vector3(3.535, 3.99, 2.075),
    );
    const fit = fitCamera(bounds, aspect, 38);
    const camera = new PerspectiveCamera(38, aspect, 0.1, 100);
    camera.position.copy(fit.position);
    camera.lookAt(fit.target);
    camera.updateMatrixWorld();
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z]) {
          const projected = new Vector3(x, y, z).project(camera);
          expect(Math.abs(projected.x)).toBeLessThan(1);
          expect(Math.abs(projected.y)).toBeLessThan(1);
        }
  },
);

it('frames transformed meshes tightly without clipping their corners', () => {
  const scene = new Group();
  const mesh = new Mesh(new BoxGeometry(4, 3, 1));
  mesh.position.set(2, 1, -1);
  mesh.rotation.y = 0.4;
  scene.add(mesh);
  const points = getFramingPoints(scene);
  const bounds = new Box3().setFromObject(scene);
  const fit = fitCamera(bounds, 1.8, 38, points);
  const camera = new PerspectiveCamera(38, 1.8, 0.1, 100);
  camera.position.copy(fit.position);
  camera.lookAt(fit.target);
  camera.updateMatrixWorld();
  expect(points).toHaveLength(8);
  for (const point of points) {
    const projected = point.clone().project(camera);
    expect(Math.abs(projected.x)).toBeLessThan(1);
    expect(Math.abs(projected.y)).toBeLessThan(1);
  }
  const boxed = fitCamera(bounds, 1.8, 38);
  expect(fit.position.distanceTo(fit.target)).toBeLessThan(
    boxed.position.distanceTo(boxed.target),
  );
  mesh.geometry.dispose();
});

it('centers a model with uneven depth in a miniature desktop frame', () => {
  const points = [
    new Vector3(-3, 0, 0),
    new Vector3(-1, 4, -2),
    new Vector3(3, 0, 2),
    new Vector3(3, 3, -1),
  ];
  const fit = fitCamera(new Box3().setFromPoints(points), 1.8, 38, points);
  const camera = new PerspectiveCamera(38, 1.8, 0.1, 100);
  camera.position.copy(fit.position);
  camera.lookAt(fit.target);
  camera.updateMatrixWorld();
  const projected = points.map((point) => point.clone().project(camera));
  const top = Math.max(...projected.map((point) => point.y));
  const bottom = Math.min(...projected.map((point) => point.y));
  const left = Math.min(...projected.map((point) => point.x));
  const right = Math.max(...projected.map((point) => point.x));
  expect((right - left) / 2).toBeGreaterThanOrEqual(0.3);
  expect((right - left) / 2).toBeLessThanOrEqual(0.35);
  expect((top - bottom) / 2).toBeLessThanOrEqual(0.61);
  expect(Math.abs((left + right) / 2)).toBeLessThan(0.05);
  expect(fit.position.x).toBeCloseTo(fit.target.x);
  expect(Math.abs((top + bottom) / 2)).toBeLessThan(0.05);
  for (const point of projected) {
    expect(Math.abs(point.x)).toBeLessThan(1);
    expect(Math.abs(point.y)).toBeLessThan(1);
  }
});
