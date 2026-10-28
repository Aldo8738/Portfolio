import type { RefObject } from 'react';
import type { Box3, Object3D } from 'three';
import type { gsap as gsapApi } from 'gsap';

export type GuitarPhase = 'idle' | 'opening' | 'open' | 'closing';

export interface CameraActions {
  composeGuitar: (
    timeline: ReturnType<typeof gsapApi.timeline>,
  ) => { origin: { x: number; y: number }; restore: () => void } | undefined;
  focusDrawings: () => void;
  resetView: () => void;
  focusOn: (
    target: Box3 | Object3D,
    onSettled?: (completed: boolean) => void,
  ) => void;
}

export interface SceneMetrics {
  readyMs: number;
  modelParsedMs: number;
  calls: number;
  triangles: number;
  textures: number;
  dpr: number;
  renderer: string;
  quality: 'mobile' | 'standard' | 'low';
  modelDownloadMs: number | null;
  rendering: {
    toneMapping: number;
    exposure: number;
    outputColorSpace: string;
    shadows: boolean;
    shadowMapType: number;
  };
  targets: Record<string, { x: number; y: number }>;
}
export interface CanvasProps {
  guitarPhase: GuitarPhase;
  onCameraMotion: (moving: boolean) => void;
  onGuitarOpen: () => void;
  onMusicPause: () => void;
  photoId: string | null;
  onPhotoRequest: (id: string) => void;
  onPhotoSettled: (completed: boolean) => void;
  active: boolean;
  reducedMotion: boolean;
  cameraActions: RefObject<CameraActions | null>;
  sceneRevealed: boolean;
  onReady: (metrics: SceneMetrics) => void;
  onFailure: (message: string) => void;
  onProgress: (message: string) => void;
}
