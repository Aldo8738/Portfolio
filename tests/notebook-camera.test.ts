import { expect, it } from 'vitest';
import {
  Box3,
  Group,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  PerspectiveCamera,
  Vector3,
} from 'three';
import { fitNotebookCamera } from '../src/lib/notebook-camera';

it.each([390 / 844, 640 / 844, 16 / 9])(
  'frames both open pages from above at aspect %s',
  (aspect) => {
    const book = new Group();
    const geometry = new BoxGeometry(0.48, 0.036, 0.44);
    const material = new MeshBasicMaterial();
    for (const x of [-0.97, -0.48]) {
      const page = new Mesh(geometry, material);
      page.position.set(x, 1.59, 0.82);
      page.rotation.z = x < -0.7 ? -0.06 : 0.06;
      book.add(page);
    }
    const fit = fitNotebookCamera(book, aspect, 38);
    const camera = new PerspectiveCamera(38, aspect, 0.1, 100);
    camera.position.copy(fit.position);
    camera.lookAt(fit.target);
    camera.updateMatrixWorld();
    expect(fit.position.y).toBeGreaterThan(fit.target.y + 0.5);
    expect(fit.position.z).toBeGreaterThan(fit.target.z);
    const bounds = new Box3().setFromObject(book);
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z]) {
          const point = new Vector3(x, y, z).project(camera);
          expect(Math.abs(point.x)).toBeLessThan(0.85);
          expect(Math.abs(point.y)).toBeLessThan(0.85);
          expect(point.z).toBeGreaterThan(-1);
          expect(point.z).toBeLessThan(1);
        }
    geometry.dispose();
    material.dispose();
  },
);
