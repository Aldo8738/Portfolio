import { expect, it } from 'vitest';
import {
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Vector3,
} from 'three';
import { fitMonitorCamera, getMonitorCorners } from '../src/lib/monitor-camera';

it.each([390 / 844, 640 / 720, 16 / 9])(
  'frames the whole rotated monitor at aspect %s',
  (aspect) => {
    const screen = new Mesh(
      new PlaneGeometry(0.71, 0.452),
      new MeshBasicMaterial(),
    );
    screen.position.set(2.45, 2.15, 0.94);
    screen.rotation.set(0.1, 0.3, 0.15);
    const camera = new PerspectiveCamera(38, aspect, 0.1, 100);
    const fit = fitMonitorCamera(
      screen,
      new Vector3(0, 3, 10),
      aspect,
      camera.fov,
    );
    camera.position.copy(fit.position);
    camera.lookAt(fit.target);
    camera.updateMatrixWorld();
    const positions = screen.geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      const corner = new Vector3()
        .fromBufferAttribute(positions, i)
        .applyMatrix4(screen.matrixWorld)
        .project(camera);
      expect(Math.abs(corner.x)).toBeLessThanOrEqual(1 / 1.1 + 0.001);
      expect(Math.abs(corner.y)).toBeLessThanOrEqual(1 / 1.1 + 0.001);
      expect(corner.z).toBeGreaterThan(-1);
    }
    screen.geometry.dispose();
    screen.material.dispose();
  },
);

it('keeps portal corners attached to the frozen screen top-down UVs', () => {
  const geometry = new PlaneGeometry(0.71, 0.452);
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - uv.getY(i));
  const screen = new Mesh(geometry, new MeshBasicMaterial());
  screen.position.set(2.45, 2.15, 0.94);
  screen.rotation.set(0.1, 0.3, 0.15);
  const corners = getMonitorCorners(screen);
  const local = corners.map((corner) => screen.worldToLocal(corner));
  expect(local.map((p) => [Math.sign(p.x), Math.sign(p.y)])).toEqual([
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]);
  geometry.dispose();
  screen.material.dispose();
});
