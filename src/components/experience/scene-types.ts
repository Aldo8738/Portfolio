import type { RefObject } from 'react';

export interface CameraActions {
  resetView: () => void;
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
  active: boolean;
  reducedMotion: boolean;
  cameraActions: RefObject<CameraActions | null>;
  sceneReady: boolean;
  onReady: (metrics: SceneMetrics) => void;
  onFailure: (message: string) => void;
  onProgress: (message: string) => void;
}
