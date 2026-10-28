import { readFileSync, existsSync } from 'node:fs';
import { expect, it } from 'vitest';
import {
  Box3,
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Vector3,
} from 'three';
import { guitarVideo } from '../src/content/media';
import { fitGuitarCamera } from '../src/lib/guitar-camera';

it('serves a compact fast-start H.264/AAC video and a real source poster', () => {
  const bytes = readFileSync(`public${guitarVideo.src}`);
  expect(bytes.length).toBeLessThan(25 * 1024 * 1024);
  const atoms: string[] = [];
  for (let offset = 0; offset + 8 <= bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    if (length < 8 || offset + length > bytes.length)
      throw new Error('Invalid MP4 atom');
    atoms.push(bytes.toString('ascii', offset + 4, offset + 8));
    offset += length;
  }
  expect(atoms.indexOf('moov')).toBeGreaterThanOrEqual(0);
  expect(atoms.indexOf('moov')).toBeLessThan(atoms.indexOf('mdat'));
  expect(bytes.includes(Buffer.from('avc1'))).toBe(true);
  expect(bytes.includes(Buffer.from('mp4a'))).toBe(true);
  expect(existsSync(`public${guitarVideo.poster}`)).toBe(true);
});

it.each([390 / 844, 16 / 9, 21 / 9])(
  'keeps the amp and stand in the performance composition at aspect %s',
  (aspect) => {
    const bounds = new Box3(
      new Vector3(-3.214, 0, -2.05),
      new Vector3(3.535, 3.99, 2.075),
    );
    const geometry = new BoxGeometry(0.6, 0.5, 0.4);
    const material = new MeshBasicMaterial();
    const amp = new Mesh(geometry, material);
    amp.position.set(-1.8, 0.5, 1.5);
    const points: Vector3[] = [];
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z])
          points.push(new Vector3(x, y, z));
    const fit = fitGuitarCamera(bounds, points, amp, aspect, 38);
    const camera = new PerspectiveCamera(38, aspect, 0.1, 100);
    camera.position.copy(fit.position);
    camera.lookAt(fit.target);
    camera.updateMatrixWorld();
    for (const point of [
      bounds.getCenter(new Vector3()),
      amp.position.clone(),
    ]) {
      const projected = point.project(camera);
      expect(Math.abs(projected.x)).toBeLessThan(1);
      expect(Math.abs(projected.y)).toBeLessThan(1);
      expect(projected.z).toBeLessThan(1);
    }
    geometry.dispose();
    material.dispose();
  },
);
