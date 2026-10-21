export interface SceneMetrics {
  readyMs: number;
  modelParsedMs: number;
  calls: number;
  triangles: number;
  textures: number;
  dpr: number;
  renderer: string;
  quality: 'mobile' | 'standard';
  modelDownloadMs: number | null;
  targets: Record<string, { x: number; y: number }>;
}
export interface CanvasProps {
  active: boolean;
  reducedMotion: boolean;
  onReady: (metrics: SceneMetrics) => void;
  onFailure: (message: string) => void;
  onProgress: (message: string) => void;
}
