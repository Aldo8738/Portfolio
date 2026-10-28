import { expect, it } from 'vitest';
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Vector3,
} from 'three';
import {
  createPhotoCameraApproach,
  createPhotoCameraSlide,
  fitPhotoCamera,
  photoCamera,
} from '../src/lib/photo-camera';

it('slides between framed photos without retreating through the stand', () => {
  const start = new Vector3(2.23, 3.31, 0.4);
  const startTarget = new Vector3(2.23, 3.31, -0.98);
  const fit = {
    position: new Vector3(2.78, 3.16, 0.5),
    target: new Vector3(2.78, 3.16, -0.98),
  };
  const sample = createPhotoCameraSlide(start, startTarget, fit);
  const position = new Vector3(),
    target = new Vector3();
  for (let step = 0; step <= 100; step++) {
    const progress = step / 100;
    sample(progress, position, target);
    expect(
      position.distanceTo(start.clone().lerp(fit.position, progress)),
    ).toBeLessThan(1e-10);
    expect(
      target.distanceTo(startTarget.clone().lerp(fit.target, progress)),
    ).toBeLessThan(1e-10);
    expect(position.z).toBeGreaterThanOrEqual(start.z);
  }
  sample(1, position, target);
  expect(position.toArray()).toEqual(fit.position.toArray());
});

it.each([390 / 844, 640 / 844, 16 / 9])(
  'frames a solid print from the front instead of its edge normal at aspect %s',
  (aspect) => {
    const photo = new Mesh(
      new BoxGeometry(0.4, 0.5, 0.02),
      new MeshBasicMaterial(),
    );
    photo.position.set(2.23, 3.31, -0.98);
    photo.rotation.y = -0.14;
    const fit = fitPhotoCamera(photo, aspect, 38);
    expect(fit.position.x).toBeCloseTo(photo.position.x);
    expect(fit.position.y).toBeCloseTo(photo.position.y);
    expect(fit.position.z).toBeGreaterThan(photo.position.z);
    const camera = new PerspectiveCamera(38, aspect, 0.1, 100);
    camera.position.copy(fit.position);
    camera.lookAt(fit.target);
    camera.updateMatrixWorld();
    const positions = photo.geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      const corner = new Vector3()
        .fromBufferAttribute(positions, i)
        .applyMatrix4(photo.matrixWorld)
        .project(camera);
      expect(Math.abs(corner.x)).toBeLessThan(1);
      expect(Math.abs(corner.y)).toBeLessThan(1);
    }
    photo.geometry.dispose();
    photo.material.dispose();
  },
);

it.each([false, true])(
  'aligns outside the stand, then approaches straight from the front (orbited: %s)',
  (orbited) => {
    const rest = {
      position: new Vector3(0, 5, 15),
      target: new Vector3(0, 2, 0),
    };
    const fit = {
      position: new Vector3(2.2, 3.3, -0.3),
      target: new Vector3(2.3, 3.3, -1),
    };
    const start = orbited ? new Vector3(-10, 5, -8) : rest.position;
    const sample = createPhotoCameraApproach(
      start,
      rest.target,
      rest,
      fit,
      2.075,
    );
    const position = new Vector3();
    const target = new Vector3();
    sample(0, position, target);
    expect(position.distanceTo(start)).toBeLessThan(1e-10);
    const resetEnd = orbited ? 0.3 : 0;
    const alignEnd = resetEnd + (1 - resetEnd) * 0.4;
    sample(resetEnd, position, target);
    expect(position.toArray()).toEqual(rest.position.toArray());
    for (let step = 0; step <= 100; step++) {
      const progress = resetEnd + ((1 - resetEnd) * step) / 100;
      sample(progress, position, target);
      if (progress < alignEnd) {
        expect(position.z).toBeGreaterThanOrEqual(
          2.075 + photoCamera.frontClearance,
        );
      } else {
        expect(position.x).toBeCloseTo(fit.position.x, 10);
        expect(position.y).toBeCloseTo(fit.position.y, 10);
        expect(target.toArray()).toEqual(fit.target.toArray());
        expect(position.z).toBeGreaterThanOrEqual(fit.position.z);
      }
    }
    sample(1, position, target);
    expect(position.toArray()).toEqual(fit.position.toArray());
  },
);
