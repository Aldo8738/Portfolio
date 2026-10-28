import { useLayoutEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Box3, Object3D, SpotLight, Vector3 } from 'three';
import { photos } from '../../content/media';

export function PhotoLighting({
  scene,
  photoId,
}: {
  scene: Object3D;
  photoId: string | null;
}) {
  const light = useRef<SpotLight>(null);
  const target = useMemo(() => new Object3D(), []);
  const { invalidate } = useThree();
  useLayoutEffect(() => {
    const print = scene.getObjectByName(
      `PHOTOS_PRINT_${photoId ?? photos[0]?.id}`,
    );
    if (!print) throw new Error('GLB contract: photo lighting target missing');
    new Box3().setFromObject(print).getCenter(target.position);
    light.current?.position
      .copy(target.position)
      .add(new Vector3(0.15, 0.4, 1.3));
    target.updateMatrixWorld();
    invalidate();
  }, [scene, photoId, target, invalidate]);
  return (
    <>
      <primitive object={target} />
      {/* Retain the light at zero intensity between visits to avoid shader churn. */}
      <spotLight
        ref={light}
        target={target}
        intensity={photoId ? 2.5 : 0}
        color="#fff3e1"
        angle={0.45}
        penumbra={0.9}
        distance={3}
        decay={2}
        castShadow={false}
      />
    </>
  );
}
