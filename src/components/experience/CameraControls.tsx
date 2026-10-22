import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ComponentRef,
} from 'react';
import { OrbitControls } from '@react-three/drei/core/OrbitControls.js';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, PerspectiveCamera, Vector3 } from 'three';
import { fitCamera } from '../../lib/camera';
import type { CanvasProps } from './scene-types';

interface Props extends Pick<
  CanvasProps,
  'active' | 'reducedMotion' | 'cameraActions' | 'sceneReady'
> {
  bounds: Box3;
  framingPoints: Vector3[];
}

const keyboardStep = Math.PI / 18;
const entranceDurationMs = 700;

export function CameraControls({
  bounds,
  framingPoints,
  active,
  reducedMotion,
  cameraActions,
  sceneReady,
}: Props) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, size, gl, invalidate } = useThree();
  const comparison = new URLSearchParams(location.search).has('compare');
  const initialView = useRef(true);
  const entrance = useRef<{
    started: number | null;
    from: Vector3;
    to: Vector3;
  } | null>(null);
  const cancelEntrance = useCallback(() => {
    entrance.current = null;
  }, []);
  const resetView = useCallback(() => {
    if (!(camera instanceof PerspectiveCamera) || !controls.current) return;
    const fit = fitCamera(
      bounds,
      size.width / size.height,
      camera.fov,
      framingPoints,
      comparison ? 'comparison' : 'hero',
    );
    camera.position.copy(fit.position);
    controls.current.target.copy(fit.target);
    const distance = fit.position.distanceTo(fit.target);
    controls.current.minDistance = distance * 0.35;
    controls.current.maxDistance = distance * 1.8;
    // Clear any pending damping before restoring the exact initial composition.
    const damping = controls.current.enableDamping;
    controls.current.enableDamping = false;
    controls.current.update();
    camera.position.copy(fit.position);
    controls.current.update();
    controls.current.enableDamping = damping;
    entrance.current = null;
    if (initialView.current && !reducedMotion && !comparison) {
      const from = fit.target
        .clone()
        .addScaledVector(fit.position.clone().sub(fit.target), 1.035);
      entrance.current = { started: null, from, to: fit.position.clone() };
      camera.position.copy(from);
      controls.current.update();
    }
    initialView.current = false;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    invalidate();
  }, [
    bounds,
    framingPoints,
    camera,
    size.width,
    size.height,
    invalidate,
    reducedMotion,
    comparison,
  ]);
  useImperativeHandle(cameraActions, () => ({ resetView }), [resetView]);
  useLayoutEffect(() => resetView(), [resetView]);
  useFrame(() => {
    const transition = entrance.current;
    if (!transition || !active || !sceneReady) return;
    const now = performance.now();
    transition.started ??= now;
    const progress = Math.min(
      (now - transition.started) / entranceDurationMs,
      1,
    );
    camera.position.lerpVectors(
      transition.from,
      transition.to,
      1 - (1 - progress) ** 3,
    );
    controls.current?.update();
    if (progress === 1) entrance.current = null;
    else invalidate();
  });

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute(
      'aria-label',
      'Explore the stand: left-drag or use arrow keys to rotate. Scroll or use plus and minus to zoom. Press Home to reset the view.',
    );
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const orbit = controls.current;
      if (!orbit?.enabled) return;
      cancelEntrance();
      switch (event.key) {
        case 'ArrowLeft':
          orbit.setAzimuthalAngle(orbit.getAzimuthalAngle() - keyboardStep);
          break;
        case 'ArrowRight':
          orbit.setAzimuthalAngle(orbit.getAzimuthalAngle() + keyboardStep);
          break;
        case 'ArrowUp':
          orbit.setPolarAngle(orbit.getPolarAngle() - keyboardStep);
          break;
        case 'ArrowDown':
          orbit.setPolarAngle(orbit.getPolarAngle() + keyboardStep);
          break;
        case 'Home':
          resetView();
          break;
        case '+':
        case '=':
          orbit.dollyIn();
          break;
        case '-':
        case '_':
          orbit.dollyOut();
          break;
        default:
          return;
      }
      event.preventDefault();
    };
    canvas.addEventListener('keydown', onKeyDown);
    return () => canvas.removeEventListener('keydown', onKeyDown);
  }, [gl, resetView, cancelEntrance]);

  return (
    <OrbitControls
      ref={controls}
      domElement={gl.domElement}
      enabled={active}
      onStart={cancelEntrance}
      enablePan={false}
      enableZoom
      zoomSpeed={0.7}
      enableDamping={!reducedMotion}
      dampingFactor={0.08}
      rotateSpeed={0.6}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2 - 0.05}
    />
  );
}
