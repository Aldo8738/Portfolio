import { MathUtils, Spherical, Vector3 } from 'three';

export function createCameraEntrance(
  fit: { position: Vector3; target: Vector3 },
  points: readonly Vector3[],
  aspect: number,
  fov: number,
  rearFit?: { position: Vector3; target: Vector3 },
): (progress: number, position: Vector3) => Vector3 {
  const end = new Spherical().setFromVector3(
    fit.position.clone().sub(fit.target),
  );
  const start = rearFit
    ? new Spherical().setFromVector3(
        createCameraEntrance(
          rearFit,
          points,
          aspect,
          fov,
        )(0, new Vector3()).sub(fit.target),
      )
    : new Spherical(end.radius, end.phi - 0.04, end.theta + Math.PI);
  start.theta =
    end.theta + MathUtils.euclideanModulo(start.theta - end.theta, Math.PI * 2);
  const direction = new Vector3();
  const right = new Vector3();
  const up = new Vector3();
  const worldUp = new Vector3(0, 1, 0);
  const tanY = Math.tan(MathUtils.degToRad(fov / 2));
  const tanX = tanY * aspect;
  const theta = (progress: number) =>
    MathUtils.lerp(start.theta, end.theta, progress);
  const phi = (progress: number) =>
    MathUtils.lerp(start.phi, end.phi, progress) -
    0.12 * Math.sin(Math.PI * progress);
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
  const startRadius = Math.max(
    rearFit ? start.radius : end.radius,
    requiredRadius(0),
  );
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

export function createCameraReset(
  position: Vector3,
  target: Vector3,
  fit: { position: Vector3; target: Vector3 },
) {
  const fromTarget = target.clone();
  const start = new Spherical().setFromVector3(position.clone().sub(target));
  const end = new Spherical().setFromVector3(
    fit.position.clone().sub(fit.target),
  );
  const turn =
    MathUtils.euclideanModulo(end.theta - start.theta + Math.PI, Math.PI * 2) -
    Math.PI;
  return (progress: number, nextPosition: Vector3, nextTarget: Vector3) => {
    if (progress >= 1) {
      nextPosition.copy(fit.position);
      nextTarget.copy(fit.target);
      return;
    }
    nextTarget.lerpVectors(fromTarget, fit.target, progress);
    nextPosition
      .setFromSphericalCoords(
        MathUtils.lerp(start.radius, end.radius, progress),
        MathUtils.lerp(start.phi, end.phi, progress),
        start.theta + turn * progress,
      )
      .add(nextTarget);
  };
}
