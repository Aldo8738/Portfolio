import type { WebGLRenderer } from 'three';

const lowerCost = {
  shadowSize: 1024,
  practicalLights: 1,
  maxDpr: 1,
} as const;
const profiles = {
  standard: {
    name: 'standard',
    shadowSize: 1024,
    practicalLights: 3,
    maxDpr: 1.5,
  },
  mobile: { name: 'mobile', ...lowerCost },
  low: { name: 'low', ...lowerCost },
} as const;
export type SceneQuality = (typeof profiles)[keyof typeof profiles];

export function chooseSceneQuality(
  width: number,
  renderer: string,
  requested: string | null,
  coarsePointer = false,
): SceneQuality {
  if (requested === 'standard' || requested === 'low')
    return profiles[requested];
  if (width < 700 || coarsePointer) return profiles.mobile;
  return /swiftshader|llvmpipe|software|basic render/i.test(renderer)
    ? profiles.low
    : profiles.standard;
}

export function getRendererName(gl: WebGLRenderer) {
  const context = gl.getContext();
  const extension = context.getExtension('WEBGL_debug_renderer_info');
  return extension
    ? String(context.getParameter(extension.UNMASKED_RENDERER_WEBGL))
    : 'Unavailable';
}
