import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { Object3D } from 'three';
import { createSalsaAnimation } from '../../lib/salsa-animation';
import { parseTheme, requestTheme, selectTheme } from '../../lib/theme';

export function useSalsaInteraction(
  model: Object3D,
  enabled: boolean,
  reducedMotion: boolean,
) {
  const { scene, invalidate, gl } = useThree();
  const animation = useRef<ReturnType<typeof createSalsaAnimation> | null>(
    null,
  );
  useEffect(() => {
    const controller = createSalsaAnimation(
      model,
      scene,
      invalidate,
      selectTheme,
      (phase) => {
        gl.domElement.dataset.salsaPhase = phase;
      },
    );
    animation.current = controller;
    const finish = () => controller.cancel(true);
    window.addEventListener('pagehide', finish);
    return () => {
      window.removeEventListener('pagehide', finish);
      controller.cancel(true);
      controller.dispose();
      animation.current = null;
      delete gl.domElement.dataset.salsaPhase;
      delete gl.domElement.dataset.salsaMotion;
    };
  }, [model, scene, invalidate, gl]);
  useEffect(() => {
    gl.domElement.dataset.salsaMotion = reducedMotion ? 'reduced' : 'full';
    animation.current?.cancel(true);
    const request = (event: Event) => {
      if (!enabled || !(event instanceof CustomEvent)) return;
      event.preventDefault();
      animation.current?.play(parseTheme(event.detail), reducedMotion);
    };
    window.addEventListener('taqueria:theme-request', request);
    return () => window.removeEventListener('taqueria:theme-request', request);
  }, [enabled, reducedMotion, gl]);
  return {
    select: requestTheme,
    hover: (node: Object3D | null) =>
      animation.current?.hover(enabled ? node : null, reducedMotion),
  };
}
