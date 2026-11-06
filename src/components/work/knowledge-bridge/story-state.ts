export function getStoryBeat(progress: number): 0 | 1 | 2 | 3 {
  if (progress < 0.25) return 0;
  if (progress < 0.5) return 1;
  if (progress < 0.8) return 2;
  return 3;
}

export function getFocusedStoryBeat(progress: number) {
  return progress < 0.625 ? 0 : getStoryBeat(0.25 + (progress - 0.625) * 2);
}
