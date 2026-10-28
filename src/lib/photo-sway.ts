export interface PhotoSway {
  angle: number;
  velocity: number;
}

export const photoSway = {
  stiffness: 24,
  damping: 3.8,
  maxAngle: Math.PI / 22.5,
  maxVelocity: 0.9,
  pointerRadius: 110,
  pointerStrength: 12,
} as const;

export function stepPhotoSway(state: PhotoSway, delta: number) {
  const elapsed = Math.min(Math.max(delta, 0), 0.05);
  const steps = Math.max(1, Math.ceil(elapsed * 120));
  const dt = elapsed / steps;
  for (let i = 0; i < steps; i++) {
    state.velocity +=
      (-photoSway.stiffness * state.angle -
        photoSway.damping * state.velocity) *
      dt;
    state.angle += state.velocity * dt;
    if (Math.abs(state.angle) > photoSway.maxAngle) {
      state.angle = Math.sign(state.angle) * photoSway.maxAngle;
      if (state.angle * state.velocity > 0) state.velocity = 0;
    }
  }
  if (Math.abs(state.angle) < 0.0001 && Math.abs(state.velocity) < 0.0001) {
    state.angle = 0;
    state.velocity = 0;
  }
}
