import type { RefObject } from 'react';
import type { Box3, Mesh } from 'three';

export interface CameraActions {
  resetView: () => void;
  focusOn: (
    target: Box3 | Mesh,
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
  onCameraMotion: (moving: boolean) => void;
  onSalsaPress: () => void;
  onMusicToggle: () => void;
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
