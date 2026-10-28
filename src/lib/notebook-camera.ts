import { Box3, MathUtils, Vector3, type Object3D } from 'three';

export const notebookCamera = {
  approachSeconds: 1.2,
  elevation: MathUtils.degToRad(55),
  framingPadding: 1.35,
  minPolarAngle: MathUtils.degToRad(15),
} as const;

export function fitNotebookCamera(
  notebook: Object3D,
  aspect: number,
  fov: number,
) {
  const bounds = new Box3().setFromObject(notebook);
  const target = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const sin = Math.sin(notebookCamera.elevation);
  const cos = Math.cos(notebookCamera.elevation);
  const tanY = Math.tan(MathUtils.degToRad(fov / 2));
  const height = size.y * cos + size.z * sin;
  const depth = size.y * sin + size.z * cos;
  const distance =
    depth / 2 +
    (Math.max(size.x / (tanY * aspect), height / tanY) *
      notebookCamera.framingPadding) /
      2;
  // The open pages face upward; a front-facing photo pose would show their edges.
  return {
    target,
    position: target
      .clone()
      .add(new Vector3(0, sin * distance, cos * distance)),
  };
}
