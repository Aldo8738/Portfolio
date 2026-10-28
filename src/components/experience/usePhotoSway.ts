import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3, type Object3D } from 'three';
import { photoSway, stepPhotoSway } from '../../lib/photo-sway';

export function usePhotoSway(
  scene: Object3D,
  enabled: boolean,
  reducedMotion: boolean,
) {
  const { camera, gl, invalidate } = useThree();
  const photos = useMemo(
    () =>
      [0, 1, 2].map((index) => {
        const name = `POLAROID_${index}_SWING_PIVOT`;
        const pivot = scene.getObjectByName(name);
        if (!pivot) throw new Error(`GLB contract: missing ${name}`);
        const image = scene.getObjectByName(`HIT_PHOTOS_POLAROID_${index}`);
        if (!image) throw new Error(`GLB contract: missing photo ${index}`);
        return { pivot, image, rest: pivot.rotation.z, angle: 0, velocity: 0 };
      }),
    [scene],
  );

  useEffect(() => {
    if (!reducedMotion) return;
    for (const photo of photos) {
      photo.angle = photo.velocity = 0;
      photo.pivot.rotation.z = photo.rest;
    }
    invalidate();
  }, [photos, reducedMotion, invalidate]);

  useEffect(() => {
    if (!enabled) return;
    const canvas = gl.domElement;
    const projected = new Vector3();
    const right = new Vector3();
    let previousX: number | null = null;
    const resetPointer = () => {
      previousX = null;
    };
    const move = (event: PointerEvent) => {
      if (!event.isPrimary) return;
      const dx = previousX === null ? 0 : event.clientX - previousX;
      previousX = event.clientX;
      if (!dx) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      // Camera right maps a screen-space push back to the hanging pivot's local X.
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      const impulse =
        MathUtils.clamp(dx / rect.width, -0.08, 0.08) *
        photoSway.pointerStrength *
        right.x;
      for (const photo of photos) {
        photo.image.getWorldPosition(projected).project(camera);
        if (projected.z < -1 || projected.z > 1) continue;
        const x = rect.left + ((projected.x + 1) * rect.width) / 2;
        const y = rect.top + ((1 - projected.y) * rect.height) / 2;
        const influence = Math.max(
          0,
          1 -
            Math.hypot(event.clientX - x, event.clientY - y) /
              photoSway.pointerRadius,
        );
        photo.velocity = MathUtils.clamp(
          photo.velocity + impulse * influence,
          -photoSway.maxVelocity,
          photoSway.maxVelocity,
        );
      }
    };
    canvas.addEventListener('pointermove', move, { passive: true });
    canvas.addEventListener('pointerleave', resetPointer);
    canvas.addEventListener('pointercancel', resetPointer);
    return () => {
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerleave', resetPointer);
      canvas.removeEventListener('pointercancel', resetPointer);
    };
  }, [enabled, photos, camera, gl]);

  useEffect(
    () => () => {
      for (const photo of photos) photo.pivot.rotation.z = photo.rest;
    },
    [photos],
  );

  useFrame((_, delta) => {
    if (!enabled) return;
    for (const photo of photos) {
      if (photo.angle === 0 && photo.velocity === 0) continue;
      stepPhotoSway(photo, delta);
      photo.pivot.rotation.z = photo.rest + photo.angle;
    }
  });
}
