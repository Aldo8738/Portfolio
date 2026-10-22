import { MathUtils, Spherical, Vector3 } from 'three';

export function createCameraEntrance(
  fit: { position: Vector3; target: Vector3 },
  points: readonly Vector3[],
  aspect: number,
  fov: number,
) {
  const end = new Spherical().setFromVector3(
    fit.position.clone().sub(fit.target),
  );
  const direction = new Vector3();
  const right = new Vector3();
  const up = new Vector3();
  const worldUp = new Vector3(0, 1, 0);
  const tanY = Math.tan(MathUtils.degToRad(fov / 2));
  const tanX = tanY * aspect;
  const theta = (progress: number) => end.theta + Math.PI * (1 - progress);
  const phi = (progress: number) =>
    end.phi - 0.04 * (1 - progress) - 0.12 * Math.sin(Math.PI * progress);
  function requiredRadius(progress: number) {
    direction.setFromSphericalCoords(1, phi(progress), theta(progress));
    right.crossVectors(worldUp, direction).normalize();
    up.crossVectors(direction, right);
    let radius = 0;
    for (const point of points) {
      const x = point.x - fit.target.x;
      const y = point.y - fit.target.y;
      const z = point.z - fit.target.z;
      radius = Math.max(
        radius,
        x * direction.x +
          y * direction.y +
          z * direction.z +
          Math.max(
            Math.abs(x * right.x + y * right.y + z * right.z) / tanX,
            Math.abs(x * up.x + y * up.y + z * up.z) / tanY,
          ),
      );
    }
    return radius * 1.06;
  }
  const startRadius = Math.max(end.radius, requiredRadius(0));
  let clearance = 0;
  // Fit the whole orbit once; each animated frame only evaluates a smooth arc.
  for (let step = 1; step < 32; step++) {
    const progress = step / 32;
    clearance = Math.max(
      clearance,
      (requiredRadius(progress) -
        MathUtils.lerp(startRadius, end.radius, progress)) /
        Math.sin(Math.PI * progress),
    );
  }
  return (progress: number, position: Vector3) => {
    if (progress >= 1) return position.copy(fit.position);
    return position
      .setFromSphericalCoords(
        MathUtils.lerp(startRadius, end.radius, progress) +
          clearance * Math.sin(Math.PI * progress),
        phi(progress),
        theta(progress),
      )
      .add(fit.target);
  };
}
