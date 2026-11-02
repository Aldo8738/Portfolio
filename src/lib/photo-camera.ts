import { Box3, MathUtils, Vector3, type Mesh } from 'three';
import { createCameraReset } from './camera-entrance';

export const photoCamera = {
  approachSeconds: 1.6,
  slideSeconds: 0.65,
  framingPadding: 1.5,
  frontClearance: 0.6,
  headerSpace: 80,
  footerSpace: 200,
  landscapeHeaderSpace: 64,
  landscapeFooterSpace: 160,
  controlGap: 8,
} as const;

export function fitPhotoCamera(
  photo: Mesh,
  aspect: number,
  fov: number,
  viewportHeight: number,
) {
  const bounds = new Box3().setFromObject(photo);
  const target = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const tanY = Math.tan(MathUtils.degToRad(fov / 2));
  const shortLandscape = aspect >= 1.6 && viewportHeight <= 500;
  const top =
    Math.min(
      shortLandscape
        ? photoCamera.landscapeHeaderSpace
        : photoCamera.headerSpace,
      viewportHeight * 0.2,
    ) + photoCamera.controlGap;
  const bottom =
    Math.min(
      shortLandscape
        ? photoCamera.landscapeFooterSpace
        : photoCamera.footerSpace,
      viewportHeight * 0.65,
    ) + photoCamera.controlGap;
  const availableHeight = (viewportHeight - top - bottom) / viewportHeight;
  const distance =
    size.z / 2 +
    Math.max(
      (Math.max(size.x / (tanY * aspect), size.y / tanY) *
        photoCamera.framingPadding) /
        2,
      size.y / (2 * tanY * availableHeight),
    );
  // Reserve a footer for HTML controls while retaining the front-facing approach.
  target.y -=
    ((bottom - top) / viewportHeight) * (distance - size.z / 2) * tanY;
  // The prints face +Z; the first vertex normal belongs to an edge of the solid print.
  return { target, position: target.clone().add(new Vector3(0, 0, distance)) };
}

export function createPhotoCameraSlide(
  position: Vector3,
  target: Vector3,
  fit: { position: Vector3; target: Vector3 },
) {
  const startPosition = position.clone();
  const startTarget = target.clone();
  return (progress: number, nextPosition: Vector3, nextTarget: Vector3) => {
    if (progress >= 1) {
      nextPosition.copy(fit.position);
      nextTarget.copy(fit.target);
      return;
    }
    nextPosition.lerpVectors(startPosition, fit.position, progress);
    nextTarget.lerpVectors(startTarget, fit.target, progress);
  };
}

export function createPhotoCameraApproach(
  position: Vector3,
  target: Vector3,
  rest: { position: Vector3; target: Vector3 },
  fit: { position: Vector3; target: Vector3 },
  frontZ: number,
) {
  const reset = createCameraReset(position, target, rest);
  const resetEnd = position.distanceTo(rest.position) > 0.1 ? 0.3 : 0;
  const alignEnd = resetEnd + (1 - resetEnd) * 0.4;
  // Align outside the stand before entering the narrow space in front of the prints.
  const aligned = fit.position.clone();
  aligned.z = Math.max(frontZ + photoCamera.frontClearance, fit.position.z);
  return (progress: number, nextPosition: Vector3, nextTarget: Vector3) => {
    if (progress >= 1) {
      nextPosition.copy(fit.position);
      nextTarget.copy(fit.target);
      return;
    }
    if (progress < resetEnd) {
      reset(progress / resetEnd, nextPosition, nextTarget);
      return;
    }
    if (progress < alignEnd) {
      const t = MathUtils.smoothstep(progress, resetEnd, alignEnd);
      nextPosition.lerpVectors(rest.position, aligned, t);
      nextTarget.lerpVectors(rest.target, fit.target, t);
      return;
    }
    const t = MathUtils.smoothstep(progress, alignEnd, 1);
    nextPosition.lerpVectors(aligned, fit.position, t);
    nextTarget.copy(fit.target);
  };
}
