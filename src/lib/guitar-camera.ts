import { Box3, Vector3, type Object3D } from 'three';
import { fitCamera } from './camera';

export const guitarMotion = {
  approach: 0.85,
  reveal: 0.75,
  reduced: 0.15,
  exitSpeed: 1.3,
} as const;

export function fitGuitarCamera(
  bounds: Box3,
  points: Vector3[],
  amp: Object3D,
  aspect: number,
  fov: number,
) {
  const rest = fitCamera(bounds, aspect, fov, points);
  const target = rest.target
    .clone()
    .lerp(new Box3().setFromObject(amp).getCenter(new Vector3()), 0.15);
  const split = aspect > 1.2;
  if (split) target.x -= bounds.getSize(new Vector3()).x * 0.23;
  const position = target.clone().add(
    rest.position
      .clone()
      .sub(rest.target)
      .multiplyScalar(split ? 0.86 : 0.94),
  );
  return { position, target };
}
