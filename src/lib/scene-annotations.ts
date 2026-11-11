export const sceneAnnotations = [
  { id: 'work', node: 'HIT_WORK_CRT_SCREEN', x: 48, y: 12 },
  { id: 'photos', node: 'HIT_PHOTOS_POLAROID_2', x: 8, y: 8 },
  { id: 'drawings', node: 'HIT_DRAWINGS_SKETCHBOOK_0', x: 8, y: 8 },
  { id: 'guitar', node: 'HIT_MUSIC_AMP', x: 24, y: 0 },
] as const;

export type AnnotationId = (typeof sceneAnnotations)[number]['id'];
export type AnnotationElements = Record<AnnotationId, HTMLDivElement | null>;
export const annotationSize = { width: 96, height: 44 } as const;

export interface AnnotationRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function annotationRect(
  x: number,
  y: number,
  dx: number,
  dy: number,
): AnnotationRect {
  const left = x + dx - (dx < 0 ? annotationSize.width : 0);
  const top = y + dy - annotationSize.height / 2;
  return {
    left,
    top,
    right: left + annotationSize.width,
    bottom: top + annotationSize.height,
  };
}

export function annotationFits(
  rect: AnnotationRect,
  width: number,
  height: number,
  occupied: AnnotationRect[],
) {
  return (
    rect.left >= 20 &&
    rect.right <= width - 20 &&
    rect.top >= 116 &&
    rect.bottom <= height - 156 &&
    !occupied.some(
      (other) =>
        rect.left < other.right + 12 &&
        rect.right > other.left - 12 &&
        rect.top < other.bottom + 8 &&
        rect.bottom > other.top - 8,
    )
  );
}
